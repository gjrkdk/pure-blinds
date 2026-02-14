---
phase: quick-6
plan: 01
subsystem: catalog-navigation
tags: [seo, url-structure, routing]
dependency_graph:
  requires: [product-catalog, category-structure]
  provides: [hierarchical-urls, seo-friendly-paths]
  affects: [navigation, breadcrumbs, internal-links]
tech_stack:
  added: []
  patterns: [catch-all-routes, slug-based-routing]
key_files:
  created:
    - src/app/products/[...slug]/page.tsx
    - src/app/products/roller-blinds/page.tsx
    - src/app/products/roller-blinds/transparent-roller-blinds/page.tsx
    - src/app/products/roller-blinds/blackout-roller-blinds/page.tsx
  modified:
    - data/products.json
    - data/pricing/roller-blind-white.json
    - data/pricing/roller-blind-black.json
    - src/lib/product/catalog.ts
    - src/lib/product/types.ts
    - src/lib/cart/store.ts
    - src/app/products/page.tsx
    - src/app/products/venetian-blinds/page.tsx
    - src/app/products/textiles/page.tsx
    - src/components/layout/footer.tsx
    - src/app/cart/page.tsx
  deleted:
    - src/app/products/[productId]/page.tsx
    - src/app/products/rollerblinds/page.tsx
    - src/app/products/rollerblinds/transparent/page.tsx
    - src/app/products/rollerblinds/blackout/page.tsx
    - data/pricing/rollerblinds-white.json
    - data/pricing/rollerblinds-black.json
decisions:
  - Use Next.js catch-all routes for product detail pages
  - Hyphenate all URL segments for SEO consistency
  - Cart store version bump to 3 to clear old product IDs
  - Point cart "continue shopping" links to /products overview instead of specific product
metrics:
  duration: 263s
  tasks_completed: 2
  files_modified: 11
  files_created: 4
  files_deleted: 6
  commits: 2
completed: 2026-02-14
---

# Quick Task 6: Restructure Product URLs to Full Hierarchical Paths

**One-liner:** Implemented SEO-friendly hierarchical URLs with hyphenated slugs using Next.js catch-all routes - all products now accessible via `/products/[category]/[subcategory]/[product]` structure.

## Objective

Restructure product URLs from flat `/products/[productId]` to full hierarchical paths with hyphenated slugs: `/products/[category]/[subcategory]/[product]` for improved SEO and clearer information architecture.

## Tasks Completed

### Task 1: Update data layer - product IDs, slugs, pricing files, and catalog helpers
**Commit:** c37cac2

Updated the entire data layer to support hyphenated naming and hierarchical URL structure:

**Data changes:**
- Renamed pricing files: `rollerblinds-white.json` → `roller-blind-white.json`, `rollerblinds-black.json` → `roller-blind-black.json`
- Updated product IDs: `rollerblinds-white` → `roller-blind-white`, `rollerblinds-black` → `roller-blind-black`
- Updated product slugs to match new IDs
- Updated categories: `rollerblinds` → `roller-blinds`
- Updated subcategories: `transparent` → `transparent-roller-blinds`, `blackout` → `blackout-roller-blinds`
- Updated pricingMatrixPath references in products.json

**Code changes:**
- Added `getProductBySlug(slug: string)` helper to find products by URL slug
- Added `getProductUrl(product: Product)` helper to build hierarchical URLs automatically
- Bumped cart store version from 2 to 3 with migration to clear old product IDs

