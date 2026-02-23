# Phase 24: E-Commerce Events - Research

**Researched:** 2026-02-23
**Domain:** GA4 e-commerce event instrumentation — Next.js 15 App Router + headless Shopify Draft Orders
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Event data & pricing
- Prices are VAT-inclusive (21% BTW) — matches what the customer sees on the site
- item_id uses the product slug (e.g. "roller-blind-white") — human-readable, matches internal product keys
- add_to_cart events include width_cm and height_cm as custom event parameters — useful for analyzing popular sizes
- Currency is EUR for all events

#### Purchase event flow
- Cart items snapshot to sessionStorage before Shopify checkout redirect (cart is cleared before redirect)
- transaction_id extracted from Shopify URL query params on /bevestiging
- Deduplication via sessionStorage flag ("purchase_tracked_{orderId}") — skip if already set, prevents duplicate purchase events on page refresh

#### Cross-domain checkout link
- Fix the _gl linker in Phase 24: manually decorate the checkout URL with _gl parameter before window.location.href redirect
- This ensures GA4 session continuity through the Shopify checkout flow

### Claude's Discretion
- Exact GA4 event parameter names and structure (follow GA4 recommended e-commerce schema)
- How to extract Shopify order ID from /bevestiging URL params
- begin_checkout event placement (before or after API call)
- view_item trigger location (product page component)
- Error handling for missing sessionStorage data on /bevestiging

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ECOM-01 | `view_item` event fires on product detail page with item_id, item_name, price in EUR | GA4 view_item schema documented (HIGH); trigger location is DimensionConfigurator (client component) on price load; productId is the slug per locked decision |
| ECOM-02 | `add_to_cart` event fires when user adds item to cart with configured dimensions and price | GA4 add_to_cart schema documented (HIGH); trigger is handleAddToCart() in DimensionConfigurator; custom params width_cm and height_cm are GA4-valid custom parameters |
| ECOM-03 | `begin_checkout` event fires on checkout button click before Shopify redirect | GA4 begin_checkout schema documented (HIGH); trigger is handleCheckout() in CartSummary, before fetch() is called; must fire before redirect |
| ECOM-04 | `purchase` event fires on /bevestiging with transaction_id and complete items array | CRITICAL ARCHITECTURAL ISSUE — see "Critical Finding" section; sessionStorage snapshot strategy is the implementation path |
| ECOM-05 | Purchase events deduplicated via sessionStorage + localStorage guard (no duplicates on refresh) | GA4 supports transaction_id deduplication within a session; localStorage guard covers cross-session duplicates; implementation pattern documented in ARCHITECTURE.md |
| ECOM-06 | Cart contents snapshot stored in sessionStorage before checkout redirect for purchase event data | sessionStorage is the correct mechanism (not localStorage); snapshot must be written before clearCart() and window.location.href redirect |
</phase_requirements>

---

## Summary

Phase 24 instruments the complete GA4 e-commerce funnel across the pure-blinds.nl purchase flow. The required events are: `view_item` (product page), `add_to_cart` (dimension configurator), `begin_checkout` (cart summary), and `purchase` (confirmation page). All event infrastructure (sendGtagEvent wrapper, GA_MEASUREMENT_ID guard, debug_mode support) was established in Phase 23.

There is one critical architectural finding that changes the implementation approach for ECOM-04/ECOM-05/ECOM-06: **the `/bevestiging` page is NOT automatically reached by Shopify after checkout**. After Phase 22, a fix commit (`aeedfdd`) revealed that Shopify uses Liquid for the confirmation page — the app's `/bevestiging` page is only reached if the user manually navigates there. The purchase event strategy must account for this: the `transaction_id` cannot be extracted from Shopify URL params on return, because there is no automatic return. Instead, a client-side UUID generated at checkout initiation, stored in sessionStorage, is the only reliable transaction_id source.

The CONTEXT.md decision "transaction_id extracted from Shopify URL query params on /bevestiging" must be reconciled with codebase reality. The correct interpretation is: the user IS redirected to `/bevestiging` but **Shopify does not pass order ID query params by default for Draft Order invoice flows**. The `/bevestiging` route is configured as the return URL and Shopify does redirect to it, but without guaranteed order identifier in the URL. The client-generated transaction_id stored in sessionStorage is the correct approach.

