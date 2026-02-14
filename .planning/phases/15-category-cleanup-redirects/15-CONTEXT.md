# Phase 15: Category Cleanup & Redirects - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove venetian blinds and textiles categories entirely from the webshop, leaving only rollerblinds (2 products). Set up 301 redirects so old URLs don't break and SEO equity is preserved. Clean up all references across the codebase.

</domain>

<decisions>
## Implementation Decisions

### Redirect destinations
- All removed category URLs (`/products/venetian-blinds`, `/products/textiles`) redirect to `/products`
- All removed product URLs (`/products/venetian-blinds/venetian-blinds-25mm`, `/products/textiles/custom-textile`) redirect to `/products`
- Use 301 permanent redirects (not 308)
- Wildcard catch-all: any path under `/products/venetian-blinds/*` or `/products/textiles/*` redirects to `/products`

### Navigation simplification
- `/products` page keeps same layout, shows only the Roller Blinds category card (remove venetian and textile cards)
- Header nav stays as-is: "Products" linking to `/products`
- Footer links cleaned up — remove any references to removed categories
- Breadcrumbs keep full hierarchy (Home > Products > Roller Blinds > ...)

### Removed product handling
- Delete pricing matrix JSON files for removed products completely
- Delete route files (page.tsx) for venetian-blinds and textiles categories
- Handle redirects via Next.js config or middleware, not route files
- Silently remove invalid cart items on load (no user-facing message)
- No Shopify-side changes — leave Shopify products as-is

### Catalog data cleanup
- Remove venetian-blinds and textiles category entries from products.json entirely
- Remove venetian-blinds-25mm and custom-textile product entries from products.json
- Products page: just remove the two hardcoded cards (keep hardcoded approach)
- Full codebase audit: search and remove all references to venetian/textiles everywhere
- Tighten TypeScript types to reflect the simpler catalog (narrow category unions)

### Claude's Discretion
- Redirect implementation approach (next.config.js redirects vs middleware)
- Order of cleanup operations
- How to handle any edge cases discovered during codebase audit

</decisions>

<specifics>
## Specific Ideas

No specific requirements — straightforward cleanup with clear redirect targets.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-category-cleanup-redirects*
*Context gathered: 2026-02-14*
