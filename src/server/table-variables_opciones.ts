"use strict";

import {TableDefinition} from "backend-plus"
import {TableContext} from "./types-operativos"

export {variables_opciones};
function variables_opciones(context:TableContext):TableDefinition{
    var isAdmin=context.user.rol==='admin';
    var isProcesamiento=context.user.rol==='procesamiento' || isAdmin;
    return {
        name: 'variables_opciones',
        elementName: 'opción de variable',
        editable: isProcesamiento,
        fields: [
            { name: "operativo"           , typeName: 'text'    },
            { name: "tabla_datos"         , typeName: 'text'    },
            { name: "variable"            , typeName: 'text'    },
            { name: "opcion"              , typeName: 'text'    },
            { name: "nombre"              , typeName: 'text'    },
            { name: "expresion_condicion" , typeName: 'text'    },
            { name: "expresion_valor"     , typeName: 'text'    },
            { name: "orden"               , typeName: 'integer' },
        ],
        primaryKey: ['operativo', 'tabla_datos','variable','opcion'],
        foreignKeys: [
            {references:'variables'      , fields:['operativo','tabla_datos','variable']      },
        ],
        constraints: [
        
        ]
    }
}
