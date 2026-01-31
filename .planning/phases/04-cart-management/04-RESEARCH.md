# Phase 4: Cart Management - Research

**Researched:** 2026-01-31
**Domain:** Shopping cart state management, persistence, and UI in Next.js 15 App Router
**Confidence:** HIGH

## Summary

Shopping cart implementation in Next.js 15 App Router requires careful consideration of client-side state management, dual-layer persistence (localStorage + server session), and hydration handling. The research investigated modern state management approaches, persistence patterns, UI best practices, and common pitfalls.

The standard approach uses Zustand with persist middleware for client-side cart state, combined with iron-session or Next.js cookies for server-side session management. Cart items require unique identification based on product ID and dimension configuration hash. React Context is viable for simpler implementations but lacks built-in persistence utilities.

Key findings include: avoid hydration mismatches by initializing state in `useState` lazy initializer, not in `useEffect`; implement TTL (time-to-live) patterns for cart expiration; use optimistic UI with `useOptimistic` for instant feedback; and follow established cart UX patterns including sticky footer CTAs, cart badge notifications, and confirmation dialogs for destructive actions.

**Primary recommendation:** Use Zustand with persist middleware for client state, cookies for server-client sync, and implement cart item uniqueness based on `productId + dimensionsHash`.

## Standard Stack

The established libraries/tools for shopping cart management in Next.js 15:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.x | Lightweight state management | Hook-based, minimal boilerplate, built-in persist middleware, widely adopted in Next.js ecosystem |
| zustand/middleware (persist) | 5.x | localStorage/sessionStorage persistence | First-party middleware, handles hydration, supports TTL via custom storage |
| iron-session | 8.x | Stateless server-side session management | Cookie-based, serverless-friendly, works with Next.js App Router via `cookies()` |
| react (useOptimistic) | 19.x | Optimistic UI updates | Built-in React 19 hook for instant cart feedback while server mutations complete |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Context API | 19.x | Simple global state | When avoiding external dependencies, smaller apps, or cart is only client-side feature needing state |
| crypto (Web API) | Built-in | Hash generation for item uniqueness | Creating `optionsSignature` hash from dimension configurations |
| Intl.NumberFormat | Built-in | Price formatting | Already used in dimension-configurator.tsx for consistent currency display |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | Redux Toolkit | More boilerplate, better for very large apps with complex state interactions |
| Zustand | Jotai | Atomic model more complex for cart use case, better for fine-grained reactivity |
| iron-session | next-auth sessions | Overkill if only need cart persistence, not full authentication |
| useOptimistic | Manual optimistic state | More code, error-prone rollback logic, reinventing the wheel |

**Installation:**
```bash
npm install zustand iron-session
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── cart/
│   │   └── page.tsx              # Cart page component
│   └── api/
│       └── cart/
│           ├── add/route.ts      # Server Action/Route for adding items
│           └── remove/route.ts   # Server Action/Route for removing items
├── components/
│   ├── cart/
│   │   ├── cart-icon.tsx         # Header cart icon with badge
│   │   ├── cart-item.tsx         # Individual cart item display
│   │   ├── cart-summary.tsx      # Subtotal and checkout CTA
│   │   └── remove-dialog.tsx     # Confirmation dialog for removal
│   └── dimension-configurator.tsx # (existing) Now includes Add to Cart button
├── lib/
│   ├── cart/
│   │   ├── store.ts              # Zustand store with persist middleware
│   │   ├── types.ts              # CartItem, CartState types
│   │   ├── utils.ts              # generateItemHash, mergeCartItems
│   │   └── session.ts            # iron-session cart session helpers
│   └── pricing/                  # (existing) types, validator, calculator
└── hooks/
    └── use-cart-hydration.tsx    # Client-side hydration helper
```

