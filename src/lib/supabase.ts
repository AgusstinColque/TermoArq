import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

/** Inicialización diferida: la aplicación puede arrancar sin una clave configurada. */
export function obtenerClienteSupabase(): SupabaseClient {
  if (client) return client

  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url || !key) {
    throw new Error('Configurá las variables públicas de Supabase en .env.local.')
  }

  if (!key.startsWith('sb_publishable_')) {
    throw new Error('Usá la Publishable key; las claves secretas no pertenecen al frontend.')
  }

  client = createClient(url, key, {
    auth: { storageKey: 'termoarq-admin-auth' },
  })
  return client
}

