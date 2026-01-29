# Custom Dimension Textile Webshop

## What This Is

A custom webshop for selling textiles (curtains, flags) with dynamic pricing based on customer-specified dimensions. Prices are calculated using a matrix lookup (width × height) with 10cm increments. The pricing engine is architected to be reusable across the webshop, future Shopify app, and headless/API use cases.

## Core Value

Customers can order custom-dimension textiles with accurate matrix-based pricing that works reliably through Shopify checkout on all plan tiers.

## Requirements

### Validated

(None yet — ship to validate)

### Active

<!-- Phase 1 MVP: Fastest working webshop -->

- [ ] Customer can view product information on product page
- [ ] Customer can enter width dimension (any value)
- [ ] Customer can enter height dimension (any value)
- [ ] Dimensions automatically round up to nearest 10cm increment (25cm → 30cm)
- [ ] Price calculated from 20×20 matrix (10-200cm range, 10cm steps)
- [ ] Customer can add configured item to frontend-managed cart
- [ ] Cart supports multiple items with different dimension configurations
- [ ] Customer can proceed to checkout
- [ ] Backend creates single Shopify Draft Order from cart
- [ ] Each Draft Order line item includes: product name with dimensions, custom locked price, configuration payload (width, height, normalized values), pricing matrix reference
- [ ] Backend returns Shopify checkout URL
- [ ] Customer redirected to Shopify checkout to complete payment
- [ ] Order created in Shopify after successful payment
- [ ] Solution works on all Shopify plans (Basic, Shopify, Advanced, Plus)

### Out of Scope

- Shopify app version — Phase 3, requires different architecture
- Theme extensions — Phase 3, app-specific feature
- Native cart price overrides — Phase 4, requires Shopify Plus
- Shopify Functions — Phase 4, plan-gated feature
- Database for matrix storage — Deferred to Phase 2 if needed, v1 uses JSON
- Variant-per-dimension structures — Explicitly excluded, doesn't scale
- Real-time theme integration — Phase 3+, not needed for standalone webshop
- Multi-product support — v1 is single product type, expand later if validated

## Context

**Product domain:** Custom textiles (curtains, flags) where every order has unique dimensions.

**Pricing matrix structure:**
- 20×20 grid = 400 price points
- Width: 10cm to 200cm in 10cm increments
- Height: 10cm to 200cm in 10cm increments
- Customer can enter any dimension, system rounds UP to next 10cm step
- Rounding ensures customer always receives at least the dimensions they ordered

**Matrix data:**
- Sample pricing matrix available for initial development
- Will be refined during build and validation phase

**Multi-phase vision:**
- Phase 1: MVP webshop (own store, fastest validation)
- Phase 2: Refinement (edge cases, server-side validation, persistence)
- Phase 3: Shopify app v1 (theme-based stores, largest market)
- Phase 4: Shopify app v2 (native pricing for Plus merchants)
- Phase 5: Headless/API (technical merchants, full freedom)

**Existing setup:**
- Starting from scratch
- Need to create Shopify store
- Need to configure product(s)
- No existing codebase

## Constraints

- **Tech stack**: Next.js App Router with TypeScript (BFF architecture) — chosen for speed, Vercel deployment, unified codebase
- **Shopify APIs**: Storefront API (read products), Admin API GraphQL (create Draft Orders) — only APIs available across all plans
- **No plan restrictions**: MVP must work on Shopify Basic plan — no Shopify Plus features, no Shopify Functions, no native cart overrides
- **No database in v1**: Pricing matrix stored as JSON file — deferred complexity, validate first
- **Reusable pricing engine**: Same pricing logic must work for webshop, app, and future use cases — no rewriting allowed in later phases
- **Shopify boundary**: Shopify handles only checkout, payments, orders, taxes — not pricing configuration or business rules
- **Hosting**: Vercel — Next.js native platform, zero-config deployment

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pricing as standalone domain | Engine must be reusable across webshop, app, and API without modification | — Pending |
| Shopify as execution layer only | Keeps pricing logic portable, Shopify handles what it does best (checkout/payments) | — Pending |
| Draft Order approach for MVP | Works on all Shopify plans, avoids plan-gated features, fastest path to revenue | — Pending |
| BFF architecture (Next.js) | Single codebase for frontend + backend API, faster development, simpler deployment | — Pending |
| Round UP rounding strategy | Customer always gets at least what they ordered (25cm → 30cm), better UX than rounding down | — Pending |
| JSON matrix storage in v1 | Defer database complexity until business model validated, faster MVP | — Pending |
| Single product type in v1 | Validate core pricing mechanics before expanding product catalog | — Pending |

---
*Last updated: 2026-01-29 after initialization*
