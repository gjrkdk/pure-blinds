---
phase: 19-enhance-ga4-ecommerce-tracking
plan: 01
subsystem: analytics
tags: [ga4, ecommerce, gtag, react, nextjs]

# Dependency graph
requires:
  - phase: 24-ecommerce-events
    provides: "GA4EcommerceItem interface, trackViewItem/trackAddToCart/trackBeginCheckout/trackPurchase functions"
  - phase: 26-analytics-gap-closure
    provides: "begin_checkout event_callback redirect gate in cart-summary.tsx"
provides:
  - "trackViewCart function — view_cart GA4 event"
  - "trackRemoveFromCart function — remove_from_cart GA4 event"
  - "Enriched begin_checkout items with item_category and dimension data"
  - "Enriched purchase_snapshot with item_category and dimension data (automatic via sessionStorage)"
affects: [analytics, cart, ecommerce-funnel]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useRef(false) guard ensures view_cart fires once per cart page visit (same pattern as view_item in dimension-configurator)"
    - "trackRemoveFromCart fires before removeItem() — item data still available at fire time"
    - "Snapshot enrichment pattern: enrich at write time (cart-summary) so readers (purchase-tracker) get rich data automatically"

key-files:
  created: []
  modified:
    - src/lib/analytics/index.ts
    - src/app/winkelwagen/page.tsx
    - src/components/cart/cart-item.tsx
    - src/components/cart/cart-summary.tsx

key-decisions:
  - "view_cart only fires for non-sample items — samples are not ecommerce products; samples still tracked in remove_from_cart"
  - "view_cart useRef guard mirrors viewItemFiredRef pattern from dimension-configurator.tsx"
  - "trackRemoveFromCart fires BEFORE removeItem() to ensure item data is available"
  - "Snapshot enrichment at write time in cart-summary.tsx: purchase-tracker.tsx requires no changes as it passes items as-is"

patterns-established:
  - "useRef(false) guard for once-per-visit analytics events on page mount"
  - "GA4 item mapping: always include item_category:'rolgordijnen', conditionally spread width_cm/height_cm from item.options"

requirements-completed: [ECOM-DETAIL]

# Metrics
duration: ~5min
completed: 2026-02-27
---

# Quick Task 19: Enhance GA4 Ecommerce Tracking Summary

**Complete GA4 ecommerce funnel with 6 events (view_item, add_to_cart, view_cart, remove_from_cart, begin_checkout, purchase) — all carrying consistent item_category and dimension data**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-27T16:36:00Z
- **Completed:** 2026-02-27T16:41:15Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added trackViewCart and trackRemoveFromCart to analytics module following existing sendGtagEvent pattern
- Wired view_cart into /winkelwagen page with useRef(false) guard (fires once per visit, non-sample items only)
- Wired remove_from_cart into cart-item.tsx handleConfirmRemove, firing before removeItem() for all item types
- Enriched begin_checkout and purchase_snapshot items with item_category:'rolgordijnen' and width_cm/height_cm dimensions
- Purchase event gets enriched automatically — PurchaseTracker reads snapshot as-is, no code change needed

## Task Commits

Each task was committed atomically:

1. **Task 1: Add trackViewCart and trackRemoveFromCart to analytics module** - `02b72a5` (feat)
2. **Task 2: Wire events into cart UI and enrich checkout/purchase payloads** - `9d9dbe0` (feat)

## Files Created/Modified
- `src/lib/analytics/index.ts` - Added trackViewCart(items, totalValue) and trackRemoveFromCart(item) functions
- `src/app/winkelwagen/page.tsx` - Added view_cart useEffect with useRef guard, imports useEffect/useRef/trackViewCart
- `src/components/cart/cart-item.tsx` - Added remove_from_cart tracking in handleConfirmRemove before removeItem()
- `src/components/cart/cart-summary.tsx` - Enriched snapshot.items and checkoutItems with item_category and dimension fields

## Decisions Made
- Samples filtered from view_cart GA4 items array (not ecommerce products) but included in remove_from_cart (user removed something)
- view_cart useRef guard reuses same pattern established in dimension-configurator.tsx viewItemFiredRef
- trackRemoveFromCart fires before removeItem() — ensures item data (priceInCents, options) is still in scope
- Purchase event enrichment achieved by enriching the snapshot at write time — no changes needed in purchase-tracker.tsx

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full GA4 ecommerce funnel is now complete: view_item, add_to_cart, view_cart, remove_from_cart, begin_checkout, purchase
- All item payloads consistently include item_category:'rolgordijnen' and dimension data (where available)
- Manual verification with ?debug_mode=true recommended to confirm events fire in browser console

## Self-Check

### Files Exist
- `src/lib/analytics/index.ts` — FOUND (trackViewCart and trackRemoveFromCart defined)
- `src/app/winkelwagen/page.tsx` — FOUND (view_cart useEffect wired)
- `src/components/cart/cart-item.tsx` — FOUND (remove_from_cart in handleConfirmRemove)
- `src/components/cart/cart-summary.tsx` — FOUND (enriched snapshot and checkoutItems)

### Commits Exist
- `02b72a5` — FOUND (Task 1: analytics module)
- `9d9dbe0` — FOUND (Task 2: UI wiring + enrichment)

## Self-Check: PASSED

---
*Quick Task: 19-enhance-ga4-ecommerce-tracking*
*Completed: 2026-02-27*