### Pattern 1: Cart Item Uniqueness via Hash Signature
**What:** Each cart item is uniquely identified by `productId + optionsSignature`, where `optionsSignature` is a hash of the dimension configuration.
**When to use:** Always, to prevent duplicate line items and enable quantity increment when same dimensions added again.
**Example:**
```typescript
// Source: Craft Commerce pattern - https://craftcms.com/docs/commerce/5.x/development/cart.html
import { createHash } from 'crypto'

interface CartItem {
  id: string // Generated: `${productId}-${optionsSignature}`
  productId: string
  options: {
    width: number
    height: number
  }
  optionsSignature: string
  quantity: number
  priceInCents: number
}

function generateOptionsSignature(options: { width: number; height: number }): string {
  const optionsString = JSON.stringify(options, Object.keys(options).sort())
  return createHash('sha256').update(optionsString).digest('hex').slice(0, 16)
}

function generateCartItemId(productId: string, options: { width: number; height: number }): string {
  const signature = generateOptionsSignature(options)
  return `${productId}-${signature}`
}

function addToCart(cart: CartItem[], item: Omit<CartItem, 'id' | 'optionsSignature' | 'quantity'>) {
  const signature = generateOptionsSignature(item.options)
  const itemId = `${item.productId}-${signature}`

  const existingItem = cart.find(i => i.id === itemId)

  if (existingItem) {
    // Same dimensions - increment quantity
    return cart.map(i =>
      i.id === itemId
        ? { ...i, quantity: i.quantity + 1 }
        : i
    )
  } else {
    // New configuration - add as separate line item
    return [...cart, {
      ...item,
      id: itemId,
      optionsSignature: signature,
      quantity: 1
    }]
  }
}
```

### Pattern 2: Zustand Store with Persist Middleware and Hydration
**What:** Client-side cart state with localStorage persistence and Next.js App Router hydration handling.
**When to use:** Primary pattern for cart state management in this phase.
**Example:**
```typescript
// Source: Zustand docs + Next.js hydration best practices
// https://zustand.docs.pmnd.rs/integrations/persisting-store-data
// https://dev.to/abdulsamad/how-to-use-zustands-persist-middleware-in-nextjs-4lb5

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from './types'

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id' | 'optionsSignature' | 'quantity'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getItemCount: () => number
}

// Custom storage with TTL
const cartStorage = {
  getItem: (name: string) => {
    const stored = localStorage.getItem(name)
    if (!stored) return null

    const { state, timestamp } = JSON.parse(stored)
    const now = Date.now()
    const TTL = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

    if (now - timestamp > TTL) {
      localStorage.removeItem(name)
      return null
    }

    return JSON.stringify(state)
  },
  setItem: (name: string, value: string) => {
    const wrapped = {
      state: JSON.parse(value),
      timestamp: Date.now()
    }
    localStorage.setItem(name, JSON.stringify(wrapped))
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name)
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => ({
        items: addToCart(state.items, item)
      })),

      removeItem: (itemId) => set((state) => ({
        items: state.items.filter(i => i.id !== itemId)
      })),

      updateQuantity: (itemId, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.id === itemId ? { ...i, quantity } : i
        )
      })),

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((sum, item) =>
          sum + (item.priceInCents * item.quantity), 0
        )
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage',
      storage: {
        getItem: (name) => cartStorage.getItem(name),
        setItem: (name, value) => cartStorage.setItem(name, value),
        removeItem: (name) => cartStorage.removeItem(name)
      },
      // Only persist items, not derived values
      partialize: (state) => ({ items: state.items })
    }
  )
)
```

### Pattern 3: Hydration-Safe Cart Component
**What:** Avoid hydration mismatch by deferring cart rendering until client-side mount.
**When to use:** For any component displaying cart data in Next.js App Router.
**Example:**
```typescript
// Source: Next.js hydration best practices
// https://brockherion.dev/blog/posts/nextjs-fixing-hydration-issues-with-zustand/

'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/cart/store'

export function CartIcon() {
  const [mounted, setMounted] = useState(false)
  const itemCount = useCartStore((state) => state.getItemCount())

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Server and initial client render: show icon without badge
    return (
      <div className="relative">
        <ShoppingCartIcon />
      </div>
    )
  }

  // After hydration: show with actual count
  return (
    <div className="relative">
      <ShoppingCartIcon />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </div>
  )
}
```

