"use strict";

import * as likeAr from "like-ar";
import {TableContext,TableDefinition, Context, TableDefinitionFunction, Variable, TipoVar, TablaDatos, AppBackend, Request} from "./types-operativos";
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
import { ProceduresOperativos } from "./procedures-operativos";

export function emergeAppOperativos<T extends Constructor<AppBackend>>(Base:T){
    return class AppOperativos extends Base{
        getTableDefinition:typesOpe.TableDefinitionsGetters
        constructor(...args:any[]){
            super(...args);
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
            let nombreTablaDatos = tablaDatos.tabla_datos;
            // calcular fields
            // TODO: $2 es unidad de análisis porque para varcal la UA es el origen de la tabla calculada
            // y para datos-ext la UA es la tabla de datos, por eso la siguiente query funciona para ambos casos
            let query = `select *
                from variables left join tipovar using(tipovar)
                where operativo = $1 and ((tabla_datos = $2 and es_pk) or tabla_datos = $3)
                `;
            
            let resultV = await client.query(query, [tablaDatos.operativo, tablaDatos.unidad_analisis, tablaDatos.tabla_datos]
            ).fetchAll();
            if(resultV.rowCount==0){
                throw new Error('La tabla no tiene variables');
            }
            let variables: VariableWitType[] = <VariableWitType[]>resultV.rows;
            let tableDef: TableDefinition = {
                name: nombreTablaDatos,
                fields: variables.map(function (v: VariableWitType) {
                    if (v.tipovar == null) {
                        throw new Error('la variable ' + v.variable + ' no tiene tipo');
                    }
                    return { name: v.variable, typeName: v.type_name, editable: false};
                }),
                editable: true,
                primaryKey: variables.filter(v => v.es_pk).map(fieldDef => fieldDef.variable),
                sql: {
                    tableName: nombreTablaDatos,
                    isTable: true,
                    isReferable: true,
                    skipEnance: true
                },
            };
            return tableDef;
        }
        
        loadTableDef(tableDef: TableDefinition){
            return this.tableStructures[tableDef.name] = <TableDefinitionFunction> function (contexto: Context):TableDefinition {
                return contexto.be.tableDefAdapt(tableDef, contexto);
            };
        }
        
        async generateAndLoadTableDef(client: Client, tablaDatos:TablaDatos){
            return this.loadTableDef(await this.generateBaseTableDef(client, tablaDatos));
        }
        
        getProcedures(){
            var be = this;
            return super.getProcedures().then(function(procedures){
                return procedures.concat(
                    ProceduresOperativos.map(be.procedureDefCompleter, be)
                );
            });
        }    
        clientIncludes(req:typesOpe.Request, hideBEPlusInclusions:boolean){
            return super.clientIncludes(req, hideBEPlusInclusions).concat([
                {type:'js' , src:'client/operativos.js'},
            ])
        }
        getMenu():typesOpe.MenuDefinition{
            let menu:MenuDefinition = {menu:[
                {menuType:'table'  , name:'operativos' },
                {menuType:'table'  , name:'usuarios'   },
                {menuType:'table'  , name:'tabla_datos'},
                {menuType:'table'  , name:'unidad_analisis'   },
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