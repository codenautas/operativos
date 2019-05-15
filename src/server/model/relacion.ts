import { BaseDBTable } from "./base-db-table";
import { Client } from "../types-operativos";

export class RelacionDB extends BaseDBTable {
    operativo!: string
    tabla_datos!: string
    tiene!: string
    que_es!: string
    misma_pk!: boolean
    tabla_relacionada!: string
    a_veces_siempre!: string
    max!: number
}

export class Relacion extends RelacionDB {

    static async fetchAll(client:Client): Promise<Relacion[]>{
        let relaciones = await super.fetchAll(client, 'relaciones');
        return relaciones.map(rv => Object.setPrototypeOf(rv, Relacion.prototype))
    }
}