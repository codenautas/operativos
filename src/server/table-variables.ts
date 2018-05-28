"use strict";

import {TableDefinition} from "backend-plus"
import {TableContext} from "./types-operativos"

export {variables};
function variables(context:TableContext):TableDefinition{
    var admin = context.user.rol === 'admin';
    return {
        name: 'variables',
        elementName: 'variable',
        editable: admin,
        fields: [
            { name: "operativo"          , typeName: 'text'    },
            { name: "origen"             , typeName: 'text'    },
            { name: "variable"           , typeName: 'text'    },
            { name: "abr"                , typeName: 'text'    },
            { name: "nombre"             , typeName: 'text'    },
            { name: "tipovar"            , typeName: 'text'    },
            { name: "activa"             , typeName: 'boolean' , nullable:false, defaultValue:false},
            { name: "expresion"          , typeName: 'text'    },
            { name: "clase"              , typeName: 'text'    },
            { name: "cascada"            , typeName: 'text'    },
            { name: "nsnc_atipico"       , typeName: 'integer' },
            { name: "cerrada"            , typeName: 'boolean' },
            { name: "funcion_agregacion"  , typeName: 'text'    },
            { name: "tabla_agregada"      , typeName: 'text'    },
            { name: "orden"               , typeName: 'integer'    },
            { name: "es_pk"               , typeName: 'boolean'    },
            { name: "es_nombre_unico"     , typeName: 'boolean'    },
        ],
        primaryKey: ['operativo', 'variable'],
        foreignKeys: [
            {references:'operativos'     , fields:['operativo']                  },
            {references:'origenes'       , fields:['operativo','origen']         },
            {references:'clasevar'       , fields:['clase']         },
            {references:'tipovar'        , fields:['tipovar']         },
        ],
        detailTables: [
            { table: 'variables_opciones', fields: ['operativo', 'variable'], abr: 'o', label: 'opciones' }
        ],
        constraints: [
            { constraintType: 'check', expr: "es_nombre_unico = TRUE" },
        ],
    }
}
