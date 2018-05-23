import * as backendPlus from "backend-plus";
export interface TableContext extends backendPlus.Context {
    puede: object;
    superuser?: true;
    forDump?: boolean;
    user: {
        usuario: string;
        rol: string;
    };
}
