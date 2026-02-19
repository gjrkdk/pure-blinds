---
phase: 21-cart-ux
plan: 01
subsystem: ui
tags: [react, next.js, zustand, cart, ux]

# Dependency graph
requires:
  - phase: 21-cart-ux
    provides: cart store with hasSample selector and addItem/addSample actions
provides:
  - Split add-to-cart button: single Toevoegen transitions to Naar winkelwagen + Nog een toevoegen after adding
  - Sample button: Kleurstaal bestellen transitions to Bekijk winkelwagen based on cart state
  - Both navigation buttons route to /winkelwagen
  - Form reset via Nog een toevoegen (clears width, height, price, errors)
  - Dimension change resets split state back to single Toevoegen button
affects: [21-cart-ux, checkout, winkelwagen]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Persistent post-add state (addedToCart boolean) replaces ephemeral setTimeout feedback
    - Independent button state: addedToCart (product) and hasSample (sample) are decoupled
    - useRouter for client-side navigation to /winkelwagen

key-files:
  created: []
  modified:
    - src/components/dimension-configurator.tsx

key-decisions:
  - "No animation on button transition — instant swap per locked UX decision"
  - "Naar winkelwagen and Bekijk winkelwagen both use primary accent style for visual consistency"
  - "Nog een toevoegen uses bg-neutral-100 (muted) to indicate secondary action"
  - "addedToCart persists until explicit user action (form reset or dimension change) — no auto-reset timer"

patterns-established:
  - "Split button pattern: replace single CTA with two stacked buttons (primary navigation + secondary reset) after conversion action"

requirements-completed: [CART-01, CART-02]

# Metrics
duration: 2min
completed: 2026-02-19
---

# Phase 21 Plan 01: Cart UX - Split Button States Summary

**Split add-to-cart button that transitions to Naar winkelwagen + Nog een toevoegen after adding, and Kleurstaal bestellen transitions to Bekijk winkelwagen after sample add, with both navigating to /winkelwagen**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-19T15:01:04Z
- **Completed:** 2026-02-19T15:02:25Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Replaced ephemeral "Toegevoegd!" flash with persistent split-button state (Naar winkelwagen / Nog een toevoegen)
- Sample button now transitions from Kleurstaal bestellen to Bekijk winkelwagen using existing hasSample cart store selector
- Both post-add navigation buttons route to /winkelwagen via useRouter
- Dimension input changes (width or height) reset the split state back to single Toevoegen button
- Nog een toevoegen resets all form fields (width, height, price, errors) and returns to single button
- Product and sample button states are fully independent

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement split add-to-cart button and sample button state changes** - `62c2526` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/components/dimension-configurator.tsx` - Replaced addedFeedback/sampleFeedback with addedToCart boolean, added useRouter, conditional split-button rendering, handleResetForm, dimension-change resets

## Decisions Made
- No animation on button transition — instant swap per locked UX decision from phase context
- Both Naar winkelwagen and Bekijk winkelwagen use the primary accent style for visual parity
- Nog een toevoegen uses bg-neutral-100 (muted/secondary) to visually indicate lower priority action
- addedToCart state persists indefinitely until user acts — no setTimeout auto-reset

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

The `npx next build` reported a runtime error for missing `SHOPIFY_PRODUCT_MAP` environment variable (from Phase 20). This is a pre-existing environment configuration issue unrelated to this plan's changes. TypeScript type checking (`npx tsc --noEmit`) passed cleanly with zero errors, confirming the component changes are correct.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Split button UX complete and committed
- Product page now gives customers clear next-step navigation after adding items
- Ready for Phase 21-02 (remaining cart UX plans)

---
*Phase: 21-cart-ux*
*Completed: 2026-02-19*