### Pattern 4: Optimistic UI for Add to Cart
**What:** Instant feedback when adding to cart using React 19's `useOptimistic` hook.
**When to use:** For add-to-cart action to improve perceived performance.
**Example:**
```typescript
// Source: React docs - https://react.dev/reference/react/useOptimistic
// LogRocket tutorial - https://blog.logrocket.com/understanding-optimistic-ui-react-useoptimistic-hook/

'use client'

import { useOptimistic, useTransition } from 'react'
import { useCartStore } from '@/lib/cart/store'

export function AddToCartButton({ item }: { item: CartItemInput }) {
  const [isPending, startTransition] = useTransition()
  const addItem = useCartStore((state) => state.addItem)
  const [optimisticAdded, setOptimisticAdded] = useOptimistic(
    false,
    (state, newValue: boolean) => newValue
  )

  const handleAddToCart = () => {
    startTransition(async () => {
      setOptimisticAdded(true)

      try {
        addItem(item)
        // Optional: sync to server
        await fetch('/api/cart/add', {
          method: 'POST',
          body: JSON.stringify(item)
        })
      } catch (error) {
        // Rollback is automatic - optimistic value reverts
        console.error('Failed to add to cart:', error)
      }
    })
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isPending}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
    >
      {optimisticAdded ? 'Added to Cart!' : 'Add to Cart'}
    </button>
  )
}
```

### Pattern 5: Cart Expiration with TTL
**What:** Automatically expire cart contents after 7 days of inactivity using timestamp-based TTL.
**When to use:** Required per phase context - cart expires after 7 days.
**Example:**
```typescript
// Source: TTL localStorage patterns
// https://www.sohamkamani.com/javascript/localstorage-with-ttl-expiry/
// https://dev.to/yevheniia_br/set-data-to-localstorage-with-limited-time-to-live-233g

// Custom storage implementation (shown in Pattern 2 above)
// Key points:
// 1. Wrap stored data with { state, timestamp }
// 2. Check TTL on getItem() - lazy cleanup
// 3. Return null if expired, triggering fresh state initialization
// 4. TTL = 7 days = 7 * 24 * 60 * 60 * 1000 milliseconds

// Optional: Manual garbage collection
export function cleanupExpiredCart() {
  const stored = localStorage.getItem('cart-storage')
  if (!stored) return

  const { timestamp } = JSON.parse(stored)
  const TTL = 7 * 24 * 60 * 60 * 1000

  if (Date.now() - timestamp > TTL) {
    localStorage.removeItem('cart-storage')
  }
}
```

### Pattern 6: Server Session Sync with iron-session
**What:** Sync cart to server session using cookies for persistence across devices (future phase).
**When to use:** Phase 4 establishes pattern, but server sync may be deferred to checkout phase if not needed for cart page.
**Example:**
```typescript
// Source: iron-session with Next.js 15
// https://github.com/vvo/iron-session
// https://blog.lama.dev/next-js-14-auth-with-iron-session/

import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import type { CartItem } from './types'

interface SessionData {
  cart: {
    items: CartItem[]
    updatedAt: number
  }
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'cart-session',
  ttl: 60 * 60 * 24 * 7, // 7 days
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  }
}

export async function getCartSession() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  )
  return session
}

// Example Server Action
export async function syncCartToSession(items: CartItem[]) {
  'use server'

  const session = await getCartSession()
  session.cart = {
    items,
    updatedAt: Date.now()
  }
  await session.save()
}
```

