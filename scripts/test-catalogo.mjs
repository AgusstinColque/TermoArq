import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { preguntasProyecto } from '../src/data/preguntasProyecto.ts'
import { preguntasProyectoAdmin } from '../src/data/preguntasProyectoAdmin.ts'
const db = new PGlite()
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql as $$ select null::uuid $$;`)
  const migration = '20261020000100_agregar_servicio_construccion.sql'
  const files = (await fs.readdir('supabase/migrations')).filter(f => f.endsWith('.sql')).sort()
  for (const f of files.filter(f => f !== migration)) await db.exec(await fs.readFile('supabase/migrations/' + f, 'utf8'))
  const before = (await db.query('select id, pregunta_id, codigo, texto, posicion, habilitada from opciones_comerciales order by id')).rows
  const sql = await fs.readFile('supabase/migrations/' + migration, 'utf8')
  await db.exec(sql)
  await db.exec(sql)
  const after = (await db.query("select id, pregunta_id, codigo, texto, posicion, habilitada from opciones_comerciales where codigo <> 'construccion' order by id")).rows
  assert.deepEqual(after, before, 'Las opciones anteriores se conservan intactas')
  for (const q of preguntasProyecto) {
    const active = (await db.query('select o.codigo, o.texto from opciones_comerciales o join preguntas_comerciales q on q.id=o.pregunta_id where q.codigo=$1 and o.habilitada order by o.posicion', [q.id])).rows
    assert.deepEqual(active, q.opciones.map(o => ({ codigo: o.valor, texto: o.texto })))
  }
  assert.ok(preguntasProyectoAdmin.find(q => q.id === 'servicio').opciones.some(o => o.valor === 'construccion'))
  await db.exec('set role anon')
  let n = 0
  for (const servicio of preguntasProyecto[0].opciones) for (const proyecto of preguntasProyecto[1].opciones) for (const etapa of preguntasProyecto[2].opciones) {
    const id = '40000000-0000-4000-8000-' + String(++n).padStart(12, '0')
    const params = [id, JSON.stringify({ nombre: 'Prueba', apellido: 'Local', correo: 'local@example.com', telefono: '+543815551234', consentimiento: true }), JSON.stringify({ servicio: servicio.valor, proyecto: proyecto.valor, etapa: etapa.valor })]
    const query = 'select registrar_visita($1::uuid,$2::jsonb,$3::jsonb) as recibo'
    const first = (await db.query(query, params)).rows[0].recibo
    assert.deepEqual((await db.query(query, params)).rows[0].recibo, first)
  }
  await assert.rejects(db.query('select registrar_visita($1::uuid,$2::jsonb,$3::jsonb)', ['40000000-0000-4000-8000-000000000099', JSON.stringify({ nombre: 'Prueba', apellido: 'Local', correo: 'local@example.com', telefono: '+543815551234', consentimiento: true }), JSON.stringify({ servicio: 'inventado', proyecto: 'vivienda', etapa: 'proyecto' })]), /RESPUESTAS_INVALIDAS/)
  await db.exec('reset role')
  const saved = (await db.query("select count(*)::int as n from respuestas_comerciales r join opciones_comerciales o on o.id=r.opcion_id where o.codigo='construccion'")).rows[0].n
  assert.equal(saved, 12)
  assert.equal(n, 60)
  console.log('Catálogo: 60 combinaciones guardadas, 12 de Construcción, reintentos idempotentes, validación, filtros admin y migración repetible sin alterar opciones anteriores.')
} finally { await db.close() }
