"use strict";

import {TableDefinition} from "backend-plus"
import {TableContext} from "./types-operativos"

export {relac_vars};
function relac_vars(context:TableContext):TableDefinition{
    var admin = context.user.rol === 'admin';
    return {
        name: 'relac_vars',
        elementName: 'relación - variable',
        editable: admin,
        fields: [
            { name: "operativo"          , typeName: 'text'    },
            { name: "tabla_datos"        , typeName: 'text'    },
            { name: "que_busco"          , typeName: 'text'    },
            { name: "orden"               , typeName: 'integer' },
            { name: "campo_datos"         , typeName: 'text'    },
            { name: "campo_busco"         , typeName: 'text'    },
            { name: "dato_fijo"           , typeName: 'text'    },
            { name: "funcion_dato"        , typeName: 'text' },
        ],
        primaryKey: ['operativo', 'tabla_datos','que_busco', 'orden'],
        foreignKeys: [
            {references:'operativos'   , fields:['operativo'] },
            {references:'tabla_datos'  , fields:['operativo','tabla_datos'] },
            {references:'variables'    , fields:['operativo', 'tabla_datos', {source:'campo_datos', target:'variable'}] },
        ],
    }
}
