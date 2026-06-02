import { useState, useEffect } from 'react'
import { Search, Sparkles, TrendingUp, ShoppingBag } from 'lucide-react'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import CategoryFilter from '../components/CategoryFilter'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import CheckoutModal from '../components/CheckoutModal'
import Footer from '../components/Footer'

export default function HomePage({ settings }) {
  const [products, setProducts] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [buyProduct, setBuyProduct] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [{ data: prods }, { data: methods }] = await Promise.all([
      supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('payment_methods').select('*').eq('is_active', true).order('display_order'),
    ])
    setProducts(prods || [])
    setPaymentMethods(methods || [])
    setLoading(false)
  }

  const filtered = products.filter(p => {
    const matchCat = category === 'all' || p.category === category
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const counts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})

  const featured = products.filter(p => p.sales_count > 50).slice(0, 3)

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Header logoUrl={settings?.logo_url} siteName={settings?.site_name} />

      {/* Hero Section */}
      <section style={{
        padding: '60px 24px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 99,
          padding: '6px 16px',
          marginBottom: 20,
          fontSize: 13,
          color: '#818cf8',
          fontWeight: 600,
        }}>
          <Sparkles size={14} />
          منتجات رقمية احترافية
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 52px)',
          fontWeight: 900,
          lineHeight: 1.2,
          marginBottom: 16,
          color: '#f8fafc',
        }}>
          اكتشف أفضل{' '}
          <span style={{
            background: 'linear-gradient(135deg, #818cf8, #f72585)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            المنتجات الرقمية
          </span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 16, maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6 }}>
          {settings?.site_description || 'كتب، كورسات، قوالب، وأدوات لتطوير مسيرتك المهنية'}
        </p>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          maxWidth: 520,
          margin: '0 auto',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 14,
          padding: '4px 4px 4px 16px',
          gap: 8,
          transition: 'all 0.3s',
        }}
          onFocus={() => {}}
        >
          <Search size={18} color="#64748b" style={{ flexShrink: 0 }} />
          <input
            placeholder="ابحث عن منتج..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontFamily: 'Cairo, sans-serif',
              fontSize: 14,
              padding: '8px 0',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: 'none',
                borderRadius: 8,
                padding: '6px 12px',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'Cairo',
                fontWeight: 600,
              }}
            >
              مسح
            </button>
          )}
        </div>
      </section>

      {/* Stats Bar */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
          flexWrap: 'wrap',
          marginBottom: 32,
        }}>
          {[
            { label: 'منتج رقمي', value: products.length, icon: ShoppingBag },
            { label: 'عميل راضٍ', value: products.reduce((a, p) => a + (p.sales_count || 0), 0) + '+', icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(99,102,241,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={16} color="#818cf8" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#f8fafc' }}>{value}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter active={category} onChange={setCategory} counts={counts} />

      {/* Products Grid */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
            <div className="spinner" />
            <p style={{ color: '#64748b', fontSize: 14 }}>جاري تحميل المنتجات...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontWeight: 700, fontSize: 18, color: '#f8fafc', marginBottom: 8 }}>
              لا توجد نتائج
            </h3>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              {search ? `لا يوجد منتج يطابق "${search}"` : 'لا توجد منتجات في هذه الفئة حالياً'}
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: '#94a3b8' }}>
                {filtered.length} منتج {category !== 'all' ? '' : 'متاح'}
              </h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}>
              {filtered.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={p => setSelectedProduct(p)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer settings={settings} />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuy={p => {
            setSelectedProduct(null)
            setBuyProduct(p)
          }}
        />
      )}

      {/* Checkout Modal */}
      {buyProduct && (
        <CheckoutModal
          product={buyProduct}
          paymentMethods={paymentMethods}
          onClose={() => setBuyProduct(null)}
        />
      )}
    </div>
  )
}
