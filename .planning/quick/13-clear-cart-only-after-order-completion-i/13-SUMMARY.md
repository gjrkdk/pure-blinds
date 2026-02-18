---
phase: quick-13
plan: 01
subsystem: ui
tags: [cart, checkout, zustand, react, next.js]

# Dependency graph
requires:
  - phase: cart
    provides: useCartStore with clearCart action
provides:
  - Cart clearing deferred to /bevestiging confirmation page
  - ClearCartOnMount client component for side-effect-based cart clearing
affects: [cart, checkout, bevestiging]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Side-effect component pattern: render null component that fires useEffect on mount to trigger store action"

key-files:
  created:
    - src/components/cart/clear-cart-on-mount.tsx
  modified:
    - src/components/cart/cart-summary.tsx
    - src/app/bevestiging/page.tsx

key-decisions:
  - "Moved clearCart from checkout handler to confirmation page mount to preserve cart if user abandons Shopify checkout"
  - "Used a dedicated ClearCartOnMount component (returns null) so a Server Component page can trigger a client-side store action"

patterns-established:
  - "Side-effect client component: 'use client' component that renders null and performs store actions in useEffect"

requirements-completed: [QUICK-13]

# Metrics
duration: 3min
completed: 2026-02-18
---

# Quick Task 13: Clear Cart Only After Order Completion Summary

**Cart clearing moved from Shopify checkout redirect to /bevestiging confirmation page mount using a dedicated ClearCartOnMount client component**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-18T00:00:00Z
- **Completed:** 2026-02-18T00:03:00Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- Removed premature `clearCart()` call from `cart-summary.tsx` checkout handler — cart now persists when user is redirected to Shopify
- Created `ClearCartOnMount` client component that fires `clearCart()` in a `useEffect` on mount, rendering nothing
- Rendered `<ClearCartOnMount />` in `/bevestiging` confirmation page so cart clears only after a completed order

## Task Commits

1. **Task 1: Verify changes are correctly implemented and committed** - `d2ec260` (feat) — pre-existing commit

**Plan metadata:** (see final commit)

## Files Created/Modified

- `src/components/cart/clear-cart-on-mount.tsx` - New `'use client'` component that calls `clearCart()` on mount via `useEffect`, returns `null`
- `src/components/cart/cart-summary.tsx` - Removed `clearCart` import and call from `handleCheckout`; now only redirects to `invoiceUrl`
- `src/app/bevestiging/page.tsx` - Imports and renders `<ClearCartOnMount />` so cart is cleared on confirmation page load

## Decisions Made

- Chose a dedicated null-rendering client component instead of converting the Server Component confirmation page to a client component — keeps page as Server Component while still accessing Zustand client store
- Cart clearing is now triggered on navigation to /bevestiging, which is only reachable after Shopify payment completes

## Deviations from Plan

None - plan executed exactly as written. Changes were pre-committed at `d2ec260`; TypeScript compiled cleanly with no errors.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Cart persistence through checkout abandonment is now correct
- No blockers

---
*Phase: quick-13*
*Completed: 2026-02-18*
