import assert from 'node:assert/strict'
import { celdaCsv, generarCsv, validarFiltros, filtrosIniciales } from '../src/domain/admin.ts'
for (const formula of ['=SUM(A1)', '+543871234567', '-1', '@SUM(A1)', '  =1', '\t=1']) assert.ok(celdaCsv(formula).startsWith('"\''))
assert.equal(celdaCsv('Empresa "Sur"; Norte'), '"Empresa ""Sur""; Norte"')
assert.equal(validarFiltros({ ...filtrosIniciales, desde: '2026-10-12', hasta: '2026-10-11' }) !== null, true)
const csv = generarCsv([{ id: '1', contacto_id: 'c1', nombre: '=1', apellido: 'Prueba', telefono: '+543871234567', correo: null, iniciada_en: '2026-10-11T02:30:00Z', juego: 'ruleta', respuestas: { servicio: { pregunta: 'Servicio', respuesta: 'Clima; "Sur"' } } }])
assert.ok(csv.startsWith('\uFEFF'))
assert.ok(csv.includes('10/10/26'))
assert.ok(csv.includes('Clima; ""Sur""'))
assert.ok(csv.includes('"\'=1"'))
console.log('Admin: CSV, caracteres especiales, fórmulas, fechas y validación de filtros correctos.')
