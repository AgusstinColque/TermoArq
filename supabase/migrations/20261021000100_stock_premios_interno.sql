-- Control interno compartido. El stock no condiciona premios ni juegos.
begin;
create table private.stock_premios (
  indice smallint primary key check (indice between 0 and 5),
  nombre text not null,
  cantidad integer not null default 0 check (cantidad between 0 and 1000000),
  revision bigint not null default 0,
  actualizado_en timestamptz not null default now()
);
insert into private.stock_premios(indice,nombre) values
 (0,'Voucher de descuento'),(1,'Bolsa sorpresa'),(2,'Llavero'),
 (3,'Soporte para celular'),(4,'Gorra'),(5,'Mate');
-- Registro técnico de idempotencia; no hay estados de retiro o entrega.
create table private.resultados_premios (
  solicitud_id uuid primary key references public.participaciones(solicitud_id),
  indice smallint not null references private.stock_premios(indice),
  creado_en timestamptz not null default now()
);
alter table private.stock_premios enable row level security;
alter table private.resultados_premios enable row level security;
revoke all on private.stock_premios, private.resultados_premios from public, anon, authenticated;

create function public.admin_stock_premios()
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if not private.es_personal_autorizado() then raise exception using errcode='42501', message='PERSONAL_REQUERIDO'; end if;
  return (select jsonb_agg(to_jsonb(s) order by indice) from private.stock_premios s);
end; $$;

create function public.admin_actualizar_stock(p_indice integer, p_cantidad integer, p_revision bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_stock private.stock_premios%rowtype;
begin
  if not private.es_personal_autorizado() then raise exception using errcode='42501', message='PERSONAL_REQUERIDO'; end if;
  if p_indice is null or p_indice not between 0 and 5 or p_cantidad is null or p_cantidad not between 0 and 1000000 or p_revision is null then
    raise exception using errcode='22023', message='STOCK_INVALIDO';
  end if;
  update private.stock_premios set cantidad=p_cantidad, revision=revision+1, actualizado_en=now()
  where indice=p_indice and revision=p_revision returning * into v_stock;
  if not found then raise exception 'STOCK_CAMBIO'; end if;
  return to_jsonb(v_stock);
end; $$;

create function public.obtener_premio(p_solicitud uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_indice smallint;
begin
  if p_solicitud is null then raise exception 'SOLICITUD_INVALIDA'; end if;
  -- Bloqueo por participación: un reintento devuelve exactamente el mismo premio.
  perform 1 from public.participaciones where solicitud_id=p_solicitud for update;
  if not found then raise exception 'PARTICIPACION_REQUERIDA'; end if;
  select indice into v_indice from private.resultados_premios where solicitud_id=p_solicitud;
  if found then return jsonb_build_object('indice',v_indice); end if;
  -- Todas las opciones mantienen su probabilidad, incluso con stock cero.
  v_indice := floor(random()*6)::smallint;
  update private.stock_premios set cantidad=greatest(cantidad-1,0), revision=revision+1, actualizado_en=now() where indice=v_indice;
  insert into private.resultados_premios(solicitud_id,indice) values(p_solicitud,v_indice);
  return jsonb_build_object('indice',v_indice);
end; $$;
revoke all on function public.admin_stock_premios(), public.admin_actualizar_stock(integer,integer,bigint), public.obtener_premio(uuid) from public, anon, authenticated;
grant execute on function public.admin_stock_premios(), public.admin_actualizar_stock(integer,integer,bigint) to authenticated;
grant execute on function public.obtener_premio(uuid) to anon, authenticated;
notify pgrst,'reload schema';
commit;
