import { useEffect, useRef, useState } from 'react'
import '../styles/bienvenidaAdmin.css'

interface BienvenidaProps {
  onComenzar?: () => void
}

export function Bienvenida({ onComenzar }: BienvenidaProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoNoDisponible, setVideoNoDisponible] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let efectoActivo = true

    video.muted = true
    video.defaultMuted = true
    video.setAttribute('muted', '')

    const reproducir = () => {
      void video.play().catch((error: unknown) => {
        if (!efectoActivo) return
        if (error instanceof DOMException &&
          (error.name === 'AbortError' || error.name === 'NotAllowedError')) return
        setVideoNoDisponible(true)
      })
    }

    const actualizarVisibilidad = () => {
      if (document.hidden) video.pause()
      else if (!videoNoDisponible) reproducir()
    }

    // Si un navegador bloquea autoplay, el primer toque permite reintentarlo
    // sin agregar controles al diseño ni detener un video que ya está jugando.
    const reintentarEnInteraccion = () => {
      if (document.hidden || !video.paused) return
      if (video.error) {
        video.load()
        setVideoNoDisponible(false)
      }
      reproducir()
    }

    actualizarVisibilidad()
    document.addEventListener('visibilitychange', actualizarVisibilidad)
    window.addEventListener('pointerdown', reintentarEnInteraccion, { passive: true })
    window.addEventListener('keydown', reintentarEnInteraccion)
    return () => {
      efectoActivo = false
      document.removeEventListener('visibilitychange', actualizarVisibilidad)
      window.removeEventListener('pointerdown', reintentarEnInteraccion)
      window.removeEventListener('keydown', reintentarEnInteraccion)
      video.pause()
    }
  }, [videoNoDisponible])

  return (
    <main className="bienvenida" aria-labelledby="bienvenida-titulo">
      <header className="bienvenida__cabecera">
        <img
          className="bienvenida__logo"
          src="/brand/termoarq-logo.svg"
          alt="Termoarq, constructora termomecánica"
          width="300"
          height="52"
        />
        <a className="bienvenida__admin" href="/admin" aria-label="Ingresar al panel de administración" title="Acceso del equipo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
          </svg>
        </a>
      </header>

      <div className="bienvenida__multimedia">
        <img
          className="bienvenida__fotograma"
          src="/media/termoarq-poster.jpg"
          alt=""
          aria-hidden="true"
          width="1920"
          height="1080"
          fetchPriority="high"
        />
        <video
          ref={videoRef}
          className="bienvenida__video"
          src="/media/termoarq.mp4"
          poster="/media/termoarq-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          style={{ visibility: videoNoDisponible ? 'hidden' : 'visible' }}
          onError={() => setVideoNoDisponible(true)}
        />
      </div>

      <section className="bienvenida__contenido" aria-labelledby="bienvenida-titulo">
        <h1 id="bienvenida-titulo">
          Conocé Termoarq.<br />Sumate al desafío.
        </h1>
        <p>Contanos qué necesitás y participá de nuestra experiencia.</p>
        <button
          className="bienvenida__comenzar"
          type="button"
          onClick={onComenzar}
          disabled={!onComenzar}
        >
          <span>Comenzar</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12h16m-6-6 6 6-6 6" />
          </svg>
        </button>
      </section>
    </main>
  )
}

