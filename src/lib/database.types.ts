export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── Permission Model ──────────────────────────────────────────────────────

export interface ProfilePermissions {
  pos: boolean
  inventory: boolean
  finance: boolean
  staff: boolean
  customers: boolean
  suppliers: boolean
  transactions: boolean
}

// ─── Core Entities ─────────────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: 'Manager' | 'Employee'
  permissions: ProfilePermissions
  created_at: string
}

export interface Customer {
  id: string
  name: string
  phone: string | null
  address: string | null
  balance: number
  deleted_at: string | null
  created_at: string
}

export interface Supplier {
  id: string
  name: string
  phone: string | null
  balance: number
  deleted_at: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  icon: string | null
  deleted_at: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  category_id: string | null
  /** Legacy plain-text category column – prefer category_id + join */
  category?: string | null
  image_url?: string | null
  description?: string | null
  deleted_at: string | null
  created_at: string
  categories?: Category
}

export type ItemStatus = 'In-Stock' | 'Sold' | 'Returned' | 'Exchanging' | 'Exchanged'

export interface Item {
  barcode: string
  product_id: string | null
  cost_price: number
  selling_price: number
  supplier_id: string | null
  customer_id: string | null
  status: ItemStatus
  sold_date: string | null
  return_date: string | null
  return_reason: string | null
  created_by: string | null
  sold_by: string | null
  returned_by: string | null
  created_at: string
  products?: Product
  customers?: Customer
}

export type TransactionType = 'Sale' | 'Return' | 'Exchange' | 'Payment' | 'SupplierPayment' | 'Expense' | 'Income'
export type PaymentMethod = 'Cash' | 'Debt' | 'Card' | 'Transfer'

export interface Transaction {
  id: string
  type: TransactionType
  total: number
  paid_amount: number
  method: PaymentMethod | null
  customer_id: string | null
  supplier_id: string | null
  created_at: string
  transaction_items?: TransactionItem[]
  customers?: Customer
  suppliers?: Supplier
}

export type ItemAction = 'Received' | 'Sold' | 'Returned' | 'Adjustment'

export interface ItemHistory {
  id: string
  item_barcode: string | null
  action: ItemAction | string
  details: string | null
  /** Links to the related transaction or entity UUID */
  target_id: string | null
  actor_id: string | null
  created_at: string
}

export interface TransactionItem {
  id: string
  transaction_id: string | null
  barcode: string | null
  product_id: string | null
  price: number
  created_at: string
  products?: Product
}

// ─── Logging & Notifications ────────────────────────────────────────────────

export type ActivityAction =
  | 'CREATE_PRODUCT'
  | 'UPDATE_PRODUCT'
  | 'DELETE_PRODUCT'
  | 'CREATE_ITEM'
  | 'UPDATE_ITEM'
  | 'DELETE_ITEM'
  | 'SELL_ITEM'
  | 'RETURN_ITEM'
  | 'CREATE_CUSTOMER'
  | 'UPDATE_CUSTOMER'
  | 'DELETE_CUSTOMER'
  | 'CREATE_SUPPLIER'
  | 'UPDATE_SUPPLIER'
  | 'DELETE_SUPPLIER'
  | 'SUPPLIER_PAYMENT'
  | 'CREATE_CATEGORY'
  | 'UPDATE_CATEGORY'
  | 'DELETE_CATEGORY'
  | 'CREATE_TRANSACTION'

export interface ActivityLog {
  id: string
  actor_id: string | null
  action: ActivityAction | string
  entity_type: string
  entity_id: string | null
  details: Json | null
  created_at: string
  profiles?: Pick<Profile, 'full_name' | 'role'>
}

export type NotificationType = 'info' | 'warning' | 'success' | 'error'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  link?: string | null
  read: boolean
  created_at: string
}

// ─── Database Schema ────────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'permissions'> & {
          created_at?: string
          permissions?: ProfilePermissions | Json
        }
        Update: Partial<Omit<Profile, 'permissions'> & { permissions?: ProfilePermissions | Json }>
      }
      customers: {
        Row: Customer
        Insert: Omit<Customer, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Customer>
      }
      suppliers: {
        Row: Supplier
        Insert: Omit<Supplier, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Supplier>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Category>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'categories'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Product, 'categories'>>
      }
      items: {
        Row: Item
        Insert: Omit<Item, 'created_at'> & { created_at?: string }
        Update: Partial<Item>
      }
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, 'id' | 'created_at' | 'paid_amount' | 'transaction_items' | 'customers' | 'suppliers'> & {
          id?: string
          created_at?: string
          paid_amount?: number
        }
        Update: Partial<Omit<Transaction, 'transaction_items' | 'customers' | 'suppliers'>>
      }
      item_history: {
        Row: ItemHistory
        Insert: Omit<ItemHistory, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<ItemHistory>
      }
      transaction_items: {
        Row: TransactionItem
        Insert: Omit<TransactionItem, 'id' | 'created_at' | 'products'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<TransactionItem, 'products'>>
      }
      activity_logs: {
        Row: ActivityLog
        Insert: Omit<ActivityLog, 'id' | 'created_at' | 'profiles'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<ActivityLog, 'profiles'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Notification>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_debt_summary: {
        Args: Record<string, never>
        Returns: Array<{
          total_customer_debt: number
          customer_debtors_count: number
          total_deferred_sales: number
        }>
      }
      get_inventory_stats: {
        Args: Record<string, never>
        Returns: Array<{
          total_items: number
          low_stock_count: number
          total_cost_value: number
          total_selling_value: number
        }>
      }
      get_finance_stats: {
        Args: {
          p_since?: string
        }
        Returns: {
          revenue: number
          profit: number
          inventoryValue: number
          customerDebt: number
          supplierDebt: number
          actualCash: number
        }
      }
      process_sale: {
        Args: {
          p_items_list: string[]
          p_total_amount: number
          p_payment_method: string
          p_customer_id: string | null
          p_paid_amount: number
        }
        Returns: { success: boolean; message?: string; transaction_id?: string }
      }
      pay_supplier_debt: {
        Args: {
          p_supplier_id: string
          p_amount: number
          p_payment_method: string
        }
        Returns: { success: boolean; message?: string; transaction_id?: string }
      }
      pay_customer_debt: {
        Args: {
          p_customer_id: string
          p_amount: number
        }
        Returns: { success: boolean; message?: string; transaction_id?: string }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
