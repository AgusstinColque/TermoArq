-- El botón de bienvenida alterna únicamente el juego. El panel conserva sus permisos.
begin;

create function public.consultar_juego_rapido()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('juego_activo', juego_activo)
  from public.configuracion_experiencia where id = true;
$$;
revoke all on function public.consultar_juego_rapido() from public, anon, authenticated;
grant execute on function public.consultar_juego_rapido() to anon, authenticated;

create function public.cambiar_juego_rapido(p_juego_anterior text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_juego text;
begin
  if p_juego_anterior is null or p_juego_anterior not in ('ruleta', 'mision') then
    raise exception using errcode = '22023', message = 'JUEGO_INVALIDO';
  end if;
  select juego_activo into v_juego
  from public.configuracion_experiencia where id = true for update;
  if not found then raise exception 'CONFIGURACION_INCOMPLETA'; end if;
  if v_juego is distinct from p_juego_anterior then raise exception 'CONFIGURACION_CAMBIO'; end if;
  update public.configuracion_experiencia
  set juego_activo = case v_juego when 'ruleta' then 'mision' else 'ruleta' end
  where id = true returning juego_activo into v_juego;
  return jsonb_build_object('juego_activo', v_juego);
end;
$$;
revoke all on function public.cambiar_juego_rapido(text) from public, anon, authenticated;
grant execute on function public.cambiar_juego_rapido(text) to anon, authenticated;

notify pgrst, 'reload schema';
commit;
