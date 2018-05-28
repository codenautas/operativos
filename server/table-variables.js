"use strict";
function variables(context) {
    var admin = context.user.rol === 'admin';
    return {
        name: 'variables',
        elementName: 'variable',
        editable: admin,
        fields: [
            { name: "operativo", typeName: 'text' },
            { name: "origen", typeName: 'text' },
            { name: "variable", typeName: 'text' },
            { name: "abr", typeName: 'text' },
            { name: "nombre", typeName: 'text' },
            { name: "tipovar", typeName: 'text' },
            { name: "activa", typeName: 'boolean', nullable: false, defaultValue: false },
            { name: "expresion", typeName: 'text' },
            { name: "clase", typeName: 'text' },
            { name: "cascada", typeName: 'text' },
            { name: "nsnc_atipico", typeName: 'integer' },
            { name: "cerrada", typeName: 'boolean' },
            { name: "funcion_agregacion", typeName: 'text' },
            { name: "tabla_agregada", typeName: 'text' },
        ],
        primaryKey: ['operativo', 'variable'],
        foreignKeys: [
            { references: 'operativos', fields: ['operativo'] },
            { references: 'origenes', fields: ['operativo', 'origen'] },
        ],
        detailTables: [
            { table: 'variables_opciones', fields: ['operativo', 'variable'], abr: 'o', label: 'opciones' }
        ],
        constraints: [
            { constraintType: 'check', expr: "tipovar in ('numero','texto','opciones')" },
            { constraintType: 'check', expr: "clase   in ('relevamiento','calculada','precalculada','externa')" },
        ],
    };
}
module.exports = variables;
//# sourceMappingURL=table-variables.js.map