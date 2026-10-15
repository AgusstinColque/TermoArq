import assert from 'node:assert/strict'
import { validarDatos } from '../src/domain/datosContacto.ts'

const base = { nombre: 'Ana', apellido: 'Prueba', consentimiento: true }
const validar = (correo, telefono) => validarDatos({ ...base, correo, telefono })

assert.deepEqual(validar('ana@example.com', ''), {})
assert.deepEqual(validar('', '+54 11 1234-5678'), {})
assert.deepEqual(validar('ana@example.com', '+54 11 1234-5678'), {})
assert.ok(validar('', '').correo)
assert.ok(validar('correo-invalido', '+54 11 1234-5678').correo)
assert.ok(validar('ana@example.com', '123').telefono)
assert.ok(validar('ana@example.com', 'abc').telefono)
assert.ok(validar('ana@example.com', '1'.repeat(16)).telefono)
console.log('Formulario: correo solo, teléfono solo, ambos y errores de formato correctos.')
