import { useRef, useState } from 'react'
import { Desafio } from './components/Desafio'
import { Bienvenida } from './components/Bienvenida'
import { DatosCliente } from './components/DatosCliente'
import { PreguntasProyecto } from './components/PreguntasProyecto'
import { Ruleta } from './components/Ruleta'
import { MisionTermoarq } from './components/MisionTermoarq'
import { type DatosContacto } from './domain/datosContacto'
import { type RespuestasProyecto } from './domain/preguntasProyecto'
import { guardarRegistro, nuevaSolicitud, comprobarDisponibilidad } from './services/registro'
import { asignarDesafiosDesbloqueo } from './services/desafio'
import { type PreguntaDesbloqueo } from './data/desafioInicial'
import { useDesplazamiento } from './hooks/useDesplazamiento'

const vistaPreviaRuleta = import.meta.env.DEV && new URLSearchParams(window.location.search).get('pantalla') === 'ruleta'
const vistaPreviaDatos = import.meta.env.DEV && new URLSearchParams(window.location.search).get('pantalla') === 'datos'

export default function App() {
  const [pantalla, setPantalla] = useState<'bienvenida' | 'datos' | 'preguntas' | 'desafio' | 'ruleta' | 'mision'>(vistaPreviaRuleta ? 'ruleta' : vistaPreviaDatos ? 'datos' : 'bienvenida')
  const [cicloRuleta, setCicloRuleta] = useState(0)
  const [datos, setDatos] = useState<DatosContacto>({ nombre: '', apellido: '', correo: '', telefono: '', consentimiento: false })
  const [respuestas, setRespuestas] = useState<RespuestasProyecto>({ servicio: '', proyecto: '', etapa: '' })
  const [respuestaDesafio, setRespuestaDesafio] = useState('')
  const [preguntasDesafio, setPreguntasDesafio] = useState<PreguntaDesbloqueo[]>([])
  const [indiceDesafio, setIndiceDesafio] = useState(0)
  const preguntaDesafio = preguntasDesafio[indiceDesafio] ?? null
  const [cargandoDesafio, setCargandoDesafio] = useState(false)
  const [errorDesafio, setErrorDesafio] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState('')
  const solicitudRef = useRef<string | null>(null)
  const bloqueoRef = useRef(false)
  useDesplazamiento(pantalla)

  const cargarDesafio = async (solicitud: string) => {
    setCargandoDesafio(true)
    setErrorDesafio('')
    try {
      const preguntas = await asignarDesafiosDesbloqueo(solicitud)
      if (solicitudRef.current === solicitud) setPreguntasDesafio(preguntas)
    } catch (error) {
      if (solicitudRef.current === solicitud) {
        setErrorDesafio(error instanceof Error ? error.message : 'No pudimos cargar tu pregunta. Volvé a intentar.')
      }
    } finally {
      if (solicitudRef.current === solicitud) setCargandoDesafio(false)
    }
  }

  const prepararDesafio = () => {
    const solicitud = solicitudRef.current ?? nuevaSolicitud()
    solicitudRef.current = solicitud
    setPantalla('desafio')
    if (!preguntaDesafio) void cargarDesafio(solicitud)
  }

  const iniciarJuego = async () => {
    if (bloqueoRef.current) return
    bloqueoRef.current = true
    setGuardando(true)
    setErrorGuardado('')
    try {
      if (!solicitudRef.current || !preguntaDesafio) throw new Error('No pudimos confirmar tu pregunta. Volvé a intentar.')
      if (indiceDesafio + 1 < preguntasDesafio.length) {
        setIndiceDesafio(indice => indice + 1)
        setRespuestaDesafio('')
        return
      }
      const juego = await guardarRegistro(solicitudRef.current, datos, respuestas)
      // La configuración puede cambiar mientras la persona responde. La ruleta
      // confirmada por el registro nunca se abre sin el segundo desafío.
      if (juego === 'ruleta' && preguntasDesafio.length < 2) {
        const preguntas = await asignarDesafiosDesbloqueo(solicitudRef.current, 'ruleta')
        setPreguntasDesafio(preguntas)
        setIndiceDesafio(1)
        setRespuestaDesafio('')
        return
      }
      setPantalla(juego)
    } catch (error) {
      setErrorGuardado(error instanceof Error ? error.message : 'No pudimos guardar el registro. Volvé a intentar.')
    } finally {
      bloqueoRef.current = false
      setGuardando(false)
    }
  }
  const comenzar = async () => {
    if (bloqueoRef.current) return
    bloqueoRef.current = true
    setGuardando(true); setErrorGuardado('')
    try { await comprobarDisponibilidad(); setPantalla('datos') }
    catch (error) { setErrorGuardado(error instanceof Error ? error.message : 'No pudimos conectar. Volvé a intentar.') }
    finally { bloqueoRef.current = false; setGuardando(false) }
  }
  const finalizar = () => {
    setDatos({ nombre: '', apellido: '', correo: '', telefono: '', consentimiento: false })
    setRespuestas({ servicio: '', proyecto: '', etapa: '' })
    setRespuestaDesafio('')
    setPreguntasDesafio([])
    setIndiceDesafio(0)
    setCargandoDesafio(false)
    setErrorDesafio('')
    setErrorGuardado('')
    solicitudRef.current = null
    if (vistaPreviaRuleta) setCicloRuleta(ciclo => ciclo + 1)
    setPantalla(vistaPreviaRuleta ? 'ruleta' : 'bienvenida')
  }

  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('pantalla') === 'mision') return <MisionTermoarq experiencia={new URLSearchParams(window.location.search).get('experiencia') === 'casa' ? 'casa' : new URLSearchParams(window.location.search).get('experiencia') === 'presurizacion' ? 'presurizacion' : undefined} />

  if (pantalla === 'mision') return <MisionTermoarq onFinalizar={finalizar} />

  if (pantalla === 'ruleta') return <Ruleta key={cicloRuleta} onFinalizar={finalizar} />
  if (pantalla === 'desafio') {
    return <Desafio key={preguntaDesafio?.id ?? 'cargando'} numeroPregunta={indiceDesafio + 1} totalPreguntas={preguntasDesafio.length || 1} pregunta={preguntaDesafio} cargandoPregunta={cargandoDesafio} errorPregunta={errorDesafio}
      onReintentar={() => { if (solicitudRef.current) void cargarDesafio(solicitudRef.current) }}
      respuesta={respuestaDesafio} onCambiar={setRespuestaDesafio} onVolver={() => { setErrorGuardado(''); setPantalla('preguntas') }}
      onJugar={() => { void iniciarJuego() }} guardando={guardando} errorGuardado={errorGuardado} />
  }
  if (pantalla === 'preguntas') {
    return <PreguntasProyecto respuestas={respuestas} onCambiar={setRespuestas} onVolver={() => setPantalla('datos')}
      onContinuar={nuevasRespuestas => { setRespuestas(nuevasRespuestas); prepararDesafio() }} />
  }
  if (pantalla === 'datos') {
    return <DatosCliente datos={datos} onCambiar={setDatos} onVolver={() => setPantalla('bienvenida')} vistaPrevia
      onContinuar={nuevosDatos => { setDatos(nuevosDatos); setPantalla('preguntas') }} />
  }
  return <Bienvenida onComenzar={() => { void comenzar() }} cargando={guardando} error={errorGuardado} />
}
