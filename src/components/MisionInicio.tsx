import { useState } from 'react'
import '../styles/misionInicio.css'

export function MisionInicio({ onExplorar }: { onExplorar: () => void }) {
  const [aviso, setAviso] = useState('')
  const [errorImagen, setErrorImagen] = useState(false)
  return <main className="mision mision-inicio">
    <div className="mision__pagina">
      <header className="mision__cabecera"><img src="/brand/termoarq-logo-blanco.svg" alt="Termoarq, constructora termomecánica" /></header>
      <h1>Misión Termoarq</h1>
      <p className="mision-inicio__lema">Explorá. Detectá. Transformá.</p>
      <div className="mision-inicio__mapa">
        <img src="/media/mision-vista-superior.png" alt="Casa con living y comedor al frente, dormitorio al fondo y lavadero a la derecha" draggable={false} onError={() => setErrorImagen(true)} />
        <svg className="mision-inicio__calor" viewBox="0 0 100 100" aria-hidden="true"><path d="M25 90C45 65 5 55 25 25S30 10 32 5"/><path d="M50 90C70 65 30 55 50 25S55 10 57 5"/><path d="M75 90C95 65 55 55 75 25S80 10 82 5"/></svg>
        {!errorImagen && <>{(['living', 'dormitorio', 'lavadero'] as const).map(ambiente => <button key={ambiente} className={`mision-inicio__punto mision-inicio__punto--${ambiente}`} aria-label={ambiente === 'living' ? 'Explorar living' : `${ambiente === 'dormitorio' ? 'Dormitorio' : 'Lavadero'}, próximamente`} onClick={() => ambiente === 'living' ? onExplorar() : setAviso(`${ambiente === 'dormitorio' ? 'Dormitorio' : 'Lavadero'}: próximamente. Comenzá por el living destacado.`)}><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></span></button>)}</>}
        {errorImagen && <p className="mision-inicio__error" role="alert">No pudimos cargar la casa. Recargá la página para volver a intentar.</p>}
      </div>
      <svg className="mision-inicio__guia" viewBox="0 0 100 200" aria-hidden="true"><path d="M20 5Q64 100 36 187"/><path d="m27 177 9 12 12-10"/></svg>
      <section className="mision-inicio__tarjeta" aria-labelledby="inicio-espacio">
        <svg className="mision-inicio__icono" viewBox="0 0 90 90" aria-hidden="true"><g className="mision-inicio__icono-calor"><path d="M30 36c-10-12 10-17 0-29M45 36c-10-12 10-17 0-29M60 36c-10-12 10-17 0-29"/></g><path d="M18 58v-9q0-7 7-7h40q7 0 7 7v9M15 56q-7 0-7 7v12h74V63q0-7-7-7t-7 7H22q0-7-7-7ZM16 75v8m58-8v8"/></svg>
        <div><h2 id="inicio-espacio">Un espacio por mejorar</h2><p aria-live="polite">{aviso || 'Tocá el ambiente destacado para explorar una solución.'}</p></div>
      </section>
      <button className="mision-inicio__explorar" onClick={onExplorar}>Explorar ambiente<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7"/></svg></button>
      <footer>Concepto de juego · Escena ilustrativa</footer>
    </div>
  </main>
}
