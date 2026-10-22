import { useEffect, useRef, useState, type FormEvent } from 'react'
import { actualizarStock, listarStock, type StockPremio } from '../../services/premios'
import '../../styles/stockPremios.css'

function FilaStock({ row, onGuardado }: { row: StockPremio; onGuardado: (row: StockPremio) => void }) {
  const [valor, setValor] = useState(String(row.cantidad))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const bloqueo = useRef(false)
  const guardar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (bloqueo.current) return
    setError(''); setMensaje('')
    if (!/^\d+$/.test(valor) || !Number.isSafeInteger(Number(valor)) || Number(valor) > 1000000) { setError('Ingresá una cantidad entera entre 0 y 1.000.000.'); return }
    bloqueo.current = true; setGuardando(true)
    try { const actual = await actualizarStock(row, Number(valor)); setValor(String(actual.cantidad)); setMensaje('Cantidad guardada.'); onGuardado(actual) }
    catch (e) { setError(e instanceof Error ? e.message : 'No pudimos guardar la cantidad.') }
    finally { bloqueo.current = false; setGuardando(false) }
  }
  return <form className="stock-premio" onSubmit={e => { void guardar(e) }}>
    <div><h2>{row.nombre}</h2><p className="stock-premio__actual">Cantidad actual: <strong>{row.cantidad}</strong></p></div>
    <div className="stock-premio__editar"><label htmlFor={'stock-' + row.indice}>Cantidad disponible</label><div><input id={'stock-' + row.indice} type="number" min="0" max="1000000" step="1" inputMode="numeric" required value={valor} disabled={guardando} aria-describedby={error ? 'stock-error-' + row.indice : undefined} onChange={e => { setValor(e.target.value); setError(''); setMensaje('') }}/><button className="admin-boton admin-boton--principal" type="submit" disabled={guardando || valor === String(row.cantidad)}>{guardando ? 'Guardando…' : 'Guardar'}</button></div></div>
    {error && <p className="admin-error stock-premio__mensaje" id={'stock-error-' + row.indice} role="alert">{error}</p>}
    {mensaje && <p className="stock-premio__mensaje" role="status">{mensaje}</p>}
  </form>
}
export function StockPremiosAdmin() {
  const [rows, setRows] = useState<StockPremio[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const titulo = useRef<HTMLHeadingElement>(null)
  useEffect(() => { titulo.current?.focus({ preventScroll: true }) }, [])
  useEffect(() => {
    const controller = new AbortController()
    listarStock(controller.signal).then(data => { if (!controller.signal.aborted) setRows(data) }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'No pudimos cargar el stock.') }).finally(() => { if (!controller.signal.aborted) setCargando(false) })
    return () => controller.abort()
  }, [revision])
  const actualizar = () => { setCargando(true); setError(''); setRevision(v => v + 1) }
  return <section className="stock-premios" aria-labelledby="stock-titulo">
    <div className="admin-titulo-fila"><div><h1 id="stock-titulo" tabIndex={-1} ref={titulo}>Stock de premios</h1><p>Control interno compartido entre Ruleta y Misión Termoarq.</p></div><button type="button" className="admin-boton" onClick={actualizar} disabled={cargando}>Actualizar</button></div>
    <p className="stock-premios__ayuda">Cargá la cantidad disponible de cada premio. Cada premio ganado descuenta una unidad; al llegar a cero, los juegos y sorteos continúan normalmente. Actualizá para consultar los últimos descuentos.</p>
    {error && <div className="admin-error" role="alert">{error}</div>}
    {cargando ? <p className="admin-carga" role="status">Cargando stock…</p> : !rows.length ? <p>No hay datos de stock para mostrar. Usá Actualizar para volver a intentar.</p> : <div className="stock-premios__lista">{rows.map(row => <FilaStock key={row.indice + ':' + revision} row={row} onGuardado={actual => setRows(prev => prev.map(r => r.indice === actual.indice ? actual : r))} />)}</div>}
  </section>
}
