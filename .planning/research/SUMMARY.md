# Project Research Summary

**Project:** Pure Blinds - Dutch Rolgordijnen E-commerce Webshop
**Domain:** Dutch SEO & Content Localization for Next.js 15 E-commerce
**Researched:** 2026-02-14
**Confidence:** HIGH

## Executive Summary

Pure Blinds is transforming from a placeholder English site to a competitive Dutch rolgordijnen (roller blinds) webshop. The research reveals that success in this market requires three critical elements: native-quality Dutch content with informal "je" tone, comprehensive SEO infrastructure using Next.js 15's built-in features, and proper category cleanup with 301 redirects before any content changes.

The recommended approach is to leverage Next.js 15's native capabilities (Metadata API, sitemap.ts, robots.ts) without external SEO packages, implement Dutch content as single-locale inline text (no i18n routing complexity), and structure work in a dependency-driven order: data cleanup first, then content translation, then SEO infrastructure. This avoids the common pitfall of removing categories without redirects or launching with machine-translated Dutch that destroys trust.

The key risk is translation quality. The Dutch market has zero tolerance for poor translation - 90%+ of searches are in Dutch, but machine-translated content is worse than good English. Native speaker review is non-negotiable. Secondary risks include metadata streaming breaking social media bots and missing 301 redirects causing SEO damage when removing venetian-blinds and textiles categories.

## Key Findings

### Recommended Stack

**NO external dependencies required** for SEO functionality. Next.js 15 (already installed as v16.1.6) provides native built-in APIs for all required functionality: Metadata API for meta tags, file conventions for sitemap.xml and robots.txt, native JSON-LD support for structured data. This is a major simplification over older approaches that required next-seo, next-sitemap, or i18n frameworks.

**Core technologies:**
- Next.js 16.1.6 (existing): Metadata API, sitemap/robots.ts conventions — already installed, zero changes needed
- schema-dts (v1.1.5, dev dependency only): TypeScript types for Schema.org JSON-LD — Google-maintained, compile-time validation, zero runtime cost
- No i18n framework: Single Dutch locale, inline content — avoids next-intl complexity for single-language site

**Critical decision:** Do NOT add next-intl, next-sitemap, or react-schemaorg. Next.js native features are superior for single-language sites. The only recommended addition is schema-dts as a dev dependency for type-safe structured data authoring.

### Expected Features

**Must have (table stakes):**
- Dutch homepage hero with "Rolgordijnen op maat" value proposition — every Dutch webshop starts here
- Product type differentiation (transparant vs verduisterend) — market standard, customers expect to choose
- Measurement instructions (inmeetinstructies) — custom products require clear "op de dag" vs "in de dag" guidance
- Free color samples offer (gratis kleurstalen) — industry standard trust builder, all competitors offer this
- Delivery time transparency (7-14 werkdagen) — custom products need clear expectations
- FAQ section with domain-specific questions — customers research extensively before buying custom blinds
- Trust signals (Thuiswinkel Waarborg reference) — 91% recognition rate, 64% find webshops more trustworthy
- Price transparency ("tot 40% goedkoper") — competitive market emphasizes value pricing

**Should have (competitive differentiators):**
- Direct-from-factory messaging — builds trust through transparency, justifies pricing
- Room-specific guidance (slaapkamer, badkamer, dakraam) — helps customers make informed choices
- Sustainability messaging (isolerende eigenschappen) — 2026 trend: natural materials, energy efficiency
- Blog content: buying guides ("Welk rolgordijn voor welke kamer?") — educational approach builds authority
- Step-by-step configurator explanation — reduces anxiety about custom ordering process

**Defer (v2+):**
- Live chat support — Dutch market prefers email/phone, requires staffing
- Virtual room visualizer — high complexity, low conversion impact for blinds
- Product reviews — new shop has no reviews yet, empty sections hurt trust
- Multi-language support — Netherlands-only market is sufficient, avoid splitting focus

**Anti-features (commonly requested, but problematic):**
- Real-time price comparison widgets — drives customers away before value is established
- Hyper-local SEO (per-city landing pages) — thin content penalty risk, maintenance burden
- Blog posts about unrelated topics — dilutes domain authority for rolgordijnen keywords

### Architecture Approach

Next.js 15 App Router's Metadata API and file-based metadata conventions provide first-class SEO support without external packages. Dutch content implemented as single-locale inline content (components + JSON data) without i18n routing complexity. Build order is dependency-driven: data updates → route removal → content updates → SEO infrastructure. This prevents broken references and ensures clean architecture.

