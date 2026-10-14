import { sortearPremio } from '../domain/ruleta'
import { createElement, useEffect, useId, useRef, useState } from 'react'
import { disenoRuleta, simboloRuleta } from '../data/ruletaDiseno'
import '../styles/ruleta.css'
import { AireTurbina } from './AireTurbina'

type Fase = 'lista' | 'activando' | 'girando' | 'resultado'

function IconoPremio({ indice }: { indice: number }) {
  return <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
    {disenoRuleta.premios[indice]!.formas.map((forma, clave) => createElement(forma.tipo, { ...forma.atributos, key: clave }))}
  </g>
}

function SimboloMarca() {
  return <g>{simboloRuleta.map((forma, indice) => <path key={indice} d={forma} fill="currentColor" />)}</g>
}



export function Ruleta({ onFinalizar }: { onFinalizar: () => void }) {
  const prefijo = `turbina-${useId().replace(/:/g, '')}`
  const material = (nombre: string) => `url(#${prefijo}-${nombre})`
  const [fase, setFase] = useState<Fase>('lista')
  const [angulo, setAngulo] = useState(0)
  const [premio, setPremio] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [movimientoAire, setMovimientoAire] = useState<Animation | null>(null)
  const rotorRef = useRef<SVGGElement>(null)
  const etiquetasRef = useRef<(SVGGElement | null)[]>([])
  const dialogoRef = useRef<HTMLDialogElement>(null)
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const animacionesRef = useRef<Animation[]>([])
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bloqueoRef = useRef(false)
  const activoRef = useRef(true)

  useEffect(() => {
    activoRef.current = true
    tituloRef.current?.focus({ preventScroll: true })
    return () => {
      activoRef.current = false
      animacionesRef.current.forEach(animacion => animacion.cancel())
      if (temporizadorRef.current) clearTimeout(temporizadorRef.current)
    }
  }, [])

  const pausar = (ms: number) => new Promise<void>(resolver => {
    temporizadorRef.current = setTimeout(resolver, ms)
  })

  const girar = async () => {
    if (bloqueoRef.current || !rotorRef.current) return
    bloqueoRef.current = true
    setError('')
    setPremio(null)
    setFase('activando')
    const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches
    const indice = sortearPremio()
    // Geometría original: centro del borde de cada aspa en -108 + índice * 60.
    const objetivo = 18 - indice * 60
    const siguiente = angulo + (reducido ? 360 : 1800) + ((objetivo - angulo) % 360 + 360) % 360
    try {
      await pausar(180)
      if (!activoRef.current) return
      setFase('girando')
      const opciones: KeyframeAnimationOptions = { duration: reducido ? 3200 : 4800, easing: 'cubic-bezier(.42,0,.12,1)', fill: 'forwards' }
      const movimiento = rotorRef.current.animate([
        { transform: `rotate(${angulo}deg)` }, { transform: `rotate(${siguiente}deg)` },
      ], opciones)
      animacionesRef.current = [movimiento]
      setMovimientoAire(movimiento)
      etiquetasRef.current.forEach(etiqueta => {
        if (etiqueta) animacionesRef.current.push(etiqueta.animate([
          { transform: `rotate(${-angulo}deg)` }, { transform: `rotate(${-siguiente}deg)` },
        ], opciones))
      })
      await movimiento.finished
      if (!activoRef.current) return
      rotorRef.current.style.transform = `rotate(${siguiente}deg)`
      etiquetasRef.current.forEach(etiqueta => { if (etiqueta) etiqueta.style.transform = `rotate(${-siguiente}deg)` })
      animacionesRef.current.forEach(animacion => animacion.cancel())
      animacionesRef.current = []
      setMovimientoAire(null)
      setAngulo(siguiente)
      setPremio(indice)
      setFase('resultado')
      await pausar(700)
      if (activoRef.current) dialogoRef.current?.showModal()
    } catch {
      if (!activoRef.current) return
      animacionesRef.current.forEach(animacion => animacion.cancel())
      animacionesRef.current = []
      bloqueoRef.current = false
      setMovimientoAire(null)
      setFase('lista')
      setError('No pudimos completar el giro. Volvé a intentar.')
    }
  }
  const enMovimiento = fase === 'activando' || fase === 'girando'
  const textoBoton = fase === 'activando' ? 'Activando…' : fase === 'girando' ? 'Girando…' : fase === 'resultado' ? '¡Listo!' : error ? 'Volver a intentar' : 'Girar'

  return <main className="ruleta" aria-labelledby="ruleta-titulo">
    <div className="ruleta__contenido">
      <header><img className="ruleta__logo" src="/brand/termoarq-logo-blanco.svg" alt="Termoarq, constructora termomecánica" width="300" height="53" /></header>
      <h1 id="ruleta-titulo" ref={tituloRef} tabIndex={-1}>Activá tu premio.</h1>
      <p className="ruleta__intro">Un toque. Un giro. Una sorpresa.</p>
      <div className={`ruleta__escenario ruleta__escenario--${fase}`}>
        <svg className="ruleta__turbina" viewBox="0 0 700 700" role="img" aria-label="Ruleta con seis premios de ejemplo inspirada en una turbina">
          <defs>
            <linearGradient id={`${prefijo}-carcasa`} x1=".15" y1="0" x2=".85" y2="1">
              <stop offset="0" stopColor="#8aadb9" /><stop offset=".18" stopColor="#416779" />
              <stop offset=".48" stopColor="#183e51" /><stop offset=".8" stopColor="#0c293a" /><stop offset="1" stopColor="#3b6172" />
            </linearGradient>
            <linearGradient id={`${prefijo}-bisel`} x1="0" y1="0" x2=".8" y2="1">
              <stop stopColor="#b5cdd5" /><stop offset=".38" stopColor="#4b7283" /><stop offset="1" stopColor="#143345" />
            </linearGradient>
            <radialGradient id={`${prefijo}-interior`} cx=".4" cy=".32" r=".75">
              <stop stopColor="#183f52" /><stop offset=".82" stopColor="#092432" /><stop offset="1" stopColor="#051923" />
            </radialGradient>
            <linearGradient id={`${prefijo}-aspa-clara`} x1=".12" y1="0" x2=".88" y2="1">
              <stop stopColor="#578da3" /><stop offset=".28" stopColor="#3c7891" /><stop offset=".7" stopColor="#2b5e76" /><stop offset="1" stopColor="#173e54" />
            </linearGradient>
            <linearGradient id={`${prefijo}-aspa-oscura`} x1=".12" y1="0" x2=".88" y2="1">
              <stop stopColor="#37677c" /><stop offset=".28" stopColor="#245369" /><stop offset=".7" stopColor="#183e53" /><stop offset="1" stopColor="#102d40" />
            </linearGradient>
            <linearGradient id={`${prefijo}-premio`} x1="0" y1="0" x2=".7" y2="1">
              <stop stopColor="#f1f8fb" /><stop offset=".5" stopColor="#dcecf2" /><stop offset="1" stopColor="#a6c6d3" />
            </linearGradient>
            <linearGradient id={`${prefijo}-tapa`} x1=".2" y1="0" x2=".7" y2="1">
              <stop stopColor="#f1f8fa" /><stop offset=".4" stopColor="#dcebf0" /><stop offset="1" stopColor="#92b5c5" />
            </linearGradient>
            <linearGradient id={`${prefijo}-luz`} x1="0" y1="0" x2=".75" y2="1">
              <stop stopColor="#d5e8f0" stopOpacity=".25" /><stop offset=".4" stopColor="#b6d6e4" stopOpacity="0" /><stop offset="1" stopColor="#03131e" stopOpacity=".16" />
            </linearGradient>
            <filter id={`${prefijo}-sombra`} x="-20%" y="-20%" width="140%" height="150%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <g aria-hidden="true">
            <ellipse cx="350" cy="659" rx="225" ry="18" fill="#061a25" opacity=".45" filter={material('sombra')} />
            <circle cx="350" cy="359" r="330" fill="#071f2d" />
            <circle cx="350" cy="350" r="330" fill={material('carcasa')} stroke="#173b4d" strokeWidth="1" />
            <circle cx="350" cy="350" r="328" fill="none" stroke={material('bisel')} strokeWidth="1.5" />
            <circle cx="350" cy="350" r="314" fill={material('interior')} stroke="#071f2d" strokeWidth="3" />
            <circle cx="350" cy="350" r="311" fill="none" stroke="#7093a3" strokeOpacity=".35" strokeWidth="1" />
          </g>
          <g ref={rotorRef} className="ruleta__rotor" style={{ transform: `rotate(${angulo}deg)` }}>
            <g className="ruleta__aspas">
              <g transform="translate(0 5)" fill="#051c28" opacity=".7" aria-hidden="true">
                {disenoRuleta.aspas.map((forma, indice) => <path key={indice} d={forma} />)}
              </g>
              {disenoRuleta.aspas.map((forma, indice) => <g key={indice}>
                <path className={`ruleta__aspa${premio === indice ? ' ruleta__aspa--ganadora' : ''}`}
                  d={forma} fill={material(premio === indice ? 'premio' : indice % 2 === 0 ? 'aspa-clara' : 'aspa-oscura')}
                  stroke="#102d3d" strokeWidth="1.3" />
                <path d={forma} fill="none" stroke="#cae3ec" strokeOpacity=".2" strokeWidth=".8" transform="translate(0 -1)" aria-hidden="true" />
              </g>)}
            </g>
            {disenoRuleta.premios.map((item, indice) => <g key={item.nombre} transform={item.posicion}>
              <g ref={elemento => { etiquetasRef.current[indice] = elemento }} className="ruleta__premio" style={{ transform: `rotate(${-angulo}deg)` }} color={premio === indice ? '#123E52' : '#FFFFFF'}>
                <IconoPremio indice={indice} />
                <text fill="currentColor" textAnchor="middle" fontSize="20" fontWeight="600">{item.lineas.map((linea, lineaIndice) => <tspan key={linea} x="0" y={item.lineas.length === 1 ? 61 : 55 + lineaIndice * 23}>{linea}</tspan>)}</text>
              </g>
            </g>)}
          </g>
          <circle cx="350" cy="350" r="304" fill={material('luz')} pointerEvents="none" aria-hidden="true" />
          <g className="ruleta__cubo" aria-hidden="true">
            <circle cx="350" cy="362" r="60" fill="#031521" opacity=".6" filter={material('sombra')} />
            <circle cx="350" cy="354" r="59" fill="#0a2838" stroke="#071e2b" strokeWidth="2" />
            <circle cx="350" cy="347" r="56" fill={material('tapa')} stroke="#759aa9" strokeWidth="1.5" />
            <circle cx="350" cy="347" r="53.5" fill="none" stroke="#f0f8fb" strokeOpacity=".45" strokeWidth="1" />
            <svg className="ruleta__marca" x="329" y="323" width="42" height="48" viewBox="0 0 47 53"><SimboloMarca /></svg>
          </g>
          <g aria-hidden="true">
            <path d="M330 12H370L350 49Z" transform="translate(0 4)" fill="#061e2b" opacity=".6" />
            <path d="M330 12H370L350 49Z" fill={material('tapa')} stroke="#7899a9" strokeWidth="1" />
            <path d="M332 13H368" stroke="#f2f8fb" strokeOpacity=".85" strokeWidth="1.5" />
          </g>
        </svg>
        <AireTurbina movimiento={movimientoAire} />
      </div>
      <div className="ruleta__pie">
        {error && <p className="ruleta__error" role="alert">{error}</p>}
        <button className="ruleta__girar" type="button" onClick={() => { void girar() }} disabled={fase !== 'lista'} aria-busy={enMovimiento}>
          <span>{textoBoton}</span><svg aria-hidden="true" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 14H24M16 6L24 14 16 22" /></svg>
        </button>
        <p className="ruleta__nota"></p>
        <p className="ruleta__estado" role="status">{enMovimiento ? 'La turbina está girando.' : premio !== null ? `Resultado de ejemplo: ${disenoRuleta.premios[premio]!.nombre}.` : ''}</p>
      </div>
    </div>
    <dialog ref={dialogoRef} className="ruleta__resultado" aria-labelledby="premio-titulo" aria-describedby="premio-retiro premio-nota" onCancel={evento => evento.preventDefault()}>
      {premio !== null && <>
        <img className="ruleta__resultado-marca" src="/brand/termoarq-simbolo.svg" alt="" width="30" height="34" />
        <div className="ruleta__resultado-arte" aria-hidden="true">
          <svg viewBox="-60 -60 120 120" color="#123E52"><IconoPremio indice={premio} /><g transform="translate(28,28) scale(.27)"><SimboloMarca /></g></svg>
        </div>
        <h2 id="premio-titulo">{disenoRuleta.premios[premio]!.titular}</h2>
        <p id="premio-retiro">{disenoRuleta.premios[premio]!.retiro}</p>
        <button className="ruleta__finalizar" type="button" onClick={onFinalizar} autoFocus>Finalizar</button>
        <p id="premio-nota" className="ruleta__resultado-nota"></p>
      </>}
    </dialog>
  </main>
}
