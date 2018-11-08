import * as backendPlus from "backend-plus";
import { Client } from "pg-promise-strict";
import { AppOperativos } from "./app-operativos";

export * from "backend-plus";

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

export function hasTablePrefix(columnName: string) {
    return columnName.match(/^.+\..+$/);
}

export class BPTable {
    static async fetchAll(client:Client, tableName:string):Promise<{[key:string]:any}[]> {
        let query = 'SELECT * FROM ' + tableName;
        return (await client.query(query).fetchAll()).rows;
    }
}
export class RelacVarDB extends BPTable{
    operativo: string
    tabla_datos: string
    que_busco: string
    orden: number
    campo_datos: string
    campo_busco: string
    dato_fijo: string
    funcion_dato: string
}

export class RelacVar extends RelacVarDB{
    static async fetchAll(client:Client): Promise<RelacVar[]>{
        let relacVars = await super.fetchAll(client, 'relac_vars');
        return relacVars.map(rv => Object.setPrototypeOf(rv, RelacVar.prototype))
    }
}

export class RelacionesDB extends BPTable {
    operativo: string
    tabla_datos: string
    que_busco: string
    tabla_busqueda: string
    tipo: string
}

export class Relaciones extends RelacionesDB {

    static async fetchAll(client:Client): Promise<RelacVar[]>{
        let relaciones = await super.fetchAll(client, 'relaciones');
        return relaciones.map(rv => Object.setPrototypeOf(rv, Relaciones.prototype))
    }
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

export abstract class VariableDB {
    operativo          :string
    tabla_datos        :string
    variable           :string
    abr?                :string
    nombre?             :string
    tipovar            :string
    clase              :string
    es_pk?              :boolean
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
export class Variable extends VariableDB implements TipoVarDB {
    opciones?: VariableOpcion[]

    tipovar: string
    html_type?: string
    type_name?: backendPlus.PgKnownTypes
    validar?: string
    radio?: boolean

    // tdObj: TablaDatos

    getFieldObject(){
        if (this.tipovar == null) {
            throw new Error('la variable ' + this.variable + ' no tiene tipo');
        }
        return { name: this.variable, typeName: this.type_name};
    }

    esCalculada(){
        return this.clase == tiposTablaDato.calculada;
    }

    // async getTD(client: Client){
    //     return await TablaDatos.fetchOne(client, this.operativo, this.tabla_datos);
    // }

    static hasTablePrefix(variable: string){
        return variable.match(/^.+\..+$/);
    }

    static buildFromDBJSON(dbJson: Variable){
        return Object.assign(new Variable, dbJson);
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
        return <Variable[]>resultV.rows.map((v:Variable) => Variable.buildFromDBJSON(v));
    }
}

export interface TipoVarDB {
    tipovar: string
    html_type?: string
    type_name?: backendPlus.PgKnownTypes
    validar?: string
    radio?: boolean
}

export abstract class TablaDatosDB {
    operativo: string
    tabla_datos: string
    tipo: tiposTablaDato
    generada: Date
    pks: string[]
    que_busco: string
}

export class TablaDatos extends TablaDatosDB {

    init(op:string, td:string, pks:string[], que_busco:string, tipo:tiposTablaDato){
        this.operativo = op
        this.tabla_datos = td
        this.pks = pks
        this.que_busco = que_busco
        this.tipo = tipo
    }

    static buildFromDBJSON(dbJson: TablaDatosDB){
        return Object.assign(new TablaDatos, dbJson);
    }

    static async fetchAll(client: Client):Promise<TablaDatos[]>{
        let result = await client.query(`
            SELECT td.*, r.que_busco, to_jsonb(array_agg(v.variable order by v.orden)) pks
                FROM tabla_datos td 
                    LEFT JOIN relaciones r ON td.operativo=r.operativo AND td.tabla_datos=r.tabla_datos AND r.tipo <> 'opcional' 
                    LEFT JOIN variables v ON td.operativo=v.operativo AND td.tabla_datos=v.tabla_datos AND v.es_pk > 0
                GROUP BY td.operativo, td.tabla_datos, r.que_busco`
            , []).fetchAll();
        return <TablaDatos[]> result.rows.map((td:TablaDatos) => TablaDatos.buildFromDBJSON(td));
    }
    
    static async fetchOne(client:Client, op: string, td:string){
        //TODO sacar cosas comunes de la query afuera y parametrizar el where
        let result = await client.query(`
            SELECT td.*, r.que_busco, to_jsonb(array_agg(v.variable order by v.orden)) pks
                FROM tabla_datos td 
                    LEFT JOIN relaciones r ON td.operativo=r.operativo AND td.tabla_datos=r.tabla_datos AND r.tipo <>'opcional' 
                    LEFT JOIN variables v ON td.operativo=v.operativo AND td.tabla_datos=v.tabla_datos AND v.es_pk > 0
                WHERE td.operativo = $1 AND td.tabla_datos = $2
                GROUP BY td.operativo, td.tabla_datos, r.que_busco`
            , [op, td]).fetchOneRowIfExists();
        return TablaDatos.buildFromDBJSON(<TablaDatos> result.row);
    }
    
    // async getVars(client:Client){
    //     return (await Variable.fetchAll(client)).filter(v=>v.tabla_datos==this.tabla_datos && v.operativo == this.operativo);
    // }

    getPKCSV(){
        return this.pks.join(',');
    }

    getPrefixedQueBusco(){
        return AppOperativos.prefixTableName(this.que_busco, this.operativo);
    }

    getTableName(){
        return AppOperativos.prefixTableName(this.tabla_datos, this.operativo);
    }

    esCalculada(){
        return this.tipo == tiposTablaDato.calculada
    }
}

export class OperativoGenerator{
    // myTDs: {[key:string]: TablaDatos} = {}
    // myVars: {[key:string]: Variable} = {}
    myTDs: TablaDatos[]
    myVars: Variable[]

    static instanceObj: OperativoGenerator;

    constructor(public operativo?: string){
        OperativoGenerator.instanceObj = this;
    }

    async fetchDataFromDB(client:Client){
        this.myTDs = await TablaDatos.fetchAll(client);
        this.myVars = await Variable.fetchAll(client);

        if (this.operativo){
            this.myTDs = this.myTDs.filter(td=>td.operativo==this.operativo);
            this.myVars = this.myVars.filter(v=>v.operativo==this.operativo);
        }

        // OJO los TDs pueden repetirse por operativo y las vars se repiten por TD, entonces 
        // si se hacen objetos indexados tener cuidado de no eliminar repetidos
        // tds.forEach(td=> this.myTDs[td.tabla_datos]=td);
        // vars.forEach(v=> this.myTDs[v.tabla_datos].myVars.push(v));
    }

    getVars(td:TablaDatos){
        return this.myVars.filter(v => v.operativo == td.operativo && v.tabla_datos == td.tabla_datos);
        // return likeAr(this.myVars).filter(v=>v.tabla_datos==td.tabla_datos).array();
    }
 
    getTD(v:Variable){
        return this.myTDs.find(td => td.operativo == v.operativo && td.tabla_datos == v.tabla_datos);
    }

}

export class Operativo {
    constructor(public operativo: string, public nombre?: string){        
    }

    async getTDs(client:Client){
        return (await TablaDatos.fetchAll(client)).filter(td=>td.operativo==this.operativo);
    }

    async getVars(client:Client){
        return (await Variable.fetchAll(client)).filter(v=>v.operativo==this.operativo);
    }

    static async fetchAll(client:Client){
        return <Operativo[]>(await client.query('SELECT * FROM operativos').fetchAll()).rows;
    }
}