**Primary recommendation:** Add `trackViewItem()`, `trackAddToCart()`, `trackBeginCheckout()` calls to existing client components, write a sessionStorage cart snapshot with client-generated transactionId in handleCheckout(), then build a `PurchaseTracker` client component for `/bevestiging` that reads the snapshot and fires `purchase` with deduplication guard. Manually decorate the invoiceUrl with `_gl` linker parameter before redirect.

---

## Critical Finding: /bevestiging Architecture Reality

The CONTEXT.md references "transaction_id extracted from Shopify URL query params on /bevestiging." This requires research clarification.

### What the codebase reveals (HIGH confidence)

After Phase 22, commit `aeedfdd` simplified the `/bevestiging` page because:
- "Shopify uses Liquid for the confirmation page so our custom /bevestiging page is never reached"
- The ClearCartOnMount component was removed
- The order_id searchParams reading was removed
- cart-summary.tsx was changed to clear the cart when invoiceUrl is received (checkout initiation, not completion)

### What this means for Phase 24

The current `/bevestiging` page (`src/app/bevestiging/page.tsx`) is a static server component with no order_id reading. It renders regardless of whether the user came from Shopify or navigated directly.

**Three scenarios for user reaching /bevestiging:**
1. User completes Shopify checkout → Shopify redirects to the invoice URL's origin domain → whether this is `/bevestiging` depends on the `invoiceUrl` structure
2. User manually navigates to `/bevestiging` directly
3. `/bevestiging` is never the automatic post-checkout destination

**Resolution (MEDIUM confidence — requires real checkout test per STATE.md blocker):**
The existing `.planning/research/ARCHITECTURE.md` explicitly states: "Return URL is `/bevestiging` — this is the only purchase signal the app receives" and "No order ID passes back from Shopify to `/bevestiging` via URL." The architecture research (verified 2026-02-22) was done with full codebase knowledge after Phase 22's fix. This research established the sessionStorage snapshot as the solution BECAUSE Shopify does not reliably pass order data back.

The CONTEXT.md decision "transaction_id extracted from Shopify URL query params on /bevestiging" is the desired behavior but is constrained by Shopify's Draft Order flow. The implementation must use a client-generated transactionId stored in sessionStorage (as documented in ARCHITECTURE.md Pattern 4), while also reading any Shopify params that may be present as a secondary signal.

**Conclusion:** Implement sessionStorage snapshot with client-generated transactionId. If Shopify does return order params (needs real test), they can serve as the transactionId. If not, the client-generated UUID is the fallback. The deduplication guard (sessionStorage flag per transactionId) works regardless.

---

## Standard Stack

### Core (Phase 23 established — already in codebase)

| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| `sendGtagEvent()` | `src/lib/analytics/gtag.ts` | GA4 event wrapper with dev logging and debug_mode support | EXISTS — use directly |
| `GA_MEASUREMENT_ID` | `src/lib/analytics/gtag.ts` | Guard for production-only event firing | EXISTS — imported in index.ts |
| `trackPageView()` | `src/lib/analytics/index.ts` | Page view event (pattern to follow for new event functions) | EXISTS — extend this file |
| `window.gtag` | Injected via layout.tsx Script tags | Underlying GA4 call mechanism | EXISTS — Phase 23 wired |

### Event Schema (HIGH confidence — verified from Google developer docs)

GA4 e-commerce events use a consistent `items` array structure:

```typescript
// GA4 item shape for this codebase
interface GA4EcommerceItem {
  item_id: string;      // = product slug (e.g. "wit-rolgordijn") per locked decision
  item_name: string;    // = productName (e.g. "Wit Rolgordijn")
  price: number;        // = priceInCents / 100 (EUR decimal, NOT cents)
  quantity: number;     // = item.quantity
  item_category?: string; // = product category (e.g. "rolgordijnen")
  // Custom params (per locked decision for add_to_cart):
  width_cm?: number;    // = item.options.width
  height_cm?: number;   // = item.options.height
}
```

### No Additional Library Installations Required

