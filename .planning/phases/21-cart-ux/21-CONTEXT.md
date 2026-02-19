# Phase 21: Cart UX - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

The add-to-cart and sample flows give customers clear next-step navigation, and the cart is always visible on mobile. This phase covers: split add-to-cart button after adding a product, sample button state changes, and a mobile cart icon with item count badge.

</domain>

<decisions>
## Implementation Decisions

### Post-add button states
- After adding a product, button splits into stacked vertical layout: "Naar winkelwagen →" on top (primary), "Nog een toevoegen" below (secondary)
- Changing any dimension (width, height, or other option) resets back to single "Toevoegen" button
- Clicking "Nog een toevoegen" resets the form to defaults only — no toast or confirmation message
- Transition between single and split state is an instant swap, no animation
- Product add-to-cart and sample buttons track their own state completely independently

### Sample button flow
- Only the specific sample button that was clicked changes to "Bekijk winkelwagen →"
- On page load, check the cart: if a sample is already in cart, show "Bekijk winkelwagen →" immediately
- Customer cannot add the same sample twice — if sample is already in cart, button shows "Bekijk winkelwagen →" but does NOT auto-redirect; customer clicks to navigate

### Mobile cart icon & badge
- Cart icon placed to the left of the hamburger menu button on mobile
- Mobile only — desktop keeps the existing text "Winkelwagen" link in navigation
- Cart icon is always visible, even when cart is empty; badge only appears when count > 0
- Badge count updates with a subtle pulse/bounce animation when items are added or removed

### Button visual style
- "Naar winkelwagen →" uses primary button style (bold/filled)
- "Nog een toevoegen" uses muted/subtle style (lighter background, less visual weight)
- "Bekijk winkelwagen →" on sample matches the same primary style as "Naar winkelwagen →"
- Cart icon color matches existing navigation text color; badge also matches nav styling (no separate accent color)

### Claude's Discretion
- Exact cart icon choice (shopping bag, shopping cart, etc.)
- Badge positioning on the icon (top-right corner standard)
- Exact animation timing for badge pulse
- Spacing between cart icon and hamburger menu

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within the decisions above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 21-cart-ux*
*Context gathered: 2026-02-19*
