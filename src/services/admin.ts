import { obtenerClienteSupabase } from '../lib/supabase'
import { type ConfiguracionAdmin, type FiltrosContactos, type PaginaContactos, type VisitaAdmin } from '../domain/admin'

function errorAdmin(error: { message?: string; code?: string }): Error {
  if (error.code === 'PGRST202') return new Error('Falta instalar la migración del panel en Supabase. Consultá con quien administra el proyecto.')
  if (error.message?.includes('CONFIGURACION_CAMBIO')) return new Error('La configuración cambió desde otro dispositivo. Actualizá antes de guardar.')
  if (error.message?.includes('JUEGO_NO_DISPONIBLE')) return new Error('Misión Termoarq todavía no está disponible. Elegí la ruleta.')
  if (error.code === '42501') return new Error('Tu cuenta no tiene acceso al panel. Consultá con el administrador.')
  return new Error('No pudimos completar la consulta. Revisá la conexión y volvé a intentar.')
}

export async function consultarAcceso() {
  const cliente = obtenerClienteSupabase()
  const { data: { user }, error } = await cliente.auth.getUser()
  if (error) throw new Error('No pudimos verificar la sesión. Volvé a ingresar o reintentá la conexión.')
  if (!user) return null
  const { data, error: permisoError } = await cliente.from('personal_autorizado').select('usuario_id').eq('usuario_id', user.id).maybeSingle()
  if (permisoError) throw errorAdmin(permisoError)
  return { usuario: user, autorizado: Boolean(data) }
}

export async function iniciarSesion(email: string, password: string): Promise<void> {
  const { error } = await obtenerClienteSupabase().auth.signInWithPassword({ email: email.trim(), password })
  if (error) {
    if (error.code === 'invalid_credentials') throw new Error('El email o la contraseña no son correctos.')
    if (error.code === 'email_not_confirmed') throw new Error('Confirmá tu email antes de ingresar.')
    throw new Error('No pudimos iniciar sesión. Revisá tus datos y la conexión e intentá de nuevo.')
  }
}

export async function cerrarSesion(): Promise<void> {
  const { error } = await obtenerClienteSupabase().auth.signOut({ scope: 'local' })
  if (error) throw new Error('No pudimos cerrar la sesión. Volvé a intentar.')
}

export async function listarContactos(filtros: FiltrosContactos, pagina = 1, tamano = 25, signal?: AbortSignal, corte?: string): Promise<PaginaContactos> {
  let consulta = obtenerClienteSupabase().rpc('admin_listar_visitas', {
    p_busqueda: filtros.busqueda.trim(), p_desde: filtros.desde || null, p_hasta: filtros.hasta || null,
    p_servicio: filtros.servicio || null, p_proyecto: filtros.proyecto || null, p_etapa: filtros.etapa || null,
    p_pagina: pagina, p_tamano: tamano, p_corte: corte ?? null,
  })
  if (signal) consulta = consulta.abortSignal(signal)
  const { data, error } = await consulta
  if (signal?.aborted) throw new DOMException('Exportación cancelada', 'AbortError')
  if (error) throw errorAdmin(error)
  if (!data || !Array.isArray(data.filas) || !Number.isSafeInteger(data.total) || typeof data.corte !== 'string') throw new Error('La respuesta del panel no es válida. Actualizá e intentá de nuevo.')
  return data as PaginaContactos
}

export async function exportarContactos(filtros: FiltrosContactos, signal: AbortSignal, onProgreso: (actual: number, total: number) => void): Promise<number> {
  const filas: VisitaAdmin[] = []
  let pagina = 1
  let corte: string | undefined
  let total = 0
  do {
    const resultado = await listarContactos(filtros, pagina, 200, signal, corte)
    corte = resultado.corte
    total = resultado.total
    filas.push(...resultado.filas)
    if (resultado.filas.length === 0 && filas.length < total) throw new Error('No se pudo completar la exportación. Volvé a intentar.')
    onProgreso(filas.length, total)
    pagina++
  } while (filas.length < total)
  if (signal.aborted) throw new DOMException('Exportación cancelada', 'AbortError')
  const { generarExcelContactos } = await import('./exportacionContactos')
  if (signal.aborted) throw new DOMException('Exportación cancelada', 'AbortError')
  const archivo = await generarExcelContactos(filas, filtros)
  if (signal.aborted) throw new DOMException('Exportación cancelada', 'AbortError')
  const url = URL.createObjectURL(new Blob([archivo], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `termoarq-contactos-${new Date().toISOString().slice(0, 10)}.xlsx`
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  return filas.length
}

export async function obtenerConfiguracion(signal?: AbortSignal): Promise<ConfiguracionAdmin> {
  let consulta = obtenerClienteSupabase().from('configuracion_experiencia').select('juego_activo,registro_habilitado,modo_prueba').eq('id', true)
  if (signal) consulta = consulta.abortSignal(signal)
  const { data, error } = await consulta.single()
  if (error) throw errorAdmin(error)
  return data as ConfiguracionAdmin
}

export async function guardarConfiguracion(nueva: ConfiguracionAdmin, anterior: ConfiguracionAdmin): Promise<ConfiguracionAdmin> {
  const { data, error } = await obtenerClienteSupabase().rpc('admin_guardar_configuracion', {
    p_juego: nueva.juego_activo, p_registro: nueva.registro_habilitado,
    p_juego_anterior: anterior.juego_activo, p_registro_anterior: anterior.registro_habilitado,
  })
  if (error) throw errorAdmin(error)
  if (!data) throw new Error('No pudimos confirmar los cambios. Actualizá la configuración.')
  return data as ConfiguracionAdmin
}

/** Supabase verifica la contraseña actual y cambia únicamente la cuenta conectada. */
export async function cambiarPassword(actual: string, nueva: string): Promise<void> {
  if (!actual || nueva.length < 12 || actual === nueva) throw new Error('Revisá la contraseña actual y elegí una nueva de al menos 12 caracteres.')
  const { error } = await obtenerClienteSupabase().auth.updateUser({ password: nueva, current_password: actual })
  if (!error) return
  if (error.code === 'invalid_credentials' || error.code === 'wrong_password') throw new Error('La contraseña actual no es correcta.')
  if (error.code === 'same_password') throw new Error('Elegí una contraseña diferente de la actual.')
  if (error.code === 'weak_password') throw new Error('La nueva contraseña no cumple los requisitos de seguridad. Elegí una más larga y difícil de adivinar.')
  if (error.code === 'reauthentication_needed' || error.code === 'reauthentication_not_valid' || error.code === 'session_not_found' || error.status === 401) throw new Error('Volvé a iniciar sesión con tu contraseña actual y reintentá el cambio.')
  if (error.status === 429) throw new Error('Hubo demasiados intentos. Esperá unos minutos y volvé a intentar.')
  throw new Error('No pudimos cambiar la contraseña. Revisá la conexión y volvé a intentar.')
}