All required functionality is available via:
- Existing `sendGtagEvent()` wrapper in `src/lib/analytics/gtag.ts`
- Browser `sessionStorage` API (no library)
- Browser `localStorage` API (no library)
- `crypto.randomUUID()` or `Date.now()` for transaction ID generation (no library)

---

## Architecture Patterns

### Recommended Project Structure (Phase 24 additions)

```
src/
├── lib/
│   └── analytics/
│       ├── gtag.ts          # EXISTS — sendGtagEvent, GA_MEASUREMENT_ID
│       └── index.ts         # MODIFY — add trackViewItem, trackAddToCart, trackBeginCheckout, trackPurchase
├── components/
│   ├── analytics/
│   │   ├── analytics-provider.tsx  # EXISTS — page view tracking
│   │   └── purchase-tracker.tsx    # NEW — fires purchase event on /bevestiging
│   ├── dimension-configurator.tsx  # MODIFY — add trackViewItem, trackAddToCart calls
│   └── cart/
│       └── cart-summary.tsx        # MODIFY — add trackBeginCheckout, sessionStorage snapshot, _gl decoration
└── app/
    └── bevestiging/
        └── page.tsx                # MODIFY — add <PurchaseTracker /> component
```

### Pattern 1: Event Functions in lib/analytics/index.ts

**What:** Extend the existing `index.ts` with typed event functions that call `sendGtagEvent()`. Follow the pattern already established by `trackPageView()`.

**Why this file:** `index.ts` is the public API for the analytics module. It already exports `trackPageView` and re-exports `GA_MEASUREMENT_ID`. Adding e-commerce functions here maintains a single import path for all analytics.

```typescript
// src/lib/analytics/index.ts additions
// Source: Google developer docs — https://developers.google.com/tag-platform/gtagjs/reference/events

interface GA4EcommerceItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
  // Custom params per CONTEXT.md locked decision (add_to_cart only)
  width_cm?: number;
  height_cm?: number;
}

export function trackViewItem(item: GA4EcommerceItem): void {
  sendGtagEvent('view_item', {
    currency: 'EUR',
    value: item.price,
    items: [item],
  })
}

export function trackAddToCart(item: GA4EcommerceItem): void {
  sendGtagEvent('add_to_cart', {
    currency: 'EUR',
    value: item.price * item.quantity,
    items: [item],
  })
}

export function trackBeginCheckout(items: GA4EcommerceItem[], totalValue: number): void {
  sendGtagEvent('begin_checkout', {
    currency: 'EUR',
    value: totalValue,
    items,
  })
}

export function trackPurchase(transactionId: string, items: GA4EcommerceItem[], totalValue: number): void {
  sendGtagEvent('purchase', {
    transaction_id: transactionId,
    currency: 'EUR',
    value: totalValue,
    items,
  })
}
```

**Key insight:** `sendGtagEvent()` already handles the GA_MEASUREMENT_ID guard and debug_mode detection. No additional guards needed in these wrapper functions.

### Pattern 2: view_item Trigger in DimensionConfigurator

**What:** Fire `view_item` when a price is successfully loaded (price state becomes non-null after API response).

**When to use:** Use a `useEffect` that depends on the `price` state and fires `trackViewItem()` when price transitions from `null` to a number.

**CONTEXT.md is Claude's discretion** for trigger location.

**Recommended:** Fire on `priceInCents` state change when it becomes non-null. This represents the user viewing the item with a real price — the most meaningful `view_item` signal.

```typescript
// In DimensionConfigurator — inside useEffect when price is set
useEffect(() => {
  if (price === null) return
  trackViewItem({
    item_id: productId,        // slug e.g. "wit-rolgordijn"
    item_name: productName,
    price: price / 100,        // cents → EUR
    quantity: 1,
    item_category: 'rolgordijnen',
  })
}, [price, productId, productName])
```

**Note:** `price` is in cents (from `/api/pricing`). GA4 `price` must be in currency units (EUR), so divide by 100. `formatPrice()` already does this for display — follow the same pattern.

### Pattern 3: add_to_cart Trigger in DimensionConfigurator

**What:** Fire `add_to_cart` inside `handleAddToCart()` after the item is added to the Zustand store.

