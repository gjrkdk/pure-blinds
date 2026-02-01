# Project Research Summary

**Project:** v1.1 - Multi-Page Website with SEO Foundation
**Domain:** E-commerce website expansion for custom textile configurator
**Researched:** 2026-02-01
**Confidence:** HIGH

## Executive Summary

The v1.1 milestone extends the existing Next.js 15 custom textile e-commerce application with multi-page website structure, SEO foundation, and legal compliance pages. Research reveals a clear path: **leverage Next.js 15+ built-in features first** (Metadata API, sitemap generation, robots.txt), add minimal external dependencies (Resend for contact forms), and avoid over-engineering with premature blog infrastructure or MDX. The validated v1.0 stack (Next.js 16.1.6, React 19, Zustand, Shopify integration) remains untouched.

The recommended approach is incremental and additive. Start with SEO infrastructure (metadata, sitemap, robots.txt) before adding content pages. This allows each new page to launch with proper SEO from day one. Build simple TSX-based content pages (homepage, FAQ, policies) rather than investing in MDX or CMS solutions—these are 5-10 static pages that change infrequently. Add Resend for the contact form with layered spam protection (honeypot, CAPTCHA, rate limiting). Defer blog content to post-MVP validation of content marketing need.

Key risks center on **legal compliance** (GDPR cookie consent, Dutch DPA enforcement, missing KVK/VAT display) and **integration breaking existing pages** (new shared layout conflicting with v1.0 product configurator). Mitigation: implement GDPR-compliant cookie consent before any analytics, test existing pages after every layout change, and use Dutch e-commerce legal templates with 14-day return policy. The research identified 10 critical pitfalls with specific prevention strategies mapped to implementation phases.

## Key Findings

### Recommended Stack

Next.js 15+ eliminated the need for external SEO packages. The App Router provides native support for metadata (Metadata API with `generateMetadata`), sitemaps (`sitemap.ts`), robots.txt (`robots.ts`), and Open Graph images. Research confirmed that packages like `next-seo` and `next-sitemap` are deprecated and unnecessary—Next.js built-in features are superior and type-safe.

**Core technologies:**
- **Resend** (^6.7.0): Contact form email delivery — Modern developer API, Server Actions native, free tier sufficient (100 emails/day). Superior to SendGrid (complex, expensive) and Nodemailer (SMTP management, not serverless-friendly).
- **schema-dts** (^1.x, optional dev dependency): TypeScript types for Schema.org JSON-LD — Provides autocomplete and validation for structured data without runtime cost.
- **@tailwindcss/typography** (^0.5.x, optional): Prose styling for long-form content — Only if content pages need automatic paragraph/heading styling. May need v1.x for Tailwind CSS 4 compatibility.

**Critical decision: Skip MDX for v1.1.** All content pages (homepage, FAQ, policies, thank you) are static and infrequently updated. Use plain TSX components. MDX adds build complexity, requires configuration, and increases bundle size without providing value for 10 static pages. Re-evaluate only if blog launches with 1+ posts/week.

**New production dependencies: 1-2 packages** (Resend required, optional react-email for templated emails). Everything else uses Next.js built-in features.

### Expected Features

**Must have (table stakes):**
- **Homepage** — Primary entry point for organic traffic, value proposition within seconds, self-segmentation for custom products
- **Privacy policy** — GDPR requirement (€20M fine risk), must detail data collection, usage, retention, user rights
- **Shipping & returns policy** — Dutch Distance Selling Act: 14-day cooling-off period, must inform before purchase
- **Terms & conditions** — Legal protection, contract terms, standard for e-commerce
- **Contact page with form** — Trust signal, support access, spam protection required
- **FAQ page** — Reduces support tickets 30-40%, SEO benefit via long-tail keywords and FAQ schema
- **SEO foundation** — Meta tags (title, description), Open Graph for social sharing, sitemap.xml, robots.txt
- **Cart page (dedicated)** — Table stakes despite overlay existing, conversion best practice for reviewing full order
- **Thank you page** — Post-checkout expectation, legal requirement in Netherlands, shows order details and next steps

**Should have (competitive advantage):**
- **JSON-LD structured data** — Rich snippets in search results (Product, Organization, FAQPage schemas), not auto-generated, manual implementation required
- **Blog structure** — 43% of e-commerce traffic from organic search, builds topical authority, defer content to post-launch
- **Dynamic OG images** — Better social engagement, use Next.js ImageResponse, start with static images initially