**Major components:**
1. Metadata API Layer — Static `metadata` object for static pages, `generateMetadata()` for dynamic routes; hierarchical merging from root to page level
2. Content Layer — Dutch content in data/products.json for product catalog, inline Dutch in page components for static content
3. Structured Data Layer — JSON-LD `<script>` tags in page components using schema-dts types; Product schema for products, FAQPage for FAQ, LocalBusiness for root layout
4. SEO Infrastructure — sitemap.ts generates sitemap.xml from catalog + blog at build time, robots.ts configures crawling rules
5. Product Catalog — data/products.json remains single source of truth; modified with Dutch translations, venetian-blinds and textiles categories removed

**Critical pattern:** Use static metadata for critical pages (homepage, main categories) to avoid metadata streaming issues with social media bots. Reserve `generateMetadata()` for truly dynamic content (product details, blog posts).

### Critical Pitfalls

1. **Removing product categories without 301 redirects** — Deleting venetian-blinds and textiles routes without redirects causes loss of search rankings, broken backlinks, and poor UX. Google may interpret sudden 404 spike as quality issue. MUST implement 301 redirects in next.config.js BEFORE removing routes, redirect to relevant pages (not homepage), and update sitemap immediately. Address in Phase 1 before any other changes.

2. **Dutch translation quality destroying trust** — Machine translation creates unnatural phrasing, grammar errors (de/het articles), wrong terminology, and formal/informal mismatch (u vs je). 90%+ of Dutch searches are in Dutch, but poor Dutch is worse than good English. MUST use native Dutch speaker (Netherlands, not Belgium), create terminology glossary, reference competitor websites, and test with native speakers before launch. Non-negotiable for ecommerce trust. Address in Phase 2 during content creation.

3. **Metadata streaming breaking social media bots** — Next.js 15 streams metadata after initial HTML, but Facebook/LinkedIn/WhatsApp bots are HTML-limited and can't execute JavaScript. Open Graph tags end up in `<body>` instead of `<head>`, causing broken social preview cards. MUST use static metadata object (not `generateMetadata`) for critical pages, configure `htmlLimitedBots` in next.config.js to block streaming for social bots, and test with Facebook Sharing Debugger before launch. Address in Phase 2 when implementing meta tags.

4. **Open Graph locale format breaking social sharing** — Using `nl-NL` (hyphen) instead of `nl_NL` (underscore) causes Facebook/LinkedIn to ignore locale metadata. Open Graph protocol requires underscore format, unlike hreflang which uses hyphen. MUST use `locale: 'nl_NL'` in openGraph object and use `property="og:locale"` not `name="og:locale"` in meta tags. Validate with social media debuggers. Address in Phase 2.

5. **Structured data XSS vulnerability** — Direct `JSON.stringify()` in JSON-LD `<script>` tags without sanitization creates XSS risk if product data contains `</script>` injection. MUST replace `<` with `\\u003c` using `.replace(/</g, '\\u003c')` or use serialize-javascript package. Never inject raw user input without validation. Address in Phase 3 when implementing Schema.org markup.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Category Cleanup & Route Restructuring
**Rationale:** MUST come first to prevent SEO damage. Removing categories without proper redirects loses rankings and creates poor UX. Data layer must be clean before content updates to avoid broken references.

**Delivers:**
- Removed venetian-blinds and textiles categories from product catalog
- 301 redirects configured in next.config.js for all removed routes
- Updated sitemap filter to exclude removed categories
- Clean data foundation for Dutch content

**Addresses:**
- Pitfall #1 (missing 301 redirects)
- Pitfall #7 (sitemap contains removed routes)
- Clean slate for content translation

**Avoids:**
- Loss of search engine rankings
- Broken backlinks from external sites
- Wasted crawl budget on removed pages
- 404 errors for users with bookmarks

**Research flag:** Standard pattern (well-documented 301 redirect implementation), skip research-phase.

### Phase 2: Dutch Content & Metadata
**Rationale:** Content quality is non-negotiable for ecommerce trust. All pages need unique Dutch content and metadata before SEO infrastructure to ensure social bots get proper tags. Static metadata for critical pages prevents streaming issues.

**Delivers:**
- Root layout lang="nl-NL" attribute
- Homepage Dutch copy (hero, about, services sections)
- Category/subcategory Dutch copy (rolgordijnen, transparante, verduisterende)
- Product page template Dutch copy
- FAQ Dutch content (8-12 questions)
- Dutch meta tags (title, description) for all pages
- Open Graph tags with nl_NL locale
- Blog post: "Welk rolgordijn voor welke kamer?" buying guide

**Addresses:**
- Must-have features: Dutch homepage, product differentiation, FAQ, trust signals
- Pitfall #3 (translation quality) — native speaker review required
- Pitfall #2 (metadata streaming) — static metadata for critical pages
- Pitfall #4 (Open Graph locale) — nl_NL with underscore
- Pitfall #9 (duplicate meta descriptions) — unique descriptions per page

