import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // <- essa linha carrega o estilo. Se não existir, adicione
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)