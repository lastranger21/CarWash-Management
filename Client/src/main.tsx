import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { AuthProvider } from './context/authProvider.tsx'
import { ServiceProvider } from './context/serviceProvider'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ServiceProvider>
    <App />
    </ServiceProvider>
    </AuthProvider>
  </StrictMode>,
)
