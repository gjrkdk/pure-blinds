# Architecture Research: GA4 E-commerce Tracking & GDPR Consent

**Domain:** Analytics and cookie consent integration in Next.js 15 App Router headless Shopify webshop
**Researched:** 2026-02-22
**Confidence:** HIGH

## Existing Architecture (Baseline)

```
┌──────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                         │
│  Server Components (pages, footer, blog, product copy)        │
│  Client Components (header, dimension-configurator, cart)     │
├──────────────────────────────────────────────────────────────┤
│                     API LAYER                                 │
│  /api/pricing (POST)   /api/checkout (POST)   /api/health    │
├──────────────────────────────────────────────────────────────┤
│                   DOMAIN LOGIC LAYER                          │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────────┐      │
│  │  Pricing    │  │  Product   │  │  Cart (Zustand)  │      │
│  │  Engine     │  │  Catalog   │  │  localStorage    │      │
│  └─────────────┘  └────────────┘  └──────────────────┘      │
│  ┌───────────────────────────────────────────────────┐       │
│  │  Shopify Admin API (Draft Orders → invoiceUrl)    │       │
│  └───────────────────────────────────────────────────┘       │
├──────────────────────────────────────────────────────────────┤
│                  EXTERNAL INTEGRATIONS                        │
│  Shopify checkout domain (payment, order creation)            │
│  Vercel (hosting, edge network)                               │
└──────────────────────────────────────────────────────────────┘
```

**Key facts for analytics integration:**
- Shopify checkout happens on Shopify's domain — the app cannot run JavaScript there
- Cart is cleared at checkout initiation (`clearCart()` in cart-summary.tsx before redirect)
- Return URL is `/bevestiging` — this is the only purchase signal the app receives
- No order ID passes back from Shopify to `/bevestiging` via URL (Draft Order invoiceUrl does not append order reference automatically)
- All existing interactive components are `"use client"` — analytics hooks can be added to them directly
- Root layout is a Server Component — analytics scripts must be injected via a client boundary or `next/script`

---

## Target Architecture: Analytics + Consent

```
┌──────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                         │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  app/layout.tsx (Server Component)                  │     │
│  │  └─ <GoogleAnalytics /> (Client)  ← NEW             │     │
│  │  └─ <CookieBanner />   (Client)  ← NEW             │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  DimensionConfigurator (client) — fires view_item, add_to_cart│
│  CartSummary (client)          — fires begin_checkout        │
│  BevestigingPage (server shell + client tracker)            │
│  └─ <PurchaseTracker /> (client) ← NEW                      │
├──────────────────────────────────────────────────────────────┤
│                   ANALYTICS LAYER (new)                      │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  lib/analytics/                                      │    │
│  │  ├── events.ts      — typed gtag() wrappers          │    │
│  │  ├── consent.ts     — consent read/write (localStorage)   │
│  │  └── types.ts       — GA4EcommerceItem, ConsentState  │    │
│  └──────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  components/analytics/                               │    │
│  │  ├── google-analytics.tsx  — script loader + consent default │
│  │  ├── cookie-banner.tsx     — UI + consent update     │    │
│  │  └── purchase-tracker.tsx  — fires purchase event    │    │
│  └──────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────┤
│                  EXTERNAL INTEGRATIONS                        │
│  GA4 (Google Analytics 4) — receives events via gtag()       │
│  Shopify checkout domain (unchanged)                         │
└──────────────────────────────────────────────────────────────┘
```

---

## New Components (What Gets Built)

### Components Added

| Component | Type | Location | Purpose |
|-----------|------|----------|---------|
| `GoogleAnalytics` | Client | `components/analytics/google-analytics.tsx` | Loads gtag.js script, sets consent defaults, tracks page views |
| `CookieBanner` | Client | `components/analytics/cookie-banner.tsx` | GDPR consent UI, reads/writes localStorage, calls gtag consent update |
| `PurchaseTracker` | Client | `components/analytics/purchase-tracker.tsx` | Fires `purchase` event on `/bevestiging`, deduplicates via sessionStorage |

### Library Modules Added

