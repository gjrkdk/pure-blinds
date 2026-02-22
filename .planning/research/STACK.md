# Stack Research

**Domain:** GA4 E-commerce Analytics + GDPR Cookie Consent (Next.js 15 App Router)
**Milestone:** v1.5 Analytics & Privacy
**Researched:** 2026-02-22
**Confidence:** HIGH

---

## Executive Summary

Two new libraries are required for this milestone. Everything else is built on existing stack primitives.

**Add:**
- `@next/third-parties@16.1.6` — official Next.js GA4 integration (GoogleAnalytics component + sendGAEvent)
- `vanilla-cookieconsent@3.1.0` — GDPR consent banner with Google Consent Mode v2 support

**Do not add:**
- GTM (Google Tag Manager) — unnecessary indirection for a developer-controlled codebase
- `react-cookie-consent` or other consent wrappers — vanilla-cookieconsent has zero runtime dependencies and full Consent Mode v2 support
- Any server-side analytics library — GA4 client-side tracking is sufficient for this webshop

All GA4 event firing and consent gate logic is implemented in custom client components using these two libraries. No additional dependencies needed.

---

## Recommended Stack Additions

### Core Libraries

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@next/third-parties` | 16.1.6 | GA4 script loading + event dispatch | Official Vercel/Next.js library. Loads gtag.js after hydration (not blocking), provides `GoogleAnalytics` component and `sendGAEvent` function. Version matches installed Next.js. No wrapper overhead. HIGH confidence — official docs verified. |
| `vanilla-cookieconsent` | 3.1.0 | GDPR consent banner + consent state persistence | Zero runtime dependencies (MIT, 152 kB unpacked). Supports all 7 Google Consent Mode v2 signals. Persists consent in a cookie. Works as a plain `useEffect`-initialized client component in App Router. No React-specific wrapper needed. HIGH confidence — npm verified, official docs verified. |

### No Additional Libraries Needed

The following capabilities are covered by existing dependencies or platform primitives:

| Capability | How Covered |
|------------|-------------|
| Purchase event data after Shopify redirect | `sessionStorage` (browser API) — store cart snapshot before `clearCart()`, read on `/bevestiging` |
| Consent state reading in components | `vanilla-cookieconsent` JS API (`CookieConsent.acceptedService()`) |
| Conditional GA script loading | `@next/third-parties` `GoogleAnalytics` component rendered only after consent granted |
| Event typing | Inline TypeScript — no separate analytics type package needed |
| Zustand cart state | Already installed at v5.0.10 |

---

## Installation

```bash
# Analytics + consent (both runtime dependencies)
npm install @next/third-parties@latest vanilla-cookieconsent@latest
```

Both are runtime (not dev) because they run in the browser.

---

## Integration Architecture

### Consent-Gated GA4 Loading Pattern

The `GoogleAnalytics` component from `@next/third-parties` must only render after the user grants analytics consent. The consent state lives in a cookie managed by `vanilla-cookieconsent`.

```
Root Layout (Server Component)
└── ConsentProvider (Client Component, 'use client')
    ├── CookieBanner (initializes vanilla-cookieconsent in useEffect)
    └── {consent === 'granted'} ? <GoogleAnalytics gaId="G-XXXX" /> : null
