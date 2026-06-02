const categories = [
  { id: 'all', label: 'الكل', emoji: '✨' },
  { id: 'books', label: 'كتب', emoji: '📚' },
  { id: 'courses', label: 'كورسات', emoji: '🎓' },
  { id: 'templates', label: 'قوالب', emoji: '🎨' },
  { id: 'tools', label: 'أدوات', emoji: '⚙️' },
]

export default function CategoryFilter({ active, onChange, counts = {} }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center',
      padding: '24px 16px 0',
    }}>
      {categories.map(cat => {
        const isActive = active === cat.id
        const count = cat.id === 'all' 
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[cat.id] || 0

        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            style={{
              padding: '8px 20px',
              borderRadius: 99,
              fontFamily: 'Cairo, sans-serif',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: isActive ? 'none' : '1px solid rgba(99,102,241,0.2)',
              background: isActive
                ? 'linear-gradient(135deg, #6366f1, #f72585)'
                : 'rgba(99,102,241,0.05)',
              color: isActive ? 'white' : '#94a3b8',
              boxShadow: isActive ? '0 4px 15px rgba(99,102,241,0.3)' : 'none',
              transform: isActive ? 'translateY(-1px)' : 'none',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.color = '#f8fafc'
                e.currentTarget.style.background = 'rgba(99,102,241,0.12)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.color = '#94a3b8'
                e.currentTarget.style.background = 'rgba(99,102,241,0.05)'
              }
            }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
            {count > 0 && (
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(99,102,241,0.15)',
                borderRadius: 99,
                padding: '1px 7px',
                fontSize: 11,
                fontWeight: 700,
                color: isActive ? 'white' : '#818cf8',
              }}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