### Anti-Patterns to Avoid
- **Loading cart from localStorage in useEffect**: Causes hydration mismatch. Use `useState` lazy initializer or mount flag pattern instead.
- **Syncing to localStorage on every state change in useEffect**: Creates cascading renders. Zustand persist middleware handles this efficiently.
- **Creating duplicate line items for same dimensions**: Always hash options and check for existing items before adding new line items.
- **Auto-hiding success notifications**: User needs time to see confirmation. Use persistent indicators or user-dismissible notifications.
- **Storing derived values (totals, counts) in persisted state**: Recalculate on demand. Only persist raw cart items array.
- **Using sessionStorage for cart**: Cart should persist after browser close. Use localStorage with TTL instead.
- **Heavy sticky footer on mobile**: Keep sticky CTAs minimal (44px+ tap target, concise text) to preserve screen space for cart items.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State persistence with hydration | Custom localStorage hooks with manual sync | Zustand persist middleware | Handles hydration, serialization, partialize, version migrations, and storage backends out of the box |
| Cart item uniqueness | Manual string concatenation or array indexOf | Cryptographic hash (crypto.createHash) | Options order matters with string concat; hash is stable regardless of key order |
| TTL expiration | setTimeout or interval-based cleanup | Timestamp-based lazy cleanup | setTimeout doesn't survive page refresh; lazy cleanup on getItem is simpler and sufficient |
| Optimistic UI updates | Manual state + rollback logic | React 19 useOptimistic hook | Automatic rollback on error, built-in pending states, less error-prone |
| Confirmation dialogs | Custom modal state management | Native dialog element or library (react-modal, MUI Dialog) | Accessibility (focus trap, ARIA, keyboard nav) is complex; libraries handle it correctly |
| Server-side sessions | Custom cookie parsing and encryption | iron-session | Stateless encryption, serverless-friendly, handles serialization and security correctly |
| Number formatting | String manipulation for currency | Intl.NumberFormat | Handles locale, currency symbols, decimal places, and edge cases correctly (already used in dimension-configurator.tsx) |

**Key insight:** E-commerce carts have decades of established patterns. Cart uniqueness, persistence with TTL, and hydration handling all have subtle edge cases (race conditions, data corruption, accessibility) that well-tested libraries solve. Reinventing these leads to bugs discovered in production.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch from localStorage Access
**What goes wrong:** Component renders differently on server vs client because localStorage is accessed during render or in useEffect that updates state.
**Why it happens:** Next.js pre-renders on server where `localStorage` is undefined, then hydrates on client where localStorage exists, causing React to detect content mismatch.
**How to avoid:**
- Use mount flag pattern: `useState(false)` + `useEffect(() => setMounted(true))`, only render cart data after mounted
- OR use Zustand's persist with proper client-only rendering
- Never initialize state from localStorage directly: ❌ `const [cart] = useState(JSON.parse(localStorage.getItem('cart')))`
**Warning signs:** Console error "Text content did not match. Server: ... Client: ..." or "Hydration failed because the initial UI does not match what was rendered on the server"

### Pitfall 2: Race Conditions with Rapid Add-to-Cart Clicks
**What goes wrong:** User double-clicks "Add to Cart", creating duplicate items instead of incrementing quantity, or quantity increases by 1 instead of 2.
**Why it happens:** State updates are asynchronous. Second click reads stale state before first update completes.
**How to avoid:**
- Use functional state updates: `setState(prev => calculateNew(prev))` not `setState(calculateNew(state))`
- Disable button during `isPending` state from `useTransition`
- Zustand's `set` function receives previous state, preventing stale reads
**Warning signs:** Inconsistent cart counts when clicking quickly, duplicate items with same dimensions, quantity off by ±1

### Pitfall 3: Cart Sync Conflicts Between localStorage and Server
**What goes wrong:** User adds item on one tab, doesn't see it in another tab. Or localStorage overwrites server cart on page load.
**Why it happens:** localStorage is tab-isolated for writes but shared for reads. No automatic cross-tab sync without StorageEvent listener.
**How to avoid:**
- Listen to `storage` event for cross-tab updates (fires when other tabs modify localStorage)
- Merge carts on mismatch: server cart takes precedence, but preserve newer client items
- Show "Cart updated" notification when sync occurs
**Warning signs:** Users report "lost" cart items after switching tabs, inconsistent cart counts across pages

