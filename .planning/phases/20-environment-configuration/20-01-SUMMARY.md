---
phase: 20-environment-configuration
plan: 01
subsystem: infra
tags: [zod, env-validation, shopify, typescript]

# Dependency graph
requires:
  - phase: 11-catalog
    provides: Product catalog and types that held shopifyProductId/shopifyVariantId fields
  - phase: 05-checkout
    provides: Draft Order creation using Shopify variant IDs
provides:
  - SHOPIFY_PRODUCT_MAP env var with Zod JSON validation and GID format checks
  - getShopifyIds() catalog helper resolving Shopify IDs from env
  - Product type without hardcoded Shopify fields
  - products.json as pure product metadata with zero Shopify IDs
affects: [shopify, draft-order, environment, deployment, ci]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zod .transform().pipe() pattern for JSON env var parsing and validation"
    - "Env-driven Shopify ID resolution via SHOPIFY_PRODUCT_MAP JSON object"
    - "Single env var encoding N product mappings (scales better than 2N individual vars)"

key-files:
  created:
    - .env.example
  modified:
    - src/lib/env.ts
    - src/lib/product/types.ts
    - src/lib/product/catalog.ts
    - src/lib/shopify/draft-order.ts
    - data/products.json
    - .env.prod
    - .github/workflows/ci.yml

key-decisions:
  - "SHOPIFY_PRODUCT_MAP stored as JSON-encoded env var rather than 2N individual vars for catalog scalability"
  - ".env.example is gitignored per project convention (prior PR explicitly removed it from tracking)"
  - "Zod .transform().pipe() validates both JSON parseability and GID format (startsWith gid://shopify/Product/ and gid://shopify/ProductVariant/)"
  - "getShopifyIds returns undefined for unmapped products rather than throwing, preserving draft order resilience"

patterns-established:
  - "Env-driven external IDs: Any external system IDs (Shopify, payment processors, etc.) should live in env vars, not JSON data files"
  - "Zod JSON env var: .string().transform(JSON.parse).pipe(z.record(...)) pattern for complex structured env vars"

requirements-completed: [ENV-01, ENV-02]

# Metrics
duration: 3min
completed: 2026-02-19
---

# Phase 20 Plan 01: Environment Configuration Summary

**SHOPIFY_PRODUCT_MAP JSON env var with Zod GID validation extracts all Shopify IDs from products.json, enabling dev/prod store switching via environment without code changes**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-19T14:14:08Z
- **Completed:** 2026-02-19T14:16:41Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Extracted all hardcoded Shopify GIDs from products.json into a single JSON-encoded env var SHOPIFY_PRODUCT_MAP
- Added Zod validation that parses SHOPIFY_PRODUCT_MAP JSON and validates GID format at startup (build fails if missing or malformed)
- Updated draft-order.ts to resolve Shopify variant IDs via getShopifyIds() from env instead of catalog
- Added SHOPIFY_PRODUCT_MAP to CI build job so Zod validation runs at build time in GitHub Actions

## Task Commits

Each task was committed atomically:

1. **Task 1: Add SHOPIFY_PRODUCT_MAP env var with Zod validation and update product catalog** - `6ee095e` (feat)
2. **Task 2: Update Draft Order to use env-based IDs and create .env.example** - `cbccfe6` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/lib/env.ts` - Added SHOPIFY_PRODUCT_MAP Zod field with JSON parse + GID format validation; exported ShopifyProductMap type
- `src/lib/product/types.ts` - Removed shopifyProductId and shopifyVariantId from Product interface
- `src/lib/product/catalog.ts` - Added getShopifyIds(productId) function resolving from env.SHOPIFY_PRODUCT_MAP
- `src/lib/shopify/draft-order.ts` - Replaced getProduct/shopifyVariantId with getShopifyIds/variantId from env
- `data/products.json` - Removed all shopifyProductId and shopifyVariantId fields from both product entries
- `.env.example` - Created with documented SHOPIFY_PRODUCT_MAP placeholder format (gitignored per project convention)
- `.env.prod` - Added SHOPIFY_PRODUCT_MAP with production GIDs; removed stale SHOPIFY_PRODUCT_ID
- `.github/workflows/ci.yml` - Added SHOPIFY_PRODUCT_MAP to build job env from secrets

## Decisions Made

- SHOPIFY_PRODUCT_MAP stored as a single JSON-encoded env var rather than 2N individual vars (e.g., SHOPIFY_PRODUCT_ID_ROLLER_BLIND_WHITE). This scales better as catalog grows.
- `.env.example` is gitignored per project convention — a prior PR (#10) explicitly removed it from tracking.
- Zod `.transform().pipe()` pattern used to both parse JSON and validate the structure including GID format in one schema definition.
- `getShopifyIds` returns `undefined` for unmapped products rather than throwing — preserves draft order resilience for products not yet set up in Shopify.

## Deviations from Plan

None - plan executed exactly as written. Note: `.env.example` was created locally as specified but cannot be committed due to `.env*` pattern in `.gitignore` (project convention per prior PR #10 that explicitly removed env.example from tracking).

## Issues Encountered

- `.env.example` and `.env.prod` are gitignored via `.env*` pattern in `.gitignore`. The plan specified creating these files and they exist locally, but only the draft-order.ts and ci.yml changes were committed. This is consistent with project convention.

## User Setup Required

Manual steps required before deploying:

1. Add `SHOPIFY_PRODUCT_MAP` as a GitHub Actions secret (for CI build job):
   ```
   SHOPIFY_PRODUCT_MAP={"roller-blind-white":{"productId":"gid://shopify/Product/9275201487085","variantId":"gid://shopify/ProductVariant/49390577025261"},"roller-blind-black":{"productId":"gid://shopify/Product/9275201487085","variantId":"gid://shopify/ProductVariant/49390787821805"}}
   ```

2. Add `SHOPIFY_PRODUCT_MAP` to Vercel environment variables (production and preview).

3. Add `SHOPIFY_PRODUCT_MAP` to local `.env.local` for development (use dev store GIDs).

## Next Phase Readiness

- Shopify ID resolution is fully environment-driven — same codebase works for dev and prod stores
- Build-time Zod validation catches missing or malformed SHOPIFY_PRODUCT_MAP before deployment
- products.json is now clean product metadata with zero external system IDs
- Ready to add more products to the catalog by only updating SHOPIFY_PRODUCT_MAP env var per environment

---
*Phase: 20-environment-configuration*
*Completed: 2026-02-19*
