"use strict";


import * as myOwn from "myOwn";

// TODO: ver cómo mejorar esto para que vuelva a tomar el tipo de TablaDatos.
type TablaDatos = any; 

myOwn.clientSides.verTabla = {
    prepare: function (depot:myOwn.Depot, fieldName: string) {
        let tabla_datos = <TablaDatos> depot.row;
        if (tabla_datos.generada){
            var td = depot.rowControls[fieldName];
            td.appendChild(myOwn.createForkeableButton(
                {w:'table', table:tabla_datos.operativo.toLowerCase()+'_' + tabla_datos.tabla_datos}, 
                {label:"abrir", class:"x"}
            ));
            // TODO: se debería poder usar método de instancia getTableName pero desde el navegador no funciona
            // O hacer un procedure donde se le pase la pk y sepa armar la url
            // link.href='#w=table&table=' + TablaDatos.construirConObj(tabla_datos).getTableName();
        }
    }
}
