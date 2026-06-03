import { useState, useEffect } from 'react'
import { Save, Eye, EyeOff, Lock } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const { admin } = useAuth()
  const [settings, setSettings] = useState({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [oldPass, setOldPass]   = useState('')
  const [newPass, setNewPass]   = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [changingPass, setChangingPass] = useState(false)
  const [showOld, setShowOld]   = useState(false)
  const [showNew, setShowNew]   = useState(false)

  useEffect(() => { loadSettings() }, [])

  const loadSettings = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('settings').select('*')
    if (error) { toast.error('خطأ في تحميل الإعدادات'); setLoading(false); return }
    const map = {}
    ;(data||[]).forEach(s => { map[s.key] = s.value })
    setSettings(map)
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const entries = Object.entries(settings)
    let hasError = false

    for (const [key, value] of entries) {
      const { error } = await supabase.from('settings')
        .upsert({ key, value: value||'', updated_at: new Date().toISOString() }, { onConflict:'key' })
      if (error) { hasError = true; console.error('Setting error:', key, error) }
    }

    setSaving(false)
    if (hasError) return toast.error('بعض الإعدادات لم تُحفظ، تحقق من سياسات Supabase')
    toast.success('تم حفظ الإعدادات ✓')
  }

  const handleChangePassword = async () => {
    if (!oldPass || !newPass || !confirmPass) return toast.error('يرجى ملء جميع الحقول')
    if (newPass !== confirmPass) return toast.error('كلمة المرور الجديدة لا تطابق التأكيد')
    if (newPass.length < 8) return toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل')

    setChangingPass(true)
    const { data, error } = await supabase.rpc('change_admin_password', {
      p_admin_id: admin.id,
      p_old_password: oldPass,
      p_new_password: newPass,
    })
    setChangingPass(false)

    if (error || !data?.success) return toast.error(data?.error || 'حدث خطأ')
    toast.success('تم تغيير كلمة المرور ✓')
    setOldPass(''); setNewPass(''); setConfirmPass('')
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner"/></div>

  const groups = [
    {
      title:'معلومات الموقع', emoji:'🌐',
      fields:[
        { key:'site_name',        label:'اسم الموقع',        placeholder:'المتجر الرقمي' },
        { key:'site_description', label:'وصف الموقع',        placeholder:'منتجاتي الرقمية' },
        { key:'logo_url',         label:'رابط الشعار',       placeholder:'https://...', ltr:true },
      ]
    },
    {
      title:'واتساب', emoji:'💬',
      fields:[
        { key:'whatsapp_number', label:'رقم الواتساب', placeholder:'07xxxxxxxxx', ltr:true },
      ]
    },
    {
      title:'وسائل التواصل الاجتماعي', emoji:'📱',
      fields:[
        { key:'facebook_url',  label:'رابط الفيسبوك',    placeholder:'https://facebook.com/...', ltr:true },
        { key:'instagram_url', label:'رابط الانستاجرام', placeholder:'https://instagram.com/...', ltr:true },
        { key:'telegram_url',  label:'رابط التيليجرام',  placeholder:'https://t.me/...', ltr:true },
      ]
    },
  ]

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div>
          <h2 style={{ fontWeight:800, fontSize:20, color:'#f8fafc' }}>إعدادات الموقع</h2>
          <p style={{ color:'#64748b', fontSize:13, marginTop:2 }}>تخصيص بيانات الموقع والتواصل الاجتماعي</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save size={16}/> {saving?'جاري الحفظ...':'حفظ الإعدادات'}
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
        {groups.map(group => (
          <div key={group.title} style={{ background:'rgba(8,8,32,0.7)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:16, overflow:'hidden' }}>
            <div style={{ padding:'12px 20px', borderBottom:'1px solid rgba(99,102,241,0.1)', background:'rgba(99,102,241,0.05)', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>{group.emoji}</span>
              <span style={{ fontWeight:700, color:'#f8fafc', fontSize:14 }}>{group.title}</span>
            </div>
            <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
              {group.fields.map(field => (
                <div key={field.key}>
                  <label style={{ fontSize:13, color:'#94a3b8', marginBottom:6, display:'block', fontWeight:600 }}>{field.label}</label>
                  <input
                    className="input-dark"
                    value={settings[field.key]||''}
                    onChange={e => setSettings(prev=>({...prev,[field.key]:e.target.value}))}
                    placeholder={field.placeholder}
                    style={field.ltr?{direction:'ltr',textAlign:'right'}:{}}
                  />
                  {field.key==='logo_url' && settings.logo_url && (
                    <img src={settings.logo_url} alt="شعار" style={{ marginTop:8, height:50, objectFit:'contain', borderRadius:8, border:'1px solid rgba(99,102,241,0.2)', padding:6, background:'rgba(8,8,32,0.5)' }} onError={e=>e.target.style.display='none'}/>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Change Password */}
        <div style={{ background:'rgba(8,8,32,0.7)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'12px 20px', borderBottom:'1px solid rgba(99,102,241,0.1)', background:'rgba(99,102,241,0.05)', display:'flex', alignItems:'center', gap:8 }}>
            <Lock size={16} color="#818cf8"/>
            <span style={{ fontWeight:700, color:'#f8fafc', fontSize:14 }}>تغيير كلمة المرور</span>
          </div>
          <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label style={{ fontSize:13, color:'#94a3b8', marginBottom:6, display:'block' }}>كلمة المرور الحالية</label>
              <div style={{ position:'relative' }}>
                <input className="input-dark" type={showOld?'text':'password'} value={oldPass} onChange={e=>setOldPass(e.target.value)} placeholder="••••••••" style={{ direction:'ltr', paddingLeft:40 }}/>
                <button type="button" onClick={()=>setShowOld(!showOld)} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#64748b' }}>
                  {showOld?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize:13, color:'#94a3b8', marginBottom:6, display:'block' }}>كلمة المرور الجديدة</label>
              <div style={{ position:'relative' }}>
                <input className="input-dark" type={showNew?'text':'password'} value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="8 أحرف على الأقل" style={{ direction:'ltr', paddingLeft:40 }}/>
                <button type="button" onClick={()=>setShowNew(!showNew)} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#64748b' }}>
                  {showNew?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize:13, color:'#94a3b8', marginBottom:6, display:'block' }}>تأكيد كلمة المرور الجديدة</label>
              <input className="input-dark" type="password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} placeholder="••••••••" style={{ direction:'ltr' }}/>
            </div>
            <button onClick={handleChangePassword} disabled={changingPass} style={{
              padding:'11px', borderRadius:12, border:'none',
              background:changingPass?'rgba(99,102,241,0.3)':'linear-gradient(135deg,#6366f1,#f72585)',
              color:'white', fontFamily:'Cairo', fontWeight:700, fontSize:14,
              cursor:changingPass?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
              <Lock size={15}/> {changingPass?'جاري التغيير...':'تغيير كلمة المرور'}
            </button>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} style={{
          width:'100%', padding:'13px', borderRadius:12, border:'none',
          background:saving?'rgba(99,102,241,0.3)':'linear-gradient(135deg,#6366f1,#f72585)',
          color:'white', fontFamily:'Cairo', fontWeight:700, fontSize:15,
          cursor:saving?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          boxShadow:saving?'none':'0 4px 20px rgba(99,102,241,0.3)',
        }}>
          <Save size={18}/> {saving?'جاري الحفظ...':'حفظ جميع الإعدادات'}
        </button>
      </div>
    </div>
  )
}
