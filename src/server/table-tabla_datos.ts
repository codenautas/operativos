"use strict";

import {TableDefinition} from "backend-plus"
import {TableContext} from "./types-operativos"


export {tabla_datos};
function tabla_datos(context:TableContext):TableDefinition{
    var admin=context.user.rol==='admin';
    return {
        name:'tabla_datos',
        elementName:'tabla_datos',
        editable:admin,
        fields:[
            {name:"operativo"         , typeName:'text'                   ,},
            {name:"tabla_datos"       , typeName:'text'                   ,},
            {name:"unidad_analisis"   , typeName:'text'                   ,},
        ],
        primaryKey:['operativo', 'tabla_datos'],
        foreignKeys:[
            {references:'operativos', fields:['operativo']},
            {references:'unidad_analisis', fields:['operativo','unidad_analisis']},
        ],
        detailTables:[
            {table:'variables'       , fields:['operativo','tabla_datos'], abr:'V'},
        ],
    };
}
