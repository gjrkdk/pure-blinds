---
phase: 22-checkout-order-tracking
plan: 01
subsystem: ui, api
tags: [vat, btw, pricing, shopify, cart, confirmation, order-verification]

# Dependency graph
requires:
  - phase: 21-cart-ux
    provides: cart store, CartSummary, ClearCartOnMount, cart item components
  - phase: 20-shopify-catalog-integration
    provides: Shopify Admin client (createAdminClient), draft order flow
provides:
  - VAT-inclusive price labels on configurator, cart items, and cart total
  - /api/verify-order endpoint for Shopify order validation
  - Smart cart clearing that only triggers on verified order completion
  - Redirect guard on /bevestiging for missing/invalid order_id
  - Updated empty cart state with Dutch copy and homepage CTA
affects:
  - Any future phase touching price display or cart clearing behavior

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Verification-gated side effects — fetch external API before mutating local state
    - Safe-default pattern — on any verification failure, leave cart intact
    - Shopify Admin GraphQL node lookup with GID normalisation

key-files:
  created:
    - src/app/api/verify-order/route.ts
  modified:
    - src/components/dimension-configurator.tsx
    - src/components/cart/cart-item.tsx
    - src/components/cart/cart-summary.tsx
    - src/components/cart/clear-cart-on-mount.tsx
    - src/app/bevestiging/page.tsx
    - src/app/winkelwagen/page.tsx

key-decisions:
  - "Inline 'incl. 21% BTW' on configurator (text-base font-normal text-muted), 'incl. BTW' on cart line items and total — no separate breakdown line"
  - "ClearCartOnMount accepts orderId prop; does nothing if prop is absent (page component handles redirect)"
  - "verify-order endpoint safe default: any error or missing node returns { valid: false }, never risks cart data loss"
  - "GID normalisation: if order_id is numeric, construct gid://shopify/DraftOrder/${order_id}"
  - "Empty cart CTA changed from /producten to / with Dutch 'Terug naar de winkel' text"

patterns-established:
  - "Verification-gated mutations: always verify with external API before clearing/mutating local state"
  - "Safe default: error = no action taken (cart stays, page does not clear)"

requirements-completed: [CHKOUT-01, CHKOUT-02]

# Metrics
duration: 2min
completed: 2026-02-19
---

# Phase 22 Plan 01: Checkout Order Tracking Summary

**VAT-inclusive BTW labels across purchase flow plus Shopify-verified cart clearing on confirmation page**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-19T15:50:20Z
- **Completed:** 2026-02-19T15:52:00Z
- **Tasks:** 2
- **Files modified:** 6 modified, 1 created

## Accomplishments
- All three price display locations (configurator, cart items, cart total) show inline Dutch BTW labels per regulatory expectation
- New `/api/verify-order` GET endpoint validates order_id against Shopify Admin GraphQL before clearing cart
- Confirmation page (/bevestiging) silently redirects to homepage when visited without a valid `order_id` parameter
- Cart clearing is now verification-gated — failed Shopify lookups leave cart intact
- Empty cart state uses Dutch copy "Je winkelwagen is leeg" with "Terug naar de winkel" link to homepage

## Task Commits

Each task was committed atomically:

1. **Task 1: Add VAT-inclusive price labels to configurator, cart items, and cart total** - `7c60bee` (feat)
2. **Task 2: Implement smart cart clearing with Shopify order verification on confirmation page** - `4c57cd3` (feat)

## Files Created/Modified
- `src/app/api/verify-order/route.ts` - NEW: GET endpoint for Shopify DraftOrder existence check with GID normalisation
- `src/components/cart/clear-cart-on-mount.tsx` - Rewritten to accept orderId prop; calls /api/verify-order before clearing; cleans up checkout_started localStorage on success
- `src/app/bevestiging/page.tsx` - Added redirect('/') guard for missing order_id; passes orderId to ClearCartOnMount
- `src/components/dimension-configurator.tsx` - Removed 'Prijs' label, added inline 'incl. 21% BTW' span after price amount
- `src/components/cart/cart-item.tsx` - Appended 'incl. BTW' text after unit price
- `src/components/cart/cart-summary.tsx` - Added 'incl. BTW' xs muted span after total amount
- `src/app/winkelwagen/page.tsx` - Updated empty state: Dutch copy, CTA links to homepage

## Decisions Made
- Inline BTW labels with no separate breakdown — shorter 'incl. BTW' on tight layouts (cart), full 'incl. 21% BTW' on configurator where space allows
- Safe default throughout: any error from Shopify = cart stays intact, no data loss
- GID normalisation in verify-order route: numeric IDs become `gid://shopify/DraftOrder/${id}`, full GIDs used as-is
- checkout_started localStorage key cleaned up on successful verification (avoids stale state from prior checkout sessions)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- VAT price labelling and verification-gated cart clearing are complete
- /api/verify-order is live and ready for production Shopify order IDs
- Phase 22 Plan 02 can proceed (order tracking implementation)

---
*Phase: 22-checkout-order-tracking*
*Completed: 2026-02-19*
