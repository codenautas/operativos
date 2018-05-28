"use strict";

import {TableContext,TableDefinition} from "./types-operativos"

export function clasevar(context:TableContext):TableDefinition{
    var admin=context.user.rol==='admin';
    return {
        name:'clasevar',
        title:'clases de variables',
        elementName:'clase de variable',
        editable:admin,
        fields:[
            {name:"clase"       , typeName:'text'     },
            {name:"clasif2011"  , typeName:'text'     },
        ],
        primaryKey:['clase'],
    };
}
