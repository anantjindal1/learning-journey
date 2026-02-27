import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Router wraps the entire tree so links and routes work everywhere. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
