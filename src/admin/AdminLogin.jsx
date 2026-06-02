import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('أدخل البيانات كاملة')
    setLoading(true)

    const { data, error } = await supabase.rpc('verify_admin_login', {
      p_email: email.trim().toLowerCase(),
      p_password: password,
    })

    setLoading(false)

    if (error || !data?.success) {
      toast.error(data?.error || 'بيانات الدخول غير صحيحة')
    } else {
      login(data.admin)
      toast.success(`أهلاً ${data.admin.name || data.admin.email} 👋`)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
    }}>
      {/* BG glow */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 420,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 70,
            height: 70,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #6366f1, #f72585)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 30px rgba(99,102,241,0.3)',
          }}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 24, color: '#f8fafc', marginBottom: 6 }}>
            لوحة الإدارة
          </h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            المتجر الرقمي · نظام إدارة متكامل
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'rgba(8,8,32,0.9)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 20,
          padding: 32,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'block', fontWeight: 600 }}>
                البريد الإلكتروني
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748b" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="input-dark"
                  style={{ paddingRight: 42, direction: 'ltr', textAlign: 'right' }}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'block', fontWeight: 600 }}>
                كلمة المرور
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748b" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="input-dark"
                  style={{ paddingRight: 42, paddingLeft: 42, direction: 'ltr', textAlign: 'right' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: 0,
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                padding: '13px',
                borderRadius: 12,
                border: 'none',
                background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #f72585)',
                color: 'white',
                fontFamily: 'Cairo',
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
              }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> جاري التحقق...</>
              ) : (
                <><Lock size={16} /> تسجيل الدخول</>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 20 }}>
          الوصول مقيد للمسؤولين المعتمدين فقط
        </p>
      </div>
    </div>
  )
}
