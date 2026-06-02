import { X, Star, ShoppingCart, Check, BookOpen, GraduationCap, Layout, Wrench } from 'lucide-react'

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

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14}
          fill={i <= Math.round(rating) ? '#ffd60a' : 'none'}
          color={i <= Math.round(rating) ? '#ffd60a' : '#64748b'} />
      ))}
    </div>
  )
}

export default function ProductModal({ product, onClose, onBuy }) {
  if (!product) return null

  const CategoryIcon = categoryIcons[product.category] || ShoppingCart
  const catColor = categoryColors[product.category] || '#6366f1'
  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.original_price) * 100) : 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 680 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header image */}
        <div style={{
          height: 200,
          background: product.image_url
            ? `url(${product.image_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${catColor}30, rgba(99,102,241,0.15))`,
          borderRadius: '20px 20px 0 0',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {!product.image_url && (
            <CategoryIcon size={80} color={catColor} style={{ opacity: 0.5 }} />
          )}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              backdropFilter: 'blur(4px)',
            }}
          >
            <X size={18} />
          </button>
          {hasDiscount && (
            <div style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'linear-gradient(135deg, #f72585, #ff9f1c)',
              color: 'white',
              borderRadius: 8,
              padding: '4px 12px',
              fontSize: 13,
              fontWeight: 800,
            }}>
              وفر {discountPct}%
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: 28 }}>
          {/* Title & Category */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: '#f8fafc', lineHeight: 1.3, flex: 1 }}>
              {product.title}
            </h2>
            <div style={{
              background: `${catColor}22`,
              border: `1px solid ${catColor}44`,
              color: catColor,
              borderRadius: 8,
              padding: '3px 12px',
              fontSize: 12,
              fontWeight: 700,
              marginRight: 12,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <CategoryIcon size={12} />
              {{books:'كتاب',courses:'كورس',templates:'قالب',tools:'أداة'}[product.category]}
            </div>
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Stars rating={product.rating || 5} />
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {product.rating || 5}/5 · {product.sales_count || 0} مبيعة
            </span>
          </div>

          {/* Description */}
          <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
            {product.long_description || product.description}
          </p>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontWeight: 700, fontSize: 14, color: '#818cf8', marginBottom: 10 }}>
                ✦ ما ستحصل عليه
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {product.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'rgba(16,185,129,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Check size={10} color="#10b981" />
                    </div>
                    <span style={{ fontSize: 13, color: '#cbd5e1' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
              {product.tags.map((tag, i) => (
                <span key={i} style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: '#818cf8',
                  borderRadius: 99,
                  padding: '3px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Price & CTA */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: 14,
            padding: '16px 20px',
          }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>السعر</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  background: 'linear-gradient(135deg, #ffd60a, #ff9500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 800,
                  fontSize: 28,
                }}>
                  ${product.price}
                </span>
                {hasDiscount && (
                  <span style={{ color: '#64748b', fontSize: 14, textDecoration: 'line-through' }}>
                    ${product.original_price}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onBuy(product)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 28px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #f72585)',
                color: 'white',
                fontFamily: 'Cairo, sans-serif',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.5)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.35)'
              }}
            >
              <ShoppingCart size={18} />
              اشتري الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
