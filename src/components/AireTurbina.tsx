import { useEffect, useRef } from 'react'

interface AireTurbinaProps {
  movimiento: Animation | null
}

/** Una textura suave, reutilizada: no aplicamos desenfoques a todo el canvas por cuadro. */
function crearEstela(suave: boolean) {
  const textura = document.createElement('canvas')
  textura.width = 192
  textura.height = 64
  const contexto = textura.getContext('2d')
  if (!contexto) return textura
  const luz = contexto.createLinearGradient(12, 0, 180, 0)
  luz.addColorStop(0, 'rgba(223,239,247,0)')
  luz.addColorStop(.3, 'rgba(186,219,234,.65)')
  luz.addColorStop(.65, 'rgba(239,249,255,1)')
  luz.addColorStop(1, 'rgba(223,239,247,0)')
  contexto.strokeStyle = luz
  contexto.lineCap = 'round'
  contexto.lineWidth = suave ? 12 : 4.5
  contexto.shadowColor = 'rgba(205,231,244,.6)'
  contexto.shadowBlur = suave ? 10 : 4
  contexto.beginPath()
  contexto.moveTo(12, 36)
  contexto.bezierCurveTo(62, 14, 118, 20, 180, 34)
  contexto.stroke()
  return textura
}

export function AireTurbina({ movimiento }: AireTurbinaProps) {
  const lienzoRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const lienzo = lienzoRef.current
    if (!lienzo || !movimiento) return
    const contexto = lienzo.getContext('2d')
    if (!contexto) return
    const texturas = [crearEstela(false), crearEstela(true)]
    const preferencia = matchMedia('(prefers-reduced-motion: reduce)')
    // Distribución estable e independiente del generador del sorteo.
    const particulas = Array.from({ length: 30 }, (_, indice) => ({
      angulo: indice * 2.399963,
      fase: (indice * .618034) % 1,
      velocidad: .78 + (indice % 5) * .09,
      profundidad: (indice % 3) / 2,
    }))
    let ancho = 0
    let alto = 0
    let escala = 1
    let densidad = 1
    let cuadro = 0
    let ultimoTiempo = 0
    let avance = 0
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
      densidad = Math.min(window.devicePixelRatio || 1, 1.5)
      lienzo.width = Math.max(1, Math.round(ancho * densidad))
      lienzo.height = Math.max(1, Math.round(alto * densidad))
      escala = (lienzo.parentElement?.parentElement?.getBoundingClientRect().width || ancho) / 700
    }
    const suavizar = (desde: number, hasta: number, valor: number) => {
      const t = Math.max(0, Math.min(1, (valor - desde) / (hasta - desde)))
      return t * t * (3 - 2 * t)
    }
    const dibujar = (ahora: number) => {
      cuadro = 0
      limpiar()
      const duracion = Number(movimiento.effect?.getComputedTiming().duration) || 4800
      const tiempo = Number(movimiento.currentTime) || 0
      const progreso = tiempo / duracion
      if (progreso >= 1 || movimiento.playState === 'idle') {
        terminado = true
        return
      }
      const intervalo = ultimoTiempo ? Math.min((ahora - ultimoTiempo) / 1000, .05) : 0
      ultimoTiempo = ahora
      const intensidad = suavizar(0, .1, progreso) * (1 - suavizar(.65, .98, progreso))
      const reducido = preferencia.matches
      avance += intervalo * (.15 + intensidad * (reducido ? .4 : .85))
      contexto.setTransform(densidad * escala, 0, 0, densidad * escala, ancho * densidad / 2, alto * densidad / 2)
      const cantidad = reducido ? 12 : ancho < 450 ? 24 : 30
      for (let indice = 0; indice < cantidad; indice++) {
        const particula = particulas[indice]!
        const vida = (particula.fase + avance * particula.velocidad) % 1
        const radio = 100 + 290 * Math.pow(vida, 1.15)
        const angulo = particula.angulo + vida * .5 + avance * .12
        const opacidad = Math.pow(Math.sin(Math.PI * vida), .8) * intensidad * (reducido ? .7 : .9)
        const longitud = (85 + 155 * vida) * (reducido ? .85 : 1)
        const grosor = 30 + 34 * vida + 18 * particula.profundidad
        contexto.save()
        contexto.translate(Math.cos(angulo) * radio, Math.sin(angulo) * radio)
        contexto.rotate(angulo + .12)
        contexto.globalAlpha = opacidad
        contexto.drawImage(texturas[indice % 3 === 0 ? 1 : 0]!, -longitud / 2, -grosor / 2, longitud, grosor)
        contexto.restore()
      }
      cuadro = requestAnimationFrame(dibujar)
    }
    const actualizarVisibilidad = () => {
      cancelAnimationFrame(cuadro)
      cuadro = 0
      ultimoTiempo = 0
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

