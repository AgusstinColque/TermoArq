import { useEffect, useRef, useState, type FormEvent } from 'react'
import { cambiarPassword } from '../../services/admin'

export function CuentaAdmin({ email }: { email: string }) {
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [visible, setVisible] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const vigente = useRef(true)
  const bloqueo = useRef(false)
  const titulo = useRef<HTMLHeadingElement>(null)
  useEffect(() => { vigente.current = true; titulo.current?.focus({ preventScroll: true }); return () => { vigente.current = false } }, [])
  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (bloqueo.current) return
    setError(''); setMensaje('')
    if (nueva.length < 12) { setError('Usá al menos 12 caracteres en la nueva contraseña.'); return }
    if (nueva !== confirmacion) { setError('La confirmación no coincide con la nueva contraseña.'); return }
    if (actual === nueva) { setError('Elegí una contraseña diferente de la actual.'); return }
    bloqueo.current = true; setGuardando(true)
    try {
      await cambiarPassword(actual, nueva)
      if (vigente.current) { setActual(''); setNueva(''); setConfirmacion(''); setVisible(false); setMensaje('Tu contraseña se cambió correctamente. Usá la nueva contraseña en tu próximo ingreso.') }
    } catch (error) { if (vigente.current) setError(error instanceof Error ? error.message : 'No pudimos cambiar la contraseña.') }
    finally { bloqueo.current = false; if (vigente.current) setGuardando(false) }
  }
  return <section className="admin-configuracion admin-mi-cuenta" aria-labelledby="admin-cuenta-titulo">
    <div className="admin-titulo-fila"><div><h1 id="admin-cuenta-titulo" ref={titulo} tabIndex={-1}>Mi cuenta</h1><p>{email}</p></div></div>
    <form onSubmit={evento => { void guardar(evento) }}>
      <fieldset disabled={guardando}>
        <legend>Cambiar contraseña</legend>
        <p>Elegí una contraseña propia de al menos 12 caracteres.</p>
        <div className="admin-campo"><label htmlFor="cuenta-actual">Contraseña actual</label><input id="cuenta-actual" type={visible ? 'text' : 'password'} autoComplete="current-password" required value={actual} onChange={evento => { setActual(evento.target.value); setError(''); setMensaje('') }} /></div>
        <div className="admin-campo"><label htmlFor="cuenta-nueva">Nueva contraseña</label><input id="cuenta-nueva" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={12} aria-describedby="cuenta-ayuda" value={nueva} onChange={evento => { setNueva(evento.target.value); setError(''); setMensaje('') }} /></div>
        <p id="cuenta-ayuda" className="admin-nota">Podés usar una frase larga. Evitá reutilizar la contraseña de otro servicio.</p>
        <div className="admin-campo"><label htmlFor="cuenta-confirmacion">Confirmar nueva contraseña</label><input id="cuenta-confirmacion" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={12} value={confirmacion} onChange={evento => { setConfirmacion(evento.target.value); setError(''); setMensaje('') }} /></div>
        <button type="button" className="admin-texto-boton" aria-pressed={visible} aria-controls="cuenta-actual cuenta-nueva cuenta-confirmacion" onClick={() => setVisible(valor => !valor)}>{visible ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}</button>
      </fieldset>
      {error && <p className="admin-error" role="alert">{error}</p>}
      {mensaje && <p className="admin-exito" role="status">{mensaje}</p>}
      <div className="admin-configuracion-acciones"><button type="submit" className="admin-boton admin-boton--principal" disabled={guardando} aria-busy={guardando}>{guardando ? 'Cambiando contraseña…' : 'Cambiar contraseña'}</button></div>
    </form>
  </section>
}