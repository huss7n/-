# 🚀 المتجر الرقمي — Digital Store

متجر إلكتروني احترافي لبيع المنتجات الرقمية (كتب، كورسات، قوالب، أدوات).

---

## ✅ المميزات

- 🛍️ **عرض المنتجات** بتصميم بطاقات احترافي مع تصفية بالفئة والبحث
- 🛒 **سلة شراء متكاملة** مع دعم كودات الخصم
- 📦 **تتبع الطلبات** برقم الطلب أو البريد الإلكتروني
- 💬 **زر واتساب متحرك** قابل للتعديل
- 📱 **تصميم متجاوب** يعمل على جميع الأجهزة
- 🔐 **لوحة إدارة كاملة** بنظام صلاحيات متدرج

---

## 🗄️ إعداد Supabase

### الخطوة 1: إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ حساباً مجانياً
2. انقر **New Project** واختر اسم للمشروع
3. انتظر حتى يكتمل إنشاء المشروع (~2 دقيقة)

### الخطوة 2: تشغيل قاعدة البيانات
1. في لوحة Supabase، اذهب إلى **SQL Editor**
2. انقر **New Query**
3. انسخ محتوى ملف `supabase/schema.sql` بالكامل والصقه
4. انقر **Run** ✓

### الخطوة 3: الحصول على المفاتيح
1. اذهب إلى **Settings → API**
2. انسخ **Project URL** و **anon public key**

### الخطوة 4: إعداد متغيرات البيئة
```bash
cp .env.example .env
```
افتح `.env` وأضف:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

---

## 💻 التشغيل المحلي

```bash
# تثبيت المكتبات
npm install

# تشغيل للتطوير
npm run dev

# بناء للإنتاج
npm run build
```

---

## 🐙 رفع على GitHub

```bash
# داخل مجلد المشروع
git init
git add .
git commit -m "🚀 Initial commit - Digital Store"

# أنشئ مستودعاً جديداً على GitHub ثم:
git remote add origin https://github.com/YOUR_USERNAME/digital-store.git
git branch -M main
git push -u origin main
```

---

## 🌐 نشر على Netlify

### الطريقة السريعة:
1. اذهب إلى [netlify.com](https://netlify.com)
2. انقر **Add new site → Import an existing project**
3. اختر **GitHub** واختر مستودعك
4. في إعدادات البناء:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. اذهب إلى **Site settings → Environment variables** وأضف:
   - `VITE_SUPABASE_URL` = رابط مشروع Supabase
   - `VITE_SUPABASE_ANON_KEY` = المفتاح العام
6. انقر **Deploy site** ✓

---

## 🔑 بيانات الدخول الافتراضية

```
البريد: styrs48@gmail.com
كلمة المرور: Hussin7788$$
```

> ⚠️ **مهم:** غيّر كلمة المرور بعد أول تسجيل دخول

---

## 📁 هيكل المشروع

```
src/
├── admin/
│   ├── AdminLogin.jsx          # صفحة تسجيل الدخول
│   └── tabs/
│       ├── AdminProducts.jsx   # إدارة المنتجات
│       ├── AdminOrders.jsx     # إدارة الطلبات
│       ├── AdminPayments.jsx   # طرق الدفع
│       ├── AdminDiscounts.jsx  # كودات الخصم
│       ├── AdminUsers.jsx      # إدارة المديرين
│       └── AdminSettings.jsx   # إعدادات الموقع
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── CategoryFilter.jsx
│   ├── ProductCard.jsx
│   ├── ProductModal.jsx
│   ├── CheckoutModal.jsx
│   └── WhatsAppButton.jsx
├── contexts/
│   └── AuthContext.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── OrderTrackingPage.jsx
│   └── AdminPage.jsx
└── supabaseClient.js
```

---

## 💡 اقتراحات إضافية للمستقبل
- ✉️ إرسال إيميل تأكيد تلقائي للعملاء (Supabase Edge Functions)
- ⭐ نظام تقييم المنتجات
- 📊 لوحة إحصائيات متقدمة
- 🌍 دعم متعدد اللغات
- 🎁 نظام عروض وحزم المنتجات
