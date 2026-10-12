import { lazy, Suspense } from 'react'
import App from '../App'

const AdminApp = lazy(() => import('./admin/AdminApp'))
const esAdmin = /^\/admin\/?$/.test(window.location.pathname)
if (esAdmin) document.title = 'Termoarq | Administración'

export function Aplicacion() {
  return esAdmin ? <Suspense fallback={<main style={{ padding: '32px', color: '#164863', background: '#f3f6f7', minHeight: '100vh' }} role="status">Cargando panel…</main>}><AdminApp /></Suspense> : <App />
}
