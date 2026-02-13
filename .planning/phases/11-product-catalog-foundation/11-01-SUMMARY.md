---
phase: 11-product-catalog-foundation
plan: 01
subsystem: product-catalog
tags: [product-types, pricing-refactor, data-model, json-catalog]
requires:
  - phase-01-core-pricing-engine
  - phase-05-cart-checkout-flow
provides:
  - product-catalog-json-with-shopify-ids
  - per-product-pricing-matrices
  - pure-pricing-calculator-accepting-matrix-param
  - pricing-matrix-loader
affects:
  - 11-02 (will consume catalog and update API route)
  - 12-product-pages (will use catalog for rendering)
  - 13-cart-enhancement (will use productId in cart items)
tech-stack:
  added: []
  patterns:
    - pure-function-pricing-calculator
    - json-based-product-catalog
    - file-system-matrix-loading
key-files:
  created:
    - data/products.json
    - data/pricing/rollerblinds-white.json
    - data/pricing/rollerblinds-black.json
    - data/pricing/venetian-blinds-25mm.json
    - data/pricing/custom-textile.json
    - src/lib/product/types.ts
    - src/lib/product/catalog.ts
    - src/lib/pricing/loader.ts
  modified:
    - src/lib/product/data.ts
    - src/lib/pricing/calculator.ts
decisions:
  - id: CATALOG-01
    title: Product catalog as JSON file instead of database
    context: Need to store 4 products with Shopify IDs and pricing matrix references
    decision: Use data/products.json with direct JSON imports in catalog.ts
    rationale: Simple, fast, no database needed for 4 products. TypeScript type safety via type assertion. Easy to version control and deploy.
    alternatives: Database (PostgreSQL/Prisma), API, or keep inline in TypeScript
    consequences: Manual JSON editing for product updates. Migration to database later if catalog grows beyond ~20 products.

  - id: CATALOG-02
    title: Backward compatibility layer in data.ts
    context: Existing product pages import from @/lib/product/data
    decision: Convert data.ts to thin adapter delegating to catalog module
    rationale: Prevents breaking existing code. Updates to new catalog happen incrementally in Plan 02.
    alternatives: Update all consumers immediately (risky), or duplicate data
    consequences: Temporary indirection. Removed in Plan 02 after API route update.

  - id: PRICING-01
    title: Pricing calculator as pure function with matrix parameter
    context: Need to support multiple products with different pricing matrices
    decision: Refactor calculatePrice(width, height) to calculatePrice(pricingMatrix, width, height)
    rationale: True pure function with zero module-level data imports. Any product's matrix can be passed in. Maintains "pricing engine has zero Shopify dependencies" principle.
    alternatives: Keep global matrix and add productId parameter (couples to catalog), or create separate calculator per product
    consequences: API route must load matrix and pass it in. Breaking change handled in Plan 02.
metrics:
  duration: 197s
  tasks-completed: 2
  files-created: 8
  files-modified: 2
  commits: 2
  completed: 2026-02-13
---

# Phase 11 Plan 01: Product Catalog Foundation Summary

**One-liner:** JSON product catalog with Shopify IDs, per-product pricing matrices, and pure pricing calculator accepting matrix parameter.

## Objective

Create the multi-product data model and refactor the pricing engine to accept any product's pricing matrix as a parameter. Establishes foundation for multi-product support with clean separation between product catalog and pricing logic.

## What Was Built

### 1. Product Catalog Data Model

**Created:**
- `data/products.json` — Product catalog with 4 products (rollerblinds-white, rollerblinds-black, venetian-blinds-25mm, custom-textile)
- `src/lib/product/types.ts` — Product and ProductCatalog TypeScript interfaces
- `src/lib/product/catalog.ts` — Catalog loading utilities (getProduct, getAllProducts, getProductsByCategory)

**Structure:**
Each product includes:
- `id`: Canonical product identifier (e.g., 'rollerblinds-white')
- `slug`: URL-friendly identifier for routing
- `category`: Product category (rollerblinds, venetian-blinds, textiles)
- `pricingMatrixPath`: Path to pricing matrix JSON (e.g., '/data/pricing/rollerblinds-white.json')
- `shopifyProductId`: Shopify Product GID (placeholder for now)
- `shopifyVariantId`: Shopify ProductVariant GID (placeholder for now)
- `details`: Product specifications array

**Backward Compatibility:**
Updated `src/lib/product/data.ts` as thin adapter layer delegating to catalog module. Maintains existing exports (getProduct, getAllProductIds, getProductsByCategory) for existing consumers.

