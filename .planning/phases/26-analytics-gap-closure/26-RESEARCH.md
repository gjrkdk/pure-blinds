# Phase 26: Analytics Gap Closure - Research

**Researched:** 2026-02-27
**Domain:** gtag.js event dispatch timing, cross-domain linker configuration, consent-gated analytics
**Confidence:** HIGH (core patterns from official Google docs + Context7) / MEDIUM (consent-event interaction specifics)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ECOM-03 | `begin_checkout` event fires on checkout button click before Shopify redirect | event_callback + event_timeout pattern guarantees dispatch before redirect when consent is granted; research section covers implementation pattern and failure modes |
| GA4-02 | Cross-domain tracking configured between pure-blinds.nl and Shopify checkout domain | `accept_incoming: true` documented; glBridge.generate cookie dependency clarified; combined fix covers linker config + UA testing path |

</phase_requirements>

---

## Summary

Phase 26 closes two consent-dependent analytics gaps that were deliberately left as no-ops after earlier UAT identified they failed when `analytics_storage` was denied. The fix does not bypass consent — both gaps must work reliably *when* consent is granted, and remain inert when denied, which is the correct GDPR posture.

**Gap 1 — ECOM-03 (begin_checkout):** `trackBeginCheckout()` is an empty function body. The root problem is timing: `window.location.href` fires synchronously, which can terminate the page before gtag.js dispatches the collect request. The fix is the `event_callback` + `event_timeout` pattern: fire the GA4 event, pass a redirect callback as `event_callback`, and set `event_timeout` (e.g. 2000ms) as a safety fallback. The redirect only executes after the event is confirmed dispatched (or after the timeout). GA4 already uses `navigator.sendBeacon` internally, which survives page-unload in modern browsers, but the callback pattern is still required to prevent the redirect racing against beacon scheduling.

**Gap 2 — GA4-02 (cross-domain linker):** Two separate issues. First, `accept_incoming: true` is absent from the linker config in `layout.tsx` — this tells the destination domain (Shopify checkout on return) to parse incoming `_gl` parameters. Second, `decorateWithGlLinker()` in `cart-summary.tsx` calls `glBridge.generate()`, which requires `_ga` and `_ga_*` cookies that only exist after `analytics_storage: 'granted'`. This is correct consent-gated behaviour, but the function must check consent state before attempting decoration rather than silently returning the undecorated URL. The `accept_incoming: true` fix is independent of consent and must be applied unconditionally.

**Primary recommendation:** Re-enable `trackBeginCheckout` using the `event_callback` + `event_timeout` redirect pattern in `cart-summary.tsx`. Add `accept_incoming: true` to the linker `gtag('set', ...)` call in `layout.tsx`. Both fixes are contained, low-risk, and have no consent bypass risk.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gtag.js | CDN (latest, loaded via Script 2 in layout.tsx) | All GA4 event dispatch | Already installed; no new dependency needed |
| vanilla-cookieconsent | 3.1.0 | Consent signal source; `acceptedCategory()` for consent check | Already installed; already wired to gtag consent update |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `navigator.sendBeacon` | Web API (all modern browsers) | GA4 internally uses this for hit dispatch | No direct usage needed — gtag handles it internally |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| event_callback + event_timeout | Manual `navigator.sendBeacon` to GA4 collect endpoint | Endpoint format is complex and version-specific; event_callback is the documented gtag approach and handles all internal dispatch logic |
| event_callback + event_timeout | `visibilitychange` + `pagehide` events | These fire on page unload, not button click — wrong hook for pre-redirect dispatch |
| client-side glBridge | GA4 Admin cross-domain config | Admin config requires GTM or auto-link; this project uses manual gtag without GTM |

**Installation:** No new packages required. All fixes are configuration and code changes to existing files.

---

## Architecture Patterns

### Recommended Project Structure

No structural changes required. All edits are within existing files:

```
src/
├── app/layout.tsx                              # Add accept_incoming: true to linker config
├── lib/analytics/index.ts                      # Re-enable trackBeginCheckout with event_callback signature
└── components/cart/cart-summary.tsx            # Use event_callback + event_timeout redirect pattern
```

### Pattern 1: event_callback + event_timeout for Pre-Redirect Events

**What:** Fire a GA4 event and pass the page redirect as `event_callback`. Set `event_timeout` (2000ms) so the redirect is guaranteed to fire even if gtag fails to respond (ad blocker, slow network).

