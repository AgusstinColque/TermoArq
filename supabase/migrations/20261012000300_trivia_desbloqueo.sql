-- Mazo compartido por Ruleta y Misión: 15 preguntas en orden aleatorio sin reposición.
-- El texto aprobado vive en src/data/desafioInicial.ts; la base asigna su número.
begin;

create table private.asignaciones_desbloqueo (
  turno bigint generated always as identity unique,
  solicitud_id uuid primary key,
  ciclo integer not null check (ciclo > 0),
  pregunta_id smallint not null check (pregunta_id between 1 and 15),
  asignada_en timestamptz not null default now(),
  unique (ciclo, pregunta_id)
);
alter table private.asignaciones_desbloqueo enable row level security;
revoke all on private.asignaciones_desbloqueo from public, anon, authenticated;

create function public.asignar_desafio(p_solicitud uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_ciclo integer;
  v_pregunta smallint;
  v_ultima smallint;
  v_disponible boolean;
begin
  if p_solicitud is null then raise exception 'SOLICITUD_INVALIDA'; end if;

  -- Un único candado para todos los puestos del stand. La misma solicitud
  -- conserva siempre su pregunta, incluso si se reintenta la llamada.
  perform pg_advisory_xact_lock(hashtextextended('termoarq-desbloqueo', 0));
  select pregunta_id into v_pregunta
    from private.asignaciones_desbloqueo where solicitud_id = p_solicitud;
  if found then return jsonb_build_object('pregunta_id', v_pregunta); end if;

  select registro_habilitado and juego_activo in ('ruleta', 'mision')
    into v_disponible from public.configuracion_experiencia where id = true;
  if not coalesce(v_disponible, false) then raise exception 'EXPERIENCIA_PAUSADA'; end if;

  select coalesce(max(ciclo), 1) into v_ciclo from private.asignaciones_desbloqueo;
  select numero::smallint into v_pregunta
    from generate_series(1, 15) as candidatos(numero)
    where not exists (
      select 1 from private.asignaciones_desbloqueo a
      where a.ciclo = v_ciclo and a.pregunta_id = numero
    )
    order by random() limit 1;

  if v_pregunta is null then
    select pregunta_id into v_ultima
      from private.asignaciones_desbloqueo order by turno desc limit 1;
    v_ciclo := v_ciclo + 1;
    -- La primera de la nueva vuelta tampoco repite la última de la anterior.
    select numero::smallint into v_pregunta
      from generate_series(1, 15) as candidatos(numero)
      where numero <> v_ultima
      order by random() limit 1;
  end if;

  insert into private.asignaciones_desbloqueo(solicitud_id, ciclo, pregunta_id)
    values (p_solicitud, v_ciclo, v_pregunta);
  return jsonb_build_object('pregunta_id', v_pregunta);
end;
$$;
revoke all on function public.asignar_desafio(uuid) from public, anon;
grant execute on function public.asignar_desafio(uuid) to anon, authenticated;
comment on function public.asignar_desafio(uuid) is 'Reparte de forma atómica una de 15 preguntas, sin repetir dentro de cada ciclo, y conserva la asignación por solicitud.';

notify pgrst, 'reload schema';
commit;
