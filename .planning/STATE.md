# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-22)

**Core value:** Customers can order custom-dimension roller blinds with accurate matrix-based pricing that works reliably through Shopify checkout on all plan tiers.
**Current focus:** v1.5 Analytics & Privacy — Phase 25: Cookie Consent

## Current Position

Phase: 25 of 25 (Cookie Consent Banner) — IN PROGRESS
Plan: 2/2 — awaiting checkpoint:human-verify
Status: Checkpoint — visual verification required
Last activity: 2026-02-26 — Completed 25-02 task 1 (privacybeleid page), pending visual verification

Progress: [█████████░] 90% (v1.5)

## Performance Metrics

**Velocity:**
- Total plans completed: 37
- Total v1.1 execution time: 465s (7m 45s)
- Total v1.2 execution time: 1,481s (24m 41s)
- Total v1.3 execution time: 1,180s (19m 40s)
- Total v1.4 execution time: ~194s (3m 14s)

**By Milestone:**

| Milestone | Phases | Plans | Total Time | Avg/Plan |
|-----------|--------|-------|------------|----------|
| v1.0 MVP | 1-5 | 9 | ~3 days | ~53 min |
| v1.1 Homepage | 6-10 | 5 | 465s (7.75m) | 93s |
| v1.2 Catalog | 11-14 | 6 | 1,481s (24.7m) | 247s |
| v1.3 Dutch/SEO | 15-18 | 9 | 1,180s (19.7m) | 131s |
| v1.4 Production Ready | 19-22 | 6 | ~194s (3.2m) | ~32s |
| Phase 23-ga4-foundation P01 | 105 | 2 tasks | 4 files |
| Phase 24-e-commerce-events P01 | 98 | 2 tasks | 2 files |
| Phase 24-e-commerce-events P02 | 81 | 2 tasks | 3 files |

## Accumulated Context

### Decisions

All decisions logged in PROJECT.md Key Decisions table.

Recent decisions affecting current work:
- v1.5 planning: Load gtag.js unconditionally with all 4 Consent Mode v2 parameters defaulted to "denied" — do NOT use @next/third-parties GoogleAnalytics component (no Consent Mode v2 support as of v16.1.6)
- v1.5 planning: Use vanilla-cookieconsent@3.1.0 for banner UI — zero dependencies, native Consent Mode v2 signal mapping
- v1.5 planning: sessionStorage cart snapshot before checkout redirect is the only mechanism for purchase event items data (cart is cleared before redirect)
- Phase 23-01: Guard analytics on NEXT_PUBLIC_GA4_ID presence (not NODE_ENV) — Vercel preview deployments have NODE_ENV=production, env var is only set in production
- Phase 23-01: AnalyticsProvider mounted unconditionally outside GA_MEASUREMENT_ID conditional for dev console logging
- Phase 23-01: Three separate Script tags in root layout for Consent Mode v2 ordering (consent-init inline → gtag.js CDN → config+linker)
- Phase 24-01: GA4EcommerceItem price is EUR decimal — callers divide cents by 100 at call site, not inside the function
- Phase 24-01: useRef(false) guard in DimensionConfigurator ensures view_item fires exactly once per product page visit even when dimensions change
- Phase 24-01: item_category hardcoded to 'rolgordijnen' — all current products are roller blinds
- Phase 24-02: transactionId generated client-side at checkout click (pb-{timestamp}-{random5}) — Shopify order ID not accessible cross-domain
- Phase 24-02: sessionStorage snapshot written BEFORE clearCart() — cart store clears synchronously, items empty after
- Phase 24-02: _gl decoration via window.google_tag_data.glBridge.generate() with graceful degradation
- Phase 24-02: PurchaseTracker dual-layer dedup: sessionStorage (refresh) + localStorage (cross-session/bookmark)
- Phase 25-02: preferencesModal: { sections: [] } added to CookieConsentBanner to satisfy vanilla-cookieconsent Translation TypeScript type — modal not shown to users for simple accept/reject banner
- Phase 25-02: prose prose-sm Tailwind typography classes used for privacy policy body text — @tailwindcss/typography plugin already installed in globals.css

### Pending Todos

Carried from v1.0:
- Add Phase 3 verification documentation (process gap from v1.0 audit)
- Create test products in Shopify store (deferred from Phase 1)
- Add unit tests for pricing calculator and cart store actions
- Pricing matrix reference in Draft Order custom attributes (ORDER-04 deferred)

Deployment action required:
- Add SHOPIFY_PRODUCT_MAP as GitHub Actions secret for CI build
- Add SHOPIFY_PRODUCT_MAP to Vercel environment variables (production and preview)

### Blockers/Concerns

Research flags for execution:
- Phase 24 (purchase event): Validate whether sessionStorage snapshot survives Shopify cross-domain redirect back to /bevestiging — requires a real test checkout in DevTools
- Phase 25 (consent restoration): Confirm vanilla-cookieconsent cookie name/format before deciding between server-side and client-side consent restoration approach

## Session Continuity

Last session: 2026-02-26
Stopped at: 25-02-PLAN.md Task 2 (checkpoint:human-verify) — privacybeleid page created, awaiting visual verification of complete consent banner flow
Resume file: None
Next step: User visual verification of cookie consent banner + privacy page flow, then Phase 25 complete

---
*Last updated: 2026-02-26 after completing 25-02 Task 1 (privacybeleid page) — at checkpoint:human-verify*
