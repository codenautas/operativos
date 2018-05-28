"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function tipovar(context) {
    var admin = context.user.rol === 'admin';
    return {
        name: 'tipovar',
        title: 'tipos de variables',
        elementName: 'tipo de variable',
        editable: admin,
        fields: [
            { name: "tipovar", typeName: 'text' },
            { name: "html_type", typeName: 'text' },
            { name: "type_name", typeName: 'text' },
            { name: "validar", typeName: 'text' },
            { name: "radio", typeName: 'boolean' },
        ],
        primaryKey: ['tipovar']
    };
}
exports.tipovar = tipovar;
//# sourceMappingURL=table-tipovar.js.map