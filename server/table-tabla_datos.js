"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function tabla_datos(context) {
    var admin = context.user.rol === 'admin';
    return {
        name: 'tabla_datos',
        elementName: 'tabla_datos',
        editable: admin,
        fields: [
            { name: "operativo", typeName: 'text', },
            { name: "tabla_datos", typeName: 'text', },
            { name: "unidad_analisis", typeName: 'text', },
        ],
        primaryKey: ['operativo', 'tabla_datos'],
        foreignKeys: [
            { references: 'operativos', fields: ['operativo'] },
            { references: 'unidad_analisis', fields: ['operativo', 'unidad_analisis'] },
        ],
        detailTables: [
            { table: 'variables', fields: ['operativo', 'tabla_datos'], abr: 'V' },
        ],
    };
}
exports.tabla_datos = tabla_datos;
//# sourceMappingURL=table-tabla_datos.js.map