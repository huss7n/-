import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, Package, Settings, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { label: 'المنتجات', path: '/', icon: ShoppingBag },
  { label: 'تتبع الطلب', path: '/track', icon: Package },
  { label: 'الإدارة', path: '/admin', icon: Settings },
]

export default function Header({ logoUrl, siteName = 'المتجر الرقمي' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header style={{
      background: 'rgba(8, 8, 32, 0.95)',
      borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>

          {/* Logo - Right */}
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            ) : (
              <div style={{
                width: 44,
                height: 44,
                background: 'linear-gradient(135deg, #6366f1, #f72585)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}>
                🚀
              </div>
            )}
            <span style={{
              fontWeight: 800,
              fontSize: 18,
              background: 'linear-gradient(135deg, #818cf8, #f72585)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {siteName}
            </span>
          </button>

          {/* Desktop Nav - Center */}
          <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }} className="hidden md:flex">
            {navItems.map(({ label, path, icon: Icon }) => {
              const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 18px',
                    borderRadius: 10,
                    border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                    background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                    color: isActive ? '#818cf8' : '#94a3b8',
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(99,102,241,0.06)'
                      e.currentTarget.style.color = '#f8fafc'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#94a3b8'
                    }
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 10,
              padding: 8,
              cursor: 'pointer',
              color: '#818cf8',
            }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{
            borderTop: '1px solid rgba(99,102,241,0.1)',
            padding: '12px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            {navItems.map(({ label, path, icon: Icon }) => {
              const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
              return (
                <button
                  key={path}
                  onClick={() => { navigate(path); setMenuOpen(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: 'none',
                    background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                    color: isActive ? '#818cf8' : '#94a3b8',
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'right',
                  }}
                >
                  <Icon size={18} />
                  {label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </header>
  )
}
