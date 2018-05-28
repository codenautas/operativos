import { AppBackend } from "backend-plus";
import { TableContext } from "./types-operativos";
export declare type TableContext = TableContext;
export declare type Constructor<T> = new (...args: any[]) => T;
export declare function emergeAppOperativos<T extends Constructor<AppBackend>>(Base: T): {
    new (...args: any[]): {
        getTableDefinition: any;
        getProcedures(): any;
        clientIncludes(req: any, hideBEPlusInclusions: boolean): any;
        getMenu(): {
            menu: any[];
        };
        prepareGetTables(): void;
        appendToTableDefinition(tableName: string, appenderFunction: (tableDef: any, context?: any) => void): void;
        getTables(): any;
    };
} & T;
export declare var AppOperativos: any;
export declare type AppOperativosType = typeof AppOperativos;
