import {TableDefinition} from "backend-plus"
import {TableContext} from "./types-operativos"

export {unidad_analisis};
function unidad_analisis(context:TableContext):TableDefinition{
    var admin = context.user.rol === 'admin';
    return {
        name: 'unidad_analisis',
        elementName: 'unidad_analisis',
        editable: admin,
        fields: [
            {name:"operativo"        , typeName:'text'                },
            {name:"unidad_analisis"  , typeName:'text'                },
            {name:"nombre"           , typeName:'text'                },
            {name:"pk_agregada"      , typeName:'text'                },
            {name:"padre"            , typeName:'text'                },
            {name:"orden"            , typeName:'integer'                },
            {name:"principal"        , typeName:'boolean'             },
        ],
        primaryKey: ['operativo','unidad_analisis'],
        foreignKeys:[
            {references:'operativos', fields:['operativo']},
        ],
        detailTables: [
            { table: 'tabla_datos', fields: ['operativo', 'unidad_analisis'], abr: 'T', label: 'tabla_datos' }
        ]
    }
}