import * as backendPlus from "backend-plus";

// exposes APIs from this package
export * from "backend-plus";
export * from "pg-promise-strict";
export * from "./model/base-db-table";
export * from "./model/operativo";
export * from "./model/relacion";
export * from "./model/relacvar";
export * from "./model/tabla-datos";
export * from "./model/tipo-var";
export * from "./model/variable";
export * from "./model/variable-opcion";
export * from "./operativo-generator";

type MenuInfoMapa = {
    menuType:'mapa'
} & backendPlus.MenuInfoMinimo;

export type MenuInfo = MenuInfoMapa | backendPlus.MenuInfo;

export interface User extends backendPlus.User{
    usuario:string
    rol:string
}

export enum tiposTablaDato {
    calculada = 'calculada',
    externa = 'externa',
    interna = 'interna'
}

export let tiposTablaDatoArray: string[] = [];
for (let tipoTD in tiposTablaDato) {
    tiposTablaDatoArray.push(tipoTD)
}

export function hasAlias(text: string) {
    return text.match(/^.+\..+$/);
}
