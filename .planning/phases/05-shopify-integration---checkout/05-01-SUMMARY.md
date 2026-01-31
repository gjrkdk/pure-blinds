---
phase: 05-shopify-integration---checkout
plan: 01
subsystem: payments
tags: [shopify, graphql, draft-order, checkout, admin-api]

# Dependency graph
requires:
  - phase: 01-project-setup
    provides: Fail-fast env validation pattern, Shopify Admin client
  - phase: 02-pricing-engine---validation
    provides: Thin API handler pattern
  - phase: 04-cart-management
    provides: CartItem type definition
provides:
  - Shopify Draft Order creation with custom line items
  - POST /api/checkout endpoint returning invoiceUrl
  - SHOPIFY_PRODUCT_ID environment validation
  - Locked pricing via originalUnitPriceWithCurrency
  - Dimension metadata storage as custom attributes
affects: [05-02, phase-06-order-confirmation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Custom line items for locked pricing (avoids variantId + price override API bug)
    - GraphQL userErrors checking in mutation responses
    - EUR currency for European textile shop

key-files:
  created:
    - src/lib/shopify/types.ts
    - src/lib/shopify/draft-order.ts
    - src/app/api/checkout/route.ts
  modified:
    - src/lib/env.ts
    - .env.local

key-decisions:
  - "Use custom line items with title only (no variantId) to avoid Shopify API price override bug"
  - "Include dimensions in line item title for clear order display"
  - "Store dimensions as custom attributes for fulfillment reference"
  - "Use EUR currency code for European market"
  - "Check userErrors array separately from GraphQL-level errors"

patterns-established:
  - "GraphQL mutation error handling: check userErrors for validation, catch GraphqlQueryError for network/auth"
  - "Line item format: [Product Name] - [Width]cm x [Height]cm"
  - "Custom attributes for metadata: width and height as separate key-value pairs"

# Metrics
duration: 2min
completed: 2026-01-31
---

# Phase 05 Plan 01: Checkout Backend Summary

**Shopify Draft Order API integration with custom line items, locked EUR pricing, and dimension metadata for checkout redirect**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-31T09:41:32Z
- **Completed:** 2026-01-31T09:43:40Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- SHOPIFY_PRODUCT_ID environment variable validation at startup (fail-fast pattern)
- createDraftOrder pure function with GraphQL draftOrderCreate mutation
- Custom line items with locked pricing (avoiding variantId + price override API bug)
- Dimension metadata stored as custom attributes for fulfillment
- POST /api/checkout thin handler returning Shopify invoiceUrl

## Task Commits

Each task was committed atomically:

1. **Task 1: Add SHOPIFY_PRODUCT_ID to env schema and .env.local** - `ce68628` (feat)
2. **Task 2: Create Draft Order function, types, and checkout API route** - `ba55b94` (feat)

## Files Created/Modified
- `src/lib/env.ts` - Added SHOPIFY_PRODUCT_ID to Zod schema for fail-fast validation
- `.env.local` - Added placeholder SHOPIFY_PRODUCT_ID (gitignored, not committed)
- `src/lib/shopify/types.ts` - TypeScript types for checkout flow (CheckoutRequest, CheckoutResponse, CheckoutErrorResponse)
- `src/lib/shopify/draft-order.ts` - Pure function creating Draft Orders via GraphQL with custom line items, locked pricing, dimension attributes
- `src/app/api/checkout/route.ts` - POST endpoint delegating to createDraftOrder, returns 400 for empty cart, 500 for API errors

## Decisions Made

1. **Use EUR currency code** - European textile shop context, matches store's base currency (not USD as in research examples)
2. **Custom line items only (no variantId)** - Avoids known Shopify API bug where price override is ignored when variantId is present (RESEARCH.md Pitfall 1)
3. **Dimensions in line item title** - Format: "Venetian Blinds 25mm - 100cm x 150cm" for clear display in Shopify admin and customer order view
4. **Custom attributes for fulfillment** - Separate width/height keys allow fulfillment team to extract dimensions programmatically
5. **User-friendly errors only** - Returns generic "Unable to process checkout" on 500 errors per CONTEXT.md decision, specific errors only for 400 validation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**TypeScript implicit 'any' error in userErrors mapping** - Fixed by adding inline type annotation: `(e: { field?: string[]; message: string }) => e.message`. This is necessary because GraphQL response types are dynamic and not generated from schema in this project.

## User Setup Required

**Environment variable configuration required:**

After checkout testing begins, replace the placeholder `SHOPIFY_PRODUCT_ID` in `.env.local` with an actual Shopify product ID:

1. Create a product in Shopify admin (any product works - pricing is overridden)
2. Get product ID from URL or GraphQL API
3. Update `.env.local`: `SHOPIFY_PRODUCT_ID=gid://shopify/Product/1234567890`
4. Restart dev server to pick up new env value

The app will fail at startup if this is not configured (fail-fast validation).

## Next Phase Readiness

Backend checkout pipeline complete and ready for:
- **Phase 05-02:** Cart page checkout button integration (client-side redirect flow)
- **Phase 06:** Order confirmation webhooks (Draft Order completion tracking)

**Blockers:** None

**Concerns:**
- Draft Order invoiceUrl expiration time is undocumented - assuming short-lived, redirecting immediately
- Mobile checkout flow not yet tested (will verify in 05-02 with actual button implementation)

**Technical debt:** None

---
*Phase: 05-shopify-integration---checkout*
*Completed: 2026-01-31*
