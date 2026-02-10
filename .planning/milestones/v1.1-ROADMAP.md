# Roadmap: Custom Dimension Textile Webshop

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2026-01-31)
- 🚧 **v1.1 Design Homepage** - Phases 6-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-5) - SHIPPED 2026-01-31</summary>

### Phase 1: Foundation
**Goal**: Next.js project with TypeScript, pricing matrix, and Shopify client
**Plans**: 3 plans

Plans:
- [x] 01-01: Initialize Next.js app with TypeScript and Tailwind
- [x] 01-02: Create pricing matrix structure (20×20, 10-200cm)
- [x] 01-03: Set up Shopify Admin API client

### Phase 2: Pricing Engine
**Goal**: Pure pricing calculation domain (zero Shopify dependencies)
**Plans**: 2 plans

Plans:
- [x] 02-01: Implement dimension validation and normalization
- [x] 02-02: Implement matrix lookup with interpolation

### Phase 3: Product Page
**Goal**: Customer can configure dimensions and see real-time price
**Plans**: 2 plans

Plans:
- [x] 03-01: Create product page UI with dimension inputs
- [x] 03-02: Integrate pricing API with debounced updates

### Phase 4: Cart System
**Goal**: Customer can add items to persistent cart
**Plans**: 1 plan

Plans:
- [x] 04-01: Implement Zustand cart with localStorage persistence

### Phase 5: Checkout Integration
**Goal**: Customer can complete purchase via Shopify checkout
**Plans**: 1 plan

Plans:
- [x] 05-01: Create Draft Order API endpoint with checkout redirect

</details>

### 🚧 v1.1 Design Homepage (In Progress)

**Milestone Goal:** Build a polished, full-featured homepage using reference design patterns with placeholder content.

#### Phase 6: Navigation & Layout
**Goal**: Visitor sees consistent navigation and footer across all pages
**Depends on**: Phase 5
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05
**Success Criteria** (what must be TRUE):
  1. Visitor sees a sticky header with logo and navigation links on all pages
  2. Header background transitions from transparent to solid when scrolling down
  3. Clicking a navigation link smooth-scrolls to the corresponding section
  4. Visitor can open a mobile hamburger menu on small screens
  5. Footer displays quick links and social media icons
**Plans**: 1 plan

Plans:
- [x] 06-01: Sticky header with scroll transition, section nav, mobile menu, and footer redesign

#### Phase 7: Hero Section
**Goal**: Visitor sees compelling hero section with clear CTA
**Depends on**: Phase 6
**Requirements**: HERO-01, HERO-02, HERO-03
**Success Criteria** (what must be TRUE):
  1. Visitor sees full-height hero with headline, description, and CTA button
  2. Hero displays an image with testimonial card overlay
  3. Clicking CTA button scrolls to contact section
**Plans**: 1 plan

Plans:
- [x] 07-01: Full-height hero with image, testimonial overlay, and contact CTA

#### Phase 8: About & Services
**Goal**: Visitor learns about the business and available services
**Depends on**: Phase 7
**Requirements**: ABOUT-01, ABOUT-02, SVC-01, SVC-02, SVC-03
**Success Criteria** (what must be TRUE):
  1. Visitor sees About section with heading, description, and stats grid (4 stats with numbers/labels)
  2. Visitor sees What We Do section with expandable service accordion
  3. Each service item expands to show description when clicked
  4. Sticky image displays alongside services accordion on larger screens
**Plans**: 1 plan

Plans:
- [x] 08-01: About section with stats grid and services accordion with sticky image

#### Phase 9: Showcase & Social Proof
**Goal**: Visitor sees project portfolio and customer testimonials
**Depends on**: Phase 8
**Requirements**: WORK-01, WORK-02, WORK-03, TEST-01, TEST-02
**Success Criteria** (what must be TRUE):
  1. Visitor sees Our Work section with project showcase cards
  2. Projects display with alternating image/content layouts
  3. Each project shows category tag, duration tag, and inline testimonial
  4. Visitor sees testimonials section on dark background
  5. Testimonials display in responsive grid with star ratings
**Plans**: 1 plan

Plans:
- [x] 09-01: Our Work showcase with alternating project cards and Testimonials grid with star ratings

#### Phase 10: Support & Contact
**Goal**: Visitor can read FAQs and contact the business
**Depends on**: Phase 9
**Requirements**: FAQ-01, FAQ-02, CONT-01, CONT-02, CONT-03
**Success Criteria** (what must be TRUE):
  1. Visitor sees FAQ section with two-column layout (intro + accordion)
  2. Each FAQ expands/collapses on click with plus/minus icons
  3. Visitor sees contact section with business info (address, email, phone, socials)
  4. Contact form displays name, email, phone, and message fields
  5. Form validates required fields (name, email, message) before submission
**Plans**: 1 plan

Plans:
- [x] 10-01: FAQ section with two-column accordion and Contact section with validated form and business info

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 3/3 | Complete | 2026-01-29 |
| 2. Pricing Engine | v1.0 | 2/2 | Complete | 2026-01-29 |
| 3. Product Page | v1.0 | 2/2 | Complete | 2026-01-30 |
| 4. Cart System | v1.0 | 1/1 | Complete | 2026-01-30 |
| 5. Checkout Integration | v1.0 | 1/1 | Complete | 2026-01-31 |
| 6. Navigation & Layout | v1.1 | 1/1 | Complete | 2026-02-09 |
| 7. Hero Section | v1.1 | 1/1 | Complete | 2026-02-09 |
| 8. About & Services | v1.1 | 1/1 | Complete | 2026-02-09 |
| 9. Showcase & Social Proof | v1.1 | 1/1 | Complete | 2026-02-10 |
| 10. Support & Contact | v1.1 | 1/1 | Complete | 2026-02-10 |

---
*Last updated: 2026-02-10 (Phase 10 complete — v1.1 milestone done)*
