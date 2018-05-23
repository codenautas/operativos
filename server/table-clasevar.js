"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = function (context) {
    var admin = context.user.rol === 'admin';
    return context.be.tableDefAdapt({
        name: 'clasevar',
        title: 'clases de variables',
        elementName: 'clase de variable',
        editable: admin,
        fields: [
            { name: "clase", typeName: 'text' },
            { name: "clasif2011", typeName: 'text' },
        ],
        primaryKey: ['clase'],
    }, context);
};
//# sourceMappingURL=table-clasevar.js.map