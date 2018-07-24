"use strict";

import {TableDefinition} from "backend-plus"
import {TableContext, tiposTablaDato} from "./types-operativos"

export {tabla_datos};
function tabla_datos(context:TableContext):TableDefinition{
    var admin=context.user.rol==='admin';
    return {
        name:'tabla_datos',
        elementName:'tabla_datos',
        editable:admin,
        fields:[
            {name:"operativo"         , typeName:'text', nullable: false  ,},
            {name:"tabla_datos"       , typeName:'text', nullable: false  ,},
            {name:"tipo"              , typeName:'text', nullable: false  ,},
            {name:"unidad_analisis"   , typeName:'text', nullable: false  ,},
            {name:"generar"           , typeName: "bigint"  , editable:false, clientSide:'generarTD'}
        ],
        primaryKey:['operativo', 'tabla_datos'],
        foreignKeys:[
            {references:'operativos', fields:['operativo']},
            {references:'unidad_analisis', fields:['operativo','unidad_analisis']},
        ],
        detailTables:[
            {table:'variables'       , fields:['operativo','tabla_datos'], abr:'V'},
        ],
        constraints: [
            { constraintType: 'check', consName:'valor inválido en tipo' , expr: `tipo IN ('${tiposTablaDato.calculada}', '${tiposTablaDato.externa}')` },
        ],
    };
}
