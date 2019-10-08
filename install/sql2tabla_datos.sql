-- take a table name and:
-- 1. inserts a row in tabla datos
-- 2. inserts a row in variables for each table column
create or replace function sql2tabla_datos(p_esquema text, p_tabla text, p_operativo text) returns text
  language plpgsql
as
$body$
declare
  
begin
  insert into tabla_datos(operativo, tabla_datos, tipo) 
    select p_operativo, p_tabla, 'interna'
      where p_tabla not in (select tabla_datos from tabla_datos existentes);
  insert into variables(operativo, tabla_datos, variable, tipovar, grupo, clase, es_pk, orden, cerrada, activa)
    select p_operativo, p_tabla, c.column_name,
        case c.data_type
          when 'text'     then 'texto'
          when 'integer'  then 'numero'
          when 'bigint'   then 'numero'
          when 'decimal'  then 'decimal'
          when 'date'     then 'fecha'
          when 'interval' then 'hora'
          when 'boolean'  then 'boolean'
        end,
        case when kcu.ordinal_position is not null then 'claves' else null end,
        'interna',
        kcu.ordinal_position,
        c.ordinal_position,
        true,
        true
      from information_schema.columns c 
          LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                 ON tc.table_catalog = c.table_catalog
                 AND tc.table_schema = c.table_schema
                 AND tc.table_name = c.table_name
                 AND tc.constraint_type = 'PRIMARY KEY'
          LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
                 ON kcu.table_catalog = tc.table_catalog
                 AND kcu.table_schema = tc.table_schema
                 AND kcu.table_name = tc.table_name
                 AND kcu.constraint_name = tc.constraint_name
                 AND kcu.column_name = c.column_name
      where c.table_schema = p_esquema and c.table_name = p_tabla
        and (p_tabla,c.column_name) not in (select tabla_datos, variable from variables existentes);
  return 'ok';
end;
$body$;
