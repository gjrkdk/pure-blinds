# Project Milestones: Custom Dimension Textile Webshop

## v1.0 MVP (Shipped: 2026-01-31)

**Delivered:** Custom dimension textile webshop with real-time pricing, cart management, and Shopify checkout integration.

**Phases completed:** 1-5 (9 plans total)

**Key accomplishments:**

- Next.js foundation with TypeScript, Shopify Admin API client, and 20×20 integer-based pricing matrix
- Pure pricing engine with matrix lookup, dimension validation (10-200cm), and automatic rounding to 10cm increments
- Interactive product page with real-time price updates, debounced API calls (400ms), and race condition handling
- Complete cart management using Zustand with localStorage persistence (7-day TTL) and hash-based duplicate detection
- Shopify Draft Order integration with custom-priced line items, dimension metadata, and EUR currency support
- End-to-end checkout flow from product configuration through Shopify-hosted payment

**Stats:**

- 40+ files created/modified
- 1,522 lines of TypeScript/TSX
- 5 phases, 9 plans, ~35 tasks
- 3 days from project start to ship (Jan 29-31)

**Git range:** `feat(01-01)` → `refactor: eliminate formatPrice duplication`

**What's next:** v1.1 refinements - add Phase 3 verification documentation, create test products in Shopify store, expand test coverage for pricing calculator and cart operations.

---
