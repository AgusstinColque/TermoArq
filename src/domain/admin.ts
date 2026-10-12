export interface FiltrosContactos {
  busqueda: string
  desde: string
  hasta: string
  servicio: string
  proyecto: string
  etapa: string
}

export const filtrosIniciales: FiltrosContactos = { busqueda: '', desde: '', hasta: '', servicio: '', proyecto: '', etapa: '' }

export interface VisitaAdmin {
  id: string
  contacto_id: string
  nombre: string
  apellido: string
  correo: string | null
  telefono: string | null
  iniciada_en: string
  juego: 'ruleta' | 'mision'
  respuestas: Record<string, { pregunta: string; respuesta: string }>
}

export interface PaginaContactos {
  filas: VisitaAdmin[]
  total: number
  corte: string
}

export interface ConfiguracionAdmin {
  juego_activo: 'ruleta' | 'mision' | null
  registro_habilitado: boolean
  modo_prueba: boolean
}

export function validarFiltros(filtros: FiltrosContactos): string | null {
  if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) return 'La fecha inicial debe ser anterior o igual a la fecha final.'
  return null
}

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'short', timeStyle: 'short',
})

export function fechaVisita(fecha: string): string { return formatoFecha.format(new Date(fecha)) }

/** Neutraliza fórmulas de planilla sin perder separadores, comillas o saltos de línea. */
export function celdaCsv(valor: string): string {
  const seguro = /^[\s\uFEFF]*[=+@-]/.test(valor) || /^[\t\r\n]/.test(valor) ? `'${valor}` : valor
  return `"${seguro.replace(/"/g, '""')}"`
}

export function generarCsv(visitas: VisitaAdmin[]): string {
  const encabezado = ['ID de visita', 'Fecha (Argentina)', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Servicio', 'Proyecto', 'Etapa', 'Juego']
  const filas = visitas.map(visita => [visita.id, fechaVisita(visita.iniciada_en), visita.nombre, visita.apellido,
    visita.correo ?? '', visita.telefono ?? '', visita.respuestas.servicio?.respuesta ?? '',
    visita.respuestas.proyecto?.respuesta ?? '', visita.respuestas.etapa?.respuesta ?? '', visita.juego])
  return '\uFEFF' + [encabezado, ...filas].map(fila => fila.map(celdaCsv).join(';')).join('\r\n')
}
