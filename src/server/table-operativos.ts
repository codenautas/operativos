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
        ],
        primaryKey: ['operativo'],
        detailTables: [
            { table: 'unidad_analisis', fields: ['operativo'], abr: 'U' },
            { table: 'tabla_datos'    , fields: ['operativo'], abr: 'T' }
        ]
    };
}
