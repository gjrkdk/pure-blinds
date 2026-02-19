---
phase: 19-bug-fixes
plan: 01
subsystem: infra
tags: [env-vars, shopify, seo, pricing, metadata]

# Dependency graph
requires:
  - phase: 15-18-dutch-seo
    provides: NEXT_PUBLIC_BASE_URL as canonical env var (FIX-01 context)
provides:
  - Consistent NEXT_PUBLIC_BASE_URL usage across all source files
  - Removed dead SHOPIFY_PRODUCT_ID from env validation and CI
  - Correct EUR currency metadata in all pricing JSON files
  - Correct pure-blinds.nl domain in all fallbacks and email addresses
affects: [20-performance, 21-checkout-verification, 22-launch]

# Tech tracking
tech-stack:
  added: []
  patterns: [All env var lookups use NEXT_PUBLIC_BASE_URL with pure-blinds.nl fallback]

key-files:
  created: []
  modified:
    - src/app/page.tsx
    - src/app/blog/[slug]/page.tsx
    - src/app/producten/[...slug]/page.tsx
    - src/lib/env.ts
    - .github/workflows/ci.yml
    - data/pricing/roller-blind-white.json
    - data/pricing/roller-blind-black.json
    - data/pricing-matrix.json
    - src/app/layout.tsx
    - src/app/robots.ts
    - src/app/sitemap.ts
    - src/lib/schema/organization.ts
    - src/components/home/contact-section.tsx

key-decisions:
  - "SHOPIFY_PRODUCT_ID removed entirely from env validation and CI - product IDs come from catalog since Phase 11"
  - "All domain fallbacks standardized to pure-blinds.nl (the actual production domain)"
  - "Pricing JSON currency metadata corrected to EUR - Shopify Draft Orders already used EUR since Phase 5"

patterns-established:
  - "Env var pattern: process.env.NEXT_PUBLIC_BASE_URL || 'https://pure-blinds.nl'"

requirements-completed: [FIX-01, FIX-02, FIX-03, FIX-04]

# Metrics
duration: 2min
completed: 2026-02-19
---

# Phase 19 Plan 01: Bug Fixes Summary

**Four env/config bugs eliminated: NEXT_PUBLIC_SITE_URL replaced with NEXT_PUBLIC_BASE_URL, dead SHOPIFY_PRODUCT_ID removed from Zod schema and CI, all pricing JSON currency corrected from USD to EUR, and all domain fallbacks/emails updated from pureblinds.nl to pure-blinds.nl**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-19T13:46:56Z
- **Completed:** 2026-02-19T13:49:46Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Zero remaining references to stale `NEXT_PUBLIC_SITE_URL` in source code
- Removed dead `SHOPIFY_PRODUCT_ID` from Zod env schema and CI workflow — app builds without this secret
- All three pricing JSON files now declare `"currency": "EUR"` matching the Shopify Draft Order currency
- All domain fallbacks and email addresses now use `pure-blinds.nl` (the actual registered domain)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix env var references and remove dead config (FIX-01, FIX-02)** - `7737247` (fix)
2. **Task 2: Correct pricing currency and domain fallbacks (FIX-03, FIX-04)** - `554186d` (fix)

## Files Created/Modified
- `src/app/page.tsx` - NEXT_PUBLIC_SITE_URL -> NEXT_PUBLIC_BASE_URL, pureblinds.nl -> pure-blinds.nl
- `src/app/blog/[slug]/page.tsx` - NEXT_PUBLIC_SITE_URL -> NEXT_PUBLIC_BASE_URL, pureblinds.nl -> pure-blinds.nl
- `src/app/producten/[...slug]/page.tsx` - NEXT_PUBLIC_SITE_URL -> NEXT_PUBLIC_BASE_URL, pureblinds.nl -> pure-blinds.nl
- `src/lib/env.ts` - Removed SHOPIFY_PRODUCT_ID from Zod envSchema
- `.github/workflows/ci.yml` - Removed SHOPIFY_PRODUCT_ID from build job env block
- `data/pricing/roller-blind-white.json` - currency USD -> EUR
- `data/pricing/roller-blind-black.json` - currency USD -> EUR
- `data/pricing-matrix.json` - currency USD -> EUR
- `src/app/layout.tsx` - metadataBase fallback pureblinds.nl -> pure-blinds.nl
- `src/app/robots.ts` - baseUrl fallback pureblinds.nl -> pure-blinds.nl
- `src/app/sitemap.ts` - baseUrl fallback pureblinds.nl -> pure-blinds.nl
- `src/lib/schema/organization.ts` - email info@pureblinds.nl -> info@pure-blinds.nl
- `src/components/home/contact-section.tsx` - mailto href and visible email pureblinds.nl -> pure-blinds.nl

## Decisions Made
- `SHOPIFY_PRODUCT_ID` removed entirely from env validation and CI — product IDs come from the catalog since Phase 11, this secret was never needed at build time
- Pricing JSON currency metadata corrected to EUR — the Shopify Draft Orders API already used EUR since Phase 5, the JSON metadata simply was never updated to match

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All four pre-production bugs are resolved
- Codebase is clean: consistent env vars, correct currency metadata, correct domain
- Ready for Phase 20 (Performance) and Phase 21 (Checkout Verification)

---
*Phase: 19-bug-fixes*
*Completed: 2026-02-19*
