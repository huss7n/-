import { Star, ShoppingCart, Eye, BookOpen, GraduationCap, Layout, Wrench } from 'lucide-react'

const categoryIcons = {
  books: BookOpen,
  courses: GraduationCap,
  templates: Layout,
  tools: Wrench,
}

const categoryColors = {
  books: '#f72585',
  courses: '#4361ee',
  templates: '#7209b7',
  tools: '#06d6a0',
}

const categoryLabels = {
  books: 'كتاب',
  courses: 'كورس',
  templates: 'قالب',
  tools: 'أداة',
}

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          fill={i <= Math.round(rating) ? '#ffd60a' : 'none'}
          color={i <= Math.round(rating) ? '#ffd60a' : '#64748b'}
        />
      ))}
    </div>
  )
}

export default function ProductCard({ product, onClick }) {
  const CategoryIcon = categoryIcons[product.category] || ShoppingCart
  const catColor = categoryColors[product.category] || '#6366f1'
  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0

  return (
    <div
      className="glass-card"
      style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
      onClick={() => onClick(product)}
    >
      {/* Discount badge */}
      {hasDiscount && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          background: 'linear-gradient(135deg, #f72585, #ff9f1c)',
          color: 'white',
          borderRadius: 8,
          padding: '3px 10px',
          fontSize: 12,
          fontWeight: 800,
          zIndex: 2,
        }}>
          -{discountPct}%
        </div>
      )}

      {/* Category badge */}
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        background: `${catColor}22`,
        border: `1px solid ${catColor}44`,
        color: catColor,
        borderRadius: 8,
        padding: '3px 10px',
        fontSize: 11,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        zIndex: 2,
      }}>
        <CategoryIcon size={11} />
        {categoryLabels[product.category]}
      </div>

      {/* Product image / placeholder */}
      <div style={{
        height: 180,
        background: product.image_url
          ? `url(${product.image_url}) center/cover no-repeat`
          : `linear-gradient(135deg, ${catColor}22, ${catColor}08)`,
        borderRadius: '16px 16px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {!product.image_url && (
          <>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at 30% 30%, ${catColor}30, transparent 60%)`,
            }} />
            <CategoryIcon size={60} color={catColor} style={{ opacity: 0.4 }} />
          </>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px 18px 18px' }}>
        <h3 style={{
          fontWeight: 700,
          fontSize: 15,
          color: '#f8fafc',
          marginBottom: 6,
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.title}
        </h3>

        <p style={{
          color: '#94a3b8',
          fontSize: 13,
          lineHeight: 1.5,
          marginBottom: 12,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.description}
        </p>

        {/* Rating & Sales */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Stars rating={product.rating || 5} />
          <span style={{ fontSize: 12, color: '#64748b' }}>({product.sales_count || 0} مبيعة)</span>
        </div>

        {/* Price & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #ffd60a, #ff9500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 800,
              fontSize: 20,
            }}>
              ${product.price}
            </div>
            {hasDiscount && (
              <div style={{
                color: '#64748b',
                fontSize: 12,
                textDecoration: 'line-through',
              }}>
                ${product.original_price}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={e => { e.stopPropagation(); onClick(product) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #f72585)',
                color: 'white',
                fontFamily: 'Cairo, sans-serif',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <ShoppingCart size={14} />
              شراء
            </button>
            <button
              onClick={e => { e.stopPropagation(); onClick(product) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 8,
                borderRadius: 10,
                border: '1px solid rgba(99,102,241,0.2)',
                background: 'transparent',
                color: '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.1)'
                e.currentTarget.style.color = '#818cf8'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#94a3b8'
              }}
            >
              <Eye size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