**Defer (v2+):**
- **Multi-language support (EN/NL)** — Wait for market data validating language preference
- **User accounts** — Unnecessary for custom one-off purchases, adds GDPR obligations, consider only if repeat purchase rate justifies
- **Live chat/chatbot** — Premature without support ticket volume data
- **Advanced SEO** — Technical audits, backlink strategy after core content indexed

### Architecture Approach

The architecture extends the existing v1.0 structure with additive-only changes. New pages integrate via Next.js App Router conventions without modifying existing product configurator or cart functionality. Root layout gains navigation and footer components, but existing page logic remains isolated.

**Major components:**
1. **Root Layout with Metadata** — Wraps all pages with navigation, footer, sets `metadataBase` for absolute OG image URLs, uses title template for DRY metadata
2. **SEO Layer** — `app/sitemap.ts` generates sitemap.xml dynamically, `app/robots.ts` generates robots.txt, `generateMetadata` exports per page for type-safe SEO
3. **Contact Form with Server Action** — Client component form calls Server Action with Zod validation, Server Action uses Resend API to send email, follows same pattern as existing `/api/pricing` route
4. **Content Pages as TSX Components** — Homepage, FAQ, policies built as plain React Server Components, no markdown processing, full type safety and refactoring support
5. **JSON-LD Structured Data** — Inline `<script type="application/ld+json">` tags in page components, schema-dts types prevent typos, escape `<` characters for XSS prevention

**File structure changes:**
- Add 9+ new page routes (homepage, /cart enhancements, /thank-you, /contact, /faq, 4 policy pages)
- Add `sitemap.ts` and `robots.ts` at app root
- Add `actions/contact.ts` for email Server Action
- Extract navigation and footer into `/components/layout`
- NO changes to existing `/api/` routes or product configurator

**Critical pattern: Incremental rollout.** Apply new shared layout to one new page first, verify existing pages still work, then expand. Prevents breaking v1.0 product configurator with CSS conflicts or client/server boundary violations.

### Critical Pitfalls

1. **Missing metadataBase causing broken OG images** — Open Graph images appear as relative URLs, social platforms cannot fetch. Fix: Set `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL)` in root layout BEFORE implementing page metadata. Validate with Facebook Sharing Debugger.

2. **GDPR cookie consent violations (Dutch DPA enforcement)** — Loading Google Analytics or tracking before user consent. Dutch DPA actively fines €600K-€40K. 50% of webshops fail compliance. Fix: Block all tracking scripts until consent, "Reject All" button equally prominent as "Accept All", no cookie walls. Implement CMP or custom solution BEFORE adding any analytics.

3. **Contact form spam overwhelming inbox** — Bots submit 100+ forms daily without protection. Fix: Layer multiple defenses (honeypot field, invisible CAPTCHA, server-side rate limiting, email domain validation, time-based validation). Implement BEFORE launching contact form.

4. **Breaking existing pages during design refresh** — New shared layout conflicts with v1.0 product configurator, localStorage access causes SSR errors, CSS specificity wars. Fix: Test existing pages after every layout change, use route groups to isolate new pages initially, audit client/server boundaries.

5. **Missing legal pages required for Dutch e-commerce** — Launching without KVK number, VAT ID, 14-day return policy violates Dutch law. Fix: Footer must display full business info (KVK, VAT, address, contact), use GDPR-compliant privacy policy templates, explicitly state 14-day cooling-off period. Legal pages are BLOCKER for production launch.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: SEO Foundation
**Rationale:** Infrastructure before content. Setting up metadata patterns, sitemap, and robots.txt first allows all subsequent pages to launch with proper SEO. No external packages needed—all Next.js built-in features.

**Delivers:**
- `metadataBase` configured in root layout (prevents broken OG images)
- Title template for DRY metadata (`'%s | Brand Name'`)
- `app/sitemap.ts` generating sitemap.xml (initially static routes only)
- `app/robots.ts` generating robots.txt
- Shared metadata utilities in `lib/metadata/defaults.ts`

**Addresses:** SEO foundation (table stakes from FEATURES.md), prevents Pitfall #1 (missing metadataBase)

**Avoids:** Pitfall #9 (accidentally exposing secrets) by establishing `NEXT_PUBLIC_SITE_URL` pattern correctly

**Research flag:** Standard Next.js patterns, skip research-phase. Official docs are comprehensive.

### Phase 2: Layout & Navigation
**Rationale:** Shared layout structure is dependency for all content pages. Extract navigation, create footer, but TEST existing pages before proceeding. Route groups provide isolation if needed.

