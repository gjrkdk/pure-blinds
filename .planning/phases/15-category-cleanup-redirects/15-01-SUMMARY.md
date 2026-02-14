---
phase: 15-category-cleanup-redirects
plan: 01
subsystem: product-catalog
tags: [cleanup, redirects, types, migration]
dependency_graph:
  requires:
    - product-catalog
    - cart-store
    - next-config
  provides:
    - roller-blinds-only-catalog
    - category-redirects
    - cart-v4-migration
  affects:
    - product-types
    - footer-navigation
    - products-page
tech_stack:
  added: []
  patterns:
    - literal-union-types
    - cart-migration-versioning
    - 301-redirects
key_files:
  created: []
  modified:
    - next.config.mjs
    - data/products.json
    - src/lib/product/types.ts
    - src/lib/product/catalog.ts
    - src/lib/product/data.ts
    - src/lib/cart/store.ts
    - src/app/products/page.tsx
    - src/components/layout/footer.tsx
  deleted:
    - src/app/products/venetian-blinds/page.tsx
    - src/app/products/textiles/page.tsx
    - data/pricing/venetian-blinds-25mm.json
    - data/pricing/custom-textile.json
decisions:
  - decision: Use 301 (not 308) redirects via statusCode property
    rationale: User preference for 301 redirects; Next.js permanent:true defaults to 308
    alternatives: [permanent:true (308), none]
    impact: SEO equity preserved with explicit 301 status
  - decision: Cart version 4 migration filters invalid products silently
    rationale: Prevents checkout errors from stale cart items for deleted products
    alternatives: [clear entire cart, show user warning]
    impact: Better UX - users don't lose valid cart items
  - decision: Literal union types for Category and Subcategory
    rationale: TypeScript compile-time enforcement of roller-blinds-only catalog
    alternatives: [runtime validation only, keep string types]
    impact: Type safety prevents invalid category references
metrics:
  duration_seconds: 205
  completed_at: "2026-02-14T13:50:14Z"
  tasks_completed: 2
  files_modified: 8
  files_deleted: 4
---

# Phase 15 Plan 01: Category Cleanup & Redirects Summary

Remove venetian-blinds and textiles categories with 301 redirects and type-safe roller-blinds-only catalog

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add redirects, delete routes and pricing, update catalog | 16df57e | next.config.mjs, data/products.json, deleted 4 files |
| 2 | Narrow types, update catalog, add cart migration, clean UI | e326336 | types.ts, catalog.ts, data.ts, store.ts, page.tsx, footer.tsx |

## Objective Achievement

Successfully removed venetian-blinds and textiles categories from all infrastructure while preserving SEO equity through 301 redirects and preventing stale cart items from breaking checkout.

**Outcome:**
- Clean roller-blinds-only product catalog with 2 products remaining
- All old category/product URLs redirect to /products with 301 status
- TypeScript enforces roller-blinds as only valid category at compile time
- Cart migration v4 silently removes items for deleted products
- Products page shows only Roller Blinds category
- Footer navigation cleaned of removed category links

## Implementation Details

### Task 1: Infrastructure Cleanup
1. **Redirects (next.config.mjs)**: Added 4 redirect rules using `statusCode: 301` (not `permanent: true` which defaults to 308):
   - `/products/venetian-blinds` -> `/products`
   - `/products/venetian-blinds/:path*` -> `/products`
   - `/products/textiles` -> `/products`
   - `/products/textiles/:path*` -> `/products`

2. **Route deletion**: Removed entire directories for venetian-blinds and textiles routes

3. **Pricing data**: Deleted venetian-blinds-25mm.json and custom-textile.json

4. **Product catalog**: Updated products.json to contain only 2 roller-blind products, updated lastUpdated to 2026-02-14

### Task 2: Type Safety & UI Cleanup
1. **TypeScript types**: Added literal union types:
   - `Category = 'roller-blinds'`
   - `Subcategory = 'transparent-roller-blinds' | 'blackout-roller-blinds'`
   - Updated Product interface to use these types

2. **Catalog functions**: Updated signatures to use typed Category and Subcategory parameters

3. **Cart migration**: Bumped version 3 -> 4 with migration that filters out items whose productId doesn't resolve via `getProduct()`. Logs warning if items removed.

4. **Products page**: Removed venetian-blinds and textiles from categories array (1 category remains)

5. **Footer**: Removed Venetian Blinds and Textiles links (4 links remain)

## Verification Results

All verification checks passed:

1. Build completed without TypeScript or compilation errors
2. All 4 redirect URLs return HTTP 301 to /products:
   - /products/venetian-blinds -> 301
   - /products/venetian-blinds/venetian-blinds-25mm -> 301
   - /products/textiles -> 301
   - /products/textiles/custom-textile -> 301
3. data/products.json contains exactly 2 products
4. data/pricing/ contains exactly 2 files (roller-blind-white.json, roller-blind-black.json)
5. No route directories exist for venetian-blinds or textiles
6. `grep -ri "venetian|textiles" src/lib/product/` returns no matches
7. Products page renders single Roller Blinds category card
8. Footer contains 4 links (no removed categories)

## Deviations from Plan

None - plan executed exactly as written.

## Success Criteria Met

- Venetian blinds completely removed from data, routes, types, and navigation
- Textiles completely removed from data, routes, types, and navigation
- All removed URLs return 301 redirects to /products
- Cart migration handles stale items silently
- TypeScript enforces roller-blinds-only catalog at compile time
- Application builds and runs without errors

## Self-Check: PASSED

### Created Files
All expected files verified:
- FOUND: /Users/robinkonijnendijk/Desktop/pure-blinds/.planning/phases/15-category-cleanup-redirects/15-01-SUMMARY.md

### Modified Files
All expected files exist:
- FOUND: /Users/robinkonijnendijk/Desktop/pure-blinds/next.config.mjs
- FOUND: /Users/robinkonijnendijk/Desktop/pure-blinds/data/products.json
- FOUND: /Users/robinkonijnendijk/Desktop/pure-blinds/src/lib/product/types.ts
- FOUND: /Users/robinkonijnendijk/Desktop/pure-blinds/src/lib/product/catalog.ts
- FOUND: /Users/robinkonijnendijk/Desktop/pure-blinds/src/lib/product/data.ts
- FOUND: /Users/robinkonijnendijk/Desktop/pure-blinds/src/lib/cart/store.ts
- FOUND: /Users/robinkonijnendijk/Desktop/pure-blinds/src/app/products/page.tsx
- FOUND: /Users/robinkonijnendijk/Desktop/pure-blinds/src/components/layout/footer.tsx

### Commits
All expected commits exist:
- FOUND: 16df57e (feat(15-01): remove venetian-blinds and textiles categories)
- FOUND: e326336 (refactor(15-01): enforce roller-blinds-only types and clean UI)

### Deleted Files
All expected files deleted:
- MISSING (as expected): /Users/robinkonijnendijk/Desktop/pure-blinds/src/app/products/venetian-blinds/page.tsx
- MISSING (as expected): /Users/robinkonijnendijk/Desktop/pure-blinds/src/app/products/textiles/page.tsx
- MISSING (as expected): /Users/robinkonijnendijk/Desktop/pure-blinds/data/pricing/venetian-blinds-25mm.json
- MISSING (as expected): /Users/robinkonijnendijk/Desktop/pure-blinds/data/pricing/custom-textile.json
