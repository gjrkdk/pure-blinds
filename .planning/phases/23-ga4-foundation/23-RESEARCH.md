# Phase 23: GA4 Foundation - Research

**Researched:** 2026-02-22
**Domain:** Google Analytics 4, Consent Mode v2, Next.js App Router, Cross-Domain Tracking
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- No existing GA4 property — needs to be created before deployment
- GA4 measurement ID stored as `NEXT_PUBLIC_GA4_ID` environment variable
- Direct gtag.js loading — no Google Tag Manager (GTM explicitly out of scope)
- No existing analytics code in the codebase — clean slate
- Design the analytics module for extension from the start so Phase 24 (e-commerce events) and Phase 25 (consent) can hook into it without refactoring
- GA4 fires in production only (pure-blinds.nl) — no analytics in development or preview deployments
- In development: console logging of what WOULD be sent to GA4 (event name, parameters) for verification
- In production: GA4 DebugView available via `?debug_mode=true` URL parameter for live testing
- Track all App Router route changes as page_view events — no exclusions
- Path changes only — query parameter changes do NOT fire page_view
- URL path only sent with page_view (no page title)
- Headless Shopify store: pure-blinds.nl (Next.js) redirects to Shopify checkout domain for payment
- Shopify checkout domain stored as `NEXT_PUBLIC_SHOPIFY_DOMAIN` environment variable
- Development Shopify domain: `pure-blinds-development.myshopify.com` (production domain TBD)
- Cross-domain linker configuration needed between pure-blinds.nl and Shopify checkout domain

### Claude's Discretion

- Post-checkout confirmation page implementation (redirect to /bevestiging vs Shopify thank-you)
- Analytics module architecture and file structure
- gtag.js loading technique (Next.js Script component, head injection, etc.)
- Console logging format in development
- Consent Mode v2 initialization ordering details

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GA4-01 | GA4 loads unconditionally with Consent Mode v2 defaults (all 4 parameters denied before gtag.js fires) | Covered: consent initialization order, inline Script + afterInteractive gtag.js, cookie-blocking behavior verified |
| GA4-02 | Cross-domain tracking configured between pure-blinds.nl and Shopify checkout domain | Covered: gtag linker config, GA4 Admin domain list, _gl parameter mechanism, Shopify-specific caveats |
| GA4-03 | SPA page views tracked automatically on App Router route changes | Covered: two implementation patterns (usePathname+useEffect vs instrumentation-client.js), path-only filtering |
</phase_requirements>

---

## Summary

This phase establishes the GA4 analytics foundation for pure-blinds.nl using direct gtag.js integration (no GTM). The three core problems to solve are: (1) loading GA4 with all four Consent Mode v2 parameters defaulted to "denied" before any cookies can be written, (2) tracking SPA route changes as page_view events on pathname changes only, and (3) enabling cross-domain session continuity between pure-blinds.nl and the Shopify checkout domain via the GA4 linker mechanism.

The critical ordering constraint for Consent Mode v2 is that `gtag('consent', 'default', {...})` must execute BEFORE the external gtag.js script file loads. This requires two separate `<Script>` components in the Next.js root layout: an inline script with `strategy="afterInteractive"` (runs first, sets consent defaults) followed by the external gtag.js URL also with `strategy="afterInteractive"`. The `@next/third-parties/google` `GoogleAnalytics` component does NOT support this ordering and must not be used.

For SPA route tracking, `usePathname` from `next/navigation` is the correct dependency: it only updates when the URL path changes, not when query parameters change. This naturally satisfies the requirement to fire page_view on path changes only. `instrumentation-client.js` with `onRouterTransitionStart` is an alternative available since Next.js 15.3, but it fires at navigation START (before the page renders), and its URL parameter includes the full URL — requiring manual pathname extraction and deduplication to avoid false fires on query-only changes.

