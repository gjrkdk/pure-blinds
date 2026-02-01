# Custom Dimension Textile Webshop

## What This Is

A custom webshop for selling textiles (curtains, flags) with dynamic pricing based on customer-specified dimensions. Prices are calculated using a matrix lookup (width × height) with 10cm increments. The pricing engine is architected to be reusable across the webshop, future Shopify app, and headless/API use cases.

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
- ✓ Each Draft Order line item includes: product name with dimensions, custom locked price, configuration payload (width, height, normalized values) — v1.0 (pricing matrix reference deferred)
- ✓ Backend returns Shopify checkout URL — v1.0
- ✓ Customer redirected to Shopify checkout to complete payment — v1.0
- ✓ Order created in Shopify after successful payment — v1.0
- ✓ Solution works on all Shopify plans (Basic, Shopify, Advanced, Plus) — v1.0

### Active

#### Website Structure & Pages
- [ ] Homepage with business introduction, product highlight, and trust signals
- [ ] Dedicated cart page at /cart replacing current cart UI
- [ ] Thank you / order confirmation page (post-Shopify checkout redirect)
- [ ] Blog listing and individual blog post pages (structure only, content later)
- [ ] FAQ page (structure only, content later)
- [ ] Contact page with form, email/phone, and business details (address, KvK, VAT, hours)
- [ ] Privacy Policy page
- [ ] Terms & Conditions page
- [ ] Returns/Refund Policy page
- [ ] Shipping Policy page

#### SEO Foundation
- [ ] Meta tags and Open Graph tags on all pages
- [ ] JSON-LD structured data (Organization, Product, FAQ, BreadcrumbList schemas)
- [ ] XML sitemap generation
- [ ] robots.txt configuration
- [ ] Semantic HTML structure across all pages

#### Design Refresh
- [ ] Improved visual design and consistent styling across all pages
- [ ] Shared layout with navigation and footer
- [ ] Mobile-responsive design for all new pages

#### Carried from v1.0
- [ ] Add Phase 3 verification documentation (process gap from v1.0 audit)
- [ ] Create test products in Shopify store (deferred from Phase 1)
- [ ] Add unit tests for pricing calculator and cart store actions
- [ ] Pricing matrix reference in Draft Order custom attributes (ORDER-04 deferred from v1.0)

### Out of Scope

- Category pages — Only one product currently, add when multi-product launches
- Blog content creation — Structure only in v1.1, content is a separate effort
- FAQ content creation — Structure only in v1.1, content is a separate effort
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

## Context

**Product domain:** Custom textiles (curtains, flags) where every order has unique dimensions.

**Current codebase state (v1.0 shipped):**
- 1,522 LOC TypeScript/TSX
- Tech stack: Next.js 15 App Router, TypeScript, Tailwind CSS, Zustand, Shopify Admin API
- 3 API routes: /api/pricing (POST), /api/checkout (POST), /api/health (GET)
- Pure pricing engine with zero Shopify dependencies (enables future extraction)
- Cart persistence: localStorage with 7-day TTL
- Test coverage: 1 integration test (cart-clear-on-checkout)

**Pricing matrix structure:**
- 20×20 grid = 400 price points
- Width: 10cm to 200cm in 10cm increments
- Height: 10cm to 200cm in 10cm increments
- Customer can enter any dimension, system rounds UP to next 10cm step
- Rounding ensures customer always receives at least the dimensions they ordered
- Stored as JSON file (data/pricing-matrix.json)

**User feedback themes:**
- None yet (v1.0 awaiting production deployment)

**Known issues/technical debt:**
- Phase 3 missing verification documentation (process gap)
- No test products in Shopify store (using mock data)
- formatPrice duplication fixed in v1.0
- Limited test coverage (only 1 integration test)
- Site lacks proper navigation, homepage, and supporting pages
- No SEO infrastructure (no meta tags, sitemap, structured data)

**Current milestone: v1.1 — Website Structure & SEO Foundation**
- Build out full website with homepage, cart page, thank you page, blog, FAQ, contact, and policy pages
- Add SEO foundation (meta tags, Open Graph, JSON-LD, sitemap, robots.txt)
- Design refresh across all pages with shared layout (nav + footer)
- Structure-first approach: page shells ready for content

**Multi-phase vision:**
- ✅ Phase 1: MVP webshop (own store, fastest validation) — v1.0 shipped
- ◆ Phase 2: Website structure & SEO foundation — v1.1
- Phase 3: Content & advanced SEO/GEO
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

| Dedicated cart page over sidebar | Full page gives more room for item details, upsells, and trust signals | — Pending |
| Structure-first for blog/FAQ | Ship page shells now, fill content separately — avoids blocking on copywriting | — Pending |
| SEO foundation before content strategy | Technical SEO (meta, schema, sitemap) is prerequisite for content-driven SEO | — Pending |
| Design refresh with v1.1 pages | New pages need consistent design; refreshing existing pages simultaneously avoids visual mismatch | — Pending |

---
*Last updated: 2026-02-01 after v1.1 milestone start*
