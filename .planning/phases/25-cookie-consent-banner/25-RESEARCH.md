# Phase 25: Cookie Consent Banner - Research

**Researched:** 2026-02-26
**Domain:** GDPR cookie consent, vanilla-cookieconsent v3, GA4 Consent Mode v2, Next.js App Router
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Banner appearance:** Full-width bottom bar, fixed to viewport bottom. Non-blocking — user can scroll and interact. Matches site design (color palette, fonts). "Accepteer alles" and "Weiger alles" buttons with identical styling — same size, color, prominence. No visual nudge toward accepting.
- **Consent granularity:** Simple accept/reject — two buttons only, no per-category toggles. No re-consent mechanism (no footer link to re-open banner). User clears browser data to reset. GA4 analytics cookies only — consent covers analytics_storage only.
- **Banner copy & tone:** Friendly and casual Dutch — warm, conversational tone matching a small business feel. Two sentences explaining what cookies do and why, plus buttons. Include a "Lees meer" or "Privacybeleid" link to a privacy policy page. Create a basic /privacybeleid page with standard Dutch privacy/cookie policy text covering GA4 analytics.
- **Consent persistence:** Store consent state in localStorage. 12-month expiration — banner re-appears after 12 months (GDPR recommendation). localStorage survives cross-domain Shopify checkout navigation — banner stays hidden on return. When consent is granted, call `gtag('consent', 'update', ...)` immediately on the same page load.
- **Library:** vanilla-cookieconsent@3.1.0 (from STATE.md v1.5 planning decision)

### Claude's Discretion