| Module | Location | Purpose |
|--------|----------|---------|
| `events.ts` | `lib/analytics/events.ts` | Typed wrappers for GA4 ecommerce events |
| `consent.ts` | `lib/analytics/consent.ts` | Consent state persistence and reading |
| `types.ts` | `lib/analytics/types.ts` | Shared GA4 item shape and consent types |

### Existing Components Modified

| Component | File | Change |
|-----------|------|--------|
| `DimensionConfigurator` | `components/dimension-configurator.tsx` | Call `trackViewItem()` on price load, `trackAddToCart()` on add |
| `CartSummary` | `components/cart/cart-summary.tsx` | Call `trackBeginCheckout()` before redirect |
| `BevestigingPage` | `app/bevestiging/page.tsx` | Add `<PurchaseTracker />` client component |
| Root layout | `app/layout.tsx` | Add `<GoogleAnalytics />` and `<CookieBanner />` |

---

## Recommended Project Structure (additions only)

```
src/
├── app/
│   ├── layout.tsx                    # MODIFY: add <GoogleAnalytics />, <CookieBanner />
│   └── bevestiging/
│       └── page.tsx                  # MODIFY: add <PurchaseTracker />
├── components/
│   └── analytics/                    # NEW directory
│       ├── google-analytics.tsx      # Script loader + consent default init
│       ├── cookie-banner.tsx         # GDPR banner UI + consent update
│       └── purchase-tracker.tsx      # Fires purchase event on confirmation page
└── lib/
    └── analytics/                    # NEW directory
        ├── events.ts                 # trackViewItem, trackAddToCart, trackBeginCheckout, trackPurchase
        ├── consent.ts                # getConsent, setConsent (localStorage wrapper)
        └── types.ts                  # GA4EcommerceItem, ConsentState
```

---

## Architectural Patterns

### Pattern 1: Script Injection with Consent Default

**What:** Load GA4 via `next/script` with `strategy="afterInteractive"`, set consent defaults to `denied` before any measurement occurs.

**When to use:** Always — this is the GDPR-safe baseline. GA4 sends cookieless pings even with consent denied (behavioral modeling), but no cookies are set.

**Trade-offs:**
- `afterInteractive` means gtag loads after page is interactive — no impact on LCP or FID
- `beforeInteractive` is tempting but unnecessary; consent must default to denied regardless of load order
- `@next/third-parties/google` GoogleAnalytics component does not support consent mode as of early 2025 (confirmed by community reports) — use raw `next/script` instead

**Example:**
```tsx
// components/analytics/google-analytics.tsx
"use client";

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_ID || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      {/* Set consent defaults before any measurement */}
      <Script id="ga-consent-default" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied'
          });
        `}
      </Script>
      {/* Load GA4 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      {/* Initialize GA4 */}
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
```

### Pattern 2: Consent State via localStorage

**What:** Store consent decision in `localStorage` as JSON. Client component reads on mount, updates via `gtag('consent', 'update', ...)` when user decides.

**When to use:** This pattern (localStorage, not cookies) is appropriate because:
- GDPR requires consent for analytics cookies — but storing the consent preference itself in localStorage is generally accepted
- Avoids needing a `Set-Cookie` header from a server route
- Simpler than cookie-based approach with Next.js 15's async `cookies()` API

**Trade-offs:**
- localStorage is cleared if user clears browser data — banner re-appears, which is correct GDPR behavior
- No cross-device sync — also acceptable for consent
- Server components cannot read localStorage — consent state is client-only, which is correct (analytics scripts are client-only)

**Example:**
```typescript
// lib/analytics/consent.ts
export type ConsentValue = "granted" | "denied" | null;

const CONSENT_KEY = "cookie_consent";

export function getConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CONSENT_KEY) as ConsentValue;
  } catch {
    return null;
  }
}

