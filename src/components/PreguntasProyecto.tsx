import { preguntasProyecto } from '../data/preguntasProyecto'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { validarProyecto, type CampoProyecto, type ErroresProyecto, type RespuestasProyecto } from '../domain/preguntasProyecto'

interface PreguntasProyectoProps {
  respuestas: RespuestasProyecto
  onCambiar: (respuestas: RespuestasProyecto) => void
  onVolver: () => void
  onContinuar?: (respuestas: RespuestasProyecto) => void
}

export function PreguntasProyecto({ respuestas, onCambiar, onVolver, onContinuar }: PreguntasProyectoProps) {
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const formularioRef = useRef<HTMLFormElement>(null)
  const [errores, setErrores] = useState<ErroresProyecto>({})
  useEffect(() => { tituloRef.current?.focus({ preventScroll: true }) }, [])

  const cambiar = (campo: CampoProyecto, valor: string) => {
    const nuevas = { ...respuestas, [campo]: valor }
    onCambiar(nuevas)
    if (errores[campo]) setErrores(actuales => ({ ...actuales, [campo]: validarProyecto(nuevas)[campo] }))
  }
  const continuar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const nuevosErrores = validarProyecto(respuestas)
    setErrores(nuevosErrores)
    const primero = (Object.keys(nuevosErrores) as CampoProyecto[])[0]
    if (primero) {
      const control = formularioRef.current?.elements.namedItem(primero)
      if (control instanceof HTMLElement) control.focus()
      return
    }
    onContinuar?.(respuestas)
  }

  return (
    <main className="datos-cliente preguntas-proyecto" aria-labelledby="preguntas-titulo">
      <div className="datos-cliente__navegacion">
        <button type="button" className="datos-cliente__volver" onClick={onVolver} aria-label="Volver a tus datos">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6" /></svg>
        </button>
        <div className="datos-cliente__progreso" aria-label="Paso 2 de 3: preguntas sobre tu proyecto">
          <span>Paso 2 de 3</span><span className="datos-cliente__paso datos-cliente__paso--activo" /><span className="datos-cliente__paso datos-cliente__paso--activo" /><span className="datos-cliente__paso" />
        </div>
      </div>
      <img className="datos-cliente__logo" src="/brand/termoarq-logo-aprobado-blanco.svg" alt="Termoarq, constructora termomecánica" width="300" height="53" />
      <h1 id="preguntas-titulo" ref={tituloRef} tabIndex={-1}>Contanos un poco más</h1>
      <p className="datos-cliente__intro">Respondé estas tres preguntas.</p>
      <form className="datos-cliente__formulario" ref={formularioRef} noValidate onSubmit={continuar}>
        <div className="datos-cliente__campos">
          {preguntasProyecto.map(pregunta => (
            <div className="datos-cliente__campo" key={pregunta.id}>
              <label htmlFor={pregunta.id}>{pregunta.etiqueta}</label>
              <div className="preguntas-proyecto__selector">
                <select id={pregunta.id} name={pregunta.id} required value={respuestas[pregunta.id]}
                  aria-invalid={Boolean(errores[pregunta.id])} aria-describedby={errores[pregunta.id] ? `${pregunta.id}-error` : undefined}
                  onChange={evento => cambiar(pregunta.id, evento.target.value)}
                  onBlur={() => setErrores(actuales => ({ ...actuales, [pregunta.id]: validarProyecto(respuestas)[pregunta.id] }))}>
                  <option value="" disabled>Elegí una opción</option>
                  {pregunta.opciones.map(opcion => <option key={opcion.valor} value={opcion.valor}>{opcion.texto}</option>)}
                </select>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
              </div>
              {errores[pregunta.id] && <p id={`${pregunta.id}-error`} className="datos-cliente__error" role="alert">{errores[pregunta.id]}</p>}
            </div>
          ))}
        </div>
        <button type="submit" className="datos-cliente__continuar" disabled={!onContinuar}>
          <span>Continuar</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
        </button>
      </form>
    </main>
  )
}
