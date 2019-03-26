import { Client, quoteIdent } from "pg-promise-strict";
import { Relacion, RelacVar, TablaDatos, Variable } from "./types-operativos";

export class OperativoGenerator{
    // myTDs: {[key:string]: TablaDatos} = {}
    // myVars: {[key:string]: Variable} = {}
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    myTDs: TablaDatos[]
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    myVars: Variable[]
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    myRels: Relacion[]
    // @ts-ignore https://github.com/codenautas/operativos/issues/4
    myRelacVars: RelacVar[]

    static mainTD: string;
    static mainTDPK: string;
    static orderedIngresoTDNames: string[];
    static orderedReferencialesTDNames: string[];

    static orderedTDNames(): any {
        return OperativoGenerator.orderedIngresoTDNames.concat(OperativoGenerator.orderedReferencialesTDNames);
    }

    static instanceObj: OperativoGenerator;

    constructor(public client:Client, public operativo?: string){
        OperativoGenerator.instanceObj = this;
    }

    async fetchDataFromDB(){
        this.myTDs = await TablaDatos.fetchAll(this.client);
        this.myVars = await Variable.fetchAll(this.client);
        this.myRels = await Relacion.fetchAll(this.client);
        this.myRelacVars = await RelacVar.fetchAll(this.client);

        if (this.operativo){
            this.myTDs = this.myTDs.filter(td=>td.operativo==this.operativo);
            this.myVars = this.myVars.filter(v=>v.operativo==this.operativo && v.activa);
            this.myRels = this.myRels.filter(v=>v.operativo==this.operativo);
            this.myRelacVars = this.myRelacVars.filter(v=>v.operativo==this.operativo);
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

    getUniqueTD(tdName:string){
        let td = this.myTDs.find(td=>td.tabla_datos==tdName);
        if (! td){ throw new Error('La Tabla de datos '+tdName+' no existe') }
        return td;
    }

    joinTDs(queBuscoTDName: string, rightTDName: string): string {
        let queBuscoTD = this.getUniqueTD(queBuscoTDName);
        let rightTD = this.getUniqueTD(rightTDName)
        let relacVars = this.myRelacVars.filter(rv => rv.tabla_datos==rightTDName && rv.que_busco==queBuscoTDName)

        return ` JOIN ${quoteIdent(rightTD.getTableName())} ON ${relacVars.map(rv=>rv.getTDsONConditions(queBuscoTD, rightTD)).join(' AND ')}`
    }

    joinRelation(relation: Relacion): any {
        let relationName = relation.que_busco;
        let relacVars = this.myRelacVars.filter(rv => rv.tabla_datos == relation.tabla_datos && rv.que_busco==relationName);
        let tablaBusqueda = this.getUniqueTD(relation.tabla_busqueda);
        let relationTD = this.getUniqueTD(relation.tabla_datos)
        return ` LEFT JOIN (
                    SELECT ${quoteIdent(relationName)}.* 
                      FROM ${quoteIdent(tablaBusqueda.getTableName())} ${quoteIdent(relationName)}
                    ) ${quoteIdent(relationName)} ON ${relacVars.map(rv=>rv.getRelationONCondition(relationTD)).join(' AND ')}`;
    }
}