```

The `ConsentProvider` reads the cookie on mount and subscribes to consent change events from `vanilla-cookieconsent`. When consent is granted, it renders `<GoogleAnalytics>`. This satisfies Consent Mode v2: GA script never loads without explicit consent.

### Consent Mode v2 Default State

Before `<GoogleAnalytics>` loads, push default denied state to `window.dataLayer`:

```typescript
// Must fire before GA script, in a <Script strategy="beforeInteractive"> or inline
window.dataLayer = window.dataLayer || [];
function gtag(...args: unknown[]) { window.dataLayer.push(args); }
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
});
```

This ensures GA loads in modeling mode rather than full tracking if the banner hasn't been answered yet.

### Purchase Event Pattern (Shopify Redirect Problem)

The cart is cleared at checkout initiation (CHKOUT-02 decision). When Shopify redirects back to `/bevestiging`, cart state is already empty. Solution: save a purchase snapshot to `sessionStorage` before clearing cart.

```
Checkout flow:
1. User clicks "Afrekenen" in CartSummary
2. Before clearCart() → write snapshot to sessionStorage('purchase-pending')
3. Cart clears, user redirects to Shopify invoice_url
4. Shopify redirects back to /bevestiging
5. Client component on /bevestiging reads sessionStorage
6. Fires GA4 `purchase` event with snapshot data
7. Clears sessionStorage
```

`sessionStorage` survives cross-tab navigation within the same browser session but not across browser restarts, which is adequate for same-session checkout flows.

### E-commerce Event Placement

| Event | Where | Trigger |
|-------|-------|---------|
| `view_item` | Product detail page (client component) | On mount |
| `add_to_cart` | `useCartStore.addItem` call site | After successful add |
| `begin_checkout` | CartSummary checkout button | On click, before redirect |
| `purchase` | `/bevestiging` page (client component) | On mount, reads sessionStorage |

All events use `sendGAEvent` from `@next/third-parties/google`. Guard each call with a consent check to avoid double-firing if consent state changes.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `@next/third-parties` GoogleAnalytics | Manual `next/script` + gtag.js | When you need fine-grained script URL control or custom dataLayer name. Not needed here. |
| `@next/third-parties` GoogleAnalytics | `GoogleTagManager` from same package | Use GTM when a marketing team (not developer) manages tags. For developer-controlled events, direct GA4 is simpler and eliminates GTM latency. |
| `vanilla-cookieconsent` | `react-cookie-consent` (npm) | Only if you need a React component API with controlled re-renders. vanilla-cookieconsent's useEffect pattern works identically in App Router. |
| `vanilla-cookieconsent` | Custom consent banner (no library) | Acceptable for MVP, but you lose: built-in cookie persistence, Consent Mode v2 signal mapping, i18n support, WCAG compliance defaults. |
| `sessionStorage` for purchase data | URL query params from Shopify | Shopify does not reliably pass order data in redirect URL query params for Draft Order invoice_url flows. sessionStorage is the only reliable cross-checkout-boundary option on Basic plan. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Google Tag Manager** (`GoogleTagManager` component) | Adds 200ms+ median blocking time, requires GTM container management, and creates a second layer of abstraction for events already controlled in code. Overkill for developer-managed tracking. | `GoogleAnalytics` component with `sendGAEvent` directly |
| **`react-cookie-consent`** | 3.5 kB gzipped React wrapper that does not support Google Consent Mode v2 natively. Requires manual signal mapping. | `vanilla-cookieconsent` (zero dependencies, Consent Mode v2 built-in) |
| **`@analytics` (DavidWells)** | Plugin system adds abstraction over GA4 that conflicts with Next.js App Router SSR model. Consent Mode v2 integration is a known open issue (GitHub #427). | `@next/third-parties` + `sendGAEvent` directly |
| **Storing purchase data in localStorage** | localStorage persists across sessions. A returning user could trigger a duplicate purchase event on their next visit if the key was not cleared. | `sessionStorage` — cleared automatically when tab closes |
| **Server-side GA4 Measurement Protocol** | Valid for server-side event deduplication, but adds complexity (client_id management, session_id propagation) not needed at this scale. Defer to v2.x if accuracy becomes a business requirement. | Client-side `sendGAEvent` |

---

## Stack Patterns by Variant

**If user has previously accepted consent (returning visitor):**
- `vanilla-cookieconsent` reads its own cookie on init and fires `onConsent` callback immediately
- `ConsentProvider` grants analytics on first render, `<GoogleAnalytics>` mounts before user interaction
- All page-load events (view_item) fire correctly

**If user has not yet seen banner (first visit):**
- GA4 script does not load
- Consent Mode v2 default `denied` state is set via inline script
- Events are buffered/dropped until consent is granted
- Banner appears, user accepts → consent update fires → `<GoogleAnalytics>` mounts

**If user declines consent:**
- GA4 script never loads
- No tracking occurs
- Consent state persisted in cookie for 182 days (vanilla-cookieconsent default)

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| `@next/third-parties` | 16.1.6 | Next.js 16.1.6, React 19.2.3 | Version is kept in sync with Next.js. Always install with `@latest` alongside Next.js upgrades. |
| `vanilla-cookieconsent` | 3.1.0 | All browsers (no React dependency) | Latest stable published ~1 year ago. Zero dependencies. `next` tag on npm points to 3.0.0-rc.17 (do not use). |
| `sendGAEvent` | part of @next/third-parties | Requires `<GoogleAnalytics>` in parent tree | Function uses `window.dataLayer`. Will silently no-op if GA component not mounted (safe to call regardless). |

---

## GA4 E-commerce Event Schema

Required parameters per event (HIGH confidence — Google developer docs verified):

```typescript
// view_item
sendGAEvent('event', 'view_item', {
  currency: 'EUR',
  value: priceInEuros,
  items: [{ item_id, item_name, price, quantity }],
});

