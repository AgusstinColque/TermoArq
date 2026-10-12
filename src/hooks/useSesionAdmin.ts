import { useCallback, useEffect, useState } from 'react'
import { type User } from '@supabase/supabase-js'
import { obtenerClienteSupabase } from '../lib/supabase'
import { consultarAcceso } from '../services/admin'

export function useSesionAdmin() {
  const [estado, setEstado] = useState<{ cargando: boolean; usuario: User | null; autorizado: boolean; error: string }>({ cargando: true, usuario: null, autorizado: false, error: '' })
  const [revision, setRevision] = useState(0)
  const reintentar = useCallback(() => setRevision(valor => valor + 1), [])
  useEffect(() => {
    let vigente = true
    let secuencia = 0
    let pendiente: number | undefined
    const verificar = async () => {
      const intento = ++secuencia
      try {
        const { data: { session }, error } = await obtenerClienteSupabase().auth.getSession()
        if (error) throw error
        const acceso = session ? await consultarAcceso() : null
        if (vigente && intento === secuencia) setEstado({ cargando: false, usuario: acceso?.usuario ?? null, autorizado: acceso?.autorizado ?? false, error: '' })
      } catch (error) {
        if (vigente && intento === secuencia) setEstado({ cargando: false, usuario: null, autorizado: false, error: error instanceof Error ? error.message : 'No pudimos verificar el acceso.' })
      }
    }
    try {
      const { data: { subscription } } = obtenerClienteSupabase().auth.onAuthStateChange((evento) => {
        if (evento === 'SIGNED_OUT') {
          secuencia++
          window.clearTimeout(pendiente)
          setEstado({ cargando: false, usuario: null, autorizado: false, error: '' })
          return
        }
        window.clearTimeout(pendiente)
        pendiente = window.setTimeout(() => { void verificar() }, 0)
      })
      void verificar()
      return () => { vigente = false; window.clearTimeout(pendiente); subscription.unsubscribe() }
    } catch (error) {
      queueMicrotask(() => { if (vigente) setEstado({ cargando: false, usuario: null, autorizado: false, error: error instanceof Error ? error.message : 'No pudimos iniciar el panel.' }) })
    }
    return () => { vigente = false }
  }, [revision])
  return { ...estado, reintentar }
}