- Exact banner copy wording (within the tone/length guidelines)
- Privacy policy page content and structure
- localStorage key naming and data structure
- Animation/transition for banner show/hide
- Mobile responsive adjustments for the bottom bar

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONS-01 | Dutch-language cookie consent banner with "Accepteer alles" and "Weiger alles" buttons | vanilla-cookieconsent v3 `language.translations.nl` config; `acceptAllBtn` and `acceptNecessaryBtn` fields |
| CONS-02 | Accept and Reject buttons have equal visual prominence (no dark patterns) | `guiOptions.consentModal.equalWeightButtons: true` is a built-in library option |
| CONS-03 | No `_ga` cookies set before user grants consent | Phase 23 Consent Mode v2 defaults (`analytics_storage: 'denied'`) already block `_ga`; `onConsent`/`onFirstConsent` hooks call `gtag('consent', 'update', { analytics_storage: 'granted' })` |
| CONS-04 | Consent state persisted across sessions in localStorage | `cookie.useLocalStorage: true` in vanilla-cookieconsent config stores state under key `cc_cookie` in localStorage (not a browser cookie) |
| CONS-05 | Consent state correctly restored on return from Shopify checkout without banner re-appearing | localStorage survives cross-domain navigation (confirmed: it's domain-scoped, stays on pure-blinds.nl); `onConsent` fires on every page load when consent exists, which re-issues `gtag('consent', 'update')` |
| CONS-06 | Site fully functional without granting consent (no cookie wall) | `autoShow: true` (default) shows banner but does NOT block interaction; `disablePageInteraction: false` (default) is the correct setting |
</phase_requirements>

---

## Summary

Phase 25 implements a GDPR-compliant Dutch cookie consent banner using vanilla-cookieconsent v3.1.0 (already decided in STATE.md). The library handles all consent state persistence, UI rendering, and event lifecycle. The implementation wires the library's consent callbacks directly into GA4's existing Consent Mode v2 `gtag('consent', 'update')` call established in Phase 23.

The most important architectural insight: vanilla-cookieconsent stores consent in a **browser cookie** by default (`cc_cookie`, 182-day expiration). The CONTEXT.md decision to use localStorage is satisfied by `cookie.useLocalStorage: true`, which stores the same payload in localStorage under the key `cc_cookie`. This is critical for the STATE.md blocker: "Confirm vanilla-cookieconsent cookie name/format before deciding between server-side and client-side consent restoration approach" — the answer is: use `useLocalStorage: true`, the key is `cc_cookie`, no server-side logic needed. localStorage persists across the Shopify cross-domain redirect because localStorage is origin-scoped to pure-blinds.nl and is unaffected by navigation to a different domain and back.

The phase has two deliverables: (1) the CookieConsentBanner client component mounted in root layout, and (2) a static `/privacybeleid` page. The banner component is a `'use client'` React component with a single `useEffect` calling `CookieConsent.run()`. CSS overrides in `globals.css` handle design alignment with the site's existing color palette and typography.

**Primary recommendation:** Use vanilla-cookieconsent v3.1.0 with `useLocalStorage: true`, `bar inline` layout at `bottom`, `equalWeightButtons: true`, Dutch `nl` translations, and wire `onFirstConsent`/`onConsent` hooks to call `gtag('consent', 'update', { analytics_storage: 'granted' })`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vanilla-cookieconsent | 3.1.0 | Banner UI, consent state, category lifecycle | Zero dependencies, native Consent Mode v2 signal mapping, already decided in STATE.md |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | — | — | No additional libraries needed; GA4 gtag already wired |

### Alternatives Considered (from REQUIREMENTS.md out-of-scope section)

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| vanilla-cookieconsent | react-cookie-consent | Explicitly excluded — no Consent Mode v2 support |
| vanilla-cookieconsent | Cookiebot / OneTrust | Explicitly excluded — external dependency, monthly cost, overkill for this scale |
| vanilla-cookieconsent | Custom banner | Custom solution means hand-rolling consent state management, expiry logic, Consent Mode integration |

**Installation:**
```bash
npm install vanilla-cookieconsent@3.1.0
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── analytics/
│   │   ├── analytics-provider.tsx     # existing — SPA page_view tracking
│   │   ├── purchase-tracker.tsx       # existing — /bevestiging purchase event
│   │   └── cookie-consent-banner.tsx  # NEW — 'use client', CookieConsent.run()
├── app/
│   ├── layout.tsx                     # ADD: <CookieConsentBanner /> after existing analytics
│   ├── privacybeleid/
│   │   └── page.tsx                   # NEW — static Dutch privacy policy page
│   └── globals.css                    # ADD: cc- CSS variable overrides at bottom
```

### Pattern 1: Client Component with useEffect

**What:** vanilla-cookieconsent is a DOM-manipulating library. Mount it in a `'use client'` component using `useEffect` with an empty dependency array.

**When to use:** Always — this is the only valid pattern for vanilla JS libraries in Next.js App Router.

**Example:**
```typescript
// Source: https://cookieconsent.orestbida.com/essential/getting-started.html
'use client'

import { useEffect } from 'react'
import 'vanilla-cookieconsent/dist/cookieconsent.css'
import * as CookieConsent from 'vanilla-cookieconsent'

export function CookieConsentBanner() {
  useEffect(() => {
    CookieConsent.run({
      // config
    })
  }, [])

  return null
}
```

### Pattern 2: GA4 Consent Mode v2 Integration

**What:** Wire `onFirstConsent` and `onConsent` hooks to call `gtag('consent', 'update')`. `onFirstConsent` fires when the user makes their FIRST choice (new visitor). `onConsent` fires on EVERY subsequent page load when consent already exists (returning visitor, including return from Shopify checkout).

**When to use:** Required — this is how Consent Mode v2 receives the user's signal.

**Example:**
```typescript
// Source: https://github.com/orestbida/cookieconsent/blob/master/docs/advanced/google-consent-mode.md
onFirstConsent: () => {
  gtag('consent', 'update', {
    analytics_storage: CookieConsent.acceptedCategory('analytics') ? 'granted' : 'denied',
  })
},
onConsent: () => {
  // Fires on every page load when consent already exists
  // This is what restores consent after Shopify checkout redirect
  gtag('consent', 'update', {
    analytics_storage: CookieConsent.acceptedCategory('analytics') ? 'granted' : 'denied',
  })
},
```

### Pattern 3: Consent Banner Full Configuration for This Project

**What:** The complete minimal configuration matching all locked decisions.

```typescript
// Source: Context7 /orestbida/cookieconsent + official config reference
CookieConsent.run({
  cookie: {
    name: 'cc_cookie',
    useLocalStorage: true,       // CONS-04: use localStorage not browser cookie
    expiresAfterDays: 365,       // 12-month GDPR recommendation (locked decision)
  },

  guiOptions: {
    consentModal: {
      layout: 'bar inline',      // full-width bottom bar (locked decision)
      position: 'bottom',        // fixed to viewport bottom (locked decision)
      equalWeightButtons: true,  // CONS-02: no visual nudge (locked decision)
      flipButtons: false,
    },
  },

  // No disablePageInteraction: true — site must be usable without consent (CONS-06)
  // autoShow: true (default) — show banner on first visit

  onFirstConsent: () => {
    window.gtag?.('consent', 'update', {
      analytics_storage: CookieConsent.acceptedCategory('analytics') ? 'granted' : 'denied',
    })
  },

  onConsent: () => {
    // Critical: fires on return from Shopify checkout, restores consent (CONS-05)
    window.gtag?.('consent', 'update', {
      analytics_storage: CookieConsent.acceptedCategory('analytics') ? 'granted' : 'denied',
    })
  },

  categories: {
    necessary: {
      enabled: true,
      readOnly: true,
    },
    analytics: {
      autoClear: {
        cookies: [
          { name: /^_ga/ },  // clear GA cookies when user rejects
          { name: '_gid' },
        ],
      },
    },
  },

  language: {
    default: 'nl',
    translations: {
      nl: {
        consentModal: {
          title: '',                // omit title for minimal bar layout
          description: 'We gebruiken cookies om te begrijpen hoe bezoekers onze site gebruiken, zodat we hem steeds beter kunnen maken. Je kunt altijd weigeren zonder dat dit invloed heeft op je bestelling. <a href="/privacybeleid">Privacybeleid</a>',
          acceptAllBtn: 'Accepteer alles',
          acceptNecessaryBtn: 'Weiger alles',
        },
      },
    },
  },
})
```

### Pattern 4: CSS Overrides in globals.css

**What:** vanilla-cookieconsent exposes CSS custom properties (variables) for theming. Override them in `globals.css` to match the site's design tokens. Do NOT modify the library's own CSS file.

**When to use:** Required — default CookieConsent styling does not match the site's design.

**Example:**
```css
/* globals.css — append at bottom */
/* vanilla-cookieconsent theme overrides */
#cc-main {
  --cc-font-family: var(--font-jakarta), system-ui, sans-serif;
  --cc-primary-color: var(--accent);            /* #0a0a0a */
  --cc-btn-primary-bg: var(--accent);
  --cc-btn-primary-color: var(--accent-foreground); /* #ffffff */
  --cc-btn-secondary-bg: transparent;
  --cc-btn-secondary-color: var(--foreground);
  --cc-btn-secondary-border-color: var(--border);
  --cc-bg: #ffffff;
  --cc-border-radius: 0;                        /* bar spans full width, no radius */
}
```

### Anti-Patterns to Avoid

- **Calling `CookieConsent.run()` without `'use client'`:** Next.js App Router server components cannot run browser APIs. The component must be marked `'use client'`.
- **Calling `gtag` before it is defined:** Guard with `window.gtag?.()` — on /bevestiging the gtag scripts load via `afterInteractive` strategy, race conditions are possible on slow connections.
- **Using `disablePageInteraction: true`:** This creates a cookie wall, violating CONS-06.
- **Omitting `onConsent`:** If only `onFirstConsent` is wired, returning visitors (including those back from Shopify checkout) will NOT have `analytics_storage: 'granted'` applied — GA4 stays blocked.
- **Setting `expiresAfterDays: 182` (the default):** The locked decision is 12 months (365 days). The default is 182 days (~6 months). Must set explicitly.
- **Using `useLocalStorage: false` (default):** The locked decision requires localStorage. Must set explicitly to `true`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Consent state persistence with expiry | Custom localStorage with timestamp logic | `cookie.useLocalStorage: true` + `expiresAfterDays: 365` | Library handles serialization, expiry checks, and cookie fallback |
| Banner show/hide logic | Custom `useState` + `useEffect` visibility guard | `CookieConsent.run()` autoShow | Library handles first-visit detection, re-show after expiry |
| GA4 category-level accept detection | Custom state reading from localStorage | `CookieConsent.acceptedCategory('analytics')` API | Library parses its own stored format correctly |
| Cookie auto-clear on reject | Custom cookie deletion code | `autoClear.cookies` config | Library handles regex-based cookie deletion across domains |

**Key insight:** vanilla-cookieconsent's value is that it manages the full lifecycle — persistence, expiry, category state, and autoClear. Hand-rolling any of these creates bugs when the consent state format inevitably changes.

---

## Common Pitfalls

### Pitfall 1: `onConsent` Not Firing on Every Page Load

**What goes wrong:** Developer only wires `onFirstConsent`, assuming returning visitors are handled. But `onFirstConsent` fires ONLY on the first consent action. On subsequent page loads (including the return from Shopify checkout), `onConsent` fires — not `onFirstConsent`. Without `onConsent`, the `gtag('consent', 'update')` call never happens on return visits, so `analytics_storage` stays `'denied'` even though the user previously accepted.

**Why it happens:** The naming is counterintuitive — `onConsent` sounds like it fires when consent changes, but it fires on every load when existing consent is restored.

**How to avoid:** Always wire BOTH `onFirstConsent` AND `onConsent` to the same `updateGtagConsent` function.

**Warning signs:** GA4 DebugView shows events on first visit but not on subsequent visits or on /bevestiging after checkout.

### Pitfall 2: localStorage vs Browser Cookie Confusion

**What goes wrong:** vanilla-cookieconsent defaults to storing consent in a browser **cookie** (`cc_cookie`), not localStorage. If `useLocalStorage: true` is not set, the library writes a cookie. The CONTEXT.md locked decision says "store in localStorage" — this must be explicitly configured.

**Why it happens:** The `useLocalStorage` option defaults to `false`. The property is inside the `cookie` config object, which is counterintuitive ("why is useLocalStorage inside the cookie object?").

**How to avoid:** Always set `cookie.useLocalStorage: true` explicitly. Verify in DevTools: Application > Local Storage > pure-blinds.nl should show `cc_cookie` key with JSON value. Application > Cookies should show NO `cc_cookie` entry.

**Warning signs:** Consent appears to not survive Shopify redirect — actually it does, because cookies also survive cross-domain navigation. But the explicit config is needed to honor the locked decision.

### Pitfall 3: `expiresAfterDays` Default is 182 Days

**What goes wrong:** The locked decision is 12 months. The library default is 182 days (~6 months). Without explicit configuration, consent expires at 6 months, not 12.

**How to avoid:** Set `cookie.expiresAfterDays: 365` explicitly.

### Pitfall 4: CSS Import in `'use client'` Component

**What goes wrong:** `import 'vanilla-cookieconsent/dist/cookieconsent.css'` inside a `'use client'` component is valid in Next.js, but if the component is lazy-loaded or dynamically imported, the CSS may not be in the initial bundle. Since the consent banner must appear immediately on first load, avoid dynamic imports for this component.

**How to avoid:** Import the CSS at the top of the component file statically. Mount `<CookieConsentBanner />` directly in `layout.tsx` without `next/dynamic` lazy loading.

### Pitfall 5: gtag Race Condition on Initial Page Load

**What goes wrong:** `CookieConsent.run()` fires in `useEffect` (after hydration). The gtag scripts use `strategy="afterInteractive"` (also after hydration). Depending on script load order, `window.gtag` may not yet be defined when `onConsent` fires.

**Why it happens:** Both `useEffect` and `afterInteractive` fire after hydration with no guaranteed ordering.

**How to avoid:** Guard every `gtag` call with `window.gtag?.()`. The consent update will be lost in this edge case, but Phase 23's consent defaults (`analytics_storage: 'denied'`) remain in effect — which is the safe fallback.

### Pitfall 6: `bar inline` Layout Stacking on Mobile

**What goes wrong:** The `bar inline` layout stacks the description text and buttons vertically on narrow screens. If the banner content is too long, it can obscure significant page area on mobile.

**How to avoid:** Keep the Dutch description to 2 sentences maximum (already a locked decision). Test on 375px viewport. Add `padding-bottom` CSS override to `body` on mobile to prevent banner overlapping the footer (`@media (max-width: 640px)`).

---

## Code Examples

Verified patterns from official sources:

### Full `CookieConsentBanner` Component

```typescript
// src/components/analytics/cookie-consent-banner.tsx
// Source: Context7 /orestbida/cookieconsent + https://cookieconsent.orestbida.com/essential/getting-started.html
'use client'

import { useEffect } from 'react'
import 'vanilla-cookieconsent/dist/cookieconsent.css'
import * as CookieConsent from 'vanilla-cookieconsent'

function updateGtagConsent() {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('consent', 'update', {
    analytics_storage: CookieConsent.acceptedCategory('analytics') ? 'granted' : 'denied',
  })
}

export function CookieConsentBanner() {
  useEffect(() => {
    CookieConsent.run({
      cookie: {
        name: 'cc_cookie',
        useLocalStorage: true,
        expiresAfterDays: 365,
      },
      guiOptions: {
        consentModal: {
          layout: 'bar inline',
          position: 'bottom',
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
      onFirstConsent: updateGtagConsent,
      onConsent: updateGtagConsent,
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: {
          autoClear: {
            cookies: [{ name: /^_ga/ }, { name: '_gid' }],
          },
        },
      },
      language: {
        default: 'nl',
        translations: {
          nl: {
            consentModal: {
              description:
                'We gebruiken cookies om te begrijpen hoe bezoekers onze site gebruiken, zodat we hem steeds beter kunnen maken. Je kunt altijd weigeren zonder dat dit invloed heeft op je bestelling. <a href="/privacybeleid" class="cc__link">Privacybeleid</a>',
              acceptAllBtn: 'Accepteer alles',
              acceptNecessaryBtn: 'Weiger alles',
            },
          },
        },
      },
    })
  }, [])

  return null
}
```

### Mounting in Root Layout

```typescript
// src/app/layout.tsx — add after <PurchaseTracker />
import { CookieConsentBanner } from '@/components/analytics/cookie-consent-banner'

// Inside <body>:
<CookieConsentBanner />
```

### Tailwind v4 CSS Overrides

```css
/* src/app/globals.css — append at bottom */
/* vanilla-cookieconsent bar theme — aligned to site design tokens */
#cc-main {
  --cc-font-family: var(--font-jakarta), system-ui, sans-serif;
  --cc-primary-color: var(--foreground);
  --cc-btn-primary-bg: var(--accent);
  --cc-btn-primary-color: var(--accent-foreground);
  --cc-btn-secondary-bg: transparent;
  --cc-btn-secondary-color: var(--foreground);
  --cc-btn-secondary-border-color: var(--border);
  --cc-bg: #ffffff;
  --cc-text: var(--foreground);
  --cc-link-color: var(--foreground);
  --cc-border-radius: 0rem;
  --cc-bar-border-radius: 0rem;
}
```

### /privacybeleid Page Structure

```typescript
// src/app/privacybeleid/page.tsx
// Server component (no 'use client') — static page, Metadata export
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacybeleid | Pure Blinds',
  description: '...',
}

export default function PrivacybeleidPage() {
  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        {/* Standard Dutch privacy policy sections:
            1. Wie zijn wij
            2. Welke gegevens verzamelen we
            3. Waarom gebruiken we cookies (GA4 analytics_storage)
            4. Hoe lang bewaren we gegevens
            5. Uw rechten (inzage, verwijdering)
            6. Contact
        */}
      </div>
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Consent Mode v1 (binary accept/deny) | Consent Mode v2 (4 parameters: analytics_storage, ad_storage, ad_user_data, ad_personalization) | Google, March 2024 | Phase 23 already implements v2 defaults; this phase only updates `analytics_storage` |
| `react-cookie-consent` | vanilla-cookieconsent v3 | — | react-cookie-consent lacks Consent Mode v2 support (explicitly excluded in REQUIREMENTS.md) |
| Cookie-based storage (default) | `useLocalStorage: true` | vanilla-cookieconsent v3 | Enables localStorage persistence per locked decision |

**Deprecated/outdated:**
- `react-cookie-consent`: Explicitly excluded in REQUIREMENTS.md — no Consent Mode v2 support
- Per-category toggles (preferences modal): Explicitly excluded in CONTEXT.md — simple accept/reject only

---

## Open Questions

1. **`updateGtagConsent` guard when gtag not yet loaded**
   - What we know: `onConsent` fires in `useEffect` after React hydration. gtag scripts use `strategy="afterInteractive"` which also fires after hydration. Ordering is not guaranteed.
   - What's unclear: In practice, does the race condition actually manifest (causing gtag calls to be silently dropped) or does Next.js `afterInteractive` reliably complete before `useEffect`?
   - Recommendation: The `window.gtag?.()` guard handles this safely. Dropped calls are acceptable (consent defaults remain `'denied'`). Validate in DebugView on first production test.

2. **vanilla-cookieconsent bar layout `title` field behavior**
   - What we know: The `bar inline` layout may render the `title` field differently from the `box` layout. The locked decision has no mention of a banner title.
   - What's unclear: Whether omitting `title` from the `nl` translation leaves an empty element in the DOM or is cleanly absent.
   - Recommendation: Test in browser. If empty `<h2>` renders, set `title: ''` (empty string) in the translation.

3. **GA4 measurement ID guard on /privacybeleid page**
   - What we know: `GA_MEASUREMENT_ID` gates the Script tags in layout.tsx. On dev/preview deployments without the env var, no gtag is loaded.
   - What's unclear: Should `CookieConsentBanner` also gate on `GA_MEASUREMENT_ID`? Without gtag, `updateGtagConsent` degrades gracefully via the `window.gtag?.()` guard — the banner still shows but has no GA4 side effects.
   - Recommendation: Do NOT gate `CookieConsentBanner` on `GA_MEASUREMENT_ID`. The banner must always show in production (CONS-01) and degrades gracefully in dev/preview.

---

## Sources

### Primary (HIGH confidence)
- Context7 `/orestbida/cookieconsent` — configuration reference, Google Consent Mode integration, React useEffect pattern, localStorage storage, bar layout options, `equalWeightButtons`, `onFirstConsent`/`onConsent` lifecycle, `acceptedCategory()` API
- `https://cookieconsent.orestbida.com/reference/configuration-reference.html` — cookie object options, `useLocalStorage`, default `expiresAfterDays: 182`, available layouts (`bar`, `box`, `cloud`), position options
- `https://cookieconsent.orestbida.com/essential/getting-started.html` — NPM package name `vanilla-cookieconsent@3.1.0`, CSS import path `vanilla-cookieconsent/dist/cookieconsent.css`
- `npm show vanilla-cookieconsent version` → `3.1.0` (confirmed latest published version)

### Secondary (MEDIUM confidence)
- WebSearch: vanilla-cookieconsent v3 localStorage key is `cc_cookie` when `useLocalStorage: true` — consistent with official config reference `cookie.name` default
- WebSearch: Next.js App Router requires `'use client'` + `useEffect` for DOM libraries — standard Next.js pattern, verified against React integration docs from Context7

### Tertiary (LOW confidence)
- CSS variable names (`--cc-font-family`, `--cc-btn-primary-bg`, etc.) — sourced from official docs and Context7 but CSS variable naming was inferred from pattern, not exhaustively verified against the 3.1.0 source. Planner should verify via browser DevTools > Computed styles when implementing.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — vanilla-cookieconsent 3.1.0 explicitly decided in STATE.md, version confirmed via npm
- Architecture: HIGH — `useEffect` + `'use client'` is verified Next.js App Router pattern; `onFirstConsent`/`onConsent` hooks verified via Context7 official docs
- Pitfalls: HIGH for `onConsent`/`onFirstConsent` distinction (verified in docs), MEDIUM for CSS variable names (pattern-inferred), MEDIUM for gtag race condition (theoretical, not empirically tested)

**Research date:** 2026-02-26
**Valid until:** 2026-05-26 (90 days — vanilla-cookieconsent is stable, GA4 Consent Mode v2 is stable)
