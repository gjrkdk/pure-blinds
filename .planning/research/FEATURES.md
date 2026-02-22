# Feature Research: GA4 E-Commerce Tracking & GDPR Cookie Consent

**Domain:** Analytics and privacy for Dutch e-commerce (pure-blinds.nl)
**Researched:** 2026-02-22
**Confidence:** HIGH (GA4 event spec verified against official Google docs; Dutch DPA requirements verified against multiple authoritative sources including Autoriteit Persoonsgegevens and recent enforcement actions)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that any compliant Dutch e-commerce site must have. Missing these = legal exposure or broken analytics.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Cookie consent banner with "Accept All" and "Reject All" on first layer | Dutch AP requires equal-prominence accept and reject options visible immediately — no burying reject in layer 2 | MEDIUM | AP issued 50 warnings in April 2025; colored accept + gray reject link now legally problematic |
| Default GA4 consent to "denied" before user action | GA4 must not set cookies or collect personal data before explicit consent — GDPR requirement | MEDIUM | Set `analytics_storage: 'denied'` before gtag loads; update to `'granted'` on accept |
| Consent persisted across sessions (12-month validity) | Users cannot be re-asked every page load; consent must survive browser close | LOW | Store in cookie or localStorage; re-prompt annually or on policy change |
| Consent withdrawal as easy as granting | GDPR requires symmetric revocation — user must be able to undo consent at any time | LOW | Settings button or footer link reopens banner; clearing storage works |
| No cookie wall (full site access without consent) | Dutch AP explicitly prohibits blocking access for users who decline tracking | LOW | Functional site must work with zero analytics cookies accepted |
| GA4 property configured with measurement ID | Analytics data collection requires a GA4 property; no data lands without it | LOW | Admin task, not code — but a prerequisite for all other tracking |
| `view_item` event on product detail page | Standard funnel entry point; GA4 e-commerce reports require this event | LOW | Fires on product page load with item_id, item_name, price, currency |
| `add_to_cart` event on cart add | Required for GA4 funnel drop-off analysis between browse and checkout | LOW | Already have cart add action in Zustand store — hook in here |
| `begin_checkout` event on checkout initiation | Required for GA4 funnel between cart and purchase | LOW | Fires when user clicks checkout button; cart contents as items array |
| `purchase` event on order confirmation | Required for revenue attribution; missing this = no conversion data | HIGH | Hardest event — Shopify handles payment, we handle /bevestiging; no native order ID passed back from Shopify to custom storefront |
| `transaction_id` on every purchase event | GA4 deduplicates purchases using this field; missing it = duplicate revenue counting | LOW | Must generate or persist a unique ID; Shopify Draft Order ID is ideal but not available at /bevestiging without extra work |
| Currency in all monetary events | GA4 requires `currency` on all events that send `value`; missing = data discarded | LOW | Always send `"EUR"` for this site |
| VAT-inclusive `value` matching displayed price | Dutch consumer price law requires VAT-inclusive pricing — analytics value should match | LOW | Already storing prices in EUR cents inclusive of 21% BTW |

---

### Differentiators (Competitive Advantage)

