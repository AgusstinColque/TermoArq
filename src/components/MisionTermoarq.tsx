import { useEffect, useRef, useState } from 'react'
import '../styles/mision.css'
import { MisionInicio } from './MisionInicio'

type Fase = 'pregunta' | 'mejorando' | 'resuelto' | 'fin'
const opciones = ['Climatización', 'Iluminación', 'Terminaciones'] as const

function IconoOpcion({ indice }: { indice: number }) {
  return <svg className="mision__icono" viewBox="0 0 64 40" aria-hidden="true">{indice === 0 ? <><rect x="3" y="4" width="58" height="26" rx="4"/><path d="M9 22H55"/><path className="mision__icono-acento" d="M16 34q-4 3 0 6M32 34q-4 3 0 6M48 34q-4 3 0 6"/></> : indice === 1 ? <><path d="M32 1V9M12 29a20 20 0 0 1 40 0Z"/><path className="mision__icono-acento" d="M32 32V39M10 35L5 39M54 35L59 39"/></> : <><rect x="7" y="2" width="41" height="15" rx="3"/><path d="M48 9H55V25H32V39"/><path className="mision__icono-acento" d="M12 14h30"/></>}</svg>
}
function Flecha() { return <svg className="mision__flecha" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg> }

export function MisionTermoarq({ onFinalizar }: { onFinalizar?: () => void }) {
  const [explorando, setExplorando] = useState(false)
  return explorando ? <MisionDesafio onFinalizar={onFinalizar} onVolver={() => setExplorando(false)} /> : <MisionInicio onExplorar={() => setExplorando(true)} />
}

