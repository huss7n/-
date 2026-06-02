import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminLogin from '../admin/AdminLogin'
import AdminProducts from '../admin/tabs/AdminProducts'
import AdminOrders from '../admin/tabs/AdminOrders'
import AdminPayments from '../admin/tabs/AdminPayments'
import AdminDiscounts from '../admin/tabs/AdminDiscounts'
import AdminUsers from '../admin/tabs/AdminUsers'
import AdminSettings from '../admin/tabs/AdminSettings'
import {
  Package, ShoppingBag, CreditCard, Tag, Users, Settings,
  LogOut, Shield, ChevronLeft, BarChart2, Home
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const navItems = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: BarChart2,  permission: null },
  { id: 'products',  label: 'المنتجات',    icon: ShoppingBag, permission: 'products' },
  { id: 'orders',    label: 'الطلبات',     icon: Package,     permission: 'orders' },
  { id: 'payments',  label: 'طرق الدفع',   icon: CreditCard,  permission: 'payments' },
  { id: 'discounts', label: 'كودات الخصم', icon: Tag,         permission: 'discounts' },
  { id: 'admins',    label: 'المديرون',    icon: Users,       permission: 'admins' },
  { id: 'settings',  label: 'الإعدادات',   icon: Settings,    permission: 'settings' },
]

function Dashboard({ admin }) {
  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 22, color: '#f8fafc', marginBottom: 6 }}>
        أهلاً، {admin?.name || admin?.email} 👋
      </h2>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
        مرحباً بك في لوحة إدارة المتجر الرقمي
      </p>

      <div style={{
        background: 'rgba(99,102,241,0.06)',
        border: '1px solid rgba(99,102,241,0.15)',
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: admin?.role === 'superadmin'
            ? 'linear-gradient(135deg, #ffd60a, #ff9500)'
            : 'linear-gradient(135deg, #6366f1, #f72585)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Shield size={24} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: 15 }}>
            {admin?.role === 'superadmin' ? '👑 مسؤول رئيسي' : '🛡️ مدير'}
          </div>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{admin?.email}</div>
        </div>
        <div style={{
          marginRight: 'auto',
          fontSize: 11,
          padding: '4px 12px',
          borderRadius: 8,
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.2)',
          color: '#10b981',
          fontWeight: 700,
        }}>
          ● متصل
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.7 }}>
          استخدم القائمة الجانبية للتنقل بين أقسام الإدارة. يمكنك إدارة المنتجات، الطلبات، طرق الدفع، كودات الخصم، والمزيد.
        </p>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { admin, logout, hasPermission } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!admin) return <AdminLogin />

  const visibleItems = navItems.filter(item =>
    item.permission === null || hasPermission(item.permission)
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'products':  return hasPermission('products') ? <AdminProducts /> : null
      case 'orders':    return hasPermission('orders') ? <AdminOrders /> : null
      case 'payments':  return hasPermission('payments') ? <AdminPayments /> : null
      case 'discounts': return hasPermission('discounts') ? <AdminDiscounts /> : null
      case 'admins':    return hasPermission('admins') ? <AdminUsers /> : null
      case 'settings':  return hasPermission('settings') ? <AdminSettings /> : null
      default:          return <Dashboard admin={admin} />
    }
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      fontFamily: 'Cairo, sans-serif',
    }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 68,
        background: 'rgba(8,8,32,0.98)',
        borderLeft: '1px solid rgba(99,102,241,0.12)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '20px 14px 14px',
          borderBottom: '1px solid rgba(99,102,241,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          justifyContent: sidebarOpen ? 'space-between' : 'center',
        }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: 'linear-gradient(135deg, #6366f1, #f72585)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Shield size={16} color="white" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                لوحة الإدارة
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: 'none',
              borderRadius: 8,
              padding: 6,
              cursor: 'pointer',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s',
              transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
          {visibleItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                title={!sidebarOpen ? label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: sidebarOpen ? '10px 14px' : '10px',
                  borderRadius: 10,
                  border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                  background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                  color: isActive ? '#818cf8' : '#64748b',
                  fontFamily: 'Cairo, sans-serif',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'right',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(99,102,241,0.06)'
                    e.currentTarget.style.color = '#94a3b8'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#64748b'
                  }
                }}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                {sidebarOpen && label}
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '8px 8px 16px', borderTop: '1px solid rgba(99,102,241,0.08)', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <button
            onClick={() => navigate('/')}
            title={!sidebarOpen ? 'الواجهة الرئيسية' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: sidebarOpen ? '9px 14px' : '9px',
              borderRadius: 10, border: 'none', background: 'transparent',
              color: '#64748b', fontFamily: 'Cairo', fontWeight: 500, fontSize: 13,
              cursor: 'pointer', width: '100%', textAlign: 'right',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; e.currentTarget.style.color = '#94a3b8' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
          >
            <Home size={16} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'الواجهة الرئيسية'}
          </button>
          <button
            onClick={logout}
            title={!sidebarOpen ? 'تسجيل خروج' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: sidebarOpen ? '9px 14px' : '9px',
              borderRadius: 10, border: 'none',
              background: 'rgba(239,68,68,0.06)',
              color: '#ef4444', fontFamily: 'Cairo', fontWeight: 600, fontSize: 13,
              cursor: 'pointer', width: '100%', textAlign: 'right',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'تسجيل الخروج'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', minWidth: 0 }}>
        <div style={{ maxWidth: 1100 }}>
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
