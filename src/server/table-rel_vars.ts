"use strict";

import {TableDefinition} from "backend-plus"
import {TableContext} from "./types-operativos"

export {rel_vars as rel_vars};
function rel_vars(context:TableContext):TableDefinition{
    var admin = context.user.rol === 'admin';
    return {
        name: 'rel_vars',
        elementName: 'relación - variable',
        editable: admin,
        fields: [
            { name: "operativo"          , typeName: 'text'    },
            { name: "tabla_datos"        , typeName: 'text'    },
            { name: "tiene"              , typeName: 'text'    },
            { name: "orden"              , typeName: 'integer' },
            { name: "tabla_relacionada"  , typeName: 'text'    , nullable: false },
            { name: "campo_datos"        , typeName: 'text'    },
            { name: "campo_tiene"        , typeName: 'text'    },
            { name: "dato_fijo"          , typeName: 'text'    },
            { name: "funcion_dato"       , typeName: 'text'    },
        ],
        primaryKey: ['operativo', 'tabla_datos','tiene', 'orden'],
        foreignKeys: [
            {references:'operativos'   , fields:['operativo'] },
            {references:'tabla_datos'  , fields:['operativo','tabla_datos'], alias:'tdrv' },
            {references:'relaciones'   , fields:['operativo', 'tabla_datos', 'tiene'], alias: 'rel_fk' },
            {references:'relaciones'   , fields:['operativo', 'tabla_datos', 'tiene', 'tabla_relacionada'], alias: 'fk_rel_uk' },
            {references:'variables'    , fields:['operativo', 'tabla_datos', {source:'campo_datos', target:'variable'}], alias:'campo_datos' },
            {references:'variables'    , fields:['operativo', {source:'tabla_relacionada', target:'tabla_datos'}, {source:'campo_tiene', target:'variable'}], alias:'campo_tiene' },
        ]
    }
}
