import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { preguntasProyecto } from '../src/data/preguntasProyecto.ts'

const db = new PGlite()
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
create schema auth; create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql as $$ select null::uuid $$;`)
for (const file of [
  '20261011000100_initial_schema.sql',
  '20261011000200_renombrar_esquema_espanol.sql',
  '20261011000300_registro_publico.sql',
  '20261012000100_panel_admin.sql',
  '20261012000200_habilitar_mision.sql',
]) await db.exec(await fs.readFile(`supabase/migrations/${file}`, 'utf8'))

const catalogo = (await db.query(`select q.codigo as pregunta, o.codigo as opcion
  from public.preguntas_comerciales q
  join public.opciones_comerciales o on o.pregunta_id = q.id
  where q.habilitada and o.habilitada`)).rows
const habilitadas = new Set(catalogo.map(({ pregunta, opcion }) => `${pregunta}:${opcion}`))
const base = Object.fromEntries(preguntasProyecto.map(pregunta => [pregunta.id, pregunta.opciones[0].valor]))
const datos = { nombre: 'Visita', apellido: 'Prueba', contacto: 'visita@example.com', consentimiento: true }
let numero = 0

for (const juego of ['ruleta', 'mision']) {
  await db.query('update public.configuracion_experiencia set juego_activo = $1', [juego])
  await db.exec('set role anon')
  for (const pregunta of preguntasProyecto) {
    for (const opcion of pregunta.opciones) {
      assert.ok(habilitadas.has(`${pregunta.id}:${opcion.valor}`), `Opción no disponible: ${pregunta.id}:${opcion.valor}`)
      const respuestas = { ...base, [pregunta.id]: opcion.valor }
      const solicitud = `30000000-0000-4000-8000-${String(++numero).padStart(12, '0')}`
      const { rows } = await db.query('select public.registrar_visita($1::uuid, $2::jsonb, $3::jsonb) as recibo', [
        solicitud, JSON.stringify(datos), JSON.stringify(respuestas),
      ])
      assert.equal(rows[0].recibo.juego, juego)
    }
  }
  await db.exec('reset role')
}
await db.close()
console.log(`${numero} selecciones públicas registradas correctamente con ruleta y misión.`)
