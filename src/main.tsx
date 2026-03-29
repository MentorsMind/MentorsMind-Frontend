import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker } from './utils/performance.utils'
import { NotificationsProvider } from './hooks/useNotifications'
import Toasts from './components/notifications/Toast'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationsProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toasts />
    </NotificationsProvider>
  </StrictMode>,
)
