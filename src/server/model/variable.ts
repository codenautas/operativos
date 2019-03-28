
import { PgKnownTypes } from "backend-plus";
import { Client } from "pg-promise-strict";
import { tiposTablaDato } from "types-operativos";
import { TipoVarDB } from "./tipo-var";

export interface VariableDB {
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    operativo          :string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    tabla_datos        :string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    variable           :string
    abr?                :string
    nombre?             :string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    tipovar            :string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    clase              :string
    es_pk?              :number
    es_nombre_unico?    :boolean
    activa?             :boolean
    filtro?             :string
    expresion?          :string
    cascada?            :string
    nsnc_atipico?       :number
    cerrada?            :boolean
    funcion_agregacion? :string
    tabla_agregada?     :string
    grupo?              :string
    orden? : number
}
export class Variable implements VariableDB, TipoVarDB {
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    operativo          :string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    tabla_datos        :string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    variable           :string
    abr?                :string
    nombre?             :string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    tipovar            :string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    clase              :string
    es_pk?              :number
    es_nombre_unico?    :boolean
    activa?             :boolean
    filtro?             :string
    expresion?          :string
    cascada?            :string
    nsnc_atipico?       :number
    cerrada?            :boolean
    funcion_agregacion? :string
    tabla_agregada?     :string
    grupo?              :string
    orden? : number
    
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    tipovar: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    html_type: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    type_name: PgKnownTypes
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    validar: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    radio: boolean

    esCalculada(){
        return this.clase == tiposTablaDato.calculada;
    }

    getFieldObject(){
        if (this.tipovar == null) {
            throw new Error('la variable ' + this.variable + ' no tiene tipo');
        }
        return { name: this.variable, typeName: this.type_name};
    }

    static async fetchAll(client:Client){
        let query = `
            SELECT v.*, tv.*, (SELECT jsonb_agg(to_jsonb(vo.*) order by vo.orden, vo.opcion) 
                                FROM variables_opciones vo 
                                WHERE vo.operativo = v.operativo and vo.tabla_datos = v.tabla_datos and vo.variable = v.variable) as opciones
                FROM variables v LEFT JOIN tipovar tv USING(tipovar)
                WHERE v.activa
                ORDER BY es_pk desc, orden, variable`;
        let resultV = await client.query(query).fetchAll();
        return (<Variable[]>resultV.rows).map(v => Variable.buildFromDBJSON(v));
    }
    static buildFromDBJSON(dbJson: Variable) {
        return Object.assign(new Variable, dbJson);
    }
}
