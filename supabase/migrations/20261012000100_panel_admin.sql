-- Panel privado: consultas filtradas y configuración con permisos de personal.
begin;

grant update (registro_habilitado) on public.configuracion_experiencia to authenticated;

create function public.admin_listar_visitas(
  p_busqueda text default '', p_desde date default null, p_hasta date default null,
  p_servicio text default null, p_proyecto text default null, p_etapa text default null,
  p_pagina integer default 1, p_tamano integer default 25, p_corte timestamptz default null
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_corte timestamptz := least(coalesce(p_corte, now()), now()); v_resultado jsonb;
begin
  if not private.es_personal_autorizado() then raise exception using errcode = '42501', message = 'PERSONAL_REQUERIDO'; end if;
  if p_pagina is null or p_pagina < 1 or p_pagina > 1000000 or p_tamano is null or p_tamano not between 1 and 200
    or length(coalesce(p_busqueda, '')) > 200 or (p_desde is not null and p_hasta is not null and p_desde > p_hasta) then
    raise exception using errcode = '22023', message = 'FILTROS_INVALIDOS';
  end if;
  with filtradas as materialized (
    select p.id, p.contacto_id, c.nombre, c.apellido, c.correo, c.telefono, p.iniciada_en, p.juego
    from public.participaciones p join public.contactos c on c.id = p.contacto_id
    where p.iniciada_en <= v_corte
      and (coalesce(btrim(p_busqueda), '') = '' or strpos(lower(concat_ws(' ', c.nombre, c.apellido, c.correo, c.telefono)), lower(btrim(p_busqueda))) > 0)
      and (p_desde is null or p.iniciada_en >= (p_desde::timestamp at time zone 'America/Argentina/Buenos_Aires'))
      and (p_hasta is null or p.iniciada_en < ((p_hasta + 1)::timestamp at time zone 'America/Argentina/Buenos_Aires'))
      and (p_servicio is null or exists (select 1 from public.respuestas_comerciales r join public.preguntas_comerciales q on q.id = r.pregunta_id join public.opciones_comerciales o on o.id = r.opcion_id where r.participacion_id = p.id and q.codigo = 'servicio' and o.codigo = p_servicio))
      and (p_proyecto is null or exists (select 1 from public.respuestas_comerciales r join public.preguntas_comerciales q on q.id = r.pregunta_id join public.opciones_comerciales o on o.id = r.opcion_id where r.participacion_id = p.id and q.codigo = 'proyecto' and o.codigo = p_proyecto))
      and (p_etapa is null or exists (select 1 from public.respuestas_comerciales r join public.preguntas_comerciales q on q.id = r.pregunta_id join public.opciones_comerciales o on o.id = r.opcion_id where r.participacion_id = p.id and q.codigo = 'etapa' and o.codigo = p_etapa))
  ), pagina as (
    select f.*, coalesce((select jsonb_object_agg(q.codigo, jsonb_build_object('pregunta', r.enunciado_presentado, 'respuesta', r.opcion_presentada))
      from public.respuestas_comerciales r join public.preguntas_comerciales q on q.id = r.pregunta_id where r.participacion_id = f.id and q.codigo is not null), '{}'::jsonb) as respuestas
    from filtradas f order by f.iniciada_en desc, f.id desc limit p_tamano offset (p_pagina - 1)::bigint * p_tamano
  ) select jsonb_build_object('total', (select count(*) from filtradas), 'corte', v_corte,
      'filas', coalesce((select jsonb_agg(to_jsonb(pagina) order by iniciada_en desc, id desc) from pagina), '[]'::jsonb)) into v_resultado;
  return v_resultado;
end $$;
revoke all on function public.admin_listar_visitas(text,date,date,text,text,text,integer,integer,timestamptz) from public, anon;
grant execute on function public.admin_listar_visitas(text,date,date,text,text,text,integer,integer,timestamptz) to authenticated;

create function public.admin_guardar_configuracion(p_juego text, p_registro boolean, p_juego_anterior text, p_registro_anterior boolean)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_config public.configuracion_experiencia%rowtype;
begin
  if not private.es_personal_autorizado() then raise exception using errcode = '42501', message = 'PERSONAL_REQUERIDO'; end if;
  if p_juego is distinct from 'ruleta' then raise exception 'JUEGO_NO_DISPONIBLE'; end if;
  if p_registro is null then raise exception using errcode = '22023', message = 'CONFIGURACION_INVALIDA'; end if;
  select * into v_config from public.configuracion_experiencia where id = true for update;
  if not found then raise exception 'CONFIGURACION_INCOMPLETA'; end if;
  if v_config.juego_activo is distinct from p_juego_anterior or v_config.registro_habilitado is distinct from p_registro_anterior then raise exception 'CONFIGURACION_CAMBIO'; end if;
  update public.configuracion_experiencia set juego_activo = p_juego, registro_habilitado = p_registro where id = true;
  return jsonb_build_object('juego_activo', p_juego, 'registro_habilitado', p_registro, 'modo_prueba', v_config.modo_prueba);
end $$;
revoke all on function public.admin_guardar_configuracion(text,boolean,text,boolean) from public, anon;
grant execute on function public.admin_guardar_configuracion(text,boolean,text,boolean) to authenticated;
notify pgrst, 'reload schema';
commit;
