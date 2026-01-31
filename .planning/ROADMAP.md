# Roadmap: Custom Dimension Textile Webshop

## Overview

This roadmap delivers a custom webshop where customers can order textiles with custom dimensions and accurate matrix-based pricing. We start by building the foundation (Next.js setup and Shopify store configuration), then develop the core pricing engine with dimension input validation, integrate frontend product pages with real-time price updates, add cart management for multiple custom items, connect to Shopify for checkout via Draft Orders, and finally optimize for mobile across all touchpoints.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Project Setup** - Next.js foundation and Shopify store configuration
- [ ] **Phase 2: Pricing Engine & Validation** - Core pricing domain with matrix-based calculations
- [ ] **Phase 3: Product Page & Real-time Pricing** - Frontend dimension configurator with live price updates
- [ ] **Phase 4: Cart Management** - Session-based cart for multiple custom configurations
- [ ] **Phase 5: Shopify Integration & Checkout** - Draft Order creation and checkout redirection
- [ ] **Phase 6: Mobile Optimization & Polish** - Cross-device experience refinement

## Phase Details

### Phase 1: Project Setup
**Goal**: Development environment ready with Next.js application and configured Shopify store
**Depends on**: Nothing (first phase)
**Requirements**: None (foundation setup)
**Success Criteria** (what must be TRUE):
  1. Next.js application runs locally with TypeScript and App Router
  2. Shopify store exists with test products configured
  3. Application can connect to Shopify Admin API with valid credentials
  4. Pricing matrix JSON file exists with 20x20 sample data (10-200cm range)
  5. Development environment variables are configured and working
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md -- Initialize Next.js project, dependencies, env validation, and pricing matrix
- [ ] 01-02-PLAN.md -- Shopify API client, health endpoint, and store configuration

### Phase 2: Pricing Engine & Validation
**Goal**: Backend pricing engine calculates accurate prices using matrix lookup with dimension validation
**Depends on**: Phase 1
**Requirements**: PRICE-01, PRICE-02, PRICE-03, PRICE-04, PRICE-05, PRICE-06, PRICE-07, DIM-04, DIM-05, DIM-06, DIM-07, DIM-08, DIM-09, DIM-10, DIM-11
**Success Criteria** (what must be TRUE):
  1. Backend API endpoint accepts dimension inputs and returns calculated price
  2. Dimensions automatically round up to nearest 10cm increment
  3. Input validation rejects values outside 10-200cm range
  4. Price calculation uses integer cents (no floating-point errors)
  5. Pricing engine has zero Shopify dependencies (pure TypeScript functions)
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md -- Pure pricing library (types, Zod validation, calculator functions)
- [ ] 02-02-PLAN.md -- POST /api/pricing route handler wiring validation to calculator

### Phase 3: Product Page & Real-time Pricing
**Goal**: Customers can view products, enter dimensions, and see prices update in real-time
**Depends on**: Phase 2
**Requirements**: DIM-01, DIM-02, DIM-03, PRICE-08, PRICE-09, UX-01, UX-02, UX-05, UX-06, UX-07, UX-08
**Success Criteria** (what must be TRUE):
  1. Product page displays product information with dimension input fields
  2. Width and height inputs show cm unit labels
  3. Price updates in real-time as dimensions change (no page reload)
  4. Input fields show visual feedback (highlighting, confirmation)
  5. Page is mobile-responsive with numeric keyboard on mobile
**Plans**: 1 plan

Plans:
- [ ] 03-01-PLAN.md -- Product page shell and dimension configurator with debounced real-time pricing

### Phase 4: Cart Management
**Goal**: Customers can add multiple custom-dimension items to cart and view their configurations
**Depends on**: Phase 3
**Requirements**: CART-01, CART-02, CART-03, CART-04, CART-05, UX-03
**Success Criteria** (what must be TRUE):
  1. Customer can add configured item to cart from product page
  2. Cart displays multiple items with different dimension configurations
  3. Each cart item shows product name with dimensions and calculated price
  4. Cart persists configuration data (width, height, normalized values)
  5. Cart page is mobile-responsive
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md -- Cart store (Zustand + persist/TTL), add-to-cart on product page, cart icon in header
- [x] 04-02-PLAN.md -- Cart page with item display, quantity management, removal dialog, sticky footer

### Phase 5: Shopify Integration & Checkout
**Goal**: Customers can checkout via Shopify with custom-priced Draft Orders
**Depends on**: Phase 4
**Requirements**: SHOP-01, SHOP-02, SHOP-03, SHOP-04, SHOP-05, SHOP-06, SHOP-07, ORDER-01, ORDER-02, ORDER-03, ORDER-04, ORDER-05, UX-04
**Success Criteria** (what must be TRUE):
  1. Backend creates Shopify Draft Order from cart on checkout request
  2. Draft Order includes all cart items with locked custom prices
  3. Each line item includes dimensions in product name and configuration payload
  4. Customer is redirected to Shopify checkout URL
  5. Customer can complete payment and order is created in Shopify
  6. Checkout flow works on mobile devices
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md -- Backend: env validation, Draft Order creation function, POST /api/checkout route
- [x] 05-02-PLAN.md -- Frontend: wire checkout button with loading state, error handling, Shopify redirect

### Phase 6: Mobile Optimization & Polish
**Goal**: Application provides excellent experience on all mobile devices
**Depends on**: Phase 5
**Requirements**: None (polish phase validates UX-01 through UX-11 holistically)
**Success Criteria** (what must be TRUE):
  1. All input fields work smoothly on mobile (touch, keyboard behavior)
  2. Price updates provide clear visual feedback on mobile
  3. Cart interactions work seamlessly on touch devices
  4. Checkout flow completes reliably on mobile browsers
  5. Layout adapts correctly to different screen sizes (320px to tablet)
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Setup | 2/2 | Complete | 2026-01-29 |
| 2. Pricing Engine & Validation | 2/2 | Complete | 2026-01-29 |
| 3. Product Page & Real-time Pricing | 1/1 | Complete | 2026-01-31 |
| 4. Cart Management | 2/2 | Complete | 2026-01-31 |
| 5. Shopify Integration & Checkout | 2/2 | Complete | 2026-01-31 |
| 6. Mobile Optimization & Polish | 0/TBD | Not started | - |
