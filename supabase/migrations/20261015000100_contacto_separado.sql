begin;
create or replace function public.registrar_visita(p_solicitud uuid, p_datos jsonb, p_respuestas jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_config public.configuracion_experiencia%rowtype;
  v_anterior public.participaciones%rowtype;
  v_huella text;
  v_contacto uuid;
  v_participacion uuid;
  v_contacto_texto text;
  v_formato_anterior boolean;
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
    or p_datos->'consentimiento' is distinct from 'true'::jsonb
    or length(btrim(p_datos->>'nombre')) not between 1 and 100
    or length(btrim(p_datos->>'apellido')) not between 1 and 100 then
    raise exception 'DATOS_INVALIDOS';
  end if;
  -- Mantener el formato anterior mientras los navegadores cargan la versión nueva.
  v_formato_anterior := p_datos ? 'contacto';
  if v_formato_anterior then
    if jsonb_typeof(p_datos->'contacto') is distinct from 'string'
      or p_datos ? 'correo' or p_datos ? 'telefono' then
      raise exception 'DATOS_INVALIDOS';
    end if;
    v_contacto_texto := btrim(p_datos->>'contacto');
    if position('@' in v_contacto_texto) > 0 then
      v_correo := v_contacto_texto;
    else
      v_telefono := v_contacto_texto;
    end if;
  else
    if jsonb_typeof(p_datos->'correo') is distinct from 'string'
      or jsonb_typeof(p_datos->'telefono') is distinct from 'string' then
      raise exception 'DATOS_INVALIDOS';
    end if;
    v_correo := nullif(btrim(p_datos->>'correo'), '');
    v_telefono := nullif(btrim(p_datos->>'telefono'), '');
    if v_correo is null and v_telefono is null then
      raise exception 'CONTACTO_INVALIDO';
    end if;
  end if;
  if v_correo is not null and
    (length(v_correo) > 254 or v_correo !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') then
    raise exception 'CONTACTO_INVALIDO';
  end if;
  if v_telefono is not null then
    v_contacto_texto := v_telefono;
    v_telefono := regexp_replace(v_telefono, '[^0-9]', '', 'g');
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
  if v_formato_anterior then
    v_huella := md5(jsonb_build_object(
      'nombre', btrim(p_datos->>'nombre'), 'apellido', btrim(p_datos->>'apellido'),
      'contacto', btrim(p_datos->>'contacto'), 'respuestas', p_respuestas)::text);
  else
    v_huella := md5(jsonb_build_object(
      'nombre', btrim(p_datos->>'nombre'), 'apellido', btrim(p_datos->>'apellido'),
      'correo', coalesce(v_correo, ''), 'telefono', coalesce(v_telefono, ''),
      'respuestas', p_respuestas)::text);
  end if;
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
  if v_config.juego_activo is null or v_config.juego_activo not in ('ruleta', 'mision') then raise exception 'JUEGO_NO_DISPONIBLE'; end if;
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
notify pgrst, 'reload schema';
commit;
