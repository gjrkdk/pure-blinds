# Pitfalls Research

**Domain:** GA4 e-commerce tracking & GDPR cookie consent — headless Shopify + Next.js 15 App Router
**Researched:** 2026-02-22
**Confidence:** HIGH (cross-domain and consent topics verified with multiple official and community sources; draft-order-specific purchase tracking is MEDIUM — limited authoritative documentation)

---

## Critical Pitfalls

### Pitfall 1: Cross-Domain Session Break Between pure-blinds.nl and Shopify Checkout

**What goes wrong:**
When a user clicks checkout, the browser follows a redirect from `pure-blinds.nl` to a Shopify-hosted checkout URL (e.g., `shop.pure-blinds.nl/checkout/...` or `checkout.shopify.com`). GA4 treats this as a new session originating from a referral, so the purchase is reported as "direct" or "(not set)" traffic instead of being attributed to the user's original source (Google, organic, direct, etc.). The entire funnel collapses: `add_to_cart` and `begin_checkout` are recorded on domain A, `purchase` is recorded on domain B, and they are never joined.

**Why it happens:**
GA4 cross-domain tracking requires the `_gl` linker parameter to be appended to the URL at the moment of navigation. GA4 only appends `_gl` automatically to HTML anchor clicks it detects. A JavaScript-based redirect — which is exactly what the Draft Order checkout route does (`router.push(checkoutUrl)` or `window.location.href = checkoutUrl`) — does not trigger automatic linker decoration. GA4 never gets the chance to append `_gl`, so the Shopify checkout domain receives no client ID to continue the session with.

Additionally, even if `_gl` were appended, the Shopify checkout domain must also have the GA4 measurement ID configured to read and accept it, which requires Shopify's Google & YouTube sales channel or a Shopify Custom Pixel on the checkout.

**How to avoid:**
1. Configure cross-domain measurement in GA4: Admin → Data Streams → (stream) → Configure tag settings → Configure your domains. Add all relevant domains: `pure-blinds.nl`, `*.myshopify.com`, `checkout.shopify.com`.
2. Add those same domains to the GA4 configuration tag's "Domains to configure" field if using GTM.
3. Add `checkout.shopify.com` and `*.myshopify.com` to the "Unwanted referrals" list so Shopify checkout is not counted as a referral session-break.
4. Manually decorate the checkout URL with the `_gl` linker parameter using the `ga()` or `gtag()` linker API before redirecting: `gtag('get', GA_ID, 'linker:form_decorate', checkoutAnchorElement)` or use `window.ga.getAll()[0].get('linker')` to read the linker value and append it as a query param.
5. Accept that server-to-server purchase attribution via Shopify webhooks (Measurement Protocol) is the most reliable fallback for the `purchase` event, as it does not depend on browser-side continuity.

**Warning signs:**
- GA4 reports show `begin_checkout` events with zero matching `purchase` events
- Session source/medium for purchases shows "(direct) / (none)" instead of the actual acquisition channel
- The checkout URL in browser DevTools network tab does not contain `_gl=` parameter
- GA4 User Explorer shows sessions split across two client IDs for the same user journey

**Phase to address:**
Phase 1 (GA4 Foundation & Cross-Domain Setup) — must be solved before any e-commerce events are instrumented, because the attribution chain only works if the cross-domain configuration is established first.

---

### Pitfall 2: Purchase Event Depends on /bevestiging Page Load — Which the User May Never Complete

**What goes wrong:**
The `/bevestiging` (confirmation) page is the only point in the headless flow where a `purchase` GA4 event can be fired client-side. If the user closes the browser after payment but before the redirect back to `/bevestiging`, or if the redirect fails, the `purchase` event is never sent. On average, 10–20% of confirmed Shopify orders are never tracked this way. For Draft Orders specifically, the problem compounds: the checkout is a Shopify-generated URL, the user completes payment on Shopify's domain, and Shopify then redirects back — any network hiccup drops the tracking.

**Why it happens:**
Client-side `purchase` event tracking is inherently fragile: it depends on the browser successfully loading the confirmation page, the GA4 script initializing, consent state being granted, and the event firing before the user navigates away. Draft Order flows add an extra redirect hop compared to standard Shopify checkout, increasing failure surface.