**Files modified:**
- data/products.json
- data/pricing/*.json (renamed)
- src/lib/product/catalog.ts
- src/lib/cart/store.ts

### Task 2: Restructure routes, update all pages and links to use hierarchical URLs
**Commit:** d8ba85c

Completely restructured the routing architecture to support hierarchical URLs:

**Route structure:**
- Created catch-all route at `[...slug]/page.tsx` for all product detail pages
  - Extracts product slug from last URL segment
  - Uses `getProductBySlug()` to find product
  - Builds dynamic breadcrumbs from URL hierarchy
  - Passes `product.id` (not slug) to DimensionConfigurator for pricing API

- Created new hyphenated category directory: `roller-blinds/`
  - Category page with links to subcategories
  - Two subcategory pages: `transparent-roller-blinds/` and `blackout-roller-blinds/`
  - All using `getProductUrl()` for product links

**Updated existing pages:**
- `venetian-blinds/page.tsx` - now uses `getProductUrl()` for product links
- `textiles/page.tsx` - now uses `getProductUrl()` for product links
- `products/page.tsx` - updated category to "Roller Blinds" with `/products/roller-blinds` href
- `footer.tsx` - updated link to "Roller Blinds" with hyphenated URL
- `cart/page.tsx` - changed empty cart and continue shopping links to `/products` overview

**Deleted old routes:**
- Removed `[productId]/page.tsx` (replaced by catch-all route)
- Removed `rollerblinds/` directory (replaced by `roller-blinds/`)

**Files modified:**
- src/app/products/[...slug]/page.tsx (created)
- src/app/products/roller-blinds/*.tsx (created)
- src/app/products/page.tsx
- src/app/products/venetian-blinds/page.tsx
- src/app/products/textiles/page.tsx
- src/components/layout/footer.tsx
- src/app/cart/page.tsx

## Verification

All verification criteria passed:

✅ **Build succeeds:** `npm run build` completed successfully with 23 static pages generated
✅ **TypeScript passes:** `npx tsc --noEmit` shows no errors
✅ **Product detail pages render at hierarchical URLs:**
  - `/products/roller-blinds/transparent-roller-blinds/roller-blind-white`
  - `/products/roller-blinds/blackout-roller-blinds/roller-blind-black`
  - `/products/venetian-blinds/venetian-blinds-25mm`
  - `/products/textiles/custom-textile`
✅ **Category pages render at hyphenated URLs:**
  - `/products/roller-blinds`
  - `/products/venetian-blinds`
  - `/products/textiles`
✅ **Subcategory pages render:**
  - `/products/roller-blinds/transparent-roller-blinds`
  - `/products/roller-blinds/blackout-roller-blinds`
✅ **Breadcrumbs show full hierarchy** on product detail pages
✅ **Footer links use hyphenated URLs** (`/products/roller-blinds`)
✅ **No references to old paths** (`/products/rollerblinds`) remain in codebase

## Deviations from Plan

None - plan executed exactly as written.

## Technical Details

**Routing architecture:**
- Next.js catch-all routes (`[...slug]`) handle all product detail pages
- Static routes for categories and subcategories take precedence over catch-all
- Route resolution order ensures no conflicts:
  1. Static category pages (e.g., `/products/roller-blinds`)
  2. Static subcategory pages (e.g., `/products/roller-blinds/transparent-roller-blinds`)
  3. Catch-all product detail pages (e.g., `/products/roller-blinds/transparent-roller-blinds/roller-blind-white`)

**SEO benefits:**
- URLs now reflect full product hierarchy
- All URL segments use hyphenated, lowercase slugs
- Breadcrumbs match URL structure exactly
- Internal linking structure is clear and semantic

**Data consistency:**
- Product IDs, slugs, categories, and subcategories all use consistent hyphenation
- Pricing file names match product IDs
- Cart store migration ensures users don't see stale items with old IDs

## Impact

**User-facing:**
- All product URLs are now SEO-friendly and human-readable
- Breadcrumbs accurately reflect navigation hierarchy
- Improved information architecture makes site structure clearer

**Developer-facing:**
- Simplified URL management with `getProductUrl()` helper
- Single catch-all route handles all product detail pages
- Type-safe slug-based routing with TypeScript validation
- Clean separation between categories, subcategories, and products

**Performance:**
- No performance impact - all routes pre-rendered at build time
- Build time: 1592ms compilation + 218ms static generation = ~2 seconds total

## Files Changed

**Created (4):**
- src/app/products/[...slug]/page.tsx
- src/app/products/roller-blinds/page.tsx
- src/app/products/roller-blinds/transparent-roller-blinds/page.tsx
- src/app/products/roller-blinds/blackout-roller-blinds/page.tsx

**Modified (11):**
- data/products.json
- data/pricing/roller-blind-white.json (renamed)
- data/pricing/roller-blind-black.json (renamed)
- src/lib/product/catalog.ts
- src/lib/cart/store.ts
- src/app/products/page.tsx
- src/app/products/venetian-blinds/page.tsx
- src/app/products/textiles/page.tsx
- src/components/layout/footer.tsx
- src/app/cart/page.tsx

**Deleted (6):**
- src/app/products/[productId]/page.tsx
- src/app/products/rollerblinds/page.tsx
- src/app/products/rollerblinds/transparent/page.tsx
- src/app/products/rollerblinds/blackout/page.tsx
- data/pricing/rollerblinds-white.json
- data/pricing/rollerblinds-black.json

## Self-Check

### Created Files Verification

```bash
# Verify new route exists
[ -f "src/app/products/[...slug]/page.tsx" ] && echo "FOUND: catch-all route"

# Verify new category structure exists
[ -f "src/app/products/roller-blinds/page.tsx" ] && echo "FOUND: roller-blinds category"
[ -f "src/app/products/roller-blinds/transparent-roller-blinds/page.tsx" ] && echo "FOUND: transparent subcategory"
[ -f "src/app/products/roller-blinds/blackout-roller-blinds/page.tsx" ] && echo "FOUND: blackout subcategory"

# Verify pricing files renamed
[ -f "data/pricing/roller-blind-white.json" ] && echo "FOUND: roller-blind-white.json"
[ -f "data/pricing/roller-blind-black.json" ] && echo "FOUND: roller-blind-black.json"
```

### Commits Verification

```bash
# Verify Task 1 commit exists
git log --oneline --all | grep -q "c37cac2" && echo "FOUND: c37cac2"

# Verify Task 2 commit exists
git log --oneline --all | grep -q "d8ba85c" && echo "FOUND: d8ba85c"
```

### Old Files Removed

```bash
# Verify old routes deleted
[ ! -d "src/app/products/[productId]" ] && echo "REMOVED: [productId] directory"
[ ! -d "src/app/products/rollerblinds" ] && echo "REMOVED: rollerblinds directory"

# Verify old pricing files deleted
[ ! -f "data/pricing/rollerblinds-white.json" ] && echo "REMOVED: rollerblinds-white.json"
[ ! -f "data/pricing/rollerblinds-black.json" ] && echo "REMOVED: rollerblinds-black.json"
```

## Self-Check: PASSED

All files created successfully. All commits exist. All old files removed. Build passes. Type check passes.
