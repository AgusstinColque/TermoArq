import ExcelJS from 'exceljs'
import { preguntasProyecto } from '../data/preguntasProyecto.ts'
import { fechaVisita, type FiltrosContactos, type VisitaAdmin } from '../domain/admin.ts'

/** Excel guarda fechas sin zona horaria: representamos la hora civil de Argentina. */
function fechaArgentina(valor: string): Date {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(valor))
  const parte = (tipo: string) => Number(partes.find(p => p.type === tipo)?.value)
  return new Date(Date.UTC(parte('year'), parte('month') - 1, parte('day'), parte('hour'), parte('minute'), parte('second')))
}

export async function generarExcelContactos(visitas: VisitaAdmin[], filtros: FiltrosContactos, generadoEn = new Date()): Promise<Uint8Array<ArrayBuffer>> {
  const libro = new ExcelJS.Workbook()
  libro.creator = 'TermoArq'; libro.created = generadoEn
  const hoja = libro.addWorksheet('Contactos del stand', {
    views: [{ state: 'frozen', ySplit: 6, showGridLines: false }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '6:6' },
  })
  const titulos = ['Fecha y hora (Argentina)', 'Nombre', 'Apellido', 'Teléfono', 'Correo', 'Servicio', 'Proyecto', 'Etapa', 'Juego', 'ID de visita']
  const anchos = [25, 24, 26, 24, 36, 32, 36, 36, 20, 38]
  hoja.columns = anchos.map(width => ({ width }))
  const principal = 'FF164863', tenue = 'FFEDF4F7', texto = 'FF243944'
  for (const [numero, valor] of [
    [1, 'TERMOARQ · Contactos del stand'],
    [2, `${visitas.length.toLocaleString('es-AR')} visitas · Exportado el ${fechaVisita(generadoEn.toISOString())} (Argentina)`],
    [3, descripcionFiltros(filtros)],
    [4, 'Cada fila corresponde a una visita. Las respuestas conservan el texto registrado.'],
  ] as const) {
    hoja.mergeCells(numero, 1, numero, 10)
    const celda = hoja.getCell(numero, 1)
    celda.value = valor
    celda.font = { name: 'Arial', size: numero === 1 ? 20 : 11, bold: numero === 1, color: { argb: numero === 1 ? 'FFFFFFFF' : texto } }
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: numero === 1 ? principal : tenue } }
    celda.alignment = { vertical: 'middle', wrapText: true, indent: 1 }
    hoja.getRow(numero).height = numero === 1 ? 42 : numero === 3 ? 36 : 28
  }
  hoja.getRow(5).height = 10
  hoja.addTable({ name: 'VisitasTermoarq', ref: 'A6', headerRow: true, totalsRow: false,
    style: { theme: 'TableStyleMedium2', showRowStripes: true },
    columns: titulos.map(name => ({ name, filterButton: true })),
    rows: visitas.map(visita => [fechaArgentina(visita.iniciada_en), visita.nombre, visita.apellido, visita.telefono ?? '', visita.correo ?? '', visita.respuestas.servicio?.respuesta ?? '', visita.respuestas.proyecto?.respuesta ?? '', visita.respuestas.etapa?.respuesta ?? '', visita.juego === 'ruleta' ? 'Ruleta' : 'Misión TermoArq', visita.id]),
  })
  hoja.getRow(6).height = 34
  hoja.getRow(6).eachCell(celda => {
    celda.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: principal } }
    celda.alignment = { vertical: 'middle', wrapText: true, indent: 1 }
  })
  visitas.forEach((_, indice) => {
    const fila = hoja.getRow(indice + 7)
    let lineas = 1
    fila.eachCell({ includeEmpty: true }, (celda, columna) => {
      const valor = typeof celda.value === 'string' ? celda.value : ''
      lineas = Math.max(lineas, ...valor.split(/\r?\n/).map(linea => Math.max(1, Math.ceil(linea.length / (anchos[columna - 1] - 3)))))
      celda.font = { name: 'Arial', size: 11, color: { argb: texto } }
      celda.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 }
      celda.numFmt = columna === 1 ? 'dd/mm/yyyy hh:mm' : '@'
      celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: indice % 2 ? tenue : 'FFFFFFFF' } }
      celda.border = { bottom: { style: 'hair', color: { argb: 'FFD7E3E9' } } }
    })
    fila.height = Math.min(409, Math.max(38, lineas * 17 + 12))
  })
  hoja.pageSetup.printArea = `A1:J${Math.max(6, visitas.length + 6)}`
  hoja.headerFooter.oddFooter = '&LTermoArq · Contactos del stand&R&P de &N'
  return new Uint8Array(await libro.xlsx.writeBuffer())
}

function descripcionFiltros(filtros: FiltrosContactos): string {
  const valores: string[] = []
  if (filtros.busqueda.trim()) valores.push(`Búsqueda: ${filtros.busqueda.trim()}`)
  if (filtros.desde) valores.push(`Desde: ${filtros.desde.split('-').reverse().join('/')}`)
  if (filtros.hasta) valores.push(`Hasta: ${filtros.hasta.split('-').reverse().join('/')}`)
  for (const pregunta of preguntasProyecto) {
    const valor = filtros[pregunta.id]
    if (valor) valores.push(`${pregunta.id === 'servicio' ? 'Servicio' : pregunta.id === 'proyecto' ? 'Proyecto' : 'Etapa'}: ${pregunta.opciones.find(opcion => opcion.valor === valor)?.texto ?? valor}`)
  }
  return valores.length ? `Filtros aplicados · ${valores.join(' · ')}` : 'Filtros aplicados · Todas las visitas'
}
