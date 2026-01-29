# Requirements: Custom Dimension Textile Webshop

**Defined:** 2026-01-29
**Core Value:** Customers can order custom-dimension textiles with accurate matrix-based pricing through Shopify checkout on all plan tiers

## v1 Requirements

Requirements for initial MVP release. Each maps to roadmap phases.

### Dimension Input

- [ ] **DIM-01**: Product page displays product information
- [ ] **DIM-02**: Product page displays width input field with cm label
- [ ] **DIM-03**: Product page displays height input field with cm label
- [ ] **DIM-04**: Width input validates minimum bound (10cm)
- [ ] **DIM-05**: Width input validates maximum bound (200cm)
- [ ] **DIM-06**: Height input validates minimum bound (10cm)
- [ ] **DIM-07**: Height input validates maximum bound (200cm)
- [ ] **DIM-08**: Input validation prevents negative values
- [ ] **DIM-09**: Input validation prevents zero values
- [ ] **DIM-10**: Input validation provides clear error messages
- [ ] **DIM-11**: User-entered dimensions automatically round up to nearest 10cm increment

### Pricing Engine

- [ ] **PRICE-01**: Frontend requests price calculation from backend API
- [ ] **PRICE-02**: Backend validates dimension input before calculation
- [ ] **PRICE-03**: Backend normalizes dimensions (rounds up to 10cm)
- [ ] **PRICE-04**: Backend calculates price using 20×20 matrix lookup (10-200cm range, 10cm steps)
- [ ] **PRICE-05**: Backend stores pricing matrix as JSON file
- [ ] **PRICE-06**: Price calculation uses integer cents (not floats) to prevent rounding errors
- [ ] **PRICE-07**: Pricing engine implemented as pure functions with zero Shopify dependencies (reusability requirement)
- [ ] **PRICE-08**: Real-time price displays on frontend as dimensions change
- [ ] **PRICE-09**: Price display updates without page reload

### Cart Management

- [ ] **CART-01**: User can add configured item to frontend-managed cart
- [ ] **CART-02**: Cart supports multiple items with different dimension configurations
- [ ] **CART-03**: Each cart item displays product name with dimensions
- [ ] **CART-04**: Each cart item displays calculated price
- [ ] **CART-05**: Cart persists configuration data for each item (width, height, normalized values)

### Shopify Integration

- [ ] **SHOP-01**: Backend creates single Shopify Draft Order from cart on checkout
- [ ] **SHOP-02**: Draft Order uses Shopify Admin API GraphQL
- [ ] **SHOP-03**: Draft Order works on all Shopify plans (no Plus-only features)
- [ ] **SHOP-04**: Backend returns Shopify checkout URL after Draft Order creation
- [ ] **SHOP-05**: Frontend redirects user to Shopify checkout URL
- [ ] **SHOP-06**: Customer completes payment via Shopify-hosted checkout
- [ ] **SHOP-07**: Order created in Shopify after successful payment

### Order Line Data

- [ ] **ORDER-01**: Each Draft Order line item includes product name with dimensions for display
- [ ] **ORDER-02**: Each Draft Order line item includes custom locked price
- [ ] **ORDER-03**: Each Draft Order line item includes configuration payload (width, height, normalized width, normalized height)
- [ ] **ORDER-04**: Each Draft Order line item includes pricing matrix reference for audit and reproduction
- [ ] **ORDER-05**: Order line data structure is reusable one-to-one for future Shopify app

### User Experience

- [ ] **UX-01**: Product page is mobile-responsive
- [ ] **UX-02**: Dimension inputs work on mobile (numeric keyboard)
- [ ] **UX-03**: Cart page is mobile-responsive
- [ ] **UX-04**: Checkout flow works on mobile
- [ ] **UX-05**: Dimension inputs show clear unit labels (cm)
- [ ] **UX-06**: Active input field is visually highlighted
- [ ] **UX-07**: Successful input shows visual confirmation (checkmark or color change)
- [ ] **UX-08**: Price update shows visual feedback
- [ ] **UX-09**: Order confirmation displays exact dimensions ordered
- [ ] **UX-10**: Order confirmation displays normalized dimensions received
- [ ] **UX-11**: Order confirmation displays final price

## v2 Requirements

Deferred to future release (Phase 2: Refinement). Tracked but not in current roadmap.

### Transparency Features

- **TRANS-01**: Rounding strategy communication ("You ordered 165cm, receiving 170cm")
- **TRANS-02**: Price calculation breakdown (shows material cost, area calculation, markup)
- **TRANS-03**: Dimension rounding preview (visual before/after indicator)

### Enhanced Usability

