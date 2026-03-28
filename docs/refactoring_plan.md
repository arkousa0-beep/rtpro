# Codebase Duplication Refactoring Plan - RT PRO Smart Store

During the analysis of the project, a significant amount of duplicated logic and functions was identified, particularly around data fetching (Read) and state mutation (Create, Delete) operations. 

This plan outlines the strategy to DRY (Don't Repeat Yourself) the codebase, improve maintainability, and enforce a cleaner architecture using modern React patterns (Custom Hooks) and centralizing API calls.

## 1. Identified Duplications

### 1.1 Data Fetching (`fetchData`, `fetchCustomers`, `fetchSuppliers`, etc.)
- **Locations**:
  - `src/app/customers/page.tsx` (`fetchCustomers`)
  - `src/app/suppliers/page.tsx` (`fetchSuppliers`)
  - `src/app/products/page.tsx` (`fetchData`)
  - `src/app/inventory/page.tsx` (`fetchData`)
  - `src/app/inventory/add/page.tsx` (`fetchData` - fetches products, suppliers, and categories)
  - `src/app/more/page.tsx` (`fetchData` - fetches settings/categories)
- **Problem**: Every page manually manages `loading` state, sets up `useEffect`, makes direct `supabase` calls, and handles its own local state arrays (`const [data, setData] = useState([])`).

### 1.2 Form Submissions and CRUD Operations (`handleAdd`, `handleDelete`, `handleSubmit`)
- **Locations**:
  - `src/app/customers/page.tsx` (`handleAdd`, `handleDelete`)
  - `src/app/suppliers/page.tsx` (`handleAdd`, `handleDelete`)
  - `src/app/products/page.tsx` (`handleAdd`, `handleDelete`)
  - `src/app/inventory/add/page.tsx` (`handleSubmit`)
  - `src/app/more/page.tsx` (`handleAdd`, `handleDelete`)
- **Problem**: Repeated pattern of setting `submitting` state, making the `supabase.from().insert()` or `.delete()` call, handling errors via `toast`, resetting form state, and finally calling the local `fetchData()` again to refresh the list.

### 1.3 Statistical Fetching (`fetchStats`)
- **Locations**:
  - `src/app/page.tsx` (Dashboard stats)
  - `src/app/finance/page.tsx` (Finance stats)
- **Problem**: Logic for fetching aggregated numbers. Though somewhat mitigated by recent RPC moves, the UI still manually orchestrates the data retrieval lifecycle.

---

## 2. Refactoring Strategy

### Phase 1: Create a Centralized Data Service Layer
Instead of components calling `supabase.from(...)` directly, all queries should be moved into a dedicated service layer (e.g., `src/lib/services/`).

**Proposed Structure**:
- `src/lib/services/customerService.ts`
- `src/lib/services/supplierService.ts`
- `src/lib/services/productService.ts`
- `src/lib/services/inventoryService.ts`

**Example**:
```typescript
// src/lib/services/customerService.ts
import { supabase } from '@/lib/supabase';

export const customerService = {
  async getAll() {
    const { data, error } = await supabase.from('customers').select('*').order('name');
    if (error) throw error;
    return data;
  },
  async create(customer: { name: string, phone: string }) {
    const { data, error } = await supabase.from('customers').insert([customer]).select();
    if (error) throw error;
    return data;
  },
  async delete(id: string) {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  }
};
```

### Phase 2: Implement Custom React Hooks for State & Operations
Create custom hooks that wrap the service layer to manage `loading`, `error`, and `data` states. This abstracts the `useEffect` and `useState` boilerplate out of the UI components.

**Proposed Structure**:
- `src/hooks/useCustomers.ts`
- `src/hooks/useSuppliers.ts`
- `src/hooks/useProducts.ts`

**Example**:
```typescript
// src/hooks/useCustomers.ts
import { useState, useEffect } from 'react';
import { customerService } from '@/lib/services/customerService';
import { toast } from 'sonner';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const addCustomer = async (newCustomer) => {
    setSubmitting(true);
    try {
      await customerService.create(newCustomer);
      toast.success('تم الإضافة بنجاح');
      await fetchCustomers(); // Refresh list
      return true; // Indicate success to the form
    } catch (err: any) {
      toast.error(err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await customerService.delete(id);
      toast.success('تم الحذف بنجاح');
      await fetchCustomers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return { customers, loading, submitting, addCustomer, deleteCustomer, refresh: fetchCustomers };
}
```

### Phase 3: Update UI Components
Refactor the pages to consume the new hooks. This will drastically reduce the lines of code in files like `src/app/customers/page.tsx` and `src/app/products/page.tsx`.

**Before**:
- Component has ~150 lines of code, manages 5-6 state variables, and contains full API logic.

**After**:
```tsx
import { useCustomers } from '@/hooks/useCustomers';

export default function CustomersPage() {
  const { customers, loading, submitting, addCustomer, deleteCustomer } = useCustomers();
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    const success = await addCustomer(newCustomer);
    if (success) setNewCustomer({ name: '', phone: '' }); // Reset form
  };

  // ... render UI ...
}
```

### Phase 4: Introduce SWR or React Query (Optional but Recommended)
If the project scales further, implementing a caching library like `SWR` or `@tanstack/react-query` will automatically handle data fetching, caching, synchronization, and deduplication of requests across the app, eliminating the need to manually write standard fetching hooks.

---

## 3. Immediate Action Items
1. Create the `src/lib/services/` directory.
2. Create the `src/hooks/` directory.
3. Migrate the `Products`, `Customers`, and `Suppliers` domains to use the Service/Hook pattern.
4. Refactor `Inventory/add` to use a combined custom hook for fetching its dependencies (`useInventoryOptions` yielding products, categories, suppliers).