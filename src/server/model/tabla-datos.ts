import { tiposTablaDato } from "../types-operativos";
import { Client, quoteIdent } from "pg-promise-strict";
import { AppOperativos } from "../app-operativos";

export abstract class TablaDatosDB {
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    operativo: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    tabla_datos: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    tipo: tiposTablaDato
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    generada: Date
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    pks: string[]
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
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
            SELECT td.*, r.que_busco, to_jsonb(array_agg(v.variable order by v.es_pk)) pks
                FROM tabla_datos td 
                    LEFT JOIN relaciones r ON td.operativo=r.operativo AND td.tabla_datos=r.tabla_datos AND r.tipo <> 'opcional' 
                    LEFT JOIN variables v ON td.operativo=v.operativo AND td.tabla_datos=v.tabla_datos AND v.es_pk > 0
                GROUP BY td.operativo, td.tabla_datos, r.que_busco
                ORDER BY td.operativo, td.tabla_datos, r.que_busco`
            , []).fetchAll();
        return (<TablaDatos[]>result.rows).map(td => TablaDatos.buildFromDBJSON(td));
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
            , [op, td]).fetchUniqueRow();
        return TablaDatos.buildFromDBJSON(<TablaDatos> result.row);
    }
    
    // async getVars(client:Client){
    //     return (await Variable.fetchAll(client)).filter(v=>v.tabla_datos==this.tabla_datos && v.operativo == this.operativo);
    // }

    getQuotedPKsCSV(){
        return this.pks.map(pk=>quoteIdent(pk)).join(',');
    }

    getPKsWitAlias(){
        return this.pks.map(pk=>this.getTableName()+'.'+pk)
    }

    getPrefixedQueBusco(){
        return AppOperativos.prefixTableName(this.que_busco, this.operativo);
    }

    getTableName(){
        return this.esInterna()? this.tabla_datos: this.getPrefixedTablaDatos()
    }

    private getPrefixedTablaDatos(): string {
        return AppOperativos.prefixTableName(this.tabla_datos, this.operativo);
    }
    
    // TODO: ver los tipos any o void que dejamos desperdigados
    esInterna(): boolean {
        return this.tipo == tiposTablaDato.interna
    }
    
    esCalculada():boolean{
        return this.tipo == tiposTablaDato.calculada
    }
}