# Custom Dimension Textile Webshop

## What This Is

A Dutch-language custom roller blinds webshop (pureblinds.nl) with dynamic pricing based on customer-specified dimensions, SEO infrastructure for Google.nl ranking, and Shopify checkout integration. Prices are calculated using per-product matrix lookups (width x height) with 10cm increments. The pricing engine is architected to be reusable across the webshop, future Shopify app, and headless/API use cases.

## Core Value

Customers can order custom-dimension roller blinds with accurate matrix-based pricing that works reliably through Shopify checkout on all plan tiers.

## Requirements

### Validated

- ✓ Customer can view product information on product page — v1.0
- ✓ Customer can enter width dimension (any value) — v1.0
- ✓ Customer can enter height dimension (any value) — v1.0
- ✓ Dimensions automatically round up to nearest 10cm increment (25cm → 30cm) — v1.0
- ✓ Price calculated from 20x20 matrix (10-200cm range, 10cm steps) — v1.0
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
- ✓ Products overview page with category cards — v1.2
- ✓ Category pages with product grids — v1.2
- ✓ Multi-product data model with separate pricing matrices — v1.2
- ✓ Enhanced product detail page supporting multiple products — v1.2
- ✓ Updated navigation (Products, Blog, Cart) — v1.2
- ✓ Blog page with grid layout and individual post pages — v1.2
- ✓ Confirmation page at /confirmation with redirect from /thank-you — v1.2
- ✓ WCAG 2.5.8 responsive breadcrumbs across all pages — v1.2
- ✓ Venetian blinds and textiles categories removed with 301 redirects — v1.3
- ✓ Rollerblinds-only catalog with literal union types — v1.3
- ✓ Dutch homepage content (hero, about, services, FAQ, contact) — v1.3
- ✓ Dutch product pages with descriptions, features, and configurator labels — v1.3
- ✓ Dutch category and subcategory introductory copy — v1.3
- ✓ Dutch navigation, cart, confirmation, breadcrumbs — v1.3
- ✓ Dutch blog content with "Welk rolgordijn voor welke kamer?" buying guide — v1.3
- ✓ Unique Dutch meta titles and descriptions on every page — v1.3
- ✓ Open Graph tags with nl_NL locale on all pages — v1.3
- ✓ Schema.org JSON-LD (Organization, FAQPage, Product, BlogPosting, BreadcrumbList) — v1.3
- ✓ Dynamic sitemap.xml from product catalog and blog posts — v1.3
- ✓ robots.txt with crawling rules and sitemap reference — v1.3
- ✓ Cart and confirmation pages marked noindex — v1.3

### Active

#### Carried from v1.0
- [ ] Add Phase 3 verification documentation (process gap from v1.0 audit)
- [ ] Create test products in Shopify store (deferred from Phase 1)
- [ ] Add unit tests for pricing calculator and cart store actions
- [ ] Pricing matrix reference in Draft Order custom attributes (ORDER-04 deferred from v1.0)

### Out of Scope

- Advanced SEO (content strategy, keyword research, link building) — Foundation shipped, strategy later
- GEO optimization — SEO foundation solid, next logical step
- Order status/tracking page — Beyond confirmation page, deferred
- Shopify app version — Requires different architecture
- Theme extensions — App-specific feature
- Native cart price overrides — Requires Shopify Plus
- Shopify Functions — Plan-gated feature
- Database for matrix storage — v1 uses JSON, defer until needed
- Variant-per-dimension structures — Explicitly excluded, doesn't scale
- Contact form backend — Frontend form only, backend submission handling deferred
- Scroll-reveal animations — Ship structure first, add polish later
- Image carousel — Deferred to future milestone
- Product photography — Using placeholder images, real photos added later
- Product sorting/filtering — Only 2 products, not needed yet
- Blog categories/tags — Wait for 10+ posts
- Blog search — Wait for 20+ posts
- User accounts/wishlist — Not needed for guest checkout flow

## Context

**Product domain:** Custom roller blinds where every order has unique dimensions. Netherlands-focused market.

**Current codebase state (v1.3 shipped):**
- 4,127 LOC TypeScript/TSX
- Tech stack: Next.js 15 App Router, TypeScript, Tailwind CSS v4, Zustand, Shopify Admin API, Velite (MDX), schema-dts
- 3 API routes: /api/pricing (POST with productId), /api/checkout (POST), /api/health (GET)
- Pure pricing engine with zero Shopify dependencies, accepts any pricing matrix as parameter
- 2 products in rollerblinds-only catalog with per-product pricing matrices and literal union types
- Cart persistence: localStorage with 7-day TTL, human-readable IDs (productId-widthxheight)
- Blog: 4 Dutch MDX posts via Velite with type-safe content management
- Navigation: Products overview, category pages, product detail, blog listing/detail, confirmation
- Breadcrumbs: W3C ARIA compliant, WCAG 2.5.8 touch targets, responsive truncation
- Full Dutch localization: all pages, navigation, cart, metadata in nl-NL
- SEO infrastructure: Schema.org JSON-LD, dynamic sitemap.xml, robots.txt, unique meta tags per page
- Open Graph with nl_NL locale on every page
- 301 redirects for removed categories (venetian blinds, textiles)
- Test coverage: 1 integration test (cart-clear-on-checkout)
- Homepage: 7 sections with Dutch content (Hero, About, Services, Our Work, Testimonials, FAQ, Contact)
- All images are placeholders — awaiting real product photography

