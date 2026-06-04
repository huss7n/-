import { useState } from 'react'
import { Search, Package, Clock, CheckCircle, XCircle, Loader,
         RefreshCw, Copy, Download, Lock, ShieldCheck } from 'lucide-react'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import Footer from '../components/Footer'
import toast from 'react-hot-toast'

const statusConfig = {
  pending:    { label:'قيد المراجعة',  color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  icon:Clock,        border:'rgba(245,158,11,0.3)' },
  processing: { label:'جاري التنفيذ',  color:'#3b82f6', bg:'rgba(59,130,246,0.1)',  icon:Loader,       border:'rgba(59,130,246,0.3)' },
  completed:  { label:'مكتمل ✓',       color:'#10b981', bg:'rgba(16,185,129,0.1)',  icon:CheckCircle,  border:'rgba(16,185,129,0.3)' },
  cancelled:  { label:'ملغي',          color:'#64748b', bg:'rgba(100,116,139,0.1)', icon:XCircle,      border:'rgba(100,116,139,0.3)' },
}

const paymentStatusConfig = {
  pending:   { label:'بانتظار التأكيد', color:'#f59e0b' },
  confirmed: { label:'مدفوع ✓',         color:'#10b981' },
  rejected:  { label:'مرفوض',           color:'#ef4444' },
}

function StatusTimeline({ order }) {
  const steps = [
    { key:'pending',    label:'استلام الطلب',  icon:Package },
    { key:'processing', label:'مراجعة الدفع',  icon:Clock },
    { key:'completed',  label:'تسليم المنتج',  icon:CheckCircle },
  ]
  const stepIndex = { pending:0, processing:1, completed:2, cancelled:-1 }
  const current = stepIndex[order.order_status] ?? 0

  if (order.order_status === 'cancelled') {
    return (
      <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'14px 20px', display:'flex', alignItems:'center', gap:10, color:'#ef4444', fontSize:14, fontWeight:600 }}>
        <XCircle size={18}/> تم إلغاء هذا الطلب
      </div>
    )
  }

  return (
    <div style={{ display:'flex', alignItems:'center' }}>
      {steps.map((step, i) => {
        const Icon = step.icon
        const done   = i <= current
        const active = i === current
        return (
          <div key={step.key} style={{ display:'flex', alignItems:'center', flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{
                width:38, height:38, borderRadius:'50%',
                background: done ? (active ? 'linear-gradient(135deg,#6366f1,#f72585)' : 'rgba(16,185,129,0.15)') : 'rgba(99,102,241,0.08)',
                border:     done ? (active ? 'none' : '2px solid rgba(16,185,129,0.4)') : '2px solid rgba(99,102,241,0.15)',
                display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.3s', flexShrink:0,
              }}>
                <Icon size={16} color={done ? (active ? 'white' : '#10b981') : '#475569'}/>
              </div>
              <span style={{ fontSize:11, fontWeight:600, color:done?(active?'#818cf8':'#10b981'):'#475569', whiteSpace:'nowrap' }}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex:1, height:2, background:i<current?'rgba(16,185,129,0.4)':'rgba(99,102,241,0.1)', margin:'0 6px', marginBottom:22, transition:'all 0.3s' }}/>
            )}
          </div>
        )
      })}
    </div>
  )
}

