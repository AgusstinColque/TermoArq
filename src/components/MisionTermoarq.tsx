import { PremioMision } from './PremioMision'
import { obtenerPremio } from '../services/premios'
import { EscenaEscaleras } from './EscenaEscaleras'
import { useEffect, useRef, useState } from 'react'
import { preguntasCasa, type AmbienteCasa, type OpcionCasa, type PreguntaCasa } from '../data/misionCasa'
import { MisionInicio } from './MisionInicio'
import { EscenaCasa } from './EscenaCasa'
import { EscenaLivingOriginal } from './EscenaLivingOriginal'
import '../styles/mision.css'
import '../styles/misionCasa.css'


function sortear(ambiente: AmbienteCasa, excluir?: number): PreguntaCasa {
  const banco = preguntasCasa.filter(pregunta => pregunta.ambiente === ambiente && pregunta.id !== excluir)
  const muestra = new Uint32Array(1)
  const limite = Math.floor(4294967296 / banco.length) * banco.length
  do { crypto.getRandomValues(muestra) } while (muestra[0]! >= limite)
  return banco[muestra[0]! % banco.length]!
}
export type ExperienciaMision = 'casa' | 'presurizacion'
function sortearExperiencia(): ExperienciaMision {
  const muestra = new Uint32Array(1)
  crypto.getRandomValues(muestra)
  return muestra[0]! % 2 === 0 ? 'casa' : 'presurizacion'
}
export function MisionTermoarq({ onFinalizar, experiencia, solicitud }: { onFinalizar?: () => void; experiencia?: ExperienciaMision; solicitud?: string | null }) {
  const [sesion, setSesion] = useState(() => ({ experiencia: experiencia ?? sortearExperiencia(), ciclo: 0 }))
  const [premio, setPremio] = useState<number | null>(null)
  const premioAsignado = useRef<number | null>(null)
  const bloqueoPremio = useRef(false)
  const [cerrando, setCerrando] = useState(false)
  const [errorPremio, setErrorPremio] = useState('')
  const mostrarPremio = async () => {
    if (bloqueoPremio.current) return
    bloqueoPremio.current = true
    setCerrando(true); setErrorPremio('')
    try {
      if (premioAsignado.current === null) premioAsignado.current = await obtenerPremio(solicitud)
      setPremio(premioAsignado.current)
    } catch (error) { setErrorPremio(error instanceof Error ? error.message : 'No pudimos confirmar tu premio. Volvé a intentar.') }
    finally { bloqueoPremio.current = false }
  }
  if (premio !== null) return <PremioMision indice={premio} onFinalizar={() => {
    if (onFinalizar) { onFinalizar(); return }
    setCerrando(false)
    premioAsignado.current = null
    setPremio(null)
    setSesion(actual => ({ experiencia: experiencia ?? sortearExperiencia(), ciclo: actual.ciclo + 1 }))
  }} />
  if (cerrando) return <main className="mision premio-mision"><div className="premio-mision__contenido"><img className="premio-mision__logo" src="/brand/termoarq-logo-blanco.svg" alt="Termoarq" width="300" height="53"/><h1>Tu misión está completa</h1>{errorPremio ? <><p role="alert">{errorPremio}</p><button type="button" onClick={() => { void mostrarPremio() }}>Reintentar</button></> : <p role="status">Preparando tu premio…</p>}</div></main>
  return <ExperienciaSeleccionada key={sesion.ciclo} experiencia={sesion.experiencia} onFinalizar={() => { void mostrarPremio() }} />
}
function ExperienciaSeleccionada({ onFinalizar, experiencia }: { onFinalizar: () => void; experiencia: ExperienciaMision }) {
  const [partida, setPartida] = useState(() => ({ living: sortear('living'), dormitorio: sortear('dormitorio'), escaleras: sortear('escaleras') }))
  const [ambiente, setAmbiente] = useState<AmbienteCasa | null>(null)
  const [respuestas, setRespuestas] = useState<Partial<Record<AmbienteCasa, OpcionCasa>>>({})
  const completados = (['living', 'dormitorio'] as const).filter(id => respuestas[id] !== undefined)
  const finalizar = () => {
    if (onFinalizar) { onFinalizar(); return }
    setPartida({ living: sortear('living'), dormitorio: sortear('dormitorio'), escaleras: sortear('escaleras') })
    setRespuestas({})
    setAmbiente(null)
  }
  if (experiencia === 'presurizacion') return <DesafioPresurizacion onFinalizar={onFinalizar} />
  if (!ambiente) return <MisionInicio completados={completados} onExplorar={setAmbiente} onFinalizar={finalizar} />
  return <DesafioCasa key={ambiente} pregunta={partida[ambiente]} respuesta={respuestas[ambiente]}
    completados={completados} onResponder={respuesta => setRespuestas(actual => ({ ...actual, [ambiente]: respuesta }))}
    onVolver={() => setAmbiente(null)} />
}
function DesafioPresurizacion({ onFinalizar }: { onFinalizar: () => void }) {
  const [preguntas] = useState(() => {
    const primera = sortear('escaleras')
    return [primera, sortear('escaleras', primera.id)] as const
  })
  const [paso, setPaso] = useState<0 | 1>(0)
  const [respuestas, setRespuestas] = useState<Partial<Record<number, OpcionCasa>>>({})
  const pregunta = preguntas[paso]
  return <DesafioCasa key={pregunta.id} pregunta={pregunta} numeroPregunta={paso + 1}
    respuesta={respuestas[pregunta.id]} completados={[]}
    onResponder={respuesta => setRespuestas(actual => ({ ...actual, [pregunta.id]: respuesta }))}
    onVolver={() => { if (respuestas[pregunta.id] === undefined) return; if (paso === 0) setPaso(1); else onFinalizar() }} />
}
function DesafioCasa({ pregunta, respuesta, completados, onResponder, onVolver, numeroPregunta = 1 }: {
  numeroPregunta?: number; pregunta: PreguntaCasa; respuesta?: OpcionCasa; completados: AmbienteCasa[]; onResponder: (respuesta: OpcionCasa) => void; onVolver: () => void
}) {
  const titulo = useRef<HTMLHeadingElement>(null)
  const feedback = useRef<HTMLHeadingElement>(null)
  const bloqueo = useRef(false)
  const [imagenError, setImagenError] = useState(false)
  const resuelto = respuesta !== undefined
  useEffect(() => { titulo.current?.focus({ preventScroll: true }); window.scrollTo(0, 0) }, [])
  useEffect(() => { if (resuelto) feedback.current?.focus({ preventScroll: true }) }, [resuelto])
  const responder = (opcion: OpcionCasa) => {
    if (bloqueo.current || resuelto) return
    bloqueo.current = true
    onResponder(opcion)
  }
  return <main className={'mision casa-desafio casa-desafio--' + pregunta.ambiente + ' ' + (resuelto ? 'casa-desafio--resuelta' : '')} aria-labelledby="casa-titulo">
    <div className="casa-desafio__contenido">
      <header className="casa-desafio__cabecera">
        {pregunta.ambiente !== 'escaleras' && <button type="button" onClick={onVolver} aria-label="Volver a los ambientes"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6"/></svg></button>}
        <img src="/brand/termoarq-logo-blanco.svg" alt="Termoarq" width="300" height="53"/>
      </header>
      <h1 id="casa-titulo" ref={titulo} tabIndex={-1}>Misión Termoarq</h1>
      <p className="casa-desafio__progreso">{pregunta.ambiente === 'escaleras' ? 'Presurización de escaleras · Pregunta ' + numeroPregunta + ' de 2' : completados.length + ' de 2 ambientes explorados'}</p>
      <div className={'casa-desafio__escena casa-desafio__escena--' + pregunta.ambiente}>
        {pregunta.ambiente === 'escaleras'
          ? <EscenaEscaleras activa={resuelto} />
          : pregunta.ambiente === 'living'
          ? <EscenaLivingOriginal fresco={resuelto} onError={() => setImagenError(true)} />
          : <EscenaCasa destacarDormitorio activos={completados} calientes={[pregunta.ambiente]} onError={() => setImagenError(true)} />}
        {imagenError && <p role="alert">No pudimos cargar la casa. Podés continuar con la pregunta.</p>}
      </div>
      <section className="casa-desafio__decision" aria-labelledby="casa-pregunta">
        <h2 id="casa-pregunta">{pregunta.pregunta}</h2>
        {!resuelto ? <><p>Elegí una respuesta.</p><div className="casa-desafio__opciones">{pregunta.opciones.map(opcion =>
          <button key={opcion.id} type="button" onClick={() => responder(opcion.id)}><span aria-hidden="true">{opcion.id.toUpperCase()}</span>{opcion.texto}</button>
        )}</div></> : <div className="casa-desafio__respuesta">
          <h3 ref={feedback} tabIndex={-1}>{respuesta === pregunta.correcta ? '¡Correcto!' : 'Conozcamos la solución'}</h3>
          {respuesta !== pregunta.correcta && <p>Elegiste: {pregunta.opciones.find(opcion => opcion.id === respuesta)?.texto}</p>}
          <p><strong>Respuesta correcta:</strong> {pregunta.opciones.find(opcion => opcion.id === pregunta.correcta)?.texto}</p>
          <p>{pregunta.explicacion}</p>
          <button type="button" onClick={onVolver}>{pregunta.ambiente === 'escaleras' ? (numeroPregunta === 1 ? 'Siguiente pregunta' : 'Ver mi premio') : completados.length === 2 ? 'Completar misión' : 'Seguir explorando'}</button>
        </div>}
      </section>
      <footer></footer>
    </div>
  </main>
}