### 2. Per-Product Pricing Matrices

**Created:**
- `data/pricing/rollerblinds-white.json`
- `data/pricing/rollerblinds-black.json`
- `data/pricing/venetian-blinds-25mm.json`
- `data/pricing/custom-textile.json`

Each matrix copied from existing `data/pricing-matrix.json` with updated description. Pricing values identical for now — differentiation can happen later.

### 3. Refactored Pricing Calculator

**Modified `src/lib/pricing/calculator.ts`:**
- Removed module-level import of `pricing-matrix.json`
- Changed signature: `calculatePrice(width, height)` → `calculatePrice(pricingMatrix, width, height)`
- Replaced all `pricing.` references with `pricingMatrix.` parameter
- Now a pure function with zero data file imports

**Created `src/lib/pricing/loader.ts`:**
- Server-side pricing matrix file loader
- `loadPricingMatrix(matrixPath: string): Promise<PricingMatrixData>`
- Reads matrix files from filesystem given path
- Node.js fs/path imports — server-side only

## Technical Implementation

**Type Safety:**
- All JSON imports use type assertions (`as ProductCatalog`, `as PricingMatrixData`)
- Maintains TypeScript type safety throughout

**Import Strategy:**
- Product catalog uses direct JSON import (`import catalogData from '../../../data/products.json'`)
- Pricing matrices loaded dynamically via fs.readFile (server-side only)

**Pure Functions:**
- Pricing calculator has zero module-level side effects
- Can be tested with any matrix, no mocking required

## Known Issues

**Expected TypeScript Error:**
`src/app/api/pricing/route.ts(25,29): error TS2554: Expected 3 arguments, but got 2.`

This is expected. The API route still calls `calculatePrice(width, height)` with old 2-parameter signature. Plan 02 updates the API route to load the matrix and pass it in.

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

### CATALOG-01: Product catalog as JSON file
- Chose JSON over database for simplicity (4 products don't justify DB overhead)
- Direct imports for fast access, no I/O per request
- Type-safe via TypeScript type assertions
- Trade-off: Manual JSON editing for updates

### CATALOG-02: Backward compatibility layer
- Kept data.ts as adapter to avoid breaking existing imports
- Allows incremental migration in Plan 02
- Temporary indirection removed after API route update

### PRICING-01: Pure function with matrix parameter
- True pure function — zero module-level data imports
- Any matrix can be passed in (multi-product support)
- Maintains "pricing engine zero Shopify dependencies" principle
- Trade-off: Callers must load matrix (handled by loader.ts)

## Testing Notes

**Manual Verification:**
- TypeScript compilation: 1 expected error in API route
- File structure verified: all JSON files created
- Catalog exports verified: getProduct, getAllProducts, getProductsByCategory
- Calculator exports verified: calculatePrice, normalizeDimension, dimensionToIndex, formatPrice
- Loader exports verified: loadPricingMatrix

**Automated Tests:**
Not required for this plan (data model creation). Plan 02 adds integration tests for API route using new catalog.

## Next Phase Readiness

**Blockers:** None

**Concerns:** None

**Prerequisites for Plan 02:**
- Product catalog JSON ✅
- Per-product pricing matrices ✅
- Pure pricing calculator ✅
- Pricing matrix loader ✅

**What Plan 02 Will Do:**
1. Update API route to accept productId parameter
2. Load correct pricing matrix via loadPricingMatrix
3. Pass matrix to calculatePrice
4. Update product pages to pass productId
5. Remove backward compatibility adapter in data.ts
6. Delete old `data/pricing-matrix.json`

## Files Changed

**Created (8 files):**
- data/products.json (316 lines)
- data/pricing/rollerblinds-white.json
- data/pricing/rollerblinds-black.json
- data/pricing/venetian-blinds-25mm.json
- data/pricing/custom-textile.json
- src/lib/product/types.ts (18 lines)
- src/lib/product/catalog.ts (19 lines)
- src/lib/pricing/loader.ts (29 lines)

**Modified (2 files):**
- src/lib/product/data.ts (backward compatibility adapter)
- src/lib/pricing/calculator.ts (pure function with matrix param)

## Commits

- `9cb23af` - feat(11-01): create product catalog data model with types and JSON data files
- `0b0cf3b` - refactor(11-01): refactor pricing calculator to accept matrix parameter

## Performance

- Duration: 197s (3m 17s)
- Tasks: 2/2 completed
- Files created: 8
- Files modified: 2
- Commits: 2

---

**Status:** ✅ Complete
**Next:** Plan 02 - Update API route and consumers to use product catalog
