import { tiposTablaDato, Client, quoteIdent } from "../types-operativos";
import { AppOperativos } from "../app-operativos";

export abstract class TablaDatosDB {
    operativo!: string
    tabla_datos!: string
    tipo!: tiposTablaDato
    generada!: Date
}

export class TablaDatos extends TablaDatosDB {
    td_base!: string
    pks!: string[]
    
    static buildFromDBJSON(dbJson: TablaDatosDB){
        return  Object.setPrototypeOf(dbJson, TablaDatos.prototype);
    }

    //TODO re-think because it's complex
    // OJO que el td_base solo se setea para las TDs calculadas (por la condición del ON (misma_pk is TRUE))
    static selectFrom = 
        `SELECT td.*, r.tabla_datos as td_base, 
          (SELECT jsonb_agg(v.variable order by v.es_pk) 
            FROM variables v 
            WHERE td.operativo=v.operativo AND td.tabla_datos=v.tabla_datos AND v.es_pk > 0
          ) as pks
        FROM tabla_datos td 
          LEFT JOIN relaciones r ON td.operativo=r.operativo AND td.tabla_datos=r.tiene AND r.misma_pk is TRUE`;
    static groupBy = ` GROUP BY td.operativo, td.tabla_datos, r.tabla_datos`;

    static async fetchAll(client: Client):Promise<TablaDatos[]>{
        let result = await client.query(TablaDatos.selectFrom+TablaDatos.groupBy+` ORDER BY td.operativo, td.tabla_datos, r.tabla_datos`, []).fetchAll();
        return (<TablaDatos[]>result.rows).map(td => TablaDatos.buildFromDBJSON(td));
    }
    
    static async fetchOne(client:Client, op: string, td:string){
        let result = await client.query(TablaDatos.selectFrom+' WHERE td.operativo = $1 AND td.tabla_datos = $2 '+TablaDatos.groupBy, [op, td]).fetchUniqueRow();
        return TablaDatos.buildFromDBJSON(<TablaDatos> result.row);
    }

    getQuotedPKsCSV(){
        return this.pks.map(pk=>quoteIdent(pk)).join(',');
    }

    getPKsWitAlias(){
        return this.pks.map(pk=>this.getTableName()+'.'+pk)
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