**Primary recommendation:** Use `usePathname` + `useEffect` in a `'use client'` analytics provider component added to the root layout. This is simple, battle-tested, and naturally filters query-param-only changes. Build the analytics module as `src/lib/analytics/` with a thin API that Phase 24 and 25 can import without restructuring.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gtag.js | Latest (CDN) | GA4 event sending, Consent Mode v2, linker | Official Google library; only way to get all 4 Consent Mode v2 params + cross-domain linker without GTM |
| next/script | Built into Next.js 16.1.6 | Controlled script loading order | Required to sequence inline consent defaults BEFORE external gtag.js load |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/navigation `usePathname` | Built-in | Detect App Router pathname changes | Route tracking component — returns pathname WITHOUT query params |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `next/script` inline + external | `@next/third-parties/google` `GoogleAnalytics` | GoogleAnalytics component doesn't support Consent Mode v2 initialization ordering (confirmed by Next.js discussion #66718 and project STATE.md) — do NOT use |
| `usePathname` + `useEffect` | `instrumentation-client.js` `onRouterTransitionStart` | instrumentation-client fires at nav START, full URL includes query params requiring manual extraction; more complex to filter path-only changes. Valid but unnecessary complexity. |
| gtag `linker.domains` in code | GA4 Admin UI domain config | Both are required — GA4 Admin "Configure your domains" is the canonical config; the gtag.js linker in code handles automatic `_gl` URL decoration |

**Installation:**
```bash
# No npm packages required — gtag.js loaded via CDN through next/script
# All tooling is built into Next.js 16.1.6
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   └── analytics/
│       ├── index.ts          # Public API: trackEvent(), trackPageView() — used by Phase 24 e-commerce events
│       └── gtag.ts           # Internal: gtag wrapper, env guard, dev logging
├── components/
│   └── analytics/
│       └── analytics-provider.tsx  # 'use client' — mounts in root layout, tracks pathname changes
├── instrumentation-client.ts  # Optional: onRouterTransitionStart alternative (not recommended — use provider instead)
└── app/
    └── layout.tsx            # Add <Script> tags for consent init + gtag.js; add <AnalyticsProvider />
```

### Pattern 1: Consent Mode v2 Initialization Order (CRITICAL)

**What:** Two `<Script>` components in root layout — inline consent defaults FIRST, then external gtag.js URL.
**When to use:** Always — this ordering is mandatory for Consent Mode v2 to prevent `_ga` cookies before consent.

