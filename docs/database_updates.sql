-- =============================================
-- RT PRO Database Security & Performance Fixes
-- Applied: 2026-03-28
-- =============================================

-- ▬▬▬ 1. DROPPED DUPLICATE FUNCTIONS ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
-- Removed old/duplicate versions that could cause wrong function calls
-- Migration: drop_duplicate_functions

DROP FUNCTION IF EXISTS public.get_finance_stats();
DROP FUNCTION IF EXISTS public.pay_customer_debt(uuid, numeric, character varying);
DROP FUNCTION IF EXISTS public.pay_supplier_debt(uuid, numeric, character varying);
DROP FUNCTION IF EXISTS public.record_supplier_payment(uuid, numeric, text);


-- ▬▬▬ 2. FIXED RLS OPEN SELECT POLICIES ▬▬▬▬▬▬▬▬▬▬▬▬
-- Changed items/products/profiles SELECT from `true` to `authenticated`
-- Migration: fix_rls_security_policies

-- items
DROP POLICY IF EXISTS "Everyone can select items" ON public.items;
CREATE POLICY "Everyone can select items" ON public.items
  FOR SELECT USING ((select auth.role()) = 'authenticated');

-- products
DROP POLICY IF EXISTS "Everyone can select products" ON public.products;
CREATE POLICY "Everyone can select products" ON public.products
  FOR SELECT USING ((select auth.role()) = 'authenticated');

-- profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING ((select auth.role()) = 'authenticated');


-- ▬▬▬ 3. FIXED search_path ON ALL FUNCTIONS ▬▬▬▬▬▬▬▬▬
-- Prevents search_path injection attacks
-- Migration: fix_function_search_path

ALTER FUNCTION public.process_return(text, text, text) SET search_path = '';
ALTER FUNCTION public.get_debt_summary() SET search_path = '';
ALTER FUNCTION public.process_sale(text[], numeric, text, uuid, numeric) SET search_path = '';
ALTER FUNCTION public.pay_customer_debt(uuid, numeric) SET search_path = '';
ALTER FUNCTION public.pay_supplier_debt(uuid, numeric, text) SET search_path = '';
ALTER FUNCTION public.get_inventory_stats() SET search_path = '';
ALTER FUNCTION public.get_finance_stats(timestamp with time zone) SET search_path = '';
ALTER FUNCTION public.get_low_stock_count(integer) SET search_path = '';
ALTER FUNCTION public.is_manager() SET search_path = '';
ALTER FUNCTION public.record_supplier_purchase(uuid, numeric, text) SET search_path = '';


-- ▬▬▬ 4. OPTIMIZED ALL RLS POLICIES (InitPlan) ▬▬▬▬▬▬
-- Changed auth.uid()/auth.role() → (select auth.uid())/(select auth.role())
-- This prevents re-evaluation per row, massive performance improvement
-- Migration: optimize_rls_initplan

-- See migration file for full details of all 30+ policies updated


-- ▬▬▬ 5. DROPPED DUPLICATE INDEXES ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
-- Migration: drop_duplicate_indexes

DROP INDEX IF EXISTS public.idx_item_history_barcode;
DROP INDEX IF EXISTS public.idx_transactions_cust;
DROP INDEX IF EXISTS public.idx_transactions_supp;


-- ▬▬▬ 6. ADDED MISSING FK INDEXES ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
-- Migration: add_missing_fk_indexes

CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_id ON public.activity_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_items_created_by ON public.items (created_by);
CREATE INDEX IF NOT EXISTS idx_items_sold_by ON public.items (sold_by);
CREATE INDEX IF NOT EXISTS idx_items_returned_by ON public.items (returned_by);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_barcode ON public.transaction_items (barcode);


-- ▬▬▬ 7. FIXED get_inventory_stats LOGIC ▬▬▬▬▬▬▬▬▬▬▬▬
-- Fixed low_stock_count subquery that was returning NULL
-- Migration: fix_get_inventory_stats

-- See migration file for full function replacement


-- =============================================
-- MANUAL STEPS (Dashboard):
-- 1. Enable Leaked Password Protection
--    https://supabase.com/docs/guides/auth/password-security
-- 2. Upgrade Postgres version
--    https://supabase.com/docs/guides/platform/upgrading
-- =============================================
