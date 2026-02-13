---
phase: 12-category-navigation-product-expansion
plan: 02
subsystem: navigation
tags: [navigation, breadcrumbs, routing, next.js]

dependencies:
  requires:
    - "11-02: Multi-product API integration (catalog structure)"
    - "Phase 11: Product catalog with category field"
  provides:
    - "Complete navigation structure with Products and Blog links"
    - "Product detail breadcrumbs with full category trail"
    - "Footer navigation with product category links"
    - "Blog placeholder page"
  affects:
    - "Future category page enhancements will use static routes"
    - "Any new product categories require new static route pages"

tech-stack:
  added: []
  patterns:
    - "Static category routes instead of dynamic [category] to avoid route ambiguity"
    - "generateStaticParams for SSG of product detail pages"
    - "Breadcrumbs component for consistent navigation trails"

key-files:
  created:
    - src/app/blog/page.tsx
    - src/app/products/rollerblinds/page.tsx
    - src/app/products/venetian-blinds/page.tsx
    - src/app/products/textiles/page.tsx
  modified:
    - src/components/layout/header.tsx
    - src/components/layout/footer.tsx
    - src/app/products/[productId]/page.tsx

decisions:
  - id: NAV-01
    what: "Static category routes instead of dynamic [category] route"
    why: "Next.js cannot distinguish between /products/[category] and /products/[productId] at the same route level, causing ambiguous route pattern errors"
    impact: "Adding new categories requires creating a new static page file instead of being automatically handled"
    alternatives: "Could use /categories/[category] or /products/category/[category] but would break existing URL structure"

metrics:
  duration: 295s
  completed: 2026-02-13
---

# Phase 12 Plan 02: Navigation Structure Summary

**One-liner:** Complete header/footer navigation with Products and Blog links, product breadcrumbs showing category trail, static category pages for all three product types.

## What Was Built

### Task 1: Header Navigation and Blog Placeholder
**Commit:** `da3b8d6`

Updated header navigation to show simplified structure:
- Replaced old navLinks (Rollerblinds, About, Services, Our Work, Contact) with Products and Blog
- Removed Configure CTA button from both desktop and mobile navigation
- Simplified nav rendering - all links are now internal routes using Link component
- Created blog placeholder page at `/blog` with breadcrumbs and coming soon message

### Task 2: Product Breadcrumbs and Footer Links
**Commit:** `b588c39`

Enhanced product detail pages and footer navigation:
- Added Breadcrumbs component to product detail page showing full trail: Home > Products > Category > Product Name
- Updated product detail page to import from catalog module (source of truth)
- Added `formatCategoryName` helper to convert category slugs to display names
- Added `generateStaticParams` to product detail page for SSG (all 4 products now statically generated)
- Updated footer links to include all three product categories plus blog
- Used Link component for internal routes in footer (proper Next.js routing)

### Route Architecture Fix
**Blocking Issue Resolved:**

Encountered Next.js route ambiguity error:
```
Ambiguous route pattern "/products/[*]" matches multiple routes:
  - /products/[category]
  - /products/[productId]
```

**Resolution:** Replaced dynamic `[category]` route with three static category routes:
- `/products/rollerblinds/page.tsx`
- `/products/venetian-blinds/page.tsx`
- `/products/textiles/page.tsx`

This eliminates ambiguity while maintaining the desired URL structure (`/products/rollerblinds`, `/products/venetian-blinds`, etc.).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added generateStaticParams to [productId] page**
- **Found during:** Task 2 execution
- **Issue:** Build failed with route ambiguity error between [category] and [productId] dynamic routes
- **Fix:** Added generateStaticParams to help Next.js distinguish routes, then replaced dynamic [category] with static routes
- **Files modified:** `src/app/products/[productId]/page.tsx`
- **Commit:** `b588c39`

**2. [Rule 3 - Blocking] Replaced dynamic [category] with static category routes**
- **Found during:** Task 2 execution
- **Issue:** Next.js cannot distinguish between `/products/[category]` and `/products/[productId]` at same route level
- **Fix:** Created three static category page files instead of single dynamic route
- **Files created:** `rollerblinds/page.tsx`, `venetian-blinds/page.tsx`, `textiles/page.tsx`
- **Commit:** `b588c39`
- **Rationale:** Only 3 categories exist and they're stable. Static routes avoid ambiguity, enable SSG, and maintain desired URL structure.

## Verification Results

All verification criteria passed:

1. ✅ `npx next build` completes without errors
2. ✅ Build output includes `/blog` route
3. ✅ Header no longer contains "Configure" CTA or homepage section anchors
4. ✅ Product detail breadcrumb includes Products and Category levels
5. ✅ Footer includes product category links and blog link

Build output shows:
- Blog page static: `/blog`
- Three static category pages: `/products/rollerblinds`, `/products/venetian-blinds`, `/products/textiles`
- Four SSG product pages: `rollerblinds-white`, `rollerblinds-black`, `venetian-blinds-25mm`, `custom-textile`

## Success Criteria Status

All success criteria met:

- ✅ Header displays: Pure Blinds (logo/home) | Products | Blog | Cart
- ✅ Mobile hamburger menu shows Products and Blog with Cart icon
- ✅ Product detail page breadcrumb shows Home > Products > Category > Product Name
- ✅ Blog page at /blog does not 404
- ✅ Footer has links to product categories (rollerblinds, venetian-blinds, textiles) and blog

## Decisions Made

**Decision NAV-01: Static category routes vs dynamic [category]**
- **Context:** Next.js route ambiguity between [category] and [productId]
- **Decision:** Use static routes for the 3 categories instead of dynamic route
- **Rationale:** Only 3 categories, they're stable, static routes avoid ambiguity and enable full SSG
- **Trade-off:** Adding new category requires new file instead of being automatic
- **Alternative considered:** Nesting routes like `/products/category/[category]` but would break URL structure

## Next Phase Readiness

**Ready to proceed:** Yes

**Notes:**
- Navigation structure is complete and functional
- All routes build successfully and are properly linked
- Static category approach is scalable for current product catalog size
- If product catalog grows significantly (10+ categories), consider moving to `/categories/[category]` pattern

**For next plan:**
- Consider adding category metadata (descriptions, images) to product catalog
- May want to add active nav state highlighting in header
- Blog page is placeholder - will need full blog implementation in future phase

## Performance Notes

**Build performance:**
- All product pages now use SSG (generateStaticParams)
- Static category pages also prerendered
- Blog page is static
- Total build time maintained ~2-3 minutes

**Execution metrics:**
- Duration: 295s (4m 55s)
- Tasks: 2/2 completed
- Commits: 2 atomic commits
- Deviations handled: 2 auto-fixed blocking issues

---

*Completed: 2026-02-13*
*Execution time: 295s (4m 55s)*
