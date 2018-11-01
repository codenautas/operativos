"use strict";

import {TableDefinition, TableContext} from "./types-operativos"
export {relaciones};

function relaciones(context:TableContext):TableDefinition{
    var admin = context.user.rol === 'admin';
    return {
        name: 'relaciones',
        elementName: 'relación',
        editable: admin,
        fields: [
            { name: "operativo"          , typeName: 'text'    },
            { name: "tabla_datos"        , typeName: 'text'    },
            { name: "que_busco"          , typeName: 'text'    },
            { name: "tabla_busqueda"     , typeName: 'text' },
            { name: "tipo"               , typeName: 'text' },
        ],
        primaryKey: ['operativo', 'tabla_datos','que_busco'],
        foreignKeys: [
            {references:'operativos'     , fields:['operativo']               },
            {references:'tabla_datos'    , fields:['operativo','tabla_datos'], alias: 'tddatos'},
            {references:'tabla_datos'    , fields:['operativo', {source:'tabla_busqueda', target:'tabla_datos'}], alias:'tdbusqueda' },
        ],
        detailTables: [
            { table: 'relac_var', fields: ['operativo', 'tabla_datos', 'que_busco'], abr: 'rv', label: 'relac var' }
        ]
    }
}
