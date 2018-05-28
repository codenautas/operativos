"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_operativos_1 = require("./app-operativos");
const backend_plus_1 = require("backend-plus");
var AppOperativos = app_operativos_1.emergeAppOperativos(backend_plus_1.AppBackend);
new AppOperativos().start();
//# sourceMappingURL=server-operativos.js.map