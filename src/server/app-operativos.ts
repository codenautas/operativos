"use strict";

import * as likeAr from "like-ar";
import {TableContext,TableDefinition, Context, TableDefinitionFunction, Variable, TipoVar, TablaDatos, AppBackend, Request, tiposTablaDato, ClientModuleDefinition} from "./types-operativos";
import * as typesOpe from "./types-operativos";

export * from "./types-operativos";

type MenuInfoMapa = {
    menuType:'mapa'
} & typesOpe.MenuInfoMinimo;

type MenuInfo = MenuInfoMapa | typesOpe.MenuInfo;
type MenuDefinition = {menu:MenuInfo[]}

type VariableWitType = (Variable & TipoVar);

export type Constructor<T> = new(...args: any[]) => T;

import {parametros}      from './table-parametros'
import {usuarios}        from './table-usuarios'
import {operativos}      from './table-operativos'
import {clasevar}        from './table-clasevar'
import {tipovar}         from './table-tipovar'
import {tabla_datos}     from "./table-tabla_datos";
import {unidad_analisis} from "./table-unidad_analisis";
import {variables}       from "./table-variables";
import {variables_opciones} from "./table-variables_opciones";
import { Client } from "pg-promise-strict";
import { procedures } from "./procedures-operativos";

export function emergeAppOperativos<T extends Constructor<AppBackend>>(Base:T){
    return class AppOperativos extends Base{
        getTableDefinition:typesOpe.TableDefinitionsGetters
        allProcedures: typesOpe.ProcedureDef[] = [];
        allClientFileNames: ClientModuleDefinition[] = [];
        myProcedures: typesOpe.ProcedureDef[] = procedures;
        myClientFileName: string = 'operativos';
        
        constructor(...args:any[]){
            super(args);
            this.initialize();
        }

        initialize(): void {
            this.allProcedures = this.allProcedures.concat(this.myProcedures);
            // TODO: ahora se está usando myClientFileName para el attr module y file, refactorizar.
            // TODO: el clientIncludes de BEPlus está diseñado para archivos que expone un módulo en la rama principal (donde está el main del módulo),
            // por eso hubo que poner '../client' en modPath
            this.allClientFileNames.push({type:'js', module: this.myClientFileName, modPath: '../client', file: this.myClientFileName + '.js', path: 'client_modules'})
        }

        /*private*/ async cargarGenerados(client: Client) {
            let resultTD = await client.query(`
            select * from tabla_datos 
            where EXISTS (
                SELECT 1
                FROM information_schema.tables 
                WHERE table_name = tabla_datos
                );
                `).fetchAll();
            return await Promise.all(resultTD.rows.map((tablaDatosRow: TablaDatos) => this.generateAndLoadTableDef(client, tablaDatosRow)))
                .then(() => "Se cargaron las tablas datos para visualizarlas mediante /menu?w=table&table=grupo_personas");
        }

        async postConfig(){
            await super.postConfig();
            var be=this;
            await be.inTransaction({} as Request, async function(client:Client){
                await be.cargarGenerados(client);
            });
        }
        async generateBaseTableDef(client: Client, tablaDatos:TablaDatos){
            let nombreTabla = tablaDatos.tabla_datos;
            let resultV;

            // calcular fields
            // para el caso de las tablas externas con $3 alcanza para obtener armar los fields incluidas las pks,
            // pero para las calculadas tenemos que agregarle (or) las pks de la tabla externa
            // TODO: en el futuro cuando se generen una tabla calculada hay que agregar automaticamente en la tabla
            // variables los registros correspondientes a las pks, con eso se simplificaría la siguiente consulta
            if (tablaDatos.tipo == tiposTablaDato.calculada){
                let query = `select *
                    from variables left join tipovar using(tipovar)
                    where operativo = $1 and ((tabla_datos = $2) or (tabla_datos = $3 and es_pk))
                    order by es_pk desc nulls last, orden, variable
                    `;            
                resultV = await client.query(query, [tablaDatos.operativo, nombreTabla, tablaDatos.unidad_analisis]
                ).fetchAll();
            } else {
                let query = `select *
                    from variables left join tipovar using(tipovar)
                    where operativo = $1 and tabla_datos = $2
                    order by es_pk desc nulls last, orden, variable
                    `;            
                resultV = await client.query(query, [tablaDatos.operativo, nombreTabla]
                ).fetchAll();
            }

            if(resultV.rowCount==0){
                throw new Error('La tabla no tiene variables');
            }
            let variables: VariableWitType[] = <VariableWitType[]>resultV.rows;
            let tableDef: TableDefinition = {
                name: nombreTabla,
                fields: variables.map(function (v: VariableWitType) {
                    if (v.tipovar == null) {
                        throw new Error('la variable ' + v.variable + ' no tiene tipo');
                    }
                    return { name: v.variable, typeName: v.type_name};
                }),
                allow:{export: true, select: true},
                primaryKey: variables.filter(v => v.es_pk).map(fieldDef => fieldDef.variable),
                sql: {
                    tableName: nombreTabla,
                    isTable: true,
                    skipEnance: false
                },
            };
            return tableDef;
        }
        
        getTableDefFunction(tableDef: TableDefinition){
            return <TableDefinitionFunction> function (contexto: Context):TableDefinition {
                return contexto.be.tableDefAdapt(tableDef, contexto);
            };
        }

        loadTableDef(tableDef: TableDefinition){
            return this.tableStructures[tableDef.name] = this.getTableDefFunction(tableDef);
        }
        
        async generateAndLoadTableDef(client: Client, tablaDatos:TablaDatos){
            return this.loadTableDef(await this.generateBaseTableDef(client, tablaDatos));
        }
        
        getProcedures(){
            var be = this;
            return super.getProcedures().then(function(procedures){
                return procedures.concat(
                    be.allProcedures.map(be.procedureDefCompleter, be)
                );
            });
        }
        clientIncludes(req:typesOpe.Request, hideBEPlusInclusions:boolean){
            return super.clientIncludes(req, hideBEPlusInclusions).concat(this.allClientFileNames);
        }

        getMenu():typesOpe.MenuDefinition{
            let menu:MenuDefinition = {menu:[
                {menuType:'table'  , name:'usuarios'   },
                {menuType:'table'  , name:'operativos' },
                {menuType:'table'  , name:'unidad_analisis'   },
                {menuType:'table'  , name:'tabla_datos'},
                {menuType:'table'  , name:'variables'  },
            ]}
            return menu;
        }
        prepareGetTables(){
            this.getTableDefinition={
                parametros,    
                usuarios  ,    
                operativos,            
                clasevar  ,    
                tipovar   ,
                tabla_datos,
                unidad_analisis,
                variables,
                variables_opciones
            }
        }
        appendToTableDefinition(tableName:string, appenderFunction:(tableDef:typesOpe.TableDefinition, context?:TableContext)=>void):void{
            var previousDefiniterFunction=this.getTableDefinition[tableName]
            if(previousDefiniterFunction==null){
                throw new Error(tableName+" does not exists in getTableDefinition")
            }
            this.getTableDefinition[tableName]=function(context:TableContext){
                var defTable=previousDefiniterFunction(context);
                defTable.fields          =defTable.fields          ||[];
                defTable.foreignKeys     =defTable.foreignKeys     ||[];
                defTable.softForeignKeys =defTable.softForeignKeys ||[];
                defTable.detailTables    =defTable.detailTables    ||[];
                defTable.constraints     =defTable.constraints     ||[];
                defTable.sql             =defTable.sql             ||{};
                appenderFunction(defTable, context)
                return defTable;
            }
        }
        getTables(){
            var be=this;
            this.prepareGetTables();
            return super.getTables().concat(
                likeAr(this.getTableDefinition).map(function(tableDef, tableName){
                    return {name:tableName, tableGenerator:function(context:TableContext){
                        return be.tableDefAdapt(tableDef(context), context);
                    }};
                }).array()
            );
        }
    }
}

export var AppOperativos = emergeAppOperativos(AppBackend);
export type AppOperativosType = InstanceType<typeof AppOperativos>;