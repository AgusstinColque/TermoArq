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
