import { Facebook, Instagram, Send, Heart } from 'lucide-react'

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

export default function Footer({ settings = {} }) {
  const socialLinks = [
    { key: 'facebook_url', icon: Facebook, label: 'فيسبوك', color: '#1877f2' },
    { key: 'instagram_url', icon: Instagram, label: 'انستاجرام', color: '#e1306c' },
    { key: 'telegram_url', icon: TelegramIcon, label: 'تيليجرام', color: '#0088cc' },
  ]

  const visibleLinks = socialLinks.filter(s => settings[s.key])

  return (
    <footer style={{
      borderTop: '1px solid rgba(99,102,241,0.1)',
      background: 'rgba(8,8,32,0.8)',
      backdropFilter: 'blur(10px)',
      padding: '32px 24px 24px',
      marginTop: 60,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          marginBottom: 24,
        }}>
          {/* Brand */}
          <div>
            <div style={{
              fontWeight: 800,
              fontSize: 20,
              background: 'linear-gradient(135deg, #818cf8, #f72585)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 6,
            }}>
              {settings.site_name || 'المتجر الرقمي'}
            </div>
            <div style={{ color: '#64748b', fontSize: 13, maxWidth: 300 }}>
              {settings.site_description || 'منتجاتي الرقمية من كتب وكورسات وقوالب وأدوات'}
            </div>
          </div>

          {/* Social Links */}
          {visibleLinks.length > 0 && (
            <div style={{ display: 'flex', gap: 10 }}>
              {visibleLinks.map(({ key, icon: Icon, label, color }) => (
                <a
                  key={key}
                  href={settings[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `${color}15`,
                    border: `1px solid ${color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: color,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${color}25`
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = `0 6px 20px ${color}30`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = `${color}15`
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div style={{
          borderTop: '1px solid rgba(99,102,241,0.08)',
          paddingTop: 20,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{ color: '#475569', fontSize: 12 }}>
            © {new Date().getFullYear()} جميع الحقوق محفوظة
          </div>
          <div style={{ color: '#475569', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            صُنع بـ <Heart size={12} color="#f72585" fill="#f72585" /> بتقنية متقدمة
          </div>
        </div>
      </div>
    </footer>
  )
}