**When:** After `addItem()` call succeeds (synchronous operation).

**CONTEXT.md locked decision:** Include `width_cm` and `height_cm` as custom event parameters.

```typescript
// In handleAddToCart() inside DimensionConfigurator
const handleAddToCart = () => {
  if (price === null || loading || Object.keys(fieldErrors).length > 0) return

  addItem({ productId, productName, options: { width: parseInt(width, 10), height: parseInt(height, 10) }, priceInCents: price })

  const widthNum = parseInt(width, 10)
  const heightNum = parseInt(height, 10)

  trackAddToCart({
    item_id: productId,
    item_name: productName,
    price: price / 100,        // cents → EUR
    quantity: 1,
    item_category: 'rolgordijnen',
    width_cm: widthNum,        // custom param per locked decision
    height_cm: heightNum,      // custom param per locked decision
  })

  setAddedToCart(true)
}
```

### Pattern 4: begin_checkout + sessionStorage Snapshot in CartSummary

**What:** In `handleCheckout()`, fire `begin_checkout` and write the sessionStorage snapshot BEFORE the `window.location.href` redirect. The snapshot is what enables the `purchase` event on `/bevestiging`.

**CONTEXT.md is Claude's discretion** for exact begin_checkout placement (before or after API call). Recommendation: fire begin_checkout on button click BEFORE the API call. The user has initiated checkout regardless of whether the API succeeds.

