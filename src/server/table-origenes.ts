"use strict";

import {TableDefinition} from "backend-plus"
import {TableContext} from "./types-datos-ext"


export = origenes
function origenes(context:TableContext):TableDefinition{
    var admin=context.user.rol==='admin';
    return {
        name:'origenes',
        elementName:'origen',
        editable:admin,
        fields:[
            {name:"operativo"         , typeName:'text'                   ,},
            {name:"origen"            , typeName:'text'                   ,},
        ],
        primaryKey:['operativo', 'origen'],
        foreignKeys:[
            {references:'operativos', fields:['operativo']},
        ],
        detailTables:[
            {table:'variables'       , fields:['operativo','origen'], abr:'V'},
        ],
    };
}
