---
phase: 22-checkout-order-tracking
plan: "02"
subsystem: api
tags: [shopify, draft-order, graphql, tags, operations]

# Dependency graph
requires:
  - phase: 22-checkout-order-tracking
    provides: Draft Order creation via createDraftOrder (22-01)

provides:
  - Conditional kleurstaal tag on Draft Orders containing color samples
  - Operations team can filter sample orders in Shopify admin via tag

affects:
  - Shopify admin order view
  - Operations fulfillment workflow

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Conditional DraftOrderInput field via spread operator: ...(condition && { field: value })"

key-files:
  created: []
  modified:
    - src/lib/shopify/draft-order.ts

key-decisions:
  - "kleurstaal tag applied when ANY item is a sample (not only all-sample orders)"
  - "Tag only — no additional labels or prefixes on sample line items"
  - "Sample identification uses item.type === 'sample' (CartItem.type field)"

patterns-established:
  - "Conditional GraphQL input fields via spread: ...(hasSamples && { tags: ['kleurstaal'] })"

requirements-completed: [TRACK-01]

# Metrics
duration: 1min
completed: 2026-02-19
---

# Phase 22 Plan 02: Kleurstaal Tag on Sample Draft Orders Summary

**Conditional kleurstaal tag on Shopify Draft Orders — hasSamples detection via item.type === "sample" spread into DraftOrderInput**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-02-19T15:50:17Z
- **Completed:** 2026-02-19T15:51:58Z
- **Tasks:** 1/1
- **Files modified:** 1

## Accomplishments

- Draft Orders containing at least one color sample now carry the `kleurstaal` tag in Shopify admin
- Orders with only regular (product) items receive no extra tags
- Existing line item mapping, custom attributes, and mutation structure are entirely unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Add conditional kleurstaal tag to Draft Order creation** - `788f946` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/lib/shopify/draft-order.ts` - Added `hasSamples` detection and conditional `tags: ["kleurstaal"]` spread in DraftOrderInput

## Decisions Made

- kleurstaal tag applies whenever at least one item is a sample (mixed carts are tagged too)
- Tag-only approach — no label prefixes on line item titles for sample items
- Detection uses `item.type === "sample"` matching `CartItem.type?: "product" | "sample"`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Draft Orders with samples now tagged `kleurstaal` — operations team can use this tag in Shopify admin to filter and separately handle sample orders
- No blockers for subsequent plans in Phase 22

---
*Phase: 22-checkout-order-tracking*
*Completed: 2026-02-19*