**Uses:**
- Next.js Metadata API (built-in)
- Competitor content patterns from FEATURES.md research
- Tone of voice: friendly "je", helpful, clear

**Avoids:**
- Machine-translated Dutch destroying trust
- Generic metadata hurting SEO
- Social media preview failures
- Language mismatch confusing users

**Research flag:** Content-focused phase, no technical research needed. Translation quality verification required (native speaker review).

### Phase 3: Structured Data & Rich Snippets
**Rationale:** After content is stable, add Schema.org markup for rich search results. Requires finalized Dutch content to populate schema fields. Technical implementation using schema-dts for type safety.

**Delivers:**
- schema-dts installed (dev dependency)
- Product schema for product pages (price in EUR, availability)
- FAQPage schema for FAQ section
- LocalBusiness schema in root layout (GEO optimization)
- BreadcrumbList schema in breadcrumbs component
- JSON-LD wrapper component with XSS protection

**Addresses:**
- Competitive feature: structured data for rich results eligibility
- Pitfall #5 (JSON-LD XSS) — proper escaping with .replace(/</g, '\\u003c')
- SEO enhancement through rich snippets

**Uses:**
- schema-dts types (Google-maintained)
- Next.js JSON-LD pattern (script tags in components)

**Implements:**
- Structured Data Layer from architecture (Pattern 2: JSON-LD Injection)

**Avoids:**
- XSS vulnerability through unescaped JSON
- Invalid schema markup hurting SEO
- Missing required schema properties

**Research flag:** Standard pattern (well-documented Schema.org implementation), skip research-phase. Validate with Rich Results Test during implementation.

### Phase 4: Sitemap & Robots.txt
**Rationale:** After all routes and content are finalized, generate sitemap and configure crawling rules. Depends on product catalog cleanup (Phase 1) and content finalization (Phase 2). Ensures search engines crawl efficiently.

**Delivers:**
- sitemap.ts generating sitemap.xml from catalog + blog
- robots.txt via robots.ts with crawling rules
- noindex robots meta for cart/confirmation pages
- Sitemap submitted to Google Search Console

**Addresses:**
- SEO infrastructure requirement
- Pitfall #7 (sitemap contains removed routes) — filter excludes removed categories
- Pitfall #8 (robots.txt blocking pages) — only block admin/api routes

**Uses:**
- Next.js sitemap.ts file convention (built-in)
- Next.js robots.ts file convention (built-in)
- MetadataRoute types for type safety

**Implements:**
- SEO Infrastructure from architecture (Pattern 3: Sitemap Generation)

**Avoids:**
- Outdated sitemap wasting crawl budget
- Accidentally blocking public pages
- Missing sitemap reference in robots.txt

**Research flag:** Standard pattern (Next.js file conventions), skip research-phase.

### Phase Ordering Rationale

1. **Phase 1 before Phase 2:** Data layer must be clean before content updates to prevent broken references. Redirects must be in place before announcing Dutch launch to preserve SEO equity.

2. **Phase 2 before Phase 3:** Structured data requires finalized Dutch content to populate schema fields. No point generating schemas for placeholder English content.

3. **Phase 3 before Phase 4:** Sitemap should include structured data pages so rich results can be crawled. Though not strictly dependent, logical to finalize on-page SEO before submission infrastructure.

4. **Critical path:** Phase 1 → Phase 2 → Phase 4 provides working Dutch site with SEO. Phase 3 (structured data) is enhancement that can be done in parallel or after Phase 4 if needed.

5. **Dependency diagram:**
   ```
   Phase 1 (Data Cleanup)
       ↓
   Phase 2 (Dutch Content) ← must wait for clean data
       ↓
   Phase 3 (Structured Data) ← must wait for Dutch content
       ↓
   Phase 4 (Sitemap/Robots) ← must wait for finalized routes
   ```

6. **Pitfall avoidance:** This order prevents all 10 critical pitfalls discovered in research by addressing foundational issues (redirects, data cleanup) before building on top (content, SEO).

### Research Flags

**Phases likely needing deeper research during planning:**
- None — all phases use standard Next.js patterns and well-documented SEO practices

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Standard 301 redirect implementation in next.config.js, documented in Next.js guides
- **Phase 2:** Content translation (requires native speaker, not technical research) + standard Metadata API usage
- **Phase 3:** Schema.org markup follows official examples, schema-dts has comprehensive documentation
- **Phase 4:** Next.js file conventions for sitemap.ts and robots.ts are well-documented

