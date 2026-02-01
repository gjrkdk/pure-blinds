# Roadmap: v1.1 - Website Structure & SEO Foundation

**Milestone:** v1.1
**Created:** 2026-02-01
**Depth:** Comprehensive
**Total Phases:** 5 (6-10)
**Requirements:** 13

## Overview

This milestone transforms the single-page product configurator into a complete multi-page website with SEO foundation and content structure. Each phase delivers a coherent, verifiable capability that builds toward a production-ready e-commerce site. Phase numbering continues from v1.0 (ended at Phase 5). Legal compliance and FAQ content deferred to v1.2.

## Phases

### Phase 6: SEO Foundation

**Goal:** Every page launched from this milestone forward has proper metadata, sitemap, and search engine discoverability.

**Dependencies:** None (pure infrastructure)

**Requirements:**
- SEO-01: Meta title and description tags on all pages via Next.js Metadata API
- SEO-02: Open Graph tags (title, description, image) on all pages for social sharing
- SEO-03: XML sitemap generated programmatically including all pages
- SEO-04: robots.txt configured for search engine crawling

**Success Criteria:**
1. Developer can set page metadata using `generateMetadata` export with TypeScript autocomplete
2. All routes appear in programmatically generated sitemap.xml at /sitemap.xml
3. robots.txt serves at /robots.txt with appropriate crawling rules
4. Root layout has `metadataBase` configured to prevent broken Open Graph image URLs
5. Title template configured to avoid repeating site name on every page

---

### Phase 7: Layout & Navigation

**Goal:** Shared navigation and footer provide consistent structure across all pages without breaking existing product configurator.

**Dependencies:** Phase 6 (metadata patterns)

**Requirements:**
- LAYOUT-01: Shared navigation header displayed on all pages with links to key sections
- LAYOUT-02: Shared footer displayed on all pages with policy links, business info, and copyright
- LAYOUT-04: All pages are mobile-responsive and work well on small screens

**Success Criteria:**
1. Navigation header appears on all pages with links to homepage, product, cart, and contact
2. Footer appears on all pages with business info (KVK number, VAT ID, contact email) and copyright
3. Existing product configurator page still functions correctly (price updates, cart actions)
4. Layout is mobile-responsive with working navigation menu on small screens
5. Developer can add new pages that automatically inherit navigation and footer

---

### Phase 8: Homepage & Primary Pages

**Goal:** Visitors land on a professional homepage that communicates value proposition and can navigate to key destination pages.

**Dependencies:** Phase 7 (layout)

**Requirements:**
- PAGE-01: Homepage with hero section, product highlight, value proposition, and trust signals
- PAGE-02: Dedicated cart page at /cart showing items, quantities, prices, totals, and checkout button
- PAGE-03: Thank you page displayed after Shopify checkout completion with order confirmation details

**Success Criteria:**
1. Homepage at / shows hero section, product highlight, and clear value proposition within first viewport
2. Cart page at /cart displays all cart items with dimensions, prices, item count, and total
3. Thank you page at /thank-you shows order confirmation message and next steps (post-Shopify redirect)
4. User can navigate from homepage to product page to cart page in logical flow
5. All three pages use shared metadata patterns and include Open Graph tags

---

### Phase 9: Blog Structure

**Goal:** Website has blog infrastructure ready for content creation without requiring architectural changes later.

**Dependencies:** Phase 8 (homepage can link to blog), Phase 6 (sitemap can include blog posts)

**Requirements:**
- PAGE-05: Blog listing page showing post previews (structure only, no content)
- PAGE-06: Blog post template page with title, date, content area, and SEO metadata (structure only)

**Success Criteria:**
1. Blog listing page at /blog displays grid of post previews (title, date, excerpt, image)
2. Individual blog post pages render at /blog/[slug] with structured content areas
3. Blog posts use TSX components (not MDX) for v1.1 structure-only implementation
4. Sitemap dynamically includes published blog post URLs
5. Blog listing and post template pages include proper metadata and Open Graph tags

---

### Phase 10: Design Refresh & Polish

**Goal:** All pages have consistent, professional visual design that works across devices and reflects brand identity.

**Dependencies:** All previous phases (refreshing all pages)

**Requirements:**
- LAYOUT-03: Visual design refresh — improved colors, typography, and spacing across site
- LAYOUT-05: Existing product page updated to match new design language

**Success Criteria:**
1. Consistent color palette, typography, and spacing applied across all pages
2. Product configurator page updated to match new design without breaking functionality
3. All pages tested and working correctly on mobile, tablet, and desktop viewports
4. Visual hierarchy guides users toward primary actions (configure product, add to cart, checkout)
5. Design improvements documented for future page additions

---

## Progress Tracking

| Phase | Status | Requirements | Plans | Progress |
|-------|--------|--------------|-------|----------|
| 6 - SEO Foundation | Pending | SEO-01, SEO-02, SEO-03, SEO-04 | 0/0 | ░░░░░░░░░░ 0% |
| 7 - Layout & Navigation | Pending | LAYOUT-01, LAYOUT-02, LAYOUT-04 | 0/0 | ░░░░░░░░░░ 0% |
| 8 - Homepage & Primary Pages | Pending | PAGE-01, PAGE-02, PAGE-03 | 0/0 | ░░░░░░░░░░ 0% |
| 9 - Blog Structure | Pending | PAGE-05, PAGE-06 | 0/0 | ░░░░░░░░░░ 0% |
| 10 - Design Refresh & Polish | Pending | LAYOUT-03, LAYOUT-05 | 0/0 | ░░░░░░░░░░ 0% |

**Overall:** 0% complete (0/13 requirements validated)

---

## Phase Dependencies

```
Phase 6 (SEO Foundation)
    ↓
Phase 7 (Layout & Navigation) ←─┐
    ↓                           │
Phase 8 (Homepage & Primary Pages)
    ↓                           │
Phase 9 (Blog Structure)        │
    ↓                           │
Phase 10 (Design Refresh) ──────┘
```

---

## Coverage Validation

**Total v1.1 Requirements:** 13

**Mapped to Phases:**
- Phase 6: 4 requirements (SEO-01, SEO-02, SEO-03, SEO-04)
- Phase 7: 3 requirements (LAYOUT-01, LAYOUT-02, LAYOUT-04)
- Phase 8: 3 requirements (PAGE-01, PAGE-02, PAGE-03)
- Phase 9: 2 requirements (PAGE-05, PAGE-06)
- Phase 10: 2 requirements (LAYOUT-03, LAYOUT-05)

**Coverage:** 13/13 requirements mapped (100%)

**Orphaned Requirements:** None

**Duplicate Mappings:** None

**Deferred to v1.2:**
- POLICY-01, POLICY-02, POLICY-03, POLICY-04 (Legal & Policy Pages)
- PAGE-04 (FAQ & Support Content)

---

*Roadmap created: 2026-02-01*
*Last updated: 2026-02-01 (revised based on user feedback)*
