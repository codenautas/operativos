"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function variables_opciones(context) {
    var admin = context.user.rol === 'admin';
    return {
        name: 'variables_opciones',
        elementName: 'opción de variable',
        editable: admin,
        fields: [
            { name: "operativo", typeName: 'text' },
            { name: "variable", typeName: 'text' },
            { name: "opcion", typeName: 'integer' },
            { name: "nombre", typeName: 'text' },
            { name: "expresion_condicion", typeName: 'text' },
            { name: "expresion_valor", typeName: 'text' },
            { name: "orden", typeName: 'integer' },
        ],
        primaryKey: ['operativo', 'variable', 'opcion'],
        foreignKeys: [
            { references: 'variables', fields: ['operativo', 'variable'] },
        ],
    };
}
exports.variables_opciones = variables_opciones;
//# sourceMappingURL=table-variables_opciones.js.map