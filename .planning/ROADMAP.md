# Roadmap: Custom Dimension Roller Blinds Webshop

## Milestones

- ✅ **v1.0 MVP** — Phases 1-5 (shipped 2026-01-31)
- ✅ **v1.1 Design Homepage** — Phases 6-10 (shipped 2026-02-10)
- ✅ **v1.2 Product Catalog & Navigation** — Phases 11-14 (shipped 2026-02-13)
- ✅ **v1.3 Dutch Content & SEO** — Phases 15-18 (shipped 2026-02-14)
- ✅ **v1.4 Production Ready** — Phases 19-22 (shipped 2026-02-19)
- 🚧 **v1.5 Analytics & Privacy** — Phases 23-25 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-5) — SHIPPED 2026-01-31</summary>

- [x] Phase 1: Foundation & Setup (3/3 plans) — completed 2026-01-29
- [x] Phase 2: Pricing Engine (2/2 plans) — completed 2026-01-29
- [x] Phase 3: Product Page & Real-time Pricing (2/2 plans) — completed 2026-01-30
- [x] Phase 4: Cart Management (1/1 plan) — completed 2026-01-30
- [x] Phase 5: Checkout Integration (1/1 plan) — completed 2026-01-31

</details>

<details>
<summary>✅ v1.1 Design Homepage (Phases 6-10) — SHIPPED 2026-02-10</summary>

- [x] Phase 6: Navigation & Layout (1/1 plan) — completed 2026-02-09
- [x] Phase 7: Hero Section (1/1 plan) — completed 2026-02-09
- [x] Phase 8: About & Services (1/1 plan) — completed 2026-02-09
- [x] Phase 9: Showcase & Social Proof (1/1 plan) — completed 2026-02-10
- [x] Phase 10: Support & Contact (1/1 plan) — completed 2026-02-10

</details>

<details>
<summary>✅ v1.2 Product Catalog & Navigation (Phases 11-14) — SHIPPED 2026-02-13</summary>

- [x] Phase 11: Product Catalog Foundation (2/2 plans) — completed 2026-02-13
- [x] Phase 12: Category Navigation & Product Expansion (2/2 plans) — completed 2026-02-13
- [x] Phase 13: Blog Foundation & Content Marketing (1/1 plan) — completed 2026-02-13
- [x] Phase 14: Polish & URL Migration (1/1 plan) — completed 2026-02-13

</details>

<details>
<summary>✅ v1.3 Dutch Content & SEO (Phases 15-18) — SHIPPED 2026-02-14</summary>

- [x] Phase 15: Category Cleanup & Redirects (2/2 plans) — completed 2026-02-14
- [x] Phase 16: Dutch Content & Metadata (4/4 plans) — completed 2026-02-14
- [x] Phase 17: Structured Data (2/2 plans) — completed 2026-02-14
- [x] Phase 18: Sitemap & Robots (1/1 plan) — completed 2026-02-14

</details>

<details>
<summary>✅ v1.4 Production Ready (Phases 19-22) — SHIPPED 2026-02-19</summary>

- [x] Phase 19: Bug Fixes (1/1 plan) — completed 2026-02-19
- [x] Phase 20: Environment Configuration (1/1 plan) — completed 2026-02-19
- [x] Phase 21: Cart UX (2/2 plans) — completed 2026-02-19
- [x] Phase 22: Checkout & Order Tracking (2/2 plans) — completed 2026-02-19

</details>

### 🚧 v1.5 Analytics & Privacy (In Progress)

**Milestone Goal:** Full e-commerce funnel tracking with GDPR-compliant cookie consent

- [ ] **Phase 23: GA4 Foundation** — GA4 loads with Consent Mode v2 defaults, cross-domain session continuity, SPA page views
- [ ] **Phase 24: E-Commerce Events** — Complete funnel tracked: view_item, add_to_cart, begin_checkout, purchase with deduplication
- [ ] **Phase 25: Cookie Consent Banner** — GDPR-compliant Dutch-language banner with equal-prominence buttons and persistent consent state

## Phase Details

### Phase 23: GA4 Foundation
**Goal**: GA4 receives page views from pure-blinds.nl with Consent Mode v2 defaults set, cross-domain session continuity to Shopify checkout established, and SPA route changes tracked automatically
**Depends on**: Phase 22
**Requirements**: GA4-01, GA4-02, GA4-03
**Success Criteria** (what must be TRUE):
  1. No `_ga` cookie appears in browser storage before a user grants consent — verified in DevTools Application tab
  2. GA4 DebugView shows page_view events firing on every App Router route change without a full page reload
  3. A test checkout session from pure-blinds.nl through Shopify checkout back to /bevestiging shows a single continuous GA4 session (no "(direct)/(none)" attribution break)
  4. GA4 property has all four Consent Mode v2 parameters defaulted to "denied" before gtag.js fires — confirmed by checking gtag initialization order in browser Network tab
