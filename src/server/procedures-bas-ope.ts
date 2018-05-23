"use strict";

import {ProcedureContext} from "backend-plus";

type OrigenesGenerarParameters={
    operativo: string
    origen: string
}

var ProceduresBasOpe = [
    {   
        action:'origenes/generar',
        parameters:[
            {name:'operativo', typeName:'text', references:'operativos'},
            {name:'origen'   , typeName:'text', references:'origenes'  }
        ],
        coreFunction:async function(context:ProcedureContext, parameters:OrigenesGenerarParameters){
            var be=context.be;
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

export = ProceduresBasOpe;