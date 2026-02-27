---
phase: 19-enhance-ga4-ecommerce-tracking
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/analytics/index.ts
  - src/app/winkelwagen/page.tsx
  - src/components/cart/cart-item.tsx
  - src/components/cart/cart-summary.tsx
  - src/components/analytics/purchase-tracker.tsx
autonomous: true
requirements: [ECOM-DETAIL]

must_haves:
  truths:
    - "view_cart event fires with full items array and cart value when user visits /winkelwagen"
    - "remove_from_cart event fires with the removed item details when user confirms removal"
    - "begin_checkout items include item_category and dimension data (width_cm, height_cm)"
    - "purchase snapshot items include item_category and dimension data"
  artifacts:
    - path: "src/lib/analytics/index.ts"
      provides: "trackViewCart and trackRemoveFromCart functions"
      exports: ["trackViewCart", "trackRemoveFromCart"]
    - path: "src/app/winkelwagen/page.tsx"
      provides: "view_cart event on cart page mount"
    - path: "src/components/cart/cart-item.tsx"
      provides: "remove_from_cart event on item removal"
    - path: "src/components/cart/cart-summary.tsx"
      provides: "Enriched begin_checkout items with item_category and dimensions"
    - path: "src/components/analytics/purchase-tracker.tsx"
      provides: "Purchase event uses enriched snapshot data"
  key_links:
    - from: "src/app/winkelwagen/page.tsx"
      to: "src/lib/analytics/index.ts"
      via: "trackViewCart call in useEffect"
      pattern: "trackViewCart"
    - from: "src/components/cart/cart-item.tsx"
      to: "src/lib/analytics/index.ts"
      via: "trackRemoveFromCart call on confirm remove"
      pattern: "trackRemoveFromCart"
    - from: "src/components/cart/cart-summary.tsx"
      to: "sessionStorage purchase_snapshot"
      via: "enriched items with item_category + dimensions"
      pattern: "item_category.*rolgordijnen"
---

<objective>
Enhance GA4 ecommerce tracking to include two missing recommended events (view_cart, remove_from_cart) and enrich existing event payloads with detailed product data (item_category, dimensions) across the full purchase funnel.

Purpose: The current tracking covers the core funnel (view_item, add_to_cart, begin_checkout, purchase) but omits view_cart and remove_from_cart events, and the checkout/purchase item payloads lack item_category and dimension custom parameters that are already sent in view_item and add_to_cart. This creates gaps in GA4 funnel analysis and product-level reporting.

Output: Complete GA4 ecommerce funnel with 6 events, all carrying consistent item-level detail.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/analytics/index.ts
@src/lib/analytics/gtag.ts
@src/lib/cart/store.ts
@src/lib/cart/types.ts
@src/app/winkelwagen/page.tsx
@src/components/cart/cart-item.tsx
@src/components/cart/cart-summary.tsx
@src/components/analytics/purchase-tracker.tsx
@src/components/dimension-configurator.tsx

<interfaces>
<!-- Key types and contracts the executor needs -->

From src/lib/analytics/index.ts:
```typescript
export interface GA4EcommerceItem {
  item_id: string
  item_name: string
  price: number          // EUR decimal, NOT cents
  quantity: number
  item_category?: string // e.g. "rolgordijnen"
  width_cm?: number      // custom param
  height_cm?: number     // custom param
}
```

From src/lib/analytics/gtag.ts:
```typescript
export function sendGtagEvent(eventName: string, params?: Record<string, unknown>): void
export const GA_MEASUREMENT_ID: string | undefined
```

