import { useEffect, useRef, useState, type FormEvent } from 'react'
import { validarDatos, type DatosContacto, type Campo, type Errores } from '../domain/datosContacto'
interface DatosClienteProps {
  datos: DatosContacto
  onCambiar: (datos: DatosContacto) => void
  onVolver: () => void
  onContinuar?: (datos: DatosContacto) => void
  privacidadAprobada?: boolean
  vistaPrevia?: boolean
}

export function DatosCliente({ datos, onCambiar, onVolver, onContinuar, privacidadAprobada = false, vistaPrevia = false }: DatosClienteProps) {
  const [errores, setErrores] = useState<Errores>({})
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const formularioRef = useRef<HTMLFormElement>(null)

  useEffect(() => { tituloRef.current?.focus({ preventScroll: true }) }, [])

  const cambiar = (campo: Campo, valor: string | boolean) => {
    const nuevos = { ...datos, [campo]: valor }
    onCambiar(nuevos)
    if (errores[campo] || ((campo === 'correo' || campo === 'telefono') && errores.correo)) {
      const siguientes = validarDatos(nuevos)
      setErrores(actuales => ({ ...actuales, [campo]: siguientes[campo], correo: siguientes.correo }))
    }
  }
  const revisar = (campo: Campo) => {
    const siguientes = validarDatos(datos)
    setErrores(actuales => ({ ...actuales, [campo]: siguientes[campo] }))
  }
  const continuar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const nuevosErrores = validarDatos(datos)
    setErrores(nuevosErrores)
    const primerCampo = (Object.keys(nuevosErrores) as Campo[])[0]
    if (primerCampo) {
      const control = formularioRef.current?.elements.namedItem(primerCampo)
      if (control instanceof HTMLElement) control.focus()
      return
    }
    if ((!privacidadAprobada && !vistaPrevia) || !onContinuar) return
    onContinuar({ ...datos, nombre: datos.nombre.trim(), apellido: datos.apellido.trim(), correo: datos.correo.trim(), telefono: datos.telefono.trim() })
  }

  return (
    <main className="datos-cliente" aria-labelledby="datos-titulo">
      <div className="datos-cliente__navegacion">
        <button type="button" className="datos-cliente__volver" onClick={onVolver} aria-label="Volver a la bienvenida">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6" /></svg>
        </button>
        <div className="datos-cliente__progreso" aria-label="Paso 1 de 3: datos de contacto">
          <span>Paso 1 de 3</span><span className="datos-cliente__paso datos-cliente__paso--activo" /><span className="datos-cliente__paso" /><span className="datos-cliente__paso" />
        </div>
      </div>
      <img className="datos-cliente__logo" src="/brand/termoarq-logo-aprobado-blanco.svg" alt="Termoarq, constructora termomecánica" width="300" height="53" />
      <h1 id="datos-titulo" ref={tituloRef} tabIndex={-1}>Completá tus datos</h1>
      <p className="datos-cliente__intro">Antes de jugar, contanos un poco de vos.</p>
      <form ref={formularioRef} className="datos-cliente__formulario" noValidate onSubmit={continuar}>
        <div className="datos-cliente__campos">
          {(['nombre', 'apellido', 'correo', 'telefono'] as const).map(campo => (
            <div className="datos-cliente__campo" key={campo}>
              <label htmlFor={campo}>{campo === 'nombre' ? 'Nombre' : campo === 'apellido' ? 'Apellido' : campo === 'correo' ? 'Correo electrónico' : 'Teléfono'}</label>
              <input id={campo} name={campo} type={campo === 'correo' ? 'email' : campo === 'telefono' ? 'tel' : 'text'} value={datos[campo]}
                maxLength={campo === 'correo' ? 254 : campo === 'telefono' ? 32 : 100}
                placeholder={campo === 'nombre' ? 'Tu nombre' : campo === 'apellido' ? 'Tu apellido' : campo === 'correo' ? 'nombre@empresa.com' : 'Tu número con código de área'}
                autoComplete={campo === 'correo' ? 'email' : campo === 'telefono' ? 'tel' : 'off'} autoCapitalize={campo === 'correo' ? 'none' : 'words'} spellCheck={false}
                aria-invalid={Boolean(errores[campo])} aria-describedby={[campo === 'correo' || campo === 'telefono' ? 'contacto-ayuda' : '', errores[campo] ? `${campo}-error` : ''].filter(Boolean).join(' ') || undefined}
                onChange={evento => cambiar(campo, evento.target.value)} onBlur={() => revisar(campo)} />
              {campo === 'telefono' && <p id="contacto-ayuda" className="datos-cliente__ayuda">Completá al menos uno de los dos.</p>}
              {errores[campo] && <p id={`${campo}-error`} className="datos-cliente__error" role="alert">{errores[campo]}</p>}
            </div>
          ))}
          <div className="datos-cliente__consentimiento">
            <div className="datos-cliente__aviso">


              <details>
                <summary>Ver términos y condiciones</summary>
                <div className="datos-cliente__detalle-privacidad">
                  <p>Termoarq usará tu nombre, el correo o teléfono que compartas y tus respuestas para estudiar los intereses y las necesidades de quienes visitan el stand y conocer qué servicios y proyectos interesan a los asistentes.</p>

                  <p>Podés solicitar el acceso, la corrección o la eliminación de tus datos.</p>
                  <p><strong></strong> </p>
                </div>
              </details>
            </div>
            <div className="datos-cliente__aceptacion">
              <input id="consentimiento" name="consentimiento" type="checkbox" checked={datos.consentimiento}
                onChange={evento => cambiar('consentimiento', evento.target.checked)} aria-invalid={Boolean(errores.consentimiento)} aria-describedby={errores.consentimiento ? 'consentimiento-error' : undefined} />
              <label htmlFor="consentimiento">Acepto los términos y condiciones.</label>
            </div>
            {errores.consentimiento && <p id="consentimiento-error" className="datos-cliente__error" role="alert">{errores.consentimiento}</p>}

            {!privacidadAprobada && <p className="datos-cliente__ayuda"></p>}
          </div>
        </div>
        <button type="submit" className="datos-cliente__continuar" disabled={(!privacidadAprobada && !vistaPrevia) || !onContinuar}>
          <span>Continuar</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
        </button>
      </form>
    </main>
  )
}




