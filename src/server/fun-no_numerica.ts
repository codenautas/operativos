--{formato:'mix:sql-ts',v:1.0}.v; `
/*`;

export const no_numerica = {dumpText:`--*/
create or replace function no_numerica(p_texto text) returns boolean
  language sql immutable 
as
$sql$ 
  select case when p_texto ~ '^(0|\\d+)$' then null else true end;
$sql$;
--`, testFixtures:`
create or replace view casos_prueba_no_numerica as 
  select * from (
    select 'ERROR' as estado, no_numerica(parametro) as valor_obtenido, *
      from (
        select null::boolean as valor_esperado, '0' as parametro
          union select null, '1'
          union select null, '980'
          union select true, '012' -- no es canónico por el 0
          union select true, '.'  -- no es número
          union select true, ' 12 ' -- no es canónico por los espacios
          union select true, '12.' -- no es canónico por el punto
          union select true, '12.0' -- no es canónico por el decimal
          union select true, 'a12'
	  ) casos
	) test
	where valor_obtenido is distinct from valor_esperado;
--`, example:`
select *
  from casos_prueba_no_numerica;
--`, runTest:`
do $do$
declare 
  errores text;
begin
  select string_agg(to_json(x.*)::text,'; ') into errores from casos_prueba_no_numerica x;
  if errores is not null then
    raise 'hay errores en casos_prueba_no_numerica %', errores;
  end if;
end;
$do$;
--`};