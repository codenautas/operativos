"use strict";

import { TableContext } from "./types-bas-ope";

module.exports = function(context:TableContext){
    var admin=context.user.rol==='admin';
    return context.be.tableDefAdapt({
        name:'clasevar',
        title:'clases de variables',
        elementName:'clase de variable',
        editable:admin,
        fields:[
            {name:"clase"       , typeName:'text'     },
            {name:"clasif2011"  , typeName:'text'     },
        ],
        primaryKey:['clase'],
    },context);
}
