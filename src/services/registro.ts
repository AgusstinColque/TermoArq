import { obtenerClienteSupabase } from '../lib/supabase'
import { type DatosContacto } from '../domain/datosContacto'
import { type RespuestasProyecto } from '../domain/preguntasProyecto'

export function nuevaSolicitud(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6]! & 15) | 64
  bytes[8] = (bytes[8]! & 63) | 128
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export async function guardarRegistro(solicitud: string, datos: DatosContacto, respuestas: RespuestasProyecto): Promise<void> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 15000)
  try {
    const { data, error } = await obtenerClienteSupabase().rpc('registrar_visita', {
      p_solicitud: solicitud, p_datos: datos, p_respuestas: respuestas,
    }).abortSignal(controller.signal)
    if (error) {
      const mensaje = error.message ?? ''
      if (mensaje.includes('REGISTRO_PAUSADO')) throw new Error('El registro está pausado. Consultá con el equipo de Termoarq.')
      if (mensaje.includes('JUEGO_NO_DISPONIBLE')) throw new Error('El juego todavía no está disponible. Consultá con el equipo de Termoarq.')
      if (mensaje.includes('LIMITE_REGISTROS')) throw new Error('Hay muchas solicitudes. Esperá un momento y volvé a intentar.')
      if (mensaje.includes('RESPUESTAS_INVALIDAS')) throw new Error('Las opciones cambiaron. Consultá con el equipo antes de continuar.')
      if (error.code === 'PGRST202') throw new Error('El guardado todavía no está configurado. Consultá con el equipo de Termoarq.')
      throw new Error('No pudimos confirmar el guardado. Revisá la conexión y volvé a intentar.')
    }
    if (!data || data.solicitud_id !== solicitud || data.juego !== 'ruleta') {
      throw new Error('No pudimos confirmar el registro. Volvé a intentar.')
    }
  } finally {
    window.clearTimeout(timeout)
  }
}
