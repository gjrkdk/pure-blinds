# Phase 4: Cart Management - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Session-based shopping cart where customers can add multiple custom-dimension textile items, view their configurations with pricing, manage quantities, and proceed to checkout. Cart persists across sessions and handles duplicate configurations intelligently.

</domain>

<decisions>
## Implementation Decisions

### Cart Display & Layout
- Display style: Claude's discretion (choose based on best UX practices)
- Show original dimensions entered by customer (e.g., "100cm × 150cm")
- Do NOT show normalized dimensions in cart (rounding is transparent on product page, not repeated in cart)
- Sticky footer with cart total and checkout button (always visible at bottom)
- Display both per-item prices AND running subtotal

### Item Management
- No inline editing — customer must remove item and re-add from product page to change dimensions
- Each cart item supports quantity input (1, 2, 3...)
- If same dimensions added again → increment quantity on existing item (don't create duplicate line)
- Item removal requires confirmation dialog before deletion ("Remove [product] from cart?")

### Cart Storage & Persistence
- Store in both localStorage AND server session for reliability
- Cart expires after 7 days of inactivity
- Each device has separate cart (no cross-device sync in Phase 4)
- Cart persists across page refresh, navigation, and browser close/reopen

### Empty States & CTAs
- Empty cart shows simple message only (no illustration or product suggestions)
- Empty cart CTA: "Back to [last page viewed]" button
- Continue Shopping link appears at top of cart when items present
- Checkout button text: "Proceed to Checkout"

### Claude's Discretion
- Exact cart item layout (compact vs detailed cards)
- Loading states during add-to-cart
- Success feedback after adding item
- Cart icon badge behavior
- Mobile vs desktop layout breakpoints

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for cart UI and interactions.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-cart-management*
*Context gathered: 2026-01-31*
