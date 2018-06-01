"use strict";

import {AppBackend,Request,TableDefinition} from "backend-plus";
import * as backendPlus from "backend-plus";
import * as pgPromise from "pg-promise-strict";
import * as express from "express";
import * as likeAr from "like-ar";
import {TableDefinitionsGetters,TableContext} from "./types-operativos";
export {TableContext} from "./types-operativos";

type MenuInfoMapa = {
    menuType:'mapa'
} & backendPlus.MenuInfoMinimo;

type MenuInfo = MenuInfoMapa | backendPlus.MenuInfo;
type MenuDefinition = {menu:MenuInfo[]}

export type Constructor<T> = new(...args: any[]) => T;

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
        getTableDefinition:TableDefinitionsGetters
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
        clientIncludes(req:Request, hideBEPlusInclusions:boolean){
            return super.clientIncludes(req, hideBEPlusInclusions).concat([
                {type:'js' , src:'client/operativos.js'},
            ])
        }
        getMenu():backendPlus.MenuDefinition{
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
        appendToTableDefinition(tableName:string, appenderFunction:(tableDef:TableDefinition, context?:TableContext)=>void):void{
            var previousDefiniterFunction=this.getTableDefinition[tableName]
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