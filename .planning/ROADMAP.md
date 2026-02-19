# Roadmap: Custom Dimension Roller Blinds Webshop

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2026-01-31)
- ✅ **v1.1 Design Homepage** - Phases 6-10 (shipped 2026-02-10)
- ✅ **v1.2 Product Catalog & Navigation** - Phases 11-14 (shipped 2026-02-13)
- ✅ **v1.3 Dutch Content & SEO** - Phases 15-18 (shipped 2026-02-14)
- 🚧 **v1.4 Production Ready** - Phases 19-22 (in progress)

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

<details>
<summary>✅ v1.3 Dutch Content & SEO (Phases 15-18) - SHIPPED 2026-02-14</summary>

### Phase 15: Category Cleanup & Redirects
**Goal**: Remove non-rollerblind categories with proper 301 redirects to prevent SEO damage
**Plans**: 2 plans

Plans:
- [x] 15-01: Redirects, data/route cleanup, TypeScript type narrowing, cart migration, products page, footer
- [x] 15-02: Codebase-wide text audit replacing textile/venetian references with roller blinds

### Phase 16: Dutch Content & Metadata
**Goal**: Native-quality Dutch content across all pages with unique meta tags for social sharing and SEO
**Plans**: 4 plans

Plans:
- [x] 16-01: Homepage Dutch content, hero, all sections, root layout nl-NL, metadata
- [x] 16-02: Product pages Dutch content, product data, configurator, metadata
- [x] 16-03: Navigation, cart, confirmation Dutch localization, metadata
- [x] 16-04: Blog Dutch content, date localization, new Dutch blog post, metadata

### Phase 17: Structured Data
**Goal**: Schema.org JSON-LD markup for rich search results eligibility
**Plans**: 2 plans

Plans:
- [x] 17-01: Schema infrastructure (JsonLd component + builders) and homepage Organization + FAQPage schemas
- [x] 17-02: Product, BlogPosting, and BreadcrumbList schemas on detail pages

### Phase 18: Sitemap & Robots
**Goal**: Search engine crawling infrastructure with dynamic sitemap and robots.txt
**Plans**: 1 plan

Plans:
- [x] 18-01: Dynamic sitemap.xml, robots.txt, and metadataBase configuration

</details>

### 🚧 v1.4 Production Ready (In Progress)

**Milestone Goal:** Make the webshop production-ready with correct environment configuration, improved cart UX, VAT display, and sample order tracking so customers can complete the full purchase flow reliably.

- [x] **Phase 19: Bug Fixes** - Eliminate env var inconsistencies, dead config, and data errors (completed 2026-02-19)
- [x] **Phase 20: Environment Configuration** - Environment-based Shopify IDs for dev/prod separation (completed 2026-02-19)
- [ ] **Phase 21: Cart UX** - Split add-to-cart button, sample button update, mobile cart icon
- [ ] **Phase 22: Checkout & Order Tracking** - VAT display, smart cart clearing, sample order tagging

## Phase Details

### Phase 19: Bug Fixes
**Goal**: Codebase is free of env var inconsistencies, dead configuration references, and incorrect data metadata
**Depends on**: Phase 18
**Requirements**: FIX-01, FIX-02, FIX-03, FIX-04
**Success Criteria** (what must be TRUE):
  1. All pages resolve canonical URLs using `NEXT_PUBLIC_BASE_URL` — no `NEXT_PUBLIC_SITE_URL` references remain in the codebase
  2. The env validation in `src/lib/env.ts` no longer references `SHOPIFY_PRODUCT_ID`
  3. Pricing matrix JSON files declare `"currency": "EUR"` — the USD value is gone
  4. The domain fallback in `src/lib/env.ts` resolves to `pure-blinds.nl`, not `pureblinds.nl`
**Plans**: 1 plan

Plans:
- [ ] 19-01-PLAN.md — Fix env vars, remove dead config, correct currency metadata and domain fallback

### Phase 20: Environment Configuration
**Goal**: Shopify product and variant IDs are resolved from environment variables at runtime, enabling separate dev and production Shopify stores
**Depends on**: Phase 19
**Requirements**: ENV-01, ENV-02
**Success Criteria** (what must be TRUE):
  1. Adding a product to cart in dev uses the Shopify product/variant ID from dev environment variables, not a value hardcoded in products.json
  2. Deploying to production with prod env vars causes the Draft Order to reference production Shopify IDs without any code change
  3. The `.env.example` (or equivalent) documents the required Shopify ID env vars for both dev and prod environments
  4. Products.json no longer contains Shopify product or variant ID values
**Plans**: 1 plan

Plans:
- [x] 20-01: Extract Shopify IDs to SHOPIFY_PRODUCT_MAP env var, update product catalog and Draft Order creation

### Phase 21: Cart UX
**Goal**: The add-to-cart and sample flows give customers clear next-step navigation, and the cart is always visible on mobile
**Depends on**: Phase 19
**Requirements**: CART-01, CART-02, CART-03
**Success Criteria** (what must be TRUE):
  1. After adding a product to cart on the product page, the single "Toevoegen" button is replaced by two buttons: "Nog een toevoegen" (resets form) and "Naar winkelwagen →" (navigates to cart page)
  2. After adding a sample to cart, the sample button label changes to "Bekijk winkelwagen →" and clicking it navigates to the cart page
  3. On mobile, a cart icon with an item count badge is visible in the header next to the hamburger menu icon
  4. The cart badge count updates immediately when items are added or removed
**Plans**: 2 plans

Plans:
- [ ] 21-01: Split add-to-cart button and sample button state changes
- [ ] 21-02: Mobile cart icon with animated badge in header

### Phase 22: Checkout & Order Tracking
**Goal**: Customers see the VAT-inclusive price before checkout, cart state survives browser navigation after purchase, and sample orders are tagged in Shopify for operations
**Depends on**: Phase 21
**Requirements**: CHKOUT-01, CHKOUT-02, TRACK-01
**Success Criteria** (what must be TRUE):
  1. The product configurator displays the calculated price with "Incl. 21% BTW" label beneath or alongside it
  2. Visiting `/bevestiging` without a valid order query parameter does not clear the cart
  3. Cart is cleared only when the confirmation page receives a confirmed Shopify order ID (purchase completion signal)
  4. Draft Orders in Shopify that include at least one sample line item carry the `kleurstaal` tag, visible in the Shopify admin
**Plans**: TBD

Plans:
- [ ] 22-01: VAT display on product page and smart cart clearing on confirmation
- [ ] 22-02: kleurstaal tag on Draft Orders with sample items

## Progress

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
| 15. Category Cleanup & Redirects | v1.3 | 2/2 | Complete | 2026-02-14 |
| 16. Dutch Content & Metadata | v1.3 | 4/4 | Complete | 2026-02-14 |
| 17. Structured Data | v1.3 | 2/2 | Complete | 2026-02-14 |
| 18. Sitemap & Robots | v1.3 | 1/1 | Complete | 2026-02-14 |
| 19. Bug Fixes | v1.4 | 1/1 | Complete | 2026-02-19 |
| 20. Environment Configuration | v1.4 | Complete    | 2026-02-19 | 2026-02-19 |
| 21. Cart UX | v1.4 | 0/2 | Not started | - |
| 22. Checkout & Order Tracking | v1.4 | 0/2 | Not started | - |

---
*Last updated: 2026-02-19 after v1.4 roadmap creation*
