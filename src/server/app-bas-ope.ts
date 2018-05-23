"use strict";

import {AppBackend,Request} from "backend-plus";
import * as backendPlus from "backend-plus";
import * as pgPromise from "pg-promise-strict";
import * as express from "express";

interface Context extends backendPlus.Context{
    puede:object
    superuser?:true
}

type MenuInfoMapa = {
    menuType:'mapa'
} & backendPlus.MenuInfoBase;

type MenuInfo = backendPlus.MenuInfo | MenuInfoMapa;
type MenuDefinition = {menu:MenuInfo[]}

 // interface MenuDefinition MenuInfoMapa

export type Constructor<T> = new(...args: any[]) => T;

export function emergeAppBasOpe<T extends Constructor<AppBackend>>(Base:T){
 
    return class AppBasOpe extends Base{
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
        getTables(){
            return super.getTables().concat([
                'usuarios',
                'operativos',
                'tipovar',
                'clasevar',
            ]);
        }
    }
}