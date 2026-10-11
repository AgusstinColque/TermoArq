-- Renombrado del esquema inicial en inglés, conservando registros y relaciones.
-- Ejecutar una sola vez, después de 20261011000100_initial_schema.sql.
begin;

-- Si falta una tabla original o ya existe su destino, abortar sin cambios.
do $$
declare r record;
begin
  for r in select * from (values
    ('staff_members','personal_autorizado'),
    ('experience_settings','configuracion_experiencia'),
    ('contacts','contactos'),
    ('participations','participaciones'),
    ('commercial_questions','preguntas_comerciales'),
    ('commercial_options','opciones_comerciales'),
    ('commercial_answers','respuestas_comerciales')
  ) as nombres(original, nuevo) loop
    if to_regclass('public.' || r.original) is null then
      raise exception 'Falta tabla original %. No ejecutar de nuevo ni crear tablas duplicadas.', r.original;
    end if;
    if to_regclass('public.' || r.nuevo) is not null then
      raise exception 'Ya existe tabla destino %. Revisar estado antes de continuar.', r.nuevo;
    end if;
  end loop;
end;
$$;

alter table public.staff_members rename to personal_autorizado;
alter table public.experience_settings rename to configuracion_experiencia;
alter table public.contacts rename to contactos;
alter table public.participations rename to participaciones;
alter table public.commercial_questions rename to preguntas_comerciales;
alter table public.commercial_options rename to opciones_comerciales;
alter table public.commercial_answers rename to respuestas_comerciales;

-- RLS, permisos, claves e índices siguen asociados a las mismas tablas.
do $$
declare r record;
begin
  for r in select * from (values
    ('personal_autorizado','user_id','usuario_id'),
    ('personal_autorizado','created_at','creado_en'),
    ('configuracion_experiencia','active_game','juego_activo'),
    ('configuracion_experiencia','unlock_scope','alcance_desbloqueo'),
    ('configuracion_experiencia','accepting_registrations','registro_habilitado'),
    ('contactos','first_name','nombre'),
    ('contactos','last_name','apellido'),
    ('contactos','phone','telefono'),
    ('contactos','email','correo'),
    ('contactos','consent_accepted_at','consentimiento_aceptado_en'),
    ('contactos','terms_version','version_terminos'),
    ('contactos','privacy_version','version_privacidad'),
    ('contactos','created_at','creado_en'),
    ('participaciones','request_id','solicitud_id'),
    ('participaciones','contact_id','contacto_id'),
    ('participaciones','game','juego'),
    ('participaciones','status','estado'),
    ('participaciones','unlock_response','respuesta_desbloqueo'),
    ('participaciones','started_at','iniciada_en'),
    ('participaciones','completed_at','finalizada_en'),
    ('preguntas_comerciales','position','posicion'),
    ('preguntas_comerciales','prompt','enunciado'),
    ('preguntas_comerciales','enabled','habilitada'),
    ('preguntas_comerciales','created_at','creado_en'),
    ('opciones_comerciales','question_id','pregunta_id'),
    ('opciones_comerciales','label','texto'),
    ('opciones_comerciales','position','posicion'),
    ('opciones_comerciales','enabled','habilitada'),
    ('respuestas_comerciales','participation_id','participacion_id'),
    ('respuestas_comerciales','question_id','pregunta_id'),
    ('respuestas_comerciales','option_id','opcion_id'),
    ('respuestas_comerciales','question_snapshot','enunciado_presentado'),
    ('respuestas_comerciales','option_snapshot','opcion_presentada'),
    ('respuestas_comerciales','created_at','creado_en')
  ) as nombres(tabla, original, nuevo) loop
    execute format('alter table public.%I rename column %I to %I', r.tabla, r.original, r.nuevo);
  end loop;
end;
$$;

-- La función SQL contiene referencias textuales: reemplazar su cuerpo.
-- Renombrarla conserva su identidad y las dependencias de las políticas.
alter function private.is_staff() rename to es_personal_autorizado;
create or replace function private.es_personal_autorizado()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.personal_autorizado
    where usuario_id = (select auth.uid())
  );
