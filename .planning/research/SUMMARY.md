# Project Research Summary

**Project:** Pure Blinds Multi-Product Catalog Expansion
**Domain:** Custom Textile E-commerce Platform
**Researched:** 2026-02-13
**Confidence:** HIGH

## Executive Summary

Pure Blinds is expanding from a single-product custom textile shop to a multi-product catalog with categories and blog functionality. The existing Next.js 15 App Router stack is already well-suited for this expansion—no major framework changes are needed. The core challenge is making the pricing engine flexible enough to support multiple products without breaking its portability or the existing cart/checkout flow.

The recommended approach is evolutionary rather than revolutionary: keep the pure pricing engine architecture, refactor it to accept product-specific pricing matrices as parameters (not hardcoded imports), establish a clean product data model with proper Shopify ID mapping, and add Velite for type-safe blog content management. The existing cart, checkout, and Shopify integration require minimal changes—they already support multiple products through the productId field.

The primary risks are (1) coupling the pricing engine to product catalog logic, destroying portability, (2) cart ID collisions when multiple products share dimensions, and (3) hydration mismatches when cart state loads from localStorage. All three are preventable by addressing architectural foundations in Phase 1 before scaling the catalog. Secondary risks include bundle bloat from importing all pricing matrices client-side (solution: server-side matrix loading) and route conflicts between products/categories (solution: validate against reserved slugs).

## Key Findings

### Recommended Stack

The existing Next.js 15 stack is ideal for this expansion. No major dependencies are needed for the multi-product catalog—the App Router's dynamic routes, Server Components, and built-in metadata APIs handle all requirements. For the blog, Velite is recommended over abandoned Contentlayer for type-safe MDX content management with Zod validation.

**Core technologies:**
- **Next.js 15 App Router** (existing) — Dynamic routes for products/categories, Server Components for catalog pages, built-in SEO
- **Velite ^0.1.0** (new) — Type-safe MDX blog content with Zod schemas, active maintenance, replaces abandoned Contentlayer
- **Reading-time ^1.5.0** (optional) — Calculate blog post reading time for improved UX
- **Date-fns ^3.3.1** (optional) — Modular date formatting for blog post dates

**What NOT to add:**
- Contentlayer (abandoned by maintainer)
- Database/CMS for product data (JSON files scale to 100+ products)
- Redux or complex state management (Zustand already sufficient)
- Separate API routes per product (use dynamic matrix loading)

### Expected Features

**Must have (table stakes):**
- Category overview page with category cards (hub for browsing)
- Category listing pages with product grids (2-column responsive)
- Breadcrumb navigation (Home > Category > Product for context)
- Product cards with images, names, descriptions, and CTAs
- Multiple pricing matrices per product (each product has unique pricing)
- Blog listing page with post grid and metadata
- Blog post detail pages with full content

**Should have (competitive advantage):**
- Product sorting by price/popularity once catalog grows (defer until 10+ products)
- Blog categories/tags for content organization (manual tagging in v1.x)
- Newsletter signup CTA on blog posts (high-value lead capture)
- Load More button for pagination (better UX than infinite scroll)

