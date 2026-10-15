import { useEffect, useRef, useState } from 'react'
import { cambiarJuegoRapido, consultarJuegoRapido, type JuegoRapido } from '../services/juegoRapido'

function nombreJuego(juego: JuegoRapido) {
  return juego === 'ruleta' ? 'Ruleta' : juego === 'mision' ? 'Misión' : 'Sin juego'
}

export function CambioJuegoRapido() {
  const [juego, setJuego] = useState<JuegoRapido>(null)
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const bloqueoRef = useRef(false)
  const consultaRef = useRef(0)
  const accionRef = useRef<HTMLButtonElement>(null)
  const disparadorRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let vigente = true
    const intento = ++consultaRef.current
    consultarJuegoRapido().then(actual => { if (vigente && intento === consultaRef.current) setJuego(actual) })
      .catch(() => { if (vigente && intento === consultaRef.current) { setJuego(null); setError('No pudimos consultar el juego activo.') } })
    return () => { vigente = false }
  }, [])

  const abrir = async () => {
    if (guardando) return
    if (abierto) { setAbierto(false); return }
    setCargando(true)
    setError('')
    const intento = ++consultaRef.current
    try {
      const actual = await consultarJuegoRapido()
      if (intento !== consultaRef.current) return
      setJuego(actual)
      setAbierto(true)
      requestAnimationFrame(() => accionRef.current?.focus())
    } catch (fallo) {
      setJuego(null)
      setError(fallo instanceof Error ? fallo.message : 'No pudimos consultar el juego activo.')
      setAbierto(true)
    } finally { setCargando(false) }
  }

  const cambiar = async () => {
    if (!juego || bloqueoRef.current) return
    bloqueoRef.current = true
    ++consultaRef.current
    setGuardando(true)
    setError('')
    try {
      const actualizado = await cambiarJuegoRapido(juego)
      setJuego(actualizado)
      setAbierto(false)
      disparadorRef.current?.focus()
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No pudimos cambiar el juego.')
      try { setJuego(await consultarJuegoRapido()) } catch { setJuego(null) }
    } finally { bloqueoRef.current = false; setGuardando(false) }
  }

  const siguiente = juego === 'ruleta' ? 'Misión' : 'Ruleta'
  return <div className="bienvenida__juego-rapido" onKeyDown={evento => { if (evento.key === 'Escape' && abierto && !guardando) { setAbierto(false); disparadorRef.current?.focus() } }}>
    <button ref={disparadorRef} className="bienvenida__juego-boton" type="button" onClick={() => { void abrir() }}
      disabled={cargando || guardando} aria-expanded={abierto} aria-controls={abierto ? 'cambio-juego-rapido' : undefined}
      aria-label={`Juego activo: ${nombreJuego(juego)}. Cambiar juego`}
      title={`Juego activo: ${nombreJuego(juego)}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 7a8 8 0 0 0-14-2L4 7m0-4v4h4M4 17a8 8 0 0 0 14 2l2-2m0 4v-4h-4" /></svg>
      <span>{juego ? nombreJuego(juego) : 'Juego'}</span>
    </button>
    {abierto && <div id="cambio-juego-rapido" className="bienvenida__juego-menu" role="group" aria-label="Cambio rápido de juego">
      <p>Juego activo: <strong>{nombreJuego(juego)}</strong></p>
      {!juego ? !error && <p>Elegí y activá un juego desde el panel de administración.</p> : <button ref={accionRef} type="button" className="bienvenida__juego-confirmar" disabled={guardando} onClick={() => { void cambiar() }}>{guardando ? 'Cambiando…' : `Cambiar a ${siguiente}`}</button>}
      {error && <p className="bienvenida__juego-error" role="alert">{error}</p>}
      <div className="bienvenida__juego-menu-pie"><button type="button" disabled={guardando} onClick={() => { setAbierto(false); disparadorRef.current?.focus() }}>Cancelar</button><a href="/admin">Panel</a></div>
    </div>}
  </div>
}
