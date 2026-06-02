import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-left"
          toastOptions={{
            style: {
              background: '#080820',
              color: '#f8fafc',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              fontFamily: 'Cairo, sans-serif',
              borderRadius: '12px',
              direction: 'rtl',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#080820' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#080820' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