$$;
revoke all on function private.es_personal_autorizado() from public, anon, authenticated;
grant execute on function private.es_personal_autorizado() to authenticated;

-- Traducir valores existentes y renovar sus checks dentro de la transacción.
do $$
declare r record; cantidad integer := 0;
begin
  for r in
    select conrelid::regclass as tabla, conname
    from pg_constraint
    where contype = 'c' and (
      (conrelid = 'public.configuracion_experiencia'::regclass and
        (position('''roulette''' in pg_get_constraintdef(oid)) > 0 or
         position('''both''' in pg_get_constraintdef(oid)) > 0))
      or
      (conrelid = 'public.participaciones'::regclass and
        (position('''roulette''' in pg_get_constraintdef(oid)) > 0 or
         position('''registered''' in pg_get_constraintdef(oid)) > 0 or
         position('''completed''' in pg_get_constraintdef(oid)) > 0))
    )
  loop
    execute format('alter table %s drop constraint %I', r.tabla, r.conname);
    cantidad := cantidad + 1;
  end loop;
  if cantidad <> 5 then
    raise exception 'Se esperaban 5 checks de valores originales; encontrados %. Transacción cancelada.', cantidad;
  end if;
end;
$$;

update public.configuracion_experiencia
set juego_activo = case juego_activo when 'roulette' then 'ruleta' when 'mission' then 'mision' else juego_activo end,
    alcance_desbloqueo = case alcance_desbloqueo when 'both' then 'ambos' when 'roulette_only' then 'solo_ruleta' else alcance_desbloqueo end;
update public.participaciones
set juego = case juego when 'roulette' then 'ruleta' when 'mission' then 'mision' else juego end,
    estado = case estado when 'registered' then 'registrada' when 'playing' then 'jugando' when 'completed' then 'completada' when 'abandoned' then 'abandonada' else estado end;
alter table public.participaciones alter column estado set default 'registrada';

alter table public.configuracion_experiencia
  add constraint configuracion_juego_activo_check check (juego_activo in ('ruleta', 'mision')),
  add constraint configuracion_alcance_desbloqueo_check check (alcance_desbloqueo in ('ambos', 'solo_ruleta'));
alter table public.participaciones
  add constraint participaciones_juego_check check (juego in ('ruleta', 'mision')),
  add constraint participaciones_estado_check check (estado in ('registrada', 'jugando', 'completada', 'abandonada')),
  add constraint participaciones_finalizacion_check check ((estado = 'completada') = (finalizada_en is not null));

alter index public.contacts_created_at_idx rename to contactos_creado_en_idx;
alter index public.contacts_email_idx rename to contactos_correo_idx;
alter index public.contacts_phone_idx rename to contactos_telefono_idx;
alter index public.participations_contact_idx rename to participaciones_contacto_idx;
alter index public.participations_started_at_idx rename to participaciones_iniciada_en_idx;
alter index public.commercial_questions_enabled_position_idx rename to preguntas_comerciales_posicion_habilitada_idx;
alter index public.commercial_answers_option_idx rename to respuestas_comerciales_opcion_idx;

do $$
declare t text;
begin
  foreach t in array array['personal_autorizado','configuracion_experiencia','contactos','participaciones','preguntas_comerciales','opciones_comerciales','respuestas_comerciales'] loop
    execute format('alter policy staff_read on public.%I rename to lectura_personal', t);
  end loop;
end;
$$;
alter policy staff_change_game on public.configuracion_experiencia rename to personal_cambia_juego;

notify pgrst, 'reload schema';
commit;

select tablename as tabla, rowsecurity as rls_activo
from pg_tables
where schemaname = 'public'
  and tablename in ('personal_autorizado','configuracion_experiencia','contactos','participaciones','preguntas_comerciales','opciones_comerciales','respuestas_comerciales')
order by tablename;


