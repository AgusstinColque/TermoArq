import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const db = new PGlite()
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql as $$ select null::uuid $$;`)
  for (const archivo of (await fs.readdir('supabase/migrations')).filter(nombre => nombre.endsWith('.sql')).sort()) {
    await db.exec(await fs.readFile(`supabase/migrations/${archivo}`, 'utf8'))
  }
  await db.exec('set role anon')
  const consultar = async () => (await db.query('select public.consultar_juego_rapido() as estado')).rows[0].estado
  const cambiar = async anterior => (await db.query('select public.cambiar_juego_rapido($1) as estado', [anterior])).rows[0].estado
  assert.deepEqual(await consultar(), { juego_activo: 'ruleta' })
  assert.deepEqual(await cambiar('ruleta'), { juego_activo: 'mision' })
  assert.deepEqual(await consultar(), { juego_activo: 'mision' })
  await assert.rejects(cambiar('ruleta'), /CONFIGURACION_CAMBIO/)
  await assert.rejects(cambiar('otro'), /JUEGO_INVALIDO/)
  await assert.rejects(db.query('select public.admin_guardar_configuracion($1,$2,$3,$4)', ['ruleta', false, 'mision', true]), /permission denied/)
  await assert.rejects(db.exec('update public.configuracion_experiencia set registro_habilitado = false'), /permission denied/)
  assert.deepEqual(await cambiar('mision'), { juego_activo: 'ruleta' })
  await db.exec('reset role; update public.configuracion_experiencia set juego_activo = null; set role anon')
  await assert.rejects(cambiar('ruleta'), /CONFIGURACION_CAMBIO/)
  assert.deepEqual(await consultar(), { juego_activo: null })
  console.log('Cambio público: lectura, alternancia, concurrencia y permisos limitados correctos.')
} finally { await db.close() }
