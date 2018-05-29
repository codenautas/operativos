/// <reference types="backend-plus" />
import { ProcedureContext } from "backend-plus";
declare var ProceduresOperativos: {
    action: string;
    parameters: {
        name: string;
        typeName: string;
        references: string;
    }[];
    coreFunction: (context: ProcedureContext, parameters: {
        operativo: string;
        tabla_datos: string;
    }) => Promise<any>;
}[];
export = ProceduresOperativos;
