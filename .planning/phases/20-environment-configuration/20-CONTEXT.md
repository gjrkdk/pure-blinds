# Phase 20: Environment Configuration - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Extract hardcoded Shopify product/variant IDs from products.json into environment variables, enabling separate dev and production Shopify stores without code changes. The app currently has 2 products (roller blind white, roller blind black) but the catalog will grow.

</domain>

<decisions>
## Implementation Decisions

### Dev/prod separation
- Two separate Shopify stores exist: a dev store and a production store
- Dev store has test products with the same variant structure as production
- Local dev uses `.env.local`, deployed environments use Vercel dashboard env vars (different values for Preview vs Production)

### Env var naming
- Claude's discretion on naming convention (per-product explicit vars vs JSON env var)
- Catalog will grow significantly — design should accommodate adding products without excessive env var overhead
- User is fine with either approach, prefers what scales best

### Product ID mapping
- Claude's discretion on how products.json relates to env vars at runtime
- Claude's discretion on whether variant IDs come from same source as product IDs or via Shopify API lookup
- Key constraint: products.json must NOT contain Shopify product or variant ID values after this phase

### Fallback behavior
- App must fail at build time if required Shopify env vars are missing (extend current Zod validation pattern)
- `.env.example` must include placeholder values showing the expected format (e.g. `gid://shopify/Product/...`)

### Claude's Discretion
- Env var naming convention and structure (per-product vs JSON mapping)
- Whether to keep products.json for metadata (sans Shopify IDs) or restructure
- How variant IDs are sourced (static config vs API lookup)
- Implementation of build-time validation for the new env vars

</decisions>

<specifics>
## Specific Ideas

- Current Zod validation pattern in `src/lib/env.ts` should be extended for the new Shopify ID env vars
- Two stores with same product structure means the only difference between environments is the ID values

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-environment-configuration*
*Context gathered: 2026-02-19*