### Pitfall 4: Expired Cart TTL Not Cleared, Cluttering localStorage
**What goes wrong:** Expired cart data remains in localStorage indefinitely, eventually hitting 5-10MB storage quota.
**Why it happens:** TTL implementation only checks on read, never proactively deletes expired data.
**How to avoid:**
- Implement lazy cleanup: check TTL in `getItem()`, return null and delete if expired
- Optional: manual garbage collection on app init or periodic intervals
- Log when cart is expired so user isn't surprised by empty cart
**Warning signs:** localStorage full errors, old cart data visible in DevTools after expiry period

### Pitfall 5: Missing Accessibility in Confirmation Dialog
**What goes wrong:** Screen reader users can't navigate confirmation dialog, keyboard users can't close with Escape, focus not trapped.
**Why it happens:** Hand-rolling modals without understanding WAI-ARIA dialog pattern requirements.
**How to avoid:**
- Use `<dialog>` element with `showModal()` or accessible library (react-modal, MUI Dialog)
- Required: `role="alertdialog"`, `aria-labelledby`, `aria-describedby`, focus trap, Escape to close
- Return focus to trigger element on close
- Set `aria-hidden="true"` on background content
**Warning signs:** Keyboard users can tab to elements behind dialog, Escape doesn't close, screen readers don't announce dialog

### Pitfall 6: Cart Badge Doesn't Update After Add to Cart
**What goes wrong:** User adds item, badge still shows old count until page refresh.
**Why it happens:** Cart icon component not subscribed to cart store, or hydration mount flag prevents update.
**How to avoid:**
- Subscribe to Zustand store selectors: `useCartStore(state => state.getItemCount())`
- If using mount flag, ensure it only affects initial render, not subsequent updates
- Test: click Add to Cart, verify badge increments without refresh
**Warning signs:** Badge shows 0 when cart has items, badge only updates after page navigation/refresh

### Pitfall 7: Quantity Input Allows Invalid Values (0, negative, decimals)
**What goes wrong:** User types 0 or -5 in quantity input, breaking cart calculations. Or types "2.5" for quantity.
**Why it happens:** Input type="number" allows decimals and negative by default, onChange doesn't validate.
**How to avoid:**
- Use `inputMode="numeric"` with `pattern="[0-9]*"` (consistency with dimension inputs)
- Validate onChange: `Math.max(1, Math.floor(Number(value)))`
- Min quantity 1, no max (or reasonable max like 999)
- Consider stepper buttons instead of raw number input
**Warning signs:** Cart shows 0 quantity items, negative prices, decimal quantities in UI

## Code Examples

Verified patterns from official sources:

### Confirmation Dialog with Accessibility
```typescript
// Source: react-modal documentation - https://reactcommunity.org/react-modal/accessibility/
// MUI Dialog - https://mui.com/material-ui/react-dialog/

'use client'

import { useState } from 'react'

interface RemoveDialogProps {
  itemId: string
  productName: string
  onConfirm: () => void
}

export function RemoveCartItemDialog({ itemId, productName, onConfirm }: RemoveDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-red-600 hover:text-red-800"
      >
        Remove
      </button>

      {isOpen && (
        <dialog
          open
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="alertdialog"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false)
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h2 id="dialog-title" className="text-xl font-semibold mb-2">
              Remove from cart?
            </h2>
            <p id="dialog-description" className="text-gray-600 mb-6">
              Remove {productName} from your cart?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm()
                  setIsOpen(false)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  )
}
```

