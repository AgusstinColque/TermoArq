import { useEffect, useRef, useState, type FormEvent } from 'react'
import { type PreguntaDesbloqueo } from '../data/desafioInicial'

interface DesafioProps {
  pregunta: PreguntaDesbloqueo | null
  cargandoPregunta: boolean
  errorPregunta: string
  onReintentar: () => void
  respuesta: string
  onCambiar: (respuesta: string) => void
  onVolver: () => void
  onJugar?: () => void
  guardando?: boolean
  errorGuardado?: string
}

export function Desafio({ pregunta, cargandoPregunta, errorPregunta, onReintentar, respuesta, onCambiar, onVolver, onJugar, guardando = false, errorGuardado = '' }: DesafioProps) {
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false)
  const [error, setError] = useState(false)
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const primeraOpcionRef = useRef<HTMLInputElement>(null)
  const esCorrecta = respuesta === pregunta?.correcta

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    tituloRef.current?.focus({ preventScroll: true })
  }, [mostrarRespuesta])

  const responder = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (!pregunta?.opciones.some(opcion => opcion.id === respuesta)) {
      setError(true)
      primeraOpcionRef.current?.focus()
      return
    }
    setError(false)
    setMostrarRespuesta(true)
  }

  return (
    <main className="datos-cliente desafio" aria-labelledby="desafio-titulo">
      <div className="datos-cliente__navegacion">
        <button type="button" className="datos-cliente__volver" disabled={guardando}
          onClick={() => { if (mostrarRespuesta) setMostrarRespuesta(false); else onVolver() }}
          aria-label={mostrarRespuesta ? 'Volver a la pregunta' : 'Volver a las preguntas sobre tu proyecto'}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6" /></svg>
        </button>
        <div className="datos-cliente__progreso" aria-label="Paso 3 de 3: desafío antes de jugar">
          <span>Paso 3 de 3</span>
          <span className="datos-cliente__paso datos-cliente__paso--activo" />
          <span className="datos-cliente__paso datos-cliente__paso--activo" />
          <span className="datos-cliente__paso datos-cliente__paso--activo" />
        </div>
      </div>
      <img className="datos-cliente__logo" src="/brand/termoarq-logo-blanco.svg" alt="Termoarq, constructora termomecánica" width="300" height="53" />
      {!pregunta ? (
        <>
          <h1 id="desafio-titulo" ref={tituloRef} tabIndex={-1}>Antes de jugar,<br />un desafío.</h1>
          {errorPregunta ? <p className="datos-cliente__error" role="alert">{errorPregunta}</p>
            : <p className="datos-cliente__intro" role="status">{cargandoPregunta ? 'Buscando una pregunta para vos…' : 'Preparando el desafío…'}</p>}
          {errorPregunta && <div className="desafio__accion"><button type="button" className="datos-cliente__continuar" onClick={onReintentar}>Volver a intentar</button></div>}
        </>
      ) : mostrarRespuesta ? (
        <>
          <svg className="desafio__icono-respuesta" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            {esCorrecta ? <path d="m7.5 12 3 3 6-6" /> : <path d="M12 11v6m0-10v.1" />}
          </svg>
          <h1 id="desafio-titulo" ref={tituloRef} tabIndex={-1}>{esCorrecta ? '¡Exactamente!' : 'No exactamente.'}</h1>
          <p className="desafio__explicacion">{pregunta.explicacion}</p>
          <div className="desafio__respuesta-correcta">
            <h3>Respuesta correcta</h3>
            <p>{pregunta.opciones.find(opcion => opcion.id === pregunta.correcta)?.texto}</p>
          </div>
          <p className="desafio__invitacion">Ahora sí, ¡a jugar!</p>
          <div className="desafio__accion">
            {errorGuardado && <p className="datos-cliente__error" role="alert">{errorGuardado}</p>}
            <button type="button" className="datos-cliente__continuar" onClick={onJugar} disabled={!onJugar || guardando} aria-busy={guardando}>
              <span>{guardando ? 'Guardando…' : errorGuardado ? 'Reintentar' : 'Jugar'}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 id="desafio-titulo" ref={tituloRef} tabIndex={-1}>Antes de jugar,<br />un desafío.</h1>
          <p className="datos-cliente__intro">Una pregunta para conocer más sobre Termoarq.</p>
          <form className="datos-cliente__formulario" noValidate onSubmit={responder}>
            <fieldset className="desafio__opciones" aria-describedby={error ? 'desafio-error' : 'desafio-ayuda'}>
              <legend>{pregunta.pregunta}</legend>
              {pregunta.opciones.map((opcion, indice) => (
                <label className={`desafio__opcion${respuesta === opcion.id ? ' desafio__opcion--seleccionada' : ''}`} key={opcion.id}>
                  <input ref={indice === 0 ? primeraOpcionRef : undefined} type="radio" name="desafio" value={opcion.id}
                    checked={respuesta === opcion.id} required aria-invalid={error}
                    onChange={() => { onCambiar(opcion.id); setError(false) }} />
                  <span>{opcion.texto}</span>
                </label>
              ))}
            </fieldset>
            <p id="desafio-ayuda" className="datos-cliente__ayuda">Elegí una opción para conocer la respuesta.</p>
            {error && <p id="desafio-error" className="datos-cliente__error" role="alert">Elegí una respuesta antes de continuar.</p>}
            <div className="desafio__accion">
              <button type="submit" className="datos-cliente__continuar">
                <span>Responder</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  )
}

