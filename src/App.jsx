import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import AdminPage from './pages/AdminPage'
import WhatsAppButton from './components/WhatsAppButton'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [settings, setSettings] = useState({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data } = await supabase.from('settings').select('*')
    if (data) {
      const settingsMap = {}
      data.forEach(s => { settingsMap[s.key] = s.value })
      setSettings(settingsMap)
    }
  }

  return (
    <div className="grid-bg min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage settings={settings} />} />
        <Route path="/track" element={<OrderTrackingPage settings={settings} />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
      <WhatsAppButton number={settings.whatsapp_number || '07800015055'} />
    </div>
  )
}

export default App
