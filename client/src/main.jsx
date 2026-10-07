import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/authContex.jsx'
import { NotificationProvider } from './context/notificationContext.jsx'
import { earlyRegisterServiceWorker } from './services/pushNotification.service.js'

// Register the Service Worker as early as possible (before React mounts).
// This ensures the SW is active and controlling before any push subscription
// is created or any notification is delivered.
// Does NOT request permission — only wakes up the SW.
earlyRegisterServiceWorker();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
