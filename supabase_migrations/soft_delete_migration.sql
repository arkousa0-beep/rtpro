-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  RT PRO — Soft Delete Migration                                ║
-- ║  يجب تنفيذ هذا الملف في Supabase SQL Editor                   ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ─── 1. إضافة عمود deleted_at لكل الجداول الأساسية ─────────────

ALTER TABLE products   ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE customers  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE suppliers  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- ─── 2. إنشاء Indexes لأداء أسرع عند الفلترة ──────────────────

CREATE INDEX IF NOT EXISTS idx_products_active   ON products   (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_active   ON customers  (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_suppliers_active   ON suppliers  (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_active  ON categories (deleted_at) WHERE deleted_at IS NULL;

-- ─── 3. Unique constraint مع مراعاة Soft Delete ─────────────────
-- هذا يسمح بإضافة منتج بنفس الاسم فقط إذا كان القديم محذوف

CREATE UNIQUE INDEX IF NOT EXISTS uq_products_name_active
  ON products (name) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_name_phone_active
  ON customers (name, phone) WHERE deleted_at IS NULL;

-- ─── 4. إضافة p_payment_method لدالة pay_customer_debt ──────────
-- (إذا كانت الدالة لا تقبلها حالياً)

-- ملاحظة: شغّل هذا فقط إذا الدالة الحالية لا تحتوي على p_payment_method
-- يمكنك التحقق أولاً عبر: SELECT proname, pronargs FROM pg_proc WHERE proname = 'pay_customer_debt';

-- CREATE OR REPLACE FUNCTION pay_customer_debt(
--   p_customer_id uuid,
--   p_amount numeric,
--   p_payment_method text DEFAULT 'Cash'
-- ) ... (يعتمد على تعريف الدالة الحالي)

-- ─── تم! ────────────────────────────────────────────────────────
