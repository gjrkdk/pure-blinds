---
phase: 26-analytics-gap-closure
plan: "01"
subsystem: analytics
tags: [ga4, gtag, event_callback, cross-domain-linker, ecommerce, checkout, cookie-consent]

# Dependency graph
requires:
  - phase: 24-e-commerce-events
    provides: trackBeginCheckout function, GA4EcommerceItem type, sendGtagEvent helper
  - phase: 25-cookie-consent-banner
    provides: cookie consent infrastructure, analytics_storage consent signal
provides:
  - begin_checkout GA4 event fires reliably in success branch with event_callback + event_timeout redirect gate
  - cross-domain _gl linker accepts incoming parameters from Shopify on return
affects: [purchase-tracking, shopify-checkout-redirect, ga4-reporting]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - event_callback + event_timeout:2000 redirect gate pattern for pre-navigation GA4 events
    - Guard pattern for gtag availability (typeof window.gtag === 'function' && GA_MEASUREMENT_ID)
    - Dual-layer begin_checkout: fire-and-forget in analytics module for dev logging, raw window.gtag at call site for event_callback

key-files:
  created: []
  modified:
    - src/lib/analytics/index.ts
    - src/components/cart/cart-summary.tsx
    - src/app/layout.tsx

key-decisions:
  - "trackBeginCheckout stays fire-and-forget in analytics module; event_callback timing handled at cart-summary.tsx call site"
  - "event_callback + event_timeout:2000 ensures redirect fires even when GA4 network call is slow or blocked"
  - "Guard condition checks both typeof window.gtag === 'function' AND GA_MEASUREMENT_ID — immediate fallback redirect when either is absent"
  - "accept_incoming: true added to cross-domain linker so _gl parameters from Shopify return redirect are accepted"

patterns-established:
  - "Pre-redirect GA4 pattern: window.gtag with event_callback + event_timeout gates navigation until event dispatches"
  - "Analytics module isolation: no redirect logic in analytics/index.ts, only at call sites"

requirements-completed:
  - ECOM-03
  - GA4-02

# Metrics
duration: 1min
completed: 2026-02-27
---

# Phase 26 Plan 01: Re-enable begin_checkout with event_callback + fix cross-domain linker Summary

**begin_checkout GA4 event fires reliably in checkout success branch via window.gtag event_callback + 2s timeout redirect gate, with cross-domain linker now accepting incoming _gl parameters**

## Performance

- **Duration:** ~5 min (including prior session Task 1)
- **Started:** 2026-02-27T15:38:59Z (continuation from Task 1)
- **Completed:** 2026-02-27T15:43:40Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Re-enabled `trackBeginCheckout` function body in `analytics/index.ts` — restored `sendGtagEvent('begin_checkout', ...)` call that was previously disabled
- Moved begin_checkout event firing from pre-fetch to the API success branch (`if (response.ok && data.invoiceUrl)`) in `cart-summary.tsx`
- Implemented `window.gtag` event_callback + event_timeout:2000 redirect gate pattern — Shopify redirect only fires after GA4 dispatches (or after 2s safety timeout)
- Added immediate fallback: redirect fires directly when `window.gtag` is not a function or `GA_MEASUREMENT_ID` is falsy (ad blockers, dev/preview)
- Fixed cross-domain linker by adding `'accept_incoming': true` to `gtag('set', 'linker', ...)` in `layout.tsx` Script 3

## Task Commits

Each task was committed atomically:

1. **Task 1: Re-enable trackBeginCheckout function body** - `60827ac` (feat)
2. **Task 2: event_callback redirect pattern + accept_incoming linker fix** - `292bfee` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified

- `src/lib/analytics/index.ts` — Restored `trackBeginCheckout` function body with `sendGtagEvent` call; updated JSDoc removing TODO/disabled comment
- `src/components/cart/cart-summary.tsx` — Added `GA_MEASUREMENT_ID` import; removed pre-fetch `trackBeginCheckout` call; restructured success branch with event_callback redirect gate
- `src/app/layout.tsx` — Added `'accept_incoming': true` to cross-domain linker config in Script 3

## Decisions Made

- **Architecture split:** `trackBeginCheckout` in `analytics/index.ts` remains fire-and-forget (no redirect concern). The `event_callback` + redirect timing is handled at the call site in `cart-summary.tsx` using raw `window.gtag`. This keeps the analytics module clean of navigation side effects.
- **Guard condition:** Check both `typeof window.gtag === 'function'` AND `GA_MEASUREMENT_ID` — if either is absent (ad blocker or dev/preview), redirect fires immediately without waiting.
- **Dual-layer approach:** `trackBeginCheckout` is still called in the success branch for dev console logging (it no-ops when `GA_MEASUREMENT_ID` is falsy). The actual GA4 dispatch with event_callback uses raw `window.gtag` separately.
- **event_timeout: 2000ms** — Google-documented safety value ensuring redirect fires regardless of GA4 network status.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — build passed with zero TypeScript errors on first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ECOM-03 (begin_checkout event) and GA4-02 (cross-domain linker accept_incoming) gaps are now closed
- Ready for milestone re-audit: run `/gsd:audit-milestone` to verify v1.5 gaps are resolved
- After audit passes: run `/gsd:complete-milestone` to archive v1.5

---
*Phase: 26-analytics-gap-closure*
*Completed: 2026-02-27*