- **ENH-01**: Visual size preview (dimensional diagram or scaled mockup)
- **ENH-02**: Smart dimension suggestions (common sizes as quick-select)
- **ENH-03**: Instant cart preview (mini-cart confirmation)
- **ENH-04**: Cart persistence using local storage
- **ENH-05**: Server-side price recalculation on checkout (anti-manipulation)

### Order Management

- **ORD-01**: Order webhooks for paid-to-fulfillment flow
- **ORD-02**: Migration of pricing matrix from JSON to database

### Advanced Features

- **ADV-01**: Saved configurations (requires user accounts)
- **ADV-02**: Dimension comparison tool
- **ADV-03**: Bulk order entry (CSV upload for B2B)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Arbitrary precision (1cm or 1mm increments) | Complicates matrix from 400 to 2000+ price points, exceeds production constraints |
| Real-time 3D product rendering | Expensive ($10k+), kills mobile performance, limited value for flat textiles |
| Complex multi-product bundling | Exponential complexity, pricing becomes opaque, conflicts with transparency goal |
| Free-form design upload | Different feature set entirely (personalization vs dimension calculator), defer until core validated |
| Unlimited size range beyond 10-200cm | Production constraints exist, shipping/handling complexities for extreme sizes |
| Price display only after add-to-cart | Pricing surprises kill sales instantly, conflicts with transparency and trust positioning |
| Shopify app version | Phase 3+, requires different architecture (admin UI, theme extensions, multi-merchant) |
| Theme extensions | Phase 3+, app-specific feature |
| Native cart price overrides | Phase 4, requires Shopify Plus and Functions API |
| Shopify Functions | Phase 4, plan-gated feature |
| Variant-per-dimension structures | Doesn't scale (would need 400 Shopify variants), conflicts with dynamic pricing approach |
| Database in v1 | Defer complexity until business model validated, JSON sufficient for MVP |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DIM-01 | Phase 3 | Pending |
| DIM-02 | Phase 3 | Pending |
| DIM-03 | Phase 3 | Pending |
| DIM-04 | Phase 2 | Complete |
| DIM-05 | Phase 2 | Complete |
| DIM-06 | Phase 2 | Complete |
| DIM-07 | Phase 2 | Complete |
| DIM-08 | Phase 2 | Complete |
| DIM-09 | Phase 2 | Complete |
| DIM-10 | Phase 2 | Complete |
| DIM-11 | Phase 2 | Complete |
| PRICE-01 | Phase 2 | Complete |
| PRICE-02 | Phase 2 | Complete |
| PRICE-03 | Phase 2 | Complete |
| PRICE-04 | Phase 2 | Complete |
| PRICE-05 | Phase 2 | Complete |
| PRICE-06 | Phase 2 | Complete |
| PRICE-07 | Phase 2 | Complete |
| PRICE-08 | Phase 3 | Pending |
| PRICE-09 | Phase 3 | Pending |
| CART-01 | Phase 4 | Pending |
| CART-02 | Phase 4 | Pending |
| CART-03 | Phase 4 | Pending |
| CART-04 | Phase 4 | Pending |
| CART-05 | Phase 4 | Pending |
| SHOP-01 | Phase 5 | Pending |
| SHOP-02 | Phase 5 | Pending |
| SHOP-03 | Phase 5 | Pending |
| SHOP-04 | Phase 5 | Pending |
| SHOP-05 | Phase 5 | Pending |
| SHOP-06 | Phase 5 | Pending |
| SHOP-07 | Phase 5 | Pending |
| ORDER-01 | Phase 5 | Pending |
| ORDER-02 | Phase 5 | Pending |
| ORDER-03 | Phase 5 | Pending |
| ORDER-04 | Phase 5 | Pending |
| ORDER-05 | Phase 5 | Pending |
| UX-01 | Phase 3 | Pending |
| UX-02 | Phase 3 | Pending |
| UX-03 | Phase 4 | Pending |
| UX-04 | Phase 5 | Pending |
| UX-05 | Phase 3 | Pending |
| UX-06 | Phase 3 | Pending |
| UX-07 | Phase 3 | Pending |
| UX-08 | Phase 3 | Pending |
| UX-09 | Phase 6 | Pending |
| UX-10 | Phase 6 | Pending |
| UX-11 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 48 total
- Mapped to phases: 48 (100%)
- Unmapped: 0

**Phase Distribution:**
- Phase 1 (Setup): 0 requirements (foundation)
- Phase 2 (Pricing Engine): 15 requirements
- Phase 3 (Product Page): 11 requirements
- Phase 4 (Cart): 6 requirements
- Phase 5 (Shopify Integration): 13 requirements
- Phase 6 (Order Confirmation): 3 requirements
- Phase 7 (Mobile Polish): 0 requirements (validation phase)

---
*Requirements defined: 2026-01-29*
*Last updated: 2026-01-29 after roadmap creation*
