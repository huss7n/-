-- =============================================
-- DIGITAL STORE - SUPABASE SCHEMA
-- Run this in the Supabase SQL Editor
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL CHECK (category IN ('books', 'courses', 'templates', 'tools')),
  image_url TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  preview_url TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 5.0,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PAYMENT METHODS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mastercard', 'bank_transfer', 'zaincash', 'custom')),
  details JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DISCOUNT CODES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  percentage INTEGER NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  min_amount DECIMAL(10,2) DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  description TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  payment_method_name TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'rejected')),
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'completed', 'cancelled')),
  amount DECIMAL(10,2) NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  discount_code TEXT DEFAULT '',
  discount_percentage INTEGER DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  payment_proof_url TEXT DEFAULT '',
  admin_notes TEXT DEFAULT '',
  customer_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ADMINS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT DEFAULT '',
  role TEXT DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
  permissions JSONB DEFAULT '{"products": true, "orders": true, "discounts": false, "payments": false, "admins": false, "settings": false}',
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('products', 'products', true),
  ('payments', 'payments', false)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read active products
CREATE POLICY "Public can read active products" ON products
  FOR SELECT USING (is_active = true);

-- Payment methods: anyone can read active methods
CREATE POLICY "Public can read active payment methods" ON payment_methods
  FOR SELECT USING (is_active = true);

-- Settings: anyone can read settings
CREATE POLICY "Public can read settings" ON settings
  FOR SELECT USING (true);

-- Orders: public can insert new orders
CREATE POLICY "Public can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Orders: public can read by order number (for tracking)
CREATE POLICY "Public can read own orders" ON orders
  FOR SELECT USING (true);

-- Full access via service role (for admin operations via RPC)
CREATE POLICY "Service role full access products" ON products
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access orders" ON orders
  USING (auth.role() = 'service_role');

-- =============================================
-- FUNCTIONS (RPC)
-- =============================================

-- Function to verify admin password
CREATE OR REPLACE FUNCTION verify_admin_login(
  p_email TEXT,
  p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_row admins%ROWTYPE;
BEGIN
  SELECT * INTO admin_row
  FROM admins
  WHERE email = p_email AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'بيانات الدخول غير صحيحة');
  END IF;

  IF crypt(p_password, admin_row.password_hash) = admin_row.password_hash THEN
    UPDATE admins SET last_login = NOW() WHERE id = admin_row.id;
    RETURN json_build_object(
      'success', true,
      'admin', json_build_object(
        'id', admin_row.id,
        'email', admin_row.email,
        'name', admin_row.name,
        'role', admin_row.role,
        'permissions', admin_row.permissions
      )
    );
  ELSE
    RETURN json_build_object('success', false, 'error', 'بيانات الدخول غير صحيحة');
  END IF;
END;
$$;

-- Function to create a new admin
CREATE OR REPLACE FUNCTION create_admin(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT,
  p_permissions JSONB,
  p_created_by UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO admins (email, password_hash, name, role, permissions, created_by)
  VALUES (
    p_email,
    crypt(p_password, gen_salt('bf', 10)),
    p_name,
    p_role,
    p_permissions,
    p_created_by
  )
  RETURNING id INTO new_id;

  RETURN json_build_object('success', true, 'id', new_id);
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object('success', false, 'error', 'هذا البريد الإلكتروني مسجل مسبقاً');
END;
$$;

-- Function to verify discount code
CREATE OR REPLACE FUNCTION verify_discount_code(
  p_code TEXT,
  p_amount DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code_row discount_codes%ROWTYPE;
BEGIN
  SELECT * INTO code_row
  FROM discount_codes
  WHERE code = UPPER(p_code) AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'كود الخصم غير صحيح أو منتهي الصلاحية');
  END IF;

  IF code_row.expires_at IS NOT NULL AND code_row.expires_at < NOW() THEN
    RETURN json_build_object('valid', false, 'error', 'انتهت صلاحية كود الخصم');
  END IF;

  IF code_row.max_uses IS NOT NULL AND code_row.used_count >= code_row.max_uses THEN
    RETURN json_build_object('valid', false, 'error', 'تم استنفاد عدد مرات استخدام هذا الكود');
  END IF;

  IF p_amount < COALESCE(code_row.min_amount, 0) THEN
    RETURN json_build_object('valid', false, 'error', 'المبلغ أقل من الحد الأدنى للخصم');
  END IF;

  RETURN json_build_object(
    'valid', true,
    'percentage', code_row.percentage,
    'code', code_row.code
  );
END;
$$;

-- Function to generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  order_num TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    order_num := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = order_num) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN order_num;
END;
$$;