**Delivers:**
- Navigation component extracted from existing layout
- Footer component with legal info (KVK, VAT, policies links)
- Root layout updated with nav + footer
- Verification that existing product/cart pages still work

**Addresses:** Navigation expectation (UX requirement), footer legal disclosure (Dutch law requirement)

**Avoids:** Pitfall #5 (breaking existing pages) via incremental testing, Pitfall #6 (missing legal info in footer)

**Research flag:** Standard layout patterns, skip research-phase. Watch for CSS conflicts with existing pages.

### Phase 3: Legal & Policy Pages
**Rationale:** BLOCKER for production launch. Cannot legally operate EU e-commerce without GDPR privacy policy and Dutch 14-day return policy. Simple static pages, no complex logic.

**Delivers:**
- Privacy policy (GDPR-compliant template customized for business)
- Terms & conditions
- Shipping policy
- Returns policy (14-day cooling-off period for Netherlands)
- All linked from footer
- Each page has `generateMetadata` for SEO

**Addresses:** Legal compliance (must-have), GDPR requirement, Dutch Distance Selling Act

**Avoids:** Pitfall #6 (missing legal pages, regulatory violations)

**Research flag:** Legal templates available, skip technical research. Consider legal review before launch.

### Phase 4: Homepage & Content Pages
**Rationale:** With layout and legal pages in place, build primary entry point (homepage) and supporting content (FAQ, thank you page). Use TSX components, defer MDX.

**Delivers:**
- Homepage with hero, value proposition, product highlights, trust signals
- FAQ page with structured questions, FAQ schema markup for rich snippets
- Thank you page (post-checkout confirmation, shows order details)
- Cart page enhancements (metadata, improved layout)
- All pages use shared metadata patterns from Phase 1

**Addresses:** Homepage (table stakes), FAQ (reduces support load, SEO), thank you page (legal requirement)

**Uses:** Metadata utilities (Phase 1), shared layout (Phase 2)

**Implements:** Content pages architecture pattern (TSX components)

**Avoids:** Pitfall #2 (shallow metadata merge) by using shared metadata utilities

**Research flag:** Standard content page patterns, skip research-phase. Consider UX research for homepage messaging.

### Phase 5: Contact Form
**Rationale:** Interactive feature requiring server-side integration. Spam protection is critical—implement layered defenses before launch.

**Delivers:**
- Contact page with form UI
- Server Action for form submission (Zod validation)
- Resend integration for email delivery
- Spam protection (honeypot field + invisible CAPTCHA + rate limiting)
- Success/error states, loading UI

**Addresses:** Contact page (table stakes), support access

**Uses:** Resend from STACK.md, Server Action pattern

**Avoids:** Pitfall #4 (contact form spam) via layered protection

**Research flag:** Email service integration needs testing. Resend API is well-documented but verify deliverability.

### Phase 6: Structured Data & SEO Enhancements
**Rationale:** With content pages live, add JSON-LD schemas for rich results. Optional enhancement that improves SEO but not blocking for launch.

**Delivers:**
- Organization schema on homepage (business info, logo, contact)
- Product schema on product page (price, availability)
- FAQPage schema on FAQ (Q&A pairs for rich snippets)
- Validation with Google Rich Results Test

**Addresses:** JSON-LD structured data (competitive advantage from FEATURES.md)

**Uses:** schema-dts types (optional from STACK.md)

**Avoids:** Pitfall #10 (JSON-LD syntax errors) by using TypeScript objects + validation

**Research flag:** Schema.org documentation is extensive. Validate each schema type before implementation.

### Phase 7: Design Refresh & GDPR Compliance (CRITICAL)
**Rationale:** Final polish and mandatory compliance. Cookie consent MUST be implemented before any analytics or marketing pixels. Test across devices.

**Delivers:**
- GDPR-compliant cookie consent (CMP or custom solution)
- Tailwind theme customization for brand
- @tailwindcss/typography for content pages
- Mobile responsiveness testing
- Accessibility audit (alt text, semantic HTML, keyboard navigation)

**Addresses:** GDPR requirement (legal blocker), design consistency, UX polish

**Avoids:** Pitfall #3 (GDPR violations, Dutch DPA fines) by implementing consent before analytics

**Research flag:** Cookie consent libraries (CookieBot, OneTrust) or custom implementation need evaluation. GDPR compliance requires legal validation.

