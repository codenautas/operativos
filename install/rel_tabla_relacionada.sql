 CREATE OR REPLACE FUNCTION rel_tabla_relacionada_setting_trg()
  RETURNS trigger AS
$BODY$
begin
  new.tabla_relacionada := coalesce(new.que_es, new.tiene);
  return new;
end;
$BODY$
  LANGUAGE plpgsql ;