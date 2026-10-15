import { obtenerClienteSupabase } from '../lib/supabase'

export type JuegoRapido = 'ruleta' | 'mision' | null

function validarRespuesta(data: unknown): JuegoRapido {
  if (!data || typeof data !== 'object' || !('juego_activo' in data)) throw new Error('No pudimos consultar el juego activo.')
  const juego = data.juego_activo
  if (juego !== 'ruleta' && juego !== 'mision' && juego !== null) throw new Error('El juego activo no es válido.')
  return juego
}

export async function consultarJuegoRapido(): Promise<JuegoRapido> {
  const { data, error } = await obtenerClienteSupabase().rpc('consultar_juego_rapido')
  if (error) throw new Error('No pudimos consultar el juego activo. Revisá la conexión y volvé a intentar.')
  return validarRespuesta(data)
}

export async function cambiarJuegoRapido(anterior: Exclude<JuegoRapido, null>): Promise<JuegoRapido> {
  const { data, error } = await obtenerClienteSupabase().rpc('cambiar_juego_rapido', { p_juego_anterior: anterior })
  if (error) {
    if (error.message?.includes('CONFIGURACION_CAMBIO')) throw new Error('El juego cambió desde otro dispositivo. Revisá el estado actualizado.')
    throw new Error('No pudimos cambiar el juego. Revisá la conexión y volvé a intentar.')
  }
  return validarRespuesta(data)
}
