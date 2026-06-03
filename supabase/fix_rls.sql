-- =============================================
-- إصلاح شامل لجميع المشاكل
-- انسخ هذا كاملاً في SQL Editor وشغّله
-- =============================================

-- ① إزالة السياسات القديمة المقيدة
DROP POLICY IF EXISTS "Service role full access products" ON products;
DROP POLICY IF EXISTS "Service role full access orders" ON orders;
DROP POLICY IF EXISTS "Public can read active products" ON products;
DROP POLICY IF EXISTS "Public can read active payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Public can read settings" ON settings;
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Public can read own orders" ON orders;

-- ② سياسات جديدة تسمح بكل العمليات
CREATE POLICY "allow_all_products" ON products USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_orders" ON orders USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_payment_methods" ON payment_methods USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_discount_codes" ON discount_codes USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_admins" ON admins USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_settings" ON settings USING (true) WITH CHECK (true);

-- ③ سياسات Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('payments', 'payments', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "allow products upload" ON storage.objects;
DROP POLICY IF EXISTS "allow payments upload" ON storage.objects;
DROP POLICY IF EXISTS "allow products read" ON storage.objects;

CREATE POLICY "allow_storage_all" ON storage.objects USING (true) WITH CHECK (true);

-- ④ دالة زيادة استخدام كود الخصم
CREATE OR REPLACE FUNCTION increment_discount_usage(p_code TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE discount_codes SET used_count = used_count + 1 WHERE code = p_code;
END;
$$;

-- ⑤ دالة تغيير كلمة المرور
CREATE OR REPLACE FUNCTION change_admin_password(
  p_admin_id UUID,
  p_old_password TEXT,
  p_new_password TEXT
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  admin_row admins%ROWTYPE;
BEGIN
  SELECT * INTO admin_row FROM admins WHERE id = p_admin_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'الحساب غير موجود');
  END IF;
  IF crypt(p_old_password, admin_row.password_hash) != admin_row.password_hash THEN
    RETURN json_build_object('success', false, 'error', 'كلمة المرور الحالية غير صحيحة');
  END IF;
  UPDATE admins SET password_hash = crypt(p_new_password, gen_salt('bf', 10)) WHERE id = p_admin_id;
  RETURN json_build_object('success', true);
END;
$$;

-- ⑥ دالة تحديث الإعدادات
CREATE OR REPLACE FUNCTION upsert_setting(p_key TEXT, p_value TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO settings (key, value, updated_at)
  VALUES (p_key, p_value, NOW())
  ON CONFLICT (key) DO UPDATE SET value = p_value, updated_at = NOW();
END;
$$;
