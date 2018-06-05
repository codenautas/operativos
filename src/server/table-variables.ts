"use strict";

import {TableDefinition, TableContext} from "./types-operativos"
export {variables};

function variables(context:TableContext):TableDefinition{
    var admin = context.user.rol === 'admin';
    return {
        name: 'variables',
        elementName: 'variable',
        editable: admin,
        fields: [
            { name: "operativo"          , typeName: 'text'    },
            { name: "tabla_datos"        , typeName: 'text'    },
            { name: "variable"           , typeName: 'text'    },
            { name: "abr"                , typeName: 'text'    },
            { name: "nombre"             , typeName: 'text'    },
            { name: "tipovar"            , typeName: 'text'    },
            { name: "unidad_analisis"    , typeName: 'text'   , nullable:false                    },
            { name: "clase"              , typeName: 'text'   , nullable:false                    },
            { name: "es_pk"              , typeName: 'boolean' },
            { name: "es_nombre_unico"    , typeName: 'boolean' },
            { name: "activa"             , typeName: 'boolean', nullable:false, defaultValue:false},
            { name: "expresion"          , typeName: 'text'    },
            { name: "cascada"            , typeName: 'text'    },
            { name: "nsnc_atipico"       , typeName: 'integer' },
            { name: "cerrada"            , typeName: 'boolean' },
            { name: "funcion_agregacion" , typeName: 'text'    },
            { name: "tabla_agregada"     , typeName: 'text'    },
            { name: "grupo"              , typeName: 'text'    },
        ],
        primaryKey: ['operativo', 'tabla_datos','variable'],
        foreignKeys: [
            {references:'operativos'     , fields:['operativo']               },
            {references:'tabla_datos'    , fields:['operativo','tabla_datos'] },
            {references:'clasevar'       , fields:['clase']                   },
            {references:'tipovar'        , fields:['tipovar']                 },
            {references:'unidad_analisis', fields:['operativo','unidad_analisis'] },
        ],
        detailTables: [
            { table: 'variables_opciones', fields: ['operativo', 'variable'], abr: 'o', label: 'opciones' }
        ],
        constraints: [
            { constraintType: 'check', expr: "es_nombre_unico is TRUE" },
        ],
    }
}
