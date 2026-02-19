# Requirements: Custom Dimension Textile Webshop

**Defined:** 2026-02-19
**Core Value:** Customers can order custom-dimension roller blinds with accurate matrix-based pricing that works reliably through Shopify checkout on all plan tiers.

## v1.4 Requirements

Requirements for production readiness. Each maps to roadmap phases.

### Environment & Configuration

- [x] **ENV-01**: Shopify product/variant IDs loaded from environment variables, not hardcoded in products.json
- [x] **ENV-02**: Dev and prod environments use separate Shopify stores with their own product IDs

### Cart UX

- [ ] **CART-01**: After adding product to cart, button splits into "Nog een toevoegen" + "Naar winkelwagen →"
- [ ] **CART-02**: After adding sample to cart, sample button changes to "Bekijk winkelwagen →" linking to cart page
- [ ] **CART-03**: Cart icon with item count badge visible next to hamburger menu on mobile

### Checkout & Payment

- [ ] **CHKOUT-01**: Product page displays price with "Incl. 21% BTW" label
- [ ] **CHKOUT-02**: Cart clears only after confirmed purchase completion, not on every confirmation page visit

### Order Tracking

- [ ] **TRACK-01**: Draft Orders containing sample items receive `kleurstaal` tag in Shopify

### Bug Fixes

- [x] **FIX-01**: All pages use `NEXT_PUBLIC_BASE_URL` consistently (remove `NEXT_PUBLIC_SITE_URL` references)
- [x] **FIX-02**: Remove dead `SHOPIFY_PRODUCT_ID` from env validation
- [x] **FIX-03**: Pricing matrix JSON currency metadata corrected from USD to EUR
- [x] **FIX-04**: Hardcoded domain fallback corrected from `pureblinds.nl` to `pure-blinds.nl`

## Future Requirements

### Deferred from v1.0

- **TODO-01**: Add Phase 3 verification documentation (process gap)
- **TODO-02**: Create test products in Shopify store
- **TODO-03**: Add unit tests for pricing calculator and cart store actions
- **TODO-04**: Pricing matrix reference in Draft Order custom attributes (ORDER-04)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Separate Draft Order for samples | Adds complexity, tag is sufficient for tracking |
| Contact form backend | Frontend-only for now, backend submission handling deferred |
| Product photography | Using placeholder images, real photos added separately |
| Shopify app version | Different architecture, future milestone |
| Advanced SEO strategy | Foundation shipped, strategy later |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENV-01 | Phase 20 | Complete |
| ENV-02 | Phase 20 | Complete |
| CART-01 | Phase 21 | Pending |
| CART-02 | Phase 21 | Pending |
| CART-03 | Phase 21 | Pending |
| CHKOUT-01 | Phase 22 | Pending |
| CHKOUT-02 | Phase 22 | Pending |
| TRACK-01 | Phase 22 | Pending |
| FIX-01 | Phase 19 | Complete |
| FIX-02 | Phase 19 | Complete |
| FIX-03 | Phase 19 | Complete |
| FIX-04 | Phase 19 | Complete |

**Coverage:**
- v1.4 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 after v1.4 roadmap creation*