Features beyond baseline compliance that improve data quality or user experience.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| GA4 Consent Mode v2 (all 4 parameters) | Enables Google's behavioral modeling for users who decline — recovers some conversion signal from opted-out users | MEDIUM | Four parameters: `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization` — all default denied; standard consent mode only has 2 |
| `view_item_list` on category/subcategory pages | Fills out upper funnel; enables product list performance analysis | LOW | Fires with items array of visible products; item positions enable impression rank data |
| `select_item` on product card click | Tracks which product cards convert to product page visits | LOW | Fires on click before navigation; lightweight but useful for product merchandising |
| `view_cart` event on cart page load | Enables cart abandonment analysis; shows items in cart at abandonment point | LOW | Fires on /cart page with full cart contents |
| Consent mode region restriction (EEA only) | Defaults consent to denied only for EEA visitors; non-EEA users tracked without banner | MEDIUM | `region: ['BE', 'BG', 'CZ', ...]` in gtag consent default — not required but reduces friction for non-EU traffic |
| Persistent transaction ID for purchase deduplication | Prevents double-counting if user reloads /bevestiging confirmation page | MEDIUM | Generate UUID on checkout initiation, store in sessionStorage/localStorage, read on /bevestiging |
| Banner language in Dutch (nl-NL) | Dutch users expect Dutch interface; English banners feel foreign on a Dutch webshop | LOW | All consent copy must be Dutch: "Accepteer alles" / "Weiger alles" / "Mijn keuzes opslaan" |
| Clear cookie category explanations in banner | Dutch AP requires informed consent — users must know what they are accepting | LOW | One-sentence explanation: analytics cookies track site usage to improve the website |
| Re-consent trigger on privacy policy change | Users must be re-prompted when cookie purposes materially change | LOW | Version the consent in storage; bump version to force re-display |

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Google Tag Manager (GTM) instead of direct gtag | "Industry standard", flexible | GTM adds complexity, consent mode integration with `@next/third-parties` does not support GTM well in Next.js App Router; as of March 2025, `@next/third-parties` consent mode does not work with GTM | Direct `gtag.js` via `next/script` with manual consent implementation — simpler, fully controllable |
| Cookie consent library (CookieBot, OneTrust, CookieYes) | "Let a specialist handle GDPR" | SaaS consent platforms add external script dependencies, monthly costs (€10-50+/mo), and consent timing complexity; Dutch DPA rules are clear enough to implement directly | Custom banner with localStorage persistence — no external dependency, no ongoing cost, full control |
| Blocking GA4 script load entirely until consent | "Safest approach" | Prevents consent mode modeling; when script never loads, Google cannot send even anonymized cookieless pings that feed GA4's behavioral modeling | Load gtag.js on every page with `analytics_storage: 'denied'` default; update to `'granted'` on accept |
| Cookie wall ("consent or leave") | "Force acceptance for data" | Explicitly prohibited by Dutch AP; can result in fines up to €900,000 or 10% annual turnover | Functional site with optional analytics; no data collected from users who decline |
| Granular consent categories (analytics / marketing / social) | "More granular = more GDPR-safe" | Overkill for a site that only uses GA4 analytics; more categories = more complex banner = lower consent rate | Two-option banner: "Accepteer alles" / "Weiger alles" with analytics-only explanation |
| Purchase event on Shopify thank_you page | "Fire event where payment happened" | This is a Shopify-hosted page — no access to Shopify checkout.liquid without Shopify Plus; custom storefront cannot inject scripts there | Fire `purchase` event on /bevestiging with a pre-generated transaction ID stored before the Shopify redirect |
| Server-side GA4 tracking | "More reliable, bypasses adblockers" | Requires server-side tag container (Google Cloud, separate infrastructure), adds significant complexity and cost — not justified for this stage | Client-side GA4 with consent mode; acceptable data loss from adblockers at this traffic level |
| Real-time analytics dashboard | "See live traffic" | GA4 real-time view already exists in GA4 interface; custom dashboard adds no value at current scale | Use GA4's built-in reports and explore section |

---

## Feature Dependencies

```
Cookie Consent Banner
    └──required by──> GA4 Conditional Loading
                          └──required by──> All E-Commerce Events
                                                └──required by──> Purchase Attribution

GA4 Property Created (admin)
    └──required by──> GA4 Conditional Loading

Purchase Event
    └──requires──> Transaction ID Strategy
                       └──requires──> Pre-checkout UUID generation
                                          └──stored in──> localStorage/sessionStorage
                                                              └──read on──> /bevestiging page

view_item_list + select_item
    └──enhances──> view_item (upper funnel context)

view_cart
    └──enhances──> begin_checkout (abandonment analysis)

Consent Mode v2 (all 4 params)
    └──enhances──> Consent Mode basic (2 params)
    └──enables──> Google behavioral modeling for denied users
```

### Dependency Notes

