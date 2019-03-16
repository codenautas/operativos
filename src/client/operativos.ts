"use strict";

// TODO: ver cómo mejorar esto para que vuelva a tomar el tipo de TablaDatos.
type TablaDatos = any; 

myOwn.clientSides.verTabla = {
    prepare: function (depot:myOwn.Depot, fieldName: string) {
        let tablaDatos = <TablaDatos> depot.row;
        if (tablaDatos.generada || tablaDatos.tipo === "interna"){
            var tableName = tablaDatos.tipo==='interna' ? tablaDatos.tabla_datos : tablaDatos.operativo.toLowerCase()+'_'+tablaDatos.tabla_datos;
            var td = depot.rowControls[fieldName];
            td.appendChild(myOwn.createForkeableButton(
                {w:'table', table:tableName}, 
                {label:"abrir", class:"x"}
            ));
            // TODO: se debería poder usar método de instancia getTableName pero desde el navegador no funciona
            // O hacer un procedure donde se le pase la pk y sepa armar la url
            // link.href='#w=table&table=' + TablaDatos.construirConObj(tabla_datos).getTableName();
        }
    }
}
