import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  _id: string; // Product ID
  name: string;
  slug: string;
  price: number;
  image: string;
  size: string;
  color?: string;
  qty: number;
  stock: number; // Max stock available for this specific size/color
}

interface CartStore {
  cartItems: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string, color?: string) => void;
  updateQuantity: (id: string, size: string, qty: number, color?: string) => void;
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
        const existingItem = cartItems.find(
          (x) => x._id === item._id && x.size === item.size && x.color === item.color
        );

        if (existingItem) {
          // Update quantity if item already exists
          set({
            cartItems: cartItems.map((x) =>
              x._id === item._id && x.size === item.size && x.color === item.color
                ? { ...x, qty: Math.min(x.stock, x.qty + item.qty) } // Don't exceed stock
                : x
            ),
          });
        } else {
          // Add new item
          set({ cartItems: [...cartItems, item] });
        }
      },
      
      removeItem: (id, size, color) => {
        set((state) => ({
          cartItems: state.cartItems.filter(
            (x) => !(x._id === id && x.size === size && x.color === color)
          ),
        }));
      },
      
      updateQuantity: (id, size, qty, color) => {
        set((state) => ({
          cartItems: state.cartItems.map((x) =>
            x._id === id && x.size === size && x.color === color
              ? { ...x, qty: Math.max(1, Math.min(x.stock, qty)) }
              : x
          ),
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
