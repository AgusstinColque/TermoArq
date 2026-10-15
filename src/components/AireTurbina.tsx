import { useEffect, useRef } from 'react'

interface AireTurbinaProps {
  movimiento: Animation | null
}

interface Particula {
  sector: number
  desvio: number
  fase: number
  avance: number
  tamano: number
  brillo: number
}

function suavizar(desde: number, hasta: number, valor: number) {
  const t = Math.max(0, Math.min(1, (valor - desde) / (hasta - desde)))
  return t * t * (3 - 2 * t)
}

function crearParticulas(cantidad: number): Particula[] {
  let semilla = 2166136261
  const azar = () => {
    semilla ^= semilla << 13
    semilla ^= semilla >>> 17
    semilla ^= semilla << 5
    return (semilla >>> 0) / 4294967296
  }
  return Array.from({ length: cantidad }, (_, indice) => ({
    sector: indice % 6,
    desvio: azar() * 2 - 1,
    fase: azar(),
    avance: 1.05 + azar() * .55,
    tamano: .45 + azar() * .8,
    brillo: .36 + azar() * .34,
  }))
}

export function AireTurbina({ movimiento }: AireTurbinaProps) {
  const lienzoRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const lienzo = lienzoRef.current
    if (!lienzo || !movimiento) return
    const contexto = lienzo.getContext('2d')
    if (!contexto) return

    const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches
    const particulas = crearParticulas(reducido ? 180 : 480)
    let cantidadVisible = particulas.length
    let ultimoCuadro = 0
    let cuadrosLentos = 0
    let cuadrosMedidos = 0
    let ancho = 0
    let alto = 0
    let escala = 1
    let densidad = 1
    let cuadro = 0
    let visible = true
    let terminado = false

    const limpiar = () => {
      contexto.setTransform(1, 0, 0, 1, 0, 0)
      contexto.clearRect(0, 0, lienzo.width, lienzo.height)
    }
    const medir = () => {
      const rectangulo = lienzo.getBoundingClientRect()
      ancho = rectangulo.width
      alto = rectangulo.height
      // El SVG de la ruleta conserva su nitidez; el lienzo de partículas no
      // necesita multiplicar píxeles en pantallas táctiles de alta densidad.
      densidad = 1
      lienzo.width = Math.max(1, Math.round(ancho * densidad))
      lienzo.height = Math.max(1, Math.round(alto * densidad))
      escala = (lienzo.parentElement?.parentElement?.getBoundingClientRect().width || ancho) / 700
    }
    const dibujar = (tiempo: number) => {
      cuadro = 0
      if (ultimoCuadro && tiempo - ultimoCuadro > 24) cuadrosLentos++
      ultimoCuadro = tiempo
      if (++cuadrosMedidos === 16) {
        if (cuadrosLentos >= 5) cantidadVisible = Math.max(180, Math.floor(cantidadVisible * .7))
        cuadrosMedidos = 0
        cuadrosLentos = 0
      }
      limpiar()
      const duracion = Number(movimiento.effect?.getComputedTiming().duration) || 4800
      const progreso = (Number(movimiento.currentTime) || 0) / duracion
      if (progreso >= 1 || movimiento.playState === 'idle') {
        terminado = true
        return
      }

      const intensidad = suavizar(0, .18, progreso) * (1 - suavizar(.65, .99, progreso))
      contexto.setTransform(densidad * escala, 0, 0, densidad * escala, ancho * densidad / 2, alto * densidad / 2)
      contexto.globalCompositeOperation = 'screen'

      // La presión ilumina apenas el borde; el desplazamiento visible lo dan
      // partículas diminutas que avanzan en espiral y se dispersan hacia fuera.
      const presion = contexto.createRadialGradient(0, 0, 314, 0, 0, 388)
      presion.addColorStop(0, 'rgba(160, 212, 234, 0)')
      presion.addColorStop(.2, `rgba(160, 212, 234, ${.055 * intensidad})`)
      presion.addColorStop(.52, `rgba(160, 212, 234, ${.035 * intensidad})`)
      presion.addColorStop(1, 'rgba(160, 212, 234, 0)')
      contexto.fillStyle = presion
      contexto.beginPath()
      contexto.arc(0, 0, 388, 0, Math.PI * 2)
      contexto.fill()

      for (let indice = 0; indice < cantidadVisible; indice++) {
        const particula = particulas[indice]!
        const edad = (particula.fase + progreso * particula.avance) % 1
        const radio = 276 + 124 * suavizar(0, 1, edad)
        const angulo = particula.sector * Math.PI / 3 + progreso * Math.PI * 3.2 - edad * .9 + particula.desvio * (.07 + edad * .08)
        const aparicion = suavizar(0, .2, edad) * (1 - suavizar(.68, 1, edad))
        const opacidad = particula.brillo * aparicion * intensidad * (reducido ? .5 : 1)
        if (opacidad < .015) continue
        contexto.fillStyle = `rgba(188, 225, 241, ${opacidad})`
        contexto.beginPath()
        contexto.arc(Math.cos(angulo) * radio, Math.sin(angulo) * radio, particula.tamano, 0, Math.PI * 2)
        contexto.fill()
      }

      contexto.globalCompositeOperation = 'source-over'
      cuadro = requestAnimationFrame(dibujar)
    }
    const actualizarVisibilidad = () => {
      cancelAnimationFrame(cuadro)
      cuadro = 0
      ultimoCuadro = 0
      if (!document.hidden && visible && !terminado) cuadro = requestAnimationFrame(dibujar)
    }

    medir()
    const medidas = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(medir) : null
    medidas?.observe(lienzo)
    window.addEventListener('resize', medir)
    const observador = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([entrada]) => {
      visible = entrada?.isIntersecting ?? true
      actualizarVisibilidad()
    }, { rootMargin: '80px' }) : null
    observador?.observe(lienzo)
    document.addEventListener('visibilitychange', actualizarVisibilidad)
    actualizarVisibilidad()
    return () => {
      cancelAnimationFrame(cuadro)
      medidas?.disconnect()
      observador?.disconnect()
      window.removeEventListener('resize', medir)
      document.removeEventListener('visibilitychange', actualizarVisibilidad)
      limpiar()
    }
  }, [movimiento])

  return <div className="ruleta__viento" aria-hidden="true"><canvas ref={lienzoRef} /></div>
}
