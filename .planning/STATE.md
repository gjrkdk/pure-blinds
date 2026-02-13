# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Customers can order custom-dimension textiles with accurate matrix-based pricing that works reliably through Shopify checkout on all plan tiers.
**Current focus:** Phase 14 - Polish & URL Migration

## Current Position

Phase: 14 of 14 (Polish & URL Migration)
Plan: 1 of 1 complete
Status: Phase 14 complete
Last activity: 2026-02-13 — Plan 14-01 complete (URL migration to /confirmation, WCAG breadcrumbs)

Progress: [████████████████████] 100% (14/14 phases complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 20 (9 from v1.0, 5 from v1.1, 6 from v1.2)
- Average duration: 220s (v1.2 tracking)
- Total v1.0 execution time: ~3 days (Jan 29-31)
- Total v1.1 execution time: 465s (7m 45s)
- Total v1.2 execution time: 1481s (24m 41s)

**By Milestone:**

| Milestone | Phases | Plans | Total Time | Avg/Plan |
|-----------|--------|-------|------------|----------|
| v1.0 MVP | 1-5 | 9 | ~3 days | ~53 min |
| v1.1 Homepage | 6-10 | 5 | 465s (7.75m) | 93s |
| v1.2 Catalog | 11-14 | 6/7 | 1481s (24.7m) | 247s |

*Updated after 14-01 execution*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [14-01]: 308 permanent redirect preserves query parameters through /thank-you to /confirmation migration
- [14-01]: Mobile touch targets use py-3 (44px) for WCAG 2.5.8 compliance
- [14-01]: Breadcrumb truncation at 150px for links, 200px for current page with title hover text
- [13-01]: Relative imports for .velite data vs TypeScript path alias — Turbopack doesn't recognize #content/* alias, relative imports work without config
- [13-01]: next.config.mjs with ESM vs next.config.ts — Velite requires top-level await, TypeScript config doesn't support it
- [13-01]: @plugin directive for Tailwind v4 typography — Tailwind v4 loads plugins via CSS, not tailwind.config.js
- [12-01]: Static category routes vs dynamic [category] route — for 3 stable categories, static pages avoid Next.js route collision with [productId], simpler than URL restructuring
- [12-01]: Breadcrumbs as reusable server component with W3C ARIA — aria-label, aria-current, aria-hidden for accessibility, zero client-side JS
- [12-02]: Static category routes vs dynamic [category] — avoids Next.js route ambiguity with [productId], enables full SSG
- [11-02]: Cart ID format as human-readable productId-widthxheight — better debugging than hashes
- [11-02]: Zustand persist v2 migration clears old carts — acceptable pre-launch, simpler than transformation
- [11-02]: Shopify customAttributes with capitalized keys and units — better invoice display
- [11-01]: Product catalog as JSON file — 4 products don't justify database, direct imports for fast access
- [11-01]: Pure pricing calculator with matrix parameter — zero module-level imports, any matrix can be passed
- [v1.1]: Placeholder content over real copy — ship structure first, fill business copy separately
- [v1.1]: Client component for header, server for footer — optimal rendering split
- [v1.0]: Pricing as standalone domain — engine must be reusable across webshop, app, and API
- [v1.0]: BFF architecture (Next.js) — single codebase for frontend + backend

### Pending Todos

From v1.0 carried forward:
- Add Phase 3 verification documentation (process gap from v1.0 audit)
- Create test products in Shopify store (deferred from Phase 1)
- Add unit tests for pricing calculator and cart store actions
- Pricing matrix reference in Draft Order custom attributes (ORDER-04 deferred from v1.0)

### Blockers/Concerns

**Architecture flags for v1.2:**
- Cart ID generation must include productId to prevent collisions (Phase 11) — ✅ Resolved: Plan 11-02 implemented productId-widthxheight format
- Pricing engine refactor must maintain zero Shopify dependencies (Phase 11) — ✅ Resolved: Pricing calculator is pure function with zero data imports
- Zustand localStorage hydration needs proper client-side handling (Phase 11) — ✅ Resolved: Plan 11-02 added v2 migration for cart format

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 3 | Add category page with white and black rollerblinds categories | 2026-02-12 | c98a510 | [3-add-category-page-with-white-and-black-r](./quick/3-add-category-page-with-white-and-black-r/) |

## Session Continuity

Last session: 2026-02-13
Stopped at: Phase 14 Plan 01 complete — URL migration to /confirmation with permanent redirect, WCAG 2.5.8 breadcrumbs with responsive touch targets
Resume file: None
Next step: v1.2 milestone complete — all 14 phases finished

---
*Last updated: 2026-02-13 after Phase 14-01 execution*
