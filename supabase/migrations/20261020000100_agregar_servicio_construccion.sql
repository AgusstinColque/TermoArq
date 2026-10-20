-- Agregar Construcción sin modificar las demás opciones ni respuestas existentes.
begin;
do $$ begin
  if not exists (select 1 from public.preguntas_comerciales where codigo = 'servicio') then
    raise exception 'CATALOGO_SERVICIO_NO_CONFIGURADO';
  end if;
end $$;
insert into public.opciones_comerciales (pregunta_id, codigo, texto, posicion, habilitada)
select id, 'construccion', 'Construcción', 5, true
from public.preguntas_comerciales where codigo = 'servicio'
on conflict (pregunta_id, codigo) do update
set texto = excluded.texto, posicion = excluded.posicion, habilitada = true;
commit;
