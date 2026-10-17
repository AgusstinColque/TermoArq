import { consultarJuegoRapido } from './juegoRapido'
import { buscarPreguntaDesbloqueo, type PreguntaDesbloqueo } from '../data/desafioInicial'
import { obtenerClienteSupabase } from '../lib/supabase'

export async function asignarPreguntaDesbloqueo(solicitud: string): Promise<PreguntaDesbloqueo> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 10000)
  try {
    const { data, error } = await obtenerClienteSupabase()
      .rpc('asignar_desafio', { p_solicitud: solicitud })
      .abortSignal(controller.signal)
    if (error) {
      if (error.code === 'PGRST202') throw new Error('La trivia todavía no está configurada. Consultá con el equipo de Termoarq.')
      if (error.message?.includes('EXPERIENCIA_PAUSADA')) throw new Error('La experiencia está pausada. Consultá con el equipo de Termoarq.')
      throw new Error('No pudimos cargar tu pregunta. Revisá la conexión y volvé a intentar.')
    }
    const pregunta = Number.isInteger(data?.pregunta_id)
      ? buscarPreguntaDesbloqueo(data.pregunta_id)
      : undefined
    if (!pregunta) throw new Error('No pudimos confirmar tu pregunta. Consultá con el equipo de Termoarq.')
    return pregunta
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('La conexión tardó demasiado. Volvé a intentar.')
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

/** Identidad estable para reintentar la segunda asignación sin volver a sortearla. */
async function solicitudSegunda(solicitud: string, intento: number): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('termoarq:segunda:' + solicitud + ':' + intento)))
  const bytes = digest.slice(0, 16)
  bytes[6] = (bytes[6]! & 15) | 80
  bytes[8] = (bytes[8]! & 63) | 128
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20)
}
export async function asignarDesafiosDesbloqueo(solicitud: string, juegoConfirmado?: 'ruleta' | 'mision'): Promise<PreguntaDesbloqueo[]> {
  const juego = juegoConfirmado ?? await consultarJuegoRapido()
  if (!juego) throw new Error('Los juegos están desactivados. Consultá con el equipo de Termoarq.')
  const primera = await asignarPreguntaDesbloqueo(solicitud)
  if (juego === 'mision') return [primera]
  // El servidor sigue repartiendo el mazo compartido. Si otros puestos agotaron
  // una vuelta entre ambas llamadas, evitamos repetir la primera en esta pareja.
  for (let intento = 0; intento < 16; intento++) {
    const segunda = await asignarPreguntaDesbloqueo(await solicitudSegunda(solicitud, intento))
    if (segunda.id !== primera.id) return [primera, segunda]
  }
  throw new Error('No pudimos preparar dos preguntas diferentes. Volvé a intentar.')
}
