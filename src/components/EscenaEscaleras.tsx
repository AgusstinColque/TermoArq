import { useCallback, useEffect, useRef } from 'react'
export function EscenaEscaleras({ activa }: { activa: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const sincronizar = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: 'termoarq:presurizacion', activa }, window.location.origin)
  }, [activa])
  useEffect(sincronizar, [sincronizar])
  return <div className="escena-escaleras">
    <iframe ref={frame} src="/media/mision-presurizacion.html" title="Presurización: humo que entra por una puerta y retrocede al recibir aire limpio" onLoad={sincronizar} />
  </div>
}