export function setConsent(value: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // localStorage blocked (private mode, storage full)
  }
}
```

### Pattern 3: Typed Event Wrappers

**What:** Wrap `window.gtag()` calls in typed functions co-located in `lib/analytics/events.ts`. All ecommerce event calls go through these wrappers.

**When to use:** Always — prevents typos in event names, enforces correct parameter shapes, enables easy testing/mocking.

**Trade-offs:**
- Thin wrapper adds negligible overhead
- Centralizes all GA4 event logic — easier to modify or swap analytics provider later
- `window.gtag` may not exist if GA4 failed to load — guard required

**Example:**
```typescript
// lib/analytics/types.ts
export interface GA4EcommerceItem {
  item_id: string;        // productId
  item_name: string;      // productName with dimensions
  item_category: string;  // "rolgordijnen"
  price: number;          // EUR value (not cents)
  quantity: number;
}

// lib/analytics/events.ts
import type { GA4EcommerceItem } from "./types";

function gtag(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag(...(args as Parameters<typeof window.gtag>));
}

export function trackViewItem(item: GA4EcommerceItem): void {
  gtag("event", "view_item", {
    currency: "EUR",
    value: item.price,
    items: [item],
  });
}

export function trackAddToCart(item: GA4EcommerceItem): void {
  gtag("event", "add_to_cart", {
    currency: "EUR",
    value: item.price * item.quantity,
    items: [item],
  });
}

export function trackBeginCheckout(items: GA4EcommerceItem[], totalValue: number): void {
  gtag("event", "begin_checkout", {
    currency: "EUR",
    value: totalValue,
    items,
  });
}

export function trackPurchase(transactionId: string, items: GA4EcommerceItem[], totalValue: number): void {
  gtag("event", "purchase", {
    transaction_id: transactionId,
    currency: "EUR",
    value: totalValue,
    items,
  });
}
```

### Pattern 4: Purchase Tracking on Confirmation Page

**What:** The purchase event must fire on `/bevestiging` — but there is a critical constraint: the cart is cleared before Shopify redirect, so cart data is no longer available in Zustand store when `/bevestiging` loads.

**Solution:** Store cart snapshot in `sessionStorage` at checkout initiation, read it on `/bevestiging`, fire `purchase` event, then clear the snapshot. Use `sessionStorage` (not `localStorage`) so snapshot auto-clears when browser session ends.

**Deduplication:** Store the fired transaction ID in `sessionStorage` to prevent duplicate events on page refresh.

**Transaction ID:** Since Shopify does not pass an order ID back to `/bevestiging` via URL parameters (the Draft Order `invoiceUrl` does not carry a return reference by default), generate a client-side transaction ID from the cart contents hash at checkout initiation. This is sufficient for GA4 deduplication within a session.

**Trade-offs:**
- sessionStorage approach is robust against same-session page refreshes
- No server-side order ID means no cross-browser deduplication, but this is acceptable for a small store
- If real Shopify order ID is needed later: append a custom query param to the invoiceUrl before redirect (Shopify passes custom query params through to the checkout URL per API announcement)

**Example:**
```typescript
// Snapshot stored at checkout (cart-summary.tsx)
const snapshot = {
  items: items.map(item => toGA4Item(item)),
  totalValue: totalPrice / 100,
  transactionId: `pb-${Date.now()}`, // client-generated, unique per session
};
sessionStorage.setItem("checkout_analytics", JSON.stringify(snapshot));
```

```tsx
// components/analytics/purchase-tracker.tsx
"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/analytics/events";

export function PurchaseTracker() {
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("checkout_analytics");
      if (!raw) return;

      const { items, totalValue, transactionId } = JSON.parse(raw);

      // Deduplication: don't fire if already fired this session
      const firedKey = `purchase_fired_${transactionId}`;
      if (sessionStorage.getItem(firedKey)) return;

      trackPurchase(transactionId, items, totalValue);
      sessionStorage.setItem(firedKey, "1");
      sessionStorage.removeItem("checkout_analytics");
    } catch {
      // Parsing errors — fail silently, analytics is non-critical
    }
  }, []);

  return null; // renders nothing
}
```

---

## Data Flow

### Consent Flow

```
Browser loads page
    ↓
GoogleAnalytics component mounts
    ↓
gtag consent default: all → "denied"   (before any measurement)
    ↓
CookieBanner mounts, checks localStorage
    ↓
  ┌── "granted" found → gtag consent update → "granted"
  │                   → banner stays hidden
  │
  ├── "denied" found  → banner stays hidden (user already declined)
  │
  └── null (no choice) → show banner
            ↓
        User accepts → setConsent("granted")
                     → gtag consent update → "granted"
        User declines → setConsent("denied")
                     → gtag consent stays "denied"
