/// <reference types="backend-plus" />
import { TableDefinition } from "backend-plus";
import * as backendPlus from "backend-plus";
export declare type TableDefinition = TableDefinition;
export interface TableContext extends backendPlus.TableContext {
    puede: object;
    superuser?: true;
    forDump?: boolean;
    user: {
        usuario: string;
        rol: string;
    };
}
export declare type TableDefinitionsGetters = {
    [key: string]: (context: TableContext) => TableDefinition;
};
export declare type VariablesOpciones = {
    operativo: string;
    variable: string;
    opcion: number;
    nombre: string;
    expresion_condicion: string;
    expresion_valor: string;
    orden: number;
};
export declare type Variables = {
    operativo: string;
    origen: string;
    variable: string;
    abr: string;
    nombre: string;
    tipovar: string;
    activa: boolean;
    expresion: string;
    clase: string;
    cascada: string;
    nsnc_atipico: number;
    cerrada: boolean;
    funcion_agregacion: string;
    tabla_agregada: string;
};
