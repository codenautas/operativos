"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function clasevar(context) {
    var admin = context.user.rol === 'admin';
    return {
        name: 'clasevar',
        title: 'clases de variables',
        elementName: 'clase de variable',
        editable: admin,
        fields: [
            { name: "clase", typeName: 'text' },
            { name: "clasif2011", typeName: 'text' },
        ],
        primaryKey: ['clase'],
    };
}
exports.clasevar = clasevar;
//# sourceMappingURL=table-clasevar.js.map