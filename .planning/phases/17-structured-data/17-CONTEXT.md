# Phase 17: Structured Data - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Schema.org JSON-LD markup for rich search results eligibility. Product schema on product detail pages, FAQPage schema on homepage FAQ section, plus additional schema types for broader Google presence. All markup must validate in Google Rich Results Test and be XSS-safe.

</domain>

<decisions>
## Implementation Decisions

### Product price display
- Use starting price (lowest matrix price) as the schema price — "vanaf" pricing
- Currency: EUR
- Availability: InStock (made-to-measure, always available)
- Condition: NewCondition
- Brand: "Pure Blinds"

### Schema types to implement
- **Product** — On product detail pages (required by success criteria)
- **FAQPage** — On homepage FAQ section (required by success criteria)
- **BreadcrumbList** — On all pages with breadcrumb navigation (matches existing UI breadcrumbs)
- **Organization** — On homepage (brand presence in Knowledge Panel)
- **BlogPosting** — On individual blog post pages (rich results for content marketing)
- **Skip WebSite** — No site search exists, add WebSite schema later when search is built

### Business identity (Organization schema)
- Name: "Pure Blinds"
- Email: info@pureblinds.nl (placeholder — update with real email later)
- Logo: Reference current site logo asset
- No phone number for now

### Claude's Discretion
- JSON-LD placement strategy (layout-level vs page-level components)
- Exact Schema.org property selection beyond what's specified
- BlogPosting author/publisher structure
- BreadcrumbList generation approach (static vs dynamic from route)
- XSS escaping strategy for JSON-LD content

</decisions>

<specifics>
## Specific Ideas

- Starting price as "vanaf" pricing aligns with Dutch e-commerce conventions
- BreadcrumbList should match the existing UI breadcrumb component's hierarchy
- Organization schema goes on the homepage only

</specifics>

<deferred>
## Deferred Ideas

- WebSite schema with SearchAction — add when site search functionality is built
- AggregateRating/Review schema — add when real customer reviews exist
- LocalBusiness schema — consider if physical location becomes relevant

</deferred>

---

*Phase: 17-structured-data*
*Context gathered: 2026-02-14*
