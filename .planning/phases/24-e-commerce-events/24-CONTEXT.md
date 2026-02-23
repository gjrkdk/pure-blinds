# Phase 24: E-Commerce Events - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Fire the complete GA4 e-commerce funnel — view_item, add_to_cart, begin_checkout, purchase — on every relevant user action with correct EUR pricing data. Purchase event fires exactly once per checkout even on page refresh. Fix cross-domain linker for JS-based checkout redirect.

</domain>

<decisions>
## Implementation Decisions

### Event data & pricing
- Prices are VAT-inclusive (21% BTW) — matches what the customer sees on the site
- item_id uses the product slug (e.g. "roller-blind-white") — human-readable, matches internal product keys
- add_to_cart events include width_cm and height_cm as custom event parameters — useful for analyzing popular sizes
- Currency is EUR for all events

### Purchase event flow
- Cart items snapshot to sessionStorage before Shopify checkout redirect (cart is cleared before redirect)
- transaction_id extracted from Shopify URL query params on /bevestiging
- Deduplication via sessionStorage flag ("purchase_tracked_{orderId}") — skip if already set, prevents duplicate purchase events on page refresh

### Cross-domain checkout link
- Fix the _gl linker in Phase 24: manually decorate the checkout URL with _gl parameter before window.location.href redirect
- This ensures GA4 session continuity through the Shopify checkout flow

### Claude's Discretion
- Exact GA4 event parameter names and structure (follow GA4 recommended e-commerce schema)
- How to extract Shopify order ID from /bevestiging URL params
- begin_checkout event placement (before or after API call)
- view_item trigger location (product page component)
- Error handling for missing sessionStorage data on /bevestiging

</decisions>

<specifics>
## Specific Ideas

No specific requirements — follow GA4 recommended e-commerce event schema and best practices.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 24-e-commerce-events*
*Context gathered: 2026-02-23*
