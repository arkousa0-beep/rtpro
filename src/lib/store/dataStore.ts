import { create } from 'zustand';
import { Product, Customer, Supplier, Category, Transaction, Item } from '@/lib/database.types';

interface DataState {
  // Entities
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  categories: Category[];
  transactions: Transaction[];
  items: Item[];
  
  // Hydration status (to avoid first-time loading flickers after first load)
  isHydrated: {
    products: boolean;
    customers: boolean;
    suppliers: boolean;
    categories: boolean;
    transactions: boolean;
    items: boolean;
  };

  // Actions
  setProducts: (products: Product[]) => void;
  setCustomers: (customers: Customer[]) => void;
  setSuppliers: (suppliers: Supplier[]) => void;
  setCategories: (categories: Category[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setItems: (items: Item[]) => void;
  
  // Instant Updates
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  removeProduct: (id: string) => void;

  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addCustomer: (customer: Customer) => void;
  removeCustomer: (id: string) => void;

  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  addSupplier: (supplier: Supplier) => void;
  removeSupplier: (id: string) => void;

  updateCategory: (id: string, updates: Partial<Category>) => void;
  addCategory: (category: Category) => void;
  removeCategory: (id: string) => void;

  // Global Reset
  clearAll: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  products: [],
  customers: [],
  suppliers: [],
  categories: [],
  transactions: [],
  items: [],
  isHydrated: {
    products: false,
    customers: false,
    suppliers: false,
    categories: false,
    transactions: false,
    items: false,
  },

  setProducts: (products) => set((state) => ({ 
    products, 
    isHydrated: { ...state.isHydrated, products: true } 
  })),
  setCustomers: (customers) => set((state) => ({ 
    customers, 
    isHydrated: { ...state.isHydrated, customers: true } 
  })),
  setSuppliers: (suppliers) => set((state) => ({ 
    suppliers, 
    isHydrated: { ...state.isHydrated, suppliers: true } 
  })),
  setCategories: (categories) => set((state) => ({ 
    categories, 
    isHydrated: { ...state.isHydrated, categories: true } 
  })),
  setTransactions: (transactions) => set((state) => ({ 
    transactions, 
    isHydrated: { ...state.isHydrated, transactions: true } 
  })),
  setItems: (items) => set((state) => ({ 
    items, 
    isHydrated: { ...state.isHydrated, items: true } 
  })),

  // Instant Product Updates
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  addProduct: (product) => set((state) => ({
    products: [product, ...state.products]
  })),
  removeProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id)
  })),

  // Instant Customer Updates
  updateCustomer: (id, updates) => set((state) => ({
    customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  addCustomer: (customer) => set((state) => ({
    customers: [customer, ...state.customers]
  })),
  removeCustomer: (id) => set((state) => ({
    customers: state.customers.filter(c => c.id !== id)
  })),

  // Instant Supplier Updates
  updateSupplier: (id, updates) => set((state) => ({
    suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  addSupplier: (supplier) => set((state) => ({
    suppliers: [supplier, ...state.suppliers]
  })),
  removeSupplier: (id) => set((state) => ({
    suppliers: state.suppliers.filter(s => s.id !== id)
  })),

  // Instant Category Updates
  updateCategory: (id, updates) => set((state) => ({
    categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  addCategory: (category) => set((state) => ({
    categories: [category, ...state.categories]
  })),
  removeCategory: (id) => set((state) => ({
    categories: state.categories.filter(c => c.id !== id)
  })),
  
  // Instant Item Updates
  updateItem: (barcode: string, updates: Partial<Item>) => set((state: DataState) => ({
    items: state.items.map(i => i.barcode === barcode ? { ...i, ...updates } : i)
  })),
  addItem: (item: Item) => set((state: DataState) => ({
    items: [item, ...state.items]
  })),
  removeItem: (barcode: string) => set((state: DataState) => ({
    items: state.items.filter(i => i.barcode !== barcode)
  })),

  clearAll: () => set({
    products: [],
    customers: [],
    suppliers: [],
    categories: [],
    transactions: [],
    isHydrated: {
      products: false,
      customers: false,
      suppliers: false,
      categories: false,
      transactions: false,
      items: false,
    }
  })
}));
