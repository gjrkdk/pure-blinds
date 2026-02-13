# Roadmap: Custom Dimension Textile Webshop

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2026-01-31)
- ✅ **v1.1 Design Homepage** - Phases 6-10 (shipped 2026-02-10)
- 🚧 **v1.2 Product Catalog & Navigation** - Phases 11-14 (in progress)

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

### 🚧 v1.2 Product Catalog & Navigation (In Progress)

**Milestone Goal:** Transform single-product webshop into full product catalog with category navigation, multiple products with different pricing matrices, improved product pages, and blog foundation.

#### Phase 11: Product Catalog Foundation
**Goal**: Multi-product data model with flexible pricing architecture
**Depends on**: Phase 10
**Requirements**: CATALOG-01, CATALOG-02, CATALOG-03, CATALOG-04, CATALOG-05, CATALOG-06, CATALOG-07
**Success Criteria** (what must be TRUE):
  1. System stores multiple products with unique IDs, names, categories, and pricing matrix paths
  2. Pricing engine accepts any product's pricing matrix as a parameter (not hardcoded)
  3. API route `/api/pricing` loads correct pricing matrix based on productId
  4. Cart generates unique item IDs that include productId (no collisions between products with same dimensions)
  5. Product data includes Shopify variant ID mapping for checkout integration
**Plans**: 2 plans

Plans:
- [x] 11-01-PLAN.md — Product catalog data model, types, per-product pricing matrices, and pricing engine refactor
- [x] 11-02-PLAN.md — API route with productId, cart ID format change with migration, Shopify customAttributes

#### Phase 12: Category Navigation & Product Expansion
**Goal**: Category-based product browsing with product grids and enhanced detail pages
**Depends on**: Phase 11
**Requirements**: CATEGORY-01, CATEGORY-02, CATEGORY-03, CATEGORY-04, CATEGORY-05, CATEGORY-06, CATEGORY-07, CATEGORY-08, PRODUCT-01, PRODUCT-02, PRODUCT-03, PRODUCT-04, PRODUCT-05, PRODUCT-06, NAV-01, NAV-02, NAV-03, NAV-04, NAV-05
**Success Criteria** (what must be TRUE):
  1. User can view Products overview page at `/products` with Light and Dark category cards
  2. User can click category card to view category listing page with product grids
  3. Product cards display image, name, description, and "Configure" CTA in responsive layout
  4. Breadcrumb navigation shows current page path (Home > Products > Category)
  5. Product detail page loads correct product data, pricing matrix, and images based on productId from URL
  6. Header navigation shows updated structure: Pure Blinds | Products | Blog | Cart
**Plans**: 2 plans

Plans:
- [x] 12-01-PLAN.md — Breadcrumbs component, Products overview page, static category pages
- [x] 12-02-PLAN.md — Header/footer navigation update, product detail breadcrumbs, blog placeholder

#### Phase 13: Blog Foundation & Content Marketing
**Goal**: Blog listing and post detail pages with type-safe MDX content management
**Depends on**: Phase 11
**Requirements**: BLOG-01, BLOG-02, BLOG-03, BLOG-04, BLOG-05, BLOG-06, BLOG-07, BLOG-08, NAV-06, NAV-07
**Success Criteria** (what must be TRUE):
  1. User can view blog listing page at `/blog` with grid of blog posts showing title, excerpt, date, and reading time
  2. User can click blog post card to view full post with formatted content
  3. System includes 2-3 sample blog posts (buying guides, care instructions) managed via Velite MDX
  4. Blog post detail pages are responsive with good typography
  5. Footer includes links to product categories and blog
**Plans**: 1 plan

Plans:
- [x] 13-01-PLAN.md — Velite blog infrastructure, sample MDX content, listing and detail pages

#### Phase 14: Polish & URL Migration
**Goal**: URL migration and consistent navigation styling
**Depends on**: Phase 12, Phase 13
**Requirements**: POLISH-01, POLISH-02, POLISH-03
**Success Criteria** (what must be TRUE):
  1. Thank you page renamed to Confirmation at `/confirmation` with 301 redirect from `/thank-you`
  2. Breadcrumbs styled consistently across all pages with responsive behavior
**Plans**: 1 plan

Plans:
- [x] 14-01-PLAN.md — URL migration (thank-you to confirmation) and responsive breadcrumb styling

## Progress

**Execution Order:**
Phases execute in numeric order: 11 → 12 → 13 → 14

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
| 14. Polish & Metadata | v1.2 | 1/1 | Complete | 2026-02-13 |

---
*Last updated: 2026-02-13 after Phase 14 completion*
