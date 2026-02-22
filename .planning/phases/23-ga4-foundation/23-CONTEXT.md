# Phase 23: GA4 Foundation - Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Load GA4 with Consent Mode v2 defaults (all 4 parameters denied before gtag.js fires), establish cross-domain session continuity between pure-blinds.nl and Shopify checkout, and track SPA route changes automatically on App Router navigation. No e-commerce events, no consent banner — those are Phases 24 and 25.

</domain>

<decisions>
## Implementation Decisions

### GA4 Configuration
- No existing GA4 property — needs to be created before deployment
- GA4 measurement ID stored as `NEXT_PUBLIC_GA4_ID` environment variable
- Direct gtag.js loading — no Google Tag Manager (GTM explicitly out of scope)
- No existing analytics code in the codebase — clean slate
- Design the analytics module for extension from the start so Phase 24 (e-commerce events) and Phase 25 (consent) can hook into it without refactoring

### Environment Behavior
- GA4 fires in production only (pure-blinds.nl) — no analytics in development or preview deployments
- In development: console logging of what WOULD be sent to GA4 (event name, parameters) for verification
- In production: GA4 DebugView available via `?debug_mode=true` URL parameter for live testing

### Route Tracking Scope
- Track all App Router route changes as page_view events — no exclusions
- Path changes only — query parameter changes do NOT fire page_view
- URL path only sent with page_view (no page title)

### Cross-Domain Setup
- Headless Shopify store: pure-blinds.nl (Next.js) redirects to Shopify checkout domain for payment
- Shopify checkout domain stored as `NEXT_PUBLIC_SHOPIFY_DOMAIN` environment variable
- Development Shopify domain: `pure-blinds-development.myshopify.com` (production domain TBD)
- Cross-domain linker configuration needed between pure-blinds.nl and Shopify checkout domain
- Post-checkout confirmation page approach: Claude's discretion (redirect back to /bevestiging on pure-blinds.nl recommended for GA4 session continuity)

### Claude's Discretion
- Post-checkout confirmation page implementation (redirect to /bevestiging vs Shopify thank-you)
- Analytics module architecture and file structure
- gtag.js loading technique (Next.js Script component, head injection, etc.)
- Console logging format in development
- Consent Mode v2 initialization ordering details

</decisions>

<specifics>
## Specific Ideas

- User went through a checkout flow and encountered Shopify thank-you page at `pure-blinds-development.myshopify.com/checkouts/do/.../nl/thank-you` — cross-domain tracking must cover this flow
- Analytics module should be a thin layer that Phase 24 and 25 can import and extend without restructuring

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 23-ga4-foundation*
*Context gathered: 2026-02-22*
