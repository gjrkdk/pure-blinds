/**
 * Zustand cart store with localStorage persistence and 7-day TTL
 */

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { CartItem, AddCartItemInput, AddSampleItemInput } from './types';
import { generateCartItemId, generateOptionsSignature, generateSampleCartItemId } from './utils';
import { getProduct } from '@/lib/product/catalog';

/**
 * Cart state shape
 */
interface CartState {
  items: CartItem[];

  /** Add item to cart (increments quantity if already exists) */
  addItem: (input: AddCartItemInput) => void;

  /** Add a color sample to cart (one per product, fixed price) */
  addSample: (input: AddSampleItemInput) => void;

  /** Check if a sample for this product is already in cart */
  hasSample: (productId: string) => boolean;

  /** Remove item from cart */
  removeItem: (itemId: string) => void;

  /** Update item quantity (min 1, max 999) — no-op for samples */
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
          const optionsSignature = generateOptionsSignature(input.options!);
          const id = generateCartItemId(input.productId, input.options!);

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

      addSample: (input) => {
        set((state) => {
          const id = generateSampleCartItemId(input.productId);

          // Deduplicate: one sample per product
          if (state.items.some((item) => item.id === id)) {
            return state;
          }

          const newItem: CartItem = {
            id,
            productId: input.productId,
            productName: input.productName,
            type: "sample",
            quantity: 1,
            priceInCents: 250,
          };
          return { items: [...state.items, newItem] };
        });
      },

      hasSample: (productId) => {
        const { items } = get();
        const id = generateSampleCartItemId(productId);
        return items.some((item) => item.id === id);
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
          items: state.items.map((item) => {
            // Samples are always quantity 1
            if (item.type === "sample") return item;
            return item.id === itemId ? { ...item, quantity } : item;
          }),
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
      version: 5,
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

        // Version 3 -> 4: Filter out items for deleted products (venetian-blinds, textiles)
        if (version < 4) {
          const state = persistedState as { items: CartItem[] };
          const validItems = state.items.filter((item) => {
            const product = getProduct(item.productId);
            return product !== undefined;
          });

          if (validItems.length !== state.items.length) {
            console.warn(
              `Cart migration v4: Removed ${state.items.length - validItems.length} items for deleted products`
            );
          }

          return { items: validItems };
        }

        // Version 4 -> 5: No-op migration for sample type support
        // Existing items without `type` are treated as "product"

        return persistedState as { items: CartItem[] };
      },
    }
  )
);