**When to use:** Any time a GA4 event must be dispatched before a `window.location.href` redirect on the same user interaction.

**Example:**
```typescript
// Source: https://developers.google.com/tag-platform/gtagjs/reference/parameters
// Source: https://developers.google.com/tag-platform/devguides/gtag-integration

function redirectToShopify(url: string): void {
  window.location.href = url
}

// In handleCheckout, replace: window.location.href = decorateWithGlLinker(data.invoiceUrl)
// With:
const shopifyUrl = decorateWithGlLinker(data.invoiceUrl)

if (typeof window.gtag === 'function') {
  window.gtag('event', 'begin_checkout', {
    currency: 'EUR',
    value: totalValue,
    items: checkoutItems,
    event_callback: () => redirectToShopify(shopifyUrl),
    event_timeout: 2000,
  })
} else {
  redirectToShopify(shopifyUrl)
}
```

**Critical:** `event_timeout: 2000` (milliseconds) is not optional. Without it, if gtag fails to call the callback (ad blocker, script not loaded, network timeout), the user's redirect is blocked indefinitely. The timeout ensures the callback fires after 2 seconds maximum, even if the event was never dispatched.

**Key insight:** This pattern moves the redirect *into* the event payload, so the redirect and the event are causally linked. GA4 internally uses `navigator.sendBeacon` for the collect request, which survives page unload in modern browsers — so dispatch is likely to succeed even as the page starts navigating.

### Pattern 2: Consent Check Before Analytics Call

**What:** Check `CookieConsent.acceptedCategory('analytics')` before calling functions that depend on `_ga` cookies. Degrade gracefully to the undecorated URL when consent is denied.

**When to use:** Any function that calls `glBridge.generate()` or reads `_ga` cookies.

**Example:**
```typescript
// Source: cookieconsent.orestbida.com/advanced/google-consent-mode.html
import * as CookieConsent from 'vanilla-cookieconsent'

// decorateWithGlLinker already handles missing glBridge/cookie gracefully via try/catch
// The existing implementation is correct — _ga cookie simply won't exist without consent
// No additional guard needed; the null check `if (!gaClientId) return url` already handles it
```

**Note:** The existing `decorateWithGlLinker()` implementation is already correct — it returns the undecorated URL when `_ga` is absent. No change needed here. The only linker gap is `accept_incoming: true` in layout.tsx.

### Pattern 3: accept_incoming Cross-Domain Linker Config

**What:** Add `accept_incoming: true` to the gtag linker set command so the destination domain actively parses `_gl` from incoming URLs.

**When to use:** Always required on the source domain when using manual linker decoration.

**Example:**
```typescript
// Source: https://developers.google.com/tag-platform/devguides/cross-domain

// In layout.tsx Script 3 (gtag-config):
gtag('set', 'linker', {
  'domains': ['${process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN}'],
  'accept_incoming': true,
});
```

**Clarification from official docs:** `accept_incoming` defaults to `true` *only* when the destination domain has been configured to "automatically link domains" (i.e., when that domain also has GA4 configured to recognise the source domain). In this project's case, Shopify checkout is a third-party domain not under our GA4 configuration. Setting it explicitly is the safe, correct approach.

### Anti-Patterns to Avoid

- **Calling trackBeginCheckout before the API response**: The checkout API call (`fetch /api/checkout`) happens AFTER `trackBeginCheckout` is currently called in `handleCheckout`. For the `event_callback` pattern, the redirect must happen *inside* the callback. The event should fire after the successful API response and invoiceUrl is available — this is where the redirect currently lives. Move event firing to the success branch.
- **Omitting event_timeout**: Never use `event_callback` without `event_timeout`. If gtag is blocked by an ad blocker or the script hasn't loaded, the callback never fires and the user's checkout is silently broken.
- **Calling gtag('event', ...) before consent granted — expecting a collect hit**: When `analytics_storage` is denied, gtag in Basic Consent Mode does NOT send a real collect request. The event_callback will still fire (because gtag processes the command internally), but no data reaches GA4 servers. This is the correct consent-gated behaviour.
- **Putting begin_checkout event before the API response**: Current code calls `trackBeginCheckout` at line 77 of `cart-summary.tsx`, before the fetch call. For the callback pattern, the event must fire in the success branch where the invoiceUrl is available, because the redirect is what the callback executes.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Event dispatch timing before redirect | Custom sendBeacon call to collect endpoint | gtag `event_callback` + `event_timeout` | GA4 collect endpoint format is not public API; gtag manages batching, client_id, session_id, consent state internally |
| _gl parameter generation | Custom URL signing/encryption | `window.google_tag_data.glBridge.generate()` (already used) | glBridge encodes client_id in proprietary format; manual construction breaks |
| Cross-domain session continuation | Custom session token in URL | gtag linker `_gl` parameter (already used) | GA4 only recognises its own `_gl` format |