- **Cookie consent banner is the prerequisite for everything:** GA4 cannot load in cookie-setting mode until consent is granted. The banner must exist and persist consent before any e-commerce event code is written.
- **Transaction ID strategy must be decided before purchase event:** The /bevestiging page is a Next.js page after redirect from Shopify; Shopify does not pass the order ID back to a custom storefront URL. A UUID must be generated at checkout initiation and survived through the Shopify redirect (localStorage survives cross-domain redirects).
- **GA4 property is an admin prerequisite:** A measurement ID (G-XXXXXXXXXX) must exist before any implementation. This is a Google Analytics admin step, not a code step.
- **`view_item_list` requires product list pages:** This event can only be added once the component that renders product lists exists (already exists in v1.4).
- **Consent mode v2 all-4-parameters setup must happen before gtag fires:** The `gtag('consent', 'default', {...})` call must run before the `<script src="gtag.js">` tag is evaluated. Next.js `next/script` with `strategy="afterInteractive"` and an inline script block that runs first handles this.

---

## MVP Definition

### Launch With (v1.5 milestone scope)

Minimum viable analytics and consent for a GDPR-compliant Dutch e-commerce site.

- [ ] **Cookie consent banner** — Dutch-language, "Accepteer alles" + "Weiger alles" equal prominence, persistent consent in localStorage, functional site without consent. Why essential: legal requirement; Dutch AP actively enforcing with fines.
- [ ] **GA4 conditional loading with Consent Mode v2** — gtag.js loads with all 4 parameters defaulted to `'denied'`; updates to `'granted'` when user accepts. Why essential: no analytics data lands without this, and loading without consent mode violates GDPR.
- [ ] **`view_item` event** — fires on product detail page load with item data. Why essential: top-of-funnel data; shows which products users browse.
- [ ] **`add_to_cart` event** — fires when user adds item to cart. Why essential: funnel gap analysis between browse and checkout.
- [ ] **`begin_checkout` event** — fires when user initiates checkout. Why essential: funnel gap analysis between cart and purchase; shows cart abandonment rate.
- [ ] **`purchase` event on /bevestiging** — fires with transaction_id (UUID from localStorage) and cart contents. Why essential: revenue attribution; without this the entire funnel has no endpoint.

### Add After Validation (v1.x)

Features to add once core tracking is live and producing data.

- [ ] **`view_item_list` on category/subcategory pages** — trigger: when GA4 reports show traffic to list pages but unclear click-through to products.
- [ ] **`select_item` on product card click** — trigger: when product merchandising decisions need data (which card position converts best).
- [ ] **`view_cart` on cart page** — trigger: when cart abandonment analysis becomes relevant (need baseline data first).
- [ ] **Consent re-prompt on policy change** — trigger: when cookie purposes change or privacy policy is updated materially.
- [ ] **Consent mode region restriction** — trigger: when non-EEA traffic is meaningful enough that banner friction matters.

### Future Consideration (v2+)

- [ ] **Server-side GA4** — defer: requires separate infrastructure, not justified until high traffic volumes where adblocker data loss is significant.
- [ ] **`add_payment_info` / `add_shipping_info`** — defer: these events require access to Shopify checkout steps, which is not possible without Shopify Plus checkout extensibility.
- [ ] **GA4 audiences for remarketing** — defer: requires `ad_storage: 'granted'`, which depends on user consent for advertising cookies; most Dutch users will decline.
- [ ] **Google Ads conversion tracking** — defer: separate from GA4 analytics; requires additional consent (`ad_user_data`, `ad_personalization`) and a Google Ads account.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Cookie consent banner | HIGH (legal) | MEDIUM | P1 |
| GA4 Consent Mode v2 loading | HIGH (legal + analytics foundation) | MEDIUM | P1 |
| `view_item` event | HIGH | LOW | P1 |
| `add_to_cart` event | HIGH | LOW | P1 |
| `begin_checkout` event | HIGH | LOW | P1 |
| `purchase` event + transaction ID | HIGH | HIGH | P1 |
| `view_item_list` event | MEDIUM | LOW | P2 |
| `select_item` event | MEDIUM | LOW | P2 |
| `view_cart` event | MEDIUM | LOW | P2 |
| Consent re-prompt on policy change | MEDIUM | LOW | P2 |
| Consent mode region restriction | LOW | MEDIUM | P3 |
| Server-side GA4 | LOW | HIGH | P3 |
| Google Ads conversion tracking | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Required for v1.5 launch — legal compliance and core funnel visibility
- P2: Add when funnel data reveals gaps — improves data quality
- P3: Future milestone — requires scale or additional infrastructure

---

