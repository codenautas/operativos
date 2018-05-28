"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function operativos(context) {
    var admin = context.user.rol === 'admin';
    return {
        name: 'operativos',
        elementName: 'operativo',
        editable: admin,
        fields: [
            { name: "operativo", typeName: 'text', },
            { name: "nombre", typeName: 'text', },
        ],
        primaryKey: ['operativo']
    };
}
exports.operativos = operativos;
//# sourceMappingURL=table-operativos.js.map