function MisionDesafio({ onVolver, onFinalizar }: { onVolver: () => void; onFinalizar?: () => void }) {
  const [fase, setFase] = useState<Fase>('pregunta')
  const [pista, setPista] = useState(false)
  const [imagenError, setImagenError] = useState(false)
  const siguiente = useRef<HTMLButtonElement>(null)
  const primera = useRef<HTMLButtonElement>(null)
  const reinicio = useRef<HTMLButtonElement>(null)
  const bloqueo = useRef(false)
  const fresco = fase === 'resuelto' || fase === 'fin'

  useEffect(() => {
    if (fase === 'resuelto') siguiente.current?.focus({ preventScroll: true })
    if (fase === 'fin') reinicio.current?.focus({ preventScroll: true })
    if (fase !== 'mejorando') return
    const tiempo = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350
    const timer = window.setTimeout(() => setFase('resuelto'), tiempo)
    return () => window.clearTimeout(timer)
  }, [fase])

  const elegir = (indice: number) => {
    if (bloqueo.current) return
    if (indice !== 0) { setPista(true); return }
    bloqueo.current = true
    setPista(false)
    setFase('mejorando')
  }
  const reiniciar = () => {
    bloqueo.current = false
    setPista(false)
    setFase('pregunta')
    requestAnimationFrame(() => primera.current?.focus({ preventScroll: true }))
  }

  return <main className={`mision ${fresco ? 'mision--fresca' : ''} ${fase === 'fin' ? 'mision--fin' : ''}`}>
    <div className="mision__pagina">
      <header className="mision__cabecera">
        <button className="mision__volver" aria-label="Volver a los ambientes" onClick={onVolver}><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M28 16H4m12-12L4 16l12 12"/></svg></button>
        <img src="/brand/termoarq-logo-blanco.svg" alt="Termoarq, constructora termomecánica" />
      </header>
      <h1>Misión Termoarq</h1>
      <div className="mision__progreso"><svg viewBox="0 0 170 40" aria-hidden="true"><path d="M20 20h130"/><circle className="mision__paso-activo" cx="20" cy="20" r="14"/><circle cx="85" cy="20" r="14"/><circle cx="150" cy="20" r="14"/>{fresco && <path className="mision__check" d="m13 20 5 5 10-11"/>}</svg><span>{fresco ? '1 de 3 ambientes resueltos' : 'Ambiente 1 de 3'}</span></div>
      <div className="mision__escena" role="img" aria-label={fresco ? 'Living climatizado: aparece el aire acondicionado en la pared y expulsa aire fresco; los otros ambientes permanecen oscuros' : 'Casa en perspectiva con el living destacado y ondas de calor ascendentes; los otros ambientes permanecen oscuros'}>
        <div className="mision__camara">
          <img className="mision__casa" src="/media/mision-escena-original.png" alt="" draggable={false} onError={() => setImagenError(true)} />

          <img className="mision__resuelta" src="/media/mision-escena-resuelta.png" alt="" onError={() => setImagenError(true)} />
          <svg className="mision__ondas-fijas mision__ondas-fijas--calor" viewBox="0 0 1049 1500" aria-hidden="true">
            <defs><linearGradient id="mision-calor-fijo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff6c7"/><stop offset="1" stopColor="#ffe5a7" stopOpacity=".9"/></linearGradient></defs>
            <path d="M510 620C535 588 487 567 515 530"/>
            <path d="M543 620C565 585 510 564 542 525"/>
            <path d="M568 620C588 594 548 577 576 549S606 533 614 524"/>
          </svg>
          <svg className="mision__ondas-fijas mision__ondas-fijas--aire" viewBox="0 0 1049 1500" aria-hidden="true">
            <defs><linearGradient id="mision-aire-fijo" gradientUnits="userSpaceOnUse" x1="627" y1="480" x2="504" y2="583"><stop offset="0" stopColor="#e1f9ff" stopOpacity="1"/><stop offset=".6" stopColor="#c9f3ff" stopOpacity=".95"/><stop offset="1" stopColor="#bfeffc" stopOpacity="0"/></linearGradient></defs>
            <path d="M606 477C605 512 561 541 486 551"/>
            <path d="M619 484C620 532 581 559 514 572"/>
            <path d="M633 490C634 547 600 580 551 594"/>
          </svg>
          <svg className="mision__calor" viewBox="0 0 100 100" aria-hidden="true"><path d="M28 85C8 65 44 53 28 30S19 12 27 5"/><path d="M52 85C32 65 68 53 52 30S43 12 51 5"/><path d="M76 85C56 65 92 53 76 30S67 12 75 5"/></svg>
          <svg className="mision__aire" viewBox="0 0 100 100" aria-hidden="true"><path d="M82 5Q80 45 10 55"/><path d="M91 11Q89 59 18 74"/><path d="M99 19Q95 73 25 92"/></svg>
        </div>
        {imagenError && <p className="mision__imagen-error" role="alert">No pudimos cargar la escena. Recargá la página para volver a intentar.</p>}
      </div>
      <section className="mision__decision" aria-labelledby="mision-pregunta">
        {fase === 'fin' ? <><h2 id="mision-pregunta">¡Gracias por explorar!</h2><p>Exploraste el living. Los otros dos ambientes estarán disponibles próximamente.</p><button className="mision__siguiente" ref={reinicio} onClick={onFinalizar ?? reiniciar}>{onFinalizar ? 'Finalizar experiencia' : 'Volver a probar'}<Flecha /></button></> : fresco ? <><h2 className="mision__titulo-resuelto" id="mision-pregunta"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="31"/><path d="m17 32 10 10 20-23"/></svg><span>¡Primer ambiente<br/>resuelto!</span></h2><p>La climatización transforma<br className="mision__salto"/> el confort del espacio.</p><button className="mision__siguiente" ref={siguiente} onClick={() => setFase('fin')}>Continuar<Flecha /></button></> : <><h2 id="mision-pregunta">En este ambiente hace<br className="mision__salto"/> demasiado calor.</h2><p>¿Qué solución elegirías?</p><p className="mision__pista" role="status">{pista ? 'Pensá qué solución ayuda a regular la temperatura del ambiente.' : fase === 'mejorando' ? 'Climatizando el ambiente…' : ''}</p><div className="mision__opciones">{opciones.map((texto, indice) => <button ref={indice === 0 ? primera : undefined} key={texto} className={fase === 'mejorando' && indice === 0 ? 'seleccionada' : ''} disabled={fase === 'mejorando'} aria-pressed={fase === 'mejorando' && indice === 0} onClick={() => elegir(indice)}><IconoOpcion indice={indice}/><span>{texto}</span><Flecha /></button>)}</div></>}
      </section>
      <footer>Concepto de juego · {fresco ? 'Solución ilustrativa' : 'Opciones ilustrativas'}</footer>
    </div>
  </main>
}
