import { ProcedureContext } from "backend-plus";
declare type TablaDatosGenerarParameters = {
    operativo: string;
    tabla_datos: string;
};
declare var ProceduresOperativos: {
    action: string;
    parameters: {
        name: string;
        typeName: string;
        references: string;
    }[];
    coreFunction: (context: ProcedureContext, parameters: TablaDatosGenerarParameters) => Promise<any>;
}[];
export = ProceduresOperativos;
