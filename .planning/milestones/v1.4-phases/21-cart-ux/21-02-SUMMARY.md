---
phase: 21-cart-ux
plan: 02
subsystem: ui
tags: [react, zustand, next.js, tailwind, mobile, cart]

# Dependency graph
requires:
  - phase: 21-cart-ux
    provides: Cart store with getItemCount selector and useCartStore hook
provides:
  - Mobile-only cart icon with item count badge in header, positioned left of hamburger menu
affects: [21-cart-ux, header, mobile-navigation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useSyncExternalStore hydration guard pattern for SSR-safe client state"
    - "useRef + useEffect pulse animation pattern for badge count changes"

key-files:
  created: []
  modified:
    - src/components/layout/header.tsx

key-decisions:
  - "Shopping bag SVG (Heroicons outline) chosen over cart icon for clean minimal aesthetic matching store design"
  - "Badge uses bg-foreground / text-accent-foreground matching existing desktop CartIcon badge styling"
  - "Pulse animation implemented as scale-125 → scale-100 transition (300ms) via badgePulse state + setTimeout"
  - "emptySubscribe / useSyncExternalStore pattern reused from CartIcon to avoid SSR hydration mismatch"

patterns-established:
  - "Mobile-only UI elements: wrap in md:hidden div, desktop unchanged"
  - "Cart badge hydration: useSyncExternalStore(emptySubscribe, () => true, () => false)"

requirements-completed: [CART-03]

# Metrics
duration: 2min
completed: 2026-02-19
---

# Phase 21 Plan 02: Mobile Cart Icon with Badge Summary

**Mobile-only shopping bag icon with animated item count badge added to header, left of hamburger, using useSyncExternalStore hydration pattern and scale pulse animation on count change**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-19T15:01:02Z
- **Completed:** 2026-02-19T15:02:16Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Mobile cart icon (shopping bag SVG) visible only below md breakpoint, positioned left of hamburger menu
- Item count badge appears only when cart has items, disappears when cart empties
- Badge pulses (scale-125 for 300ms) whenever item count increases, providing tactile feedback
- Desktop CartIcon in nav and mobile menu CartIcon both remain completely unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Add mobile cart icon with animated badge to header** - `698793c` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/components/layout/header.tsx` - Added useSyncExternalStore/useCartStore imports, cart state with pulse animation tracking, replaced standalone hamburger button with md:hidden wrapper containing cart icon link + hamburger

## Decisions Made

- Shopping bag icon (Heroicons `shopping-bag` outline) used rather than the shopping cart path from CartIcon, for a slightly more modern look while still fitting the minimal store aesthetic
- Badge styling (`bg-foreground`, `text-accent-foreground`, `text-[10px]`, `font-semibold`) exactly matches the existing desktop CartIcon badge to maintain visual consistency per locked decision
- Pulse animation via `transition-transform` with `scale-125`/`scale-100` toggle — lightweight, no external animation library needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Build failed during `npx next build` verification due to missing `SHOPIFY_PRODUCT_MAP` env var in local `.env.local` — this is a pre-existing issue from Phase 20 deployment requirements, unrelated to header changes. TypeScript compilation (`npx tsc --noEmit`) passed with zero errors.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Mobile cart icon is live in header; next plan can proceed to remaining cart UX tasks
- Pre-existing `SHOPIFY_PRODUCT_MAP` environment variable still needs to be added to local `.env.local`, Vercel, and GitHub Actions (tracked in STATE.md pending todos from Phase 20)

## Self-Check: PASSED

- `src/components/layout/header.tsx` — FOUND
- `21-02-SUMMARY.md` — FOUND
- Commit `698793c` — FOUND

---
*Phase: 21-cart-ux*
*Completed: 2026-02-19*
