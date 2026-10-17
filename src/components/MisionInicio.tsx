import { useEffect, useRef, useState } from 'react'
import { type AmbienteCasa } from '../data/misionCasa'
import '../styles/misionInicio.css'
import { EscenaCasa } from './EscenaCasa'

export function MisionInicio({ onExplorar, completados, onFinalizar }: { onExplorar: (ambiente: AmbienteCasa) => void; completados: AmbienteCasa[]; onFinalizar: () => void }) {
  const titulo = useRef<HTMLHeadingElement>(null)
  useEffect(() => { titulo.current?.focus({ preventScroll: true }); window.scrollTo(0, 0) }, [])
  const terminado = completados.length === 2
  const proximo = (['living', 'dormitorio'] as const).find(id => !completados.includes(id)) ?? 'living'
  const [errorImagen, setErrorImagen] = useState(false)
  return <main className="mision mision-inicio">
    <div className="mision__pagina">
      <header className="mision__cabecera"><img src="/brand/termoarq-logo-blanco.svg" alt="Termoarq, constructora termomecánica" /></header>
      <h1 ref={titulo} tabIndex={-1}>Misión Termoarq</h1>
      <p className="mision-inicio__lema">Explorá. Detectá. Transformá.</p>
      <div className="mision-inicio__mapa">
        <EscenaCasa activos={completados} calientes={['living', 'dormitorio']} onError={() => setErrorImagen(true)} />
        {!errorImagen && <>{(['living', 'dormitorio'] as const).map(ambiente => <button key={ambiente} className={'mision-inicio__punto mision-inicio__punto--' + ambiente} disabled={completados.includes(ambiente)} aria-label={(ambiente === 'living' ? 'Living-comedor' : 'Dormitorio') + (completados.includes(ambiente) ? ': explorado' : ': explorar')} onClick={() => onExplorar(ambiente)}><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d={completados.includes(ambiente) ? 'm5 12 4 4L19 6' : 'M12 5v14M5 12h14'}/></svg></span></button>)}</>}
        {errorImagen && <p className="mision-inicio__error" role="alert">No pudimos cargar la casa. Recargá la página para volver a intentar.</p>}
      </div>
      <svg className="mision-inicio__guia" viewBox="0 0 100 200" aria-hidden="true"><path d="M20 5Q64 100 36 187"/><path d="m27 177 9 12 12-10"/></svg>
      <section className="mision-inicio__tarjeta" aria-labelledby="inicio-espacio">
        <svg className="mision-inicio__icono" viewBox="0 0 90 90" aria-hidden="true"><g className="mision-inicio__icono-calor"><path d="M30 36c-10-12 10-17 0-29M45 36c-10-12 10-17 0-29M60 36c-10-12 10-17 0-29"/></g><path d="M18 58v-9q0-7 7-7h40q7 0 7 7v9M15 56q-7 0-7 7v12h74V63q0-7-7-7t-7 7H22q0-7-7-7ZM16 75v8m58-8v8"/></svg>
        <div><h2 id="inicio-espacio">{terminado ? '¡Misión completada!' : 'Explorá la casa'}</h2><p aria-live="polite">{terminado ? 'Exploraste el living-comedor y el dormitorio.' : completados.length + ' de 2 ambientes explorados. Tocá el living-comedor o el dormitorio.'}</p></div>
      </section>
      <button className="mision-inicio__explorar" onClick={() => terminado ? onFinalizar() : onExplorar(proximo)}>{terminado ? 'Finalizar experiencia' : 'Explorar ' + (proximo === 'living' ? 'living-comedor' : 'dormitorio')}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7"/></svg></button>
      <footer></footer>
    </div>
  </main>
}

