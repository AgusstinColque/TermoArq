-- Ejecutar después de la migración en SQL Editor.
-- Esta prueba no deja cambios: toda la transacción termina en rollback.
begin;
do $$
declare t text;
begin
  foreach t in array array['personal_autorizado', 'configuracion_experiencia', 'contactos', 'participaciones', 'preguntas_comerciales', 'opciones_comerciales', 'respuestas_comerciales'] loop
    if not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = t and c.relrowsecurity) then
      raise exception 'Falta RLS: %', t;
    end if;
    if has_table_privilege('anon', 'public.' || t, 'SELECT') or has_table_privilege('anon', 'public.' || t, 'INSERT') or has_table_privilege('anon', 'public.' || t, 'UPDATE') or has_table_privilege('anon', 'public.' || t, 'DELETE') then
      raise exception 'Permiso inesperado para anon: %', t;
    end if;
    if has_table_privilege('authenticated', 'public.' || t, 'INSERT') or has_table_privilege('authenticated', 'public.' || t, 'DELETE') then
      raise exception 'Escritura inesperada para authenticated: %', t;
    end if;
  end loop;
end;
$$;

-- Cuenta autenticada sin membresía: no debe ver configuración ni datos.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
set local role authenticated;
do $$
begin
  if private.es_personal_autorizado() then raise exception 'Usuario no autorizado reconocido como personal'; end if;
  if exists (select 1 from public.configuracion_experiencia) then raise exception 'RLS permite leer a un usuario ajeno'; end if;
  if exists (select 1 from public.contactos) then raise exception 'RLS permite consultar contactos a un usuario ajeno'; end if;
  update public.configuracion_experiencia set juego_activo = 'mision';
  if found then raise exception 'RLS permite cambiar el juego a un usuario ajeno'; end if;
end;
$$;
reset role;

-- Cuenta del personal ficticia, creada solo dentro de esta prueba.
insert into auth.users (id) values ('00000000-0000-0000-0000-000000000002');
insert into public.personal_autorizado (usuario_id) values ('00000000-0000-0000-0000-000000000002');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
set local role authenticated;
do $$
begin
  if not private.es_personal_autorizado() then raise exception 'Personal no reconocido'; end if;
  if not exists (select 1 from public.configuracion_experiencia) then raise exception 'Personal sin lectura'; end if;
  update public.configuracion_experiencia set juego_activo = 'mision';
  if not found then raise exception 'Personal sin permiso para cambiar juego'; end if;
  begin
    insert into public.personal_autorizado (usuario_id) values ('00000000-0000-0000-0000-000000000001');
    raise exception 'Personal puede otorgar membresía';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
rollback;
select 'Verificación de permisos completada' as resultado;