**Validation during implementation:**
- Phase 2: Native Dutch speaker review required (content quality, not research)
- Phase 2: Test with Facebook Sharing Debugger, LinkedIn Post Inspector (validation, not research)
- Phase 3: Test with Google Rich Results Test, Schema Markup Validator (validation, not research)
- Phase 4: Test with Google Search Console robots.txt tester (validation, not research)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js 15 built-in features verified in official docs (v16.1.6 released 2026-02-11), schema-dts verified on npm (v1.1.5 Google-maintained) |
| Features | MEDIUM-HIGH | Based on competitor analysis of 7+ Dutch rolgordijnen webshops, Dutch SEO expert sources, and industry patterns. Content patterns consistent across market. |
| Architecture | HIGH | Next.js 15 App Router patterns verified in official docs, metadata API stable since v13.2.0, file conventions since v13.3.0. Single-locale approach well-established. |
| Pitfalls | HIGH | Verified with official Next.js docs, multiple Dutch SEO sources, ecommerce category removal guides, and GitHub issues for metadata streaming bug. |

**Overall confidence:** HIGH

Research is based on official documentation (Next.js, Schema.org, Open Graph protocol), verified npm packages, multiple Dutch SEO expert sources, and competitive analysis of established Dutch webshops. The stack recommendations are conservative (use built-in features) and architecture patterns are standard for Next.js 15.

### Gaps to Address

**Translation quality validation:** Research identified that translation quality is critical, but cannot be validated until content is written. **Resolution:** Budget for native Dutch speaker review in Phase 2, use competitor sites as reference for terminology and tone.

**Social media bot behavior:** Metadata streaming pitfall is based on known Next.js 15 issue, but social bot behavior can vary. **Resolution:** Test with Facebook Sharing Debugger, LinkedIn Post Inspector during Phase 2 implementation. Use static metadata approach for critical pages as preventive measure.

**Redirect destination mapping:** Research recommends redirecting removed categories to relevant pages, but specific mapping depends on existing backlink profile. **Resolution:** Check Google Search Console for indexed pages and backlinks during Phase 1 planning to determine optimal redirect destinations.

**Blog content volume:** Research suggests starting with 1 blog post, but optimal volume for SEO unclear. **Resolution:** Launch with 1 comprehensive buying guide in Phase 2, add additional posts in future phases based on analytics (search queries, FAQ patterns).

**GEO optimization scope:** LocalBusiness schema recommended for Netherlands targeting, but unclear if Google Mijn Bedrijf (Google My Business) integration is needed. **Resolution:** Defer Google Mijn Bedrijf to future phase, implement LocalBusiness schema in Phase 3 as foundation for future local SEO.

## Sources

### Primary (HIGH confidence)
- [Next.js Official Docs: Metadata API](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) — Complete metadata guide (2026-02-11)
- [Next.js Official Docs: generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — Full API specification
- [Next.js Official Docs: sitemap.xml](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) — File convention and types
- [Next.js Official Docs: robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) — File convention and types
- [Next.js Official Docs: JSON-LD](https://nextjs.org/docs/app/guides/json-ld) — Recommended patterns
- [schema-dts npm](https://www.npmjs.com/package/schema-dts) — v1.1.5, Google-maintained
- [Open Graph Protocol](https://ogp.me/) — Official OG tag specification

### Secondary (MEDIUM confidence)
- [Veneta.com](https://www.veneta.com/rolgordijnen/) — Dutch rolgordijnen competitor content patterns
- [Raamdecoratie.com](https://www.raamdecoratie.com/) — Competitor analysis for tone/features
- [123Jaloezie.nl](https://www.123jaloezie.nl/) — Price-focused competitor positioning
- [SEO voor webshops 2026 - Ranking Masters](https://rankingmasters.nl/seo-webshops) — Dutch SEO best practices
- [SEO Structuur - Ranking Masters](https://rankingmasters.nl/seo-structuur/) — Category page optimization
- [Verbeter SEO Categoriepagina's - IMU](https://imu.nl/internet-marketing-kennisbank/webshop-marketing/seo-webwinkel-categoriepaginas/) — 250-300 word guideline
- [Thuiswinkel Waarborg](https://www.thuiswinkel.org/en/trust/trustmarks/thuiswinkel-waarborg/) — Trust badge recognition (91%)
- [301 Redirect Best Practices - Volusion](https://www.volusion.com/blog/301-redirect-scenarios-and-best-practices-for-ecommerce/)
- [App Router pitfalls - imidef](https://imidef.com/en/2026-02-11-app-router-pitfalls) — Metadata streaming issue

### Tertiary (LOW confidence)
- [Dutch SEO Guide - IndigoExtra](https://www.indigoextra.com/blog/dutch-seo) — General Dutch SEO advice
- [Complete Guide for Dutch SEO - RankTracker](https://www.ranktracker.com/blog/a-complete-guide-for-doing-seo-in-dutch/) — Industry insights
- [Next.js 15 SEO Guide - Digital Applied](https://www.digitalapplied.com/blog/nextjs-seo-guide) — Community practices

---
*Research completed: 2026-02-14*
*Ready for roadmap: yes*