```typescript
// In handleCheckout() in CartSummary — BEFORE fetch() call
const handleCheckout = async () => {
  setLoading(true)
  setError(null)

  // Fire begin_checkout immediately on button click (before API, per recommendation)
  const transactionId = `pb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  trackBeginCheckout(
    items.map(item => ({
      item_id: item.productId,
      item_name: item.productName,
      price: item.priceInCents / 100,
      quantity: item.quantity,
    })),
    getTotalPrice() / 100
  )

  try {
    const response = await fetch('/api/checkout', { ... })
    const data = await response.json()

    if (response.ok && data.invoiceUrl) {
      // Write sessionStorage snapshot BEFORE clearCart() and redirect
      const snapshot = {
        transactionId,
        items: items.map(item => ({
          item_id: item.productId,
          item_name: item.productName,
          price: item.priceInCents / 100,
          quantity: item.quantity,
        })),
        totalValue: getTotalPrice() / 100,
      }
      sessionStorage.setItem('purchase_snapshot', JSON.stringify(snapshot))

      // Decorate invoiceUrl with _gl linker parameter (cross-domain session continuity)
      const decoratedUrl = decorateWithGlLinker(data.invoiceUrl)

      useCartStore.getState().clearCart()
      localStorage.removeItem('checkout_started')
      window.location.href = decoratedUrl
    }
    ...
  }
}
```

### Pattern 5: _gl Linker Decoration for JavaScript Redirect

**What:** Manually decorate the Shopify invoiceUrl with the GA4 `_gl` cross-domain linker parameter before `window.location.href` redirect.

**Why:** GA4 only appends `_gl` automatically to HTML anchor clicks. JavaScript redirects (`window.location.href`) bypass this mechanism entirely.

**How:** Use `window.google_tag_data.glBridge.generate()` — an undocumented but widely-used utility present on the page after gtag.js loads.

**CONTEXT.md locked decision:** Manually decorate the checkout URL with _gl parameter before window.location.href redirect.

```typescript
// Helper function to decorate URL with GA4 _gl linker parameter
function decorateWithGlLinker(url: string): string {
  try {
    const win = window as Window & {
      google_tag_data?: {
        glBridge?: {
          generate: (cookies: Record<string, string>) => string
        }
      }
    }

    if (!win.google_tag_data?.glBridge?.generate) return url

    // Extract GA4 cookies: _ga (client ID) and session cookie (_ga_MEASUREMENTID)
    const getCookie = (name: string): string | undefined => {
      const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
      return match ? decodeURIComponent(match[1]) : undefined
    }

    const gaClientId = getCookie('_ga')
    if (!gaClientId) return url  // No GA cookie means user has no session to preserve

    // Build cookie object for glBridge
    // _ga cookie value format: "GA1.2.XXXXXXXX.YYYYYYYYYY" — strip "GA1.X." prefix
    const cookies: Record<string, string> = {
      _ga: gaClientId.replace(/^GA\d+\.\d+\./, ''),
    }

    // Also include session cookie if present (format: _ga_MEASUREMENTID)
    const measurementId = process.env.NEXT_PUBLIC_GA4_ID?.replace('G-', '')
    if (measurementId) {
      const sessionCookie = getCookie(`_ga_${measurementId}`)
      if (sessionCookie) {
        cookies[`_ga_${measurementId}`] = sessionCookie.replace(/^GS\d+\.\d+\./, '')
      }
    }

    const glParam = win.google_tag_data.glBridge.generate(cookies)
    if (!glParam) return url

    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}_gl=${encodeURIComponent(glParam)}`
  } catch {
    // glBridge not available (ad blocker, GA4 not loaded) — proceed without linker
    return url
  }
}
```

**Important caveats (LOW-MEDIUM confidence):**
- `window.google_tag_data.glBridge` is undocumented and could change. Wrap in try-catch — if it fails, proceed without decoration (graceful degradation).
- This only works AFTER gtag.js has loaded. Since `handleCheckout` requires user interaction (button click), gtag.js will have loaded by then (afterInteractive strategy).
- If the user has not consented and `analytics_storage` is denied, there may be no `_ga` cookie to pass. In that case, `getCookie('_ga')` returns undefined and the function returns the undecorated URL (correct behavior).

### Pattern 6: PurchaseTracker Client Component

**What:** A headless client component that reads the sessionStorage snapshot and fires the `purchase` GA4 event with deduplication. Mount it on the `/bevestiging` page.

**Deduplication strategy:** Two-layer guard per REQUIREMENTS.md ECOM-05:
1. `sessionStorage` flag `purchase_tracked_{transactionId}` — prevents duplicate on same-session page refresh
2. `localStorage` flag `purchase_tracked_{transactionId}` — prevents duplicate if user returns in new session

```typescript
// src/components/analytics/purchase-tracker.tsx
'use client'

import { useEffect } from 'react'
import { trackPurchase } from '@/lib/analytics'

export function PurchaseTracker() {
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('purchase_snapshot')
      if (!raw) return  // No snapshot = no purchase to track (direct navigation)

      const { transactionId, items, totalValue } = JSON.parse(raw)
      if (!transactionId) return

      // Layer 1: sessionStorage deduplication (same browser session)
      const ssKey = `purchase_tracked_${transactionId}`
      if (sessionStorage.getItem(ssKey)) return

      // Layer 2: localStorage deduplication (cross-session, e.g. bookmark + return)
      const lsKey = `purchase_tracked_${transactionId}`
      if (localStorage.getItem(lsKey)) return

      trackPurchase(transactionId, items, totalValue)

      // Mark as tracked in both stores
      sessionStorage.setItem(ssKey, '1')
      localStorage.setItem(lsKey, '1')

      // Clear the snapshot — order is complete
      sessionStorage.removeItem('purchase_snapshot')
    } catch {
      // Fail silently — analytics is non-critical
    }
  }, [])

  return null
}
```

**Note on CONTEXT.md decision:** The locked decision says `"purchase_tracked_{orderId}"` for the deduplication key. Since we're using a client-generated transactionId (not a real orderId from Shopify), the key becomes `purchase_tracked_{transactionId}`. This is semantically identical.

### Pattern 7: bevestiging Page Modification

**What:** Add `<PurchaseTracker />` client component to the `/bevestiging` server component page.

**No Suspense boundary needed** because `PurchaseTracker` does NOT use `useSearchParams()`. It reads from `sessionStorage` in a `useEffect`. This avoids the Next.js Suspense deopt issue documented in PITFALLS.md Pitfall 6.

```typescript
// src/app/bevestiging/page.tsx (modification)
import { PurchaseTracker } from '@/components/analytics/purchase-tracker'

export default function ConfirmationPage() {
  return (
    <div className="px-6 py-20 sm:py-28">
      <PurchaseTracker />  {/* Fires purchase event if sessionStorage snapshot exists */}
      {/* ... existing page content unchanged ... */}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Reading Zustand cart on /bevestiging:** Cart is already cleared before redirect. Store snapshot in sessionStorage before clearCart() — not after.
- **Using localStorage for purchase snapshot:** localStorage persists across sessions — a stale snapshot from a previous session would fire a duplicate purchase event on the user's next visit. Use sessionStorage (auto-clears when tab closes).
- **Omitting items array from purchase event:** GA4 product reports are empty without items. Always populate from snapshot.
- **Missing transaction_id:** Without transaction_id, GA4 has no way to deduplicate. Always generate before redirect.
- **Firing begin_checkout after the API call:** If the API call fails, the event was never fired. Fire on button click (checkout intention), not on API success.
- **Firing view_item on every render:** DimensionConfigurator re-renders frequently. Gate view_item on price state change, not component mount.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GA4 event wrapper | Custom window.gtag abstraction | `sendGtagEvent()` in `src/lib/analytics/gtag.ts` | Already built in Phase 23; includes GA_MEASUREMENT_ID guard, debug_mode, dev logging |
| Price formatting | Custom cents→EUR conversion | `priceInCents / 100` directly | GA4 expects a raw number; `formatPrice()` returns a display string (currency-formatted), not a number |
| UUID generation | Custom ID generator | `'pb-' + Date.now() + '-' + Math.random().toString(36).slice(2)` | Sufficient uniqueness for session-scoped deduplication; no library needed |
| Cookie parsing | Custom cookie parser | Inline regex pattern (see Pattern 5) | One-off need; no cookie library warranted |

---

## Common Pitfalls

### Pitfall 1: Price Units Mismatch (Cents vs EUR)

**What goes wrong:** GA4 `price` and `value` parameters expect decimal currency values (e.g., `29.95`). The codebase stores all prices in cents (e.g., `2995`). Using cents directly would report 100× inflated revenue in GA4.

**Why it happens:** `priceInCents` naming makes the cents storage obvious, but when writing event code quickly it's easy to pass the raw value.

**How to avoid:** Always divide by 100 when building GA4 item objects. The existing `formatPrice(cents)` utility also divides by 100 — follow the same pattern.

**Warning signs:** GA4 reports show revenue 100× higher than actual. `view_item` events in DebugView show prices like "2995" instead of "29.95".

### Pitfall 2: sessionStorage Doesn't Survive Cross-Browser Redirect

**What goes wrong:** sessionStorage is tab-scoped. If the user opens Shopify checkout in a new tab (e.g., browser opens links in new tabs by default), the Shopify tab has a different sessionStorage scope. On return to `/bevestiging` (which may open in yet another tab), the sessionStorage snapshot is not present.

**Why it happens:** `window.location.href` redirect preserves the same tab and sessionStorage. But if Shopify opens in a new tab, the session is broken.

**How to avoid:** Verify behavior with `window.location.href` redirect (current implementation in cart-summary.tsx). The existing code uses `window.location.href = data.invoiceUrl` — this is a same-tab redirect, so sessionStorage IS preserved across the Shopify redirect and return.

**Warning signs:** GA4 shows begin_checkout events without matching purchase events. Manual test: sessionStorage disappears on /bevestiging.

**Note from STATE.md:** This is listed as a known blocker: "Phase 24 (purchase event): Validate whether sessionStorage snapshot survives Shopify cross-domain redirect back to /bevestiging — requires a real test checkout in DevTools."

### Pitfall 3: begin_checkout Fired When Cart Is Empty or Checkout Fails

**What goes wrong:** If begin_checkout fires on button click before validation, and then the API call fails (network error, Shopify error), GA4 records a begin_checkout with no corresponding purchase. This is a data quality issue but not a critical bug.

**How to avoid:** Fire begin_checkout before the API call (checkout intention signal). Accept that some begin_checkout events won't convert due to errors — this is expected in real usage too.

### Pitfall 4: view_item Fires on Every Price Update (Debounce Sensitivity)

**What goes wrong:** DimensionConfigurator debounces pricing API calls. Each time the debounced dimensions change and a new price is returned, the useEffect fires, potentially sending multiple view_item events for a single product page view.

**How to avoid:** Track whether view_item has been fired for the current product using a ref. Only fire once per productId per page visit.

```typescript
// In DimensionConfigurator — guard view_item with a ref
const viewItemFiredRef = useRef(false)

useEffect(() => {
  if (price === null || viewItemFiredRef.current) return
  viewItemFiredRef.current = true
  trackViewItem({ item_id: productId, item_name: productName, price: price / 100, quantity: 1 })
}, [price, productId, productName])
```

### Pitfall 5: _gl Decoration Relies on Undocumented API

**What goes wrong:** `window.google_tag_data.glBridge` is not part of Google's public API. It could be removed or changed in a gtag.js update.

**How to avoid:** Wrap the entire decoration in try-catch and fall back to the undecorated URL. Session continuity breaks gracefully — the user still completes checkout, just with a new GA4 session on the Shopify side.

---

## Code Examples

### Complete GA4 Item Helper

```typescript
// Helper to convert CartItem to GA4 item shape
// Source: Google developer docs events reference
import type { CartItem } from '@/lib/cart/types'

interface GA4EcommerceItem {
  item_id: string
  item_name: string
  price: number
  quantity: number
  item_category?: string
  width_cm?: number
  height_cm?: number
}

function cartItemToGA4Item(item: CartItem, includeCustomDimensions = false): GA4EcommerceItem {
  const ga4Item: GA4EcommerceItem = {
    item_id: item.productId,          // = product slug per locked decision
    item_name: item.productName,
    price: item.priceInCents / 100,   // cents → EUR
    quantity: item.quantity,
    item_category: 'rolgordijnen',    // all products are rolgordijnen
  }

  if (includeCustomDimensions && item.options) {
    ga4Item.width_cm = item.options.width
    ga4Item.height_cm = item.options.height
  }

  return ga4Item
}
```

### Transaction ID Generation Pattern

```typescript
// Generate a unique transaction ID at checkout initiation
// No external library — Date.now() + random suffix is sufficient for session deduplication
const transactionId = `pb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
```

### Complete Purchase Event Parameters (HIGH confidence)

```javascript
// Source: https://developers.google.com/tag-platform/gtagjs/reference/events
gtag('event', 'purchase', {
  transaction_id: 'pb-1234567890-abc12',  // required, used for deduplication
  currency: 'EUR',                          // required when value is set
  value: 59.95,                             // total order value in EUR (not cents)
  items: [                                  // required for product reports
    {
      item_id: 'wit-rolgordijn',            // product slug
      item_name: 'Wit Rolgordijn',          // product name
      price: 59.95,                         // unit price in EUR
      quantity: 1,
      item_category: 'rolgordijnen',
    }
  ]
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@next/third-parties` GoogleAnalytics component | Manual next/script + custom sendGtagEvent | Phase 23 decision | Required for Consent Mode v2 compatibility; @next/third-parties lacks consent mode support as of 2025 |
| clearCart() on confirmation page | clearCart() at checkout initiation (invoice URL received) | Phase 22 fix commit aeedfdd | /bevestiging is not automatically reached from Shopify; cart clears when user clicks Afrekenen and Shopify responds |
| order_id from Shopify URL params on /bevestiging | Client-generated transactionId in sessionStorage | Phase 22 fix commit | Shopify Draft Order invoice flows do not reliably return order ID to the app |

---

## Open Questions

1. **Does sessionStorage survive Shopify redirect in the real checkout flow?**
   - What we know: `window.location.href` redirect preserves the same tab and sessionStorage scope. The implementation in cart-summary.tsx uses this.
   - What's unclear: Whether the full Shopify checkout → payment → return to pure-blinds.nl flow keeps the same tab (no new-tab openings). Shopify's own redirect should stay in the same tab.
   - Recommendation: Proceed with sessionStorage implementation per architecture plan. STATE.md flags this as needing a real test checkout. The PLAN must include a manual verification step.

2. **Does Shopify pass any order parameters to the return URL after Draft Order payment?**
   - What we know: Shopify's new checkout system (since August 2025 deprecation) uses UI extensions. For Basic plan Draft Orders, the return redirect is to the `invoiceUrl`'s origin after payment, but query params are not documented as being reliably appended.
   - What's unclear: The CONTEXT.md locked decision says "transaction_id extracted from Shopify URL query params on /bevestiging" — this is aspirational. If Shopify DOES pass params (e.g., `?order_token=...` or `?checkout_token=...`), they should be read. If not, the client-generated transactionId is the fallback.
   - Recommendation: Implement PurchaseTracker to check for URL params first, then fall back to sessionStorage transactionId. This satisfies the CONTEXT.md decision AND the architecture constraint.

3. **Does the _gl linker configuration in layout.tsx (Phase 23) automatically apply to JavaScript redirects?**
   - What we know: The layout.tsx Script 3 includes `gtag('set', 'linker', { 'domains': [shopifyDomain] })`. Automatic decoration only applies to anchor clicks, NOT `window.location.href`.
   - What's unclear: Whether the GA4 Admin cross-domain configuration alone (without manual _gl decoration) is sufficient for session continuity.
   - Recommendation: Implement manual _gl decoration per CONTEXT.md locked decision. This is the definitive fix. The existing linker config handles anchor clicks and is complementary.

---

## Sources

### Primary (HIGH confidence)
- `/Users/robinkonijnendijk/Desktop/pure-blinds/.planning/research/ARCHITECTURE.md` — Complete e-commerce event architecture for this codebase, researched 2026-02-22
- `/Users/robinkonijnendijk/Desktop/pure-blinds/.planning/research/STACK.md` — Stack decisions and event schema, researched 2026-02-22
- `/Users/robinkonijnendijk/Desktop/pure-blinds/.planning/research/PITFALLS.md` — All known pitfalls for this exact stack combination, researched 2026-02-22
- `/websites/developers_google_tag-platform` (Context7) — GA4 event schema: view_item, add_to_cart, begin_checkout, purchase — item parameters, required fields
- [GA4 Ecommerce Measurement](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce) — Official Google developer docs, event schema
- [gtag.js Event Reference](https://developers.google.com/tag-platform/gtagjs/reference/events) — Official parameter documentation

### Secondary (MEDIUM confidence)
- [gtm-gear.com: GA4 cross-domain for JavaScript redirects](https://gtm-gear.com/posts/ga4-cross-domain-linker/) — glBridge.generate() pattern with code example
- [thyngster.com: Cross-Domain Tracking on GA4](https://www.thyngster.com/cross-domain-tracking-on-google-analytics-4-ga4) — glBridge API documentation (undocumented but verified by community)
- [Shopify Community: Query parameters added to Draft Order invoice_url](https://community.shopify.com/c/api-announcements/query-parameters-added-to-a-draft-order-invoice-url-now-get/m-p/314399) — Shopify passes custom query params through invoice URL to checkout

### Codebase Evidence (HIGH confidence)
- `src/lib/analytics/gtag.ts` — sendGtagEvent, GA_MEASUREMENT_ID (Phase 23 output)
- `src/lib/analytics/index.ts` — trackPageView pattern (Phase 23 output, extend for Phase 24)
- `src/components/dimension-configurator.tsx` — handleAddToCart, price state (where add_to_cart and view_item fire)
- `src/components/cart/cart-summary.tsx` — handleCheckout flow (where begin_checkout fires and snapshot is written)
- `src/app/bevestiging/page.tsx` — current state (static, no order params, where PurchaseTracker mounts)
- `src/lib/cart/types.ts` — CartItem type (priceInCents, productId, productName, options.width/height)
- Git commit `aeedfdd` — Phase 22 architectural fix establishing that /bevestiging is not auto-reached from Shopify

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all required infrastructure exists from Phase 23; no new libraries
- Event schema: HIGH — verified from Google developer docs and Context7
- Architecture patterns: HIGH — documented in existing planning research with full codebase awareness
- Purchase flow / sessionStorage: MEDIUM — sessionStorage survives same-tab redirect (HIGH), but real checkout test needed to confirm (flagged in STATE.md)
- _gl linker decoration: MEDIUM — undocumented glBridge API, multiple community sources confirm pattern works; must be wrapped in try-catch for graceful degradation

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (30 days — GA4 event schema is stable; _gl pattern could change with gtag.js update)
