"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = function (context) {
    var admin = context.user.rol === 'admin';
    return context.be.tableDefAdapt({
        name: 'origenes',
        elementName: 'origen',
        editable: admin,
        fields: [
            { name: "operativo", typeName: 'text', },
            { name: "origen", typeName: 'text', },
        ],
        primaryKey: ['operativo', 'origen'],
        foreignKeys: [
            { references: 'operativos', fields: ['operativo'] },
        ],
        detailTables: [
            { table: 'variables', fields: ['operativo', 'origen'], abr: 'V' },
        ],
    }, context);
};
//# sourceMappingURL=table-origenes.js.map