# Custom Dimension Textile Webshop

## What This Is

A custom webshop for selling textiles (curtains, flags) with dynamic pricing based on customer-specified dimensions and a polished homepage showcasing the business, services, portfolio, and contact information. Prices are calculated using a matrix lookup (width x height) with 10cm increments. The pricing engine is architected to be reusable across the webshop, future Shopify app, and headless/API use cases.

## Core Value

Customers can order custom-dimension textiles with accurate matrix-based pricing that works reliably through Shopify checkout on all plan tiers.

## Requirements

### Validated

- ✓ Customer can view product information on product page — v1.0
- ✓ Customer can enter width dimension (any value) — v1.0
- ✓ Customer can enter height dimension (any value) — v1.0
- ✓ Dimensions automatically round up to nearest 10cm increment (25cm → 30cm) — v1.0
- ✓ Price calculated from 20×20 matrix (10-200cm range, 10cm steps) — v1.0
- ✓ Customer can add configured item to frontend-managed cart — v1.0
- ✓ Cart supports multiple items with different dimension configurations — v1.0
- ✓ Customer can proceed to checkout — v1.0
- ✓ Backend creates single Shopify Draft Order from cart — v1.0
- ✓ Each Draft Order line item includes: product name with dimensions, custom locked price, configuration payload — v1.0
- ✓ Backend returns Shopify checkout URL — v1.0
- ✓ Customer redirected to Shopify checkout to complete payment — v1.0
- ✓ Order created in Shopify after successful payment — v1.0
- ✓ Solution works on all Shopify plans (Basic, Shopify, Advanced, Plus) — v1.0
- ✓ Sticky header with scroll-aware background, section navigation, and mobile menu — v1.1
- ✓ Footer with quick links and social media icons — v1.1
- ✓ Full-height hero with headline, CTA, and testimonial card overlay — v1.1
- ✓ About section with stats grid — v1.1
- ✓ Services accordion with sticky image sidebar — v1.1
- ✓ Our Work portfolio showcase with alternating layouts and inline testimonials — v1.1
- ✓ Testimonials grid on dark background with star ratings — v1.1
- ✓ FAQ section with two-column accordion layout — v1.1
- ✓ Contact section with validated form and business info — v1.1

### Active

#### Carried from v1.0
- [ ] Add Phase 3 verification documentation (process gap from v1.0 audit)
- [ ] Create test products in Shopify store (deferred from Phase 1)
- [ ] Add unit tests for pricing calculator and cart store actions
- [ ] Pricing matrix reference in Draft Order custom attributes (ORDER-04 deferred from v1.0)

### Out of Scope

- Category pages — Only one product currently, add when multi-product launches
- Advanced SEO (content strategy, keyword research, link building) — Foundation first, strategy later
- GEO optimization — Deferred until SEO foundation is solid
- Order status/tracking page — Beyond thank you page, deferred
- Shopify app version — Requires different architecture
- Theme extensions — App-specific feature
- Native cart price overrides — Requires Shopify Plus
- Shopify Functions — Plan-gated feature
- Database for matrix storage — v1 uses JSON, defer until needed
- Variant-per-dimension structures — Explicitly excluded, doesn't scale
- Multi-product support — Single product type, expand later if validated
- Contact form backend — Frontend form only, backend submission handling deferred
- Scroll-reveal animations — Ship structure first, add polish later
- Image carousel — Deferred to future milestone
- Real business copy — Placeholder content first, copywriting is separate effort
- Product photography — Using placeholder images, real photos added later

## Context

**Product domain:** Custom textiles (curtains, flags) where every order has unique dimensions.

**Current codebase state (v1.1 shipped):**
- 2,807 LOC TypeScript/TSX
- Tech stack: Next.js 15 App Router, TypeScript, Tailwind CSS v4, Zustand, Shopify Admin API
- 3 API routes: /api/pricing (POST), /api/checkout (POST), /api/health (GET)
- Pure pricing engine with zero Shopify dependencies (enables future extraction)
- Cart persistence: localStorage with 7-day TTL
- Test coverage: 1 integration test (cart-clear-on-checkout)
- Homepage: 7 sections (Hero, About, Services, Our Work, Testimonials, FAQ, Contact)
- Navigation: Sticky header with scroll transition, mobile menu, anchor-based section nav
- All content is placeholder — awaiting real business copy and photography

**Pricing matrix structure:**
- 20×20 grid = 400 price points
- Width: 10cm to 200cm in 10cm increments
- Height: 10cm to 200cm in 10cm increments
- Customer can enter any dimension, system rounds UP to next 10cm step
- Stored as JSON file (data/pricing-matrix.json)

