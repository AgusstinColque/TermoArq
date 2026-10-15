import { useEffect, useRef, useState } from 'react'
import { useSesionAdmin } from '../hooks/useSesionAdmin'
import { type ConfiguracionAdmin } from '../domain/admin'
import { guardarConfiguracion, obtenerConfiguracion } from '../services/admin'

function nombreJuego(juego: ConfiguracionAdmin['juego_activo']) {
  return juego === 'ruleta' ? 'Ruleta' : juego === 'mision' ? 'Misión' : 'Sin juego'
}

export function CambioJuegoRapido() {
  const sesion = useSesionAdmin()
  const [configuracion, setConfiguracion] = useState<ConfiguracionAdmin | null>(null)
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const bloqueoRef = useRef(false)
  const consultaRef = useRef(0)
  const accionRef = useRef<HTMLButtonElement>(null)
  const disparadorRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!sesion.autorizado) return
    let vigente = true
    const intento = ++consultaRef.current
    obtenerConfiguracion().then(datos => { if (vigente && intento === consultaRef.current) setConfiguracion(datos) })
      .catch(() => { if (vigente && intento === consultaRef.current) { setConfiguracion(null); setError('No pudimos consultar el juego activo.') } })
    return () => { vigente = false }
  }, [sesion.autorizado])

  const abrir = async () => {
    if (sesion.cargando || guardando) return
    if (!sesion.autorizado) { window.location.assign('/admin'); return }
    if (abierto) { setAbierto(false); return }
    setCargando(true)
    setError('')
    const intento = ++consultaRef.current
    try {
      const datos = await obtenerConfiguracion()
      if (intento !== consultaRef.current) return
      setConfiguracion(datos)
      setAbierto(true)
      requestAnimationFrame(() => accionRef.current?.focus())
    } catch (fallo) {
      setConfiguracion(null)
      setError(fallo instanceof Error ? fallo.message : 'No pudimos consultar el juego activo.')
      setAbierto(true)
    } finally { setCargando(false) }
  }

  const cambiar = async () => {
    if (!configuracion || !configuracion.juego_activo || bloqueoRef.current) return
    bloqueoRef.current = true
    ++consultaRef.current
    setGuardando(true)
    setError('')
    try {
      const siguiente = configuracion.juego_activo === 'ruleta' ? 'mision' : 'ruleta'
      const guardada = await guardarConfiguracion({ ...configuracion, juego_activo: siguiente }, configuracion)
      setConfiguracion(guardada)
      setAbierto(false)
      disparadorRef.current?.focus()
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No pudimos cambiar el juego.')
      try { setConfiguracion(await obtenerConfiguracion()) } catch { setConfiguracion(null) }
    } finally { bloqueoRef.current = false; setGuardando(false) }
  }

  const actual = configuracion?.juego_activo
  const siguiente = actual === 'ruleta' ? 'Misión' : 'Ruleta'
  return <div className="bienvenida__juego-rapido">
    <button ref={disparadorRef} className="bienvenida__juego-boton" type="button" onClick={() => { void abrir() }}
      disabled={sesion.cargando || cargando || guardando} aria-expanded={abierto} aria-controls="cambio-juego-rapido"
      aria-label={sesion.autorizado && actual ? `Juego activo: ${nombreJuego(actual)}. Cambiar juego` : 'Cambiar juego; requiere acceso del equipo'}
      title={sesion.autorizado ? `Juego activo: ${nombreJuego(actual ?? null)}` : 'Cambiar juego · acceso del equipo'}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 7a8 8 0 0 0-14-2L4 7m0-4v4h4M4 17a8 8 0 0 0 14 2l2-2m0 4v-4h-4" /></svg>
      {sesion.autorizado && <span>{actual ? nombreJuego(actual) : 'Juego'}</span>}
    </button>
    {abierto && <div id="cambio-juego-rapido" className="bienvenida__juego-menu" role="group" aria-label="Cambio rápido de juego" onKeyDown={evento => { if (evento.key === 'Escape' && !guardando) { setAbierto(false); disparadorRef.current?.focus() } }}>
      <p>Juego activo: <strong>{nombreJuego(actual ?? null)}</strong></p>
      {!actual ? !error && <p>Elegí y activá un juego desde el panel de administración.</p> : <button ref={accionRef} type="button" className="bienvenida__juego-confirmar" disabled={guardando} onClick={() => { void cambiar() }}>{guardando ? 'Cambiando…' : `Cambiar a ${siguiente}`}</button>}
      {error && <p className="bienvenida__juego-error" role="alert">{error}</p>}
      <div className="bienvenida__juego-menu-pie"><button type="button" disabled={guardando} onClick={() => { setAbierto(false); disparadorRef.current?.focus() }}>Cancelar</button><a href="/admin">Panel</a></div>
    </div>}
  </div>
}
