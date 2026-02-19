# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** Customers can order custom-dimension roller blinds with accurate matrix-based pricing that works reliably through Shopify checkout on all plan tiers.
**Current focus:** v1.4 Production Ready — Phase 22: Checkout & Order Tracking

## Current Position

Phase: 22 of 22 (Checkout & Order Tracking)
Plan: 2 of 2 in current phase
Status: In progress
Last activity: 2026-02-19 — Phase 22 Plan 02 complete (kleurstaal tag on Draft Orders with color samples)

Progress: [██████████████░░░░░░] 70% (21/30 plans complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 30
- Total v1.1 execution time: 465s (7m 45s)
- Total v1.2 execution time: 1,481s (24m 41s)
- Total v1.3 execution time: 1,180s (19m 40s)
- Total v1.4 execution time: ~194s (3m 14s so far)

**By Milestone:**

| Milestone | Phases | Plans | Total Time | Avg/Plan |
|-----------|--------|-------|------------|----------|
| v1.0 MVP | 1-5 | 9 | ~3 days | ~53 min |
| v1.1 Homepage | 6-10 | 5 | 465s (7.75m) | 93s |
| v1.2 Catalog | 11-14 | 6 | 1,481s (24.7m) | 247s |
| v1.3 Dutch/SEO | 15-18 | 9 | 1,180s (19.7m) | 131s |

## Accumulated Context

### Decisions

All decisions logged in PROJECT.md Key Decisions table.

Recent decisions affecting v1.4:
- [Quick 13]: Cart clearing moved to confirmation page with order ID signal — CHKOUT-02 partially addressed, needs verification
- [v1.3]: `NEXT_PUBLIC_BASE_URL` is the canonical env var name — FIX-01 removes stale `NEXT_PUBLIC_SITE_URL`
- [19-01]: SHOPIFY_PRODUCT_ID removed from env validation and CI — product IDs come from catalog since Phase 11
- [19-01]: Pricing JSON currency corrected to EUR — Shopify Draft Orders already used EUR since Phase 5
- [20-01]: SHOPIFY_PRODUCT_MAP stored as single JSON-encoded env var rather than 2N individual vars for catalog scalability
- [20-01]: .env.example is gitignored per project convention (prior PR #10 explicitly removed it from tracking)
- [20-01]: getShopifyIds returns undefined for unmapped products rather than throwing, preserving draft order resilience
- [21-01]: addedToCart persists until explicit user action (no auto-reset timer) — gives clear post-add navigation
- [21-01]: No animation on button transition — instant swap per locked UX decision
- [21-01]: Naar winkelwagen and Bekijk winkelwagen use primary accent style; Nog een toevoegen uses bg-neutral-100 (muted)
- [21-02]: Mobile cart icon uses useSyncExternalStore hydration guard (same pattern as CartIcon) to avoid SSR mismatch
- [21-02]: Badge styling matches desktop CartIcon (bg-foreground, text-accent-foreground) per locked nav styling decision
- [21-02]: Pulse animation via scale-125/scale-100 transition (300ms) — no external animation library needed
- [22-01]: Inline 'incl. 21% BTW' on configurator (text-base muted), 'incl. BTW' on cart line items and total — no separate breakdown line
- [22-01]: ClearCartOnMount accepts orderId prop; does nothing if absent (page handles redirect)
- [22-01]: verify-order endpoint safe default — any error returns { valid: false }, cart never risks data loss
- [22-01]: GID normalisation: numeric order_id -> gid://shopify/DraftOrder/${id}; full GIDs used as-is
- [22-01]: Empty cart CTA changed from /producten to / with Dutch 'Terug naar de winkel' text
- [22-02]: kleurstaal tag applied when ANY item is a sample (not only all-sample orders)
- [22-02]: Sample identification uses item.type === "sample" (CartItem.type field)
- [22-02]: Tag-only approach — no label prefixes on sample line item titles

### Pending Todos

Carried from v1.0:
- Add Phase 3 verification documentation (process gap from v1.0 audit)
- Create test products in Shopify store (deferred from Phase 1)
- Add unit tests for pricing calculator and cart store actions
- Pricing matrix reference in Draft Order custom attributes (ORDER-04 deferred)

Deployment action required:
- Add SHOPIFY_PRODUCT_MAP as GitHub Actions secret for CI build
- Add SHOPIFY_PRODUCT_MAP to Vercel environment variables (production and preview)
- Add SHOPIFY_PRODUCT_MAP to local .env.local for development

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit |
|---|-------------|------|--------|
| 3 | Add category page with white and black rollerblinds categories | 2026-02-12 | c98a510 |
| 4 | Change category page from white/black to transparent/blackout | 2026-02-14 | f6b5383 |
| 5 | Restructure categories - rollerblinds as main category | 2026-02-14 | d70f986 |
| 6 | Restructure product URLs to full hierarchical paths | 2026-02-14 | d8ba85c |
| 7 | Reduce spacing in navigation header | 2026-02-14 | 77239b2 |
| 9 | Translate product URL slugs and breadcrumbs to Dutch | 2026-02-14 | b4140c9 |
| 10 | Deployment vercel | 2026-02-14 | a92a5e8 |
| 11 | Add product image, USPs and specification | 2026-02-15 | a36846e |
| 12 | Add additional product images underneath | 2026-02-15 | 055f66a |
| 13 | Clear cart only after order completion | 2026-02-18 | d2ec260 |

## Session Continuity

Last session: 2026-02-19
Stopped at: Completed 22-01-PLAN.md (Phase 22 Checkout & Order Tracking — VAT labels and smart cart clearing)
Resume file: None
Next step: Phase 22 complete — all plans finished

---
*Last updated: 2026-02-19 after Phase 22 Plan 01 execution*
