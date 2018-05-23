"use strict";

import {TableContext} from "./types-bas-ope"

module.exports = function(context:TableContext){
    var admin=context.user.rol==='admin';
    return context.be.tableDefAdapt({
        name:'operativos',
        elementName:'operativo',
        editable:admin,
        fields:[
            {name:"operativo"         , typeName:'text'                   ,},
            {name:"nombre"            , typeName:'text'                   ,},
        ],
        primaryKey:['operativo']
    },context);
}
