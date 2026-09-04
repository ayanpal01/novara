import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  _id: string; // Product ID
  name: string;
  slug: string;
  price: number;
  image: string;
  size?: string; // Legacy
  color?: string; // Legacy
  variant?: {
    _id: string;
    sku?: string;
    attributes: Record<string, string>;
  };
  qty: number;
  stock: number; // Max stock available for this specific size/color
}

interface CartStore {
  cartItems: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variantId?: string, size?: string, color?: string) => void;
  updateQuantity: (id: string, qty: number, variantId?: string, size?: string, color?: string) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isOpen: false,
      
      addItem: (item) => {
        const { cartItems } = get();
        const existingItem = cartItems.find((x) => {
          if (item.variant && x.variant) return x._id === item._id && x.variant._id === item.variant._id;
          return x._id === item._id && x.size === item.size && x.color === item.color;
        });

        if (existingItem) {
          // Update quantity if item already exists
          set({
            cartItems: cartItems.map((x) => {
              const isMatch = item.variant && x.variant 
                ? x._id === item._id && x.variant._id === item.variant._id
                : x._id === item._id && x.size === item.size && x.color === item.color;
              
              return isMatch
                ? { ...x, qty: Math.min(x.stock, x.qty + item.qty) } // Don't exceed stock
                : x;
            }),
          });
        } else {
          // Add new item
          set({ cartItems: [...cartItems, item] });
        }
      },
      
      removeItem: (id, variantId, size, color) => {
        set((state) => ({
          cartItems: state.cartItems.filter((x) => {
            if (variantId && x.variant) return !(x._id === id && x.variant._id === variantId);
            return !(x._id === id && x.size === size && x.color === color);
          }),
        }));
      },
      
      updateQuantity: (id, qty, variantId, size, color) => {
        set((state) => ({
          cartItems: state.cartItems.map((x) => {
            const isMatch = variantId && x.variant 
              ? x._id === id && x.variant._id === variantId
              : x._id === id && x.size === size && x.color === color;
              
            return isMatch
              ? { ...x, qty: Math.max(1, Math.min(x.stock, qty)) }
              : x;
          }),
        }));
      },
      
      clearCart: () => set({ cartItems: [] }),
      
      setIsOpen: (isOpen) => set({ isOpen }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'novara-cart-storage',
      // Only persist cartItems, not the isOpen state
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
);

// Helper selectors
export const useCartTotal = () => {
  return useCartStore((state) => 
    state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );
};

export const useCartCount = () => {
  return useCartStore((state) => 
    state.cartItems.reduce((acc, item) => acc + item.qty, 0)
  );
};
