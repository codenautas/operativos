"use strict";
import { defConfig } from "./def-config";
import { clasevar } from './table-clasevar';
import { operativos } from './table-operativos';
import { parametros } from './table-parametros';
import { relaciones } from "./table-relaciones";
import { rel_vars } from "./table-rel_vars";
import { tabla_datos } from "./table-tabla_datos";
import { tipovar } from './table-tipovar';
import { usuarios } from './table-usuarios';
import { variables } from "./table-variables";
import { variables_opciones } from "./table-variables_opciones";
import { AppBackend, Context, Request, TableDefinition, TableDefinitionFunction, tiposTablaDato, OperativoGenerator, Client, Constructor, MenuDefinition, DumpOptions } from "./types-operativos";
import { TablaDatos } from "model/tabla-datos";
import { OptsClientPage } from "backend-plus";
import { no_numerica } from "./fun-no_numerica";
// var { no_numerica } = require('./fun-no_numerica')

// re-export my file of types for external modules
export * from "./types-operativos";

export function emergeAppOperativos<T extends Constructor<AppBackend>>(Base:T){
    return class AppOperativos extends Base{
        tablasDatos: TablaDatos[] = [];
        
        constructor(...args:any[]){
            super(args);
        }
        configStaticConfig(){
            super.configStaticConfig();
            this.setStaticConfig(defConfig);
        }
        /*private*/ async cargarGenerados(client: Client) {
            let operativoGenerator = new OperativoGenerator(client);
            await operativoGenerator.fetchDataFromDB();
            operativoGenerator.myTDs.filter(td=>td.generada).forEach(td => this.generateAndLoadTableDef(td))
            return "Se cargaron las tablas datos para visualizarlas mediante /menu?w=table&table=NOMBRE_DE_TABLA"
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
                throw new Error('La tabla ' + tablaDatos.tabla_datos + ' no tiene variables activas');
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
            if (tablaDatos.tipo == tiposTablaDato.interna){
                tableDef.allow = {...tableDef.allow, insert: true, update: true}
            }
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

        clientIncludes(req:Request, hideBEPlusInclusions:OptsClientPage){
            return super.clientIncludes(req, hideBEPlusInclusions).concat([
                {type:'js', module: 'operativos', modPath: '../client', file: 'operativos.js', path: 'client_modules'}
            ]);
        }

        getMenu(): MenuDefinition {
            let menu: MenuDefinition = {
                menu: [
                    {
                        menuType: 'menu', name: 'operativos', menuContent: [
                            { menuType: 'table', name: 'usuarios' },
                            { menuType: 'table', name: 'operativos' },
                            { menuType: 'table', name: 'tabla_datos' },
                            { menuType: 'table', name: 'variables' },
                            { menuType: 'table', name: 'variables_opciones' },
                            { menuType: 'table', name: 'relaciones' },
                            { menuType: 'table', name: 'rel_vars' },
                        ]
                    }]
            }
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
                rel_vars
            }
        }
        async checkDatabaseStructure(client:Client){
            var be=this;
            await super.checkDatabaseStructure(client);
            var schema=be.config.db.schema;
            var tipo=((await client.informationSchema.column(schema, 'variables_opciones', 'opcion'))||{}).data_type;
            if(tipo!='text'){
                throw new Error(`La columna opcion es de tipo "${tipo}" y debe ser "text"`);
            }
            if(!(await client.informationSchema.column(schema, 'variables_opciones', 'no_numerica'))){
                throw new Error(`Falta la columna variable_opciones.no_numerica`);
            }
            if(!(await client.informationSchema.column(schema, 'tabla_datos', 'table_name'))){
                throw new Error(`Falta la columna construida tabla_datos.table_name`);
            }
        }
        async getDbFunctions(opts:DumpOptions){
            return [
                ...await super.getDbFunctions(opts),
                no_numerica
            ]
        }
    }
}

export var AppOperativos = emergeAppOperativos(AppBackend);
export type AppOperativosType = InstanceType<typeof AppOperativos>;