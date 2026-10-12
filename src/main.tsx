import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Aplicacion } from './components/Aplicacion'
import './styles/global.css'

const root = document.getElementById('root')
if (!root) throw new Error('No se encontró el contenedor de la aplicación.')

createRoot(root).render(
  <StrictMode>
    <Aplicacion />
  </StrictMode>,
)

