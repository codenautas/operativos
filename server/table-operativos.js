"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = function (context) {
    var admin = context.user.rol === 'admin';
    return context.be.tableDefAdapt({
        name: 'operativos',
        elementName: 'operativo',
        editable: admin,
        fields: [
            { name: "operativo", typeName: 'text', },
            { name: "nombre", typeName: 'text', },
        ],
        primaryKey: ['operativo']
    }, context);
};
//# sourceMappingURL=table-operativos.js.map