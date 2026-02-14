---
phase: 17-structured-data
plan: 02
subsystem: seo-infrastructure
tags: [schema-org, json-ld, seo, structured-data, product-schema, blog-schema]
dependency_graph:
  requires:
    - phase: 17-01
      provides: Schema builder functions (buildProductSchema, buildBlogPostSchema, buildBreadcrumbSchema)
  provides:
    - Product JSON-LD on product detail pages
    - BreadcrumbList JSON-LD on product detail pages
    - BlogPosting JSON-LD on blog post pages
    - BreadcrumbList JSON-LD on blog post pages
  affects:
    - Product page SEO
    - Blog page SEO
    - Google rich results eligibility
tech_stack:
  added: []
  patterns:
    - Wire schemas into page components via imports and JSX composition
    - Load pricing matrix for minimum price calculation in Product schema
    - Extract breadcrumb items to shared variable for UI and schema reuse
key_files:
  created: []
  modified:
    - src/app/products/[...slug]/page.tsx
    - src/app/blog/[slug]/page.tsx
decisions:
  - Load pricing matrix in product page for minimum price calculation in Product schema
  - Extract breadcrumb items to variable in blog page for sharing between UI and schema
metrics:
  duration_seconds: 162
  tasks_completed: 2
  files_created: 0
  files_modified: 2
  commits: 2
  completed_date: 2026-02-14
---

# Phase 17 Plan 02: Schema Integration Summary

**Product detail pages output Product + BreadcrumbList JSON-LD with EUR pricing from matrix, blog posts output BlogPosting + BreadcrumbList JSON-LD**

## Performance

- **Duration:** 162 seconds (2m 42s)
- **Started:** 2026-02-14T15:16:41Z
- **Completed:** 2026-02-14T15:19:23Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Product detail pages now render Product and BreadcrumbList JSON-LD schemas
- Blog post pages now render BlogPosting and BreadcrumbList JSON-LD schemas
- All schemas use absolute URLs starting with https://
- Product schema uses minimum price from pricing matrix in EUR currency
- BreadcrumbList schemas match visible breadcrumb navigation on both page types

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire Product and BreadcrumbList schemas into product detail pages** - `dfa802c` (feat)
2. **Task 2: Wire BlogPosting and BreadcrumbList schemas into blog post pages** - `84ba244` (feat)

## Files Created/Modified
- `src/app/products/[...slug]/page.tsx` - Added Product and BreadcrumbList JSON-LD with pricing matrix loading
- `src/app/blog/[slug]/page.tsx` - Added BlogPosting and BreadcrumbList JSON-LD with extracted breadcrumb items

## Decisions Made

**Load pricing matrix for Product schema:**
- Product detail pages now load the pricing matrix using `loadPricingMatrix` to calculate minimum price
- This ensures the Product schema has accurate EUR pricing from the matrix
- The buildProductSchema function handles cents-to-EUR conversion and hardcodes EUR currency

**Extract breadcrumb items variable:**
- Blog page breadcrumb items were previously defined inline in JSX
- Extracted to `breadcrumbItems` variable to enable reuse in both UI component and schema builder
- Ensures breadcrumb UI and schema are always synchronized

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed without issues.

## Verification Results

All verification criteria passed:

1. ✅ `npm run build` succeeds with no errors
2. ✅ Product page source contains Product JSON-LD with EUR price (10.00) and InStock availability
3. ✅ Product page source contains BreadcrumbList JSON-LD with correct hierarchy (Home → Producten → Roller Blinds → Transparent Roller Blinds → Product)
4. ✅ Blog post page source contains BlogPosting JSON-LD with headline, author, publisher
5. ✅ Blog post page source contains BreadcrumbList JSON-LD with 3 items (Home → Blog → Post Title)
6. ✅ All schema URLs are absolute (start with https://pureblinds.nl)
7. ✅ XSS escaping active (found `\u003c` in JSON-LD output)

## Next Phase Readiness

Phase 17 (Structured Data) is now complete. All schemas are wired into the appropriate pages:
- Homepage: Organization + FAQPage (Phase 17-01)
- Product detail pages: Product + BreadcrumbList (Phase 17-02)
- Blog post pages: BlogPosting + BreadcrumbList (Phase 17-02)

Ready to proceed to Phase 18 (final phase in v1.3 milestone).

## Self-Check: PASSED

**Modified files verification:**
```
FOUND: src/app/products/[...slug]/page.tsx
FOUND: src/app/blog/[slug]/page.tsx
```

**Commits verification:**
```
FOUND: dfa802c (Task 1)
FOUND: 84ba244 (Task 2)
```

**Schema output verification:**
- Product schema contains: `"@type":"Product"`, `"price":"10.00"`, `"priceCurrency":"EUR"`, `"availability":"https://schema.org/InStock"`
- BreadcrumbList schema on product page contains 5 items with correct hierarchy
- BlogPosting schema contains: `"@type":"BlogPosting"`, `"headline"`, `"author"`, `"publisher"`
- BreadcrumbList schema on blog page contains 3 items
- XSS escaping active: `\u003c` found in JSON-LD output

---
*Phase: 17-structured-data*
*Completed: 2026-02-14*
