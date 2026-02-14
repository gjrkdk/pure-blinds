/**
 * Zustand cart store with localStorage persistence and 7-day TTL
 */

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { CartItem, AddCartItemInput } from './types';
import { generateCartItemId, generateOptionsSignature } from './utils';

/**
 * Cart state shape
 */
interface CartState {
  items: CartItem[];

  /** Add item to cart (increments quantity if already exists) */
  addItem: (input: AddCartItemInput) => void;

  /** Remove item from cart */
  removeItem: (itemId: string) => void;

  /** Update item quantity (min 1, max 999) */
  updateQuantity: (itemId: string, quantity: number) => void;

  /** Clear all items from cart */
  clearCart: () => void;

  /** Get total price of all items in cart */
  getTotalPrice: () => number;

  /** Get total count of all items (sum of quantities) */
  getItemCount: () => number;
}

/**
 * Custom storage wrapper with 7-day TTL
 * Stores state with timestamp, expires after 7 days
 */
const TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const storageWithTTL: StateStorage = {
  getItem: (name: string): string | null => {
    const item = localStorage.getItem(name);
    if (!item) return null;

    try {
      const { state, timestamp } = JSON.parse(item);
      const now = Date.now();

      // Check if expired (lazy cleanup)
      if (now - timestamp > TTL) {
        localStorage.removeItem(name);
        return null;
      }

      return JSON.stringify(state);
    } catch {
      // Invalid format - remove and return null
      localStorage.removeItem(name);
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    const item = {
      state: JSON.parse(value),
      timestamp: Date.now(),
    };
    localStorage.setItem(name, JSON.stringify(item));
  },

  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

/**
 * Zustand cart store
 * Persists to localStorage with 7-day expiration
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (input) => {
        set((state) => {
          const optionsSignature = generateOptionsSignature(input.options);
          const id = generateCartItemId(input.productId, input.options);

          // Check if item already exists
          const existingItemIndex = state.items.findIndex((item) => item.id === id);

          if (existingItemIndex !== -1) {
            // Increment quantity of existing item
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + 1,
            };
            return { items: updatedItems };
          } else {
            // Add new item with quantity 1
            const newItem: CartItem = {
              ...input,
              id,
              optionsSignature,
              quantity: 1,
            };
            return { items: [...state.items, newItem] };
          }
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        // Enforce min 1, max 999
        if (quantity < 1 || quantity > 999) return;

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.priceInCents * item.quantity, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      version: 3,
      storage: createJSONStorage(() => storageWithTTL),
      // Only persist the items array, not derived values
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState, version) => {
        // Version 0 or 1 = old format (no productId in cart ID, or hash-based IDs)
        // Version 2 = old product IDs (rollerblinds-white, etc.)
        // Clear cart and start fresh for old versions
        if (version < 3) {
          console.warn('Cart format changed (v3: new product IDs) - clearing old items');
          return { items: [] };
        }
        return persistedState as { items: CartItem[] };
      },
    }
  )
);
