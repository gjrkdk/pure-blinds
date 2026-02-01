# Requirements: Custom Dimension Textile Webshop

**Defined:** 2026-02-01
**Core Value:** Customers can order custom-dimension textiles with accurate matrix-based pricing through Shopify checkout on all plan tiers

## v1.1 Requirements

Requirements for milestone v1.1: Website Structure & SEO Foundation. Each maps to roadmap phases.

### Layout & Design

- [ ] **LAYOUT-01**: Shared navigation header displayed on all pages with links to key sections
- [ ] **LAYOUT-02**: Shared footer displayed on all pages with policy links, business info, and copyright
- [ ] **LAYOUT-03**: Visual design refresh — improved colors, typography, and spacing across site
- [ ] **LAYOUT-04**: All pages are mobile-responsive and work well on small screens
- [ ] **LAYOUT-05**: Existing product page updated to match new design language

### Pages

- [ ] **PAGE-01**: Homepage with hero section, product highlight, value proposition, and trust signals
- [ ] **PAGE-02**: Dedicated cart page at /cart showing items, quantities, prices, totals, and checkout button
- [ ] **PAGE-03**: Thank you page displayed after Shopify checkout completion with order confirmation details
- [ ] **PAGE-05**: Blog listing page showing post previews (structure only, no content)
- [ ] **PAGE-06**: Blog post template page with title, date, content area, and SEO metadata (structure only)

### SEO Foundation

- [ ] **SEO-01**: Meta title and description tags on all pages via Next.js Metadata API
- [ ] **SEO-02**: Open Graph tags (title, description, image) on all pages for social sharing
- [ ] **SEO-03**: XML sitemap generated programmatically including all pages
- [ ] **SEO-04**: robots.txt configured for search engine crawling

## v1.2 Requirements

Deferred to next milestone. Tracked but not in current roadmap.

### Policy Pages (deferred from v1.1)

- **POLICY-01**: Privacy Policy page (GDPR-compliant structure with placeholder content)
- **POLICY-02**: Terms & Conditions page (placeholder content)
- **POLICY-03**: Returns/Refund Policy page (NL 14-day cooling-off period structure)
- **POLICY-04**: Shipping Policy page (placeholder content)

### Pages (deferred from v1.1)

- **PAGE-04**: FAQ page with accordion UI and placeholder questions organized by category

### Contact

- **PAGE-07**: Contact page with form, email/phone, and business details (KvK, VAT, hours)

### SEO Enhancement

- **SEO-05**: JSON-LD structured data — Organization schema on homepage
- **SEO-06**: JSON-LD structured data — Product schema on product page
- **SEO-07**: JSON-LD structured data — FAQPage schema on FAQ page
- **SEO-08**: JSON-LD structured data — BreadcrumbList schema on relevant pages
- **SEO-09**: Dynamic OG images generated for product configurations

### Content

- **CONT-01**: Blog posts with actual content (measuring guides, textile care, design ideas)
- **CONT-02**: FAQ content — real customer questions replacing placeholders
- **CONT-03**: Policy pages — final legal copy replacing placeholders

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts / login | Adds complexity and GDPR obligations without value for custom one-off purchases |
| Newsletter signup modals | Annoying for first-time visitors, damages conversion |
| Product comparison / wishlist | Only useful with multiple distinct products |
| Category pages | Single product currently — add when multi-product launches |
| Real-time inventory sync | Irrelevant for custom-made products |
| Complex filtering / search | One product type — over-engineering |
| Live chat / chatbot | Premature without support volume |
| Multi-language (EN/NL) | Wait for market data on language preference |
| GEO optimization | Deferred until SEO foundation is solid |
| Advanced SEO (content strategy, keyword research) | Foundation first, strategy later |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEO-01 | Phase 6 | Pending |
| SEO-02 | Phase 6 | Pending |
| SEO-03 | Phase 6 | Pending |
| SEO-04 | Phase 6 | Pending |
| LAYOUT-01 | Phase 7 | Pending |
| LAYOUT-02 | Phase 7 | Pending |
| LAYOUT-04 | Phase 7 | Pending |
| PAGE-01 | Phase 8 | Pending |
| PAGE-02 | Phase 8 | Pending |
| PAGE-03 | Phase 8 | Pending |
| PAGE-05 | Phase 9 | Pending |
| PAGE-06 | Phase 9 | Pending |
| LAYOUT-03 | Phase 10 | Pending |
| LAYOUT-05 | Phase 10 | Pending |

**Coverage:**
- v1.1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0
- Deferred to v1.2: 5 (POLICY-01, POLICY-02, POLICY-03, POLICY-04, PAGE-04)

---
*Requirements defined: 2026-02-01*
*Last updated: 2026-02-01 after roadmap revision*
