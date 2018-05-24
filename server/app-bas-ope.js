"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const backend_plus_1 = require("backend-plus");
const likeAr = require("like-ar");
const usuarios = require("./table-usuarios");
const operativos = require("./table-operativos");
const clasevar = require("./table-clasevar");
const tipovar = require("./table-tipovar");
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
        prepareGetTables() {
            this.getTableDefinition = {
                usuarios,
                operativos,
                clasevar,
                tipovar,
            };
        }
        appendToTableDefinition(tableName, appenderFunction) {
            var previousDefiniterFunction = this.getTableDefinition[tableName];
            this.getTableDefinition[tableName] = function (context) {
                var defTable = previousDefiniterFunction(context);
                defTable.fields = defTable.fields || [];
                defTable.foreignKeys = defTable.foreignKeys || [];
                defTable.softForeignKeys = defTable.softForeignKeys || [];
                defTable.detailTables = defTable.detailTables || [];
                defTable.sql = defTable.sql || {};
                appenderFunction(defTable, context);
                return defTable;
            };
        }
        getTables() {
            var be = this;
            this.prepareGetTables();
            return super.getTables().concat(likeAr(this.getTableDefinition).map(function (tableDef, tableName) {
                return { name: tableName, tableGenerator: function (context) {
                        return be.tableDefAdapt(tableDef(context), context);
                    } };
            }).array());
        }
    };
}
exports.emergeAppBasOpe = emergeAppBasOpe;
exports.AppBasOpe = emergeAppBasOpe(backend_plus_1.AppBackend);
//# sourceMappingURL=app-bas-ope.js.map