-- =============================================
-- INSERT DEFAULT DATA
-- =============================================

-- Default settings
INSERT INTO settings (key, value, description) VALUES
  ('whatsapp_number', '07800015055', 'رقم واتساب للتواصل'),
  ('facebook_url', 'https://facebook.com', 'رابط صفحة الفيسبوك'),
  ('instagram_url', 'https://instagram.com', 'رابط حساب الانستاجرام'),
  ('telegram_url', 'https://t.me', 'رابط قناة التيليجرام'),
  ('site_name', 'المتجر الرقمي', 'اسم الموقع'),
  ('site_description', 'منتجاتي الرقمية من كتب وكورسات وقوالب وأدوات', 'وصف الموقع'),
  ('logo_url', '', 'رابط شعار الموقع')
ON CONFLICT (key) DO NOTHING;

-- Default payment methods
INSERT INTO payment_methods (name, type, details, is_active, display_order) VALUES
  ('ماستر كارد', 'mastercard', '{"card_number": "رقم البطاقة", "account_name": "اسم صاحب البطاقة", "instructions": "أرسل المبلغ وأرفق لقطة شاشة كإثبات"}', true, 1),
  ('حوالة مصرفية', 'bank_transfer', '{"bank_name": "اسم البنك", "account_number": "رقم الحساب", "account_name": "الاسم الكامل", "instructions": "أرسل الحوالة وأرفق وصل الإيداع كإثبات"}', true, 2),
  ('زين كاش', 'zaincash', '{"phone_number": "07800015055", "account_name": "حسين", "instructions": "أرسل المبلغ على الرقم وأرفق لقطة شاشة كإثبات"}', true, 3)
ON CONFLICT DO NOTHING;

-- Insert superadmin (email: styrs48@gmail.com, password: Hussin7788$$)
INSERT INTO admins (email, password_hash, name, role, permissions, is_active)
VALUES (
  'styrs48@gmail.com',
  crypt('Hussin7788$$', gen_salt('bf', 10)),
  'حسين',
  'superadmin',
  '{"products": true, "orders": true, "discounts": true, "payments": true, "admins": true, "settings": true}',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Sample products for testing
INSERT INTO products (title, description, long_description, price, original_price, category, image_url, tags, features, is_active, rating, sales_count)
VALUES
  (
    'قالب موقع احترافي',
    'قالب HTML/CSS/JS جاهز للاستخدام بتصميم عصري',
    'قالب موقع ويب احترافي كامل مع تصميم متجاوب يعمل على جميع الأجهزة. يشمل صفحة هبوط، صفحة about، صفحة خدمات، وصفحة تواصل.',
    25.00, 50.00, 'templates',
    '',
    ARRAY['HTML', 'CSS', 'JavaScript', 'Responsive'],
    ARRAY['تصميم متجاوب', 'كود نظيف', 'سهل التخصيص', 'متوافق مع جميع المتصفحات', 'توثيق شامل'],
    true, 4.8, 45
  ),
  (
    'كورس تطوير الويب',
    'كورس شامل في تطوير الويب من الصفر',
    'كورس تدريبي متكامل يغطي HTML, CSS, JavaScript, React, وNode.js. مناسب للمبتدئين والمتوسطين.',
    45.00, 80.00, 'courses',
    '',
    ARRAY['HTML', 'CSS', 'JavaScript', 'React', 'NodeJS'],
    ARRAY['20 ساعة محتوى', 'مشاريع عملية', 'شهادة إتمام', 'دعم مستمر', 'تحديثات مجانية'],
    true, 5.0, 120
  ),
  (
    'دليل ريادة الأعمال الرقمية',
    'كتاب الكتروني شامل عن ريادة الأعمال',
    'دليل عملي شامل لبناء عمل تجاري رقمي ناجح من الصفر. يشمل استراتيجيات التسويق، إدارة المشاريع، وكيفية تحقيق الدخل.',
    15.00, NULL, 'books',
    '',
    ARRAY['ريادة الأعمال', 'تجارة إلكترونية', 'تسويق رقمي'],
    ARRAY['150 صفحة', 'أمثلة عملية', 'خطط قابلة للتطبيق', 'تحديثات سنوية'],
    true, 4.5, 78
  )
ON CONFLICT DO NOTHING;

-- =============================================
-- DONE!
-- =============================================
-- After running this SQL:
-- 1. Go to Authentication > Users in Supabase dashboard
-- 2. The admin login uses the admins table directly (not Supabase Auth)
-- 3. Login credentials: styrs48@gmail.com / Hussin7788$$
-- =============================================
