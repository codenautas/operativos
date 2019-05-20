"use strict";

import {TableDefinition} from "backend-plus"
import {TableContext, tiposTablaDatoArray} from "./types-operativos"

export {tabla_datos};
function tabla_datos(context:TableContext):TableDefinition{
    var admin=context.user.rol==='admin';
    return {
        name:'tabla_datos',
        elementName:'tabla_datos',
        editable:admin,
        fields:[
            {name:"operativo"         , typeName:'text', nullable: false},
            {name:"tabla_datos"       , typeName:'text', nullable: false},
            {name:"tipo"              , typeName:'text', nullable: false},
            {name:"ver_tabla"         , typeName:'bigint' , editable:false, clientSide:'verTabla'},
            {name:'generada'          , typeName:'timestamp'   , editable:false, title:'generada/calculada'},
            {name:'consistir_en'      , typeName:'text'}
        ],
        primaryKey:['operativo', 'tabla_datos'],
        foreignKeys:[
            {references:'operativos' , fields:['operativo']},
            {references:'tabla_datos', fields:['operativo', {source:'consistir_en', target:'tabla_datos'}]},
        ],
        detailTables:[
            {table:'variables'       , fields:['operativo','tabla_datos'], abr:'V'},
        ],
        constraints: [
            { constraintType: 'check', consName:'valor inválido en tipo' , expr: `tipo IN ('${tiposTablaDatoArray.join("','")}')` },
        ],
    };
}