/// <reference types="backend-plus" />
/// <reference types="express" />
/// <reference types="pg-promise-strict" />
import { AppBackend, Request } from "backend-plus";
import * as backendPlus from "backend-plus";
import * as pgPromise from "pg-promise-strict";
import * as express from "express";
import { TableDefinitionsGetters } from "./types-bas-ope";
export declare type Constructor<T> = new (...args: any[]) => T;
export declare function emergeAppBasOpe<T extends Constructor<AppBackend>>(Base: T): {
    new (...args: any[]): {
        getTableDefinition: TableDefinitionsGetters;
        getProcedures(): Promise<backendPlus.ProcedureDef[]>;
        clientIncludes(req: Request, hideBEPlusInclusions: boolean): backendPlus.ClientModuleDefinition[];
        getMenu(): {
            menu: backendPlus.MenuInfoBase[];
        };
        prepareGetTables(): void;
        getTables(): backendPlus.TableItemDef[];
        app: express.Express;
        db: typeof pgPromise;
        start(): Promise<void>;
        getContext(req: Request): backendPlus.Context;
        addSchrödingerServices(mainApp: express.Express, baseUrl: string): void;
        addLoggedServices(): void;
        inDbClient<T>(req: Request, doThisWithDbClient: (client: pgPromise.Client) => Promise<T>): Promise<T>;
        inTransaction<T>(req: Request, doThisWithDbTransaction: (client: pgPromise.Client) => Promise<T>): Promise<T>;
        procedureDefCompleter(procedureDef: backendPlus.ProcedureDef): backendPlus.ProcedureDef;
        tableDefAdapt(tableDef: backendPlus.TableDefinition, context: backendPlus.Context): backendPlus.TableDefinition;
    };
} & T;
