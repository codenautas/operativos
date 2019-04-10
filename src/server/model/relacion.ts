import { BaseDBTable } from "./base-db-table";
import { Client } from "../types-operativos";

export class RelacionDB extends BaseDBTable {
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    operativo: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    tabla_datos: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    que_busco: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    tabla_busqueda: string
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    tipo: string
}

export class Relacion extends RelacionDB {

    static async fetchAll(client:Client): Promise<Relacion[]>{
        let relaciones = await super.fetchAll(client, 'relaciones');
        return relaciones.map(rv => Object.setPrototypeOf(rv, Relacion.prototype))
    }
}