---
phase: quick-9
plan: 01
subsystem: product-catalog
tags:
  - i18n
  - seo
  - url-migration
  - redirects
dependency_graph:
  requires:
    - product-catalog-system
    - routing-infrastructure
  provides:
    - dutch-product-urls
    - seo-friendly-slugs
    - 301-redirect-coverage
  affects:
    - all-product-pages
    - navigation-components
    - blog-content
tech_stack:
  added: []
  patterns:
    - 301-permanent-redirects
    - dutch-url-slugs
    - breadcrumb-label-mapping
key_files:
  created:
    - src/app/producten/page.tsx
    - src/app/producten/rolgordijnen/page.tsx
    - src/app/producten/rolgordijnen/transparante-rolgordijnen/page.tsx
    - src/app/producten/rolgordijnen/verduisterende-rolgordijnen/page.tsx
    - src/app/producten/[...slug]/page.tsx
  modified:
    - data/products.json
    - src/lib/product/types.ts
    - src/lib/product/catalog.ts
    - src/lib/schema/product.ts
    - next.config.mjs
    - src/components/layout/header.tsx
    - src/components/layout/footer.tsx
    - src/app/cart/page.tsx
    - content/posts/welk-rolgordijn-voor-welke-kamer.mdx
  deleted:
    - src/app/products/page.tsx
    - src/app/products/roller-blinds/page.tsx
    - src/app/products/roller-blinds/transparent-roller-blinds/page.tsx
    - src/app/products/roller-blinds/blackout-roller-blinds/page.tsx
    - src/app/products/[...slug]/page.tsx
decisions: []
metrics:
  duration_seconds: 286
  tasks_completed: 2
  files_modified: 14
  commits: 2
  completed_at: "2026-02-14T15:38:59Z"
---

# Quick Task 9: Translate Product URL Slugs and Breadcrumbs Summary

**One-liner:** Complete URL migration from English `/products/*` to Dutch `/producten/*` with localized slugs and comprehensive 301 redirect coverage

## What Was Built

Migrated the entire product route tree from English to Dutch URLs, including:

1. **Product data localization**: Updated product slugs from `roller-blind-white`/`roller-blind-black` to `wit-rolgordijn`/`zwart-rolgordijn`
2. **Category/subcategory translation**: Changed `roller-blinds` to `rolgordijnen`, `transparent-roller-blinds` to `transparante-rolgordijnen`, and `blackout-roller-blinds` to `verduisterende-rolgordijnen`
3. **Route structure migration**: Created new Dutch route tree at `src/app/producten/` with full hierarchical structure
4. **Breadcrumb label mapping**: Added `formatCategoryName` function with Dutch label mapping for proper display names
5. **301 redirect coverage**: Comprehensive redirects from all old English URLs to new Dutch equivalents
6. **Internal link updates**: Updated all navigation, footer, cart, and blog content links to use new Dutch paths

## Implementation Details

### URL Pattern Changes

**Before:**
- `/products` → Products overview
- `/products/roller-blinds` → Category page
- `/products/roller-blinds/transparent-roller-blinds` → Subcategory page
- `/products/roller-blinds/transparent-roller-blinds/roller-blind-white` → Product page

**After:**
- `/producten` → Products overview
- `/producten/rolgordijnen` → Category page
- `/producten/rolgordijnen/transparante-rolgordijnen` → Subcategory page
- `/producten/rolgordijnen/transparante-rolgordijnen/wit-rolgordijn` → Product page

### 301 Redirects Configured

1. Products overview: `/products` → `/producten`
2. Category: `/products/roller-blinds` → `/producten/rolgordijnen`
3. Subcategories:
   - `/products/roller-blinds/transparent-roller-blinds` → `/producten/rolgordijnen/transparante-rolgordijnen`
   - `/products/roller-blinds/blackout-roller-blinds` → `/producten/rolgordijnen/verduisterende-rolgordijnen`
4. Individual products:
   - `/products/roller-blinds/transparent-roller-blinds/roller-blind-white` → `/producten/rolgordijnen/transparante-rolgordijnen/wit-rolgordijn`
   - `/products/roller-blinds/blackout-roller-blinds/roller-blind-black` → `/producten/rolgordijnen/verduisterende-rolgordijnen/zwart-rolgordijn`
5. Legacy redirects updated (venetian-blinds, textiles) to point to `/producten`
6. Catch-all: `/products/:path*` → `/producten` (placed last for precedence)

### Breadcrumb Label Mapping

Added Dutch label mapping in `formatCategoryName`:
```typescript
const categoryMap: Record<string, string> = {
  'rolgordijnen': 'Rolgordijnen',
  'transparante-rolgordijnen': 'Transparante Rolgordijnen',
  'verduisterende-rolgordijnen': 'Verduisterende Rolgordijnen',
};
```

This ensures breadcrumbs display proper capitalized Dutch labels instead of auto-generated slug transformations.

## Deviations from Plan

None - plan executed exactly as written.

## Testing Evidence

1. **Build success**: `npx next build` completed without errors
2. **Route generation**: All Dutch routes generated at static build time:
   - `/producten`
   - `/producten/rolgordijnen`
   - `/producten/rolgordijnen/transparante-rolgordijnen`
   - `/producten/rolgordijnen/verduisterende-rolgordijnen`
   - `/producten/rolgordijnen/transparante-rolgordijnen/wit-rolgordijn`
   - `/producten/rolgordijnen/verduisterende-rolgordijnen/zwart-rolgordijn`
3. **No hardcoded paths**: Verified zero occurrences of `/products/` in source code (except `products.json` file path)
4. **Product data**: Confirmed Dutch slugs `wit-rolgordijn` and `zwart-rolgordijn` in `data/products.json`
5. **Type safety**: TypeScript compilation passed with updated literal union types for Dutch categories/subcategories

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 4aa6a4c | Migrate product routes from English to Dutch |
| 2 | b4140c9 | Add 301 redirects and update internal links to Dutch URLs |

## Impact

- **SEO**: Dutch URLs now match nl-NL site language, improving local search relevance
- **User experience**: URLs are now readable and meaningful in Dutch for target audience
- **Backward compatibility**: All old English URLs redirect properly with 301 status codes
- **Link equity preservation**: 301 redirects preserve SEO value from existing indexed pages
- **Internal consistency**: All navigation, footer, cart, and blog links updated to Dutch paths
- **Schema.org**: Product and breadcrumb schemas now use Dutch URLs

## Self-Check

**Files created:**
- ✓ FOUND: src/app/producten/page.tsx
- ✓ FOUND: src/app/producten/rolgordijnen/page.tsx
- ✓ FOUND: src/app/producten/rolgordijnen/transparante-rolgordijnen/page.tsx
- ✓ FOUND: src/app/producten/rolgordijnen/verduisterende-rolgordijnen/page.tsx
- ✓ FOUND: src/app/producten/[...slug]/page.tsx

**Commits:**
- ✓ FOUND: 4aa6a4c (Task 1)
- ✓ FOUND: b4140c9 (Task 2)

**Verification:**
- ✓ Build successful
- ✓ No hardcoded /products paths
- ✓ Dutch slugs in product data
- ✓ Routes exist at /producten

## Self-Check: PASSED
