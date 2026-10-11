-- Termoarq: esquema inicial. Ejecutar una sola vez en un proyecto vacío.
-- Los registros públicos se enviarán a través de un backend validado.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create function private.is_staff()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.staff_members where user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_staff() from public, anon, authenticated;
grant execute on function private.is_staff() to authenticated;

create table public.experience_settings (
  id boolean primary key default true check (id),
  active_game text check (active_game in ('roulette', 'mission')),
  unlock_scope text check (unlock_scope in ('both', 'roulette_only')),
  accepting_registrations boolean not null default false
);
insert into public.experience_settings (id) values (true);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (length(btrim(first_name)) between 1 and 100),
  last_name text not null check (length(btrim(last_name)) between 1 and 100),
  phone text check (phone is null or length(btrim(phone)) between 5 and 40),
  email text check (email is null or (length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
  consent_accepted_at timestamptz not null,
  terms_version text not null check (length(btrim(terms_version)) between 1 and 100),
  privacy_version text not null check (length(btrim(privacy_version)) between 1 and 100),
  created_at timestamptz not null default now(),
  check (phone is not null or email is not null)
);
-- No se impone unicidad de teléfono/email: la regla de repetición está pendiente.
create index contacts_created_at_idx on public.contacts (created_at desc);
create index contacts_email_idx on public.contacts (lower(email));
create index contacts_phone_idx on public.contacts (phone);

create table public.participations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  contact_id uuid not null references public.contacts(id) on delete restrict,
  game text not null check (game in ('roulette', 'mission')),
  status text not null default 'registered' check (status in ('registered', 'playing', 'completed', 'abandoned')),
  unlock_response jsonb check (unlock_response is null or jsonb_typeof(unlock_response) = 'object'),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  check ((status = 'completed') = (completed_at is not null)),
  check (completed_at is null or completed_at >= started_at)
);
comment on column public.participations.request_id is 'Clave de idempotencia para reintentos de una misma solicitud; no limita participations por persona.';
comment on column public.participations.game is 'Juego fijado por el servidor para esta participación; un cambio posterior no altera la sesión iniciada.';
create index participations_contact_idx on public.participations (contact_id);
create index participations_started_at_idx on public.participations (started_at desc);

create table public.commercial_questions (
  id uuid primary key default gen_random_uuid(),
  position smallint not null check (position between 1 and 3),
  prompt text not null check (length(btrim(prompt)) between 1 and 500),
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index commercial_questions_enabled_position_idx
  on public.commercial_questions (position) where enabled;

create table public.commercial_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.commercial_questions(id) on delete restrict,
  label text not null check (length(btrim(label)) between 1 and 300),
  position smallint not null check (position > 0),
  enabled boolean not null default false,
  unique (question_id, position),
  unique (question_id, id)
);

create table public.commercial_answers (
  participation_id uuid not null references public.participations(id) on delete restrict,
  question_id uuid not null references public.commercial_questions(id) on delete restrict,
  option_id uuid not null,
  question_snapshot text not null check (length(btrim(question_snapshot)) between 1 and 500),
  option_snapshot text not null check (length(btrim(option_snapshot)) between 1 and 300),
  created_at timestamptz not null default now(),
  primary key (participation_id, question_id),
  foreign key (question_id, option_id) references public.commercial_options(question_id, id)
);
create index commercial_answers_option_idx on public.commercial_answers (question_id, option_id);

-- Revocación explícita: no depender de los permisos automáticos del proyecto.
do $$
declare table_name text;
begin
  foreach table_name in array array['staff_members', 'experience_settings', 'contacts', 'participations', 'commercial_questions', 'commercial_options', 'commercial_answers'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from public, anon, authenticated', table_name);
    execute format('grant all on table public.%I to service_role', table_name);
    execute format('grant select on table public.%I to authenticated', table_name);
    execute format('create policy staff_read on public.%I for select to authenticated using ((select private.is_staff()))', table_name);
  end loop;
end;
$$;

-- El personal puede seleccionar el game, pero no autoasignarse permisos.
grant update (active_game) on public.experience_settings to authenticated;
create policy staff_change_game on public.experience_settings
  for update to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

-- Solo el backend lee configuración y contenidos públicos, para entregar
-- al visitante una respuesta filtrada sin publicar tablas completas.
notify pgrst, 'reload schema';
commit;


