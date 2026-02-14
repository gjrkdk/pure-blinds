# Roadmap: Custom Dimension Textile Webshop

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2026-01-31)
- ✅ **v1.1 Design Homepage** - Phases 6-10 (shipped 2026-02-10)
- ✅ **v1.2 Product Catalog & Navigation** - Phases 11-14 (shipped 2026-02-13)
- 🚧 **v1.3 Dutch Content & SEO** - Phases 15-18 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-5) - SHIPPED 2026-01-31</summary>

### Phase 1: Foundation & Setup
**Goal**: Next.js project foundation with pricing data structures
**Plans**: 3 plans

Plans:
- [x] 01-01: Project setup and data foundations
- [x] 01-02: API routes and pricing engine
- [x] 01-03: Testing infrastructure

### Phase 2: Pricing Engine
**Goal**: Pure pricing calculator with matrix lookup and dimension validation
**Plans**: 2 plans

Plans:
- [x] 02-01: Core pricing calculations
- [x] 02-02: API integration and testing

### Phase 3: Product Page & Real-time Pricing
**Goal**: Interactive product page with dimension inputs and real-time price updates
**Plans**: 2 plans

Plans:
- [x] 03-01: Product page UI and dimension configurator
- [x] 03-02: Real-time pricing integration

### Phase 4: Cart Management
**Goal**: Full cart functionality with persistence and multi-item support
**Plans**: 1 plan

Plans:
- [x] 04-01: Cart state management and UI

### Phase 5: Checkout Integration
**Goal**: Shopify Draft Order checkout flow from cart to payment
**Plans**: 1 plan

Plans:
- [x] 05-01: Draft Order creation and checkout redirect

</details>

<details>
<summary>✅ v1.1 Design Homepage (Phases 6-10) - SHIPPED 2026-02-10</summary>

### Phase 6: Navigation & Layout
**Goal**: Site-wide navigation with sticky header and mobile menu
**Plans**: 1 plan

Plans:
- [x] 06-01: Header, footer, and navigation implementation

### Phase 7: Hero Section
**Goal**: Full-height hero section with CTA and testimonial
**Plans**: 1 plan

Plans:
- [x] 07-01: Hero section implementation

### Phase 8: About & Services
**Goal**: About section with stats and services accordion
**Plans**: 1 plan

Plans:
- [x] 08-01: About section and services accordion

### Phase 9: Showcase & Social Proof
**Goal**: Portfolio showcase and testimonials grid
**Plans**: 1 plan

Plans:
- [x] 09-01: Our Work portfolio and testimonials section

### Phase 10: Support & Contact
**Goal**: FAQ section and contact form
**Plans**: 1 plan

Plans:
- [x] 10-01: FAQ accordion and contact section

</details>

<details>
<summary>✅ v1.2 Product Catalog & Navigation (Phases 11-14) - SHIPPED 2026-02-13</summary>

### Phase 11: Product Catalog Foundation
**Goal**: Multi-product data model with flexible pricing architecture
**Plans**: 2 plans

Plans:
- [x] 11-01: Product catalog data model, types, per-product pricing matrices, and pricing engine refactor
- [x] 11-02: API route with productId, cart ID format change with migration, Shopify customAttributes

### Phase 12: Category Navigation & Product Expansion
**Goal**: Category-based product browsing with product grids and enhanced detail pages
**Plans**: 2 plans

Plans:
- [x] 12-01: Breadcrumbs component, Products overview page, static category pages
- [x] 12-02: Header/footer navigation update, product detail breadcrumbs, blog placeholder

### Phase 13: Blog Foundation & Content Marketing
**Goal**: Blog listing and post detail pages with type-safe MDX content management
**Plans**: 1 plan

Plans:
- [x] 13-01: Velite blog infrastructure, sample MDX content, listing and detail pages

### Phase 14: Polish & URL Migration
**Goal**: URL migration and consistent navigation styling
**Plans**: 1 plan

Plans:
- [x] 14-01: URL migration (thank-you to confirmation) and responsive breadcrumb styling

</details>

### 🚧 v1.3 Dutch Content & SEO (In Progress)

**Milestone Goal:** Transform the placeholder webshop into a real Dutch-language rollerblind store that ranks in Google.nl

#### Phase 15: Category Cleanup & Redirects
**Goal**: Remove non-rollerblind categories with proper 301 redirects to prevent SEO damage
**Depends on**: Phase 14
**Requirements**: CLEAN-01, CLEAN-02, CLEAN-03, CLEAN-04
**Success Criteria** (what must be TRUE):
  1. Venetian blinds category completely removed (routes, data, pricing, navigation)
  2. Textiles category completely removed (routes, data, pricing, navigation)
  3. All removed category and product routes return 301 redirects to relevant destinations
  4. Navigation menu displays only rollerblinds category
  5. Product catalog JSON contains only rollerblinds products (2 products remaining)
