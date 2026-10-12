import { useEffect, useRef, useState, type FormEvent } from 'react'
import { type ConfiguracionAdmin as Configuracion } from '../../domain/admin'
import { guardarConfiguracion, obtenerConfiguracion } from '../../services/admin'

export function ConfiguracionAdmin() {
  const [original, setOriginal] = useState<Configuracion | null>(null)
  const [borrador, setBorrador] = useState<Configuracion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [revision, setRevision] = useState(0)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const vigenteRef = useRef(true)
  const bloqueoRef = useRef(false)
  useEffect(() => { vigenteRef.current = true; tituloRef.current?.focus({ preventScroll: true }); return () => { vigenteRef.current = false } }, [])
  useEffect(() => {
    const controller = new AbortController()
    queueMicrotask(() => { if (!controller.signal.aborted) { setCargando(true); setError(''); setMensaje('') } })
    obtenerConfiguracion(controller.signal).then(datos => { if (!controller.signal.aborted) { setOriginal(datos); setBorrador(datos) } })
      .catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'No pudimos cargar la configuración.') })
      .finally(() => { if (!controller.signal.aborted) setCargando(false) })
    return () => controller.abort()
  }, [revision])
  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (!borrador || !original || bloqueoRef.current) return
    bloqueoRef.current = true
    setGuardando(true); setError(''); setMensaje('')
    try {
      const actual = await guardarConfiguracion(borrador, original)
      if (vigenteRef.current) { setOriginal(actual); setBorrador(actual); setMensaje('La configuración se guardó correctamente.') }
    } catch (error) { if (vigenteRef.current) setError(error instanceof Error ? error.message : 'No pudimos guardar los cambios.') }
    finally { bloqueoRef.current = false; if (vigenteRef.current) setGuardando(false) }
  }
  const cambios = borrador?.juego_activo !== original?.juego_activo || borrador?.registro_habilitado !== original?.registro_habilitado
  return <section className="admin-configuracion" aria-labelledby="admin-configuracion-titulo">
    <div className="admin-titulo-fila"><div><h1 id="admin-configuracion-titulo" ref={tituloRef} tabIndex={-1}>Configuración del stand</h1><p>Controlá el registro de visitantes y el juego de la experiencia.</p></div></div>
    {cargando ? <div role="status" className="admin-carga">Cargando configuración…<div className="admin-esqueleto" aria-hidden="true" /></div> : !borrador ? <div className="admin-vacio" role="alert"><h2>No pudimos cargar la configuración</h2><p>{error}</p><button type="button" className="admin-boton" onClick={() => setRevision(valor => valor + 1)}>Reintentar</button></div> : <form onSubmit={evento => { void guardar(evento) }}>
      <div className="admin-configuracion-estado"><span className={`admin-estado${original?.registro_habilitado ? ' admin-estado--activo' : ''}`}>{original?.registro_habilitado ? 'Registro habilitado' : 'Registro pausado'}</span>{borrador.modo_prueba && <p>La experiencia está en modo de prueba. Las condiciones y los premios siguen siendo de ejemplo.</p>}</div>
      <fieldset disabled={guardando}>
        <legend>Juego activo</legend><p>La selección se aplica a los nuevos registros.</p>
        <label className="admin-radio"><input type="radio" name="juego" value="ruleta" checked={borrador.juego_activo === 'ruleta'} onChange={() => { setBorrador({ ...borrador, juego_activo: 'ruleta' }); setMensaje('') }} /><span><strong>Ruleta</strong><span>La experiencia disponible en esta versión.</span></span></label>
        <label className="admin-radio admin-radio--pendiente"><input type="radio" name="juego" value="mision" disabled checked={borrador.juego_activo === 'mision'} readOnly /><span><strong>Misión Termoarq</strong><span>Pendiente de implementación.</span></span></label>
      </fieldset>
      <fieldset disabled={guardando} className="admin-configuracion-registro"><legend>Registro de visitantes</legend><label className="admin-checkbox"><input type="checkbox" checked={borrador.registro_habilitado} onChange={evento => { setBorrador({ ...borrador, registro_habilitado: evento.target.checked }); setMensaje('') }} /><span>Permitir nuevos registros</span></label><p>Al pausarlo, no se guardan nuevas visitas ni se inicia su juego. Las participaciones ya registradas continúan.</p></fieldset>
      {error && <p className="admin-error" role="alert">{error}</p>}
      {mensaje && <p className="admin-exito" role="status">{mensaje}</p>}
      <div className="admin-configuracion-acciones"><button type="submit" className="admin-boton admin-boton--principal" disabled={guardando || !cambios || borrador.juego_activo !== 'ruleta'} aria-busy={guardando}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button><button type="button" className="admin-boton" disabled={guardando} onClick={() => setRevision(valor => valor + 1)}>Actualizar configuración</button></div>
    </form>}
  </section>
}