**How to avoid:**
1. On `/bevestiging`, read order details from URL query parameters that Shopify appends on redirect (e.g., `?order_id=`, `?checkout_token=`). Parse these server-side in a Server Component and pass them to the client tracking component.
2. Always pass a stable `transaction_id` (the Shopify order name or order ID) to GA4's `purchase` event. GA4 deduplicates purchase events with the same `transaction_id` from the same user — this is the safety net against double-counting when the user refreshes the confirmation page.
3. Use `localStorage` to record that a `purchase` event was already sent for a given `transaction_id` and skip re-firing on refresh.
4. For production accuracy above ~85%, implement server-side purchase tracking via Shopify's `orders/paid` webhook and the GA4 Measurement Protocol. This fires independently of the browser and is not affected by ad blockers, page closes, or redirect failures.

**Warning signs:**
- Shopify admin order count is consistently higher than GA4 `purchase` event count (greater than 5% gap)
- Refreshing `/bevestiging` causes a second `purchase` event in GA4 DebugView
- `transaction_id` values in GA4 are missing or `undefined`

**Phase to address:**
Phase 2 (E-Commerce Event Instrumentation) — implement `transaction_id` deduplication and localStorage guard on `/bevestiging` as part of the initial purchase event implementation. Server-side Measurement Protocol tracking is an optional enhancement that should be called out as a "deeper research" item if accuracy targets are not met.

---

### Pitfall 3: Consent Default Not Set Before GA4 Script Loads

**What goes wrong:**
Google Consent Mode v2 requires that `gtag('consent', 'default', {...})` is called *before* the GA4 configuration tag fires. If the `gtag` default consent call is placed after the `<Script src="gtag.js">` tag, or if it runs asynchronously (e.g., inside a `useEffect`), the GA4 configuration executes with no consent context. This causes GA4 to default to granted for all consent types, which is a GDPR violation for Dutch users. It also causes entire sessions to show "(not set)" attribution because the consent initialization event is missed.

**Why it happens:**
Developers add `<GoogleAnalytics gaId="..."/>` from `@next/third-parties/google` and then try to layer consent mode on top. The `@next/third-parties/google` component does not support Consent Mode configuration as of early 2025 — the component loads and configures GA4 immediately, with no hook to inject a consent default before it fires. This is a documented open issue in the Next.js repository.

**How to avoid:**
1. Do not use `@next/third-parties/google` `<GoogleAnalytics>` component for this project. It does not support Consent Mode.
2. Use a manual `<Script>` component approach with two scripts in this exact order in `app/layout.tsx`:
   - Script 1 (`strategy="afterInteractive"`): Inline script that calls `gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied' })` and initializes the `window.dataLayer` array.
   - Script 2 (`strategy="afterInteractive"`): `<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXX">` external GA4 script.
3. The consent default script must appear before the GA4 script in DOM order and both must use the same `strategy`.
4. On subsequent pages (after consent is granted and stored in a cookie), call `gtag('consent', 'update', { analytics_storage: 'granted' })` early in the layout render.

**Warning signs:**
- GA4 DebugView shows events with no consent signals
- GA4 reports show all sessions attributed to "(not set)" for large fraction of traffic
- Browser DevTools Network tab shows GA4 requests firing before the cookie consent banner has been shown
- `_ga` cookie is set on first page load before user interacts with consent banner

**Phase to address:**
Phase 1 (GA4 Foundation & Cross-Domain Setup) — consent default initialization must be the first thing resolved before any event instrumentation, because every event fired after a wrongly-initialized consent default contaminates the data.

---

### Pitfall 4: GA4 Script Blocked by CMP Before Consent Defaults Are Applied

**What goes wrong:**
Some cookie consent management platforms (CMPs) block all third-party scripts until the user grants consent. If the CMP blocks the GA4 script entirely (rather than just withholding cookie writes), then the consent default is never set, meaning GA4 never collects even the consent-mode modeled data. This removes the ability to use Google's behavioral modeling for users who decline cookies — defeating the primary benefit of Consent Mode v2 Advanced mode.

**Why it happens:**
When a custom-built consent banner is used, developers often conditionally render the `<Script>` tag only after consent is granted: `{consentGranted && <Script src="gtag.js"/>}`. This is technically GDPR-safe (no script loads without consent) but incompatible with Consent Mode v2's Advanced mode, which requires the GA4 script to load on every visit and then respect the consent signal.

