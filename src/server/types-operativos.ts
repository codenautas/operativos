import {TableDefinition} from "backend-plus";
import * as backendPlus from "backend-plus";

export * from "backend-plus";

export interface User extends backendPlus.User{
    usuario:string
    rol:string
}

export enum tiposTablaDato {
    calculada = 'calculada',
    externa = 'externa'
}

export type TableDefinitionsGetters = {
    [key:string]: (context:backendPlus.TableContext) => TableDefinition
}

export type VariableOpcion = {
    operativo          :string
    tabla_datos        :string
    variable           :string
    opcion             :number
    nombre             :string
    expresion_condicion:string
    expresion_valor    :string
    orden              :number
}
export type Variable = {
    operativo          :string
    tabla_datos        :string
    variable           :string
    abr                :string
    nombre             :string
    tipovar            :string
    unidad_analisis    :string
    clase              :string
    es_pk              :boolean
    es_nombre_unico    :boolean
    activa             :boolean
    expresion          :string
    cascada            :string
    nsnc_atipico       :number
    cerrada            :boolean
    funcion_agregacion:string
    tabla_agregada    :string
    grupo             :string
    orden : number
}
export interface UnidadDeAnalisis {
    operativo : string
    unidad_analisis : string
    nombre : string
    pk_agregada : string
    padre : string
    orden : number
    principal : boolean
}
export interface TipoVar {
    tipovar: string
    html_type: string
    type_name: backendPlus.PgKnownTypes
    validar: string
    radio: boolean
}
export interface TablaDatos {
    operativo: string
    tabla_datos: string
    tipo: tiposTablaDato
    unidad_analisis: string
}
export interface Operativo {
    operativo: string
    nombre: string
}