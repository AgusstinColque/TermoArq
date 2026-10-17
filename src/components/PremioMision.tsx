import { createElement, useEffect, useRef } from 'react'
import { disenoRuleta } from '../data/ruletaDiseno'
import '../styles/premioMision.css'

export function PremioMision({ indice, onFinalizar }: { indice: number; onFinalizar: () => void }) {
  const titulo = useRef<HTMLHeadingElement>(null)
  const premio = disenoRuleta.premios[indice]!
  useEffect(() => { window.scrollTo(0, 0); titulo.current?.focus({ preventScroll: true }) }, [])
  return <main className="mision premio-mision" aria-labelledby="mision-premio-titulo">
    <div className="premio-mision__contenido">
      <img className="premio-mision__logo" src="/brand/termoarq-logo-aprobado-blanco.svg" alt="Termoarq" width="300" height="53"/>
      <h1 id="mision-premio-titulo" ref={titulo} tabIndex={-1}>¡Misión cumplida!</h1>
      <p className="premio-mision__intro">Completaste la experiencia y ganaste un premio.</p>
      <div className="premio-mision__resultado">
        <svg className="premio-mision__icono" viewBox="-60 -60 120 120" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{premio.formas.map((forma, key) => createElement(forma.tipo, { ...forma.atributos, key }))}</g></svg>
        <h2>{premio.titular}</h2><p>{premio.retiro}</p>
      </div>
      <button type="button" onClick={onFinalizar}>Finalizar</button>
    </div>
  </main>
}
