import { Client, quoteIdent, Relacion, RelVar, TablaDatos, Variable } from "./types-operativos";

export class OperativoGenerator{
    myTDs: TablaDatos[]=[];
    myVars: Variable[]=[];
    myRels: Relacion[]=[];
    myRelVars: RelVar[]=[];

    optionalRelations: Relacion[]=[];
    validAliases: string[]=[];

    // acá bajo se concatena _agg
    static sufijo_agregacion: string = '_agg';

    static instanceObj: OperativoGenerator;

    static mainTD: string;
    static mainTDPK: string;
    static orderedIngresoTDNames: string[];

    constructor(public client:Client, public operativo?: string){
        OperativoGenerator.instanceObj = this;
    }

    async fetchDataFromDB(){
        this.myTDs = await TablaDatos.fetchAll(this.client);
        this.myVars = await Variable.fetchAll(this.client);
        this.myRels = await Relacion.fetchAll(this.client);
        this.myRelVars = await RelVar.fetchAll(this.client);

        if (this.operativo){
            this.myTDs = this.myTDs.filter(td=>td.operativo==this.operativo);
            this.myVars = this.myVars.filter(v=>v.operativo==this.operativo && v.activa);
            this.myRels = this.myRels.filter(v=>v.operativo==this.operativo);
            this.myRelVars = this.myRelVars.filter(v=>v.operativo==this.operativo);
        }

        this.optionalRelations = this.myRels.filter(rel => !!rel.que_es);
        this.validAliases = this.getValidAliases();

        // OJO los TDs pueden repetirse por operativo y las vars se repiten por TD, entonces 
        // si se hacen objetos indexados tener cuidado de no eliminar repetidos
        // tds.forEach(td=> this.myTDs[td.tabla_datos]=td);
        // vars.forEach(v=> this.myTDs[v.tabla_datos].myVars.push(v));
    }

    getOptionalRelation(varAlias: string):Relacion|undefined{
        return this.optionalRelations.find(optRel => optRel.tiene == varAlias);
    }

    private getValidAliases(): string[]{
        let validRelationsNames = this.optionalRelations.map(optRel => optRel.tiene)
        return this.myTDs.map(td => td.tabla_datos).concat(validRelationsNames);
    }

    getVars(td:TablaDatos){
        return this.myVars.filter(v => v.operativo == td.operativo && v.tabla_datos == td.tabla_datos);
        // return likeAr(this.myVars).filter(v=>v.tabla_datos==td.tabla_datos).array();
    }

    getTDFor(v:Variable): TablaDatos{
        return <TablaDatos>this.myTDs.find(td => td.operativo == v.operativo && td.tabla_datos == v.tabla_datos);
    }
    
    getUniqueTD(tdName:string){
        let td = this.myTDs.find(td=>td.tabla_datos==tdName);
        if (! td){ throw new Error('La Tabla de datos '+tdName+' no existe') }
        return td;
    }

    private joinTDs(leftTDName: string, rightTDName: string): string {
        let joinTxt:string='';
        let rightTD = this.getUniqueTD(rightTDName)
        let relFound = this.myRels.find(r=>r.tabla_datos==leftTDName && r.tiene == rightTDName);
        if (!relFound) {
            let relationForRightTDAsChild = this.myRels.find(r=> r.tiene == rightTD.tabla_datos);
            if (!relationForRightTDAsChild){
                throw new Error(`No se encontró ningún registro en la tabla relaciones para las TDs ${leftTDName} y ${rightTDName}`)                
            }
            let parentTDNameOfrightTD = relationForRightTDAsChild.tabla_datos;
            joinTxt = this.joinTDs(leftTDName, parentTDNameOfrightTD) // recursive call searching in my parent
            relFound = relationForRightTDAsChild;
        }
        return joinTxt + ` JOIN ${quoteIdent(rightTD.getTableName())} ON ${this.relVarPKsConditions(relFound.tabla_datos, rightTDName)}`
    }

    // Could be used for WHERE conditions or also for ON conditions
    protected relVarPKsConditions(leftTDName: string, rightTDName: string): string {
        let leftTD = this.getUniqueTD(leftTDName);
        let rightTD = this.getUniqueTD(rightTDName);
        let relVars = this.myRelVars.filter(rv => rv.tabla_datos==leftTDName && rv.tiene==rightTDName);
        if (!relVars.length){
            throw new Error(`No se encontraron registros en la tabla rel_vars para unir la tabla ${leftTDName} con ${rightTDName}`)
        }
        if (relVars.length < leftTD.pks.length){
            throw new Error(`La cantidad de registros en rel_vars para unir la tabla ${leftTDName} con ${rightTDName} es menor a la cantidad de pks en la tabla ${leftTDName}`)
        }
        return `${relVars.map(rv=>rv.getTDsONConditions(leftTD, rightTD)).join(' AND ')}`
    }

    protected joinOptRelation(relation: Relacion): any {
        let relationName = relation.tiene;
        let relVars = this.myRelVars.filter(rv => rv.tabla_datos == relation.tabla_datos && rv.tiene==relationName);
        if (!relVars.length){
            throw new Error(`No se encontraron registros en la tabla rel_vars para la relación opcional ${relationName}`)
        }
        let tablaRelacionada = this.getUniqueTD(relation.tabla_relacionada);
        let relationTD = this.getUniqueTD(relation.tabla_datos)
        return ` LEFT JOIN (
                    SELECT ${quoteIdent(relationName)}.* 
                      FROM ${quoteIdent(tablaRelacionada.getTableName())} ${quoteIdent(relationName)}
                    ) ${quoteIdent(relationName)} ON ${relVars.map(rv=>rv.getRelationONCondition(relationTD)).join(' AND ')}`;
    }

    protected buildEndToEndJoins(lastTDName:string) {
        const mainTD = OperativoGenerator.mainTD
        return quoteIdent(this.getUniqueTD(mainTD).getTableName()) + (lastTDName && lastTDName !=mainTD ? this.joinTDs(mainTD, lastTDName):'');
    }

}