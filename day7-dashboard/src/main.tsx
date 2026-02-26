import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* We keep routing configuration close to the root so that the entire
        application (including top-level layout like the navbar) participates
        in client-side navigation without full page reloads. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
