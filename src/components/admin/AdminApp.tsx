import { useState, type FormEvent } from 'react'
import { useSesionAdmin } from '../../hooks/useSesionAdmin'
import { cerrarSesion, iniciarSesion } from '../../services/admin'
import { ContactosAdmin } from './ContactosAdmin'
import { ConfiguracionAdmin } from './ConfiguracionAdmin'
import { CuentaAdmin } from './CuentaAdmin'
import '../../styles/admin.css'

export function MarcaAdmin() {
  return <img className="admin-marca" src="/brand/termoarq-logo.svg" alt="Termoarq, constructora termomecánica" width="300" height="52" />
}

function LoginAdmin({ errorSesion, onReintentar }: { errorSesion: string; onReintentar: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (enviando) return
    setEnviando(true); setError('')
    try { await iniciarSesion(email, password); onReintentar() }
    catch (error) { setError(error instanceof Error ? error.message : 'No pudimos iniciar sesión.') }
    finally { setEnviando(false) }
  }
  return <main className="admin admin-acceso">
    <div className="admin-login">
      <MarcaAdmin />
      <h1>Ingresá al panel</h1>
      <p>Consultá las visitas al stand y administrá la experiencia.</p>
      <form onSubmit={evento => { void enviar(evento) }}>
        <label htmlFor="admin-email">Email</label>
        <input id="admin-email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={evento => setEmail(evento.target.value)} />
        <label htmlFor="admin-password">Contraseña</label>
        <div className="admin-password">
          <input id="admin-password" type={visible ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={evento => setPassword(evento.target.value)} />
          <button type="button" className="admin-texto-boton" onClick={() => setVisible(valor => !valor)} aria-controls="admin-password" aria-pressed={visible}>{visible ? 'Ocultar' : 'Mostrar'}</button>
        </div>
        {(error || errorSesion) && <p className="admin-error" role="alert">{error || errorSesion}</p>}
        {errorSesion && <button type="button" className="admin-texto-boton" onClick={onReintentar}>Reintentar conexión</button>}
        <button className="admin-boton admin-boton--principal" type="submit" disabled={enviando} aria-busy={enviando}>{enviando ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
      <p className="admin-nota">El acceso requiere una cuenta habilitada por Termoarq.</p>
      <a href="/">Volver a la experiencia</a>
    </div>
  </main>
}

export default function AdminApp() {
  const sesion = useSesionAdmin()
  const [seccion, setSeccion] = useState<'contactos' | 'configuracion' | 'cuenta'>('contactos')
  const [saliendo, setSaliendo] = useState(false)
  const [errorSalida, setErrorSalida] = useState('')
  const salir = async () => {
    if (saliendo) return
    setSaliendo(true); setErrorSalida('')
    try { await cerrarSesion() }
    catch (error) { setErrorSalida(error instanceof Error ? error.message : 'No pudimos cerrar la sesión.') }
    finally { setSaliendo(false) }
  }
  if (sesion.cargando) return <main className="admin admin-acceso"><div className="admin-login"><MarcaAdmin /><h1>Abriendo el panel</h1><p role="status">Verificando tu sesión y tus permisos…</p><div className="admin-esqueleto" aria-hidden="true" /></div></main>
  if (!sesion.usuario) return <LoginAdmin errorSesion={sesion.error} onReintentar={sesion.reintentar} />
  if (!sesion.autorizado) return <main className="admin admin-acceso"><div className="admin-login"><MarcaAdmin /><h1>Acceso pendiente</h1><p>La cuenta {sesion.usuario.email} no está habilitada para el panel. Pedí al administrador de Termoarq que autorice tu acceso.</p><button className="admin-boton" onClick={sesion.reintentar}>Comprobar acceso</button><button className="admin-boton admin-boton--principal" disabled={saliendo} onClick={() => { void salir() }}>{saliendo ? 'Saliendo…' : 'Cerrar sesión'}</button>{errorSalida && <p className="admin-error" role="alert">{errorSalida}</p>}</div></main>
  return <div className="admin admin-panel">
    <a className="admin-saltar" href="#admin-contenido">Ir al contenido</a>
    <header className="admin-cabecera">
      <a className="admin-marca-enlace" href="/admin" aria-label="Inicio del panel Termoarq"><MarcaAdmin /></a>
      <div className="admin-cuenta"><span title={sesion.usuario.email}>{sesion.usuario.email}</span><button type="button" className="admin-boton" disabled={saliendo} onClick={() => { void salir() }}>{saliendo ? 'Saliendo…' : 'Cerrar sesión'}</button></div>
    </header>
    <div className="admin-cuerpo">
      <nav className="admin-navegacion" aria-label="Panel de administración">
        <button type="button" aria-current={seccion === 'contactos' ? 'page' : undefined} onClick={() => setSeccion('contactos')}>Contactos</button>
        <button type="button" aria-current={seccion === 'configuracion' ? 'page' : undefined} onClick={() => setSeccion('configuracion')}>Configuración</button>
        <button type="button" aria-current={seccion === 'cuenta' ? 'page' : undefined} onClick={() => setSeccion('cuenta')}>Mi cuenta</button>
        <a href="/" target="_blank" rel="noreferrer">Abrir experiencia <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M14 4h6v6m0-6L10 14M10 4H4v16h16v-6" /></svg><span className="admin-sr">en una pestaña nueva</span></a>
      </nav>
      <main id="admin-contenido" className="admin-contenido" tabIndex={-1}>
        {errorSalida && <p className="admin-error" role="alert">{errorSalida}</p>}
        {seccion === 'contactos' ? <ContactosAdmin key={sesion.usuario.id} /> : seccion === 'configuracion' ? <ConfiguracionAdmin key={sesion.usuario.id} /> : <CuentaAdmin key={sesion.usuario.id} email={sesion.usuario.email ?? ''} />}
      </main>
    </div>
  </div>
}
