import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Shield, User, Check } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const permissionLabels = {
  products: 'المنتجات',
  orders: 'الطلبات',
  discounts: 'الخصومات',
  payments: 'طرق الدفع',
  admins: 'إدارة المديرين',
  settings: 'الإعدادات',
}

export default function AdminUsers() {
  const { admin } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    email: '', password: '', name: '', role: 'admin',
    permissions: { products: true, orders: true, discounts: false, payments: false, admins: false, settings: false },
  })

  useEffect(() => { loadAdmins() }, [])

  const loadAdmins = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('admins')
      .select('id, email, name, role, permissions, is_active, last_login, created_at')
      .order('created_at')
    setAdmins(data || [])
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!form.email || !form.password || !form.name) return toast.error('جميع الحقول مطلوبة')
    if (form.password.length < 8) return toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    setSaving(true)
    const { data, error } = await supabase.rpc('create_admin', {
      p_email: form.email.trim().toLowerCase(),
      p_password: form.password,
      p_name: form.name.trim(),
      p_role: form.role,
      p_permissions: form.permissions,
      p_created_by: admin?.id,
    })
    setSaving(false)
    if (error || !data?.success) return toast.error(data?.error || 'حدث خطأ')
    toast.success('تم إنشاء الحساب ✓')
    setShowForm(false)
    loadAdmins()
  }

  const toggleActive = async (a) => {
    if (a.id === admin?.id) return toast.error('لا يمكنك تعطيل حسابك')
    await supabase.from('admins').update({ is_active: !a.is_active }).eq('id', a.id)
    loadAdmins()
  }

  const handleDelete = async (a) => {
    if (a.id === admin?.id) return toast.error('لا يمكنك حذف حسابك')
    if (a.role === 'superadmin') return toast.error('لا يمكن حذف المسؤول الرئيسي')
    if (!confirm(`حذف الحساب: ${a.email}؟`)) return
    await supabase.from('admins').delete().eq('id', a.id)
    toast.success('تم الحذف')
    loadAdmins()
  }

  const togglePermission = (key) => {
    setForm(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] },
    }))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: '#f8fafc' }}>إدارة المديرين</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{admins.length} حساب مسجل</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} /> إضافة مدير
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {admins.map(a => (
            <div key={a.id} style={{
              background: 'rgba(8,8,32,0.7)',
              border: `1px solid ${a.id === admin?.id ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.15)'}`,
              borderRadius: 14,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}>
              {/* Avatar */}
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: a.role === 'superadmin' ? 'linear-gradient(135deg, #ffd60a, #ff9500)' : 'linear-gradient(135deg, #6366f1, #f72585)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {a.role === 'superadmin' ? <Shield size={20} color="white" /> : <User size={20} color="white" />}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: 14 }}>{a.name || a.email}</span>
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: a.role === 'superadmin' ? 'rgba(255,214,10,0.15)' : 'rgba(99,102,241,0.1)',
                    color: a.role === 'superadmin' ? '#ffd60a' : '#818cf8',
                    fontWeight: 700,
                  }}>
                    {a.role === 'superadmin' ? '👑 مسؤول رئيسي' : '🛡️ مدير'}
                  </span>
                  {a.id === admin?.id && (
                    <span style={{ fontSize: 11, color: '#10b981' }}>(أنت)</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{a.email}</div>
                {a.role !== 'superadmin' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                    {Object.entries(a.permissions || {}).filter(([,v]) => v).map(([k]) => (
                      <span key={k} style={{
                        fontSize: 10,
                        background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        color: '#10b981',
                        padding: '1px 6px',
                        borderRadius: 4,
                      }}>
                        {permissionLabels[k] || k}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status & Actions */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: a.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: a.is_active ? '#10b981' : '#ef4444',
                  fontWeight: 700,
                }}>
                  {a.is_active ? 'نشط' : 'معطّل'}
                </div>
                {a.id !== admin?.id && a.role !== 'superadmin' && (
                  <>
                    <button
                      onClick={() => toggleActive(a)}
                      style={{
                        padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)',
                        background: 'rgba(245,158,11,0.1)', color: '#f59e0b', cursor: 'pointer',
                        fontFamily: 'Cairo', fontWeight: 600, fontSize: 12,
                      }}
                    >
                      {a.is_active ? 'تعطيل' : 'تفعيل'}
                    </button>
                    <button
                      onClick={() => handleDelete(a)}
                      style={{
                        padding: '5px 8px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)',
                        background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Admin Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 22px 14px', borderBottom: '1px solid rgba(99,102,241,0.1)',
            }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: '#f8fafc' }}>إضافة مدير جديد</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>الاسم *</label>
                <input className="input-dark" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="اسم المدير" />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>البريد الإلكتروني *</label>
                <input className="input-dark" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="admin@example.com" style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>كلمة المرور *</label>
                <input className="input-dark" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="8 أحرف على الأقل" style={{ direction: 'ltr' }} />
              </div>

              {/* Permissions */}
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10, display: 'block', fontWeight: 600 }}>الصلاحيات</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <label key={key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: `1px solid ${form.permissions[key] ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.12)'}`,
                      background: form.permissions[key] ? 'rgba(99,102,241,0.1)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}>
                      <div
                        onClick={() => togglePermission(key)}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 5,
                          border: `2px solid ${form.permissions[key] ? '#6366f1' : 'rgba(99,102,241,0.3)'}`,
                          background: form.permissions[key] ? '#6366f1' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                        }}
                      >
                        {form.permissions[key] && <Check size={11} color="white" />}
                      </div>
                      <span
                        onClick={() => togglePermission(key)}
                        style={{
                          fontSize: 13,
                          color: form.permissions[key] ? '#f8fafc' : '#94a3b8',
                          fontWeight: form.permissions[key] ? 600 : 400,
                          cursor: 'pointer',
                        }}
                      >
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleCreate} disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