**How to avoid:**
1. Always load the GA4 script unconditionally (on every page load) with `analytics_storage: 'denied'` as the default consent.
2. Only update consent to 'granted' after the user accepts cookies: call `gtag('consent', 'update', { analytics_storage: 'granted' })` when the user clicks "Accept" in the banner and persist the choice in a first-party cookie.
3. Never conditionally render the `<Script src="gtag.js">` tag behind a consent state check. The script itself is not what requires consent — the cookies it writes do.

**Warning signs:**
- GA4 property shows zero data for users who declined cookies (no modeled data at all)
- Consent Mode diagnostics in GA4 Admin show "No consent signals received"
- Browser DevTools shows GA4 network requests absent entirely for non-consenting users, rather than present but with `consent=denied` parameter

**Phase to address:**
Phase 1 (GA4 Foundation & Cross-Domain Setup) — part of the initial consent + script loading architecture.

---

### Pitfall 5: SPA Page View Events Not Firing on Route Changes

**What goes wrong:**
Next.js App Router is a single-page application for client-side navigation. When a user navigates from the homepage to a product page using a Next.js `<Link>`, the browser does not perform a full page reload. GA4's `gtag.js`, when loaded with `send_page_view: true`, only fires a `page_view` event on the initial load. Subsequent client-side navigations are invisible to GA4 unless explicitly tracked. The result: GA4 shows every user bouncing on the first page, even when they navigate to product pages and add items to the cart.

**Why it happens:**
GA4's Enhanced Measurement includes a "Page changes based on browser history events" option that is meant to handle SPAs. This works for simple SPAs but is unreliable with Next.js App Router's navigation model, which uses React Server Components and a custom router. The feature fires `history.pushState` events but can miss navigations or fire duplicate events depending on how routing is handled.

**How to avoid:**
1. Set `send_page_view: false` in the `gtag('config', ...)` call to disable GA4's automatic page view.
2. Create a client component that uses `usePathname()` from `next/navigation` and fires a `gtag('event', 'page_view', {...})` inside a `useEffect` that depends on `pathname`. This fires reliably on every App Router navigation.
3. Disable "Page changes based on browser history events" in GA4 Enhanced Measurement settings to prevent conflicts with the manual tracking.
4. Wrap this client component in a `<Suspense>` boundary if it also uses `useSearchParams()`, to avoid deopting the whole page to client rendering.

**Warning signs:**
- GA4 shows bounce rate near 100% for all pages
- Session duration reports are near zero despite users spending time on product pages
- Page view count in GA4 matches the number of landing sessions, not total navigation events
- GA4 DebugView shows only one `page_view` event per user session regardless of how many pages the user visits

**Phase to address:**
Phase 1 (GA4 Foundation & Cross-Domain Setup) — page view tracking is the most fundamental analytics capability. Must be verified working before e-commerce events are layered on top.

---

### Pitfall 6: useSearchParams Without Suspense Deopts the Entire Page

**What goes wrong:**
The `/bevestiging` page reads order details from URL query parameters to fire the `purchase` event. If a client component on this page uses `useSearchParams()` without being wrapped in a `<Suspense>` boundary, Next.js 15 App Router will deopt the entire route to client-side rendering. This means the page sends no HTML to the browser until JavaScript loads and executes — the page appears blank to users on slow connections and to crawlers. It can also break the `noindex` metadata applied in the `layout.tsx`, since server-rendered metadata may not be generated correctly.

**Why it happens:**
`useSearchParams()` reads dynamic URL data that is not available during static rendering. Without a `<Suspense>` boundary to isolate the dynamic component, Next.js has no choice but to make the entire route dynamic and client-rendered. This is a documented App Router behavior. Developers write the analytics tracking component directly on the page without isolating it.

**How to avoid:**
1. Wrap any component using `useSearchParams()` in a `<Suspense fallback={null}>` boundary.
2. Create a small isolated client component (e.g., `PurchaseTracker`) that reads search params and fires the GA4 event. Render this component inside `<Suspense>`.
3. Pass order data from server components via props where possible (read `searchParams` prop in the Server Component page, pass values down to the client tracker).

**Warning signs:**
- Next.js build output warns: "useSearchParams() should be wrapped in a suspense boundary"
- `/bevestiging` shows blank page flash on load
- Console error: "Missing Suspense boundary with useSearchParams"
- Page source shows no HTML content (only the Next.js JS bundle script tag)

