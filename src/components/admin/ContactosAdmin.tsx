import { useEffect, useRef, useState, type FormEvent } from 'react'
import { preguntasProyectoAdmin as preguntasProyecto } from '../../data/preguntasProyectoAdmin'
import { fechaVisita, filtrosIniciales, validarFiltros, type FiltrosContactos, type PaginaContactos, type VisitaAdmin } from '../../domain/admin'
import { exportarContactos, listarContactos } from '../../services/admin'

function Respuestas({ visita }: { visita: VisitaAdmin }) {
  return <dl className="admin-respuestas">{Object.entries(visita.respuestas).map(([codigo, respuesta]) => <div key={codigo}><dt>{respuesta.pregunta}</dt><dd>{respuesta.respuesta}</dd></div>)}</dl>
}

export function ContactosAdmin() {
  const [borrador, setBorrador] = useState<FiltrosContactos>({ ...filtrosIniciales })
  const [filtros, setFiltros] = useState<FiltrosContactos>({ ...filtrosIniciales })
  const [pagina, setPagina] = useState(1)
  const [revision, setRevision] = useState(0)
  const [resultado, setResultado] = useState<PaginaContactos | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorFiltros, setErrorFiltros] = useState('')
  const [exportando, setExportando] = useState(false)
  const [progreso, setProgreso] = useState('')
  const [mensajeExportacion, setMensajeExportacion] = useState('')
  const exportacionRef = useRef<AbortController | null>(null)
  const vigenteRef = useRef(true)
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const corteRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    vigenteRef.current = true
    tituloRef.current?.focus({ preventScroll: true })
    return () => { vigenteRef.current = false; exportacionRef.current?.abort() }
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    queueMicrotask(() => { if (!controller.signal.aborted) { setCargando(true); setError(''); setResultado(null) } })
    listarContactos(filtros, pagina, 25, controller.signal, corteRef.current)
      .then(datos => { if (!controller.signal.aborted) { corteRef.current = datos.corte; setResultado(datos) } })
      .catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'No pudimos cargar los contactos.') })
      .finally(() => { if (!controller.signal.aborted) setCargando(false) })
    return () => controller.abort()
  }, [filtros, pagina, revision])
  const cambiar = (campo: keyof FiltrosContactos, valor: string) => { setBorrador(actual => ({ ...actual, [campo]: valor })); setErrorFiltros('') }
  const aplicar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const error = validarFiltros(borrador)
    if (error) { setErrorFiltros(error); return }
    corteRef.current = undefined
    setFiltros({ ...borrador }); setPagina(1)
  }
  const limpiar = () => { corteRef.current = undefined; setBorrador({ ...filtrosIniciales }); setFiltros({ ...filtrosIniciales }); setPagina(1); setErrorFiltros('') }
  const actualizar = () => { corteRef.current = undefined; setPagina(1); setRevision(valor => valor + 1) }
  const exportar = async () => {
    if (exportacionRef.current) return
    const controller = new AbortController()
    exportacionRef.current = controller
    setExportando(true); setMensajeExportacion(''); setProgreso('Preparando archivo…')
    try {
      const cantidad = await exportarContactos(filtros, controller.signal, (actual, total) => { if (vigenteRef.current) setProgreso(`${actual} de ${total} visitas`) })
      if (vigenteRef.current) setMensajeExportacion(`Se descargó el Excel con ${cantidad} visitas.`)
    } catch (error) {
      if (vigenteRef.current) setMensajeExportacion(controller.signal.aborted ? 'Exportación cancelada.' : error instanceof Error ? error.message : 'No pudimos exportar los contactos.')
    } finally {
      exportacionRef.current = null
      if (vigenteRef.current) { setExportando(false); setProgreso('') }
    }
  }
  const totalPaginas = Math.max(1, Math.ceil((resultado?.total ?? 0) / 25))
  return <section aria-labelledby="admin-contactos-titulo">
    <div className="admin-titulo-fila"><div><h1 id="admin-contactos-titulo" ref={tituloRef} tabIndex={-1}>Contactos del stand</h1><p>Consultá los datos y las respuestas de cada visita registrada.</p></div><div className="admin-acciones"><button type="button" className="admin-boton" disabled={cargando || exportando} onClick={actualizar}>Actualizar</button><button type="button" className="admin-boton admin-boton--principal" disabled={cargando || exportando || !resultado?.total} onClick={() => { void exportar() }}>Exportar Excel</button></div></div>
    {resultado && !cargando && <div className="admin-resumen" aria-label="Resumen de la consulta"><div><strong>{resultado.total.toLocaleString('es-AR')}</strong><span>visitas en esta consulta</span></div><div><strong>{resultado.filas.length}</strong><span>en la página actual</span></div><p>Datos al {fechaVisita(resultado.corte)}<span>El Excel incluye todas las visitas que coinciden con los filtros aplicados.</span></p></div>}
    <form className="admin-filtros" onSubmit={aplicar}>
      <fieldset disabled={exportando}>
        <legend>Buscar y filtrar visitas</legend>
        <div className="admin-filtros-superiores">
          <div className="admin-campo admin-campo--busqueda"><label htmlFor="admin-busqueda">Buscar contacto</label><input id="admin-busqueda" type="search" maxLength={200} placeholder="Nombre, apellido, email o teléfono" value={borrador.busqueda} onChange={evento => cambiar('busqueda', evento.target.value)} /></div>
          <div className="admin-campo"><label htmlFor="admin-desde">Desde</label><input id="admin-desde" type="date" value={borrador.desde} onChange={evento => cambiar('desde', evento.target.value)} /></div>
          <div className="admin-campo"><label htmlFor="admin-hasta">Hasta</label><input id="admin-hasta" type="date" value={borrador.hasta} onChange={evento => cambiar('hasta', evento.target.value)} /></div>
        </div>
        <div className="admin-filtros-inferiores">{preguntasProyecto.map(pregunta => <div className="admin-campo" key={pregunta.id}><label htmlFor={`admin-${pregunta.id}`}>{pregunta.id === 'servicio' ? 'Servicio' : pregunta.id === 'proyecto' ? 'Proyecto' : 'Etapa'}</label><select id={`admin-${pregunta.id}`} value={borrador[pregunta.id]} onChange={evento => cambiar(pregunta.id, evento.target.value)}><option value="">Todas las opciones</option>{pregunta.opciones.map(opcion => <option key={opcion.valor} value={opcion.valor}>{opcion.texto}</option>)}</select></div>)}<div className="admin-filtros-acciones"><button type="submit" className="admin-boton admin-boton--principal">Aplicar filtros</button><button type="button" className="admin-texto-boton" onClick={limpiar}>Limpiar</button></div></div>
      </fieldset>
      {errorFiltros && <p className="admin-error" role="alert">{errorFiltros}</p>}
    </form>
    <div className="admin-exportacion" role="status">{exportando ? <><span>{progreso}</span><button type="button" className="admin-texto-boton" onClick={() => exportacionRef.current?.abort()}>Cancelar exportación</button></> : mensajeExportacion}</div>
    {cargando ? <div role="status" className="admin-carga"><span>Cargando visitas…</span><div className="admin-esqueleto" aria-hidden="true" /><div className="admin-esqueleto" aria-hidden="true" /></div> : error ? <div className="admin-vacio" role="alert"><h2>No pudimos cargar las visitas</h2><p>{error}</p><button type="button" className="admin-boton" onClick={actualizar}>Reintentar</button></div> : resultado && <>
      <div className="admin-lista-cabecera"><p role="status"><strong>{resultado.total.toLocaleString('es-AR')}</strong> {resultado.total === 1 ? 'visita registrada' : 'visitas registradas'}</p><span>Más recientes primero</span></div>
      {resultado.total === 0 ? <div className="admin-vacio"><h2>No hay visitas para mostrar</h2><p>Probá con otros filtros o actualizá cuando se registren visitantes en el stand.</p><button type="button" className="admin-boton" onClick={limpiar}>Limpiar filtros</button></div> : <>
        <div className="admin-tabla-scroll" tabIndex={0} role="region" aria-label="Visitas registradas; desplazá horizontalmente para ver todas las columnas"><table className="admin-tabla"><caption className="admin-sr">Datos de contacto y respuestas registradas, página {pagina}</caption><thead><tr><th scope="col">Nombre</th><th scope="col">Apellido</th><th scope="col" className="admin-tabla__telefono">Teléfono</th><th scope="col" className="admin-tabla__correo">Correo</th><th scope="col">Servicio</th><th scope="col">Proyecto</th><th scope="col">Etapa</th><th scope="col">Registro</th></tr></thead><tbody>{resultado.filas.map(visita => <tr key={visita.id}><td className="admin-tabla__nombre">{visita.nombre}</td><td className="admin-tabla__nombre">{visita.apellido}</td><td className="admin-tabla__telefono">{visita.telefono || '—'}</td><td className="admin-tabla__correo">{visita.correo || '—'}</td><td>{visita.respuestas.servicio?.respuesta ?? 'Sin respuesta'}</td><td>{visita.respuestas.proyecto?.respuesta ?? 'Sin respuesta'}</td><td>{visita.respuestas.etapa?.respuesta ?? 'Sin respuesta'}</td><td><time dateTime={visita.iniciada_en}>{fechaVisita(visita.iniciada_en)}</time><span className="admin-juego-etiqueta">{visita.juego === 'ruleta' ? 'Ruleta' : 'Misión Termoarq'}</span></td></tr>)}</tbody></table></div>
        <ul className="admin-contactos-movil">{resultado.filas.map(visita => <li key={visita.id}><h2>{visita.nombre} {visita.apellido}</h2><dl className="admin-contacto-dato"><div><dt>Teléfono</dt><dd>{visita.telefono || '—'}</dd></div><div><dt>Correo</dt><dd>{visita.correo || '—'}</dd></div></dl><time dateTime={visita.iniciada_en}>{fechaVisita(visita.iniciada_en)}</time><span className="admin-juego-etiqueta">{visita.juego === 'mision' ? 'Misión Termoarq' : 'Ruleta'}</span><details><summary>Ver respuestas</summary><Respuestas visita={visita} /></details></li>)}</ul>
        <nav className="admin-paginacion" aria-label="Páginas de contactos"><span>Página {pagina} de {totalPaginas}</span><div><button type="button" className="admin-boton" disabled={pagina <= 1} onClick={() => setPagina(valor => valor - 1)}>Anterior</button><button type="button" className="admin-boton" disabled={pagina >= totalPaginas} onClick={() => setPagina(valor => valor + 1)}>Siguiente</button></div></nav>
      </>}
      <p className="admin-nota admin-lista-nota">Cada fila representa una visita. Un mismo contacto puede participar más de una vez. Las fechas se muestran en horario de Argentina.</p>
    </>}
  </section>
}
