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
    static sufijo_complete: string = '_comp';

    static instanceObj: OperativoGenerator;

    static mainTD: string;
    static mainTDPK: string;

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

    private joinTDs(leftTDName: string, rightTDName: string, tdsToJoin: string[]): string {
        let joinTxt:string='';
        let rightTD = this.getUniqueTD(rightTDName)
        let relFound = <Relacion>this.myRels.find(r=>r.tabla_datos==leftTDName && r.tiene == rightTDName);
        if (!relFound) {
            let relationForRightTDAsChild = this.myRels.find(r=> r.tiene == rightTD.tabla_datos);
            if (!relationForRightTDAsChild){
                throw new Error(`No se encontró ningún registro en la tabla relaciones para las TDs ${leftTDName} y ${rightTDName}`)                
            }
            let parentTDNameOfrightTD = relationForRightTDAsChild.tabla_datos;
            joinTxt = this.joinTDs(leftTDName, parentTDNameOfrightTD, tdsToJoin) // recursive call searching in my parent
            relFound = relationForRightTDAsChild;
        }
        joinTxt = joinTxt + 
            this.joinLeftTDWithItsCalculatedTD(relFound, tdsToJoin) +
            ` JOIN ${quoteIdent(rightTD.getTableName())} ON ${this.relVarPKsConditions(relFound.tabla_datos, rightTDName)}`
        return joinTxt;
    }

    /**
     * @param relFound found relation in recursion search to join (only between base tds)
     * @param tdsToJoin all tds to join which can include calculated tds
     * Adding join with the calculated td when correspond, with 'using' instead of 'on' because calculated tables has 'misma_pk'
     */
    private joinLeftTDWithItsCalculatedTD(relFound: Relacion, tdsToJoin:string[]){
        // looking for calculated td for left td
        let leftCalculadaRel = <Relacion>this.myRels.find(r=>r.tabla_datos==relFound.tabla_datos && r.misma_pk);
        let leftTDCalculada = this.getUniqueTD(leftCalculadaRel.tiene);
        // only adds the join if the calculated td satifies:
        // 1. Is not the same than right td
        // 2. Is included in tdsToJoin
        return (relFound.tiene != leftTDCalculada.tabla_datos && leftCalculadaRel && tdsToJoin.includes(leftTDCalculada.tabla_datos))?  
            ` JOIN ${quoteIdent(leftTDCalculada.getTableName())} USING (${leftTDCalculada.getQuotedPKsCSV()})`:
            ''
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

    protected buildEndToEndJoins(tdsToJoin:string[]) {
        if (tdsToJoin.length == 1) return tdsToJoin[0]
        
        const firstTDName = this.oldestAncestorIn(tdsToJoin); //OperativoGenerator.mainTD;
        const lastTDName = this.youngerDescendantIn(tdsToJoin)
        return quoteIdent(this.getUniqueTD(firstTDName).getTableName()) + this.joinTDs(firstTDName, lastTDName, tdsToJoin);
    }

    // get the oldest ancestor from the td list (the one doesn't have any ancestor on the list) 
    oldestAncestorIn(tds:string[]){ return <string>tds.find(td=>this.hasNoAncestorIn(td,tds))}
    hasNoAncestorIn = (td:string, tds:string[]) => this.getAncestorsIn(td, tds).length == 0

    // get the younger descendant from the td list (the one doesn't have any descendant on the list) 
    youngerDescendantIn(tds:string[]){return <string>tds.find(td=>this.isDescendantOfAll(td, tds))}
    isDescendantOfAll:(td:string, tds:string[])=>boolean = (td:string, tds:string[]) => this.getAncestorsIn(td, tds).length==tds.length-1
    
    getAncestorsIn(tdToCheckAncestors:string, tds:string[]){
        let relAncestor:Relacion|undefined;
        let ancestors:string[]=[];
        let ancestorTD;
        //search for an ancestor present in list
        do{
            relAncestor = this.myRels.find(r=>r.tiene == tdToCheckAncestors)
            if (relAncestor){
                ancestorTD = relAncestor.tabla_datos;
                if (tds.includes(ancestorTD)){
                    ancestors.push(ancestorTD)
                }
                tdToCheckAncestors = ancestorTD
            }
        }while (relAncestor);

        return ancestors
        //return tds.filter(td=>isAncestorOf(td, tdToCheckAncestors))
    }

    // isAncestorOf(supposedAncestorTD, td){
    //     let rel = this.myRels.find(r=>r.tabla_datos==supposedAncestorTD && r.tiene==td);
    //     if (!rel){
    //         if (supposedAncestorTD == td){
    //             return false;
    //         } else {
    //             return this.isAncestorOf()
    //         }
    //     }
    //     return true;
    // }

}