**Phase to address:**
Phase 2 (E-Commerce Event Instrumentation) — specifically when implementing the `/bevestiging` purchase event tracking component.

---

### Pitfall 7: Duplicate Purchase Events from Page Refresh or Multiple Tracking Sources

**What goes wrong:**
Users frequently refresh the `/bevestiging` page after completing an order (to check their order number, print a confirmation, share the URL). Each refresh fires the `purchase` event again, inflating GA4 revenue figures. Additionally, if both a direct `gtag.js` implementation and GTM are loaded simultaneously (which can happen if they are added at different times in the project without auditing), every purchase event is sent twice.

**Why it happens:**
- No deduplication guard on the `/bevestiging` page: the GA4 event fires on every component mount.
- The `transaction_id` GA4 deduplication feature only removes duplicates from the same user within the same session. A page refresh starts a new session, so the deduplication does not apply.
- Double-tagging with both `gtag.js` and GTM is a common incremental mistake when a developer adds GTM later without removing the direct `gtag.js` integration.

**How to avoid:**
1. Use `localStorage` to store the `transaction_id` of the last tracked purchase. On `/bevestiging` mount, check if the current `transaction_id` was already tracked. If yes, skip the `purchase` event.
2. Always pass `transaction_id` to every `purchase` event — this is GA4's primary deduplication key.
3. Decide on either `gtag.js` directly or GTM, not both. For this project's scale, direct `gtag.js` is simpler. If GTM is added later, remove the direct script.
4. Use GA4 DebugView to verify exactly one `purchase` event fires per order.

**Warning signs:**
- GA4 `purchase` event count is greater than Shopify's paid order count
- Revenue in GA4 is a multiple of actual revenue (exact doubling suggests double-tagging)
- GA4 DebugView shows two near-simultaneous `purchase` events per checkout
- `transaction_id` field in GA4 events is `undefined` or empty string

**Phase to address:**
Phase 2 (E-Commerce Event Instrumentation) — deduplication logic is part of the `/bevestiging` tracking implementation.

---

### Pitfall 8: Dutch/GDPR Consent Banner Dark Patterns That Violate AP Guidelines

**What goes wrong:**
The Dutch Data Protection Authority (Autoriteit Persoonsgegevens, AP) actively monitors websites for GDPR cookie consent violations and fines for non-compliance. Specific violations the AP targets:

- No "Reject all" button at the same visual prominence as "Accept all"
- Pre-ticked checkboxes for analytics or marketing cookies
- Making the "Reject" option harder to find (buried in "Manage preferences")
- Cookie walls: denying access to the site if the user refuses analytics cookies
- Setting any non-essential cookies (including `_ga`) before the user interacts with the banner
- Logging consent without recording the timestamp and consent version

**Why it happens:**
Developers copy dark-pattern consent UI from tutorials or templates designed for US markets, where CCPA rules are less strict. Dutch/EU law requires explicit opt-in for non-essential cookies with equal prominence for accept and reject actions. Many tutorial implementations show "Accept" prominently and bury "Reject" in a secondary flow.

**How to avoid:**
1. Show "Accepteer alles" and "Weigeren" (or "Alleen noodzakelijk") as equally prominent buttons at the top level of the banner — same size, same visual weight.
2. Never pre-tick analytics consent checkboxes.
3. Set `_ga` and other GA4 cookies only after the user explicitly accepts analytics. GA4 script itself loads unconditionally (with consent denied as default), but cookies are only written after `analytics_storage: 'granted'` is set.
4. Store consent decision with timestamp and banner version in a first-party cookie (e.g., `pb_consent`). Log: `{ granted: true/false, timestamp: ISO8601, version: 'v1' }`.
5. Re-show the banner when consent version changes (e.g., if GA4 is added to the tracking scope).
6. Do not use a cookie wall — pure-blinds.nl must be accessible to users who decline analytics.

**Warning signs:**
- `_ga` cookie is set in browser before the user has interacted with any consent UI (visible in DevTools → Application → Cookies immediately on page load)
- Banner has "Accept" button but no direct "Reject" button at the same level
- Consent is stored but without a timestamp or version number

**Phase to address:**
Phase 3 (Cookie Consent Banner) — the banner implementation phase must include a legal review checklist based on AP guidelines.

---

### Pitfall 9: Consent State Not Restored on Return Visits

