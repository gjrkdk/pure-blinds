# Phase 18: Sitemap & Robots - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Search engine crawling infrastructure: dynamic sitemap.xml listing all public pages, robots.txt with crawling rules, and noindex meta on cart/confirmation pages. Uses Next.js built-in sitemap.ts and robots.ts conventions.

</domain>

<decisions>
## Implementation Decisions

### Sitemap URL scope
- Include ALL public pages: homepage, products overview, category page, subcategory pages, product detail pages, blog listing, and blog posts
- Exclude cart (`/cart`) and confirmation (`/bevestiging`) — these get noindex robots meta instead
- Exclude removed categories and products (already redirected via 301s)

### Claude's Discretion
- Whether to include `lastmod`, `changefreq`, `priority` in sitemap entries (Google largely ignores changefreq/priority, but lastmod is useful)
- Exact robots.txt disallow rules (API routes, internal paths)
- Implementation approach for noindex meta tags on cart/confirmation pages
- Whether to use Next.js `sitemap.ts` convention or custom API route

</decisions>

<specifics>
## Specific Ideas

No specific requirements — standard SEO infrastructure with well-known best practices.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 18-sitemap-robots*
*Context gathered: 2026-02-14*
