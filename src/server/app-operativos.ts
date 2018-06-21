"use strict";

import * as likeAr from "like-ar";
import {TableContext, AppBackend} from "./types-operativos";
import * as typesOpe from "./types-operativos";

export * from "./types-operativos";

type MenuInfoMapa = {
    menuType:'mapa'
} & typesOpe.MenuInfoMinimo;

type MenuInfo = MenuInfoMapa | typesOpe.MenuInfo;
type MenuDefinition = {menu:MenuInfo[]}

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

export function emergeAppOperativos<T extends Constructor<AppBackend>>(Base:T){
    return class AppOperativos extends Base{
        getTableDefinition:typesOpe.TableDefinitionsGetters
        constructor(...args:any[]){
            super(...args);
        }
        getProcedures(){
            var be = this;
            return super.getProcedures().then(function(procedures){
                return procedures.concat(
                    require('./procedures-operativos.js').map(be.procedureDefCompleter, be)
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
export type AppOperativosType = typeof AppOperativos;