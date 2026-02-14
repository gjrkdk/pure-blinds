---
phase: 18-sitemap-robots
plan: 01
subsystem: seo
tags: [sitemap, robots, metadata, seo]
dependency_graph:
  requires: [17-02]
  provides: [sitemap.xml, robots.txt, metadataBase]
  affects: [search-engine-crawling, seo-discoverability]
tech_stack:
  added: [next/sitemap, next/robots]
  patterns: [metadata-route, dynamic-sitemap]
key_files:
  created:
    - src/app/sitemap.ts
    - src/app/robots.ts
  modified:
    - src/app/layout.tsx
    - .env.example
decisions:
  - "Use Next.js built-in MetadataRoute for sitemap and robots generation"
  - "Set NEXT_PUBLIC_BASE_URL to pureblinds.nl placeholder domain"
  - "Exclude cart and confirmation from sitemap (already have noindex meta tags)"
  - "Use individual lastModified dates for blog posts based on publication date"
metrics:
  duration: 104
  completed: 2026-02-14
  tasks: 1
  files: 4
---

# Phase 18 Plan 01: Sitemap and Robots.txt Summary

**One-liner:** Dynamic sitemap.xml and robots.txt with absolute URLs using Next.js MetadataRoute conventions

## Overview

Implemented SEO crawling infrastructure using Next.js built-in file conventions for sitemap and robots.txt generation. Added metadataBase to root layout for absolute URL generation.

## Execution Details

### Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create sitemap.ts and robots.ts with metadataBase | 05409ce | src/app/sitemap.ts, src/app/robots.ts, src/app/layout.tsx, .env.example |

### Deviations from Plan

None - plan executed exactly as written.

### Implementation Notes

**Sitemap.xml (src/app/sitemap.ts):**
- Generates dynamic sitemap with 12 URLs:
  - 6 static pages (homepage, products overview, category page, 2 subcategory pages, blog listing)
  - 2 product detail pages (white and black rollerblinds)
  - 4 blog posts with individual lastModified dates
- All URLs are absolute (https://pureblinds.nl/...)
- Excludes /cart and /confirmation as required
- Uses getAllProducts() and getProductUrl() from product catalog
- Imports blog posts from Velite (.velite/posts.json)

**Robots.txt (src/app/robots.ts):**
- User-Agent: *
- Allow: /
- Disallow: /api/, /_next/, /cart, /confirmation
- Sitemap reference: https://pureblinds.nl/sitemap.xml

**MetadataBase (src/app/layout.tsx):**
- Added as first property in metadata object
- Uses NEXT_PUBLIC_BASE_URL environment variable
- Fallback: https://pureblinds.nl

**Environment Configuration:**
- Added NEXT_PUBLIC_BASE_URL=https://pureblinds.nl to .env.example
- User will update with actual domain before production launch

### Verification Performed

1. npm run build succeeded without TypeScript errors
2. sitemap.xml serves valid XML with all expected URLs
3. robots.txt serves with proper Disallow rules and Sitemap reference
4. Confirmed no /cart or /confirmation URLs in sitemap
5. Confirmed all sitemap URLs are absolute (https://)
6. Verified cart page has robots: { index: false } in metadata (pre-existing)
7. Verified confirmation page has robots: { index: false } in metadata (pre-existing)

## Dependencies

**Requires:**
- Phase 17-02 (Structured data implementation complete)
- Product catalog (src/lib/product/catalog.ts)
- Velite blog posts (.velite/posts.json)

**Provides:**
- Dynamic sitemap.xml at /sitemap.xml
- Dynamic robots.txt at /robots.txt
- metadataBase for absolute URL generation

**Affects:**
- Search engine crawling behavior
- SEO discoverability of product and blog pages
- Indexing exclusion for transactional pages

## Success Criteria Met

- [x] sitemap.xml generated dynamically from product catalog and blog posts
- [x] robots.txt configured with appropriate crawling rules
- [x] Cart and confirmation pages marked with noindex robots meta (pre-existing, verified)
- [x] Sitemap excludes cart, confirmation, and removed categories/products
- [x] Sitemap accessible at /sitemap.xml and referenced in robots.txt
- [x] All URLs in sitemap are absolute (not relative)

## Self-Check: PASSED

**Created files verified:**
```
FOUND: src/app/sitemap.ts
FOUND: src/app/robots.ts
```

**Modified files verified:**
```
FOUND: src/app/layout.tsx
FOUND: .env.example
```

**Commit verified:**
```
FOUND: 05409ce
```

## Next Steps

Phase 18 complete (final phase of v1.3 milestone). Ready for production launch after:
1. Update NEXT_PUBLIC_BASE_URL with actual production domain
2. Verify sitemap.xml and robots.txt accessibility on production
3. Submit sitemap to Google Search Console
