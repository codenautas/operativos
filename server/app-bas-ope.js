"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function emergeAppBasOpe(Base) {
    return class AppBasOpe extends Base {
        constructor(...args) {
            super(...args);
        }
        getProcedures() {
            var be = this;
            return super.getProcedures().then(function (procedures) {
                return procedures.concat(require('./procedures-bas-ope.js').map(be.procedureDefCompleter, be));
            });
        }
        clientIncludes(req, hideBEPlusInclusions) {
            return super.clientIncludes(req, hideBEPlusInclusions).concat([
                { type: 'js', src: 'client/bas-ope.js' },
            ]);
        }
        getMenu() {
            let menu = { menu: [
                    { menuType: 'table', name: 'operativos' },
                    { menuType: 'table', name: 'usuarios' },
                ] };
            return menu;
        }
        getTables() {
            return super.getTables().concat([
                'usuarios',
                'operativos',
                'tipovar',
                'clasevar',
            ]);
        }
    };
}
exports.emergeAppBasOpe = emergeAppBasOpe;
//# sourceMappingURL=app-bas-ope.js.map