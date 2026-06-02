import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Tag, RefreshCw, Copy } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import toast from 'react-hot-toast'

const emptyForm = {
  code: '', percentage: '', max_uses: '', min_amount: '', expires_at: '', description: '', is_active: true,
}

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function AdminDiscounts() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadCodes() }, [])

  const loadCodes = async () => {
    setLoading(true)
    const { data } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false })
    setCodes(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.code.trim()) return toast.error('كود الخصم مطلوب')
    if (!form.percentage || isNaN(form.percentage)) return toast.error('نسبة الخصم مطلوبة')
    setSaving(true)
    const { error } = await supabase.from('discount_codes').insert({
      code: form.code.trim().toUpperCase(),
      percentage: parseInt(form.percentage),
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      min_amount: form.min_amount ? parseFloat(form.min_amount) : 0,
      expires_at: form.expires_at || null,
      description: form.description,
      is_active: form.is_active,
    })
    setSaving(false)
    if (error) {
      if (error.code === '23505') return toast.error('الكود مستخدم مسبقاً')
      return toast.error('حدث خطأ')
    }
    toast.success('تم إنشاء كود الخصم ✓')
    setShowForm(false)
    loadCodes()
  }

  const toggleActive = async (c) => {
    await supabase.from('discount_codes').update({ is_active: !c.is_active }).eq('id', c.id)
    loadCodes()
  }

  const handleDelete = async (id) => {
    if (!confirm('حذف كود الخصم؟')) return
    await supabase.from('discount_codes').delete().eq('id', id)
    toast.success('تم الحذف')
    loadCodes()
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success(`تم نسخ: ${code}`)
  }

  const isExpired = (code) => code.expires_at && new Date(code.expires_at) < new Date()
  const isExhausted = (code) => code.max_uses && code.used_count >= code.max_uses

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: '#f8fafc' }}>كودات الخصم</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{codes.filter(c => c.is_active).length} كود نشط</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadCodes} style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '8px 14px',
            cursor: 'pointer', color: '#818cf8', fontFamily: 'Cairo', fontWeight: 600, fontSize: 13,
          }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={() => { setForm(emptyForm); setShowForm(true) }} className="btn-primary">
            <Plus size={16} /> إنشاء كود
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'إجمالي الكودات', value: codes.length, color: '#818cf8' },
          { label: 'كودات نشطة', value: codes.filter(c => c.is_active && !isExpired(c) && !isExhausted(c)).length, color: '#10b981' },
          { label: 'مرات الاستخدام', value: codes.reduce((a, c) => a + (c.used_count || 0), 0), color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'rgba(8,8,32,0.6)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Codes Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : codes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Tag size={48} color="#475569" style={{ marginBottom: 12 }} />
          <p style={{ color: '#64748b' }}>لا توجد كودات خصم بعد</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {codes.map(c => {
            const expired = isExpired(c)
            const exhausted = isExhausted(c)
            const statusOk = c.is_active && !expired && !exhausted
            return (
              <div key={c.id} style={{
                background: 'rgba(8,8,32,0.7)',
                border: `1px solid ${statusOk ? 'rgba(99,102,241,0.25)' : 'rgba(100,116,139,0.15)'}`,
                borderRadius: 14,
                padding: 18,
                opacity: statusOk ? 1 : 0.65,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {statusOk && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 60,
                    height: 60,
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)',
                    borderRadius: '0 14px 0 60px',
                  }} />
                )}

                {/* Code & Percentage */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: 18,
                        color: statusOk ? '#818cf8' : '#64748b',
                        letterSpacing: '1px',
                      }}>
                        {c.code}
                      </span>
                      <button
                        onClick={() => copyCode(c.code)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2 }}
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                    {c.description && (
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{c.description}</div>
                    )}
                  </div>
                  <div style={{
                    background: `linear-gradient(135deg, ${statusOk ? '#6366f1' : '#475569'}, ${statusOk ? '#f72585' : '#374151'})`,
                    color: 'white',
                    borderRadius: 10,
                    padding: '4px 12px',
                    fontWeight: 800,
                    fontSize: 16,
                    flexShrink: 0,
                  }}>
                    {c.percentage}%
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                  {c.max_uses && (
                    <div style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(99,102,241,0.08)', padding: '3px 8px', borderRadius: 6 }}>
                      {c.used_count}/{c.max_uses} استخدام
                    </div>
                  )}
                  {c.min_amount > 0 && (
                    <div style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(99,102,241,0.08)', padding: '3px 8px', borderRadius: 6 }}>
                      حد أدنى: ${c.min_amount}
                    </div>
                  )}
                  {c.expires_at && (
                    <div style={{ fontSize: 11, color: expired ? '#ef4444' : '#94a3b8', background: expired ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.08)', padding: '3px 8px', borderRadius: 6 }}>
                      {expired ? 'منتهي الصلاحية' : `ينتهي: ${new Date(c.expires_at).toLocaleDateString('ar-IQ')}`}
                    </div>
                  )}
                  {exhausted && (
                    <div style={{ fontSize: 11, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '3px 8px', borderRadius: 6 }}>
                      نفدت الاستخدامات
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => toggleActive(c)}
                    style={{
                      flex: 1,
                      padding: '7px',
                      borderRadius: 8,
                      border: 'none',
                      background: c.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                      color: c.is_active ? '#ef4444' : '#10b981',
                      fontFamily: 'Cairo',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {c.is_active ? 'إيقاف' : 'تفعيل'}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: 8,
                      border: '1px solid rgba(239,68,68,0.2)',
                      background: 'rgba(239,68,68,0.08)',
                      color: '#ef4444',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 22px 14px', borderBottom: '1px solid rgba(99,102,241,0.1)',
            }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: '#f8fafc' }}>إنشاء كود خصم جديد</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Code */}
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>الكود *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="input-dark"
                    value={form.code}
                    onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                    placeholder="SAVE20"
                    style={{ flex: 1, direction: 'ltr', textAlign: 'right', fontFamily: 'monospace', letterSpacing: '1px' }}
                  />
                  <button
                    onClick={() => setForm({...form, code: generateCode()})}
                    style={{
                      padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.25)',
                      background: 'rgba(99,102,241,0.1)', color: '#818cf8', cursor: 'pointer',
                      fontFamily: 'Cairo', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap',
                    }}
                  >
                    توليد
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>نسبة الخصم % *</label>
                  <input className="input-dark" type="number" min="1" max="100" value={form.percentage} onChange={e => setForm({...form, percentage: e.target.value})} placeholder="20" style={{ direction: 'ltr' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>حد أقصى للاستخدامات</label>
                  <input className="input-dark" type="number" min="1" value={form.max_uses} onChange={e => setForm({...form, max_uses: e.target.value})} placeholder="100" style={{ direction: 'ltr' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>الحد الأدنى للمبلغ</label>
                  <input className="input-dark" type="number" min="0" value={form.min_amount} onChange={e => setForm({...form, min_amount: e.target.value})} placeholder="0.00" style={{ direction: 'ltr' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>تاريخ الانتهاء</label>
                  <input className="input-dark" type="date" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})} style={{ direction: 'ltr' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>وصف (اختياري)</label>
                <input className="input-dark" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="مثال: خصم الإطلاق" />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? 'جاري الإنشاء...' : 'إنشاء الكود'}
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
