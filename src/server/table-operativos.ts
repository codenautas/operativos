"use strict";

import { TableContext, TableDefinition } from "./types-operativos"

export function operativos(context: TableContext): TableDefinition {
    var admin = context.user.rol === 'admin';
    return {
        name: 'operativos',
        elementName: 'operativo',
        editable: admin,
        fields: [
            { name: "operativo", typeName: 'text', },
            { name: "nombre"   , typeName: 'text', },
            { name: "calcular" , typeName: "bigint"  , editable:false, clientSide:'generarCalculadas'},
        ],
        primaryKey: ['operativo'],
        detailTables: [
            { table: 'tabla_datos'    , fields: ['operativo'], abr: 'T' }
        ]
    };
}
