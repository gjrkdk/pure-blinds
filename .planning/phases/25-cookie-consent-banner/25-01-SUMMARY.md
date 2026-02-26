---
phase: 25-cookie-consent-banner
plan: 01
subsystem: ui
tags: [vanilla-cookieconsent, ga4, consent-mode-v2, gdpr, cookies, analytics]

# Dependency graph
requires:
  - phase: 23-ga4-foundation
    provides: gtag() with Consent Mode v2 defaults — analytics_storage denied by default
  - phase: 24-e-commerce-events
    provides: GA4 event tracking pipeline that consent banner unlocks
provides:
  - Dutch-language consent banner (Accepteer alles / Weiger alles) visible on first visit
  - gtag consent update on accept (analytics_storage: granted)
  - Consent persisted in localStorage (cc_cookie, 365-day expiry)
  - Returning-visitor consent restoration via onConsent hook
  - Equal-weight button styling (no dark pattern nudge)
affects: [25-02-PLAN, GA4 analytics pipeline, privacy compliance]

# Tech tracking
tech-stack:
  added: [vanilla-cookieconsent@3.1.0]
  patterns:
    - CookieConsent.run() in useEffect with no dependency — fires once on mount
    - updateGtagConsent() called from both onFirstConsent and onConsent hooks
    - useLocalStorage: true as alternative to browser cookies for consent storage
    - Banner component mounted outside GA_MEASUREMENT_ID conditional for always-on display

key-files:
  created:
    - src/components/analytics/cookie-consent-banner.tsx
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - package.json

key-decisions:
  - "vanilla-cookieconsent useLocalStorage: true — stores consent in localStorage, not browser cookie"
  - "expiresAfterDays: 365 — 12-month GDPR recommendation, overrides library default of 182"
  - "equalWeightButtons: true — identical button styling, CONS-02 compliance, no dark pattern"
  - "Both onFirstConsent AND onConsent wired to updateGtagConsent — onConsent restores consent after Shopify cross-domain redirect"
  - "Banner mounted outside GA_MEASUREMENT_ID conditional — always shows regardless of GA4 config"
  - "No title in nl translation — bar inline layout is minimal, title omitted per design decision"
  - "preferencesModal: { sections: [] } — required by Translation type, no preferences UI needed"

patterns-established:
  - "Consent banner pattern: run() in useEffect, return null, gtag guard via typeof window.gtag !== 'function'"
  - "CSS override pattern: #cc-main block at bottom of globals.css using existing :root design tokens"

requirements-completed: [CONS-01, CONS-02, CONS-03, CONS-04, CONS-05, CONS-06]

# Metrics
duration: 2min
completed: 2026-02-26
---

# Phase 25 Plan 01: Cookie Consent Banner Summary

**vanilla-cookieconsent v3.1.0 consent banner with GA4 Consent Mode v2 integration — gtag analytics_storage toggled on accept, localStorage persistence, Dutch UI, equal-weight buttons**

## Performance

- **Duration:** 2 min 21s
- **Started:** 2026-02-26T20:00:19Z
- **Completed:** 2026-02-26T20:02:40Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- CookieConsentBanner component created — `'use client'`, calls `CookieConsent.run()` in `useEffect`, returns null
- Full GA4 Consent Mode v2 integration: `updateGtagConsent()` called from both `onFirstConsent` and `onConsent` hooks
- CSS theme overrides aligned to site design tokens via `#cc-main` block in `globals.css`
- Banner mounted in root layout after `<PurchaseTracker />`, outside `GA_MEASUREMENT_ID` conditional

## Task Commits

Each task was committed atomically:

1. **Task 1: Install vanilla-cookieconsent and create CookieConsentBanner component** - `0e9503e` (feat)
2. **Task 2: Add CSS overrides and mount banner in root layout** - `be77c73` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified

- `src/components/analytics/cookie-consent-banner.tsx` - CookieConsentBanner client component with full vanilla-cookieconsent v3 configuration
- `src/app/globals.css` - `#cc-main` CSS variable overrides using site design tokens
- `src/app/layout.tsx` - Import and render `<CookieConsentBanner />` after `<PurchaseTracker />`
- `package.json` / `package-lock.json` - vanilla-cookieconsent@3.1.0 added

## Decisions Made

- `useLocalStorage: true` — consent stored in localStorage, not a browser cookie (CONS-04 locked decision)
- `expiresAfterDays: 365` — 12-month GDPR recommendation, not the library default of 182
- `equalWeightButtons: true` — identical button styling, no dark pattern nudge (CONS-02)
- Both `onFirstConsent` AND `onConsent` wired to `updateGtagConsent` — `onConsent` fires on every page load when consent exists, restoring GA4 analytics after Shopify checkout cross-domain redirect (CONS-05)
- `autoClear.cookies` with `/^_ga/` regex and `_gid` — clears GA cookies on reject after previous accept
- No `disablePageInteraction` — site remains fully usable without consent (CONS-06)
- No `title` in nl translation — `bar inline` layout is minimal by design
- Banner mounted outside `GA_MEASUREMENT_ID` conditional — always shows (CONS-01), `typeof window.gtag !== 'function'` guard degrades gracefully when GA4 absent

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - TypeScript] Added preferencesModal to satisfy Translation type requirement**
- **Found during:** Task 1 (Create CookieConsentBanner component)
- **Issue:** `vanilla-cookieconsent` `Translation` interface requires both `consentModal` and `preferencesModal` fields. Plan only specified `consentModal` in the nl translation. TypeScript error: `Property 'preferencesModal' is missing in type...`
- **Fix:** Added `preferencesModal: { sections: [] }` to the nl translation — minimal valid value satisfying the type, no visible preferences modal rendered
- **Files modified:** `src/components/analytics/cookie-consent-banner.tsx`
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** `0e9503e` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - TypeScript type error)
**Impact on plan:** Auto-fix necessary for TypeScript compilation. No functional scope creep — `preferencesModal: { sections: [] }` is an empty config that doesn't render any UI.

## Issues Encountered

Build initially failed due to missing `.velite/posts.json` — pre-existing issue unrelated to consent banner changes. Running `npx velite build` before `npm run build` resolves it (velite regenerates the JSON from content files). Both builds passed cleanly after velite generation.

## User Setup Required

None — no external service configuration required. The banner works immediately on deployment; GA4 analytics will activate once users accept consent.

## Next Phase Readiness

- Cookie consent banner is fully wired and ready for testing
- Phase 25-02 (if it exists) can build on the banner for preference management
- GA4 analytics pipeline is now complete: Phase 23 defaults consent denied → Phase 25 banner accepts/rejects → gtag consent update enables/disables analytics_storage
- Real checkout test still needed to validate sessionStorage purchase event survives Shopify cross-domain redirect (noted blocker from Phase 24)

---
*Phase: 25-cookie-consent-banner*
*Completed: 2026-02-26*