```typescript
// Source: https://developers.google.com/tag-platform/security/guides/consent
// Placed in: src/app/layout.tsx

import Script from 'next/script'

export default function RootLayout({ children }) {
  const measurementId = process.env.NEXT_PUBLIC_GA4_ID

  return (
    <html lang="nl-NL">
      <body>
        {children}
        {/* Script 1: Inline — initialize dataLayer + set consent defaults BEFORE gtag.js loads */}
        <Script
          id="gtag-consent-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied'
              });
            `,
          }}
        />
        {/* Script 2: External gtag.js — loads AFTER consent defaults are set */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
          strategy="afterInteractive"
        />
        {/* Script 3: Inline — gtag config and cross-domain linker */}
        <Script
          id="gtag-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              gtag('js', new Date());
              gtag('config', '${measurementId}');
              gtag('set', 'linker', {
                'domains': ['${process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN}']
              });
            `,
          }}
        />
      </body>
    </html>
  )
}
```

**Key insight:** `strategy="afterInteractive"` scripts execute in DOM order client-side. The inline consent-init script executes before the external gtag.js download completes because the browser processes them in sequence.

### Pattern 2: Production Guard

**What:** Wrap all gtag calls in an environment check so analytics only fires in production.
**When to use:** Every gtag interaction — this is a locked decision.

```typescript
// Source: Verified pattern from project decisions
// src/lib/analytics/gtag.ts

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

export const isProduction = process.env.NODE_ENV === 'production'

export function sendGtagEvent(eventName: string, params?: Record<string, unknown>) {
  if (!isProduction) {
    console.log('[Analytics]', eventName, params ?? {})
    return
  }
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
  }
}
```

**Note:** The `<Script>` tags themselves in layout.tsx should also be conditionally rendered — only include them when `process.env.NODE_ENV === 'production'`.

### Pattern 3: SPA Route Tracking via usePathname

**What:** Client component that fires page_view on pathname changes (not query param changes).
**When to use:** Mount once in root layout above all pages.

```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/use-pathname
// src/components/analytics/analytics-provider.tsx

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

export function AnalyticsProvider() {
  const pathname = usePathname()

  useEffect(() => {
    // usePathname only changes on actual path changes — query param changes do NOT trigger this
    // This naturally satisfies: "Path changes only — query parameter changes do NOT fire page_view"
    trackPageView(pathname)
  }, [pathname])

  return null
}
```

**Key insight from official docs:** `usePathname` returns `/dashboard` for both `/dashboard` and `/dashboard?v=2` — query params are stripped. The `useEffect([pathname])` dependency naturally implements path-only filtering without any custom logic.

### Pattern 4: Cross-Domain Linker

**What:** Two-part setup — gtag.js linker config (code) + GA4 Admin domain list (UI).
**When to use:** Required for session continuity through Shopify checkout.

**Code side (src/app/layout.tsx):**
```javascript
// Source: https://developers.google.com/tag-platform/devguides/cross-domain
gtag('set', 'linker', {
  'domains': ['pure-blinds-development.myshopify.com'] // use NEXT_PUBLIC_SHOPIFY_DOMAIN env var
});
```

**GA4 Admin UI side (manual step):**
1. GA4 Admin > Data Streams > [Web stream] > Configure tag settings > Configure your domains
2. Add: `pure-blinds.nl` AND the Shopify domain (e.g., `pure-blinds.myshopify.com`)

**How it works:** gtag.js appends `_gl=...` parameter to all links pointing to listed domains. The destination domain reads `_gl` and uses the encoded client ID to maintain session. The linker parameter expires after 2 minutes — it's appended at click time.

### Pattern 5: Analytics Module Public API

**What:** Thin wrapper that Phase 24 (e-commerce events) and Phase 25 (consent updates) can import.
**When to use:** All analytics calls go through this — never call `window.gtag` directly from feature code.

```typescript
// Source: Architecture decision — designed for extension
// src/lib/analytics/index.ts

import { sendGtagEvent, isProduction } from './gtag'

export function trackPageView(pathname: string) {
  // Only send path, not page title (locked decision)
  sendGtagEvent('page_view', { page_location: pathname })
}

// Phase 24 will add: trackViewItem(), trackAddToCart(), trackBeginCheckout(), trackPurchase()
// Phase 25 will add: updateConsent()
export function updateConsent(granted: boolean) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      'ad_storage': granted ? 'granted' : 'denied',
      'ad_user_data': granted ? 'granted' : 'denied',
      'ad_personalization': granted ? 'granted' : 'denied',
      'analytics_storage': granted ? 'granted' : 'denied',
    })
  }
}
```

### Anti-Patterns to Avoid

- **Using `@next/third-parties/google` `GoogleAnalytics`:** Does not support Consent Mode v2 ordering — consent defaults cannot be set before the library loads. Confirmed not supported as of v16.1.6.
- **Calling `gtag('consent', 'default')` after gtag.js loads:** The consent defaults will be ignored. The inline script MUST execute before the external script loads.
- **Using `strategy="beforeInteractive"` for the consent script:** Only works in Pages Router; not supported in App Router layouts for inline scripts.
- **Setting `debug_mode: false` to disable DebugView:** Setting any value for `debug_mode` enables it. To disable, omit the parameter entirely.
- **Tracking query-param-only changes as page views:** Using `usePathname` naturally avoids this; if using `onRouterTransitionStart` instead, you must manually parse and compare pathnames.
- **Calling `window.gtag` directly from feature components:** All calls must go through `src/lib/analytics/index.ts` so Phase 24/25 can extend cleanly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie-blocking before consent | Custom cookie intercept logic | `gtag('consent', 'default', {analytics_storage: 'denied'})` | GA4 natively blocks `_ga` writes when analytics_storage is denied; custom intercept is fragile |
| Cross-domain client ID sharing | Manual `_ga` cookie append to checkout URLs | `gtag('set', 'linker', {domains: [...]})` | Linker encodes multiple cookies, handles HTTPS requirements, has 2-minute expiry logic |
| Route change detection | `window.history` patching | `usePathname` from `next/navigation` | History patching breaks with concurrent React, RSC — Next.js hooks are the correct abstraction |

**Key insight:** GA4 Consent Mode v2 handles cookie blocking natively when correctly initialized. Do not attempt to block cookies yourself.

---

## Common Pitfalls

### Pitfall 1: Consent Defaults Set AFTER gtag.js Loads

**What goes wrong:** `_ga` cookie is written immediately on page load before user grants consent. Consent Mode defaults are silently ignored.
**Why it happens:** Developer places consent defaults in the same script block as `gtag('js', new Date())`, or places the consent init script AFTER the external gtag.js `<Script>` tag.
**How to avoid:** Use three separate `<Script>` components in this exact order: (1) inline consent init, (2) external gtag.js src, (3) inline gtag config. Do not combine them.
**Warning signs:** Open DevTools > Application > Cookies — if `_ga` cookie appears before interacting with any consent UI, ordering is broken.

### Pitfall 2: `process.env.NODE_ENV` Is Not Enough for Environment Guard

**What goes wrong:** Analytics fires on Vercel preview deployments (which use `NODE_ENV=production`).
**Why it happens:** Vercel sets `NODE_ENV=production` on all non-dev deployments, including preview branches.
**How to avoid:** Guard on `process.env.NEXT_PUBLIC_BASE_URL === 'https://pure-blinds.nl'` OR only include the `<Script>` tags when `NEXT_PUBLIC_GA4_ID` is defined (it won't be set on preview deployments if not configured). The locked decision says "no analytics in preview deployments" — use `NEXT_PUBLIC_GA4_ID` presence as the guard: only render Script tags if the env var exists.
**Warning signs:** GA4 DebugView shows events from non-production URLs.

### Pitfall 3: Cross-Domain Linker Missing from GA4 Admin UI

**What goes wrong:** gtag.js code is configured but `_gl` parameter is NOT appended to checkout links. Sessions break at Shopify redirect.
**Why it happens:** The GA4 Admin "Configure your domains" setting is required IN ADDITION to the gtag.js `linker.domains` code config. One alone is not enough.
**How to avoid:** Configure BOTH: (1) `gtag('set', 'linker', {domains: [shopifyDomain]})` in code AND (2) GA4 Admin > Data Streams > Configure tag settings > Configure your domains with all domains listed.
**Warning signs:** Clicking checkout button — inspect the resulting URL. If no `?_gl=` parameter appears, linker isn't working.

### Pitfall 4: Shopify Redirect Strips `_gl` Parameter

**What goes wrong:** `_gl` is present in the initial checkout URL but disappears after Shopify's internal redirect to `/checkouts/do/.../nl/thank-you`.
**Why it happens:** Shopify's checkout flow has internal redirects that may strip query parameters including `_gl`. This is a known issue with headless Shopify and is confirmed by community reports.
**How to avoid:** This is partially outside our control for Phase 23. The user-visible checkout flow (pure-blinds.nl → Shopify checkout domain) should carry `_gl` on the initial redirect. Session continuity from Shopify back to `/bevestiging` relies on the redirect URL from Shopify including the `_gl` parameter. The `/bevestiging` page exists on pure-blinds.nl, which has gtag configured — so if `_gl` arrives in the URL, it will be read.
**Warning signs:** Test checkout flow → inspect network tab for `_gl` in URL when landing on `/bevestiging`.

### Pitfall 5: usePathname Fires on Initial Mount

**What goes wrong:** A page_view event fires on initial load AND again when navigating — causing double-counting for the first page.
**Why it happens:** `useEffect([pathname])` runs on initial mount in addition to pathname changes.
**How to avoid:** This is actually CORRECT behavior — the initial mount fire IS the first page_view. GA4 expects a page_view on initial load. Do not add a "skip first render" guard.
**Warning signs:** If you do add a skip-first guard, you'll miss the landing page view entirely.

---

## Code Examples

Verified patterns from official sources:

### Full Consent Mode v2 Initialization (Three-Script Pattern)

```typescript
// Source: https://developers.google.com/tag-platform/security/guides/consent
// Context7: /websites/developers_google_tag-platform — consent initialization

// In src/app/layout.tsx (production only, when NEXT_PUBLIC_GA4_ID is set)
const measurementId = process.env.NEXT_PUBLIC_GA4_ID
const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN

{measurementId && (
  <>
    {/* 1. Consent defaults — must run BEFORE gtag.js loads */}
    <Script
      id="gtag-consent-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied'
          });
        `,
      }}
    />
    {/* 2. External gtag.js */}
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
    />
    {/* 3. gtag config + cross-domain linker */}
    <Script
      id="gtag-config"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          gtag('js', new Date());
          gtag('config', '${measurementId}');
          gtag('set', 'linker', { 'domains': ['${shopifyDomain}'] });
        `,
      }}
    />
  </>
)}
```