**What goes wrong:**
A user accepts analytics cookies, navigates to Shopify checkout, and is redirected back to `/bevestiging`. On that redirect, the page loads fresh. If the consent state is read from a cookie but the GA4 `gtag('consent', 'update', ...)` call happens after the GA4 script fires its first events, those events (including `purchase`) are sent with consent denied. The purchase event is dropped or recorded without proper attribution.

A related problem: on a return visit (next day), the user's saved consent is read from the first-party cookie, but `gtag('consent', 'update', ...)` is called inside a React `useEffect`, which runs after hydration. Any GA4 events that fire during the static HTML render phase or before hydration are sent before the consent update is applied.

**Why it happens:**
React `useEffect` runs after the component is painted. In Next.js App Router with partial pre-rendering and streaming, some components mount earlier than others. Consent restoration placed in a `useEffect` is asynchronous and races against the GA4 script's initialization.

**How to avoid:**
1. Read the consent cookie server-side in `app/layout.tsx` using `cookies()` from `next/headers`.
2. Render a small inline script (not a `<Script>` component — a raw `<script>` tag inside the layout) that calls `gtag('consent', 'default', { analytics_storage: cookieValue === 'granted' ? 'granted' : 'denied' })` synchronously, before any GA4 requests are made.
3. This inline script must execute before the `<Script src="gtag.js">` tag. Place it before the Script component in the layout.
4. Do not rely on `useEffect` for consent initialization — only use it for the banner UI and for calling `gtag('consent', 'update', ...)` after a user interacts with the banner.

**Warning signs:**
- Returning consenting users show `analytics_storage: denied` in GA4 DebugView for the first event of each session
- Purchase events from `/bevestiging` are missing from GA4 even though the user previously consented
- `_ga` cookie is present (from a previous consented session) but new GA4 events in DebugView show consent denied

**Phase to address:**
Phase 3 (Cookie Consent Banner) — the consent restoration logic must be designed alongside the banner, not as an afterthought.

---

### Pitfall 10: Cart Clearing Before Checkout Makes begin_checkout Item Data Unavailable on /bevestiging

**What goes wrong:**
The existing codebase clears the cart at checkout initiation (`CHKOUT-02` — intentional design decision documented in `PROJECT.md`). This means by the time the user lands on `/bevestiging`, the Zustand cart store is empty. There is no cart data available client-side to populate the `items` array of the GA4 `purchase` event — no `item_id`, `item_name`, `price`, or `quantity`.

Without an `items` array, the GA4 `purchase` event is invalid for e-commerce reporting. GA4's product-level reports (which items were purchased, revenue by product) will be empty.

**Why it happens:**
This is a conflict between an intentional UX decision (clear cart early to prevent duplicate orders) and the data requirement for GA4 e-commerce item tracking on the confirmation page. Developers either omit `items` from the `purchase` event (invalid) or attempt to re-read the cart from localStorage (already cleared).

**How to avoid:**
1. Before clearing the cart, snapshot the cart items into a separate, short-lived localStorage key (e.g., `pb_last_order_items`, with a 24-hour TTL or cleared after the purchase event fires).
2. On `/bevestiging`, read `pb_last_order_items` from localStorage to populate the GA4 `purchase` event `items` array.
3. Alternatively, pass item data through the checkout URL as query parameters (Shopify allows custom checkout attributes that may be readable on return).
4. Do not attempt to read items from the main cart store — it will be empty by design.

**Warning signs:**
- GA4 `purchase` events show `revenue` but no `items` array
- Product-level reports in GA4 (Items purchased, Revenue by item) are empty
- GA4 DebugView shows `purchase` event with missing `items` parameter

