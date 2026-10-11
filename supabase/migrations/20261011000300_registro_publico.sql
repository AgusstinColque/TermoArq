-- Registro de PRUEBAS: ejecutar después de las dos migraciones anteriores.
-- Carga el catálogo de ejemplos y habilita el guardado de pruebas con ruleta.
-- Las versiones legales siguen identificadas como borrador; no usar con datos del evento.
begin;

alter table public.preguntas_comerciales add column codigo text unique;
alter table public.opciones_comerciales add column codigo text;
alter table public.opciones_comerciales add constraint opciones_codigo_unico unique (pregunta_id, codigo);
alter table public.participaciones add column huella_solicitud text;
alter table public.configuracion_experiencia
  add column version_terminos text not null default 'borrador-1',
  add column version_privacidad text not null default 'borrador-1',
  add column modo_prueba boolean not null default true;

-- No reemplazar un catálogo que el equipo haya configurado por su cuenta.
do $$ begin
  if exists (select 1 from public.preguntas_comerciales) then
    raise exception 'Ya existen preguntas. Revisar el catálogo antes de cargar los ejemplos.';
  end if;
end $$;

insert into public.preguntas_comerciales(codigo, posicion, enunciado, habilitada) values ('servicio', 1, '¿Qué servicio te interesa?', true);
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'climatizacion', 'Climatización', 1, true from public.preguntas_comerciales where codigo = 'servicio';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'ventilacion', 'Ventilación mecánica', 2, true from public.preguntas_comerciales where codigo = 'servicio';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'aislaciones', 'Aislaciones térmicas', 3, true from public.preguntas_comerciales where codigo = 'servicio';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'arquitectura', 'Obras de arquitectura', 4, true from public.preguntas_comerciales where codigo = 'servicio';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'piping', 'Piping y servicios industriales', 5, true from public.preguntas_comerciales where codigo = 'servicio';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'laboratorios', 'Construcción de laboratorios', 6, true from public.preguntas_comerciales where codigo = 'servicio';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'consultoria', 'Consultoría técnica', 7, true from public.preguntas_comerciales where codigo = 'servicio';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'orientacion', 'Necesito asesoramiento', 8, true from public.preguntas_comerciales where codigo = 'servicio';
insert into public.preguntas_comerciales(codigo, posicion, enunciado, habilitada) values ('proyecto', 2, '¿Para qué tipo de proyecto?', true);
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'vivienda', 'Vivienda', 1, true from public.preguntas_comerciales where codigo = 'proyecto';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'oficinas', 'Oficinas o local comercial', 2, true from public.preguntas_comerciales where codigo = 'proyecto';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'edificio', 'Edificio o desarrollo inmobiliario', 3, true from public.preguntas_comerciales where codigo = 'proyecto';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'industria', 'Planta industrial', 4, true from public.preguntas_comerciales where codigo = 'proyecto';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'mineria', 'Proyecto minero', 5, true from public.preguntas_comerciales where codigo = 'proyecto';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'laboratorio', 'Laboratorio', 6, true from public.preguntas_comerciales where codigo = 'proyecto';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'institucional', 'Obra institucional', 7, true from public.preguntas_comerciales where codigo = 'proyecto';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'otro', 'Otro proyecto', 8, true from public.preguntas_comerciales where codigo = 'proyecto';
insert into public.preguntas_comerciales(codigo, posicion, enunciado, habilitada) values ('etapa', 3, '¿En qué etapa estás?', true);
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'planificando', 'Estoy planificando', 1, true from public.preguntas_comerciales where codigo = 'etapa';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'disenando', 'Estoy desarrollando el proyecto', 2, true from public.preguntas_comerciales where codigo = 'etapa';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'presupuestando', 'Estoy buscando presupuestos', 3, true from public.preguntas_comerciales where codigo = 'etapa';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'ejecutando', 'La obra está en ejecución', 4, true from public.preguntas_comerciales where codigo = 'etapa';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'existente', 'Quiero mejorar una instalación', 5, true from public.preguntas_comerciales where codigo = 'etapa';
insert into public.opciones_comerciales(pregunta_id, codigo, texto, posicion, habilitada) select id, 'explorando', 'Estoy explorando posibilidades', 6, true from public.preguntas_comerciales where codigo = 'etapa';


create table private.limite_registros (
  id boolean primary key default true check (id),
  ventana timestamptz not null default now(),
  cantidad integer not null default 0
);
alter table private.limite_registros enable row level security;
insert into private.limite_registros (id) values (true);
revoke all on private.limite_registros from public, anon, authenticated;

