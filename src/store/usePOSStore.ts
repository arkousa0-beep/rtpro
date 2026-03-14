import { create } from 'zustand';
import { POSService } from '@/lib/pos-service';

interface CartItem {
  barcode: string;
  selling_price: number;
  products: {
    name: string;
  } | null;
}

interface POSState {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  total: number;
  selectedCustomerId: string | null;
  paymentMethod: string;

  addItem: (barcode: string) => Promise<{ success: boolean; message?: string }>;
  removeItem: (barcode: string) => void;
  setCustomerId: (id: string | null) => void;
  setPaymentMethod: (method: string) => void;
  checkout: () => Promise<{ success: boolean; message?: string }>;
  clearCart: () => void;
}

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  loading: false,
  error: null,
  total: 0,
  selectedCustomerId: 'walkin',
  paymentMethod: 'Cash',

  addItem: async (barcode: string) => {
    if (!barcode) return { success: false };
    set({ loading: true });

    try {
      const data = await POSService.fetchItemByBarcode(barcode);

      const { cart } = get();
      if (cart.find(i => i.barcode === data.barcode)) {
        set({ loading: false, error: 'هذه القطعة مضافة بالفعل في السلة' });
        return { success: false, message: 'هذه القطعة مضافة بالفعل في السلة' };
      }

      const newCart = [...cart, data as any];
      const newTotal = newCart.reduce((sum, item) => sum + Number(item.selling_price), 0);

      set({
        cart: newCart,
        total: newTotal,
        loading: false,
        error: null
      });

      return { success: true };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      return { success: false, message: err.message };
    }
  },

  removeItem: (barcode: string) => {
    const { cart } = get();
    const newCart = cart.filter(i => i.barcode !== barcode);
    const newTotal = newCart.reduce((sum, item) => sum + Number(item.selling_price), 0);
    set({ cart: newCart, total: newTotal });
  },

  setCustomerId: (id: string | null) => set({ selectedCustomerId: id || 'walkin' }),
  setPaymentMethod: (method: string) => set({ paymentMethod: method }),

  checkout: async () => {
    const { cart, total, selectedCustomerId, paymentMethod } = get();
    if (cart.length === 0) return { success: false, message: 'السلة فارغة' };

    set({ loading: true });

    try {
      await POSService.processSale(cart, total, paymentMethod, selectedCustomerId);

      set({ cart: [], total: 0, loading: false, error: null });
      return { success: true };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      return { success: false, message: err.message };
    }
  },

  clearCart: () => set({ cart: [], total: 0 }),
}));
