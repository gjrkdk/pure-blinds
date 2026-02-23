---
phase: 24-e-commerce-events
plan: 01
subsystem: analytics
tags: [ga4, analytics, gtag, ecommerce, react]

# Dependency graph
requires:
  - phase: 23-ga4-foundation
    provides: sendGtagEvent() wrapper, GA_MEASUREMENT_ID, debug_mode handling
provides:
  - GA4EcommerceItem TypeScript interface
  - trackViewItem(), trackAddToCart(), trackBeginCheckout(), trackPurchase() functions
  - view_item event firing once per product page visit via useRef guard
  - add_to_cart event with width_cm and height_cm custom params in DimensionConfigurator
affects:
  - 24-e-commerce-events (plans 02+ for begin_checkout and purchase)
  - 25-cookie-consent (consent update affects whether these events fire)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - GA4EcommerceItem interface as shared type for all e-commerce events
    - useRef guard pattern to prevent duplicate view_item events on price updates
    - Cents-to-EUR conversion at analytics call site (price / 100)
    - Custom event params (width_cm, height_cm) for dimension-specific analytics

key-files:
  created: []
  modified:
    - src/lib/analytics/index.ts
    - src/components/dimension-configurator.tsx

key-decisions:
  - "GA4EcommerceItem price is EUR decimal — callers divide cents by 100 at call site, not inside the function"
  - "useRef(false) guard in DimensionConfigurator ensures view_item fires exactly once per product page visit even when dimensions change and price updates"
  - "trackAddToCart placed after addItem() and before setAddedToCart(true) in handleAddToCart()"
  - "item_category hardcoded to 'rolgordijnen' — all current products are roller blinds"

patterns-established:
  - "GA4 e-commerce events: all use currency: EUR and item array structure per GA4 recommended schema"
  - "Cents-to-EUR at call site: always divide by 100 when passing price to analytics functions"
  - "Deduplication via useRef: use useRef guard for events that should fire once per page mount"

requirements-completed: [ECOM-01, ECOM-02]

# Metrics
duration: 2min
completed: 2026-02-23
---

# Phase 24 Plan 01: E-Commerce Events — view_item and add_to_cart Summary

**GA4 e-commerce event functions (trackViewItem, trackAddToCart, trackBeginCheckout, trackPurchase) added to analytics module; DimensionConfigurator fires view_item once per product page visit and add_to_cart with width_cm/height_cm custom dimensions on every cart addition**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-23T21:16:10Z
- **Completed:** 2026-02-23T21:18:08Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Extended analytics module with GA4EcommerceItem interface and 4 typed event functions following GA4 recommended e-commerce schema
- Wired view_item into DimensionConfigurator with useRef guard — fires exactly once per product page visit even when price updates multiple times
- Wired add_to_cart into handleAddToCart() with width_cm and height_cm custom parameters for popular size analysis
- EUR decimal pricing enforced at call site (price / 100 from cents) in both event calls

## Task Commits

Each task was committed atomically:

1. **Task 1: Add GA4 e-commerce event functions to analytics module** - `f9ccb98` (feat)
2. **Task 2: Wire view_item and add_to_cart events into DimensionConfigurator** - `68ad536` (feat)

## Files Created/Modified
- `src/lib/analytics/index.ts` - Added GA4EcommerceItem interface and 4 e-commerce event functions (trackViewItem, trackAddToCart, trackBeginCheckout, trackPurchase); Phase 24 extension point comments updated
- `src/components/dimension-configurator.tsx` - Added useRef import, viewItemFiredRef guard, view_item useEffect, trackAddToCart call in handleAddToCart()

## Decisions Made
- EUR decimal pricing is the responsibility of the caller — functions accept EUR, callers divide cents by 100
- item_category is hardcoded to 'rolgordijnen' — all products are roller blinds; this aligns with GA4 category filtering
- trackAddToCart fires after addItem() call to ensure cart state is updated before event fires

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- view_item and add_to_cart are fully wired (ECOM-01, ECOM-02 complete)
- trackBeginCheckout and trackPurchase are exported and ready for Phase 24 plans 02+
- begin_checkout needs wiring at checkout redirect (handleCheckout in cart page)
- purchase event needs sessionStorage snapshot mechanism and /bevestiging page integration

---
*Phase: 24-e-commerce-events*
*Completed: 2026-02-23*
