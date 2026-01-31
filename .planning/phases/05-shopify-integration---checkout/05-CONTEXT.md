# Phase 5: Shopify Integration & Checkout - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Creating Shopify Draft Orders from cart items with custom dimensions and locked pricing, then redirecting customers to Shopify's native checkout to complete payment. This phase handles the handoff from custom cart to Shopify payment flow.

Webhook handling and cart clearing after payment belong in Phase 6 (Order Confirmation).

</domain>

<decisions>
## Implementation Decisions

### Draft Order Line Item Details
- **Product name format:** Append dimensions to product name (e.g., "Venetian Blinds 25mm - 100cm x 150cm")
- **Metadata storage:** Store only original dimensions in custom attributes (not normalized dimensions)
- **No pricing matrix reference:** Line items include only dimensions and locked price, no matrix coordinates
- **Custom attribute format:** Separate attributes (width=100, height=150) rather than JSON string in single attribute

### Error Handling and User Feedback
- **Failure behavior:** Show error message and keep user on cart page with items intact (don't clear cart on error)
- **Error message style:** User-friendly only ("Unable to process checkout. Please try again.") - no error codes or technical details
- **Loading feedback:** Show loading spinner with "Preparing checkout..." message while Draft Order is being created
- **Server-side logging:** No logging for MVP - keep it simple

### Product Mapping Strategy
- **Product ID source:** Store in environment variable (.env file) for flexibility
- **Current product:** "Venetian Blinds 25mm" (test product in Shopify store)
- **Multi-product support:** Design code to support multiple product types in future, but implement single product for MVP
- **Validation:** Fail immediately on server startup with clear error message if product ID is missing or invalid

### Post-Checkout Behavior
- **Cart clearing:** Don't clear cart after redirect - Phase 6 will handle this via webhooks after payment confirmation
- **Abandoned checkout:** Cart persists with items - customer can modify or try again naturally
- **Button state:** Disable checkout button and show loading state until redirect to prevent double-submission
- **Redirect method:** Same window redirect (window.location) for continuous checkout experience

### Claude's Discretion
- Draft Order API implementation details
- Custom attribute key naming conventions
- Exact error message wording
- Loading spinner design

</decisions>

<specifics>
## Specific Ideas

- Currently using "Venetian Blinds 25mm" product in Shopify as placeholder
- Need to add SHOPIFY_PRODUCT_ID to environment variables
- Checkout flow should feel seamless - no jarring transitions

</specifics>

<deferred>
## Deferred Ideas

- Shopify webhook handling for order confirmation - Phase 6
- Automatic cart clearing after successful payment - Phase 6
- Multiple product type support - future enhancement after MVP validation
- Server-side error logging and monitoring - add later if needed

</deferred>

---

*Phase: 05-shopify-integration---checkout*
*Context gathered: 2026-01-31*