**User feedback themes:**
- None yet (awaiting production deployment)

**Known issues/technical debt:**
- Phase 3 missing verification documentation (process gap)
- No test products in Shopify store (using mock data)
- Limited test coverage (only 1 integration test)
- All homepage images are placeholders (SVG/divs)
- Contact form has no backend (client-side validation only)
- No SEO infrastructure (no meta tags, sitemap, structured data)

**Multi-phase vision:**
- ✅ Phase 1: MVP webshop (own store, fastest validation) — v1.0 shipped
- ✅ Phase 2: Homepage design — v1.1 shipped
- Phase 3: Content, animations & SEO foundation
- Phase 4: Shopify app v1 (theme-based stores, largest market)
- Phase 5: Shopify app v2 (native pricing for Plus merchants)
- Phase 6: Headless/API (technical merchants, full freedom)

## Constraints

- **Tech stack**: Next.js App Router with TypeScript (BFF architecture) — chosen for speed, Vercel deployment, unified codebase
- **Shopify APIs**: Storefront API (read products), Admin API GraphQL (create Draft Orders) — only APIs available across all plans
- **No plan restrictions**: MVP must work on Shopify Basic plan — no Shopify Plus features, no Shopify Functions, no native cart overrides
- **No database in v1**: Pricing matrix stored as JSON file — deferred complexity, validate first
- **Reusable pricing engine**: Same pricing logic must work for webshop, app, and future use cases — no rewriting allowed in later phases
- **Shopify boundary**: Shopify handles only checkout, payments, orders, taxes — not pricing configuration or business rules
- **Hosting**: Vercel — Next.js native platform, zero-config deployment

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pricing as standalone domain | Engine must be reusable across webshop, app, and API without modification | ✓ Good — zero Shopify imports in src/lib/pricing/, fully portable |
| Shopify as execution layer only | Keeps pricing logic portable, Shopify handles what it does best (checkout/payments) | ✓ Good — Draft Orders create custom line items, Shopify handles payment/taxes |
| Draft Order approach for MVP | Works on all Shopify plans, avoids plan-gated features, fastest path to revenue | ✓ Good — no Plus-only features, EUR currency support confirmed |
| BFF architecture (Next.js) | Single codebase for frontend + backend API, faster development, simpler deployment | ✓ Good — single repo, API routes colocated with frontend |
| Round UP rounding strategy | Customer always gets at least what they ordered (25cm → 30cm), better UX than rounding down | ✓ Good — normalizeDimension uses Math.ceil, transparent to user |
| JSON matrix storage in v1 | Defer database complexity until business model validated, faster MVP | ✓ Good — 400 price points load instantly, easy to update |
| Single product type in v1 | Validate core pricing mechanics before expanding product catalog | ✓ Good — productId/productName props support multi-product future |
| Integer cents for all pricing | Prevent floating-point rounding errors | ✓ Good — all calculations in cents, formatPrice is single conversion point |
| 400ms debounce for pricing API | Balance responsiveness with API call efficiency | ✓ Good — prevents spam, user stops typing before calculation |
| Zustand with localStorage persist | Lightweight cart state with built-in persistence | ✓ Good — 7-day TTL, lazy cleanup, no provider boilerplate |
| Custom line items (no variantId) | Avoid Shopify API price override bug | ✓ Good — locked EUR pricing works correctly |
| Cart clears before Shopify redirect | Prevent duplicate orders from browser back button | ✓ Good — verified by integration test |
| Port reference design to Next.js | Existing Vite/React reference code provides proven layout/animation patterns | ✓ Good — adapted for Next.js App Router + Tailwind v4 successfully |
| Placeholder content over real copy | Ship design structure first, fill actual business copy separately | ✓ Good — avoided blocking on copywriting, all sections have clear structure |
| Anchor links for section navigation | Native browser smooth scrolling simpler than custom scroll logic | ✓ Good — CSS scroll-behavior: smooth, no JS scroll calculations |
| Client component for header, server for footer | Header needs scroll/menu state; footer is static | ✓ Good — optimal client/server rendering split |
| First accordion item open by default | Better UX — visitors see example content immediately | ✓ Good — consistent pattern across services and FAQ accordions |
| Our Work replaces How it Works | Portfolio provides more compelling social proof than process steps | ✓ Good — project cards with inline testimonials |
| ContactSection owns #contact anchor | Hero CTA links correctly after CTA Banner removal | ✓ Good — single source of truth for contact scroll target |
| Client-side form validation only | Backend contact form submission deferred | ✓ Good — form validates required fields, shows success message |

---
*Last updated: 2026-02-10 after v1.1 milestone*