**Phase to address:**
Phase 2 (E-Commerce Event Instrumentation) — the item snapshot strategy must be designed as part of the checkout flow instrumentation, not as an afterthought when `/bevestiging` tracking is implemented.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `@next/third-parties/google` `<GoogleAnalytics>` | 2-line GA4 setup | Does not support Consent Mode v2 — requires full rewrite to add consent | Never for GDPR markets |
| Conditionally rendering `<Script src="gtag.js">` behind consent state | Technically no script runs without consent | Loses Consent Mode v2 Advanced modeling; harder to debug | Never — use consent defaults instead |
| Omitting `items` array from `purchase` event | Simpler implementation | GA4 product reports are empty; cannot optimize by product | Never for e-commerce |
| Skipping `transaction_id` deduplication guard on `/bevestiging` | One fewer `useEffect` | Duplicate revenue in GA4 on every page refresh | Never |
| Loading GA4 and GTM simultaneously | Faster iteration when adding GTM later | Double-counted events, inflated revenue | Never in production |
| Storing consent in `localStorage` instead of a cookie | Simpler code | Consent state is not readable server-side; cannot initialize consent defaults before hydration | Only if server-side consent init is not required |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GA4 Cross-Domain | Adding domains only in GA4 Admin, not in GTM config tag | Add domains in GA4 Admin Data Stream settings AND in the GA4 config tag's domain list (both must match) |
| GA4 Cross-Domain | Relying on automatic `_gl` decoration for JavaScript redirects | Manually decorate the checkout URL with the linker parameter using the `gtag` linker API before calling `window.location.href` |
| Shopify Checkout Domain | Not adding `checkout.shopify.com` to "Unwanted Referrals" | Add both `*.myshopify.com` and `checkout.shopify.com` as unwanted referrals in GA4 Admin |
| Consent Mode v2 | Calling `gtag('consent', 'default', ...)` inside `useEffect` | Must be a synchronous inline script in `<head>`, before `gtag.js` loads |
| Next.js `<Script>` + Consent | Using `beforeInteractive` strategy for consent scripts in App Router | Use `afterInteractive` for both consent init and GA4 — `beforeInteractive` has documented bugs with additional attributes in App Router |
| `/bevestiging` purchase tracking | Reading order data from Zustand cart (already cleared) | Snapshot cart to `pb_last_order_items` in localStorage before clearing; read from snapshot on confirmation page |
| GA4 + Draft Orders | Using Shopify's built-in GA4 integration (Google & YouTube channel) | Headless stores cannot use the Shopify sales channel integration; all tracking must be implemented in the Next.js codebase |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading GA4 with `beforeInteractive` strategy | Blocks page hydration, increases LCP | Use `afterInteractive` for GA4 — it is not a critical rendering resource | Immediately on every page load |
| Consent banner blocks rendering via `useEffect` state check | Banner flash, layout shift, CLS regression | Render banner in SSR-safe way using server-read consent cookie; avoid showing/hiding based on client-only state | On all page loads for new visitors |
| Fetching Shopify order data on `/bevestiging` to populate GA4 items | Extra API call delays event firing, adds latency | Pre-snapshot cart items before checkout redirect; avoid API calls on confirmation page | At any load time — adds 200–500ms minimum |
| Multiple `useEffect` hooks for analytics on a single page | Race conditions between consent check, page view, and purchase events | Single analytics provider component that sequences events in correct order | At low network speeds where event ordering matters |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Sending full customer email or phone number in GA4 event parameters | GDPR violation — personal data sent to Google servers without adequate basis | Only send non-PII: `transaction_id` (order name), `value`, `currency`, item names (product names are fine) |
| Storing raw consent logs without expiry | GDPR requires data minimization; indefinite consent logs are a liability | Store consent cookie with 13-month max-age (standard CMP practice); refresh on re-consent |
| Exposing GA4 Measurement Protocol API secret in client-side code | Anyone can forge server-side events to inflate or corrupt GA4 data | Measurement Protocol secret must only be used server-side (Next.js API route or webhook handler) |
| Using `localStorage` for consent with no server-side fallback | If localStorage is cleared, user is treated as new visitor and shown banner again — minor UX issue | Use a proper `Set-Cookie` with `SameSite=Lax; Secure` to persist consent; supplement with localStorage |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Cookie banner blocks the product page until dismissed | Users cannot browse products; high immediate bounce for users who delay deciding | Show banner as a non-blocking overlay/bottom bar; allow browsing before consent decision |
| "Accept" button in Dutch but legal copy in English | Confusing; looks untrustworthy; may constitute invalid consent (user did not understand what they consented to) | All consent banner text must be in Dutch: "Accepteer alles", "Weigeren", category names in Dutch |
| Banner re-appears on every `/bevestiging` load after Shopify redirect | Jarring UX at the most important moment of the user journey (just completed payment) | Restore consent state correctly from cookie before page render; banner must not appear for returning consenting users |
| No confirmation that the banner was dismissed (banner flicker on return) | Users who rejected cookies see the banner briefly flash on every page load | Use a server-side cookie to skip rendering the banner entirely for users who already made a choice |

---

## "Looks Done But Isn't" Checklist

