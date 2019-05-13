 CREATE OR REPLACE FUNCTION rel_tabla_relacionada_setting_trg()
  RETURNS trigger AS
$BODY$
begin
  if new.tiene is distinct from old.tiene or new.que_es is distinct from old.que_es then
    new.tabla_relacionada := coalesce(new.que_es, new.tiene);
  end if;
  return new;
end;
$BODY$
  LANGUAGE plpgsql ;