// add_to_cart
sendGAEvent('event', 'add_to_cart', {
  currency: 'EUR',
  value: priceInEuros,
  items: [{ item_id, item_name, price, quantity }],
});

// begin_checkout
sendGAEvent('event', 'begin_checkout', {
  currency: 'EUR',
  value: cartTotalInEuros,
  items: cartItems.map(toGA4Item),
});

// purchase (required fields)
sendGAEvent('event', 'purchase', {
  transaction_id: string,  // required — use Shopify order ID or UUID generated pre-checkout
  currency: 'EUR',
  value: orderTotalInEuros,
  items: orderItems.map(toGA4Item),
});
```

`transaction_id` for the purchase event is the critical constraint. Since Shopify does not reliably surface the order ID in the redirect URL for Basic-plan Draft Order flows, generate a UUID at checkout initiation, store it in the `sessionStorage` snapshot, and use it as `transaction_id`. This prevents duplicate purchase events on browser back/refresh.

---

## Sources

- [Next.js Third-Party Libraries Docs (v16.1.6)](https://nextjs.org/docs/app/guides/third-party-libraries) — GoogleAnalytics component, sendGAEvent API, sendGTMEvent API. HIGH confidence — official docs, verified 2026-02-22.
- `@next/third-parties` npm: version 16.1.6, published 23 days ago (2026-02-22 reference). HIGH confidence — npm registry.
- `vanilla-cookieconsent` npm: version 3.1.0, MIT, zero dependencies. HIGH confidence — npm registry.
- [vanilla-cookieconsent Google Consent Mode docs](https://cookieconsent.orestbida.com/advanced/google-consent-mode.html) — 7 consent signals, gtag integration pattern. HIGH confidence — official docs.
- [GA4 Ecommerce Measurement](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce) — Required parameters for view_item, add_to_cart, begin_checkout, purchase. HIGH confidence — Google developer docs.
- [Google Consent Mode Setup](https://developers.google.com/tag-platform/security/guides/consent) — Default denied state, gtag('consent', 'default') pattern. HIGH confidence — Google official docs.
- WebSearch: "GA4 consent mode v2 Next.js App Router 2025" — MEDIUM confidence, multiple community sources agree on useEffect + dataLayer pattern.
- WebSearch: "vanilla-cookieconsent v3 Next.js App Router" — MEDIUM confidence, StackBlitz examples and community guides confirm useEffect initialization pattern works in App Router.

---

*Stack research for: Pure Blinds v1.5 Analytics & Privacy*
*Researched: 2026-02-22*
