export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  balance?: number;
  created_at?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  balance?: number;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  category_id?: string | null;
  categories?: { name: string };
  created_at?: string;
}

export interface Item {
  barcode: string;
  product_id: string;
  cost_price: number;
  selling_price: number;
  supplier_id?: string | null;
  customer_id?: string | null;
  status: 'In-Stock' | 'Sold' | 'Returned';
  sold_date?: string | null;
  created_at?: string;
  products?: Product;
}

export interface Transaction {
  id: string;
  type: 'Sale' | 'Return' | 'Expense' | 'Income';
  total: number;
  payment_method: string;
  customer_id?: string | null;
  created_at: string;
}
