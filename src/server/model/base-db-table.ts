import { Client, quoteIdent } from "pg-promise-strict";

export class BaseDBTable {
    static async fetchAll(client:Client, tableName:string):Promise<{[key:string]:any}[]> {
        let query = 'SELECT * FROM ' + quoteIdent(tableName);
        return (await client.query(query).fetchAll()).rows;
    }
}