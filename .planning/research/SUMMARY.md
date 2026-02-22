# Project Research Summary

**Project:** Pure Blinds — v1.5 Analytics & Privacy
**Domain:** GA4 E-commerce Analytics + GDPR Cookie Consent (Next.js 15 App Router, headless Shopify)
**Researched:** 2026-02-22
**Confidence:** HIGH

## Executive Summary

Pure Blinds v1.5 is a focused analytics and legal-compliance milestone: add GA4 e-commerce funnel tracking to a headless Shopify storefront while meeting Dutch GDPR requirements enforced by the Autoriteit Persoonsgegevens (AP). The AP issued 50 enforcement warnings in April 2025 specifically targeting consent banners that bury the reject option, making compliant implementation non-optional. The recommended approach is to load GA4 unconditionally via raw `next/script` with all four Consent Mode v2 parameters defaulted to `denied`, layer a custom Dutch-language consent banner on top that updates consent state via `gtag('consent', 'update', ...)`, and instrument the four standard funnel events (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`) using typed wrappers over `window.gtag()`.

Only two library additions are needed: `vanilla-cookieconsent@3.1.0` for the GDPR consent UI (zero dependencies, native Consent Mode v2 support), and `@next/third-parties@16.1.6` for `sendGAEvent` event dispatch. Critically, the `<GoogleAnalytics>` component from `@next/third-parties/google` must not be used for script initialization — it does not support Consent Mode v2 as of early 2025. The most architecturally complex challenge is the `purchase` event: the Shopify checkout lives on a separate domain, the cart is cleared before the redirect, and Shopify does not pass an order ID back to `/bevestiging` for Basic-plan Draft Order flows. The solution is a `sessionStorage` snapshot of cart contents and a client-generated UUID stored at checkout initiation, read and fired on the confirmation page with a deduplication guard.

The three primary risks are: (1) firing GA4 with incorrect consent initialization order, which is a GDPR violation with real fine exposure; (2) cross-domain session breaks between `pure-blinds.nl` and the Shopify checkout domain that silently destroy acquisition attribution; and (3) missing or duplicate `purchase` events caused by the cart-clear-before-redirect pattern. All three are well-understood and have concrete prevention strategies documented in research. Execute phases in strict dependency order: consent infrastructure and cross-domain setup first, then funnel events, then the consent banner UI polish.

---

## Key Findings

### Recommended Stack

Only two library additions are needed. Everything else — Zustand, `next/script`, TypeScript, `sessionStorage`/`localStorage` — is already in the stack.

**Core technologies:**
- `@next/third-parties@16.1.6`: Official Next.js GA4 integration — use `sendGAEvent` for event dispatch only. Do **not** use its `<GoogleAnalytics>` component for consent-mode-aware script loading; it does not support Consent Mode v2 as of early 2025 (confirmed in Next.js GitHub discussion #66718).
- `vanilla-cookieconsent@3.1.0`: Zero-dependency GDPR consent banner (MIT, 152 kB unpacked) with native Consent Mode v2 signal mapping and cookie persistence. Initialized in `useEffect` in a Client Component — works identically in App Router.
- `next/script` (built-in): Used directly for GA4 initialization and consent default scripts. Both consent-default script and `gtag.js` src script must use `strategy="afterInteractive"`; consent default must appear before the gtag.js script in DOM order.
- `sessionStorage` (browser API): Sole mechanism for passing cart snapshot and transaction ID across the Shopify checkout boundary. `localStorage` is used for consent persistence only.

**What not to add:** Google Tag Manager (adds latency, unnecessary abstraction for developer-controlled events), `react-cookie-consent` (no Consent Mode v2 support), server-side GA4 Measurement Protocol (justified only at 10k+ monthly sessions), any SaaS consent platform (external dependency, monthly cost, timing complexity).

See full detail: `.planning/research/STACK.md`

### Expected Features

**Must have (table stakes — P1, v1.5 launch):**
- Cookie consent banner — Dutch-language, "Accepteer alles" and "Weiger alles" at equal visual prominence; no buried reject option; site fully functional without consent. Legal requirement; AP actively enforcing with fines up to €900,000.
- GA4 Consent Mode v2 loading — all 4 parameters (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) defaulted to `denied` before gtag fires; updated to `granted` on accept.
- `view_item` event — fires on product detail page mount with `item_id`, `item_name`, `price`, `currency: 'EUR'`.
- `add_to_cart` event — fires when user adds item to cart via the existing Zustand store call site.
- `begin_checkout` event — fires on checkout button click, before Shopify redirect.
- `purchase` event on `/bevestiging` — fires with `transaction_id` (client-generated UUID from sessionStorage snapshot) and full `items` array. Highest complexity; no Shopify order ID available without extra work on Basic plan.
- `transaction_id` deduplication guard — `sessionStorage` key prevents duplicate purchase events on page refresh within session; `localStorage` key prevents cross-session duplicates.
- VAT-inclusive EUR values on all monetary events — matches Dutch consumer pricing law and existing cart data format.

**Should have (P2, add after core tracking is validated):**
- `view_item_list` on category/subcategory pages — upper funnel visibility.
- `select_item` on product card click — product merchandising data.
- `view_cart` on cart page — cart abandonment analysis.
- Consent re-prompt on banner version change.
- Consent mode region restriction (EEA only) — reduces friction for non-EU traffic.

**Defer (v2+):**
- Server-side GA4 via Measurement Protocol — requires separate infrastructure; not justified until high traffic volumes where adblocker data loss is significant.
- `add_payment_info` / `add_shipping_info` — require Shopify Plus checkout extensibility.
- Google Ads conversion tracking — requires `ad_user_data` consent; most Dutch users will decline.
- GA4 audiences for remarketing — depends on ad consent, unlikely to be widely granted by Dutch users.

See full detail: `.planning/research/FEATURES.md`

### Architecture Approach

The analytics layer is entirely additive: three new Client Components (`GoogleAnalytics`, `CookieBanner`, `PurchaseTracker`) and one new `lib/analytics/` module (`events.ts`, `consent.ts`, `types.ts`). Four existing components receive targeted modifications. No server API routes are needed; all consent and event logic runs in the browser. The root layout remains a Server Component with client analytics components injected at the body level.

**Major components:**
1. `components/analytics/google-analytics.tsx` — loads gtag.js via two ordered `<Script>` tags: inline consent default first, then `src` script. The `GoogleAnalytics` component from `@next/third-parties` is not used for this. Built first; all `sendGAEvent` calls depend on this being in the tree.
2. `components/analytics/cookie-banner.tsx` — GDPR banner UI, reads/writes `localStorage` consent state in `useEffect` (SSR-safe), calls `gtag('consent', 'update', ...)` on user action. Must default to `null` state during SSR to avoid hydration mismatch.
3. `components/analytics/purchase-tracker.tsx` — reads `sessionStorage` snapshot on `/bevestiging` mount, fires `purchase` event, deduplicates via `sessionStorage` fired-flag, clears snapshot. Wrapped in `<Suspense fallback={null}>` to prevent Next.js route deopting from `useSearchParams()`.
4. `lib/analytics/events.ts` — typed wrappers (`trackViewItem`, `trackAddToCart`, `trackBeginCheckout`, `trackPurchase`) over `window.gtag()`, guarded against missing gtag. Centralizes all event logic.
5. `lib/analytics/consent.ts` — `getConsent()` / `setConsent()` localStorage helpers with SSR guards.
6. `lib/analytics/types.ts` — `GA4EcommerceItem`, `ConsentState` types shared across components.

**Existing components modified:**
- `app/layout.tsx` — add `<GoogleAnalytics />` and `<CookieBanner />` inside `<body>`
- `components/dimension-configurator.tsx` — call `trackViewItem()` on price load, `trackAddToCart()` on add
- `components/cart/cart-summary.tsx` — call `trackBeginCheckout()` and store `sessionStorage` snapshot before redirect
- `app/bevestiging/page.tsx` — add `<PurchaseTracker />` inside `<Suspense>`

**Build order (dependency-driven):**
```
Step 1: lib/analytics/ module (types, consent, events)
    ├── Step 2: google-analytics.tsx + layout.tsx modification
    │       └── Step 3: cookie-banner.tsx + layout.tsx modification
    ├── Step 4: view_item + add_to_cart in dimension-configurator.tsx
    └── Step 5: begin_checkout + sessionStorage snapshot in cart-summary.tsx
                └── Step 6: purchase-tracker.tsx + bevestiging/page.tsx modification
```

Steps 3, 4, and 5 can proceed in parallel once Step 2 is complete. Step 6 must follow Step 5.

See full detail: `.planning/research/ARCHITECTURE.md`

### Critical Pitfalls

1. **Consent default not set before GA4 script fires** — if `gtag('consent', 'default', ...)` runs after `gtag.js` loads, GA4 defaults to `analytics_storage: granted`. This is a GDPR violation and will cause attribution issues. Prevention: use two `<Script strategy="afterInteractive">` tags in exact DOM order — inline consent default script first, then the `gtag.js` src script. Never use `@next/third-parties/google` `<GoogleAnalytics>` for this purpose.

2. **Cross-domain session break at Shopify checkout** — JavaScript-based redirects (`window.location.href`) do not trigger GA4's automatic `_gl` linker decoration, so `purchase` events record "(direct)/(none)" source instead of the real acquisition channel. Prevention: configure cross-domain measurement in GA4 Admin; add `*.myshopify.com` and `checkout.shopify.com` to "Unwanted Referrals"; manually decorate the checkout URL with the `_gl` linker parameter before firing the redirect.

3. **Cart cleared before `/bevestiging` — no items data for purchase event** — the existing `clearCart()` call happens before the Shopify redirect. By the time `/bevestiging` loads, the Zustand store is empty and no `items` array can be populated. Prevention: snapshot cart items to `sessionStorage` at checkout initiation (before `clearCart()`); read from snapshot on confirmation page, never from the store.

4. **Duplicate purchase events on page refresh** — GA4's `transaction_id` deduplication only applies within a session; a page refresh starts a new session. Prevention: store the fired `transaction_id` in `sessionStorage` (and `localStorage` for cross-session safety); check before firing and skip if already sent.

5. **Dutch GDPR dark patterns on consent banner** — Dutch AP warned 50 organisations in April 2025 for burying the reject option. A colored "Accept" button with a gray/smaller "Reject" link is now legally documented as a violation. Prevention: equal-prominence "Accepteer alles" and "Weiger alles" buttons at the top layer; Dutch-language copy throughout; `_ga` cookie must not appear in browser before consent is granted.

6. **`useSearchParams` without Suspense deopts `/bevestiging` page** — if `PurchaseTracker` uses `useSearchParams()` without a `<Suspense>` boundary, Next.js makes the entire route client-side rendered, producing a blank-flash page and breaking server-rendered metadata. Prevention: wrap `PurchaseTracker` in `<Suspense fallback={null}>`.

7. **GA4 script conditionally rendered behind consent check** — blocking the `<Script src="gtag.js">` from loading until consent is granted disables Consent Mode v2 Advanced modeling (Google cannot send even anonymized cookieless pings for opted-out users). Prevention: always load gtag.js unconditionally with `analytics_storage: denied` as default; only the cookies it writes require consent, not the script itself.

See full detail: `.planning/research/PITFALLS.md`

---

## Implications for Roadmap

Research identifies a clear build dependency chain. Consent infrastructure and cross-domain configuration must exist before events can fire meaningfully. The analytics module must exist before any component can import event functions. The checkout snapshot must be stored before the purchase tracker can read it. This dictates three sequential phases with defined internal build order within each phase.

### Phase 1: GA4 Foundation & Cross-Domain Setup

**Rationale:** Consent initialization order, script loading pattern, cross-domain referral exclusion, and SPA page view tracking are all prerequisites for any event instrumentation. Getting these wrong either creates GDPR exposure or silently corrupts all subsequent attribution data. No event code should be written until this phase is verified working in GA4 DebugView.

**Delivers:** GA4 property receiving page views with correct Consent Mode v2 defaults (no `_ga` cookie before consent); cross-domain session continuity with Shopify checkout; SPA route-change page views tracked via `usePathname()` + `useEffect` pattern.

**Addresses (from FEATURES.md):** GA4 Consent Mode v2 loading (4 parameters); GA4 property configured with measurement ID (admin prerequisite, not code); SPA page view tracking.

**Avoids (from PITFALLS.md):** Pitfall 3 (consent default not set before GA4 script), Pitfall 4 (GA4 script blocked by CMP entirely), Pitfall 1 (cross-domain session break at Shopify checkout), Pitfall 5 (SPA page views not firing on route changes).

**Research flag:** Standard patterns — all covered by official docs and ARCHITECTURE.md Pattern 1. Skip research-phase; implement directly from documented patterns.

### Phase 2: E-Commerce Event Instrumentation

**Rationale:** Depends entirely on Phase 1 (gtag must be in the DOM tree before `window.gtag()` calls work). The `purchase` event and the sessionStorage snapshot strategy must be designed and built together — the `cart-summary.tsx` write and the `purchase-tracker.tsx` read are a single atomic unit and must not be split across work sessions.

**Delivers:** Full GA4 e-commerce funnel: `view_item` → `add_to_cart` → `begin_checkout` → `purchase` with deduplication and complete `items` arrays verified in DebugView. Revenue attribution operational. `lib/analytics/` typed event module complete.

**Addresses (from FEATURES.md):** All four P1 funnel events; `transaction_id` deduplication; `currency: 'EUR'` on all monetary events.

**Uses (from STACK.md):** `sendGAEvent` from `@next/third-parties`; `sessionStorage` snapshot pattern; client-generated `pb-${Date.now()}` UUID as `transaction_id`.

**Avoids (from PITFALLS.md):** Pitfall 10 (cart cleared before `/bevestiging` — no items data), Pitfall 7 (duplicate purchase events on page refresh), Pitfall 2 (purchase event depends on fragile page load), Pitfall 6 (`useSearchParams` without Suspense deopting page).

**Research flag:** Straightforward for `view_item`, `add_to_cart`, `begin_checkout`. The Shopify Draft Order purchase tracking pattern (sessionStorage snapshot + UUID as `transaction_id`) is MEDIUM confidence — validate with a real test checkout and DebugView inspection before marking complete. Also verify whether the Shopify `invoiceUrl` return redirect appends any query parameters that could provide a real order reference.

### Phase 3: Cookie Consent Banner

**Rationale:** The banner UI is the most legally sensitive component. Building it after the analytics foundation means the consent update path (`gtag('consent', 'update', ...)`) can be tested end-to-end against a live GA4 property. Consent state restoration on return visits (including returning from Shopify checkout) must be designed alongside the banner, not added later.

**Delivers:** GDPR-compliant Dutch-language cookie consent banner: "Accepteer alles" / "Weiger alles" equal visual prominence at top layer; consent persisted in `localStorage` (vanilla-cookieconsent default) with `sessionStorage` fallback; consent state correctly restored on the Shopify redirect back to `/bevestiging` without banner re-appearing; re-consent trigger on banner version change; no `_ga` cookie set before user accepts.

**Addresses (from FEATURES.md):** Cookie consent banner (legal requirement); consent withdrawal as easy as granting; no cookie wall; consent persisted across sessions (12-month validity); Dutch AP compliance requirements (equal prominence, no pre-ticked boxes, informed Dutch-language copy, consent timestamp/version stored).

**Uses (from STACK.md):** `vanilla-cookieconsent@3.1.0` for banner UI, persistence, and Consent Mode v2 signal mapping.

**Avoids (from PITFALLS.md):** Pitfall 8 (Dutch GDPR dark patterns — AP enforcement), Pitfall 9 (consent state not restored on return visits — race condition with GA4 init), Pitfall 3 (consent default racing against GA4 first events).

**Research flag:** Needs careful AP compliance checklist review — the December 2025 AP guidance update introduced nuances beyond April 2025 enforcement. Use the "Looks Done But Isn't" checklist from PITFALLS.md as the acceptance criteria. The consent restoration timing (Pitfall 9) may require a server-side cookie read approach in `app/layout.tsx` using `cookies()` from `next/headers`; validate whether `vanilla-cookieconsent`'s cookie name/format is readable server-side before committing to the `localStorage`-only approach.

### Phase Ordering Rationale

- Phase 1 before Phase 2: `window.gtag()` must exist in the DOM tree before any `sendGAEvent` or `trackX()` calls are wired into components. Cross-domain configuration is an admin step but must be verified before testing purchase attribution.
- Phase 2 before Phase 3 (recommended, not strictly required): Testing the `gtag('consent', 'update', ...)` call in Phase 3 is more meaningful when funnel events are already firing — a live DebugView makes consent state changes observable. Phase 3 can be parallelized with Phase 2 for the banner UI build, as long as the `consent.ts` module (built in Phase 2 Step 1) is available.
- Steps 5 and 6 within Phase 2 are atomic: the `sessionStorage` snapshot write (in `cart-summary.tsx`) and the `purchase-tracker.tsx` read must be built, tested, and deployed together.

### Research Flags

**Phases needing deeper validation during execution:**
- **Phase 2 (purchase event):** Shopify Draft Order + headless custom storefront is a niche combination with limited official documentation. Verify with a real test checkout (not just code review) whether the `sessionStorage` snapshot survives the Shopify cross-domain redirect back to `/bevestiging`. Also check whether Shopify appends any order reference to the return URL for this plan/flow type.
- **Phase 3 (consent restoration):** Verify the exact cookie name and format that `vanilla-cookieconsent@3.1.0` uses, and whether it is accessible server-side via `cookies()` in `app/layout.tsx`. This determines whether an inline script approach for consent restoration is needed or whether `vanilla-cookieconsent`'s built-in `onConsent` callback is sufficient.

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** GA4 script loading, cross-domain setup, SPA page view tracking — all patterns provided verbatim in ARCHITECTURE.md with official source references.
- **Phase 2 (non-purchase events):** `view_item`, `add_to_cart`, `begin_checkout` are straightforward instrumentation in existing client components using the typed event wrappers.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | `@next/third-parties@16.1.6` and `vanilla-cookieconsent@3.1.0` verified on npm registry and official docs. `@next/third-parties` Consent Mode v2 limitation confirmed by GitHub discussion #66718. All browser API usage (`sessionStorage`, `localStorage`) is standard. |
| Features | HIGH | GA4 event schema verified against Google developer docs. Dutch AP requirements verified against official AP guidance, Hogan Lovells legal analysis, and December 2025 AP guidance update. P1/P2/P3 priority assignments are well-reasoned against legal and business requirements. |
| Architecture | HIGH | All code patterns verified against official Next.js, GA4, and GDPR sources. Explicit concern: `@next/third-parties/google` `<GoogleAnalytics>` limitation is community-confirmed (GitHub #66718) but not officially documented by Vercel as "does not support Consent Mode" — re-check v16.1.6 release notes before Phase 1 implementation. |
| Pitfalls | HIGH (cross-domain, consent, SPA, Dutch GDPR) / MEDIUM (Draft Order purchase tracking) | Cross-domain and consent pitfalls verified with multiple official and community sources. The sessionStorage approach for Draft Order purchase tracking is MEDIUM confidence — the specific combination of headless Shopify + Basic plan + Draft Order `invoiceUrl` + custom storefront return URL has limited official documentation. |

**Overall confidence:** HIGH

### Gaps to Address

- **Shopify Draft Order return URL query params:** Research found a Shopify community announcement (medium confidence) that custom query params on Draft Order `invoiceUrl` survive the checkout redirect. If confirmed, a real Shopify order name/ID can be used as `transaction_id` instead of a client-generated UUID, improving cross-session deduplication. Validate during Phase 2 by inspecting the actual return URL from a test checkout in browser DevTools.

- **`vanilla-cookieconsent` server-side cookie readability:** Pitfall 9 recommends server-side consent restoration to prevent a race condition between consent state and the first GA4 events. This requires reading the cookie set by `vanilla-cookieconsent@3.1.0` in `app/layout.tsx` via `cookies()` from `next/headers`. The cookie name (`cc_cookie` by default) and JSON format must be confirmed before implementing the server-side restoration path in Phase 3.

- **`@next/third-parties@16.1.6` Consent Mode support status:** The limitation is community-confirmed against an earlier version. Re-check the v16.1.6 changelog before Phase 1 implementation — if Consent Mode v2 is now supported via the `<GoogleAnalytics>` component, the manual `next/script` approach can be simplified.

---

## Sources

### Primary (HIGH confidence)
- [Next.js Third-Party Libraries Docs](https://nextjs.org/docs/app/guides/third-party-libraries) — GoogleAnalytics component, sendGAEvent API
- [GA4 Ecommerce Measurement — Google Developers](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce) — event schema, required parameters
- [Set Up Consent Mode on Websites — Google Tag Platform](https://developers.google.com/tag-platform/security/guides/consent) — Consent Mode v2 parameters, default/update pattern
- [GA4 Transaction ID Deduplication — Analytics Help](https://support.google.com/analytics/answer/12313109) — `transaction_id` as deduplication key
- [GA4 Recommended Events — Analytics Help](https://support.google.com/analytics/answer/9267735) — full event catalogue
- [Dutch DPA Cookie Banner Requirements — Autoriteit Persoonsgegevens](https://www.autoriteitpersoonsgegevens.nl/en/themes/internet-and-smart-devices/cookies/clear-cookie-banners) — official AP guidance
- [vanilla-cookieconsent Google Consent Mode docs](https://cookieconsent.orestbida.com/advanced/google-consent-mode.html) — 7 consent signals, integration pattern
- [Missing Suspense boundary — Next.js Docs](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout) — `useSearchParams` Suspense requirement
- `vanilla-cookieconsent` npm v3.1.0 — zero dependencies, MIT, 152 kB unpacked
- `@next/third-parties` npm v16.1.6 — version matches installed Next.js

### Secondary (MEDIUM confidence)
- [Consent Mode v2 — Simo Ahava](https://www.simoahava.com/analytics/consent-mode-v2-google-tags/) — authoritative community reference for Consent Mode technical implementation
- [Next.js Google Analytics Consent Mode Discussion #66718 — GitHub](https://github.com/vercel/next.js/discussions/66718) — `@next/third-parties` Consent Mode v2 limitation confirmed by community
- [GDPR Cookie Banner in Next.js 15 — Frontend Weekly](https://medium.com/front-end-weekly/how-to-build-a-gdpr-cookie-banner-in-next-js-15-ga4-consent-mode-cloudfront-geo-detection-aae0961e89c5) — App Router implementation pattern
- [Dutch DPA Warns 50 Organisations — Nixon Digital](https://www.nixondigital.io/blog/dutch-dpa-cookie-compliance-warning/) — April 2025 enforcement context
- [Dutch DPA New Guidance December 2025 — Eye on Privacy](https://www.eyeonprivacy.com/2025/12/is-your-websites-cookie-banner-up-to-date-new-guidance-from-dutch-dpa/) — most recent AP guidance update
- [Dutch DPA Intensifies Cookie Enforcement — Hogan Lovells](https://www.hoganlovells.com/en/publications/dutch-dpa-intensifies-cookie-enforcement-key-takeaways-) — enforcement escalation context
- [GA4 Cross-Domain Tracking for Headless Shopify — Shopify Community](https://community.shopify.com/t/headless-shopify-ga4-tracking/344188) — headless-specific constraints
- [Query parameters on Draft Order invoice_url — Shopify Announcement](https://community.shopify.com/c/api-announcements/query-parameters-added-to-a-draft-order-invoice-url-now-get/m-p/314399) — custom params survive checkout redirect
- [Cross-Domain Tracking GA4 — Simo Ahava](https://www.simoahava.com/gtm-tips/cross-domain-tracking-google-analytics-4/) — `_gl` linker decoration pattern
- [Top 7 Google Consent Mode Mistakes — Bounteous](https://www.bounteous.com/insights/2025/07/30/top-7-google-consent-mode-mistakes-and-how-fix-them-2025/) — verified pitfall patterns

### Tertiary (LOW confidence — needs validation during implementation)
- WebSearch: "GA4 consent mode v2 Next.js App Router 2025" — multiple community sources agree on useEffect + dataLayer pattern
- WebSearch: "vanilla-cookieconsent v3 Next.js App Router" — StackBlitz examples confirm useEffect initialization works in App Router

---
*Research completed: 2026-02-22*
*Ready for roadmap: yes*
