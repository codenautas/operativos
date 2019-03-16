"use strict";

import {TableContext,TableDefinition} from "./types-operativos"

export function tipovar(context:TableContext):TableDefinition{
    var admin=context.user.rol==='admin';
    return {
        name:'tipovar',
        title:'tipos de variables',
        elementName:'tipo de variable',
        editable:admin,
        fields:[
            {name:"tipovar"   , typeName:'text'     },
            {name:"html_type" , typeName:'text'     ,nullable:false},
            {name:"type_name" , typeName:'text'     ,nullable:false},
            {name:"validar"   , typeName:'text'     ,nullable:false},
            {name:"radio"     , typeName:'boolean'  ,nullable:false},
        ],
        primaryKey:['tipovar']
    };
}
