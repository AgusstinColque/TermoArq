import assert from 'node:assert/strict'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
assert.ok(url && key, 'Falta configurar las variables públicas de Supabase.')
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
const llamar = async (funcion, cuerpo = {}) => {
  const respuesta = await fetch(`${url}/rest/v1/rpc/${funcion}`, {
    method: 'POST', headers, body: JSON.stringify(cuerpo), signal: AbortSignal.timeout(10000),
  })
  return { ok: respuesta.ok, datos: await respuesta.json() }
}

const antes = await llamar('consultar_juego_rapido')
assert.equal(antes.ok, true, 'La consulta pública del juego debe estar disponible.')
assert.ok(['ruleta', 'mision', null].includes(antes.datos?.juego_activo))
const invalido = await llamar('cambiar_juego_rapido', { p_juego_anterior: 'inventado' })
assert.equal(invalido.ok, false, 'Un juego inválido no debe modificar la configuración.')
assert.match(invalido.datos?.message ?? '', /JUEGO_INVALIDO/)
const despues = await llamar('consultar_juego_rapido')
assert.equal(despues.ok, true)
assert.equal(despues.datos?.juego_activo, antes.datos.juego_activo)
console.log(`Supabase remoto: lectura pública y validación del cambio instaladas; juego activo: ${despues.datos.juego_activo ?? 'ninguno'}.`)
