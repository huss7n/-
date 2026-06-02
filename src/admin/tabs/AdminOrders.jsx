import { useState, useEffect } from 'react'
import { Search, Eye, X, RefreshCw, ExternalLink } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import toast from 'react-hot-toast'

const statusColors = {
  pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   label: 'قيد المراجعة' },
  processing: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',   label: 'جاري التنفيذ' },
  completed:  { color: '#10b981', bg: 'rgba(16,185,129,0.1)',   label: 'مكتمل' },
  cancelled:  { color: '#64748b', bg: 'rgba(100,116,139,0.1)',  label: 'ملغي' },
}

const payColors = {
  pending:   { color: '#f59e0b', label: 'بانتظار التأكيد' },
  confirmed: { color: '#10b981', label: 'مؤكد' },
  rejected:  { color: '#ef4444', label: 'مرفوض' },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || o.order_status === filterStatus || o.payment_status === filterStatus
    return matchSearch && matchStatus
  })

  const updateOrder = async (id, updates) => {
    setSaving(true)
    const { error } = await supabase
      .from('orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    setSaving(false)
    if (error) return toast.error('فشل التحديث')
    toast.success('تم التحديث ✓')
    loadOrders()
    if (selected?.id === id) setSelected(prev => ({ ...prev, ...updates }))
  }

  const openOrder = (o) => {
    setSelected(o)
    setNotes(o.admin_notes || '')
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === 'pending').length,
    completed: orders.filter(o => o.order_status === 'completed').length,
    revenue: orders.filter(o => o.payment_status === 'confirmed').reduce((a, o) => a + parseFloat(o.amount || 0), 0),
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: '#f8fafc' }}>إدارة الطلبات</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{orders.length} طلب إجمالي</p>
        </div>
        <button onClick={loadOrders} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: '#818cf8',
          fontFamily: 'Cairo', fontWeight: 600, fontSize: 13,
        }}>
          <RefreshCw size={14} /> تحديث
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'إجمالي الطلبات', value: stats.total, color: '#818cf8' },
          { label: 'قيد المراجعة', value: stats.pending, color: '#f59e0b' },
          { label: 'مكتملة', value: stats.completed, color: '#10b981' },
          { label: 'الإيرادات', value: `$${stats.revenue.toFixed(2)}`, color: '#ffd60a' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'rgba(8,8,32,0.6)', border: '1px solid rgba(99,102,241,0.12)',
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} color="#64748b" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="input-dark"
            placeholder="بحث بالاسم أو رقم الطلب..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingRight: 36 }}
          />
        </div>
        <select
          className="input-dark"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ width: 'auto', minWidth: 150 }}
        >
          <option value="all">كل الطلبات</option>
          <option value="pending">قيد المراجعة</option>
          <option value="processing">جاري التنفيذ</option>
          <option value="completed">مكتمل</option>
          <option value="cancelled">ملغي</option>
          <option value="confirmed">الدفع مؤكد</option>
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p style={{ color: '#64748b' }}>لا توجد طلبات</p>
        </div>
      ) : (
        <div style={{ background: 'rgba(8,8,32,0.6)', borderRadius: 16, border: '1px solid rgba(99,102,241,0.12)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>العميل</th>
                  <th>المنتج</th>
                  <th>المبلغ</th>
                  <th>حالة الدفع</th>
                  <th>حالة الطلب</th>
                  <th>التاريخ</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#818cf8', direction: 'ltr' }}>{o.order_number}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{o.customer_name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{o.customer_email}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{o.product_title?.slice(0,25)}...</td>
                    <td style={{ fontWeight: 700, color: '#ffd60a' }}>${o.amount}</td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                        background: payColors[o.payment_status]?.bg || 'rgba(245,158,11,0.1)',
                        color: payColors[o.payment_status]?.color || '#f59e0b',
                      }}>
                        {payColors[o.payment_status]?.label}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                        background: statusColors[o.order_status]?.bg || 'rgba(245,158,11,0.1)',
                        color: statusColors[o.order_status]?.color || '#f59e0b',
                      }}>
                        {statusColors[o.order_status]?.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#64748b' }}>
                      {new Date(o.created_at).toLocaleDateString('ar-IQ')}
                    </td>
                    <td>
                      <button
                        onClick={() => openOrder(o)}
                        style={{
                          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                          borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#818cf8',
                        }}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Drawer */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 22px 14px', borderBottom: '1px solid rgba(99,102,241,0.1)',
            }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: '#f8fafc' }}>تفاصيل الطلب</h3>
                <div style={{ fontSize: 12, color: '#818cf8', direction: 'ltr', marginTop: 2 }}>{selected.order_number}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Customer Info */}
              <div style={{ background: 'rgba(99,102,241,0.05)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontWeight: 700, color: '#818cf8', fontSize: 13, marginBottom: 10 }}>معلومات العميل</div>
                {[
                  ['الاسم', selected.customer_name],
                  ['البريد', selected.customer_email],
                  ['الهاتف', selected.customer_phone || '-'],
                  ['المنتج', selected.product_title],
                  ['طريقة الدفع', selected.payment_method_name],
                  ['المبلغ', `$${selected.amount}`],
                  ...(selected.discount_code ? [['كود الخصم', `${selected.discount_code} (-${selected.discount_percentage}%)`]] : []),
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 7 }}>
                    <span style={{ color: '#64748b' }}>{k}</span>
                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Proof of payment */}
              {selected.payment_proof_url && (
                <div>
                  <div style={{ fontWeight: 700, color: '#818cf8', fontSize: 13, marginBottom: 8 }}>إثبات الدفع</div>
                  <a
                    href={selected.payment_proof_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: 10, padding: '10px 14px', textDecoration: 'none', color: '#818cf8',
                      fontWeight: 600, fontSize: 13,
                    }}
                  >
                    <ExternalLink size={14} />
                    عرض إثبات الدفع
                  </a>
                </div>
              )}

              {/* Status Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block', fontWeight: 600 }}>حالة الدفع</label>
                  <select
                    className="input-dark"
                    value={selected.payment_status}
                    onChange={e => updateOrder(selected.id, { payment_status: e.target.value })}
                  >
                    <option value="pending">بانتظار التأكيد</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="rejected">مرفوض</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block', fontWeight: 600 }}>حالة الطلب</label>
                  <select
                    className="input-dark"
                    value={selected.order_status}
                    onChange={e => updateOrder(selected.id, { order_status: e.target.value })}
                  >
                    <option value="pending">قيد المراجعة</option>
                    <option value="processing">جاري التنفيذ</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block', fontWeight: 600 }}>ملاحظة للعميل</label>
                <textarea
                  className="input-dark"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="ستظهر هذه الملاحظة للعميل عند تتبع الطلب..."
                  rows={3}
                  style={{ resize: 'none' }}
                />
                <button
                  onClick={() => updateOrder(selected.id, { admin_notes: notes })}
                  disabled={saving}
                  className="btn-primary"
                  style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ الملاحظة'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
