"use strict";

import {AppBackend,Request} from "backend-plus";
import * as backendPlus from "backend-plus";
import * as pgPromise from "pg-promise-strict";
import * as express from "express";
import * as likeAr from "like-ar";
import {TableDefinitionsGetters,TableContext} from "./types-bas-ope";
// import "./types-bas-ope";

type MenuInfoMapa = {
    menuType:'mapa'
} & backendPlus.MenuInfoBase;

type MenuInfo = backendPlus.MenuInfo | MenuInfoMapa;
type MenuDefinition = {menu:MenuInfo[]}
 // interface MenuDefinition MenuInfoMapa

export type Constructor<T> = new(...args: any[]) => T;

import * as usuarios   from './table-usuarios'
import * as operativos from './table-operativos'
import * as clasevar   from './table-clasevar'
import * as tipovar    from './table-tipovar'

export function emergeAppBasOpe<T extends Constructor<AppBackend>>(Base:T){
    return class AppBasOpe extends Base{
        getTableDefinition:TableDefinitionsGetters
        constructor(...args:any[]){
            super(...args);
        }
        getProcedures(){
            var be = this;
            return super.getProcedures().then(function(procedures){
                return procedures.concat(
                    require('./procedures-bas-ope.js').map(be.procedureDefCompleter, be)
                );
            });
        }    
        clientIncludes(req:Request, hideBEPlusInclusions:boolean){
            return super.clientIncludes(req, hideBEPlusInclusions).concat([
                {type:'js' , src:'client/bas-ope.js'},
            ])
        }
        getMenu():{menu:backendPlus.MenuInfoBase[]}{
            let menu:MenuDefinition = {menu:[
                {menuType:'table'  , name:'operativos' },
                {menuType:'table'  , name:'usuarios'   },
            ]}
            return menu;
        }
        prepareGetTables(){
            this.getTableDefinition={
                usuarios  ,    
                operativos,            
                clasevar  ,    
                tipovar   ,
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