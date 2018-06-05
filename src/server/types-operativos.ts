import {TableDefinition} from "backend-plus";
import * as backendPlus from "backend-plus";

export {TableDefinition} from "backend-plus";

export interface TableContext extends backendPlus.TableContext{
    puede:object
    superuser?:true
    forDump?:boolean
    user:{
        usuario:string
        rol:string
    }
}

export type TableDefinitionsGetters = {
    [key:string]: (context:TableContext) => TableDefinition
}

export type VariablesOpciones = {
    operativo          :string
    tabla_datos        :string
    variable           :string
    opcion             :number
    nombre             :string
    expresion_condicion:string
    expresion_valor    :string
    orden              :number
}
export type Variables = {
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
}