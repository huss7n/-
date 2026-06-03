import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, CreditCard, Building2, Smartphone } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import toast from 'react-hot-toast'

const typeOptions = [
  { value:'mastercard',    label:'ماستر كارد',   icon:CreditCard },
  { value:'bank_transfer', label:'حوالة مصرفية', icon:Building2 },
  { value:'zaincash',      label:'زين كاش',      icon:Smartphone },
  { value:'custom',        label:'مخصص',         icon:Plus },
]

const fieldsByType = {
  mastercard:    [['card_number','رقم البطاقة'],['account_name','اسم صاحب البطاقة'],['instructions','تعليمات للعميل']],
  bank_transfer: [['bank_name','اسم البنك'],['account_number','رقم الحساب'],['account_name','الاسم الكامل'],['instructions','تعليمات للعميل']],
  zaincash:      [['phone_number','رقم الهاتف'],['account_name','الاسم'],['instructions','تعليمات للعميل']],
  custom:        [['name_detail','الاسم'],['instructions','تعليمات للعميل']],
}

export default function AdminPayments() {
  const [methods, setMethods]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [saving, setSaving]     = useState(false)
  const [form, setForm] = useState({ name:'', type:'zaincash', is_active:true })
  const [details, setDetails]   = useState({})

  useEffect(() => { loadMethods() }, [])

  const loadMethods = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('payment_methods').select('*').order('display_order')
    if (error) toast.error('خطأ في التحميل: ' + error.message)
    setMethods(data || [])
    setLoading(false)
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ name:'', type:'zaincash', is_active:true })
    setDetails({})
    setShowForm(true)
  }

  const openEdit = (m) => {
    setEditing(m)
    setForm({ name:m.name, type:m.type, is_active:m.is_active })
    setDetails({ ...(m.details || {}) })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('الاسم مطلوب')
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      type: form.type,
      details: details,
      is_active: form.is_active,
    }

    let error
    if (editing) {
      ;({ error } = await supabase.from('payment_methods').update(payload).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('payment_methods').insert([payload]))
    }

    setSaving(false)
    if (error) return toast.error('خطأ: ' + error.message)
    toast.success(editing ? 'تم التحديث ✓' : 'تمت الإضافة ✓')
    setShowForm(false)
    loadMethods()
  }

  const toggleActive = async (m) => {
    const { error } = await supabase.from('payment_methods').update({ is_active: !m.is_active }).eq('id', m.id)
    if (error) return toast.error('خطأ: ' + error.message)
    loadMethods()
  }

  const handleDelete = async (id) => {
    if (!confirm('حذف طريقة الدفع؟')) return
    const { error } = await supabase.from('payment_methods').delete().eq('id', id)
    if (error) return toast.error('خطأ: ' + error.message)
    toast.success('تم الحذف ✓')
    loadMethods()
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h2 style={{ fontWeight:800, fontSize:20, color:'#f8fafc' }}>طرق الدفع</h2>
          <p style={{ color:'#64748b', fontSize:13, marginTop:2 }}>إدارة طرق الدفع المتاحة للعملاء</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16}/> إضافة طريقة</button>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner"/></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {methods.map(m => {
            const typeInfo = typeOptions.find(t => t.value === m.type)
            const Icon = typeInfo?.icon || CreditCard
            return (
              <div key={m.id} style={{
                background:'rgba(8,8,32,0.7)',
                border:`1px solid ${m.is_active?'rgba(99,102,241,0.2)':'rgba(100,116,139,0.15)'}`,
                borderRadius:14, padding:'16px 20px',
                display:'flex', alignItems:'center', gap:14,
                opacity: m.is_active ? 1 : 0.6,
              }}>
                <div style={{ width:46, height:46, borderRadius:12, background:m.is_active?'linear-gradient(135deg,#6366f1,#f72585)':'rgba(100,116,139,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={22} color="white"/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f8fafc', fontSize:15 }}>{m.name}</div>
                  <div style={{ display:'flex', gap:8, marginTop:4, flexWrap:'wrap' }}>
                    {Object.entries(m.details||{}).filter(([k])=>k!=='instructions').map(([k,v])=>(
                      v && <span key={k} style={{ fontSize:11, color:'#94a3b8', background:'rgba(99,102,241,0.08)', padding:'2px 8px', borderRadius:4 }}>{v}</span>
                    ))}
                  </div>
                  {m.details?.instructions && <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>{m.details.instructions}</div>}
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <button onClick={()=>toggleActive(m)} style={{ padding:'5px 12px', borderRadius:8, border:'none', background:m.is_active?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', color:m.is_active?'#10b981':'#ef4444', fontSize:12, fontFamily:'Cairo', fontWeight:700, cursor:'pointer' }}>
                    {m.is_active?'مفعّل':'معطّل'}
                  </button>
                  <button onClick={()=>openEdit(m)} style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:8, padding:'6px 10px', cursor:'pointer', color:'#818cf8' }}><Edit size={14}/></button>
                  <button onClick={()=>handleDelete(m.id)} style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'6px 10px', cursor:'pointer', color:'#ef4444' }}><Trash2 size={14}/></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={()=>setShowForm(false)}>
          <div className="modal-content" style={{ maxWidth:520 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 22px 14px', borderBottom:'1px solid rgba(99,102,241,0.1)' }}>
              <h3 style={{ fontWeight:700, fontSize:15, color:'#f8fafc' }}>{editing?'تعديل طريقة الدفع':'إضافة طريقة دفع جديدة'}</h3>
              <button onClick={()=>setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b' }}><X size={18}/></button>
            </div>
            <div style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ fontSize:13, color:'#94a3b8', marginBottom:6, display:'block' }}>الاسم *</label>
                <input className="input-dark" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="مثال: زين كاش"/>
              </div>
              <div>
                <label style={{ fontSize:13, color:'#94a3b8', marginBottom:6, display:'block' }}>النوع</label>
                <select className="input-dark" value={form.type} onChange={e=>{setForm({...form,type:e.target.value});setDetails({})}}>
                  {typeOptions.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {(fieldsByType[form.type]||[]).map(([key,label])=>(
                <div key={key}>
                  <label style={{ fontSize:13, color:'#94a3b8', marginBottom:6, display:'block' }}>{label}</label>
                  <input className="input-dark" value={details[key]||''} onChange={e=>setDetails(d=>({...d,[key]:e.target.value}))} placeholder={label}/>
                </div>
              ))}

              <div>
                <label style={{ fontSize:13, color:'#94a3b8', marginBottom:6, display:'block' }}>الحالة</label>
                <select className="input-dark" value={String(form.is_active)} onChange={e=>setForm({...form,is_active:e.target.value==='true'})}>
                  <option value="true">مفعّل</option>
                  <option value="false">معطّل</option>
                </select>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex:1, justifyContent:'center' }}>
                  {saving?'جاري الحفظ...':'حفظ'}
                </button>
                <button onClick={()=>setShowForm(false)} className="btn-secondary" style={{ flex:1, justifyContent:'center' }}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