### Cross-Domain Linker Configuration

```javascript
// Source: https://developers.google.com/tag-platform/devguides/cross-domain
// Context7: /websites/developers_google_tag-platform — cross-domain measurement

// Source domain (pure-blinds.nl) — appends _gl to links pointing to Shopify domain
gtag('set', 'linker', {
  'domains': ['pure-blinds.myshopify.com']
});

// This causes gtag.js to automatically append ?_gl=... to all <a href> links
// pointing to the listed domains — preserving client ID across domains
```

### GA4 Debug Mode via URL Parameter

```javascript
// Source: https://support.google.com/analytics/answer/7201382
// Enable DebugView by appending ?debug_mode=true to any page URL
// OR configure in gtag:
gtag('config', 'G-XXXXXXXXXX', { 'debug_mode': true });

// To disable: omit the parameter entirely
// Setting debug_mode: false does NOT disable it — any value enables it
```

### Dev Environment Console Logging

```typescript
// src/lib/analytics/gtag.ts
export function sendGtagEvent(eventName: string, params?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'production' || !process.env.NEXT_PUBLIC_GA4_ID) {
    console.log('[Analytics]', eventName, params ?? {})
    return
  }
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| UA (Universal Analytics) `ga.js` | GA4 `gtag.js` | Sunseted July 2023 | Different event model; page_view is now an event not a hit type |
| Consent Mode v1 (2 params) | Consent Mode v2 (4 params: add `ad_user_data`, `ad_personalization`) | Early 2024 enforcement | Must set all 4 params to "denied" for EU compliance |
| `router.events` (Pages Router) | `usePathname` + `useEffect` or `instrumentation-client.js` (App Router) | Next.js 13+ | Pages Router events not available in App Router |
| `instrumentation-client.js` not available | Available since Next.js 15.3 | v15.3 (Jan 2025) | New clean alternative to client component for route tracking |
| `@next/third-parties/google` `GoogleAnalytics` | Direct `next/script` — required for Consent Mode v2 | N/A (ongoing limitation) | GoogleAnalytics component lacks consent ordering control |

**Deprecated/outdated:**
- `ga('send', 'pageview')`: UA-era syntax — irrelevant, GA4 uses `gtag('event', 'page_view')`
- `router.events.on('routeChangeComplete')`: Pages Router only, not available in App Router

---

## Open Questions

1. **Does `onRouterTransitionStart` fire on query-param-only changes?**
   - What we know: The function receives the full URL as a string. `usePathname` definitively does NOT change on query-param-only changes (confirmed by official docs table: `/dashboard?v=2` returns `/dashboard`).
   - What's unclear: Whether `onRouterTransitionStart` fires when only query params change (no clear docs on this edge case). MEDIUM confidence this does fire because it's a router navigation event, not pathname-specific.
   - Recommendation: Use `usePathname` + `useEffect` pattern instead — it inherently solves the query-param filtering requirement without needing to parse URLs.

2. **Does Shopify preserve `_gl` through internal checkout redirects?**
   - What we know: Community reports confirm that Shopify's internal checkout redirects (`/checkouts/do/.../nl/thank-you`) strip query parameters. The user observed the `/nl/thank-you` URL in their own test checkout.
   - What's unclear: Whether the `_gl` parameter survives from pure-blinds.nl through to the Shopify checkout landing page. The redirect from pure-blinds.nl to Shopify invoiceUrl SHOULD carry `_gl` appended by the linker.
   - Recommendation: After implementation, perform a manual test checkout and inspect Network tab for `_gl` in the URL when arriving at `/bevestiging`. Document result for Phase 24 planning.

3. **Production Shopify domain for NEXT_PUBLIC_SHOPIFY_DOMAIN**
   - What we know: Dev domain is `pure-blinds-development.myshopify.com`. Production domain is TBD.
   - What's unclear: The production Shopify domain for cross-domain linker config.
   - Recommendation: Use `NEXT_PUBLIC_SHOPIFY_DOMAIN` env var so dev and prod can have different values. For now, implement with the dev domain. Update env var for production when domain is known.

---

## Sources

### Primary (HIGH confidence)

- Context7 `/vercel/next.js/v16.1.6` — Script component strategies, usePathname behavior, instrumentation-client.js API
- Context7 `/websites/developers_google_tag-platform` — Consent Mode v2 initialization, cross-domain linker configuration
- https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client — onRouterTransitionStart API (v16.1.6, updated 2026-02-20)
- https://nextjs.org/docs/app/api-reference/functions/use-pathname — usePathname behavior with query params (official docs table confirms /dashboard?v=2 → '/dashboard')
- https://developers.google.com/tag-platform/security/guides/consent — Consent Mode v2 initialization order ("the order of the code here is vital")
- https://developers.google.com/tag-platform/devguides/cross-domain — Cross-domain linker _gl mechanism, accept_incoming, decorate_forms

### Secondary (MEDIUM confidence)

- https://gaudion.dev/blog/setup-google-analytics-with-gdpr-compliant-cookie-consent-in-nextjs13 — Implementation pattern for inline Script consent + external gtag.js, verified against official docs
- https://www.analyticsmania.com/post/cross-domain-tracking-in-google-analytics-4/ — Confirmed both GA4 Admin UI config AND code linker are required; native solution works for `<a>` tag clicks only
- https://www.simoahava.com/analytics/consent-mode-v2-google-tags/ — Advanced vs Basic mode distinction, browser storage avoidance mechanism
- https://support.google.com/analytics/answer/7201382 — GA4 DebugView enable via `?debug_mode=true` or gtag config param

### Tertiary (LOW confidence — flagged for validation)

- Shopify community reports about `_gl` parameter being stripped during checkout redirects (multiple threads confirm this as a known issue, but no official Shopify documentation found)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Next.js Script component API and gtag.js Consent Mode v2 both verified with Context7 and official docs
- Architecture: HIGH — usePathname behavior confirmed by official docs (query params stripped); Script ordering confirmed by Google official consent docs
- Pitfalls: HIGH for consent ordering and cross-domain dual config requirement; MEDIUM for Shopify `_gl` stripping (community evidence only)

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (stable APIs — GA4, Next.js Script, gtag consent are not fast-moving)