```

### E-commerce Event Flow

```
Product page renders (Server Component)
    └─ DimensionConfigurator mounts (Client Component)
            ↓
    User enters dimensions → price loaded from /api/pricing
            ↓
    trackViewItem() → gtag("event", "view_item", {...})
            ↓
    User clicks "Toevoegen"
            ↓
    addItem() → Zustand store updated
    trackAddToCart() → gtag("event", "add_to_cart", {...})

Cart page (/winkelwagen) — CartSummary
    User clicks "Afrekenen"
            ↓
    trackBeginCheckout() → gtag("event", "begin_checkout", {...})
    Store snapshot in sessionStorage
    clearCart() [existing behavior]
            ↓
    window.location.href = invoiceUrl (Shopify checkout domain)

[Shopify handles payment — app has no JS here]

Shopify redirects to /bevestiging
    └─ PurchaseTracker mounts
            ↓
    Reads sessionStorage["checkout_analytics"]
    trackPurchase() → gtag("event", "purchase", {...})
    Marks transaction as fired in sessionStorage
    Clears checkout_analytics snapshot
```

### Consent Update Path (Banner Interaction)

```
CookieBanner → user clicks "Accepteren"
    ↓
setConsent("granted")        → localStorage["cookie_consent"] = "granted"
gtag consent update granted  → GA4 now sets cookies and tracks fully
banner hides (state update)
```

---

## Integration Points

### New vs. Modified — Explicit Map

| File | Status | Change Description |
|------|--------|--------------------|
| `app/layout.tsx` | MODIFY | Add `<GoogleAnalytics />` and `<CookieBanner />` inside `<body>` |
| `app/bevestiging/page.tsx` | MODIFY | Add `<PurchaseTracker />` client component |
| `components/dimension-configurator.tsx` | MODIFY | Call `trackViewItem()` when price loads; `trackAddToCart()` on add |
| `components/cart/cart-summary.tsx` | MODIFY | Call `trackBeginCheckout()` and store sessionStorage snapshot before redirect |
| `components/analytics/google-analytics.tsx` | NEW | Script loader with consent default initialization |
| `components/analytics/cookie-banner.tsx` | NEW | GDPR consent banner UI and update logic |
| `components/analytics/purchase-tracker.tsx` | NEW | Reads sessionStorage snapshot, fires purchase event |
| `lib/analytics/events.ts` | NEW | Typed gtag wrappers for all 4 ecommerce events |
| `lib/analytics/consent.ts` | NEW | localStorage consent read/write |
| `lib/analytics/types.ts` | NEW | `GA4EcommerceItem`, `ConsentState` types |
| `.env.local` | MODIFY | Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` |

### External Service Boundaries

| Service | Integration Point | Direction | Notes |
|---------|------------------|-----------|-------|
| Google Analytics 4 | `window.gtag()` calls in browser | App → GA4 | Respects consent state; only fires if `analytics_storage: granted` for cookie-based tracking |
| Shopify Checkout | `invoiceUrl` redirect | App → Shopify | One-way; no data comes back from Shopify to the app |
| Shopify (return) | `/bevestiging` page load | Shopify → App | Only the page load, no query params with order data |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `lib/analytics/events.ts` ↔ components | Direct function import | No React context needed — pure function calls |
| `lib/analytics/consent.ts` ↔ `CookieBanner` | Direct import | Banner owns consent write; GoogleAnalytics reads on init |
| `CartSummary` ↔ `PurchaseTracker` | sessionStorage | Decoupled across page boundary; sessionStorage is the hand-off mechanism |
| Analytics layer ↔ Zustand cart store | None | Analytics reads cart data directly from store state at event time; no coupling through store |

---

## Anti-Patterns

### Anti-Pattern 1: Firing Events Before Consent

