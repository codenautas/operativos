"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const backend_plus_1 = require("backend-plus");
const likeAr = require("like-ar");
const table_usuarios_1 = require("./table-usuarios");
const table_operativos_1 = require("./table-operativos");
const table_clasevar_1 = require("./table-clasevar");
const table_tipovar_1 = require("./table-tipovar");
const table_tabla_datos_1 = require("./table-tabla_datos");
const table_unidad_analisis_1 = require("./table-unidad_analisis");
const table_variables_1 = require("./table-variables");
const table_variables_opciones_1 = require("./table-variables_opciones");
function emergeAppOperativos(Base) {
    return class AppOperativos extends Base {
        constructor(...args) {
            super(...args);
        }
        getProcedures() {
            var be = this;
            return super.getProcedures().then(function (procedures) {
                return procedures.concat(require('./procedures-operativos.js').map(be.procedureDefCompleter, be));
            });
        }
        clientIncludes(req, hideBEPlusInclusions) {
            return super.clientIncludes(req, hideBEPlusInclusions).concat([
                { type: 'js', src: 'client/operativos.js' },
            ]);
        }
        getMenu() {
            let menu = { menu: [
                    { menuType: 'table', name: 'operativos' },
                    { menuType: 'table', name: 'usuarios' },
                    { menuType: 'table', name: 'tabla_datos' },
                    { menuType: 'table', name: 'unidad_analisis' },
                    { menuType: 'table', name: 'variables' },
                ] };
            return menu;
        }
        prepareGetTables() {
            this.getTableDefinition = {
                usuarios: table_usuarios_1.usuarios,
                operativos: table_operativos_1.operativos,
                clasevar: table_clasevar_1.clasevar,
                tipovar: table_tipovar_1.tipovar,
                tabla_datos: table_tabla_datos_1.tabla_datos,
                unidad_analisis: table_unidad_analisis_1.unidad_analisis,
                variables: table_variables_1.variables,
                variables_opciones: table_variables_opciones_1.variables_opciones
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
                defTable.constraints = defTable.constraints || [];
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
exports.emergeAppOperativos = emergeAppOperativos;
exports.AppOperativos = emergeAppOperativos(backend_plus_1.AppBackend);
//# sourceMappingURL=app-operativos.js.map