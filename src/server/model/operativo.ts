import { Client } from "pg-promise-strict";
import { TablaDatos } from "./tabla-datos";
import { Variable } from "./variable";

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