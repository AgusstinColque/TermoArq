import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

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

const respuestas = { servicio: 'climatizacion', proyecto: 'vivienda', etapa: 'planificando' }
const base = { nombre: 'Ana', apellido: 'Prueba', consentimiento: true }
const id = n => `40000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const registrar = (n, datos) => db.query(
  'select public.registrar_visita($1::uuid, $2::jsonb, $3::jsonb) as recibo',
  [id(n), JSON.stringify({ ...base, ...datos }), JSON.stringify(respuestas)],
)

await db.exec('set role anon')
const anterior = { contacto: 'anterior@example.com' }
const reciboAnterior = (await registrar(4, anterior)).rows[0].recibo
await db.exec('reset role')
await db.exec(await fs.readFile('supabase/migrations/20261015000100_contacto_separado.sql', 'utf8'))
await db.exec('set role anon')
assert.deepEqual((await registrar(4, anterior)).rows[0].recibo, reciboAnterior)
const ambos = { correo: 'ana@example.com', telefono: '+54 11 1234-5678' }
await registrar(1, ambos)
assert.equal((await registrar(1, ambos)).rows[0].recibo.solicitud_id, id(1))
await assert.rejects(registrar(1, { ...ambos, telefono: '+54 11 9999-9999' }), /SOLICITUD_CONFLICTO/)
await registrar(2, { correo: 'solo@example.com', telefono: '' })
await registrar(3, { correo: '', telefono: '11 1234-5678' })
await registrar(5, { contacto: '+54 11 2345-6789' })
for (const [n, datos] of [
  [6, { correo: '', telefono: '' }],
  [7, { correo: 'correo-malo', telefono: '11 1234-5678' }],
  [8, { correo: 'ana@example.com', telefono: '123' }],
]) await assert.rejects(registrar(n, datos), /CONTACTO_INVALIDO/)
await db.exec('reset role')
const { rows } = await db.query('select c.correo, c.telefono from public.contactos c join public.participaciones p on p.contacto_id = c.id order by p.solicitud_id')
assert.equal(rows.length, 5)
assert.deepEqual(rows.map(({ correo, telefono }) => [correo, telefono]), [
  ['ana@example.com', '+541112345678'],
  ['solo@example.com', null],
  [null, '1112345678'],
  ['anterior@example.com', null],
  [null, '+541123456789'],
])
await db.close()
console.log('Correo y teléfono separados: ambos, uno solo, formato anterior e idempotencia correctos.')
