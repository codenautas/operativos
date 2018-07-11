"use strict";

var ProceduresOperativos = [
    {   
        action:'tabla_datos/generar',
        parameters:[
            {name:'operativo'   , typeName:'text', references:'operativos'  },
            {name:'tabla_datos' , typeName:'text', references:'tabla_datos' }
        ],
        coreFunction:async function(){
            // do nothing
        }
    },
];

export {ProceduresOperativos};