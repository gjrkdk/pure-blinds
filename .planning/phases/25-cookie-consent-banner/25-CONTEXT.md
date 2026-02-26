# Phase 25: Cookie Consent Banner - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

A GDPR-compliant Dutch-language cookie consent banner visible on first visit. "Accepteer alles" and "Weiger alles" buttons at equal visual size and prominence. Consent state persists across sessions and survives the Shopify checkout redirect. The site works fully without consent. Includes a basic Dutch privacy policy page.

</domain>

<decisions>
## Implementation Decisions

### Banner appearance
- Full-width bottom bar, fixed to viewport bottom
- Non-blocking — user can scroll and interact with the page while banner is visible
- Matches site's existing design (color palette, fonts, styling)
- "Accepteer alles" and "Weiger alles" buttons with identical styling — same size, color, and prominence. No visual nudge toward accepting.

### Consent granularity
- Simple accept/reject — two buttons only, no per-category toggles
- No re-consent mechanism (no footer link to re-open banner). User clears browser data to reset.
- GA4 analytics cookies only — no marketing cookies planned. Consent covers analytics_storage only.

### Banner copy & tone
- Friendly and casual Dutch — warm, conversational tone matching a small business feel
- Two sentences explaining what cookies do and why, plus buttons
- Include a "Lees meer" or "Privacybeleid" link to a privacy policy page
- Create a basic /privacybeleid page with standard Dutch privacy/cookie policy text covering GA4 analytics

### Consent persistence
- Store consent state in localStorage
- 12-month expiration — banner re-appears after 12 months (GDPR recommendation)
- localStorage survives cross-domain Shopify checkout navigation — banner stays hidden on return
- When consent is granted, call gtag('consent', 'update', ...) immediately on the same page load — analytics starts tracking from that moment

### Claude's Discretion
- Exact banner copy wording (within the tone/length guidelines above)
- Privacy policy page content and structure
- localStorage key naming and data structure
- Animation/transition for banner show/hide
- Mobile responsive adjustments for the bottom bar

</decisions>

<specifics>
## Specific Ideas

- Phase 24 UAT revealed that analytics_storage:'denied' (set in Phase 23) blocks GA4 cookies, _gl linker decoration, and event_callback dispatch. This phase's consent update is the key that unlocks the entire checkout analytics flow (tests 4-8).
- The gtag('consent', 'update', ...) call must update analytics_storage to 'granted' when user accepts. This will cause GA4 to write _ga cookies, enable the cross-domain linker, and make events visible in GA4 DebugView.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 25-cookie-consent-banner*
*Context gathered: 2026-02-26*
