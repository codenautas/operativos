"use strict";
module.exports = function (context) {
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
};
//# sourceMappingURL=table-operativos.js.map