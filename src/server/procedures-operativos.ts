"use strict";

import {ProcedureContext} from "backend-plus";

type TablaDatosGenerarParameters={
    operativo: string
    tabla_datos: string
}

var ProceduresOperativos = [
    {   
        action:'tabla_datos/generar',
        parameters:[
            {name:'operativo'   , typeName:'text', references:'operativos'  },
            {name:'tabla_datos' , typeName:'text', references:'tabla_datos' }
        ],
        coreFunction:async function(context:ProcedureContext, parameters:TablaDatosGenerarParameters){
            let resultUA = await context.client.query(
                `select *
                   from operativos
                   where operativo = $1
                `,
                [parameters.operativo]
            ).fetchOneRowIfExists();
            if (resultUA.rowCount === 0){
                throw new Error('No se configuró una unidad de analisis como principal');
            }
            return resultUA.row.operativo; 
        }
    },
];

export = ProceduresOperativos;