create function public.registrar_visita(p_solicitud uuid, p_datos jsonb, p_respuestas jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_config public.configuracion_experiencia%rowtype;
  v_anterior public.participaciones%rowtype;
  v_huella text;
  v_contacto uuid;
  v_participacion uuid;
  v_contacto_texto text;
  v_correo text;
  v_telefono text;
  v_cantidad integer;
  v_encontradas integer;
begin
  if p_solicitud is null or jsonb_typeof(p_datos) is distinct from 'object'
    or jsonb_typeof(p_respuestas) is distinct from 'object' then
    raise exception 'DATOS_INVALIDOS';
  end if;
  if octet_length(p_datos::text) > 4096 or octet_length(p_respuestas::text) > 2048
    or jsonb_typeof(p_datos->'nombre') is distinct from 'string'
    or jsonb_typeof(p_datos->'apellido') is distinct from 'string'
    or jsonb_typeof(p_datos->'contacto') is distinct from 'string'
    or p_datos->'consentimiento' is distinct from 'true'::jsonb
    or length(btrim(p_datos->>'nombre')) not between 1 and 100
    or length(btrim(p_datos->>'apellido')) not between 1 and 100 then
    raise exception 'DATOS_INVALIDOS';
  end if;
  v_contacto_texto := btrim(p_datos->>'contacto');
  if position('@' in v_contacto_texto) > 0 then
    if length(v_contacto_texto) > 254 or v_contacto_texto !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
      raise exception 'CONTACTO_INVALIDO';
    end if;
    v_correo := v_contacto_texto;
  else
    v_telefono := regexp_replace(v_contacto_texto, '[^0-9]', '', 'g');
    if v_contacto_texto !~ '^\+?[0-9[:space:]().-]+$' or length(v_telefono) not between 7 and 15 then
      raise exception 'CONTACTO_INVALIDO';
    end if;
    if left(v_contacto_texto, 1) = '+' then v_telefono := '+' || v_telefono; end if;
  end if;
  if (select count(*) from jsonb_object_keys(p_respuestas)) <> 3 then
    raise exception 'RESPUESTAS_INVALIDAS';
  end if;
  select count(*) into v_encontradas
  from public.preguntas_comerciales q
  join public.opciones_comerciales o on o.pregunta_id = q.id
  where q.habilitada and o.habilitada and q.posicion between 1 and 3
    and q.codigo in ('servicio', 'proyecto', 'etapa')
    and jsonb_typeof(p_respuestas->q.codigo) = 'string'
    and o.codigo = p_respuestas->>q.codigo;
  if v_encontradas <> 3 then raise exception 'RESPUESTAS_INVALIDAS'; end if;

  -- Misma solicitud + mismo contenido: devolver el recibo, sin insertar otra vez.
  v_huella := md5(jsonb_build_object(
    'nombre', btrim(p_datos->>'nombre'), 'apellido', btrim(p_datos->>'apellido'),
    'contacto', v_contacto_texto, 'respuestas', p_respuestas)::text);
  perform pg_advisory_xact_lock(hashtextextended(p_solicitud::text, 0));
  select * into v_anterior from public.participaciones where solicitud_id = p_solicitud;
  if found then
    if v_anterior.huella_solicitud is distinct from v_huella then
      raise exception 'SOLICITUD_CONFLICTO';
    end if;
    return jsonb_build_object('solicitud_id', p_solicitud, 'juego', v_anterior.juego);
  end if;
  select * into v_config from public.configuracion_experiencia where id = true for share;
  if not found or not v_config.registro_habilitado then raise exception 'REGISTRO_PAUSADO'; end if;
  if v_config.juego_activo is distinct from 'ruleta' then raise exception 'JUEGO_NO_DISPONIBLE'; end if;
  if btrim(v_config.version_terminos) = '' or btrim(v_config.version_privacidad) = '' then
    raise exception 'CONFIGURACION_INCOMPLETA';
  end if;

  -- Límite global de registros nuevos; los reintentos confirmados no lo consumen.
  update private.limite_registros
    set cantidad = case when ventana < now() - interval '1 minute' then 1 else cantidad + 1 end,
        ventana = case when ventana < now() - interval '1 minute' then now() else ventana end
    where id = true returning cantidad into v_cantidad;
  if v_cantidad > 120 then raise exception 'LIMITE_REGISTROS'; end if;

  insert into public.contactos(nombre, apellido, telefono, correo, consentimiento_aceptado_en, version_terminos, version_privacidad)
    values (btrim(p_datos->>'nombre'), btrim(p_datos->>'apellido'), v_telefono, v_correo, now(), v_config.version_terminos, v_config.version_privacidad)
    returning id into v_contacto;
  insert into public.participaciones(solicitud_id, contacto_id, juego, huella_solicitud)
    values (p_solicitud, v_contacto, v_config.juego_activo, v_huella) returning id into v_participacion;
  insert into public.respuestas_comerciales(participacion_id, pregunta_id, opcion_id, enunciado_presentado, opcion_presentada)
    select v_participacion, q.id, o.id, q.enunciado, o.texto
    from public.preguntas_comerciales q join public.opciones_comerciales o on o.pregunta_id = q.id
    where q.habilitada and o.habilitada and q.codigo in ('servicio', 'proyecto', 'etapa')
      and o.codigo = p_respuestas->>q.codigo;
  get diagnostics v_encontradas = row_count;
  if v_encontradas <> 3 then raise exception 'RESPUESTAS_INVALIDAS'; end if;
  return jsonb_build_object('solicitud_id', p_solicitud, 'juego', v_config.juego_activo);
end;
$$;
revoke all on function public.registrar_visita(uuid, jsonb, jsonb) from public;
grant execute on function public.registrar_visita(uuid, jsonb, jsonb) to anon, authenticated;
comment on function public.registrar_visita(uuid, jsonb, jsonb) is 'Entrada pública validada, atómica e idempotente. No devuelve datos de contactos ni resultados de juego.';

update public.configuracion_experiencia set juego_activo = 'ruleta', registro_habilitado = true, modo_prueba = true where id = true;
notify pgrst, 'reload schema';
commit;
