# Requirements: Custom Dimension Roller Blinds Webshop

**Defined:** 2026-02-22
**Core Value:** Customers can order custom-dimension roller blinds with accurate matrix-based pricing that works reliably through Shopify checkout on all plan tiers.

## v1.5 Requirements

Requirements for Analytics & Privacy milestone. Each maps to roadmap phases.

### GA4 Foundation

- [x] **GA4-01**: GA4 loads unconditionally with Consent Mode v2 defaults (all 4 parameters denied before gtag.js fires)
- [x] **GA4-02**: Cross-domain tracking configured between pure-blinds.nl and Shopify checkout domain
- [x] **GA4-03**: SPA page views tracked automatically on App Router route changes

### E-Commerce Events

- [x] **ECOM-01**: `view_item` event fires on product detail page with item_id, item_name, price in EUR
- [x] **ECOM-02**: `add_to_cart` event fires when user adds item to cart with configured dimensions and price
- [x] **ECOM-03**: `begin_checkout` event fires on checkout button click before Shopify redirect
- [x] **ECOM-04**: `purchase` event fires on /bevestiging with transaction_id and complete items array
- [x] **ECOM-05**: Purchase events deduplicated via sessionStorage + localStorage guard (no duplicates on refresh)
- [x] **ECOM-06**: Cart contents snapshot stored in sessionStorage before checkout redirect for purchase event data

### Cookie Consent

- [x] **CONS-01**: Dutch-language cookie consent banner with "Accepteer alles" and "Weiger alles" buttons
- [x] **CONS-02**: Accept and Reject buttons have equal visual prominence (no dark patterns)
- [x] **CONS-03**: No `_ga` cookies set before user grants consent
- [x] **CONS-04**: Consent state persisted across sessions in localStorage
- [x] **CONS-05**: Consent state correctly restored on return from Shopify checkout without banner re-appearing
- [x] **CONS-06**: Site fully functional without granting consent (no cookie wall)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### E-Commerce Events

- **ECOM-07**: `view_item_list` event fires on category/subcategory pages
- **ECOM-08**: `select_item` event fires on product card click
- **ECOM-09**: `view_cart` event fires on cart page load

### Cookie Consent

- **CONS-07**: Consent re-prompt triggered on banner version change
- **CONS-08**: Consent restriction limited to EEA visitors only (geo-based)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Google Tag Manager | Unnecessary abstraction for developer-controlled codebase; adds latency |
| Server-side GA4 (Measurement Protocol) | Not justified until 10k+ monthly sessions where adblocker data loss matters |
| `add_payment_info` / `add_shipping_info` events | Require Shopify Plus checkout extensibility |
| Google Ads conversion tracking | Requires `ad_user_data` consent; most Dutch users decline; defer to ad milestone |
| GA4 audiences for remarketing | Depends on ad consent; unlikely to be widely granted |
| SaaS consent platforms (Cookiebot, OneTrust) | External dependency, monthly cost, unnecessary for this scale |
| `react-cookie-consent` library | No Consent Mode v2 support |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| GA4-01 | Phase 23 | Complete |
| GA4-02 | Phase 23 | Complete |
| GA4-03 | Phase 23 | Complete |
| ECOM-01 | Phase 24 | Complete |
| ECOM-02 | Phase 24 | Complete |
| ECOM-03 | Phase 24 | Complete |
| ECOM-04 | Phase 24 | Complete |
| ECOM-05 | Phase 24 | Complete |
| ECOM-06 | Phase 24 | Complete |
| CONS-01 | Phase 25 | Complete |
| CONS-02 | Phase 25 | Complete |
| CONS-03 | Phase 25 | Complete |
| CONS-04 | Phase 25 | Complete |
| CONS-05 | Phase 25 | Complete |
| CONS-06 | Phase 25 | Complete |

**Coverage:**
- v1.5 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-23 after completing Phase 24-02 (ECOM-03 through ECOM-06)*