- [ ] **GA4 Script Loading:** Verify `analytics_storage: 'denied'` consent default fires *before* the first GA4 network request in DevTools — open DevTools Network tab, filter by `google-analytics.com`, confirm the first request has `&gcs=G100` (consent denied) for a fresh incognito visitor
- [ ] **Cross-Domain Tracking:** Confirm `_gl=` parameter is present in the Shopify checkout URL when navigating from the cart — open DevTools, click "Naar afrekenen", check the redirect URL in the Network tab
- [ ] **Purchase Event Items:** Verify GA4 `purchase` events include a non-empty `items` array in DebugView — check product `item_id`, `item_name`, `price`, `quantity`
- [ ] **Deduplication Guard:** Refresh `/bevestiging` twice, verify only one `purchase` event appears in GA4 DebugView
- [ ] **SPA Page Views:** Navigate using site links (not browser refresh), verify a `page_view` event fires in DebugView for each navigation without duplicates
- [ ] **Consent Restoration:** Accept consent, close browser, reopen site — confirm `_ga` cookie is present and no consent banner appears
- [ ] **Dutch Banner Text:** All consent banner copy is in Dutch — no English strings anywhere in the banner UI
- [ ] **Reject Button Parity:** "Weigeren" button is visually identical in size and prominence to "Accepteer alles" button
- [ ] **No _ga Cookie Pre-Consent:** Open incognito, load homepage, check DevTools Cookies before interacting with banner — `_ga` must not exist

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Cross-domain session break discovered post-launch | MEDIUM | 1. Configure domains in GA4 Admin 2. Add unwanted referrals 3. Manually decorate checkout URL 4. Historical data is not recoverable — accept data loss for pre-fix period |
| Missing purchase events discovered post-launch | MEDIUM | 1. Implement `transaction_id` deduplication and item snapshot 2. For backfill, export Shopify orders and import via Measurement Protocol 3. Requires Shopify Admin API access and API secret |
| GDPR violation (cookies set before consent) | HIGH | 1. Deploy fix immediately (stop writing `_ga` before consent) 2. Document the incident and fix in writing 3. If AP investigates, the fix timeline is part of the defense 4. Consult legal counsel if formal complaint received |
| Duplicate purchase events inflating revenue | LOW | 1. Add `transaction_id` deduplication guard to `/bevestiging` 2. Deploy fix 3. In GA4, use the "Adjust events" feature to filter known duplicates from reporting |
| Consent banner not restoring state on Shopify redirect back | LOW | 1. Move consent restoration to server-side cookie read in layout 2. Deploy fix 3. Effect is immediate for all subsequent sessions |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Cross-domain session break | Phase 1: GA4 Foundation & Cross-Domain Setup | Confirm `_gl=` in checkout URL; check GA4 Acquisition reports show source attribution preserved |
| Consent default not set before GA4 script | Phase 1: GA4 Foundation & Cross-Domain Setup | DevTools Network — first GA4 request must include `gcs=G100` for unconsented users |
| SPA page view not tracking route changes | Phase 1: GA4 Foundation & Cross-Domain Setup | GA4 DebugView shows `page_view` on every Link navigation |
| GA4 script blocked by CMP entirely | Phase 1: GA4 Foundation & Cross-Domain Setup | Network tab confirms GA4 requests present even for non-consenting users (with denied consent params) |
| Purchase event depends on page load (fragile) | Phase 2: E-Commerce Event Instrumentation | Test by manually closing browser before `/bevestiging` loads; compare Shopify orders vs GA4 purchases over 1 week |
| Cart cleared before `/bevestiging` — no items data | Phase 2: E-Commerce Event Instrumentation | GA4 DebugView `purchase` event includes populated `items` array |
| Duplicate purchase events on page refresh | Phase 2: E-Commerce Event Instrumentation | Refresh `/bevestiging` 3 times, confirm only 1 purchase event in DebugView |
| `useSearchParams` without Suspense deopting page | Phase 2: E-Commerce Event Instrumentation | Next.js build output has no Suspense warnings; `/bevestiging` page source includes HTML content |
| Dutch GDPR consent banner dark patterns | Phase 3: Cookie Consent Banner | AP guidelines checklist; confirm equal-prominence reject button; confirm no cookies before consent |
| Consent state not restored on return visit | Phase 3: Cookie Consent Banner | Accept consent, clear browser session (not cookies), reload — banner must not reappear |

