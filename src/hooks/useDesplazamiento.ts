import { useLayoutEffect } from 'react'

/** Suaviza solo la rueda del mouse; el tacto conserva el scroll del navegador. */
export function useDesplazamiento(pantalla: string) {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)')
    const punteroPreciso = window.matchMedia('(hover: hover) and (pointer: fine)')
    let cuadro = 0
    let destino = window.scrollY
    let ultimoTiempo = 0
    let posicion = window.scrollY

    const detener = () => {
      cancelAnimationFrame(cuadro)
      cuadro = 0
      destino = window.scrollY
    }
    const avanzar = (tiempo: number) => {
      const limite = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      destino = Math.max(0, Math.min(destino, limite))
      const intervalo = Math.min(64, Math.max(1, tiempo - ultimoTiempo))
      ultimoTiempo = tiempo
      const distancia = destino - posicion
      if (Math.abs(distancia) < 1) {
        window.scrollTo(0, destino)
        cuadro = 0
        return
      }
      posicion += distancia * (1 - Math.exp(-intervalo / 85))
      window.scrollTo(0, posicion)
      cuadro = requestAnimationFrame(avanzar)
    }
    const rueda = (evento: WheelEvent) => {
      if (movimientoReducido.matches || !punteroPreciso.matches || evento.ctrlKey || evento.metaKey
        || evento.defaultPrevented || Math.abs(evento.deltaX) >= Math.abs(evento.deltaY)
        || evento.target instanceof Element && evento.target.closest('dialog, select, textarea, [data-scroll-nativo]')) return
      const limite = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      if (!limite) return
      const unidad = evento.deltaMode === 1 ? 20 : evento.deltaMode === 2 ? window.innerHeight : 1
      const desplazamiento = evento.deltaY * unidad
      const nuevoDestino = Math.max(0, Math.min((cuadro ? destino : window.scrollY) + desplazamiento, limite))
      if (nuevoDestino === window.scrollY && !cuadro) return
      evento.preventDefault()
      destino = nuevoDestino
      if (!cuadro) {
        posicion = window.scrollY
        ultimoTiempo = performance.now()
        cuadro = requestAnimationFrame(avanzar)
      }
    }
    window.addEventListener('wheel', rueda, { passive: false })
    window.addEventListener('pointerdown', detener, { passive: true })
    window.addEventListener('touchstart', detener, { passive: true })
    window.addEventListener('keydown', detener)
    window.addEventListener('blur', detener)
    return () => {
      detener()
      window.removeEventListener('wheel', rueda)
      window.removeEventListener('pointerdown', detener)
      window.removeEventListener('touchstart', detener)
      window.removeEventListener('keydown', detener)
      window.removeEventListener('blur', detener)
    }
  }, [pantalla])
}