### Phase 8: Blog Structure (OPTIONAL, Post-MVP)
**Rationale:** Defer to validate content marketing need. 43% of e-commerce traffic from organic, but blog requires ongoing content creation. Structure can wait until content strategy is confirmed.

**Delivers:**
- Blog listing page
- Blog post template (markdown or MDX)
- Markdown processing utilities
- Dynamic sitemap entries for blog posts
- BlogPosting JSON-LD schema

**Addresses:** Blog (competitive advantage, deferred from FEATURES.md)

**Uses:** MDX setup from STACK.md (only if needed), existing metadata patterns

**Avoids:** Over-engineering by deferring until validated need

**Research flag:** MDX vs markdown decision needs content strategy input. Skip until blog content plan exists.

### Phase Ordering Rationale

- **SEO Foundation first** — Infrastructure enables all pages to launch with metadata/sitemap. No dependencies, pure Next.js features.
- **Layout second** — Shared structure needed before building pages, but test existing pages to avoid breaking changes.
- **Legal pages third** — Blocker for launch, simple implementation, no complex dependencies.
- **Homepage/content fourth** — Leverages all prior phases (metadata, layout, legal links), delivers user-facing value.
- **Contact form fifth** — Standalone feature, requires external service (Resend), benefits from existing pages being live for testing.
- **Structured data sixth** — Enhancement of existing pages, not blocking, can iterate post-launch.
- **Design refresh seventh** — Final polish after all pages exist, GDPR compliance critical before analytics.
- **Blog eighth** — Optional, high effort, defer until content strategy validated.

This ordering minimizes risk by validating infrastructure before building features, keeps legal compliance early (blocks launch), and defers high-effort/low-certainty work (blog) to post-MVP.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 5 (Contact Form):** Email deliverability testing with Resend, spam protection effectiveness, rate limiting implementation on Vercel
- **Phase 6 (Structured Data):** Schema.org vocabulary for specific business type, validation with Google Rich Results Test
- **Phase 7 (GDPR Compliance):** Cookie consent library selection, Dutch DPA compliance verification, legal review of privacy policy

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (SEO Foundation):** Next.js Metadata API is well-documented, official guides sufficient
- **Phase 2 (Layout & Navigation):** Standard React component extraction, Next.js layout conventions
- **Phase 3 (Legal Pages):** Templates available, content-focused not technically complex
- **Phase 4 (Homepage & Content):** Standard content page implementation
- **Phase 8 (Blog):** Well-established MDX patterns, defer until needed

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official Next.js docs verified, Resend comparison research from multiple 2026 sources, version compatibility confirmed |
| Features | HIGH | E-commerce best practices from industry sources, GDPR/Dutch law requirements from official government sites, UX patterns from established retailers |
| Architecture | HIGH | Next.js App Router patterns directly from official docs, Server Actions established in existing v1.0 codebase, incremental approach proven safe |
| Pitfalls | HIGH | Verified from Next.js GitHub issues, GDPR enforcement cases from Dutch DPA, spam prevention from 2026 security guides |

**Overall confidence: HIGH**

All four research areas draw from authoritative sources: official Next.js documentation for technical implementation, government websites for legal requirements (business.gov.nl, GDPR.eu, Dutch DPA), and recent 2026 community guides for best practices. The v1.0 codebase provides validated patterns (Zustand, Server Actions, Shopify integration) that inform v1.1 approach.

### Gaps to Address

**Legal content customization:** Privacy policy and terms & conditions templates need customization with actual business details (company name, address, data retention periods, specific cookie usage). Legal review recommended before launch if budget allows.

**Email deliverability:** Resend free tier should be sufficient (100 emails/day), but verify deliverability with real email addresses across providers (Gmail, Outlook) during Phase 5 implementation. Monitor spam folder placement.

**Cookie consent implementation details:** Research identified need for GDPR-compliant CMP but didn't select specific solution. During Phase 7, evaluate CookieBot vs OneTrust vs custom solution based on budget and technical requirements.

**Homepage messaging:** Research covers structure and SEO but not actual copy/messaging. Content writer or stakeholder input needed for value proposition, trust signals, product descriptions.

**MDX configuration:** If blog is implemented (Phase 8), verify @next/mdx compatibility with Next.js 16.1.6 and Tailwind CSS 4. May need plugin updates.

**Dynamic sitemap scaling:** Current sitemap approach lists static routes. If product catalog expands beyond single product type, revisit `generateSitemaps()` pattern for 50K+ URL scaling.