**Defer (v2+ anti-features):**
- Product reviews/ratings (wait for 10+ real reviews to avoid empty states)
- Advanced filtering (only 2-3 products per category initially, creates friction)
- Wishlist/favorites (adds authentication complexity, doesn't validate core value)
- Blog comments (moderation overhead, typically 3-7% engagement)
- Quick-add to cart from category page (doesn't work for custom dimension products)

### Architecture Approach

The architecture is layered with clear separation: pricing engine remains pure (zero dependencies, accepts matrices as parameters), product module handles business logic (catalog data, matrix path mapping), and API routes orchestrate between them. Category navigation follows a two-level hierarchy (overview → category → product) to avoid over-engineering for small catalogs. Blog content lives separately from product logic to enable future CMS migration.

**Major components:**
1. **Product Data Layer** — TypeScript interfaces for products/categories, JSON-based catalog, separate Shopify variant ID mapping to prevent checkout failures
2. **Pricing Engine (refactored)** — Accepts `pricingMatrix` parameter instead of static import, maintains zero external dependencies, stays portable
3. **API Routes** — `/api/pricing` modified to accept `productId`, load product-specific matrix, pass to calculator; `/api/checkout` unchanged
4. **Category Navigation** — `/products` overview, `/products/[category]` listings, `/products/[productId]` detail (no nesting beyond 2 levels)
5. **Blog Layer** — Velite-processed MDX in `content/blog/`, independent from product catalog, optional product links in posts

**Data flow changes:**
- Current: `POST /api/pricing {width, height}` → load global matrix → calculate
- New: `POST /api/pricing {width, height, productId}` → lookup product → load product matrix → calculate
- Cart/checkout: **unchanged** (already supports multiple products via `productId` field)

### Critical Pitfalls

1. **Hardcoded pricing matrix imports** — Static imports bundle all matrices client-side, bloating bundle 50-100KB per product. **Solution:** Refactor calculator to accept matrix parameter, load matrices server-side in API route, use in-memory cache with 5-min TTL.

2. **Cart ID collisions** — If cart ID generation only hashes dimensions (not productId), different products with same dimensions merge incorrectly. **Solution:** Audit `generateCartItemId()` to ensure productId is included in hash, add integration test for multiple products with identical dimensions.

3. **Route conflicts** — `/products/[productId]` and `/products/rollerblinds` (category) coexist now, but if you add a product with ID "rollerblinds", Next.js has ambiguous routes. **Solution:** Validate product IDs against reserved category slugs, or use separate prefixes (`/products/[productId]` vs `/categories/[slug]`).

4. **Zustand localStorage hydration mismatch** — Server renders with empty cart, client hydrates from localStorage, React throws "Text content does not match" errors. **Solution:** Implement `useHydration()` hook to defer cart rendering until client-side, show placeholder during SSR.

5. **Product data ID inconsistency** — Mixing semantic IDs ("white-rollerblind") with Shopify IDs breaks checkout when Draft Order creation can't map to variant IDs. **Solution:** Add explicit `shopify.variantId` field to product data, separate catalog IDs from integration IDs.

## Implications for Roadmap

Based on research, suggested phase structure prioritizes architectural foundations before UI expansion to avoid refactoring under pressure.

### Phase 1: Product Catalog Foundation
**Rationale:** Establish multi-product data model and pricing architecture before building UI. Fixing architectural issues after catalog expansion is high-risk and breaks existing functionality.

**Delivers:**
- Product data model with categories and `pricingMatrixPath` field
- Refactored pricing engine accepting matrices as parameters
- Split pricing matrices into product-specific JSON files
- Updated `/api/pricing` to accept `productId` and load correct matrix
- Cart ID generation verified to prevent collisions

**Addresses:**
- Must-have feature: Multiple pricing matrices per product
- Architecture: Clean separation between pricing engine and product catalog

**Avoids:**
- Pitfall 1: Hardcoded pricing matrix imports
- Pitfall 2: Cart ID collisions
- Pitfall 4: Hydration mismatches (fix cart rendering)
- Pitfall 5: Product data ID inconsistency
- Pitfall 6: Breaking pricing engine portability

**Research flag:** LOW PRIORITY — Standard Next.js patterns, well-documented refactoring

### Phase 2: Category Navigation & Product Expansion
**Rationale:** Build catalog UI on top of solid data foundation. Two-level hierarchy (overview → category → product) scales to 50+ products without over-engineering.

**Delivers:**
- Products overview page (`/products`) with category cards
- Category listing pages (`/products/[category]`) with product grids
- ProductCard component for reusable product previews
- Breadcrumb navigation component
- Header navigation updated with "Products" link

**Addresses:**
- Must-have: Category overview page, product grids, breadcrumbs
- Should-have: Hover states, responsive layout

**Avoids:**
- Pitfall 3: Route conflicts (validate product IDs against "rollerblinds" slug)
- Pitfall 7: Over-engineering with nested categories

**Research flag:** LOW PRIORITY — Standard e-commerce patterns, extensive documentation available

### Phase 3: Blog Foundation & Content Marketing
**Rationale:** Independent from product catalog, can be built in parallel after Phase 1. Blog drives SEO and user education without complicating pricing/cart logic.

**Delivers:**
- Velite integration for MDX blog posts
- Blog listing page (`/blog`) with post grid
- Blog post detail pages (`/blog/[slug]`)
- BlogPostCard and BlogPostLayout components
- 3 sample blog posts (buying guides, care instructions)

**Addresses:**
- Must-have: Blog listing page, post detail pages, metadata
- Should-have: Newsletter signup CTA

**Avoids:**
- Anti-feature: Blog comments (defer to v2+)
- Pitfall: URL conflicts with products (validate blog slugs don't match routes)

**Research flag:** LOW PRIORITY — Velite documentation clear, MDX patterns established

### Phase 4: Polish & Metadata
**Rationale:** SEO and UX improvements after core functionality validates. Non-blocking enhancements.

**Delivers:**
- Dynamic metadata (title, description, OG images) for all pages
- Footer links updated with product categories and blog
- Product placeholder images added to cards
- Breadcrumb styling and mobile responsiveness improvements
- URL migration: `/thank-you` → `/confirmation` with 301 redirect

**Addresses:**
- Should-have: SEO metadata, consistent navigation
- UX improvements from PITFALLS research

**Avoids:**
- Missing metadata hurting SEO
- Inconsistent navigation confusing users

**Research flag:** SKIP — Standard Next.js metadata APIs, no research needed

### Phase Ordering Rationale

- **Phase 1 first** because it establishes the architectural foundation. Refactoring pricing engine after building catalog UI is high-risk and touches every component. Cart ID collision bugs are silent data corruption that breaks checkout.

- **Phase 2 second** because category navigation depends on Phase 1's product data model and pricing refactor. Building UI before data layer is stable causes thrash and rework.

- **Phase 3 independent** and can run parallel to Phase 2 if needed—blog has zero dependencies on product/pricing logic. However, sequential is safer for solo dev to avoid context switching.

- **Phase 4 last** because it's polish that doesn't block user value. Can be done incrementally or deferred if timeline pressure increases.

**Key dependency chain:** Phase 1 (data/pricing) → Phase 2 (UI) → Phase 4 (polish). Phase 3 (blog) only depends on Phase 1 being complete for consistent navigation patterns.

### Research Flags

**Needs deeper research during planning:**
- None — all phases use well-documented patterns with official Next.js support

**Standard patterns (skip `/gsd:research-phase`):**
- **Phase 1:** Pricing engine refactoring is project-specific but architecturally straightforward
- **Phase 2:** E-commerce category pages have 15+ years of established patterns
- **Phase 3:** Next.js MDX and Velite have clear official documentation
- **Phase 4:** Metadata API is built into Next.js 15, well-documented

**When to use `/gsd:research-phase`:**
- If adding payment processing beyond Shopify checkout (complex integrations)
- If implementing advanced features like product comparison (sparse documentation)
- If scaling beyond 100+ products (database migration research needed)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js 15 capabilities verified from official docs, Velite is active with production usage, Contentlayer abandonment confirmed by maintainer |
| Features | HIGH | E-commerce category page patterns have 15+ years of research (Baymard Institute studies), table stakes identified from competitor analysis |
| Architecture | HIGH | Current codebase reviewed, pricing engine portability verified, multi-product patterns standard in App Router |
| Pitfalls | HIGH | Based on actual codebase analysis + 2026 Next.js patterns, hydration issues documented with solutions |

**Overall confidence:** HIGH

The research is grounded in official Next.js 15 documentation, current codebase analysis, and established e-commerce patterns. Velite is the only "newer" recommendation (vs. abandoned Contentlayer), but it's actively maintained and proven in production.

### Gaps to Address

**No critical gaps.** Minor areas to validate during implementation:

- **Shopify variant ID mapping:** Need to verify existing products have correct Shopify IDs in production store (audit during Phase 1 kickoff)
- **Cart ID generation logic:** Need to inspect actual `generateCartItemId()` implementation to confirm productId inclusion (test during Phase 1)
- **Pricing matrix sizes:** If matrices exceed 50KB, may need compression (unlikely based on current 20cm increments)
- **Blog post volume:** If planning 50+ posts at launch, reconsider JSON vs database (unlikely, start with 3-5 posts)

All gaps are implementation details, not architectural unknowns. They can be addressed during phase execution without blocking progress.

## Sources

### Primary Sources (HIGH confidence)

**Next.js 15 Official Documentation:**
- [Next.js App Router](https://nextjs.org/docs/app) — App Router overview, Server Components
- [Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) — Multi-product routing patterns
- [generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — SEO metadata
- [MDX Guide](https://nextjs.org/docs/app/guides/mdx) — Official MDX support
- [Sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) — Sitemap generation
- [Image Component](https://nextjs.org/docs/app/api-reference/components/image) — Image optimization

**Stack Research (Velite & Content Management):**
- [Contentlayer Abandonment Status](https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives) — Confirmed abandoned
- [Refactoring Contentlayer to Velite](https://www.mikevpeeren.nl/blog/refactoring-contentlayer-to-velite) — Migration guide
- [Integrating Velite in Next.js](https://nooc.me/en/posts/integrate-a-blog-in-nextjs-with-velite) — Implementation patterns
- [gray-matter npm](https://www.npmjs.com/package/gray-matter) — Frontmatter parsing
- [date-fns](https://date-fns.org/) — Date formatting library
- [reading-time npm](https://www.npmjs.com/package/reading-time) — Reading time calculation

**E-commerce Patterns (Baymard Institute & Industry Research):**
- [E-commerce Category Page Design Best Practices](https://www.invespcro.com/blog/ecommerce-category-page-design/) — User expectations
- [Product Lists & Filtering UX Research](https://baymard.com/research/ecommerce-product-lists) — Original UX study
- [E-commerce Breadcrumbs Study](https://baymard.com/blog/ecommerce-breadcrumbs) — 68% get it wrong
- [Ecommerce Product Filters Best Practices](https://thegood.com/insights/ecommerce-product-filters/) — When to add filtering
- [Product Card Design Study](https://www.heyinnovations.com/resources/product-card) — M-commerce optimization

### Secondary Sources (MEDIUM confidence)

**Next.js Architecture & Patterns:**
- [Next.js 15 Complete Senior-Level Guide](https://medium.com/@livenapps/next-js-15-app-router-a-complete-senior-level-guide-0554a2b820f7)
- [Next.js Architecture 2026 — Server-First Patterns](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router)
- [Next.js 15 Advanced Patterns: Caching Strategies](https://johal.in/next-js-15-advanced-patterns-app-router-server-actions-and-caching-strategies-for-2026/)
- [Dynamic Routing Guide](https://thelinuxcode.com/nextjs-dynamic-route-segments-in-the-app-router-2026-guide/)
- [Handling Dynamic Routing in Next.js](https://oneuptime.com/blog/post/2026-01-24-nextjs-dynamic-routing/view)

**Zustand & State Management:**
- [Fixing React Hydration Errors with Zustand Persist](https://medium.com/@judemiracle/fixing-react-hydration-errors-when-using-zustand-persist-with-usesyncexternalstore-b6d7a40f2623)
- [Fix Next.js 14 Hydration Error with Zustand](https://medium.com/@koalamango/fix-next-js-hydration-error-with-zustand-state-management-0ce51a0176ad)
- [NextJS + Zustand localStorage Hydration Errors](https://github.com/pmndrs/zustand/discussions/1382)
- [How to Fix Hydration Mismatch Errors](https://oneuptime.com/blog/post/2026-01-24-fix-hydration-mismatch-errors-nextjs/view)

**Shopify Integration:**
- [Shopify Draft Orders Complete Guide](https://www.revize.app/blog/shopify-draft-orders-guide)
- [DraftOrderLineItem GraphQL Admin](https://shopify.dev/docs/api/admin-graphql/latest/objects/draftorderlineitem)
- [Create Draft Order with Postman](https://www.beehexa.com/devdocs/shopify-api-how-to-create-a-draft-order-using-postman/)

**Breadcrumb Implementation:**
- [Building Dynamic Breadcrumbs in Next.js App Router](https://jeremykreutzbender.com/blog/app-router-dynamic-breadcrumbs)
- [Creating Breadcrumb Component in Next.js](https://medium.com/@kcabading/creating-a-breadcrumb-component-in-a-next-js-app-router-a0ea24cdb91a)
- [Breadcrumb Navigation Ecommerce SEO](https://alienroad.com/seo/breadcrumb-navigation-ecommerce/)

**MDX & Blog Integration:**
- [Building a Blog with Next.js 15 and RSC](https://maxleiter.com/blog/build-a-blog-with-nextjs-13)
- [Minimal MDX Blog with Next.js 15](https://www.mdxblog.io/blog/a-minimal-mdx-blog-with-nextjs-15-and-react-19)

### Tertiary Sources (Context & Validation)

**E-commerce Migration & Pitfalls:**
- [App Router Pitfalls: Common Next.js Mistakes](https://imidef.com/en/2026-02-11-app-router-pitfalls)
- [eCommerce Migration Strategy Guide](https://intexsoft.com/blog/ecommerce-migration-strategy-a-step-by-step-guide-to-successful-platform-upgrades/)
- [E-commerce Migration Pitfalls to Avoid](https://amasty.com/blog/e-commerce-migration-guide/)

**Performance & Optimization:**
- [Optimized Package Imports in Next.js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
- [Import Big JSON Files Only on SSR](https://github.com/vercel/next.js/discussions/23564)
- [Optimizing Next.js Performance](https://www.catchmetrics.io/blog/optimizing-nextjs-performance-bundles-lazy-loading-and-images)

**Shopping Cart Patterns:**
- [Build Shopping Cart with Next.js and Zustand](https://hackernoon.com/how-to-build-a-shopping-cart-with-nextjs-and-zustand-state-management-with-typescript)
- [Building Next.js Shopping Cart App](https://blog.logrocket.com/building-a-next-js-shopping-cart-app/)
- [Shopping Cart Re-render Issues](https://github.com/vercel/next.js/discussions/54335)

---

**Research completed:** 2026-02-13
**Ready for roadmap:** Yes
**Next step:** Create ROADMAP.md with 4 phases based on implications above
