import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Check, Image } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import toast from 'react-hot-toast'

const emptyProduct = {
  title: '', description: '', long_description: '', price: '', original_price: '',
  category: 'templates', image_url: '', file_url: '', preview_url: '',
  tags: '', features: '', is_active: true,
}

const categories = [
  { id: 'books', label: 'كتاب' },
  { id: 'courses', label: 'كورس' },
  { id: 'templates', label: 'قالب' },
  { id: 'tools', label: 'أداة' },
]

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyProduct)
    setShowForm(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      ...p,
      tags: (p.tags || []).join(', '),
      features: (p.features || []).join('\n'),
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('عنوان المنتج مطلوب')
    if (!form.price) return toast.error('السعر مطلوب')
    setSaving(true)

    const payload = {
      ...form,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      features: form.features ? form.features.split('\n').map(f => f.trim()).filter(Boolean) : [],
    }

    let error
    if (editing) {
      ;({ error } = await supabase.from('products').update(payload).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('products').insert(payload))
    }

    setSaving(false)
    if (error) return toast.error('حدث خطأ: ' + error.message)
    toast.success(editing ? 'تم تحديث المنتج ✓' : 'تم إضافة المنتج ✓')
    setShowForm(false)
    loadProducts()
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return toast.error('فشل الحذف')
    toast.success('تم الحذف')
    loadProducts()
  }

  const toggleActive = async (p) => {
    await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id)
    loadProducts()
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: '#f8fafc' }}>إدارة المنتجات</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{products.length} منتج مسجل</p>
        </div>
        <button onClick={openAdd} className="btn-primary" style={{ gap: 8 }}>
          <Plus size={16} /> إضافة منتج
        </button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <p style={{ color: '#64748b' }}>لا توجد منتجات بعد</p>
        </div>
      ) : (
        <div style={{ background: 'rgba(8,8,32,0.6)', borderRadius: 16, border: '1px solid rgba(99,102,241,0.12)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الفئة</th>
                  <th>السعر</th>
                  <th>الحالة</th>
                  <th>المبيعات</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: 14 }}>{p.title}</div>
                      <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{p.description?.slice(0, 50)}...</div>
                    </td>
                    <td>
                      <span style={{
                        background: 'rgba(99,102,241,0.1)',
                        color: '#818cf8',
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        {categories.find(c => c.id === p.category)?.label || p.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#ffd60a' }}>${p.price}</div>
                      {p.original_price && (
                        <div style={{ color: '#475569', fontSize: 12, textDecoration: 'line-through' }}>${p.original_price}</div>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleActive(p)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: p.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          border: `1px solid ${p.is_active ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          color: p.is_active ? '#10b981' : '#ef4444',
                          borderRadius: 8,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontFamily: 'Cairo',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {p.is_active ? <><Check size={12} /> نشط</> : <><X size={12} /> مخفي</>}
                      </button>
                    </td>
                    <td style={{ color: '#94a3b8', fontWeight: 600 }}>{p.sales_count || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => openEdit(p)}
                          style={{
                            background: 'rgba(99,102,241,0.1)',
                            border: '1px solid rgba(99,102,241,0.2)',
                            borderRadius: 8,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            color: '#818cf8',
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          style={{
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 8,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            color: '#ef4444',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px 16px',
              borderBottom: '1px solid rgba(99,102,241,0.1)',
            }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: '#f8fafc' }}>
                {editing ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>العنوان *</label>
                  <input className="input-dark" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="عنوان المنتج" />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>السعر (دولار) *</label>
                  <input className="input-dark" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" style={{ direction: 'ltr' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>السعر الأصلي (للخصم)</label>
                  <input className="input-dark" type="number" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})} placeholder="0.00" style={{ direction: 'ltr' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>الفئة *</label>
                  <select className="input-dark" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>الحالة</label>
                  <select className="input-dark" value={form.is_active} onChange={e => setForm({...form, is_active: e.target.value === 'true'})}>
                    <option value="true">نشط (مرئي)</option>
                    <option value="false">مخفي</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>وصف مختصر</label>
                <input className="input-dark" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="وصف قصير يظهر في بطاقة المنتج" />
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>وصف تفصيلي</label>
                <textarea className="input-dark" value={form.long_description} onChange={e => setForm({...form, long_description: e.target.value})} placeholder="وصف كامل يظهر في صفحة المنتج" rows={3} style={{ resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>رابط الصورة</label>
                <input className="input-dark" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>المميزات (سطر لكل ميزة)</label>
                <textarea className="input-dark" value={form.features} onChange={e => setForm({...form, features: e.target.value})} placeholder="ميزة 1&#10;ميزة 2&#10;ميزة 3" rows={3} style={{ resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>الوسوم (مفصولة بفاصلة)</label>
                <input className="input-dark" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="HTML, CSS, JavaScript" style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
                  {saving ? 'جاري الحفظ...' : editing ? 'حفظ التعديلات' : 'إضافة المنتج'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
