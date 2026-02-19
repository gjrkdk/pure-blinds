# Phase 22: Checkout & Order Tracking - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Customers see VAT-inclusive pricing before checkout, cart state survives browser navigation and only clears after verified purchase completion, and sample orders are tagged in Shopify for operations. No new checkout flows, payment methods, or order management features.

</domain>

<decisions>
## Implementation Decisions

### VAT price display
- Total price with "Incl. 21% BTW" inline after the amount (e.g., "€42,50 incl. 21% BTW")
- No price breakdown (no separate excl. BTW or BTW amount lines)
- BTW label appears both on the product configurator AND on cart line item prices
- Cart total shows "incl. BTW" label — no separate BTW summary line

### Confirmation page behavior
- Visiting /bevestiging without a valid order parameter redirects silently to homepage
- Keep the existing confirmation page content — no changes to what's shown after a successful order
- Verify the order ID against the Shopify API before clearing the cart (don't just trust URL params)
- If Shopify verification fails (API error or invalid ID), cart stays intact — safe default

### Sample order tagging
- Apply `kleurstaal` tag to the Draft Order whenever at least one sample is in the order (not only all-sample orders)
- Tag only — no additional labels or prefixes on sample line items in Shopify admin
- Sample identification method: Claude determines from codebase (user unsure of current implementation)
- Sample pricing is already configured in product data — no changes needed

### Cart clearing experience
- Cart clears silently after verified successful order — no toast or notification
- If customer navigates back to cart page after checkout, they see the empty cart state
- Empty cart state needs a message: "Je winkelwagen is leeg" (or similar) with a "Terug naar de winkel" link to the homepage

### Claude's Discretion
- Empty cart message exact copy and styling
- Technical approach for Shopify order verification
- How samples are identified in the codebase (investigate existing flags/types)
- Error handling for edge cases in verification flow

</decisions>

<specifics>
## Specific Ideas

- BTW label is inline, not a separate line — "€42,50 incl. 21% BTW" format
- Homepage link for empty cart CTA, not products page
- Silent cart clear — user is on confirmation page, no need for extra feedback

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 22-checkout-order-tracking*
*Context gathered: 2026-02-19*
