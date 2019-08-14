"use strict";

import {TableDefinition, TableContext} from "./types-operativos"
export {relaciones};

//TODO: solucionar redundancia en el manejo de Tablas de datos/relaciones/unidad de analisis/array en server-app.ts
// Una opción sería construir las relaciones a partir de la tabla_datos tomando campo "consistir_en" como 
// "tabla_datos" (siendo el campo "tiene" la TD hija); o directamente desde UAs tomando campo "padre"
function relaciones(context:TableContext):TableDefinition{
    var admin = context.user.rol === 'admin';
    return {
        name: 'relaciones',
        elementName: 'relación',
        editable: admin,
        fields: [
            { name: "operativo"          , typeName: 'text'    },
            { name: "tabla_datos"        , typeName: 'text'    },
            { name: "tiene"              , typeName: 'text'    },
            { name: "que_es"             , typeName: 'text'    },
            { name: "misma_pk"           , typeName: 'boolean' },
            { name: "tabla_relacionada"  , typeName: 'text'    },
            { name: "a_veces_siempre"    , typeName: 'text'    },
            { name: "aridad"                , typeName: 'integer' },
        ],
        primaryKey: ['operativo', 'tabla_datos','tiene'],
        constraints:[
            // a_veces_siempre: para saber si la relación es optativa (para saber si es left join o inner join)
            {constraintType:'check', consName:'a_veces_siempre valores validos: a_veces, siempre' ,expr:"a_veces_siempre in ('a_veces','siempre')"},
            {constraintType:'unique', consName:'uk_tabla_relacionada' , fields:['operativo', 'tabla_datos', 'tiene', 'tabla_relacionada']},
        ],
        foreignKeys: [
            {references:'operativos'      , fields:['operativo']               },
            {references:'tabla_datos'     , fields:['operativo','tabla_datos'], alias: 'tddatos'},
            {references:'tabla_datos'     , fields:['operativo', {source:'que_es', target:'tabla_datos'}], alias: 'tdquees'},
            {references:'tabla_datos'     , fields:['operativo', {source:'tabla_relacionada', target:'tabla_datos'}], alias:'tdtablarelacionada' },
        ],
        detailTables: [
            { table: 'rel_var', fields: ['operativo', 'tabla_datos', 'tiene'], abr: 'rv', label: 'rel var' }
        ],
        sql: {
            postCreateSqls:'create trigger rel_tabla_relacionada_setting_trg before insert or update of que_es,tiene,tabla_relacionada on relaciones for each row execute procedure rel_tabla_relacionada_setting_trg();',
        }
    }
}