From src/lib/cart/types.ts:
```typescript
export interface CartItem {
  id: string
  productId: string
  productName: string
  type?: "product" | "sample"
  options?: { width: number; height: number }
  optionsSignature?: string
  quantity: number
  priceInCents: number
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add trackViewCart and trackRemoveFromCart to analytics module</name>
  <files>src/lib/analytics/index.ts</files>
  <action>
Add two new exported functions to the analytics module following the exact same pattern as the existing trackViewItem, trackAddToCart, etc. functions:

1. `trackViewCart(items: GA4EcommerceItem[], totalValue: number): void` — sends a `view_cart` event with `currency: 'EUR'`, `value: totalValue`, and `items` array. Add JSDoc explaining it fires once when the cart page mounts (only when items.length > 0).

2. `trackRemoveFromCart(item: GA4EcommerceItem): void` — sends a `remove_from_cart` event with `currency: 'EUR'`, `value: item.price * item.quantity`, and `items: [item]`. Add JSDoc explaining it fires when user confirms item removal from cart.

Both functions call `sendGtagEvent` exactly like existing functions. Do NOT change any existing functions or the GA4EcommerceItem interface (it already has all needed fields).
  </action>
  <verify>grep -c "trackViewCart\|trackRemoveFromCart" src/lib/analytics/index.ts should return 2 (function definitions). TypeScript compilation: npx tsc --noEmit --pretty 2>&1 | head -20</verify>
  <done>Both trackViewCart and trackRemoveFromCart are exported from src/lib/analytics/index.ts, follow the same pattern as existing functions, and pass TypeScript compilation.</done>
</task>

<task type="auto">
  <name>Task 2: Wire view_cart and remove_from_cart events into cart UI, enrich checkout/purchase item payloads</name>
  <files>
    src/app/winkelwagen/page.tsx
    src/components/cart/cart-item.tsx
    src/components/cart/cart-summary.tsx
    src/components/analytics/purchase-tracker.tsx
  </files>
  <action>
**A) Wire view_cart event in cart page** (`src/app/winkelwagen/page.tsx`):
- Import `trackViewCart` from `@/lib/analytics` and `useEffect`/`useRef` from React (useEffect is not currently imported — page uses useSyncExternalStore only).
- Add a `useEffect` that fires AFTER `mounted` becomes true AND `items.length > 0`. Use a `useRef(false)` guard to ensure it fires only once per page visit (same pattern as viewItemFiredRef in dimension-configurator.tsx).
- Convert cart items to GA4EcommerceItem format: `item_id: item.productId`, `item_name: item.productName`, `price: item.priceInCents / 100`, `quantity: item.quantity`, `item_category: 'rolgordijnen'`. For non-sample items with options, include `width_cm: item.options.width` and `height_cm: item.options.height`. Skip sample items (type === 'sample') from the items array — samples are not ecommerce products.
- Calculate totalValue as sum of `(item.priceInCents * item.quantity) / 100` for non-sample items.
- Call `trackViewCart(ga4Items, totalValue)`.

**B) Wire remove_from_cart event in cart item** (`src/components/cart/cart-item.tsx`):
- Import `trackRemoveFromCart` from `@/lib/analytics`.
- In the existing `handleConfirmRemove` function, BEFORE `removeItem(item.id)`, fire `trackRemoveFromCart` with the item data converted to GA4EcommerceItem format. Use the same mapping as in (A). For sample items, still track removal but WITHOUT width_cm/height_cm (they have no options).
- Set `item_category: 'rolgordijnen'` for all items including samples.

**C) Enrich begin_checkout items** (`src/components/cart/cart-summary.tsx`):
- In the `handleCheckout` function, the `checkoutItems` array (line ~105-110) currently maps items to `{ item_id, item_name, price, quantity }`. Add `item_category: 'rolgordijnen'` to every item. For items with `options`, also add `width_cm: item.options?.width` and `height_cm: item.options?.height`. Same for the `snapshot.items` mapping (line ~91-96) — add `item_category: 'rolgordijnen'` and conditionally add `width_cm`/`height_cm` from `item.options`.
- This means the sessionStorage purchase_snapshot will now contain richer items.

**D) Purchase snapshot is automatically enriched** (`src/components/analytics/purchase-tracker.tsx`):
- No code changes needed in this file. PurchaseTracker reads from sessionStorage and passes items directly to `trackPurchase`. Since the snapshot written in (C) now includes `item_category` and dimension data, the purchase event automatically gets enriched. The GA4EcommerceItem interface already supports these optional fields.
- HOWEVER: verify that the PurchaseTracker does not strip fields — confirm it passes `items` as-is from the parsed snapshot to `trackPurchase`. (It does: line 22 `trackPurchase(transactionId, items, totalValue)` with items from JSON.parse.)

Key constraints:
- Price is always EUR decimal (divide priceInCents by 100) per locked decision Phase 24-01
- item_category is always 'rolgordijnen' per locked decision Phase 24-01
- Do NOT modify the GA4EcommerceItem interface — it already has all needed fields
- Filter out sample items from view_cart GA4 items array (samples have fixed price, no dimensions, not ecommerce products)
- Include samples in remove_from_cart (user removed something, track it)
  </action>
  <verify>
1. TypeScript compilation: `npx tsc --noEmit --pretty 2>&1 | head -30`
2. Check view_cart wiring: `grep -n "trackViewCart" src/app/winkelwagen/page.tsx` (should show import + useEffect call)
3. Check remove_from_cart wiring: `grep -n "trackRemoveFromCart" src/components/cart/cart-item.tsx` (should show import + call in handleConfirmRemove)
4. Check enriched checkout items: `grep -n "item_category" src/components/cart/cart-summary.tsx` (should appear in both snapshot and checkoutItems mappings)
5. Dev build succeeds: `npx next build 2>&1 | tail -5`
  </verify>
  <done>
- /winkelwagen page fires view_cart with full item details on mount (once per visit, non-sample items only)
- Removing a cart item fires remove_from_cart with that item's details
- begin_checkout items include item_category:'rolgordijnen' and width_cm/height_cm dimensions
- purchase event receives enriched items via sessionStorage snapshot (no code change needed in purchase-tracker)
- All events use EUR decimal pricing and consistent GA4EcommerceItem format
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with no errors
2. `npx next build` succeeds
3. Manual verification with `?debug_mode=true`:
   - Navigate to a product page, add item to cart -> console shows add_to_cart with item_category + dimensions
   - Navigate to /winkelwagen -> console shows view_cart with items array including item_category + dimensions
   - Remove an item -> console shows remove_from_cart with item details
   - Click Afrekenen -> console shows begin_checkout with item_category + dimensions in items
</verification>

<success_criteria>
- Six GA4 ecommerce events tracked: view_item, add_to_cart, view_cart, remove_from_cart, begin_checkout, purchase
- All item payloads consistently include item_category:'rolgordijnen'
- Non-sample items include width_cm and height_cm custom parameters in all events
- No duplicate event firing (view_cart uses useRef guard like existing view_item pattern)
- TypeScript compiles, Next.js builds successfully
</success_criteria>

<output>
After completion, create `.planning/quick/19-enhance-ga4-ecommerce-tracking-with-deta/19-SUMMARY.md`
</output>