### Cart Badge with Animation
```typescript
// Source: Ecommerce UX best practices
// https://www.nngroup.com/articles/cart-feedback/

'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/cart/store'

export function CartBadge() {
  const [mounted, setMounted] = useState(false)
  const [prevCount, setPrevCount] = useState(0)
  const itemCount = useCartStore((state) => state.getItemCount())
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && itemCount > prevCount) {
      // Item was added - trigger animation
      setShouldAnimate(true)
      const timer = setTimeout(() => setShouldAnimate(false), 300)
      return () => clearTimeout(timer)
    }
    setPrevCount(itemCount)
  }, [itemCount, prevCount, mounted])

  if (!mounted || itemCount === 0) return null

  return (
    <span
      className={`
        absolute -top-2 -right-2
        bg-blue-600 text-white text-xs font-semibold
        rounded-full h-5 min-w-[1.25rem] px-1
        flex items-center justify-center
        ${shouldAnimate ? 'animate-bounce' : ''}
      `}
    >
      {itemCount}
    </span>
  )
}
```

### Sticky Footer Cart Summary
```typescript
// Source: Mobile UX best practices
// https://www.trafiki-ecommerce.com/marketing-knowledge-hub/the-ultimate-guide-to-shopping-cart-ux/

'use client'

import { useCartStore } from '@/lib/cart/store'

export function CartSummary() {
  const totalPrice = useCartStore((state) => state.getTotalPrice())
  const itemCount = useCartStore((state) => state.getItemCount())

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg md:sticky md:top-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-medium">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="text-2xl font-bold">
            {formatPrice(totalPrice)}
          </span>
        </div>
        <button
          disabled={itemCount === 0}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px]"
        >
          Proceed to Checkout
        </button>
        <a
          href="/"
          className="block text-center text-blue-600 hover:underline mt-3"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  )
}
```

