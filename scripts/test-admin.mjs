import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const db = new PGlite()
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;`)
  for (const archivo of (await fs.readdir('supabase/migrations')).filter(nombre => nombre.endsWith('.sql')).sort()) await db.exec(await fs.readFile(`supabase/migrations/${archivo}`, 'utf8'))
  await db.exec(await fs.readFile('supabase/tests/initial_permissions.sql', 'utf8'))
  const consulta = (filtros = {}) => db.query('select public.admin_listar_visitas($1,$2,$3,$4,$5,$6,$7,$8,$9) as resultado', [filtros.busqueda ?? '', filtros.desde ?? null, filtros.hasta ?? null, filtros.servicio ?? null, filtros.proyecto ?? null, filtros.etapa ?? null, filtros.pagina ?? 1, filtros.tamano ?? 25, filtros.corte ?? null])
  const configurar = (juego, registro, anterior = 'ruleta', registroAnterior = true) => db.query('select public.admin_guardar_configuracion($1,$2,$3,$4) as resultado', [juego, registro, anterior, registroAnterior])
  await db.exec('set role anon')
  await assert.rejects(consulta(), /permission denied/)
  await assert.rejects(configurar('ruleta', false), /permission denied/)
  await db.exec("reset role; insert into auth.users values ('00000000-0000-0000-0000-000000000011'), ('00000000-0000-0000-0000-000000000012'); insert into personal_autorizado(usuario_id) values ('00000000-0000-0000-0000-000000000011'); set role authenticated; select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000012', false);")
  await assert.rejects(consulta(), /PERSONAL_REQUERIDO/)
  await assert.rejects(configurar('ruleta', false), /PERSONAL_REQUERIDO/)
  assert.equal((await db.query('select * from contactos')).rows.length, 0)
  const datos = { nombre: 'Ana', apellido: 'Prueba', contacto: 'ana@example.com', consentimiento: true }
  const respuestas = { servicio: 'climatizacion', proyecto: 'vivienda', etapa: 'planificando' }
  await db.exec('reset role')
  for (const [indice, contacto] of [datos, { ...datos, nombre: 'Bruno', contacto: '+54 387 123-4567' }].entries()) await db.query('select registrar_visita($1,$2,$3)', [`10000000-0000-4000-8000-00000000000${indice + 1}`, JSON.stringify(contacto), JSON.stringify(respuestas)])
  await db.exec("update participaciones set iniciada_en = case solicitud_id when '10000000-0000-4000-8000-000000000001' then '2026-10-11T02:30:00Z'::timestamptz else '2026-10-11T03:30:00Z'::timestamptz end; set role authenticated; select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000011', false);")
  const primero = (await consulta({ tamano: 1 })).rows[0].resultado
  assert.equal(primero.total, 2)
  assert.equal(primero.filas.length, 1)
  assert.equal(primero.filas[0].nombre, 'Bruno')
  assert.equal(primero.filas[0].respuestas.servicio.respuesta, 'Climatización')
  assert.equal((await consulta({ pagina: 2, tamano: 1, corte: primero.corte })).rows[0].resultado.filas[0].nombre, 'Ana')
  assert.equal((await consulta({ busqueda: 'ana@example' })).rows[0].resultado.total, 1)
  assert.equal((await consulta({ busqueda: '%' })).rows[0].resultado.total, 0)
  assert.equal((await consulta({ desde: '2026-10-11', hasta: '2026-10-11' })).rows[0].resultado.total, 1)
  assert.equal((await consulta({ servicio: 'climatizacion', proyecto: 'vivienda', etapa: 'planificando' })).rows[0].resultado.total, 2)
  assert.equal((await consulta({ servicio: 'ventilacion' })).rows[0].resultado.total, 0)
  await assert.rejects(consulta({ pagina: 0 }), /FILTROS_INVALIDOS/)
  await assert.rejects(consulta({ tamano: 201 }), /FILTROS_INVALIDOS/)
  await assert.rejects(consulta({ desde: '2026-10-12', hasta: '2026-10-11' }), /FILTROS_INVALIDOS/)
  await assert.rejects(configurar('mision', true), /JUEGO_NO_DISPONIBLE/)
  const configuracion = (await configurar('ruleta', false)).rows[0].resultado
  assert.equal(configuracion.registro_habilitado, false)
  assert.equal(configuracion.modo_prueba, true)
  await assert.rejects(configurar('ruleta', true), /CONFIGURACION_CAMBIO/)
  await configurar('ruleta', true, 'ruleta', false)
  await assert.rejects(db.exec('update configuracion_experiencia set modo_prueba = false'), /permission denied/)
  await assert.rejects(db.exec("insert into personal_autorizado(usuario_id) values ('00000000-0000-0000-0000-000000000012')"), /permission denied/)
  await db.exec('reset role; delete from personal_autorizado; set role authenticated;')
  await assert.rejects(consulta(), /PERSONAL_REQUERIDO/)
  console.log('Admin: permisos, revocación, filtros, zona horaria, paginación y configuración concurrente correctos.')
} finally { await db.close() }
