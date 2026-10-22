import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const db = new PGlite()
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;`)
  for (const name of (await fs.readdir('supabase/migrations')).filter(f => f.endsWith('.sql')).sort()) await db.exec(await fs.readFile('supabase/migrations/' + name, 'utf8'))
  const id = n => '50000000-0000-4000-8000-' + String(n).padStart(12, '0')
  const award = async n => (await db.query('select obtener_premio($1::uuid) as p', [id(n)])).rows[0].p.indice
  const stock = async () => (await db.query('select admin_stock_premios() as s')).rows[0].s
  const update = async (i, q, revision) => (await db.query('select admin_actualizar_stock($1,$2,$3) as s',[i,q,revision])).rows[0].s
  await db.exec('set role anon')
  await assert.rejects(stock(), /permission denied/)
  await assert.rejects(update(0,10,0), /permission denied/)
  await assert.rejects(db.query('select * from private.stock_premios'), /permission denied/)
  await assert.rejects(award(999), /PARTICIPACION_REQUERIDA/)
  await db.exec(`reset role; insert into auth.users values ('${id(200)}'),('${id(201)}'); insert into personal_autorizado(usuario_id) values ('${id(200)}'); set role authenticated; select set_config('request.jwt.claim.sub','${id(201)}',false);`)
  await assert.rejects(stock(), /PERSONAL_REQUERIDO/)
  await assert.rejects(update(0,10,0), /PERSONAL_REQUERIDO/)
  await db.exec(`select set_config('request.jwt.claim.sub','${id(200)}',false)`)
  assert.deepEqual((await stock()).map(r=>r.cantidad),[0,0,0,0,0,0])
  for (const r of await stock()) await update(r.indice,3,r.revision)
  await assert.rejects(update(0,-1,1),/STOCK_INVALIDO/)
  await assert.rejects(update(0,1000001,1),/STOCK_INVALIDO/)
  const firstSnapshot = (await stock())[0]
  await update(0,4,firstSnapshot.revision)
  await assert.rejects(update(0,8,firstSnapshot.revision),/STOCK_CAMBIO/)
  await db.exec('reset role; select setseed(0.42);')
  const datos = {nombre:'Prueba',apellido:'Stock',correo:'stock@example.com',telefono:'+543815551234',consentimiento:true}
  const respuestas = {servicio:'construccion',proyecto:'vivienda',etapa:'proyecto'}
  for (let n=1;n<=90;n++) {
    if(n===46) await db.exec("update configuracion_experiencia set juego_activo='mision'")
    await db.query('select registrar_visita($1::uuid,$2::jsonb,$3::jsonb)',[id(n),JSON.stringify(datos),JSON.stringify(respuestas)])
  }
  await db.exec('set role anon')
  const counts = Array(6).fill(0)
  for(let n=1;n<=80;n++){const i=await award(n);assert.ok(i>=0&&i<6);counts[i]++;assert.equal(await award(n),i,'El reintento conserva premio')}
  assert.ok(counts.every(n=>n>4),'Todas las opciones siguen sorteándose después de agotarse')
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${id(200)}',false)`)
  let rows = await stock()
  assert.ok(rows.every(r=>r.cantidad===0),'Nunca hay stock negativo')
  await db.exec('reset role')
  assert.equal((await db.query('select count(*)::int as n from private.resultados_premios')).rows[0].n,80)
  await db.exec('set role authenticated')
  for(const r of rows) await update(r.indice,10,r.revision)
  rows = await stock()
  await db.exec('set role anon')
  await award(1)
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${id(200)}',false)`)
  assert.ok((await stock()).every(r=>r.cantidad===10),'Reintento tras reposición no descuenta de nuevo')
  await db.exec('set role anon')
  const double = await Promise.all(Array.from({length:10},()=>award(81)))
  assert.equal(new Set(double).size,1)
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${id(200)}',false)`)
  const after=await stock()
  assert.equal(after[double[0]].cantidad,9,'Una participación descuenta solo una vez')
  assert.equal(after.reduce((s,r)=>s+r.cantidad,0),59)
  await assert.rejects(update(double[0],50,rows[double[0]].revision),/STOCK_CAMBIO/,'Un descuento invalida una edición antigua')
  await db.exec('reset role')
  const juegos=(await db.query('select distinct p.juego from private.resultados_premios r join participaciones p on p.solicitud_id=r.solicitud_id')).rows
  assert.equal(juegos.length,2,'Ambos juegos comparten el mismo control')
  console.log('Stock: permisos, seis premios, cero sin bloqueo, descuento con piso cero, reposición, reintentos concurrentes, identidad estable, edición concurrente y ambos juegos correctos.')
} finally { await db.close() }