## Dutch DPA Compliance Requirements (Autoriteit Persoonsgegevens)

These are not optional features — they are legal requirements for operating a Dutch e-commerce site with analytics.

| Requirement | Source | Implementation |
|-------------|--------|----------------|
| "Reject all" option on first banner layer (not buried in settings) | AP warning campaign April 2025; 50 organisations warned | "Weiger alles" button same prominence as "Accepteer alles" |
| Equal visual prominence for accept and reject | Austrian court 2025: colored accept + gray reject link = GDPR violation; Dutch AP follows same stance | Same button styling for both options |
| No pre-ticked consent boxes | GDPR Art. 7; Dutch ePrivacy Act | Default state is rejected; user action required to accept |
| No cookies before consent | AP actively enforcing | gtag must not fire until `analytics_storage: 'granted'` is set |
| Consent proof maintained | GDPR Art. 7(1) | Store consent timestamp and version in localStorage |
| Withdrawal as easy as granting | GDPR Art. 7(3) | Accessible settings link (footer) allows re-displaying banner |
| No cookie wall | Dutch AP explicit guidance | Site fully functional without accepting analytics |
| Consent expires (re-prompt after ~12 months) | GDPR recital 32; EDPB guidance | Store consent timestamp; compare on page load |
| Informed consent (clear explanation of what cookies do) | GDPR Art. 13; AP guidance | Banner must explain purpose: "Om uw websitebezoek te meten en te verbeteren" |

---

## Sources

- [Measure Ecommerce — Google for Developers](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce) — official GA4 event spec
- [GA4 Recommended Events — Google Analytics Help](https://support.google.com/analytics/answer/9267735) — full event catalogue
- [Set Up Consent Mode on Websites — Google Tag Platform](https://developers.google.com/tag-platform/security/guides/consent) — Consent Mode v2 parameters
- [GA4 Transaction ID Deduplication — Google Analytics Help](https://support.google.com/analytics/answer/12313109) — deduplication via transaction_id
- [Dutch DPA Cookie Banner Requirements — Autoriteit Persoonsgegevens](https://www.autoriteitpersoonsgegevens.nl/en/themes/internet-and-smart-devices/cookies/clear-cookie-banners) — official AP guidance
- [Dutch DPA Warns 50 Organisations — Nixon Digital](https://www.nixondigital.io/blog/dutch-dpa-cookie-compliance-warning/) — April 2025 enforcement actions
- [Cookie Banner Requirements Netherlands 2026 — CookieBanner.com](https://cookiebanner.com/blog/cookie-banner-requirements-by-country-eu-overview-2026/) — current EU requirements by country
- [GA4 Consent Mode v2 — Simo Ahava](https://www.simoahava.com/analytics/consent-mode-v2-google-tags/) — authoritative technical implementation guide
- [GDPR Cookie Banner in Next.js 15 — Medium/Frontend Weekly](https://medium.com/front-end-weekly/how-to-build-a-gdpr-cookie-banner-in-next-js-15-ga4-consent-mode-cloudfront-geo-detection-aae0961e89c5) — Next.js-specific implementation pattern
- [Next.js Cookie Consent (No Libraries) — Build With Matija](https://www.buildwithmatija.com/blog/build-cookie-consent-banner-nextjs-15-server-client) — custom implementation without SaaS dependency
- [GA4 Consent Mode Impact on Data — AnalyticsMates](https://www.analyticsmates.com/post/how-ga4-consent-mode-impacts-your-data-what-to-do-about-it) — what happens to data when consent is denied
- [Dutch DPA Intensifies Cookie Enforcement — Hogan Lovells](https://www.hoganlovells.com/en/publications/dutch-dpa-intensifies-cookie-enforcement-key-takeaways-) — enforcement escalation context
- [GA4 Purchase Event on Shopify — Hookflash](https://www.hookflash.co.uk/blog/ga4-tracking-with-shopify-checkout-extensibility) — Shopify-specific purchase tracking challenges

---

*Feature research for: GA4 e-commerce tracking and GDPR cookie consent — v1.5 Analytics & Privacy milestone*
*Researched: 2026-02-22*
*Focus: Table stakes compliance, funnel event coverage, Dutch DPA requirements, Next.js 15 implementation constraints*
