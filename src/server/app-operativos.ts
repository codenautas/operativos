"use strict";

import * as bg from "best-globals";
import * as likeAr from "like-ar";
import { Client } from "pg-promise-strict";
import { procedures } from "./procedures-operativos";
import { clasevar } from './table-clasevar';
import { operativos } from './table-operativos';
import { parametros } from './table-parametros';
import { relaciones } from "./table-relaciones";
import { relac_vars } from "./table-relac_vars";
import { tabla_datos } from "./table-tabla_datos";
import { tipovar } from './table-tipovar';
import { usuarios } from './table-usuarios';
import { variables } from "./table-variables";
import { variables_opciones } from "./table-variables_opciones";
import * as typesOpe from "./types-operativos";
import { AppBackend, ClientModuleDefinition, Context, OperativoGenerator, Request, TablaDatos, TableContext, TableDefinition, TableDefinitionFunction } from "./types-operativos";

// re-export my file of types for external modules
export * from "./types-operativos";

type MenuInfoMapa = {
    menuType:'mapa'
} & typesOpe.MenuInfoMinimo;

type MenuInfo = MenuInfoMapa | typesOpe.MenuInfo;
type MenuDefinition = {menu:MenuInfo[]}

export type Constructor<T> = new(...args: any[]) => T;


export function emergeAppOperativos<T extends Constructor<AppBackend>>(Base:T){
    return class AppOperativos extends Base{
        allProcedures: typesOpe.ProcedureDef[] = [];
        allClientFileNames: ClientModuleDefinition[] = [];
        myProcedures: typesOpe.ProcedureDef[] = procedures;
        myClientFileName: string = 'operativos';
        tablasDatos: TablaDatos[];
        
        constructor(...args:any[]){
            super(args);
            this.initialize();
        }

        initialize(): void {
            this.allProcedures = this.allProcedures.concat(this.myProcedures);
            // TODO: ahora se está usando myClientFileName para el attr module y file, refactorizar.
            // TODO: el clientIncludes de BEPlus está diseñado para archivos que expone un módulo en la rama principal (donde está el main del módulo),
            // por eso hubo que poner '../client' en modPath
            // Esto NO FUNCIONA cuando se quiere leventar una app layer sin procesamiento:
            // datos-ext, varcal, operativos y exportador son capas de aplicación que por si solas y como está diseñado deberían poder levantarse
            // como apps (npm start en varcal por ej)
            // pero la siguiente linea hace que una app quiera agregarse a si misma como dependencia
            // Que hace la siguiente linea: agrega los client de cada layer al client includes
            this.allClientFileNames.push({type:'js', module: this.myClientFileName, modPath: '../client', file: this.myClientFileName + '.js', path: 'client_modules'})
        }

        /*private*/ async cargarGenerados(client: Client) {
            let operativoGenerator = new OperativoGenerator(this);
            await operativoGenerator.fetchDataFromDB(client);
            operativoGenerator.myTDs.filter(td=>td.generada).forEach(td => this.generateAndLoadTableDef(td))
            return "Se cargaron las tablas datos para visualizarlas mediante /menu?w=table&table=grupo_personas"
        }

        //TODO: pasar a BEPlus
        getTodayForDB(){
            return bg.date.today().toYmd();
        }

        static prefixTableName(tableName: string, prefix: string){
            return prefix.toLowerCase() + '_' + tableName;
        }

        async postConfig(){
            await super.postConfig();
            var be=this;
            await be.inTransaction({} as Request, async function(client:Client){
                await be.cargarGenerados(client);
            });
        }
        
        generateBaseTableDef(tablaDatos:TablaDatos){
            let variables = OperativoGenerator.instanceObj.getVars(tablaDatos);
            let tableName = tablaDatos.getTableName();
            if(variables.length==0){
                console.error('La tabla ' + tablaDatos.tabla_datos + ' no tiene variables');
            }
            let tableDef: TableDefinition = {
                name: tableName,
                title: tablaDatos.tabla_datos,
                fields: variables.map(v => v.getFieldObject()),
                allow:{export: true, select: true},
                primaryKey: tablaDatos.pks,
                sql: {
                    tableName: tableName,
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
        
        generateAndLoadTableDef(tablaDatos:TablaDatos){
            return this.loadTableDef(this.generateBaseTableDef(tablaDatos));
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
                {menuType:'table'  , name:'tabla_datos'},
                {menuType:'table'  , name:'variables'  },
                {menuType:'table'  , name:'variables_opciones'  },
                {menuType:'table'  , name:'relaciones'},
                {menuType:'table'  , name:'relac_vars'},
            ]}
            return menu;
        }
        prepareGetTables(){
            super.prepareGetTables();
            this.getTableDefinition={
                ... this.getTableDefinition,
                parametros,    
                usuarios  ,    
                operativos,            
                clasevar  ,    
                tipovar   ,
                tabla_datos,
                variables,
                variables_opciones,
                relaciones,
                relac_vars
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