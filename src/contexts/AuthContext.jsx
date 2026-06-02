import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for saved admin session
    const saved = localStorage.getItem('admin_session')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Check if session is not expired (24 hours)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setAdmin(parsed.admin)
        } else {
          localStorage.removeItem('admin_session')
        }
      } catch {
        localStorage.removeItem('admin_session')
      }
    }
    setLoading(false)
  }, [])

  const login = (adminData) => {
    setAdmin(adminData)
    localStorage.setItem('admin_session', JSON.stringify({
      admin: adminData,
      timestamp: Date.now()
    }))
  }

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem('admin_session')
  }

  const hasPermission = (permission) => {
    if (!admin) return false
    if (admin.role === 'superadmin') return true
    return admin.permissions?.[permission] === true
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