**Key insight:** The gtag event_callback pattern is specifically designed for the pre-redirect use case. It is Google's documented solution. The existing `decorateWithGlLinker()` implementation using `glBridge.generate()` is already the correct approach — it just needs consent to be granted for cookies to exist.

---

## Common Pitfalls

### Pitfall 1: event_callback Never Fires (Ad Blocker / Script Not Loaded)

**What goes wrong:** If gtag.js is blocked by an ad blocker or fails to load, `window.gtag` may be undefined or a stub. The `event_callback` function is never invoked, and the user's checkout redirect never fires.

**Why it happens:** event_callback is a gtag internal mechanism — if gtag isn't operational, it can't call the callback.

**How to avoid:** Two defenses:
1. Set `event_timeout: 2000` — gtag will call the callback after 2 seconds maximum regardless.
2. Wrap the gtag call in a guard: `if (typeof window.gtag === 'function') { gtag(...) } else { redirect() }` — if gtag is absent entirely, redirect immediately without attempting the event.

**Warning signs:** User testers reporting checkout button appears frozen or non-responsive.

### Pitfall 2: begin_checkout Fires Before invoiceUrl Exists

**What goes wrong:** Current code calls `trackBeginCheckout()` at line 77 of `cart-summary.tsx`, before the API call. For the callback pattern, the redirect is part of the callback — so the event must fire only after the invoiceUrl is confirmed.

**Why it happens:** The original placement pre-dated the callback pattern. Moving the call into the `if (response.ok && data.invoiceUrl)` success branch is required.

**How to avoid:** Event fires in the success branch only. Existing error handling (`setError`, `setLoading(false)`) remains untouched for API failure cases.

**Warning signs:** TypeScript errors if invoiceUrl is referenced inside event_callback scope before it's defined.

### Pitfall 3: glBridge.generate() Silent No-Op Without Consent

**What goes wrong:** When `analytics_storage` is denied, `_ga` cookie does not exist, so `decorateWithGlLinker()` returns the plain Shopify URL. This is correct by design — but can be confused with a bug if UAT doesn't account for consent state.

**Why it happens:** The `_ga` cookie is only set by GA4 after `analytics_storage: 'granted'`. No cookie → no client ID → glBridge cannot generate a valid `_gl` value.

**How to avoid:** UAT must test with `analytics_storage: 'granted'` (i.e., user accepted consent). Do not test cross-domain tracking in a denied-consent state and expect it to work.

**Warning signs:** UAT reports _gl not appearing in URL — verify consent state in DevTools Application > Local Storage > `cc_cookie` before concluding it's a bug.

### Pitfall 4: accept_incoming True Placement

**What goes wrong:** `accept_incoming: true` must appear in the `gtag('set', 'linker', ...)` call on the **source domain** (pure-blinds.nl), not exclusively on the destination. In this case, the source and destination are on the same gtag configuration (pure-blinds.nl sends users to Shopify). The `accept_incoming` instructs the pure-blinds.nl GA4 tag to accept `_gl` parameters on *incoming* URLs when users return from Shopify.

**Why it happens:** Confusion between "source" (pure-blinds.nl → Shopify) and "destination" (Shopify → pure-blinds.nl on return). We control pure-blinds.nl but not Shopify checkout.

**How to avoid:** Add `accept_incoming: true` to the existing `gtag('set', 'linker', ...)` in Script 3 of `layout.tsx`. This is a one-line change.

**Warning signs:** `_gl` parameter visible in URL bar on return from Shopify checkout but session attribution still shows (direct)/(none) in GA4.

### Pitfall 5: event_callback and GDPR — No Data When Consent Denied

**What goes wrong:** Some developers interpret the event_callback firing as "the event was received by GA4." In Basic Consent Mode (analytics_storage: denied), gtag processes the command and calls the callback, but does NOT send a collect request to GA4 servers.

