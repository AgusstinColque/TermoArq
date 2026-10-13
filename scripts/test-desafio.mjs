import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { preguntasDesbloqueo } from '../src/data/desafioInicial.ts'

assert.deepEqual(preguntasDesbloqueo.map(pregunta => pregunta.id), Array.from({ length: 15 }, (_, indice) => indice + 1))
for (const pregunta of preguntasDesbloqueo) {
  assert.equal(pregunta.opciones.length, 3)
  assert.deepEqual(pregunta.opciones.map(opcion => opcion.id), ['a', 'b', 'c'])
  assert.ok(pregunta.opciones.some(opcion => opcion.id === pregunta.correcta))
  assert.ok(pregunta.pregunta && pregunta.explicacion)
}

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
  '20261012000300_trivia_desbloqueo.sql',
]) await db.exec(await fs.readFile(`supabase/migrations/${file}`, 'utf8'))

const id = numero => `20000000-0000-4000-8000-${String(numero).padStart(12, '0')}`
const asignar = async numero => (await db.query('select public.asignar_desafio($1::uuid) as asignacion', [id(numero)])).rows[0].asignacion.pregunta_id
await db.exec('set role anon')
await assert.rejects(db.query('select * from private.asignaciones_desbloqueo'), /permission denied/)
const primerCiclo = []
for (let indice = 1; indice <= 8; indice++) primerCiclo.push(await asignar(indice))
await db.exec("reset role; update public.configuracion_experiencia set juego_activo = 'mision'; set role anon;")
for (let indice = 9; indice <= 15; indice++) primerCiclo.push(await asignar(indice))
assert.equal(new Set(primerCiclo).size, 15)
assert.equal(await asignar(1), primerCiclo[0], 'el reintento conserva la pregunta')
const segundoCiclo = []
for (let indice = 16; indice <= 30; indice++) segundoCiclo.push(await asignar(indice))
assert.equal(new Set(segundoCiclo).size, 15)
assert.notEqual(segundoCiclo[0], primerCiclo[14], 'la nueva vuelta no empieza con la última pregunta anterior')
await db.exec('reset role; update public.configuracion_experiencia set registro_habilitado = false; set role anon;')
await assert.rejects(asignar(31), /EXPERIENCIA_PAUSADA/)
assert.equal(await asignar(1), primerCiclo[0], 'una asignación anterior sigue disponible durante la pausa')
await db.exec('reset role')
const ciclos = (await db.query('select ciclo, count(*)::int as total from private.asignaciones_desbloqueo group by ciclo order by ciclo')).rows
assert.deepEqual(ciclos, [{ ciclo: 1, total: 15 }, { ciclo: 2, total: 15 }])
await db.close()
console.log('Trivia: 15 preguntas completas; reparto anónimo sin repetición, compartido entre juegos, idempotente y con pausa.')