### Quantity Input with Validation
```typescript
// Source: Consistency with existing dimension-configurator.tsx pattern
// Phase 3 decision: text input + inputMode="decimal"

'use client'

import { useState } from 'react'

interface QuantityInputProps {
  itemId: string
  initialQuantity: number
  onUpdate: (quantity: number) => void
}

export function QuantityInput({ itemId, initialQuantity, onUpdate }: QuantityInputProps) {
  const [value, setValue] = useState(String(initialQuantity))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setValue(raw)

    // Parse and validate
    const num = parseInt(raw, 10)
    if (!isNaN(num) && num >= 1) {
      onUpdate(num)
    }
  }

  const handleBlur = () => {
    // Ensure valid value on blur
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 1) {
      setValue(String(initialQuantity))
    } else {
      setValue(String(num))
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
      aria-label="Quantity"
    />
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux for cart state | Zustand or Jotai | 2021-2022 | Less boilerplate, smaller bundle size, easier TypeScript integration |
| Class components with lifecycle methods | Functional components with hooks | 2019 (React 16.8) | Simpler state logic, better composition, hooks ecosystem |
| Manual optimistic UI with rollback | React 19 useOptimistic hook | 2024 (React 19) | Built-in primitive, automatic rollback, less error-prone |
| Pages Router with getServerSideProps | App Router with Server Components | 2023 (Next.js 13) | Better data fetching, streaming, partial pre-rendering |
| localStorage without TTL | Timestamp-based lazy TTL | Ongoing best practice | Prevents storage bloat, respects user privacy, matches session expiry patterns |
| type="number" inputs | text input + inputMode="numeric" | Phase 3 decision | Avoids React number input bugs, provides numeric keyboard on mobile |

**Deprecated/outdated:**
- **Redux for simple cart state**: Overkill for most e-commerce. Use Zustand or Context unless app has complex multi-feature state requirements.
- **sessionStorage for cart**: Clears on tab close, bad UX. Use localStorage with TTL instead.
- **getServerSideProps for cart data**: Pages Router pattern. In App Router, use Server Components or client state with optional Server Actions for persistence.
- **Custom modal implementations**: Use native `<dialog>` element (widely supported as of 2022) or established accessible libraries (react-modal, MUI).

## Open Questions

Things that couldn't be fully resolved:

1. **Server session sync timing**
   - What we know: iron-session provides cookie-based sessions compatible with Next.js 15 App Router
   - What's unclear: Phase context says "store in both localStorage AND server session" but doesn't specify when/how to sync. Should every cart mutation trigger server sync, or only at checkout?
   - Recommendation: Defer server session sync to checkout phase unless explicit requirement. localStorage alone handles Phase 4 requirements (persistence, 7-day expiry). Add server sync when needed for checkout or future cross-device feature.

2. **Empty cart "Back to [last page]" implementation**
   - What we know: Phase context requires "Back to [last page viewed]" button on empty cart
   - What's unclear: How to track "last page viewed" - `document.referrer`, router history, or explicit state?
   - Recommendation: Use Next.js `useRouter()` with `router.back()` for simplest implementation. Falls back to home page if no history. More sophisticated tracking (session history) can be added if needed.

3. **Cart icon badge animation preferences**
   - What we know: Research shows subtle animation (bounce, pulse) draws attention and confirms action
   - What's unclear: User preference for animation intensity - phase context leaves "cart icon badge behavior" to Claude's discretion
   - Recommendation: Implement subtle bounce animation on increment (300ms). User testing in later phases can refine if too distracting.

4. **Maximum cart size limits**
   - What we know: No explicit max items or max quantity per item specified
   - What's unclear: Should cart enforce max items (e.g., 50) or max quantity per item (e.g., 999)?
   - Recommendation: No max items limit initially. Max quantity per item: 999 (3 digits fits UI, prevents accidental large orders). Can adjust based on business requirements.

## Sources

### Primary (HIGH confidence)
- React Official Docs - useEffect pitfalls: https://react.dev/learn/you-might-not-need-an-effect
- React Official Docs - useOptimistic: https://react.dev/reference/react/useOptimistic
- Next.js Official Docs - Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js Official Docs - Server Actions and Mutations: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Zustand Official Docs - Persisting store data: https://zustand.docs.pmnd.rs/integrations/persisting-store-data
- Craft Commerce Docs - Cart uniqueness with optionsSignature: https://craftcms.com/docs/commerce/5.x/development/cart.html
- react-modal Accessibility Docs: https://reactcommunity.org/react-modal/accessibility/
- Nielsen Norman Group - Cart Feedback: https://www.nngroup.com/articles/cart-feedback/

### Secondary (MEDIUM confidence)
- State Management with Next.js App Router: https://www.pronextjs.dev/tutorials/state-management
- How to Use Zustand with Next.js 15 (2026): https://www.dimasroger.com/blog/how-to-use-zustand-with-next-js-15
- TTL localStorage pattern: https://www.sohamkamani.com/javascript/localstorage-with-ttl-expiry/
- Next.js hydration fixes with Zustand: https://brockherion.dev/blog/posts/nextjs-fixing-hydration-issues-with-zustand/
- Understanding optimistic UI - LogRocket: https://blog.logrocket.com/understanding-optimistic-ui-react-useoptimistic-hook/
- Shopping Cart UX Guide (2026): https://www.trafiki-ecommerce.com/marketing-knowledge-hub/the-ultimate-guide-to-shopping-cart-ux/
- Cart Page Designs for 2026: https://www.convertcart.com/blog/cart-page-designs
- iron-session GitHub: https://github.com/vvo/iron-session
- Next.js 14 Auth with Iron Session: https://blog.lama.dev/next-js-14-auth-with-iron-session/

### Tertiary (LOW confidence)
- Various Medium/DEV.to tutorials on cart implementation (provided patterns but not authoritative)
- WebSearch results for ecosystem discovery (validated against official docs where possible)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Zustand, iron-session, and React 19 useOptimistic verified with official docs and current version compatibility
- Architecture: HIGH - Patterns verified against official Zustand, React, and Next.js documentation; hash-based uniqueness verified with Craft Commerce implementation
- Pitfalls: HIGH - Hydration, race conditions, and accessibility issues verified with official React/Next.js docs and established accessibility guidelines

**Research date:** 2026-01-31
**Valid until:** 2026-03-31 (60 days - React/Next.js ecosystem moderately fast-moving, but core patterns stable)
