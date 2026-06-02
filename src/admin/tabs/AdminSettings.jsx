import { useState, useEffect } from 'react'
import { Save, Settings, Globe, Phone, Image, Facebook, Instagram } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import toast from 'react-hot-toast'

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

const settingGroups = [
  {
    title: 'معلومات الموقع',
    icon: Globe,
    keys: [
      { key: 'site_name', label: 'اسم الموقع', placeholder: 'المتجر الرقمي', type: 'text' },
      { key: 'site_description', label: 'وصف الموقع', placeholder: 'وصف يظهر في الصفحة الرئيسية', type: 'text' },
      { key: 'logo_url', label: 'رابط الشعار', placeholder: 'https://...', type: 'url' },
    ],
  },
  {
    title: 'واتساب',
    icon: Phone,
    keys: [
      { key: 'whatsapp_number', label: 'رقم الواتساب', placeholder: '07xxxxxxxxx', type: 'tel' },
    ],
  },
  {
    title: 'وسائل التواصل الاجتماعي',
    icon: Globe,
    keys: [
      { key: 'facebook_url', label: 'رابط الفيسبوك', placeholder: 'https://facebook.com/...', type: 'url', icon: Facebook },
      { key: 'instagram_url', label: 'رابط الانستاجرام', placeholder: 'https://instagram.com/...', type: 'url', icon: Instagram },
      { key: 'telegram_url', label: 'رابط التيليجرام', placeholder: 'https://t.me/...', type: 'url', iconComp: TelegramIcon },
    ],
  },
]

export default function AdminSettings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadSettings() }, [])

  const loadSettings = async () => {
    setLoading(true)
    const { data } = await supabase.from('settings').select('*')
    const map = {}
    ;(data || []).forEach(s => { map[s.key] = s.value })
    setSettings(map)
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const upserts = Object.entries(settings).map(([key, value]) => ({
      key,
      value: value || '',
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('settings')
      .upsert(upserts, { onConflict: 'key' })

    setSaving(false)
    if (error) return toast.error('فشل الحفظ: ' + error.message)
    toast.success('تم حفظ الإعدادات ✓')
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: '#f8fafc' }}>إعدادات الموقع</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>تخصيص معلومات الموقع وطرق التواصل</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          <Save size={16} />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {settingGroups.map(group => {
          const GroupIcon = group.icon
          return (
            <div key={group.title} style={{
              background: 'rgba(8,8,32,0.7)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 16,
              overflow: 'hidden',
            }}>
              {/* Group Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 20px',
                borderBottom: '1px solid rgba(99,102,241,0.1)',
                background: 'rgba(99,102,241,0.05)',
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #6366f1, #f72585)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <GroupIcon size={15} color="white" />
                </div>
                <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: 14 }}>{group.title}</span>
              </div>

              {/* Fields */}
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {group.keys.map(field => {
                  const FieldIcon = field.icon
                  const FieldIconComp = field.iconComp
                  return (
                    <div key={field.key}>
                      <label style={{
                        fontSize: 13,
                        color: '#94a3b8',
                        marginBottom: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontWeight: 600,
                      }}>
                        {FieldIcon && <FieldIcon size={13} />}
                        {FieldIconComp && <FieldIconComp />}
                        {field.label}
                      </label>
                      <input
                        className="input-dark"
                        type={field.type || 'text'}
                        value={settings[field.key] || ''}
                        onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        style={field.type === 'url' || field.type === 'tel' ? { direction: 'ltr', textAlign: 'right' } : {}}
                      />
                      {/* Preview logo */}
                      {field.key === 'logo_url' && settings.logo_url && (
                        <div style={{ marginTop: 10 }}>
                          <img
                            src={settings.logo_url}
                            alt="Logo preview"
                            style={{ height: 50, objectFit: 'contain', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)', padding: 6, background: 'rgba(8,8,32,0.5)' }}
                            onError={e => e.target.style.display = 'none'}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Warning */}
        <div style={{
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: 13, marginBottom: 3 }}>ملاحظة</div>
            <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>
              سيتم تطبيق الإعدادات فوراً على الموقع بعد الحفظ. الروابط الاجتماعية الفارغة لن تظهر للزوار.
            </div>
          </div>
        </div>

        {/* Save Button (Bottom) */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            border: 'none',
            background: saving ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #f72585)',
            color: 'white',
            fontFamily: 'Cairo',
            fontWeight: 700,
            fontSize: 15,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: saving ? 'none' : '0 4px 20px rgba(99,102,241,0.3)',
            transition: 'all 0.2s',
          }}
        >
          <Save size={18} />
          {saving ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}
        </button>
      </div>
    </div>
  )
}
