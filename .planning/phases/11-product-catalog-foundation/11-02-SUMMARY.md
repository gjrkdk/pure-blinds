---
phase: 11-product-catalog-foundation
plan: 02
subsystem: api
tags: [pricing-api, cart, shopify-integration, zod-validation, product-catalog]

# Dependency graph
requires:
  - phase: 11-01
    provides: product catalog JSON, per-product pricing matrices, pure pricing calculator
provides:
  - pricing-api-with-productid-parameter
  - cart-human-readable-ids-with-migration
  - shopify-customattributes-with-product-metadata
affects:
  - 12-product-pages (will use updated pricing API)
  - 13-cart-enhancement (benefits from improved cart ID format)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - api-orchestration-pattern (route loads data, engine calculates)
    - cart-migration-via-zustand-persist-version
    - human-readable-cart-ids

key-files:
  created: []
  modified:
    - src/app/api/pricing/route.ts
    - src/lib/pricing/validator.ts
    - src/components/dimension-configurator.tsx
    - src/lib/cart/utils.ts
    - src/lib/cart/store.ts
    - src/lib/shopify/draft-order.ts

key-decisions:
  - "Renamed DimensionInputSchema to PricingRequestSchema (more accurate with productId field)"
  - "Cart ID format: ${productId}-${width}x${height} (human-readable for debugging)"
  - "Zustand persist v2 migration clears old-format carts (acceptable pre-launch)"
  - "Shopify customAttributes: capitalize keys, add cm units, include Product ID"

patterns-established:
  - "API orchestration: route handles I/O (load product, load matrix), engine handles calculation (pure function)"
  - "Cart migration: version bump + migrate function for breaking changes"
  - "404 for missing product or pricing data (clear HTTP semantics)"

# Metrics
duration: 124s
completed: 2026-02-13
---

# Phase 11 Plan 02: Multi-Product API Integration Summary

**Pricing API accepts productId and loads product-specific matrices, cart uses human-readable IDs with migration, Shopify draft orders include product metadata with units**

## Performance

- **Duration:** 124s (2m 4s)
- **Started:** 2026-02-13T[execution-start]
- **Completed:** 2026-02-13T[execution-end]
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Pricing API route orchestrates full flow: validate input, load product, load matrix, calculate price
- Cart item IDs use human-readable format (rollerblinds-white-100x150) instead of hashes
- Old-format carts automatically cleared via Zustand persist v2 migration
- Shopify draft orders include enhanced customAttributes: capitalized keys, cm units, Product ID
- Different products with identical dimensions create separate cart items (collision-free)
- TypeScript compiles cleanly with zero errors (calculator signature mismatch from 11-01 resolved)

## Task Commits

Each task was committed atomically:

1. **Task 1: Update pricing API route and validator to accept productId, update dimension configurator** - `7f6de46` (feat)
2. **Task 2: Update cart ID format, add migration, and enhance Shopify draft order customAttributes** - `ab92175` (feat)

## Files Created/Modified

- `src/app/api/pricing/route.ts` - Full orchestration: loads product and pricing matrix by productId, returns 404 for invalid product
- `src/lib/pricing/validator.ts` - Renamed to PricingRequestSchema with productId field (width, height validation unchanged)
- `src/components/dimension-configurator.tsx` - Sends productId in API request body, handles 404 responses
- `src/lib/cart/utils.ts` - Changed generateCartItemId to human-readable format (productId-widthxheight)
- `src/lib/cart/store.ts` - Added version 2 with migrate function to clear old-format carts
- `src/lib/shopify/draft-order.ts` - Enhanced customAttributes: "Width" (with cm), "Height" (with cm), "Product ID"

## Decisions Made

### Validator Rename: DimensionInputSchema → PricingRequestSchema

**Context:** Adding productId field to validator schema
**Decision:** Rename to PricingRequestSchema (more accurate name)
**Rationale:** Schema now validates full pricing request (productId + dimensions), not just dimensions. Checked with grep - only route.ts imported it, safe to rename without backward compatibility.

### Cart ID Format: Human-Readable

**Context:** Need unique cart IDs that include productId to prevent collisions
**Decision:** Use `${productId}-${width}x${height}` format
**Rationale:** Readable for debugging (e.g., rollerblinds-white-150x200). Deterministic uniqueness. Same product+dimensions = same ID (allows quantity increment). Different products with same dimensions = different IDs (prevents collision).

### Cart Migration Strategy

**Context:** Old cart format incompatible with new productId-based IDs
**Decision:** Version bump to 2, migrate function clears old carts
**Rationale:** Acceptable for pre-launch app. Simple migration (no data transformation, just clear). Zustand persist middleware handles versioning automatically.

### Shopify customAttributes Enhancement

**Context:** Draft orders need dimension and product metadata
**Decision:** Capitalize keys ("Width", "Height"), add cm units, include "Product ID"
**Rationale:** Better display on Shopify orders/invoices (capitalized). Units prevent ambiguity. Product ID enables fulfillment team to identify catalog product.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed as specified. TypeScript compilation succeeded, production build passed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Blockers:** None

**Concerns:** None

**Prerequisites for Phase 12 (Product Pages):**
- Pricing API accepts productId ✅
- Cart supports multiple products ✅
- Dimension configurator sends productId ✅
- Product catalog with 4 products ✅

**What Phase 12 Will Do:**
1. Build product detail pages using catalog data
2. Category pages showing products by category
3. Product grid/list components
4. Remove placeholder content from existing product pages

**What Phase 13 Will Do:**
1. Enhanced cart UI showing product images and names from catalog
2. Cart persistence verification
3. Cart analytics/tracking

---
*Phase: 11-product-catalog-foundation*
*Completed: 2026-02-13*
