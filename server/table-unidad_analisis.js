"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function unidad_analisis(context) {
    var admin = context.user.rol === 'admin';
    return {
        name: 'unidad_analisis',
        elementName: 'unidad_analisis',
        editable: admin,
        fields: [
            { name: "operativo", typeName: 'text' },
            { name: "unidad_analisis", typeName: 'text' },
            { name: "nombre", typeName: 'text' },
            { name: "pk_agregada", typeName: 'text' },
            { name: "padre", typeName: 'text' },
            { name: "orden", typeName: 'text' },
            { name: "principal", typeName: 'boolean' },
        ],
        primaryKey: ['operativo', 'unidad_analisis'],
        foreignKeys: [
            { references: 'operativos', fields: ['operativo'] },
        ],
        detailTables: [
            { table: 'tabla_datos', fields: ['operativo', 'unidad_analisis'], abr: 'T', label: 'tabla_datos' }
        ]
    };
}
exports.unidad_analisis = unidad_analisis;
//# sourceMappingURL=table-unidad_analisis.js.map