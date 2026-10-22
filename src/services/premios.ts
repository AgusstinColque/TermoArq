import { obtenerClienteSupabase } from '../lib/supabase'
import { sortearPremio } from '../domain/ruleta'
import { disenoRuleta } from '../data/ruletaDiseno'

export interface StockPremio { indice: number; nombre: string; cantidad: number; revision: number; actualizado_en: string }
function fallo(error: { message?: string; code?: string }): Error {
  if (error.code === 'PGRST202') return new Error('Falta aplicar la actualización de stock en Supabase.')
  if (error.message?.includes('STOCK_CAMBIO')) return new Error('La cantidad cambió mientras editabas. Actualizá los datos y volvé a cargar el valor.')
  if (error.code === '42501') return new Error('Tu cuenta no tiene permisos para administrar el stock.')
  return new Error('No pudimos confirmar la operación. Revisá la conexión y volvé a intentar.')
}
function validarStock(value: unknown): StockPremio {
  const row = value as StockPremio
  if (!row || !Number.isInteger(row.indice) || row.indice < 0 || row.indice >= disenoRuleta.premios.length || !Number.isSafeInteger(row.cantidad) || row.cantidad < 0 || !Number.isSafeInteger(row.revision) || typeof row.nombre !== 'string') throw new Error('El stock recibido no es válido. Actualizá e intentá nuevamente.')
  return row
}
export async function listarStock(signal?: AbortSignal): Promise<StockPremio[]> {
  let query = obtenerClienteSupabase().rpc('admin_stock_premios')
  if (signal) query = query.abortSignal(signal)
  const { data, error } = await query
  if (error) throw fallo(error)
  if (!Array.isArray(data) || data.length !== disenoRuleta.premios.length) throw new Error('El catálogo de stock está incompleto.')
  const rows = data.map(validarStock)
  if (new Set(rows.map(r => r.indice)).size !== rows.length) throw new Error('El catálogo de stock no es válido.')
  return rows
}
export async function actualizarStock(row: StockPremio, cantidad: number): Promise<StockPremio> {
  if (!Number.isSafeInteger(cantidad) || cantidad < 0 || cantidad > 1000000) throw new Error('Ingresá una cantidad entera entre 0 y 1.000.000.')
  const { data, error } = await obtenerClienteSupabase().rpc('admin_actualizar_stock', { p_indice: row.indice, p_cantidad: cantidad, p_revision: row.revision })
  if (error) throw fallo(error)
  return validarStock(data)
}
export async function obtenerPremio(solicitud?: string | null): Promise<number> {
  // Las vistas de desarrollo no crean participaciones ni descuentan stock.
  if (!solicitud) {
    if (import.meta.env.DEV) return sortearPremio()
    throw new Error('No pudimos confirmar tu participación. Consultá con el equipo de Termoarq.')
  }
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 15000)
  try {
    const { data, error } = await obtenerClienteSupabase().rpc('obtener_premio', { p_solicitud: solicitud }).abortSignal(controller.signal)
    if (error) throw fallo(error)
    if (!Number.isInteger(data?.indice) || data.indice < 0 || data.indice >= disenoRuleta.premios.length) throw new Error('No pudimos confirmar el premio. Volvé a intentar.')
    return data.indice
  } finally { window.clearTimeout(timeout) }
}
