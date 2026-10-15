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
import { asignarPreguntaDesbloqueo } from './services/desafio'
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
  const [preguntaDesafio, setPreguntaDesafio] = useState<PreguntaDesbloqueo | null>(null)
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
      const pregunta = await asignarPreguntaDesbloqueo(solicitud)
      if (solicitudRef.current === solicitud) setPreguntaDesafio(pregunta)
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
      const juego = await guardarRegistro(solicitudRef.current, datos, respuestas)
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
    setPreguntaDesafio(null)
    setCargandoDesafio(false)
    setErrorDesafio('')
    setErrorGuardado('')
    solicitudRef.current = null
    if (vistaPreviaRuleta) setCicloRuleta(ciclo => ciclo + 1)
    setPantalla(vistaPreviaRuleta ? 'ruleta' : 'bienvenida')
  }

  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('pantalla') === 'mision') return <MisionTermoarq />

  if (pantalla === 'mision') return <MisionTermoarq onFinalizar={finalizar} />

  if (pantalla === 'ruleta') return <Ruleta key={cicloRuleta} onFinalizar={finalizar} />
  if (pantalla === 'desafio') {
    return <Desafio pregunta={preguntaDesafio} cargandoPregunta={cargandoDesafio} errorPregunta={errorDesafio}
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
