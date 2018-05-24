/// <reference types="backend-plus" />
import { TableContext } from "./types-bas-ope";
declare const _default: (context: TableContext) => {
    editable?: boolean;
    allow?: {
        update?: boolean;
        insert?: boolean;
        delete?: boolean;
        select?: boolean;
    };
} & {
    name: string;
    elementName?: string;
    tableName?: string;
    title?: string;
    fields: ({
        editable?: boolean;
        allow?: {
            update?: boolean;
            insert?: boolean;
            delete?: boolean;
            select?: boolean;
        };
    } & {
        name: string;
        typeName: "boolean" | "decimal" | "text" | "integer" | "date" | "interval";
        label?: string;
        title?: string;
        nullable?: boolean;
        defaultValue?: any;
        clientSide?: string;
    })[];
    primaryKey: string[];
    sql?: {
        where?: string;
    };
    foreignKeys?: {
        references: string;
        fields: (string | {
            source: string;
            target: string;
        })[];
        alias?: string;
    }[];
    softForeignKeys?: {
        references: string;
        fields: (string | {
            source: string;
            target: string;
        })[];
        alias?: string;
    }[];
    detailTables?: {
        table: string;
        fields: (string | {
            source: string;
            target: string;
        })[];
        abr: string;
    }[];
};
export = _default;
