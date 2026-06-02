import { useState } from 'react'
import { Search, Package, Clock, CheckCircle, XCircle, Loader, RefreshCw, Copy } from 'lucide-react'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import Footer from '../components/Footer'
import toast from 'react-hot-toast'

const statusConfig = {
  pending:    { label: 'قيد المراجعة',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: Clock,        border: 'rgba(245,158,11,0.3)' },
  processing: { label: 'جاري التنفيذ',   color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: Loader,       border: 'rgba(59,130,246,0.3)' },
  completed:  { label: 'مكتمل ✓',        color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: CheckCircle,  border: 'rgba(16,185,129,0.3)' },
  cancelled:  { label: 'ملغي',           color: '#64748b', bg: 'rgba(100,116,139,0.1)', icon: XCircle,      border: 'rgba(100,116,139,0.3)' },
}

const paymentStatusConfig = {
  pending:   { label: 'بانتظار التأكيد', color: '#f59e0b' },
  confirmed: { label: 'مدفوع ✓',         color: '#10b981' },
  rejected:  { label: 'مرفوض',          color: '#ef4444' },
}

function StatusTimeline({ order }) {
  const steps = [
    { key: 'pending',    label: 'استلام الطلب',       icon: Package },
    { key: 'processing', label: 'مراجعة الدفع',        icon: Clock },
    { key: 'completed',  label: 'تسليم المنتج',        icon: CheckCircle },
  ]

  const stepIndex = { pending: 0, processing: 1, completed: 2, cancelled: -1 }
  const current = stepIndex[order.order_status] ?? 0

  if (order.order_status === 'cancelled') {
    return (
      <div style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 12,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: '#ef4444',
        fontSize: 14,
        fontWeight: 600,
      }}>
        <XCircle size={18} /> تم إلغاء هذا الطلب
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 8 }}>
      {steps.map((step, i) => {
        const Icon = step.icon
        const done = i <= current
        const active = i === current
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: done
                  ? active ? 'linear-gradient(135deg, #6366f1, #f72585)' : 'rgba(16,185,129,0.15)'
                  : 'rgba(99,102,241,0.08)',
                border: done
                  ? active ? 'none' : '2px solid rgba(16,185,129,0.4)'
                  : '2px solid rgba(99,102,241,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                flexShrink: 0,
              }}>
                <Icon size={16} color={done ? (active ? 'white' : '#10b981') : '#475569'} />
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: done ? (active ? '#818cf8' : '#10b981') : '#475569',
                whiteSpace: 'nowrap',
              }}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: i < current ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.1)',
                margin: '0 6px',
                marginBottom: 22,
                transition: 'all 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function OrderTrackingPage({ settings }) {
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const searchOrder = async () => {
    if (!query.trim()) return
    setLoading(true)
    setNotFound(false)
    setOrder(null)

    const q = query.trim().toUpperCase()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`order_number.eq.${q},customer_email.eq.${query.trim()}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    setLoading(false)
    if (error || !data) {
      setNotFound(true)
    } else {
      setOrder(data)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') searchOrder()
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Header logoUrl={settings?.logo_url} siteName={settings?.site_name} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 24px 40px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(247,37,133,0.2))',
            border: '1px solid rgba(99,102,241,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Package size={28} color="#818cf8" />
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 26, color: '#f8fafc', marginBottom: 8 }}>
            تتبع طلبك
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            أدخل رقم الطلب أو بريدك الإلكتروني لمعرفة حالة طلبك
          </p>
        </div>

        {/* Search Box */}
        <div style={{
          background: 'rgba(99,102,241,0.05)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 32,
        }}>
          <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10, display: 'block', fontWeight: 600 }}>
            رقم الطلب أو البريد الإلكتروني
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="input-dark"
              placeholder="ORD-20240101-12345 أو example@email.com"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ flex: 1, direction: 'ltr', textAlign: 'right' }}
            />
            <button
              onClick={searchOrder}
              disabled={loading || !query.trim()}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                background: loading || !query.trim()
                  ? 'rgba(99,102,241,0.3)'
                  : 'linear-gradient(135deg, #6366f1, #f72585)',
                color: 'white',
                fontFamily: 'Cairo',
                fontWeight: 700,
                fontSize: 14,
                cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {loading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Search size={16} />}
              بحث
            </button>
          </div>
        </div>

        {/* Not Found */}
        {notFound && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 16,
          }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>😕</div>
            <h3 style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>لم يتم العثور على الطلب</h3>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>
              تأكد من رقم الطلب أو البريد الإلكتروني وحاول مجدداً
            </p>
          </div>
        )}

        {/* Order Card */}
        {order && (
          <div className="animate-slideUp">
            {/* Order Number */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 12,
              padding: '12px 18px',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#64748b', fontSize: 13 }}>رقم الطلب</span>
                <span style={{
                  fontWeight: 700,
                  color: '#818cf8',
                  fontSize: 15,
                  direction: 'ltr',
                  letterSpacing: '0.5px',
                }}>
                  {order.order_number}
                </span>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(order.order_number); toast.success('تم النسخ') }}
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '5px 10px',
                  cursor: 'pointer',
                  color: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  fontFamily: 'Cairo',
                  fontWeight: 600,
                }}
              >
                <Copy size={12} /> نسخ
              </button>
            </div>

            {/* Status Card */}
            <div style={{
              background: 'rgba(8,8,32,0.8)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
            }}>
              {/* Status Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>حالة الطلب</div>
                  {(() => {
                    const cfg = statusConfig[order.order_status] || statusConfig.pending
                    const Icon = cfg.icon
                    return (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 7,
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        borderRadius: 8,
                        padding: '5px 14px',
                        color: cfg.color,
                        fontWeight: 700,
                        fontSize: 13,
                      }}>
                        <Icon size={14} />
                        {cfg.label}
                      </div>
                    )
                  })()}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>حالة الدفع</div>
                  {(() => {
                    const cfg = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending
                    return (
                      <div style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: cfg.color,
                      }}>
                        {cfg.label}
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Timeline */}
              <StatusTimeline order={order} />
            </div>

            {/* Order Details */}
            <div style={{
              background: 'rgba(8,8,32,0.8)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 16,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <h4 style={{ fontWeight: 700, fontSize: 14, color: '#818cf8', marginBottom: 4 }}>تفاصيل الطلب</h4>

              {[
                { label: 'المنتج', value: order.product_title },
                { label: 'الاسم', value: order.customer_name },
                { label: 'البريد الإلكتروني', value: order.customer_email },
                { label: 'طريقة الدفع', value: order.payment_method_name },
                { label: 'المبلغ', value: `$${order.amount}` },
                { label: 'تاريخ الطلب', value: new Date(order.created_at).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(99,102,241,0.06)',
                  paddingBottom: 10,
                }}>
                  <span style={{ color: '#64748b', fontSize: 13 }}>{label}</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: 13, maxWidth: '60%', textAlign: 'left' }}>{value}</span>
                </div>
              ))}

              {order.discount_code && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>كود الخصم</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>
                    {order.discount_code} (-{order.discount_percentage}%)
                  </span>
                </div>
              )}

              {order.admin_notes && (
                <div style={{
                  marginTop: 6,
                  background: 'rgba(99,102,241,0.06)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: 10,
                  padding: '10px 14px',
                }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>ملاحظة من الإدارة</div>
                  <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{order.admin_notes}</div>
                </div>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={searchOrder}
              style={{
                marginTop: 14,
                width: '100%',
                padding: '11px',
                borderRadius: 12,
                border: '1px solid rgba(99,102,241,0.2)',
                background: 'transparent',
                color: '#818cf8',
                fontFamily: 'Cairo',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <RefreshCw size={15} />
              تحديث الحالة
            </button>
          </div>
        )}
      </div>

      <Footer settings={settings} />
    </div>
  )
}
