"use strict";
module.exports = function (context) {
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
};
//# sourceMappingURL=table-clasevar.js.map