**Why it happens:** gtag callback confirms client-side processing completion, not server-side receipt.

**How to avoid:** This is correct behaviour — do not "fix" it. The callback pattern is used purely for timing the redirect, not for verifying GA4 receipt. The event_callback firing is sufficient to know the redirect can proceed.

**Warning signs:** Seeing begin_checkout in GA4 DebugView during denied-consent testing. (You should NOT see it — if you do, consent mode is mis-configured.)

---

## Code Examples

Verified patterns from official sources:

### begin_checkout with event_callback Redirect (ECOM-03 Fix)

```typescript
// Source: https://developers.google.com/tag-platform/gtagjs/reference/parameters
// Source: https://developers.google.com/tag-platform/devguides/gtag-integration

// In cart-summary.tsx handleCheckout — success branch only
// Replaces the current: window.location.href = decorateWithGlLinker(data.invoiceUrl)

const shopifyUrl = decorateWithGlLinker(data.invoiceUrl)

const redirectToShopify = () => {
  window.location.href = shopifyUrl
}

// Fire begin_checkout and redirect in callback
if (typeof window.gtag === 'function' && GA_MEASUREMENT_ID) {
  window.gtag('event', 'begin_checkout', {
    currency: 'EUR',
    value: getTotalPrice() / 100,
    items: items.map(item => ({
      item_id: item.productId,
      item_name: item.productName,
      price: item.priceInCents / 100,
      quantity: item.quantity,
    })),
    event_callback: redirectToShopify,
    event_timeout: 2000,
  })
} else {
  redirectToShopify()
}
```

**Note on index.ts:** The `trackBeginCheckout()` wrapper function in `src/lib/analytics/index.ts` cannot accept an `event_callback` in its current signature (`_items, _totalValue`). The callback approach requires the redirect URL to be passed into the gtag call. Two implementation options:

**Option A — Keep wrapper, remove redirect from wrapper, call raw gtag at call site in cart-summary.tsx:**
Keep `trackBeginCheckout()` as a standard event call (no callback), re-enable the body, and handle the callback+redirect logic directly in `cart-summary.tsx` by calling `window.gtag` directly with `event_callback`. This avoids leaking redirect concerns into the analytics module.

**Option B — Extend wrapper signature to accept callback:**
Add `onDispatched?: () => void` to `trackBeginCheckout` and pass it as `event_callback`. This keeps the call site clean but couples the analytics module to redirect timing concerns.

**Recommendation: Option A.** The analytics module should not know about redirects. `cart-summary.tsx` already calls `sendGtagEvent` indirectly via `trackBeginCheckout`. The simplest fix: re-enable `trackBeginCheckout` as a fire-and-forget (for any future non-redirect use case), and handle the redirect callback separately in `cart-summary.tsx`.

### accept_incoming Linker Config (GA4-02 Fix)

```javascript
// Source: https://developers.google.com/tag-platform/devguides/cross-domain
// In layout.tsx Script 3 (gtag-config inline script):

gtag('set', 'linker', {
  'domains': ['${process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN}'],
  'accept_incoming': true,
});
```

### Consent State Check Before Checkout Redirect

```typescript
// Source: cookieconsent.orestbida.com/advanced/google-consent-mode.html
// No change needed — decorateWithGlLinker() already handles missing _ga cookie:

const gaClientId = getCookie('_ga')
if (!gaClientId) return url  // Already present in cart-summary.tsx line 28
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| hitCallback (Universal Analytics) | event_callback (gtag.js) | GA4 launch (2020) | Same pattern, different API surface |
| Custom sendBeacon to /collect | gtag event_callback + internal sendBeacon | GA4 default | gtag handles transport; no manual beacon needed |
| UA cross-domain with `_ga` cookie only | GA4 `_gl` parameter via glBridge | GA4 launch | `_gl` is a signed token; not just a cookie copy |
| accept_incoming optional | accept_incoming: true recommended when not auto-configured | Ongoing | Must be explicit for non-GTM setups |

**Deprecated/outdated:**
- `analytics.js` hitCallback: replaced by gtag `event_callback` — do not use
- Manual `navigator.sendBeacon` to `https://www.google-analytics.com/collect`: UA endpoint; GA4 uses different endpoint managed internally by gtag

---

## Open Questions