**What people do:** Call `trackAddToCart()` immediately, assuming consent will come later or handle itself.
**Why it's wrong:** GA4 Consent Mode v2 will respect the `analytics_storage: denied` state and not set cookies, but events still fire and cookieless pings are sent. For strict GDPR compliance, do not fire any events until consent is granted — or accept that cookieless pings are GDPR-safe per Google's implementation.
**Do this instead:** Decide explicitly: either (a) fire events always and rely on Consent Mode v2 to gate cookies (Google's recommended approach, legally accepted in most EU jurisdictions), or (b) gate all event calls behind a consent check. For Pure Blinds, option (a) is simpler and sufficient.

### Anti-Pattern 2: Using `@next/third-parties/google` for Consent Mode

**What people do:** Use the `GoogleAnalytics` component from `@next/third-parties/google` and try to add consent mode on top.
**Why it's wrong:** As of early 2025, this component does not support Consent Mode v2. The community reports it "just does not work" for consent configurations.
**Do this instead:** Use raw `next/script` with manual gtag initialization as shown in Pattern 1.

### Anti-Pattern 3: Reading Cart from Zustand on `/bevestiging`

**What people do:** Try to read cart items from the Zustand store on the confirmation page to populate the purchase event.
**Why it's wrong:** The cart is cleared before the Shopify redirect (`clearCart()` in `cart-summary.tsx`). By the time `/bevestiging` renders, the store is empty.
**Do this instead:** Store a snapshot in `sessionStorage` at checkout initiation, read it on `/bevestiging`.

### Anti-Pattern 4: Storing Consent in a Cookie (Without a Backend)

**What people do:** Try to set `Set-Cookie` headers for consent in a Server Action or API route.
**Why it's wrong:** Adds unnecessary server-side complexity. GDPR consent state for analytics is a client-side concern — the server doesn't need it.
**Do this instead:** Use `localStorage`. If the preference is lost (cleared storage), the banner re-appears, which is the correct behavior.

### Anti-Pattern 5: SSR Hydration Mismatch with Consent Banner

**What people do:** Render banner visibility based on `localStorage` in the initial server render.
**Why it's wrong:** `localStorage` is not accessible during SSR — causes hydration errors.
**Do this instead:** Default to `null` (no banner) during SSR; check `localStorage` in `useEffect` after mount to determine visibility.

```tsx
// Correct pattern
const [consent, setConsent] = useState<ConsentValue>(null);

useEffect(() => {
  setConsent(getConsent()); // runs client-side only
}, []);

// null = not yet checked → render nothing (avoid flash)
if (consent !== null) return null; // already decided
// Show banner when consent is null after mount check
```

### Anti-Pattern 6: Purchase Event Without Deduplication

**What people do:** Fire `purchase` event on every load of `/bevestiging`.
**Why it's wrong:** Users sometimes reload the confirmation page — duplicate purchase events inflate revenue reporting.
**Do this instead:** Use `sessionStorage` to mark a transaction as fired, check before firing.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10k monthly sessions | Current approach: client-side gtag, localStorage consent, sessionStorage snapshot |
| 10k-100k monthly sessions | Consider server-side analytics events via GA4 Measurement Protocol for purchase (more reliable, no browser issues) |
| 100k+ monthly sessions | Server-side tagging with GA4 for all critical events; client-side as fallback only |

### Scaling Priorities

1. **First improvement (if needed):** Pass a real Shopify order ID back through invoiceUrl query param. Shopify supports custom query params on invoice URLs that survive the checkout redirect. Adds reliable transaction ID for GA4 deduplication across sessions.
2. **Second improvement (if needed):** GA4 Measurement Protocol for purchase event — fire server-side from a webhook or Shopify order webhook. Eliminates dependency on browser-side tracking for the most critical event.

---

## Build Order

Dependencies determine this order — later steps require earlier steps to exist.

### Step 1: Analytics Foundation (no dependencies)
Create `lib/analytics/` module with types, consent utilities, and event wrappers. No UI, no integration yet. This is pure TypeScript — testable in isolation.

Files: `lib/analytics/types.ts`, `lib/analytics/consent.ts`, `lib/analytics/events.ts`

### Step 2: Script Loader + Consent Init (depends on Step 1)
Build `GoogleAnalytics` component. Add to `app/layout.tsx`. This establishes the gtag presence that all event calls depend on. Test: GA4 measurement ID loaded in production, consent defaults to denied, no cookies set initially.

Files: `components/analytics/google-analytics.tsx`, modify `app/layout.tsx`

### Step 3: Cookie Banner (depends on Step 2)
Build `CookieBanner` component. Reads consent from localStorage, shows if no decision, updates gtag on accept/decline. Add to `app/layout.tsx` alongside `GoogleAnalytics`.

Test: Banner appears on first visit, hides after choice, choice persists on reload, gtag consent updates correctly.

Files: `components/analytics/cookie-banner.tsx`, modify `app/layout.tsx`

### Step 4: Product Funnel Events (depends on Step 1 + Step 2)
Instrument `DimensionConfigurator` for `view_item` and `add_to_cart`. These events fire in existing client components — just import and call the typed wrappers.

Files: modify `components/dimension-configurator.tsx`

### Step 5: Checkout Event + Snapshot (depends on Step 1 + Step 4)
Instrument `CartSummary` for `begin_checkout`. Simultaneously, store the sessionStorage snapshot of cart items and transaction ID before the Shopify redirect. These two changes must happen together — the snapshot is what enables Step 6.

Files: modify `components/cart/cart-summary.tsx`

### Step 6: Purchase Tracking (depends on Step 5)
Build `PurchaseTracker` component. Reads sessionStorage snapshot, fires `purchase` event, deduplicates. Add to `/bevestiging` page.

Files: `components/analytics/purchase-tracker.tsx`, modify `app/bevestiging/page.tsx`

### Dependency Graph

```
Step 1 (lib/analytics/)
    ├─→ Step 2 (GoogleAnalytics script)
    │       └─→ Step 3 (CookieBanner)
    ├─→ Step 4 (view_item, add_to_cart)
    └─→ Step 5 (begin_checkout + snapshot)
                └─→ Step 6 (purchase)
```

Steps 3, 4, and 5 can be built in parallel once Step 2 is complete. Step 6 must follow Step 5.

---

## Sources

- [Measure ecommerce | Google Analytics Developer Docs](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce) — HIGH confidence, official
- [Set up consent mode | Google Tag Platform](https://developers.google.com/tag-platform/security/guides/consent) — HIGH confidence, official
- [Consent Mode v2 – Simo Ahava's blog](https://www.simoahava.com/analytics/consent-mode-v2-google-tags/) — HIGH confidence, authoritative GA4 reference
- [GA4 Recommended Events | Google Developers](https://developers.google.com/analytics/devguides/collection/ga4/reference/events) — HIGH confidence, official
- [How to Build a GDPR Cookie Banner in Next.js 15+ | Frontend Weekly](https://medium.com/front-end-weekly/how-to-build-a-gdpr-cookie-banner-in-next-js-15-ga4-consent-mode-cloudfront-geo-detection-aae0961e89c5) — MEDIUM confidence, current (2025)
- [Configuring Google Cookies Consent with Next.js 15 | Medium](https://medium.com/@sdanvudi/configuring-google-cookies-consent-with-next-js-15-ca159a2bea13) — MEDIUM confidence, confirms `@next/third-parties` limitation
- [NextJS 13: Google Analytics in Consent Mode with Cookie Banner | gaudion.dev](https://gaudion.dev/blog/setup-google-analytics-with-gdpr-compliant-cookie-consent-in-nextjs13) — MEDIUM confidence, pattern is valid for Next.js 15 App Router
- [Minimize duplicate key events with transaction IDs | Analytics Help](https://support.google.com/analytics/answer/12313109) — HIGH confidence, official GA4 deduplication guidance
- [useSearchParams | Next.js Docs](https://nextjs.org/docs/app/api-reference/functions/use-search-params) — HIGH confidence, official
- [Query parameters added to Draft Order invoice_url get copied to checkout URL | Shopify Community](https://community.shopify.com/c/api-announcements/query-parameters-added-to-a-draft-order-invoice-url-now-get/m-p/314399) — MEDIUM confidence, Shopify announcement

---
*Architecture research for: GA4 e-commerce tracking & GDPR consent in Next.js 15 App Router*
*Researched: 2026-02-22*
