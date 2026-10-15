import assert from 'node:assert/strict'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
assert.ok(url && key, 'Falta configurar las variables públicas de Supabase.')

const response = await fetch(`${url}/rest/v1/rpc/registrar_visita`, {
  method: 'POST',
  headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    p_solicitud: '00000000-0000-4000-8000-000000000099',
    p_datos: { nombre: 'Prueba', apellido: 'Sin registro', correo: '', telefono: '', consentimiento: true },
    p_respuestas: {},
  }),
  signal: AbortSignal.timeout(10000),
})
const data = await response.json()
assert.equal(response.ok, false, 'Una solicitud inválida no debe registrar una visita.')
assert.match(data.message ?? '', /CONTACTO_INVALIDO/, 'La función remota debe aceptar el formato de correo y teléfono separados.')
console.log('Supabase remoto: migración de contacto separado instalada; solicitud inválida rechazada sin guardar.')
