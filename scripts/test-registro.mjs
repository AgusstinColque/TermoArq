import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const db = new PGlite()
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
create schema auth; create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql as $$ select null::uuid $$;`)
for (const path of ['20261011000100_initial_schema.sql', '20261011000200_renombrar_esquema_espanol.sql', '20261011000300_registro_publico.sql']) {
  await db.exec(await fs.readFile(`supabase/migrations/${path}`, 'utf8'))
}
const datos = { nombre: 'Ana', apellido: 'Prueba', contacto: 'ana@example.com', consentimiento: true }
const respuestas = { servicio: 'climatizacion', proyecto: 'vivienda', etapa: 'planificando' }
const solicitud = '10000000-0000-4000-8000-000000000001'
const registrar = (id, contacto = datos, seleccion = respuestas) => db.query('select public.registrar_visita($1::uuid, $2::jsonb, $3::jsonb) as recibo', [id, JSON.stringify(contacto), JSON.stringify(seleccion)])
const cantidades = async () => (await db.query(`select (select count(*)::int from contactos) as contactos, (select count(*)::int from participaciones) as participaciones, (select count(*)::int from respuestas_comerciales) as respuestas`)).rows[0]
await db.exec('set role anon')
await assert.rejects(db.query('select * from contactos'), /permission denied/)
await assert.rejects(db.query("insert into contactos(nombre, apellido) values ('X','Y')"), /permission denied/)
const primero = (await registrar(solicitud)).rows[0].recibo
assert.equal(primero.juego, 'ruleta')
assert.deepEqual((await registrar(solicitud)).rows[0].recibo, primero)
await assert.rejects(registrar(solicitud, { ...datos, nombre: 'Otro' }), /SOLICITUD_CONFLICTO/)
await assert.rejects(registrar('10000000-0000-4000-8000-000000000002', { ...datos, consentimiento: false }), /DATOS_INVALIDOS/)
await assert.rejects(registrar('10000000-0000-4000-8000-000000000003', datos, { ...respuestas, etapa: 'inventada' }), /RESPUESTAS_INVALIDAS/)
await assert.rejects(registrar('10000000-0000-4000-8000-000000000004', { ...datos, contacto: 'email-mal' }), /CONTACTO_INVALIDO/)
await db.exec('reset role')
assert.deepEqual(await cantidades(), { contactos: 1, participaciones: 1, respuestas: 3 })
const visita = (await db.query('select respuesta_desbloqueo, huella_solicitud from participaciones')).rows[0]
assert.equal(visita.respuesta_desbloqueo, null)
assert.equal((await db.query('select version_terminos from contactos')).rows[0].version_terminos, 'borrador-1')
await db.exec("update configuracion_experiencia set registro_habilitado = false; set role anon;")
await assert.rejects(registrar('10000000-0000-4000-8000-000000000005'), /REGISTRO_PAUSADO/)
assert.deepEqual((await registrar(solicitud)).rows[0].recibo, primero)
await db.exec('reset role; update configuracion_experiencia set registro_habilitado = true;')
// Forzar un fallo en el último tramo: no debe quedar un contacto o participación parcial.
await db.exec(`create function private.fallo_prueba() returns trigger language plpgsql as $$ begin raise exception 'FALLO_FORZADO'; end $$;
create trigger fallo before insert on respuestas_comerciales for each row execute function private.fallo_prueba(); set role anon;`)
await assert.rejects(registrar('10000000-0000-4000-8000-000000000006'), /FALLO_FORZADO/)
await db.exec('reset role; drop trigger fallo on respuestas_comerciales;')
assert.deepEqual(await cantidades(), { contactos: 1, participaciones: 1, respuestas: 3 })
await db.exec('update private.limite_registros set cantidad = 120, ventana = now(); set role anon;')
await assert.rejects(registrar('10000000-0000-4000-8000-000000000007'), /LIMITE_REGISTROS/)
await db.exec('reset role; update private.limite_registros set cantidad = 0; set role anon;')
await registrar('10000000-0000-4000-8000-000000000008', { ...datos, contacto: '+54 387 123-4567' })
await db.exec('reset role')
assert.deepEqual(await cantidades(), { contactos: 2, participaciones: 2, respuestas: 6 })
assert.equal((await db.query('select telefono from contactos where telefono is not null')).rows[0].telefono, '+543871234567')
await db.close()
console.log('PostgreSQL: permisos, validación, guardado atómico, rollback, idempotencia, pausa y límite correctos.')
