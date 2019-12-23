
import { PgKnownTypes, tiposTablaDato, Client } from "../types-operativos";
import { TipoVarDB } from "./tipo-var";
import { TablaDatos } from "./tabla-datos";

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

    tdObj!:TablaDatos

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
                ORDER BY tabla_datos, es_pk nulls last, orden nulls last, funcion_agregacion nulls last, tabla_agregada nulls last, variable`;
        let resultV = await client.query(query).fetchAll();
        const tds = await TablaDatos.fetchAll(client);
        const vars = (<Variable[]>resultV.rows).map(v => Variable.buildFromDBJSON(v));
        vars.forEach(v=>v.tdObj = <TablaDatos>tds.find(td=>td.tabla_datos==v.tabla_datos));
        return vars
    }

    static buildFromDBJSON(dbJson: Variable) {
        // Using assign instead of setPrototypeOf because we need to have initialized properties
        return Object.assign(new Variable, dbJson);
    }
}