function DownloadSection({ order, productFileUrl }) {
  const [downloading, setDownloading] = useState(false)
  const isReady = order.order_status === 'completed' && order.payment_status === 'confirmed'

  if (!isReady) {
    return (
      <div style={{
        background:'rgba(99,102,241,0.05)',
        border:'1px solid rgba(99,102,241,0.15)',
        borderRadius:14,
        padding:'20px 22px',
        display:'flex',
        alignItems:'center',
        gap:14,
      }}>
        <div style={{
          width:44, height:44, borderRadius:12,
          background:'rgba(100,116,139,0.15)',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        }}>
          <Lock size={20} color="#64748b"/>
        </div>
        <div>
          <div style={{ fontWeight:700, color:'#94a3b8', fontSize:14, marginBottom:3 }}>
            المنتج مقفل حالياً
          </div>
          <div style={{ fontSize:12, color:'#64748b', lineHeight:1.5 }}>
            {order.payment_status !== 'confirmed'
              ? 'يتم تفعيل التحميل بعد تأكيد الدفع من قِبل الإدارة'
              : 'سيتم تفعيل التحميل بعد اكتمال معالجة طلبك'}
          </div>
        </div>
      </div>
    )
  }

  if (!productFileUrl) {
    return (
      <div style={{
        background:'rgba(245,158,11,0.08)',
        border:'1px solid rgba(245,158,11,0.2)',
        borderRadius:14,
        padding:'18px 22px',
        display:'flex',
        alignItems:'center',
        gap:12,
      }}>
        <span style={{ fontSize:22 }}>📧</span>
        <div>
          <div style={{ fontWeight:700, color:'#f59e0b', fontSize:14, marginBottom:3 }}>
            تم تأكيد طلبك ✓
          </div>
          <div style={{ fontSize:12, color:'#94a3b8', lineHeight:1.5 }}>
            سيتم إرسال المنتج على بريدك الإلكتروني: <strong style={{ color:'#f8fafc' }}>{order.customer_email}</strong>
          </div>
        </div>
      </div>
    )
  }

  const handleDownload = () => {
    setDownloading(true)
    try {
      const a = document.createElement('a')
      a.href = productFileUrl
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      const filename = productFileUrl.split('/').pop() || `${order.product_title}.file`
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success('بدأ التحميل ✓')
    } catch {
      toast.error('تعذر التحميل، يرجى المحاولة مرة أخرى')
    }
    setTimeout(() => setDownloading(false), 2000)
  }

  return (
    <div style={{
      background:'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,214,160,0.05))',
      border:'1px solid rgba(16,185,129,0.3)',
      borderRadius:16,
      padding:'22px',
      position:'relative',
      overflow:'hidden',
    }}>
      {/* Glow */}
      <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.15), transparent)', pointerEvents:'none' }}/>

      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
        <div style={{
          width:48, height:48, borderRadius:14,
          background:'linear-gradient(135deg, #10b981, #06d6a0)',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          boxShadow:'0 4px 15px rgba(16,185,129,0.3)',
        }}>
          <ShieldCheck size={24} color="white"/>
        </div>
        <div>
          <div style={{ fontWeight:800, color:'#f8fafc', fontSize:16 }}>
            منتجك جاهز للتحميل! 🎉
          </div>
          <div style={{ fontSize:13, color:'#94a3b8', marginTop:2 }}>
            {order.product_title}
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        style={{
          width:'100%',
          padding:'14px',
          borderRadius:12,
          border:'none',
          background: downloading
            ? 'rgba(16,185,129,0.3)'
            : 'linear-gradient(135deg, #10b981, #059669)',
          color:'white',
          fontFamily:'Cairo',
          fontWeight:800,
          fontSize:15,
          cursor: downloading ? 'not-allowed' : 'pointer',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          gap:10,
          boxShadow: downloading ? 'none' : '0 4px 20px rgba(16,185,129,0.4)',
          transition:'all 0.2s',
        }}
        onMouseEnter={e => { if (!downloading) e.currentTarget.style.transform='translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.transform='none' }}
      >
        {downloading ? (
          <><div className="spinner" style={{ width:18, height:18, borderWidth:2, borderTopColor:'white' }}/> جاري التحميل...</>
        ) : (
          <><Download size={20}/> تحميل المنتج الآن</>
        )}
      </button>

      <p style={{ fontSize:11, color:'#64748b', textAlign:'center', marginTop:10 }}>
        ⚠️ هذا الرابط خاص بطلبك، لا تشاركه مع الآخرين
      </p>
    </div>
  )
}