**Pricing matrix structure:**
- 20x20 grid = 400 price points per product
- Width: 10cm to 200cm in 10cm increments
- Height: 10cm to 200cm in 10cm increments
- Customer can enter any dimension, system rounds UP to next 10cm step
- Stored as JSON files in data/pricing/ (one per product)

**User feedback themes:**
- None yet (awaiting production deployment)

**Known issues/technical debt:**
- Phase 3 missing verification documentation (process gap)
- No test products in Shopify store (using mock data)
- Limited test coverage (only 1 integration test)
- All images are placeholders (SVG/divs)
- Contact form has no backend (client-side validation only)
- Velite uses relative imports (Turbopack doesn't support #content/* alias)

**Multi-phase vision:**
- ✅ Phase 1: MVP webshop (own store, fastest validation) — v1.0 shipped
- ✅ Phase 2: Homepage design — v1.1 shipped
- ✅ Phase 3: Product catalog & navigation — v1.2 shipped
- ✅ Phase 4: Dutch content & SEO foundation — v1.3 shipped
- Phase 5: Shopify app v1 (theme-based stores, largest market)
- Phase 6: Shopify app v2 (native pricing for Plus merchants)
- Phase 7: Headless/API (technical merchants, full freedom)

## Constraints

- **Tech stack**: Next.js App Router with TypeScript (BFF architecture) — chosen for speed, Vercel deployment, unified codebase
- **Shopify APIs**: Storefront API (read products), Admin API GraphQL (create Draft Orders) — only APIs available across all plans
- **No plan restrictions**: MVP must work on Shopify Basic plan — no Shopify Plus features, no Shopify Functions, no native cart overrides
- **No database in v1**: Pricing matrix stored as JSON files — deferred complexity, validate first
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
| Integer cents for all pricing | Prevent floating-point rounding errors | ✓ Good — all calculations in cents, formatPrice is single conversion point |
| Zustand with localStorage persist | Lightweight cart state with built-in persistence | ✓ Good — 7-day TTL, lazy cleanup, v2 migration for format changes |
| Custom line items (no variantId) | Avoid Shopify API price override bug | ✓ Good — locked EUR pricing works correctly |
| Cart clears before Shopify redirect | Prevent duplicate orders from browser back button | ✓ Good — verified by integration test |
| Placeholder content over real copy | Ship design structure first, fill actual business copy separately | ✓ Good — avoided blocking on copywriting, all sections have clear structure |
| Client component for header, server for footer | Header needs scroll/menu state; footer is static | ✓ Good — optimal client/server rendering split |
| Product catalog as JSON file | 4 products don't justify database, direct imports for fast access | ✓ Good — easy version control, TypeScript type safety |
| Pure pricing calculator with matrix parameter | Zero module-level imports, any matrix can be passed | ✓ Good — portable across all products and future use cases |
| Static category routes vs dynamic [category] | Avoids Next.js route collision with [productId], simpler for 3 stable categories | ✓ Good — full SSG, no routing ambiguity |
| Cart ID as productId-widthxheight | Human-readable for debugging, better than hashes | ✓ Good — clear in DevTools and logs |
| Velite for MDX blog content | Type-safe content management with Zod validation, build-time compilation | ✓ Good — zero runtime cost, generates typed data |
| Relative imports for .velite data | Turbopack doesn't recognize #content/* path alias | ✓ Good — works without config changes |
| 308 permanent redirect for URL migration | Preserves query parameters, treated as 301 by Google | ✓ Good — clean migration from /thank-you to /confirmation |
| WCAG 2.5.8 touch targets (py-3 = 44px) | Mobile accessibility compliance for breadcrumb links | ✓ Good — adequate tap targets without layout disruption |
| 301 redirects for removed categories | Explicit SEO control, Google treats as permanent redirect | ✓ Good — prevents SEO damage from category removal |
| Literal union types for Category/Subcategory | Compile-time enforcement of rollerblinds-only catalog | ✓ Good — impossible to add invalid categories without type errors |
| Cart layout.tsx for metadata on client pages | Next.js pattern: metadata exports require server components | ✓ Good — cart page has noindex meta without losing client-side state |
| schema-dts for typed JSON-LD | Type-safe Schema.org markup prevents invalid structured data | ✓ Good — IDE autocompletion, compile-time validation |
| FAQ data extracted to shared file | Client accordion + server JSON-LD both need FAQ data | ✓ Good — single source of truth, no duplication |
| Next.js MetadataRoute for sitemap/robots | Built-in conventions, no external packages needed | ✓ Good — type-safe, integrates with build pipeline |

---
*Last updated: 2026-02-14 after v1.3 milestone*