1. **Does gtag event_callback fire when analytics_storage is denied (Basic Consent Mode)?**
   - What we know: Simo Ahava's guide says "tags wait until appropriate consent has been granted." Google docs say queued events in Advanced Consent Mode get reprocessed. Official docs do not explicitly state whether `event_callback` fires when consent is denied in Basic mode.
   - What's unclear: If gtag drops the event silently in denied state, does it also skip the callback? If so, event_timeout is the *only* safety net for the redirect.
   - Recommendation: Implement `event_timeout: 2000` unconditionally as the safety net. Add a fallback: if `CookieConsent.acceptedCategory('analytics')` is false, skip gtag call entirely and redirect immediately (no event sent, no callback needed). This makes the code paths explicit and avoids the ambiguity.

2. **Does sessionStorage survive the Shopify cross-origin round-trip?**
   - What we know: STATE.md flags this as an unverified concern from Phase 24. The purchase snapshot is written to sessionStorage before redirect; PurchaseTracker reads it on return.
   - What's unclear: sessionStorage is per-origin. A cross-origin Shopify redirect (pure-blinds.nl → checkout.shopify.com → pure-blinds.nl) will clear sessionStorage on departure — but the data was written on pure-blinds.nl before departure, and should still be accessible when the user returns to pure-blinds.nl (same origin).
   - Recommendation: This is outside Phase 26 scope (ECOM-04, not in phase requirements). Flag for UAT during Phase 26 as a secondary check. The theory that sessionStorage survives is sound (same-origin persistence), but requires a real test checkout to confirm.

3. **Is accept_incoming: true actually necessary when _gl is manually appended to the URL?**
   - What we know: The official docs say `accept_incoming` defaults to `true` "if the destination domain has been configured to automatically link domains." Shopify checkout is not configured by us. One source says the default is `true` globally. Official docs clarify it's only default-true when auto-configured.
   - What's unclear: Whether the gtag on pure-blinds.nl will parse an incoming `_gl` parameter (from Shopify return URL) without `accept_incoming: true`.
   - Recommendation: Set `accept_incoming: true` explicitly. Cost is one property addition. Risk of omission is broken session continuity on return from Shopify. The explicit setting is the safe choice per official docs.

---

## Sources

### Primary (HIGH confidence)
- `/websites/developers_google_tag-platform` (Context7) — event_callback, event_timeout, linker config, accept_incoming, consent default/update
- https://developers.google.com/tag-platform/devguides/cross-domain — cross-domain linker, accept_incoming, _gl parameter format
- https://developers.google.com/tag-platform/gtagjs/reference/parameters — event_callback and event_timeout parameters
- https://developers.google.com/tag-platform/devguides/gtag-integration — event_callback with redirect pattern (gtag_report_conversion example)
- https://developers.google.com/tag-platform/security/guides/consent — consent mode update, wait_for_update, event queuing

### Secondary (MEDIUM confidence)
- https://www.simoahava.com/gtm-tips/use-eventtimeout-eventcallback/ — event_timeout safety fallback pattern; Firefox ad blocker caveats
- https://cookieconsent.orestbida.com/advanced/google-consent-mode.html — vanilla-cookieconsent onConsent → gtag update timing
- https://www.analyticsmania.com/post/google-analytics-4-cross-domain-tracking-not-working/ — accept_incoming false breaks tracking; non-link elements need manual decoration
- https://gtm-gear.com/posts/ga4-cross-domain-linker/ — glBridge.generate() cookie requirements (_ga + _ga_*)

### Tertiary (LOW confidence — needs validation)
- Search result stating "accept_incoming defaults to true globally" — contradicted by official docs which say default-true only when auto-configured; treat official docs as authoritative
- Search result about GA4 October 2024 backend improvement for retroactive consent reprocessing — not verifiable from official source; does not affect implementation approach

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; gtag + vanilla-cookieconsent already in project
- Architecture: HIGH — event_callback + event_timeout is the documented Google pattern; accept_incoming: true is from official cross-domain guide
- Pitfalls: HIGH for event_timeout and consent-gated behaviour; MEDIUM for accept_incoming default ambiguity (official docs unclear on edge case)
- Open questions: MEDIUM — callback-in-denied-consent behaviour needs empirical verification via DebugView

**Research date:** 2026-02-27
**Valid until:** 2026-05-27 (stable API — gtag.js patterns change infrequently; consent mode v2 is settled as of March 2024 mandate)
