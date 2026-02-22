---
phase: 23-ga4-foundation
plan: 01
subsystem: analytics
tags: [ga4, gtag, consent-mode-v2, next-script, spa-tracking, cross-domain, analytics]

# Dependency graph
requires: []
provides:
  - GA4 gtag.js loaded via three-Script pattern with Consent Mode v2 defaults (all 4 denied)
  - src/lib/analytics/ public API (trackPageView) extensible for Phase 24 e-commerce and Phase 25 consent
  - AnalyticsProvider client component tracking SPA pathname changes via usePathname
  - Cross-domain linker configured for NEXT_PUBLIC_SHOPIFY_DOMAIN
affects:
  - 24-ecommerce-events
  - 25-cookie-consent

# Tech tracking
tech-stack:
  added: [next/script (built-in), next/navigation usePathname (built-in), GA4 gtag.js (CDN)]
  patterns:
    - Three-Script consent-init → gtag.js CDN → config+linker ordering in root layout
    - GA_MEASUREMENT_ID env var as production guard (not NODE_ENV)
    - Analytics module as thin public API layer — all gtag calls go through src/lib/analytics/

key-files:
  created:
    - src/lib/analytics/gtag.ts
    - src/lib/analytics/index.ts
    - src/components/analytics/analytics-provider.tsx
  modified:
    - src/app/layout.tsx

key-decisions:
  - "Guard analytics on NEXT_PUBLIC_GA4_ID presence, not NODE_ENV — Vercel preview deployments have NODE_ENV=production so NODE_ENV check would fire analytics on previews"
  - "Three separate Script tags in root layout for Consent Mode v2 ordering: consent-init (inline) must execute before gtag.js CDN loads"
  - "AnalyticsProvider mounted unconditionally outside GA_MEASUREMENT_ID conditional — dev console logging works even without GA4 configured"
  - "usePathname as dependency for page_view — strips query params by design, naturally filters query-param-only changes"

patterns-established:
  - "Analytics public API pattern: all GA4 interaction through src/lib/analytics/ — never call window.gtag directly from feature code"
  - "Script ordering pattern: consent defaults → external script → config (mandatory for Consent Mode v2)"

requirements-completed: [GA4-01, GA4-02, GA4-03]

# Metrics
duration: 2min
completed: 2026-02-22
---

# Phase 23 Plan 01: GA4 Foundation Summary

**GA4 gtag.js loaded with Consent Mode v2 (all 4 params denied before gtag.js fires), usePathname-based SPA page_view tracking, and cross-domain linker for Shopify checkout continuity**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-22T14:45:10Z
- **Completed:** 2026-02-22T14:47:15Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Analytics module at `src/lib/analytics/` with extensible public API (trackPageView), production guard on NEXT_PUBLIC_GA4_ID, and dev console logging
- Root layout updated with three Script tags in mandatory Consent Mode v2 order: consent-init → gtag.js CDN → config+linker, conditionally rendered when NEXT_PUBLIC_GA4_ID is defined
- AnalyticsProvider client component fires page_view on pathname changes only (query params stripped by usePathname)
- Cross-domain linker configured for Shopify checkout session continuity via NEXT_PUBLIC_SHOPIFY_DOMAIN

## Task Commits

Each task was committed atomically:

1. **Task 1: Create analytics module with gtag wrapper and public API** - `3106394` (feat)
2. **Task 2: Create AnalyticsProvider and integrate GA4 into root layout** - `8b0a279` (feat)

**Plan metadata:** (docs commit - see final commit)

## Files Created/Modified
- `src/lib/analytics/gtag.ts` - GA_MEASUREMENT_ID export, Window interface declarations, sendGtagEvent with production guard and dev logging, debug_mode URL param detection
- `src/lib/analytics/index.ts` - Public API: trackPageView (path only, no title), GA_MEASUREMENT_ID re-export, extension point comments for Phase 24/25
- `src/components/analytics/analytics-provider.tsx` - Client component using usePathname+useEffect to fire trackPageView on SPA route changes
- `src/app/layout.tsx` - Added Script import, AnalyticsProvider and GA_MEASUREMENT_ID imports, three Script tags in Consent Mode v2 order, AnalyticsProvider mount

## Decisions Made
- Used GA_MEASUREMENT_ID (NEXT_PUBLIC_GA4_ID env var) as production guard instead of NODE_ENV, because Vercel preview deployments run with NODE_ENV=production — the env var is only set in production
- AnalyticsProvider mounted outside GA_MEASUREMENT_ID conditional so developers see console logs for page_view events even without a GA4 property configured
- debug_mode passed in event params only when detected from URL search param — omitted entirely otherwise (setting debug_mode:false would also enable DebugView)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

External services require manual configuration before GA4 analytics works in production:

1. **Create GA4 property** at analytics.google.com — obtain Measurement ID (format: G-XXXXXXXXXX)
2. **Set environment variable:** `NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX` in Vercel production environment (NOT preview)
3. **Set Shopify domain:** `NEXT_PUBLIC_SHOPIFY_DOMAIN=your-store.myshopify.com` in Vercel environment
4. **GA4 Admin cross-domain config:** Admin > Data Streams > [Web stream] > Configure tag settings > Configure your domains — add both `pure-blinds.nl` and the Shopify domain

## Next Phase Readiness
- Analytics module ready for Phase 24 (e-commerce events): import `sendGtagEvent` from `@/lib/analytics/gtag` or add new functions to `src/lib/analytics/index.ts`
- Analytics module ready for Phase 25 (consent): add `updateConsent()` function to `src/lib/analytics/index.ts` — consent update calls `window.gtag('consent', 'update', {...})`
- AnalyticsProvider fires page_view in dev (console) and production (GA4) — foundation is verified via build passing cleanly

---
*Phase: 23-ga4-foundation*
*Completed: 2026-02-22*

## Self-Check: PASSED

- FOUND: src/lib/analytics/gtag.ts
- FOUND: src/lib/analytics/index.ts
- FOUND: src/components/analytics/analytics-provider.tsx
- FOUND: src/app/layout.tsx
- FOUND: 23-01-SUMMARY.md
- FOUND commit: 3106394 (Task 1)
- FOUND commit: 8b0a279 (Task 2)