## Sources

### Primary (HIGH confidence)

**Official Next.js Documentation:**
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js Sitemap Generation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js Robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld)
- [Next.js Forms & Server Actions](https://nextjs.org/docs/app/guides/forms)
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx)
- [Next.js Data Security](https://nextjs.org/docs/app/guides/data-security)

**Official Package Documentation:**
- [Resend npm](https://www.npmjs.com/package/resend) — v6.7.0 (Jan 2026)
- [Resend Next.js Integration](https://resend.com/nextjs)
- [react-email npm](https://www.npmjs.com/package/react-email) — v5.2.5 (Jan 2026)
- [schema-dts npm](https://www.npmjs.com/package/schema-dts)

**Legal & Compliance (Government/Official Sources):**
- [Dutch Business.gov.nl - Online Sales Requirements](https://business.gov.nl/regulation/long-distance-sales-and-purchases/)
- [KVK VAT Rules for E-commerce EU](https://www.kvk.nl/en/international/vat-rules-for-e-commerce-in-the-eu/)
- [Dutch Business Numbers Requirements](https://business.gov.nl/starting-your-business/registering-your-business/lei-rsin-vat-and-kvk-number-which-is-which/)
- [Dutch DPA Cookie Consent Guidelines](https://secureprivacy.ai/blog/how-to-comply-with-the-dutch-dpas-cookie-consent-guideline)
- [GDPR Cookie Requirements EU 2026](https://cookiebanner.com/blog/cookie-banner-requirements-by-country-eu-overview-2026/)

### Secondary (MEDIUM confidence)

**SEO & Best Practices (2026 Community Sources):**
- [Next.js 15 SEO Best Practices 2026](https://www.digitalapplied.com/blog/nextjs-seo-guide)
- [Complete Next.js SEO Guide](https://www.adeelhere.com/blog/2025-12-09-complete-nextjs-seo-guide-from-zero-to-hero)
- [Next.js Server Actions Best Practices 2026](https://dev.to/marufrahmanlive/nextjs-server-actions-complete-guide-with-examples-for-2026-2do0)
- [Resend vs SendGrid vs Nodemailer Comparison](https://dev.to/ethanleetech/5-best-email-services-for-nextjs-1fa2)

**E-commerce Structure:**
- [E-commerce Website Architecture Guide 2026](https://www.resultfirst.com/blog/ecommerce-seo/ecommerce-website-architecture/)
- [25 Must-Have Pages for E-commerce](https://www.barrelny.com/posts/25-must-have-pages-for-your-ecommerce-website)
- [E-commerce Homepage Design Best Practices 2026](https://decodeup.com/blog/ecommerce-homepage-design-best-practices)
- [Comprehensive E-commerce SEO Guide 2026](https://seoprofy.com/blog/ecommerce-seo/)

**Contact Form & Security:**
- [Contact Form Spam Prevention 2026](https://www.nutshell.com/blog/8-ways-to-combat-form-spam)
- [Invisible CAPTCHA Best Practices](https://stytch.com/blog/prevent-contact-form-spam/)
- [Contact Form Design Best Practices](https://mailchimp.com/resources/contact-form-design/)

### Tertiary (Community Insights)

**Structured Data & JSON-LD:**
- [Common JSON-LD Schema Issues](https://zeo.org/resources/blog/most-common-json-ld-schema-issues-and-solutions)
- [Schema.org with Next.js](https://mikebifulco.com/posts/structured-data-json-ld-for-next-js-sites)
- [JSON-LD in Next.js 15 App Router](https://medium.com/@sureshdotariya/json-ld-in-next-js-15-app-router-product-blog-and-breadcrumb-schemas-f752b7422c4f)

**Implementation Patterns:**
- [MDX with Next.js Best Practices](https://staticmania.com/blog/markdown-and-mdx-in-next.js-a-powerful-combination-for-content-management)
- [Next.js Contact Form App Router](https://maxschmitt.me/posts/nextjs-contact-form-app-router)
- [Next.js Folder Structure Best Practices 2026](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide)

---

**Research completed:** 2026-02-01
**Milestone:** v1.1 - Multi-page website with SEO foundation
**Ready for roadmap:** Yes

**Key recommendations:**
- Leverage Next.js built-in SEO features (no external packages)
- Minimal new dependencies (Resend only)
- TSX components for content (defer MDX)
- Legal compliance as launch blocker
- Incremental rollout to avoid breaking v1.0 pages
