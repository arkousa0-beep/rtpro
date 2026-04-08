import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { POSService } from '@/lib/pos-service';

export interface CartItem {
  barcode: string;
  selling_price: number;
  products: {
    name: string;
    image_url: string | null;
  } | null;
}

export interface ParkedCart {
  id: string;
  cart: CartItem[];
  total: number;
  customerId: string | null;
  timestamp: string;
}

interface POSState {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  total: number;
  selectedCustomerId: string | null;
  paymentMethod: string;
  paidAmount: number;
  discountType: 'amount' | 'percentage';
  discountValue: number;
  parkedCarts: ParkedCart[];

  addItem: (barcode: string) => Promise<{ success: boolean; message?: string }>;
  removeItem: (barcode: string) => void;
  setCustomerId: (id: string | null) => void;
  setPaymentMethod: (method: string) => void;
  setPaidAmount: (amount: number) => void;
  setDiscount: (type: 'amount' | 'percentage', value: number) => void;
  checkout: () => Promise<{ success: boolean; message?: string }>;
  clearCart: () => void;

  // New features
  parkCart: () => void;
  restoreCart: (id: string) => void;
  removeParkedCart: (id: string) => void;
}

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      cart: [],
      loading: false,
      error: null,
      total: 0,
      selectedCustomerId: 'walkin',
      paymentMethod: 'Cash',
      paidAmount: 0,
      discountType: 'amount',
      discountValue: 0,
      parkedCarts: [],

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

          const cartItem: CartItem = {
            barcode: data.barcode,
            selling_price: data.selling_price,
            products: Array.isArray(data.products)
              ? (data.products[0] ?? null)
              : (data.products as { name: string; image_url: string | null } | null)
          };

          const newCart = [...cart, cartItem];
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
      setPaymentMethod: (method: string) => {
        const { total } = get();
        set({ 
          paymentMethod: method,
          paidAmount: method === 'Credit' ? 0 : total 
        });
      },
      setPaidAmount: (amount: number) => set({ paidAmount: amount }),
      setDiscount: (type, value) => set({ discountType: type, discountValue: value }),

      checkout: async () => {
        const { cart, total, selectedCustomerId, paymentMethod, paidAmount, discountType, discountValue } = get();
        if (cart.length === 0) return { success: false, message: 'السلة فارغة' };

        if (paymentMethod === 'Credit' && (selectedCustomerId === 'walkin' || !selectedCustomerId)) {
          set({ loading: false, error: 'يجب اختيار عميل لعمليات البيع الآجل' });
          return { success: false, message: 'يجب اختيار عميل لعمليات البيع الآجل' };
        }

        set({ loading: true });

        try {
          let dAmount = 0, dPercentage = 0;
          if(discountType === 'amount') dAmount = discountValue;
          if(discountType === 'percentage') dPercentage = discountValue;

          await POSService.processSale(
            cart,
            total,
            paymentMethod === 'Credit' ? 'Debt' : paymentMethod,
            selectedCustomerId,
            paidAmount,
            dAmount,
            dPercentage
          );

          set({ cart: [], total: 0, discountType: 'amount', discountValue: 0, loading: false, error: null });
          return { success: true };
        } catch (err: any) {
          set({ loading: false, error: err.message });
          return { success: false, message: err.message };
        }
      },

      clearCart: () => set({ cart: [], total: 0 }),

      // Park current cart
      parkCart: () => {
        const { cart, total, selectedCustomerId, parkedCarts } = get();
        if (cart.length === 0) return;

        const newParkedCart: ParkedCart = {
          id: Date.now().toString(),
          cart: [...cart],
          total,
          customerId: selectedCustomerId,
          timestamp: new Date().toISOString(),
        };

        set({
          parkedCarts: [newParkedCart, ...parkedCarts],
          cart: [],
          total: 0,
          selectedCustomerId: 'walkin'
        });
      },

      // Restore a parked cart
      restoreCart: (id: string) => {
        const { parkedCarts, cart, total, selectedCustomerId } = get();
        const cartToRestore = parkedCarts.find(p => p.id === id);

        if (!cartToRestore) return;

        // If current cart is not empty, park it first!
        let updatedParkedCarts = parkedCarts.filter(p => p.id !== id);
        if (cart.length > 0) {
          const currentAsParked: ParkedCart = {
            id: Date.now().toString(),
            cart: [...cart],
            total,
            customerId: selectedCustomerId,
            timestamp: new Date().toISOString(),
          };
          updatedParkedCarts = [currentAsParked, ...updatedParkedCarts];
        }

        set({
          cart: cartToRestore.cart,
          total: cartToRestore.total,
          selectedCustomerId: cartToRestore.customerId,
          parkedCarts: updatedParkedCarts
        });
      },

      removeParkedCart: (id: string) => {
        const { parkedCarts } = get();
        set({ parkedCarts: parkedCarts.filter(p => p.id !== id) });
      }
    }),
    {
      name: 'pos-storage', // key in localStorage
      partialize: (state) => ({
        cart: state.cart,
        total: state.total,
        selectedCustomerId: state.selectedCustomerId,
        parkedCarts: state.parkedCarts
      }), // only persist these fields
    }
  )
);