**Plans**: 2 plans

Plans:
- [ ] 15-01-PLAN.md — Redirects, data/route cleanup, TypeScript type narrowing, cart migration, products page, footer
- [ ] 15-02-PLAN.md — Codebase-wide text audit replacing textile/venetian references with roller blinds

#### Phase 16: Dutch Content & Metadata
**Goal**: Native-quality Dutch content across all pages with unique meta tags for social sharing and SEO
**Depends on**: Phase 15
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, HOME-07, PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, UI-01, UI-02, UI-03, UI-04, BLOG-01, BLOG-02, SEO-01, SEO-02, SEO-03
**Success Criteria** (what must be TRUE):
  1. Root layout html lang attribute is "nl-NL"
  2. Homepage displays Dutch copy in all sections (hero, about, services, how it works, FAQ, contact)
  3. Category and subcategory pages display Dutch introductory copy (250-300 words for main, 150-200 for subs)
  4. Product pages display Dutch descriptions, features, and configurator labels
  5. Navigation, footer, cart, and breadcrumbs displayed in Dutch
  6. Every page has unique Dutch meta title (50-60 chars) and description (150-160 chars)
  7. Open Graph tags configured with nl_NL locale on all pages
  8. Blog post "Welk rolgordijn voor welke kamer?" published in Dutch (800-1500 words)
  9. English sample blog posts replaced with Dutch content or removed
**Plans**: TBD

Plans:
- [ ] 16-01: TBD

#### Phase 17: Structured Data
**Goal**: Schema.org JSON-LD markup for rich search results eligibility
**Depends on**: Phase 16
**Requirements**: SEO-04, SEO-05
**Success Criteria** (what must be TRUE):
  1. Product schema (JSON-LD) implemented on product detail pages with EUR price and availability
  2. FAQPage schema (JSON-LD) implemented on homepage FAQ section
  3. JSON-LD markup properly escaped to prevent XSS vulnerabilities
  4. All schema markup validates in Google Rich Results Test
**Plans**: TBD

Plans:
- [ ] 17-01: TBD

#### Phase 18: Sitemap & Robots
**Goal**: Search engine crawling infrastructure with dynamic sitemap and robots.txt
**Depends on**: Phase 17
**Requirements**: SEO-06, SEO-07, SEO-08
**Success Criteria** (what must be TRUE):
  1. sitemap.xml generated dynamically from product catalog and blog posts
  2. robots.txt configured with appropriate crawling rules
  3. Cart and confirmation pages marked with noindex robots meta
  4. Sitemap excludes removed categories and products
  5. Sitemap accessible at /sitemap.xml and referenced in robots.txt
**Plans**: TBD

Plans:
- [ ] 18-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 15 → 16 → 17 → 18

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Setup | v1.0 | 3/3 | Complete | 2026-01-29 |
| 2. Pricing Engine | v1.0 | 2/2 | Complete | 2026-01-29 |
| 3. Product Page & Real-time Pricing | v1.0 | 2/2 | Complete | 2026-01-30 |
| 4. Cart Management | v1.0 | 1/1 | Complete | 2026-01-30 |
| 5. Checkout Integration | v1.0 | 1/1 | Complete | 2026-01-31 |
| 6. Navigation & Layout | v1.1 | 1/1 | Complete | 2026-02-09 |
| 7. Hero Section | v1.1 | 1/1 | Complete | 2026-02-09 |
| 8. About & Services | v1.1 | 1/1 | Complete | 2026-02-09 |
| 9. Showcase & Social Proof | v1.1 | 1/1 | Complete | 2026-02-10 |
| 10. Support & Contact | v1.1 | 1/1 | Complete | 2026-02-10 |
| 11. Product Catalog Foundation | v1.2 | 2/2 | Complete | 2026-02-13 |
| 12. Category Navigation & Product Expansion | v1.2 | 2/2 | Complete | 2026-02-13 |
| 13. Blog Foundation & Content Marketing | v1.2 | 1/1 | Complete | 2026-02-13 |
| 14. Polish & URL Migration | v1.2 | 1/1 | Complete | 2026-02-13 |
| 15. Category Cleanup & Redirects | v1.3 | 0/2 | Not started | - |
| 16. Dutch Content & Metadata | v1.3 | 0/TBD | Not started | - |
| 17. Structured Data | v1.3 | 0/TBD | Not started | - |
| 18. Sitemap & Robots | v1.3 | 0/TBD | Not started | - |

---
*Last updated: 2026-02-14 after v1.3 roadmap creation*