export default function OrderTrackingPage({ settings }) {
  const [query,     setQuery]     = useState('')
  const [order,     setOrder]     = useState(null)
  const [fileUrl,   setFileUrl]   = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [notFound,  setNotFound]  = useState(false)

  const searchOrder = async () => {
    if (!query.trim()) return
    setLoading(true)
    setNotFound(false)
    setOrder(null)
    setFileUrl(null)

    const q = query.trim()

    // Search by order number OR email
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`order_number.eq.${q.toUpperCase()},customer_email.eq.${q}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      setLoading(false)
      setNotFound(true)
      return
    }

    setOrder(data)

    // Fetch product file if order is completed & payment confirmed
    if (data.order_status === 'completed' && data.payment_status === 'confirmed' && data.product_id) {
      const { data: product } = await supabase
        .from('products')
        .select('file_url')
        .eq('id', data.product_id)
        .maybeSingle()
      if (product?.file_url) setFileUrl(product.file_url)
    }

    setLoading(false)
  }

  const handleKeyDown = e => { if (e.key === 'Enter') searchOrder() }

  const refreshOrder = async () => {
    if (!order) return
    setLoading(true)
    setFileUrl(null)

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', order.order_number)
      .maybeSingle()

    if (data) {
      setOrder(data)
      if (data.order_status === 'completed' && data.payment_status === 'confirmed' && data.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('file_url')
          .eq('id', data.product_id)
          .maybeSingle()
        if (product?.file_url) setFileUrl(product.file_url)
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', position:'relative', zIndex:1 }}>
      <Header logoUrl={settings?.logo_url} siteName={settings?.site_name}/>

      <div style={{ maxWidth:680, margin:'0 auto', padding:'60px 24px 40px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{
            width:64, height:64, borderRadius:18,
            background:'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(247,37,133,0.2))',
            border:'1px solid rgba(99,102,241,0.25)',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 16px',
          }}>
            <Package size={28} color="#818cf8"/>
          </div>
          <h1 style={{ fontWeight:800, fontSize:26, color:'#f8fafc', marginBottom:8 }}>تتبع طلبك</h1>
          <p style={{ color:'#94a3b8', fontSize:14 }}>
            أدخل رقم الطلب أو بريدك الإلكتروني لمعرفة حالة طلبك وتحميل منتجك
          </p>
        </div>

        {/* Search */}
        <div style={{ background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:16, padding:20, marginBottom:28 }}>
          <label style={{ fontSize:13, color:'#94a3b8', marginBottom:8, display:'block', fontWeight:600 }}>
            رقم الطلب أو البريد الإلكتروني
          </label>
          <div style={{ display:'flex', gap:10 }}>
            <input
              className="input-dark"
              placeholder="ORD-20240101-12345  أو  example@email.com"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ flex:1, direction:'ltr', textAlign:'right' }}
            />
            <button
              onClick={searchOrder}
              disabled={loading || !query.trim()}
              style={{
                padding:'10px 20px', borderRadius:10, border:'none',
                background: loading || !query.trim() ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg,#6366f1,#f72585)',
                color:'white', fontFamily:'Cairo', fontWeight:700, fontSize:14,
                cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', transition:'all 0.2s',
              }}
            >
              {loading
                ? <div className="spinner" style={{ width:16, height:16, borderWidth:2 }}/>
                : <Search size={16}/>
              }
              بحث
            </button>
          </div>
        </div>

        {/* Not Found */}
        {notFound && (
          <div style={{ textAlign:'center', padding:'40px 20px', background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:16 }}>
            <div style={{ fontSize:44, marginBottom:12 }}>😕</div>
            <h3 style={{ fontWeight:700, color:'#f8fafc', marginBottom:6 }}>لم يتم العثور على الطلب</h3>
            <p style={{ color:'#94a3b8', fontSize:13 }}>تأكد من رقم الطلب أو البريد الإلكتروني وحاول مجدداً</p>
          </div>
        )}

        {/* Order Found */}
        {order && (
          <div className="animate-slideUp" style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Order Number Bar */}
            <div style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.2)',
              borderRadius:12, padding:'12px 18px',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ color:'#64748b', fontSize:13 }}>رقم الطلب</span>
                <span style={{ fontWeight:700, color:'#818cf8', fontSize:15, direction:'ltr', letterSpacing:'0.5px' }}>
                  {order.order_number}
                </span>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(order.order_number); toast.success('تم نسخ رقم الطلب') }}
                style={{ background:'rgba(99,102,241,0.1)', border:'none', borderRadius:8, padding:'5px 10px', cursor:'pointer', color:'#818cf8', display:'flex', alignItems:'center', gap:5, fontSize:12, fontFamily:'Cairo', fontWeight:600 }}
              >
                <Copy size={12}/> نسخ
              </button>
            </div>

            {/* Download Section — أعلى شيء لما يكون مكتمل */}
            <DownloadSection order={order} productFileUrl={fileUrl}/>

            {/* Status Card */}
            <div style={{ background:'rgba(8,8,32,0.8)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:16, padding:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>حالة الطلب</div>
                  {(() => {
                    const cfg = statusConfig[order.order_status] || statusConfig.pending
                    const Icon = cfg.icon
                    return (
                      <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:8, padding:'5px 14px', color:cfg.color, fontWeight:700, fontSize:13 }}>
                        <Icon size={14}/>{cfg.label}
                      </div>
                    )
                  })()}
                </div>
                <div>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>حالة الدفع</div>
                  {(() => {
                    const cfg = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending
                    return <div style={{ fontWeight:700, fontSize:13, color:cfg.color }}>{cfg.label}</div>
                  })()}
                </div>
              </div>
              <StatusTimeline order={order}/>
            </div>

            {/* Order Details */}
            <div style={{ background:'rgba(8,8,32,0.8)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:16, padding:24 }}>
              <h4 style={{ fontWeight:700, fontSize:14, color:'#818cf8', marginBottom:14 }}>تفاصيل الطلب</h4>
              {[
                ['المنتج',          order.product_title],
                ['الاسم',           order.customer_name],
                ['البريد الإلكتروني', order.customer_email],
                ['طريقة الدفع',    order.payment_method_name],
                ['المبلغ',          `$${order.amount}`],
                ['تاريخ الطلب',     new Date(order.created_at).toLocaleDateString('ar-IQ', {
                  year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit',
                })],
              ].map(([label, value]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(99,102,241,0.06)', paddingBottom:10, marginBottom:10 }}>
                  <span style={{ color:'#64748b', fontSize:13 }}>{label}</span>
                  <span style={{ color:'#f8fafc', fontWeight:600, fontSize:13, maxWidth:'60%', textAlign:'left' }}>{value}</span>
                </div>
              ))}
              {order.discount_code && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                  <span style={{ color:'#64748b' }}>كود الخصم</span>
                  <span style={{ color:'#10b981', fontWeight:700 }}>{order.discount_code} (-{order.discount_percentage}%)</span>
                </div>
              )}
              {order.admin_notes && (
                <div style={{ marginTop:12, background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:10, padding:'10px 14px' }}>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>ملاحظة من الإدارة</div>
                  <div style={{ fontSize:13, color:'#cbd5e1', lineHeight:1.5 }}>{order.admin_notes}</div>
                </div>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={refreshOrder}
              disabled={loading}
              style={{
                width:'100%', padding:'11px', borderRadius:12,
                border:'1px solid rgba(99,102,241,0.2)', background:'transparent',
                color:'#818cf8', fontFamily:'Cairo', fontWeight:600, fontSize:14,
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(99,102,241,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <RefreshCw size={15}/> تحديث الحالة
            </button>
          </div>
        )}
      </div>

      <Footer settings={settings}/>
    </div>
  )
}