---

## Sources

**GA4 Cross-Domain Tracking:**
- [GA4 Cross-Domain Tracking Setup for Shopify & WooCommerce - Conversios](https://www.conversios.io/blog/ga4-cross-domain-tracking-shopify-woocommerce/)
- [Cross Domain Tracking GA4 - Checkout URL - Shopify Community](https://community.shopify.com/t/cross-domain-tracking-ga4-checkout-url/571623)
- [Headless Shopify & GA4 Tracking - Shopify Community](https://community.shopify.com/t/headless-shopify-ga4-tracking/344188)
- [Setting up Cross Domain Tracking for a Headless Shopify Store](https://community.shopify.com/t/setting-up-cross-domain-tracking-for-a-headless-shopify-store/237342)
- [#GTMTips: Cross-domain Tracking in GA4 - Simo Ahava](https://www.simoahava.com/gtm-tips/cross-domain-tracking-google-analytics-4/)

**GA4 Consent Mode v2:**
- [Top 7 Google Consent Mode Mistakes - Bounteous](https://www.bounteous.com/insights/2025/07/30/top-7-google-consent-mode-mistakes-and-how-fix-them-2025/)
- [Set up consent mode on websites - Google Developers](https://developers.google.com/tag-platform/security/guides/consent)
- [Consent Mode V2 For Google Tags - Simo Ahava](https://www.simoahava.com/analytics/consent-mode-v2-google-tags/)
- [How to implement Google Consent Mode in @next/third-parties - Next.js Discussion #66718](https://github.com/vercel/next.js/discussions/66718)

**Next.js App Router Pitfalls:**
- [Missing Suspense boundary with useSearchParams - Next.js Docs](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout)
- [Next.js Script Component - Official Docs](https://nextjs.org/docs/app/api-reference/components/script)
- [NextJS 13: Google Analytics in Consent Mode - gaudion.dev](https://gaudion.dev/blog/setup-google-analytics-with-gdpr-compliant-cookie-consent-in-nextjs13)
- [Dynamically loading GTM on cookie consent - Next.js Discussion #15416](https://github.com/vercel/next.js/discussions/15416)

**GA4 E-Commerce Tracking:**
- [Measure ecommerce - Google Analytics Developers](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Minimize duplicate key events with transaction IDs - Google Analytics Help](https://support.google.com/analytics/answer/12313109?hl=en)
- [Duplicate Events in GA4 - Analytics Mania](https://www.analyticsmania.com/post/duplicate-events-in-google-analytics-4-and-how-to-fix-them/)
- [Why Shopify's Google Analytics Tracking is Broken - Littledata (2025)](https://blog.littledata.io/2025/02/18/why-shopifys-google-analytics-tracking-is-broken-and-how-to-fix-it/)
- [Shopify GA4 Purchase Event - Nestscale](https://nestscale.com/blog/shopify-ga4-purchase-event.html)

**Dutch GDPR / AVG:**
- [Dutch DPA's cookie letter and GA4 - Turing Law](https://www.turing.law/the-dutch-data-protection-authoritys-cookie-letter-and-the-use-of-google-analytics-4/)
- [GDPR Compliance Dutch DPA Cookie Consent Guidelines - Secure Privacy](https://secureprivacy.ai/blog/how-to-comply-with-the-dutch-dpas-cookie-consent-guideline)
- [Is Your Website's Cookie Banner Up to Date? New Guidance from Dutch DPA (December 2025)](https://www.eyeonprivacy.com/2025/12/is-your-websites-cookie-banner-up-to-date-new-guidance-from-dutch-dpa/)
- [Netherlands Requirements for EU Cookies Law - TermsFeed](https://www.termsfeed.com/blog/netherlands-requirements-eu-cookies-law/)
- [Cookies, Analytics and Online Advertising in the Netherlands - Law & More](https://lawandmore.eu/blog/cookies-analytics-and-online-advertising-in-the-netherlands-staying-gdpr-compliant/)

---
*Pitfalls research for: GA4 e-commerce tracking & GDPR cookie consent — headless Shopify + Next.js 15 App Router*
*Researched: 2026-02-22*
*Confidence level: HIGH for cross-domain, consent architecture, SPA tracking, and Dutch GDPR requirements (multiple verified sources). MEDIUM for Draft Order purchase event completeness (limited official documentation on this specific combination).*
