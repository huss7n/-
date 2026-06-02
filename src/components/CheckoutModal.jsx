import { useState } from 'react'
import { X, CreditCard, Building2, Smartphone, Plus, CheckCircle, Tag, Upload, Copy } from 'lucide-react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

const paymentIcons = {
  mastercard: CreditCard,
  bank_transfer: Building2,
  zaincash: Smartphone,
  custom: Plus,
}

export default function CheckoutModal({ product, paymentMethods, onClose }) {
  const [step, setStep] = useState(1) // 1=info, 2=payment, 3=proof, 4=done
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [discountCode, setDiscountCode] = useState('')
  const [discount, setDiscount] = useState(null)
  const [discountLoading, setDiscountLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [proofFile, setProofFile] = useState(null)
  const [proofUrl, setProofUrl] = useState('')
  const [orderNumber, setOrderNumber] = useState('')

  const finalPrice = discount
    ? product.price * (1 - discount.percentage / 100)
    : product.price

  const checkDiscount = async () => {
    if (!discountCode.trim()) return
    setDiscountLoading(true)
    const { data, error } = await supabase.rpc('verify_discount_code', {
      p_code: discountCode.toUpperCase(),
      p_amount: product.price,
    })
    setDiscountLoading(false)
    if (error || !data?.valid) {
      toast.error(data?.error || 'كود الخصم غير صحيح')
      setDiscount(null)
    } else {
      setDiscount(data)
      toast.success(`تم تطبيق خصم ${data.percentage}% 🎉`)
    }
  }

  const handleInfoSubmit = () => {
    if (!form.name.trim()) return toast.error('الرجاء إدخال اسمك')
    if (!form.email.trim() || !form.email.includes('@')) return toast.error('الرجاء إدخال بريد إلكتروني صحيح')
    setStep(2)
  }

  const handleMethodSelect = (method) => {
    setSelectedMethod(method)
    setStep(3)
  }

  const uploadProof = async (file) => {
    const ext = file.name.split('.').pop()
    const fileName = `proof_${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('payments')
      .upload(fileName, file)
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('payments').getPublicUrl(fileName)
    return publicUrl
  }

  const submitOrder = async () => {
    setLoading(true)
    try {
      let uploadedProofUrl = proofUrl

      if (proofFile && selectedMethod?.type !== 'mastercard') {
        try {
          uploadedProofUrl = await uploadProof(proofFile)
        } catch (err) {
          console.error('Upload error:', err)
        }
      }

      const orderNum = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,5).toUpperCase()

      const { error } = await supabase.from('orders').insert({
        order_number: orderNum,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        product_id: product.id,
        product_title: product.title,
        payment_method_id: selectedMethod?.id,
        payment_method_name: selectedMethod?.name,
        amount: parseFloat(finalPrice.toFixed(2)),
        original_amount: product.price,
        discount_code: discount?.code || '',
        discount_percentage: discount?.percentage || 0,
        discount_amount: discount ? parseFloat((product.price * discount.percentage / 100).toFixed(2)) : 0,
        payment_proof_url: uploadedProofUrl,
        customer_notes: form.notes,
        payment_status: 'pending',
        order_status: 'pending',
      })

      if (error) throw error

      // Increment discount code usage
      if (discount?.code) {
        await supabase.rpc('increment_discount_usage', { p_code: discount.code }).catch(() => {})
      }

      setOrderNumber(orderNum)
      setStep(4)
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ، الرجاء المحاولة مرة أخرى')
    }
    setLoading(false)
  }

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber)
    toast.success('تم نسخ رقم الطلب')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(99,102,241,0.1)',
        }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 17, color: '#f8fafc' }}>
              {step === 4 ? '✅ تم الطلب بنجاح' : 'إتمام الشراء'}
            </h3>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              {product.title}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(239,68,68,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ef4444',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Progress */}
        {step < 4 && (
          <div style={{ padding: '12px 24px', display: 'flex', gap: 4 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{
                flex: 1,
                height: 4,
                borderRadius: 4,
                background: s <= step ? 'linear-gradient(90deg, #6366f1, #f72585)' : 'rgba(99,102,241,0.15)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        )}

        <div style={{ padding: '16px 24px 24px' }}>
          {/* STEP 1: Customer Info */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>الاسم الكامل *</label>
                <input
                  className="input-dark"
                  placeholder="اسمك الكامل"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>البريد الإلكتروني *</label>
                <input
                  className="input-dark"
                  type="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  style={{ direction: 'ltr', textAlign: 'right' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>رقم الهاتف (اختياري)</label>
                <input
                  className="input-dark"
                  placeholder="07xxxxxxxxx"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  style={{ direction: 'ltr', textAlign: 'right' }}
                />
              </div>

              {/* Discount Code */}
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>كود الخصم (اختياري)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="input-dark"
                    placeholder="DISCOUNT2024"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                    style={{ direction: 'ltr', textAlign: 'right', flex: 1 }}
                  />
                  <button
                    onClick={checkDiscount}
                    disabled={discountLoading}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(99,102,241,0.3)',
                      background: discount ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.1)',
                      color: discount ? '#10b981' : '#818cf8',
                      cursor: 'pointer',
                      fontFamily: 'Cairo',
                      fontWeight: 600,
                      fontSize: 13,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Tag size={14} />
                    {discountLoading ? '...' : discount ? '✓ مطبق' : 'تطبيق'}
                  </button>
                </div>
              </div>

              {/* Price summary */}
              <div style={{
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 12,
                padding: 14,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: discount ? 6 : 0 }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>السعر الأصلي</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>${product.price}</span>
                </div>
                {discount && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#10b981', fontSize: 13 }}>خصم {discount.percentage}%</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>-${(product.price * discount.percentage / 100).toFixed(2)}</span>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(99,102,241,0.1)', paddingTop: 8, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14 }}>الإجمالي</span>
                      <span style={{
                        background: 'linear-gradient(135deg, #ffd60a, #ff9500)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: 800,
                        fontSize: 18,
                      }}>${finalPrice.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleInfoSubmit}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 15 }}
              >
                التالي: اختيار طريقة الدفع
              </button>
            </div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <div>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
                اختر طريقة الدفع المناسبة لك:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {paymentMethods.filter(m => m.is_active).map(method => {
                  const Icon = paymentIcons[method.type] || CreditCard
                  return (
                    <button
                      key={method.id}
                      onClick={() => handleMethodSelect(method)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '14px 18px',
                        borderRadius: 12,
                        border: '1px solid rgba(99,102,241,0.2)',
                        background: 'rgba(99,102,241,0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'right',
                        width: '100%',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'
                        e.currentTarget.style.background = 'rgba(99,102,241,0.12)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'
                        e.currentTarget.style.background = 'rgba(99,102,241,0.05)'
                        e.currentTarget.style.transform = 'none'
                      }}
                    >
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #6366f1, #f72585)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={20} color="white" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: 14 }}>{method.name}</div>
                        {method.details?.instructions && (
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                            {method.details.instructions}
                          </div>
                        )}
                      </div>
                      <div style={{ color: '#6366f1', fontSize: 20 }}>←</div>
                    </button>
                  )
                })}
              </div>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                رجوع
              </button>
            </div>
          )}

          {/* STEP 3: Upload Proof */}
          {step === 3 && selectedMethod && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Payment details */}
              <div style={{
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 12,
                padding: 16,
              }}>
                <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: 10, fontSize: 14 }}>
                  تعليمات الدفع عبر {selectedMethod.name}
                </div>
                {Object.entries(selectedMethod.details || {}).filter(([k]) => k !== 'instructions').map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: '#94a3b8' }}>
                      {{ card_number:'رقم البطاقة', account_number:'رقم الحساب', phone_number:'رقم الهاتف', bank_name:'البنك', account_name:'اسم الحساب' }[key] || key}
                    </span>
                    <span style={{ color: '#f8fafc', fontWeight: 600, direction: 'ltr' }}>{val}</span>
                  </div>
                ))}
                <div style={{
                  marginTop: 10,
                  padding: '10px 14px',
                  background: 'rgba(255, 214, 10, 0.08)',
                  border: '1px solid rgba(255,214,10,0.2)',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#ffd60a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>المبلغ المطلوب:</span>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>${finalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Upload proof */}
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'block' }}>
                  إرفاق إثبات الدفع (صورة أو لقطة شاشة)
                </label>
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: '20px 16px',
                  border: '2px dashed rgba(99,102,241,0.3)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  background: proofFile ? 'rgba(16,185,129,0.05)' : 'rgba(99,102,241,0.03)',
                  borderColor: proofFile ? '#10b981' : 'rgba(99,102,241,0.3)',
                  transition: 'all 0.2s',
                }}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={e => setProofFile(e.target.files[0])}
                  />
                  <Upload size={24} color={proofFile ? '#10b981' : '#6366f1'} />
                  <span style={{ color: proofFile ? '#10b981' : '#94a3b8', fontSize: 13, fontWeight: 600 }}>
                    {proofFile ? `✓ ${proofFile.name}` : 'اضغط لرفع إثبات الدفع'}
                  </span>
                  {!proofFile && <span style={{ color: '#64748b', fontSize: 11 }}>PNG, JPG, PDF</span>}
                </label>
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>ملاحظات إضافية</label>
                <textarea
                  className="input-dark"
                  placeholder="أي ملاحظة تريد إضافتها..."
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  style={{ resize: 'none' }}
                />
              </div>

              <button
                onClick={submitOrder}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 12,
                  border: 'none',
                  background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #f72585)',
                  color: 'white',
                  fontFamily: 'Cairo',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {loading ? (
                  <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> جاري الإرسال...</>
                ) : (
                  'إرسال الطلب ✓'
                )}
              </button>
              <button onClick={() => setStep(2)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                رجوع
              </button>
            </div>
          )}

          {/* STEP 4: Order Confirmed */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)',
                border: '2px solid rgba(16,185,129,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <CheckCircle size={36} color="#10b981" />
              </div>

              <h3 style={{ fontWeight: 800, fontSize: 20, color: '#f8fafc', marginBottom: 8 }}>
                تم استلام طلبك! 🎉
              </h3>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                سيقوم فريقنا بمراجعة إثبات الدفع وإرسال المنتج إليك عبر البريد الإلكتروني
              </p>

              {/* Order number */}
              <div style={{
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 20,
              }}>
                <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>رقم طلبك (احتفظ به للمتابعة)</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: '#818cf8',
                    letterSpacing: '1px',
                    direction: 'ltr',
                  }}>
                    {orderNumber}
                  </span>
                  <button
                    onClick={copyOrderNumber}
                    style={{
                      background: 'rgba(99,102,241,0.15)',
                      border: 'none',
                      borderRadius: 8,
                      padding: 6,
                      cursor: 'pointer',
                      color: '#818cf8',
                    }}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => { window.location.href = '/track' }}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
                >
                  تتبع الطلب
                </button>
                <button onClick={onClose} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  إغلاق
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
