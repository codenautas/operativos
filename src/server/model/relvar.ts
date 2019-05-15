
import { Client, quoteLiteral, quoteIdent } from "../types-operativos";
import { TablaDatos } from "./tabla-datos";
import { BaseDBTable } from "./base-db-table";

export class RelVarDB extends BaseDBTable{
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    operativo: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    tabla_datos: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    tiene: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    orden: number
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    campo_datos: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    campo_tiene: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    dato_fijo: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    funcion_dato: string
}

export class RelVar extends RelVarDB{
    static async fetchAll(client:Client): Promise<RelVar[]>{
        let relVars = await super.fetchAll(client, 'rel_vars');
        return relVars.map(rv => Object.setPrototypeOf(rv, RelVar.prototype))
    }
    
    public getTDsONConditions(leftTD: TablaDatos, rightTD: TablaDatos){
        return this.getFieldCondition(leftTD.getTableName(), this.campo_datos) + '=' + this.getFieldCondition(rightTD.getTableName(), this.campo_tiene);
    }

    public getRelationONCondition(relationTD:TablaDatos): string{
        //TODO: actualmente las relaciones y las rel_vars no tienen joineo con el campo operativo.
        //aqui suponemos que si no tiene campo_datos entonces tendra dato_fijo
        return this.getFieldCondition(this.tiene, this.campo_tiene) + '=' + 
            (this.dato_fijo? quoteLiteral(this.dato_fijo): this.getFieldCondition(relationTD.getTableName(), this.campo_datos));
    }

    private getFieldCondition(alias: string, fieldName: string){
        return `${quoteIdent(alias)}.${quoteIdent(fieldName)}`;
    }
}