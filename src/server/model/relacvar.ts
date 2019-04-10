
import { Client, quoteLiteral, quoteIdent } from "../types-operativos";
import { TablaDatos } from "./tabla-datos";
import { BaseDBTable } from "./base-db-table";

export class RelacVarDB extends BaseDBTable{
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    operativo: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    tabla_datos: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    que_busco: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    orden: number
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    campo_datos: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    campo_busco: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    dato_fijo: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    funcion_dato: string
}

export class RelacVar extends RelacVarDB{
    static async fetchAll(client:Client): Promise<RelacVar[]>{
        let relacVars = await super.fetchAll(client, 'relac_vars');
        return relacVars.map(rv => Object.setPrototypeOf(rv, RelacVar.prototype))
    }
    
    getTDsONConditions(queBuscoTD: TablaDatos, rightTD: TablaDatos){
        return this.getLeftONCondition(queBuscoTD.getTableName()) + this.getRightTDONCondition(rightTD);
    }

    getRelationONCondition(relationTD:TablaDatos): string{
        //TODO: actualmente las relaciones y las relac_vars no tienen joineo con el campo operativo.
        //aqui suponemos que si no tiene campo_datos entonces tendra dato_fijo
        return this.getLeftONCondition(this.que_busco) + 
            (this.dato_fijo? quoteLiteral(this.dato_fijo): this.getRightTDONCondition(relationTD));
    }

    private getLeftONCondition(alias:string):string{
        return `${quoteIdent(alias)}.${quoteIdent(this.campo_busco)}=`;
    }

    private getRightTDONCondition(td:TablaDatos): string{
        return `${quoteIdent(td.getTableName())}.${quoteIdent(this.campo_datos)}`;
    }
}