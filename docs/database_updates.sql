-- Create a function to process sales returns atomically
CREATE OR REPLACE FUNCTION process_return(p_barcode text, p_reason text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item record;
  v_transaction_id uuid;
BEGIN
  -- Find the sold item
  SELECT * INTO v_item FROM items WHERE barcode = p_barcode AND status = 'Sold' FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'القطعة غير موجودة أو ليست في حالة مباع');
  END IF;

  -- Update item status back to In-Stock
  UPDATE items 
  SET status = 'In-Stock', customer_id = NULL, sold_date = NULL 
  WHERE barcode = p_barcode;

  -- Insert history record
  INSERT INTO item_history (item_barcode, action, details)
  VALUES (p_barcode, 'Returned', 'تم الإرجاع لسبب: ' || p_reason);

  -- Handle Customer Balance (if applicable)
  IF v_item.customer_id IS NOT NULL THEN
    UPDATE customers 
    SET balance = balance - v_item.selling_price 
    WHERE id = v_item.customer_id;
  END IF;

  RETURN json_build_object('success', true, 'message', 'تم الإرجاع بنجاح');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Create a function to get low stock count
CREATE OR REPLACE FUNCTION get_low_stock_count(p_threshold int DEFAULT 5)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM (
    SELECT product_id, COUNT(*) as stock_count
    FROM items
    WHERE status = 'In-Stock'
    GROUP BY product_id
    HAVING COUNT(*) < p_threshold
  ) AS low_stock_products;
  
  RETURN v_count;
END;
$$;

-- Create a function to get finance stats efficiently
CREATE OR REPLACE FUNCTION get_finance_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_revenue numeric;
  v_profit numeric;
  v_inventory_value numeric;
  v_customer_debt numeric;
  v_supplier_debt numeric;
BEGIN
  -- Revenue from transactions
  SELECT COALESCE(SUM(total), 0) INTO v_revenue FROM transactions WHERE type = 'Sale';
  
  -- Profit from sold items
  SELECT COALESCE(SUM(selling_price - cost_price), 0) INTO v_profit FROM items WHERE status = 'Sold';
  
  -- Inventory value
  SELECT COALESCE(SUM(cost_price), 0) INTO v_inventory_value FROM items WHERE status = 'In-Stock';
  
  -- Customer debt
  SELECT COALESCE(SUM(balance), 0) INTO v_customer_debt FROM customers;
  
  -- Supplier debt
  SELECT COALESCE(SUM(balance), 0) INTO v_supplier_debt FROM suppliers;
  
  RETURN json_build_object(
    'revenue', v_revenue,
    'profit', v_profit,
    'inventoryValue', v_inventory_value,
    'customerDebt', v_customer_debt,
    'supplierDebt', v_supplier_debt
  );
END;
$$;

-- Create a function to process customer debt payment
CREATE OR REPLACE FUNCTION pay_customer_debt(p_customer_id uuid, p_amount numeric, p_payment_method text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance numeric;
BEGIN
  -- Verify customer exists and lock row
  SELECT balance INTO v_current_balance FROM customers WHERE id = p_customer_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'العميل غير موجود');
  END IF;

  -- Update balance
  UPDATE customers 
  SET balance = balance - p_amount 
  WHERE id = p_customer_id;

  -- Insert transaction record
  INSERT INTO transactions (type, total, payment_method, customer_id, details)
  VALUES ('Income', p_amount, p_payment_method, p_customer_id, 'تسديد دفعة من مديونية العميل');

  RETURN json_build_object('success', true, 'message', 'تم تسديد الدفعة بنجاح', 'new_balance', v_current_balance - p_amount);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Create a function to process supplier debt payment
CREATE OR REPLACE FUNCTION pay_supplier_debt(p_supplier_id uuid, p_amount numeric, p_payment_method text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance numeric;
BEGIN
  -- Verify supplier exists and lock row
  SELECT balance INTO v_current_balance FROM suppliers WHERE id = p_supplier_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'المورد غير موجود');
  END IF;

  -- Update balance
  UPDATE suppliers 
  SET balance = balance - p_amount 
  WHERE id = p_supplier_id;

  -- Insert transaction record
  INSERT INTO transactions (type, total, payment_method, details)
  VALUES ('Expense', p_amount, p_payment_method, 'تسديد دفعة لمورد: ' || (SELECT name FROM suppliers WHERE id = p_supplier_id));

  RETURN json_build_object('success', true, 'message', 'تم تسديد الدفعة للمورد بنجاح', 'new_balance', v_current_balance - p_amount);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;