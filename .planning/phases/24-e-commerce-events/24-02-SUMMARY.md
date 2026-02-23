---
phase: 24-e-commerce-events
plan: 02
subsystem: analytics
tags: [ga4, analytics, ecommerce, begin_checkout, purchase, sessionStorage, cross-domain]

# Dependency graph
requires:
  - phase: 24-e-commerce-events
    plan: 01
    provides: trackBeginCheckout(), trackPurchase(), GA4EcommerceItem interface
  - phase: 23-ga4-foundation
    provides: sendGtagEvent() wrapper, gtag.js with _gl linker script
provides:
  - begin_checkout event fired on checkout button click with EUR items and total
  - sessionStorage purchase_snapshot with transactionId, items, totalValue
  - _gl linker decoration on Shopify invoiceUrl for cross-domain GA4 session continuity
  - PurchaseTracker headless component with dual-layer deduplication
  - purchase event on /bevestiging deduped via sessionStorage + localStorage flags
affects:
  - 25-cookie-consent (consent update affects whether these events fire)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - sessionStorage cart snapshot before clearCart() — sole mechanism for purchase items data
    - glBridge.generate() pattern for _gl cross-domain linker decoration (graceful degradation)
    - Dual-layer deduplication: sessionStorage (same-session) + localStorage (cross-session)
    - Headless client component pattern (returns null, side-effect-only)
    - transactionId format: pb-{timestamp}-{random5} generated at checkout initiation

key-files:
  created:
    - src/components/analytics/purchase-tracker.tsx
  modified:
    - src/components/cart/cart-summary.tsx
    - src/app/bevestiging/page.tsx

key-decisions:
  - "transactionId generated at checkout click (pb-{timestamp}-{random}) — not from Shopify order ID, since Shopify order ID is not accessible cross-domain on return"
  - "sessionStorage snapshot written BEFORE clearCart() — cart store clears synchronously, items would be empty after clearCart()"
  - "_gl decoration uses window.google_tag_data.glBridge.generate() — graceful degradation if not available"
  - "PurchaseTracker needs no Suspense boundary — reads sessionStorage in useEffect only, not useSearchParams"
  - "Dedup key format: purchase_tracked_{transactionId} — persisted in both sessionStorage and localStorage"

patterns-established:
  - "Session snapshot pattern: write to sessionStorage before redirect, read after cross-domain return"
  - "Dual-layer analytics dedup: sessionStorage for refresh protection + localStorage for bookmark/return protection"
  - "Headless analytics component: 'use client' + useEffect + return null — no visual impact"

requirements-completed: [ECOM-03, ECOM-04, ECOM-05, ECOM-06]

# Metrics
duration: ~81s
completed: 2026-02-23
---

# Phase 24 Plan 02: begin_checkout, purchase event, and cross-domain _gl linker Summary

**begin_checkout fires on checkout click with EUR items; sessionStorage snapshot carries cart data across Shopify redirect; PurchaseTracker fires deduplicated purchase event on /bevestiging using dual sessionStorage+localStorage guards**

## Performance

- **Duration:** ~81s
- **Started:** 2026-02-23T21:20:23Z
- **Completed:** 2026-02-23T21:21:44Z
- **Tasks:** 2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments
- Added `trackBeginCheckout` call to CartSummary.handleCheckout() before the fetch() — fires immediately on checkout button click with EUR-converted items and total
- Generated `transactionId` (pb-{timestamp}-{random5}) at checkout initiation as the shared identifier linking begin_checkout, snapshot, and purchase events
- Wrote sessionStorage `purchase_snapshot` (transactionId + items array + totalValue) BEFORE `clearCart()` — critical ordering since cart clears synchronously
- Added `decorateWithGlLinker()` helper using `window.google_tag_data.glBridge.generate()` to append `_gl` parameter to Shopify invoiceUrl for cross-domain GA4 session continuity; fails silently if gtag.js bridge not available
- Created headless `PurchaseTracker` client component that reads snapshot, deduplicates via sessionStorage + localStorage flags (key: `purchase_tracked_{transactionId}`), fires `trackPurchase`, clears snapshot
- Mounted `<PurchaseTracker />` on `/bevestiging` page as first child — no visual impact, no Suspense boundary needed

## Task Commits

Each task was committed atomically:

1. **Task 1: begin_checkout, sessionStorage snapshot, _gl linker in CartSummary** - `459136a` (feat)
2. **Task 2: PurchaseTracker component and /bevestiging mount** - `c9230a7` (feat)

## Files Created/Modified
- `src/components/cart/cart-summary.tsx` - Added trackBeginCheckout import, transactionId generation, begin_checkout call, sessionStorage snapshot write, decorateWithGlLinker helper, replaced direct redirect with decorated URL
- `src/components/analytics/purchase-tracker.tsx` - New headless client component; reads purchase_snapshot, dual-layer dedup, fires trackPurchase, clears snapshot
- `src/app/bevestiging/page.tsx` - Added PurchaseTracker import and mount; existing content unchanged

## Decisions Made
- transactionId generated client-side at checkout click — Shopify order ID is not accessible cross-domain on confirmation page return
- Snapshot written BEFORE clearCart() to capture items before store resets
- _gl decoration via glBridge.generate() is the standard undocumented-but-stable gtag.js API for cross-domain linking
- No Suspense boundary on PurchaseTracker — component only reads sessionStorage in useEffect, never uses useSearchParams

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None — implementation complete. Live validation (GA4 DebugView cross-domain session continuity) requires a real test checkout with `?gtm_debug=x` active.

## Next Phase Readiness
- Full GA4 e-commerce funnel is now wired: view_item → add_to_cart → begin_checkout → purchase
- ECOM-01 through ECOM-06 all complete
- Phase 25 (cookie consent with vanilla-cookieconsent) can proceed independently

## Self-Check: PASSED

- src/components/cart/cart-summary.tsx — FOUND
- src/components/analytics/purchase-tracker.tsx — FOUND
- src/app/bevestiging/page.tsx — FOUND
- .planning/phases/24-e-commerce-events/24-02-SUMMARY.md — FOUND
- Commit 459136a (Task 1) — FOUND
- Commit c9230a7 (Task 2) — FOUND

---
*Phase: 24-e-commerce-events*
*Completed: 2026-02-23*
