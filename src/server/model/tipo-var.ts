import { PgKnownTypes } from "backend-plus";

export interface TipoVarDB {
    tipovar: string
    html_type?: string
    type_name?: PgKnownTypes
    validar?: string
    radio?: boolean
}