**Plans**: 1 plan
Plans:
- [ ] 23-01-PLAN.md — Analytics module, Consent Mode v2 Script tags, SPA route tracking, cross-domain linker

### Phase 24: E-Commerce Events
**Goal**: The complete GA4 e-commerce funnel — view_item, add_to_cart, begin_checkout, purchase — fires on every relevant user action with correct EUR pricing data, and the purchase event fires exactly once per checkout even on page refresh
**Depends on**: Phase 23
**Requirements**: ECOM-01, ECOM-02, ECOM-03, ECOM-04, ECOM-05, ECOM-06
**Success Criteria** (what must be TRUE):
  1. GA4 DebugView shows a `view_item` event with correct item_id, item_name, and VAT-inclusive EUR price when a user opens a product detail page
  2. GA4 DebugView shows an `add_to_cart` event with the configured dimensions and price when a user adds an item to cart
  3. GA4 DebugView shows a `begin_checkout` event when a user clicks the checkout button, before the Shopify redirect fires
  4. GA4 DebugView shows a `purchase` event on /bevestiging with a transaction_id and the full items array matching what was in the cart
  5. Refreshing /bevestiging after a completed checkout does not fire a second `purchase` event — verified in GA4 DebugView and Network tab
**Plans**: TBD

### Phase 25: Cookie Consent Banner
**Goal**: A GDPR-compliant Dutch-language cookie consent banner is visible on first visit, "Accepteer alles" and "Weiger alles" buttons are equally prominent, consent state persists across sessions and survives the Shopify checkout redirect, and the site works fully without consent
**Depends on**: Phase 24
**Requirements**: CONS-01, CONS-02, CONS-03, CONS-04, CONS-05, CONS-06
**Success Criteria** (what must be TRUE):
  1. A new visitor sees a Dutch-language cookie banner with "Accepteer alles" and "Weiger alles" buttons at equal visual size and prominence — no buried or greyed-out reject option
  2. A user who accepted consent on a previous visit does not see the banner again when returning to the site — banner does not re-appear across browser sessions
  3. A user who accepted consent and then completed a Shopify checkout returns to /bevestiging without the banner re-appearing
  4. Inspecting browser cookies before clicking "Accepteer alles" shows no `_ga` cookie present
  5. Clicking "Weiger alles" allows the user to continue browsing all pages normally — product pages, cart, and checkout function without consent granted
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Setup | v1.0 | 3/3 | Complete | 2026-01-29 |
| 2. Pricing Engine | v1.0 | 2/2 | Complete | 2026-01-29 |
| 3. Product Page & Real-time Pricing | v1.0 | 2/2 | Complete | 2026-01-30 |
| 4. Cart Management | v1.0 | 1/1 | Complete | 2026-01-30 |
| 5. Checkout Integration | v1.0 | 1/1 | Complete | 2026-01-31 |
| 6. Navigation & Layout | v1.1 | 1/1 | Complete | 2026-02-09 |
| 7. Hero Section | v1.1 | 1/1 | Complete | 2026-02-09 |
| 8. About & Services | v1.1 | 1/1 | Complete | 2026-02-09 |
| 9. Showcase & Social Proof | v1.1 | 1/1 | Complete | 2026-02-10 |
| 10. Support & Contact | v1.1 | 1/1 | Complete | 2026-02-10 |
| 11. Product Catalog Foundation | v1.2 | 2/2 | Complete | 2026-02-13 |
| 12. Category Navigation & Product Expansion | v1.2 | 2/2 | Complete | 2026-02-13 |
| 13. Blog Foundation & Content Marketing | v1.2 | 1/1 | Complete | 2026-02-13 |
| 14. Polish & URL Migration | v1.2 | 1/1 | Complete | 2026-02-13 |
| 15. Category Cleanup & Redirects | v1.3 | 2/2 | Complete | 2026-02-14 |
| 16. Dutch Content & Metadata | v1.3 | 4/4 | Complete | 2026-02-14 |
| 17. Structured Data | v1.3 | 2/2 | Complete | 2026-02-14 |
| 18. Sitemap & Robots | v1.3 | 1/1 | Complete | 2026-02-14 |
| 19. Bug Fixes | v1.4 | 1/1 | Complete | 2026-02-19 |
| 20. Environment Configuration | v1.4 | 1/1 | Complete | 2026-02-19 |
| 21. Cart UX | v1.4 | 2/2 | Complete | 2026-02-19 |
| 22. Checkout & Order Tracking | v1.4 | 2/2 | Complete | 2026-02-19 |
| 23. GA4 Foundation | v1.5 | 0/1 | Planned | - |
| 24. E-Commerce Events | v1.5 | 0/? | Not started | - |
| 25. Cookie Consent Banner | v1.5 | 0/? | Not started | - |

---
*Last updated: 2026-02-22 after v1.5 roadmap creation*
