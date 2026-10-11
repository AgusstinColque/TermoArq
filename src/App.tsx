import { useRef, useState } from 'react'
import { Desafio } from './components/Desafio'
import { Bienvenida } from './components/Bienvenida'
import { DatosCliente } from './components/DatosCliente'
import { PreguntasProyecto } from './components/PreguntasProyecto'
import { Ruleta } from './components/Ruleta'
import { type DatosContacto } from './lib/datosContacto'
import { type RespuestasProyecto } from './lib/preguntasProyecto'
import { guardarRegistro, nuevaSolicitud } from './lib/registro'
import { useDesplazamiento } from './lib/useDesplazamiento'

const vistaPreviaRuleta = import.meta.env.DEV && new URLSearchParams(window.location.search).get('pantalla') === 'ruleta'

export default function App() {
  const [pantalla, setPantalla] = useState<'bienvenida' | 'datos' | 'preguntas' | 'desafio' | 'ruleta'>(vistaPreviaRuleta ? 'ruleta' : 'bienvenida')
  const [cicloRuleta, setCicloRuleta] = useState(0)
  const [datos, setDatos] = useState<DatosContacto>({ nombre: '', apellido: '', contacto: '', consentimiento: false })
  const [respuestas, setRespuestas] = useState<RespuestasProyecto>({ servicio: '', proyecto: '', etapa: '' })
  const [respuestaDesafio, setRespuestaDesafio] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState('')
  const solicitudRef = useRef<{ id: string; contenido: string } | null>(null)
  const bloqueoRef = useRef(false)
  useDesplazamiento(pantalla)

  const iniciarJuego = async () => {
    if (bloqueoRef.current) return
    bloqueoRef.current = true
    setGuardando(true)
    setErrorGuardado('')
    const contenido = JSON.stringify({ datos, respuestas })
    if (!solicitudRef.current || solicitudRef.current.contenido !== contenido) {
      solicitudRef.current = { id: nuevaSolicitud(), contenido }
    }
    try {
      await guardarRegistro(solicitudRef.current.id, datos, respuestas)
      setPantalla('ruleta')
    } catch (error) {
      setErrorGuardado(error instanceof Error ? error.message : 'No pudimos guardar el registro. Volvé a intentar.')
    } finally {
      bloqueoRef.current = false
      setGuardando(false)
    }
  }
  const finalizar = () => {
    setDatos({ nombre: '', apellido: '', contacto: '', consentimiento: false })
    setRespuestas({ servicio: '', proyecto: '', etapa: '' })
    setRespuestaDesafio('')
    setErrorGuardado('')
    solicitudRef.current = null
    if (vistaPreviaRuleta) setCicloRuleta(ciclo => ciclo + 1)
    setPantalla(vistaPreviaRuleta ? 'ruleta' : 'bienvenida')
  }

  if (pantalla === 'ruleta') return <Ruleta key={cicloRuleta} onFinalizar={finalizar} />
  if (pantalla === 'desafio') {
    return <Desafio respuesta={respuestaDesafio} onCambiar={setRespuestaDesafio} onVolver={() => { setErrorGuardado(''); setPantalla('preguntas') }}
      onJugar={() => { void iniciarJuego() }} guardando={guardando} errorGuardado={errorGuardado} />
  }
  if (pantalla === 'preguntas') {
    return <PreguntasProyecto respuestas={respuestas} onCambiar={setRespuestas} onVolver={() => setPantalla('datos')}
      onContinuar={nuevasRespuestas => { setRespuestas(nuevasRespuestas); setPantalla('desafio') }} />
  }
  if (pantalla === 'datos') {
    return <DatosCliente datos={datos} onCambiar={setDatos} onVolver={() => setPantalla('bienvenida')} vistaPrevia
      onContinuar={nuevosDatos => { setDatos(nuevosDatos); setPantalla('preguntas') }} />
  }
  return <Bienvenida onComenzar={() => setPantalla('datos')} />
}
