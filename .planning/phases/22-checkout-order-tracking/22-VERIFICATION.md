---
phase: 22-checkout-order-tracking
verified: 2026-02-19T18:30:00Z
status: gaps_found
score: 3/4 success criteria verified
re_verification: false
gaps:
  - truth: "Cart is cleared only when the confirmation page receives a confirmed Shopify order ID (purchase completion signal)"
    status: partial
    reason: "cart-summary.tsx clears the cart when the Draft Order invoice URL is returned (checkout initiation), before the customer completes payment on Shopify. The confirmation page (ClearCartOnMount) also clears on verified order_id, but the cart is already empty by then. The ROADMAP success criterion that cart clears ONLY on the confirmation page with a confirmed order ID is not met."
    artifacts:
      - path: "src/components/cart/cart-summary.tsx"
        issue: "Line 42: useCartStore.getState().clearCart() is called immediately when Shopify returns an invoiceUrl, before the customer pays. This is checkout initiation, not purchase completion."
    missing:
      - "Remove the premature clearCart() call from cart-summary.tsx handleCheckout, or document this as an intentional design deviation from the ROADMAP success criterion"
human_verification:
  - test: "Complete a full purchase flow end-to-end"
    expected: "Cart clears on /bevestiging after Shopify confirms the order, not when the checkout redirect begins"
    why_human: "Cannot verify cart clearing timing without a real Shopify payment session"
  - test: "Visit /bevestiging without ?order_id= in the URL"
    expected: "Browser silently redirects to homepage, cart remains intact"
    why_human: "Server-side redirect with Next.js redirect() — browser behavior confirmation needed"
  - test: "Draft Order created with a sample in cart — check Shopify admin"
    expected: "Draft Order carries the kleurstaal tag visible in Shopify admin order list"
    why_human: "Shopify admin tag visibility requires a real API call to a Shopify store"
---

# Phase 22: Checkout & Order Tracking Verification Report

**Phase Goal:** Customers see the VAT-inclusive price before checkout, cart state survives browser navigation after purchase, and sample orders are tagged in Shopify for operations
**Verified:** 2026-02-19T18:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Product configurator displays calculated price with "Incl. 21% BTW" label | VERIFIED | `src/components/dimension-configurator.tsx` line 282: `<span className="text-base font-normal text-muted ml-1">incl. 21% BTW</span>` inline after `formatPrice(price)` |
| 2 | Visiting `/bevestiging` without a valid order query parameter does not clear the cart | VERIFIED | `src/app/bevestiging/page.tsx` lines 27-29: `if (!order_id || order_id.trim() === '') { redirect('/'); }` — ClearCartOnMount is never mounted |
| 3 | Cart is cleared only when the confirmation page receives a confirmed Shopify order ID | FAILED | `src/components/cart/cart-summary.tsx` line 42 calls `clearCart()` when the Draft Order invoice URL is returned — before the customer completes payment. Cart may be empty before `/bevestiging` is ever reached. |
| 4 | Draft Orders containing at least one sample carry the `kleurstaal` tag in Shopify admin | VERIFIED | `src/lib/shopify/draft-order.ts` line 37: `const hasSamples = items.some(item => item.type === "sample")` and line 43: `...(hasSamples && { tags: ["kleurstaal"] })` spread into DraftOrderInput |

**Score:** 3/4 success criteria verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/api/verify-order/route.ts` | Shopify order verification GET endpoint | VERIFIED | 45 lines, substantive implementation: GID normalisation, GraphQL node lookup, try-catch safe default returning `{ valid: false }` |
| `src/components/cart/clear-cart-on-mount.tsx` | Smart cart clearing with order verification | VERIFIED | 41 lines, accepts `orderId` prop, calls `/api/verify-order` before clearing, safe defaults on error |
| `src/components/dimension-configurator.tsx` | VAT-inclusive price display | VERIFIED | Contains `incl. 21% BTW` at line 282, inline `<span>` with muted styling after price amount |
| `src/components/cart/cart-item.tsx` | Cart line item VAT label | VERIFIED | Line 69: `{formatPrice(item.priceInCents)}{!isSample && " per stuk"} incl. BTW` |
| `src/components/cart/cart-summary.tsx` | Cart total VAT label | VERIFIED (label only) | Line 81: `<span className="text-xs font-normal text-muted ml-1">incl. BTW</span>` — BUT also contains premature `clearCart()` at line 42 |
| `src/lib/shopify/draft-order.ts` | Conditional kleurstaal tagging | VERIFIED | `hasSamples` detection at line 37; conditional `tags: ["kleurstaal"]` spread at line 43 |
| `src/app/bevestiging/page.tsx` | Redirect guard and orderId prop passing | VERIFIED | Lines 27-29: redirect guard; line 33: `<ClearCartOnMount orderId={order_id} />` |
| `src/app/winkelwagen/page.tsx` | Empty cart Dutch copy with homepage CTA | VERIFIED | Line 53: "Je winkelwagen is leeg"; line 55: `href="/"` with "Terug naar de winkel" text |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/components/cart/clear-cart-on-mount.tsx` | `src/app/api/verify-order/route.ts` | `fetch('/api/verify-order?order_id=...')` | WIRED | Line 21: `fetch('/api/verify-order?order_id=${encodeURIComponent(orderId)}')` — response is consumed and `data.valid` checked before calling `clearCart()` |
| `src/app/bevestiging/page.tsx` | `src/components/cart/clear-cart-on-mount.tsx` | `orderId={order_id}` prop | WIRED | Line 4: import present; line 33: `<ClearCartOnMount orderId={order_id} />` passes the URL param as prop |
| `src/lib/shopify/draft-order.ts` | Shopify GraphQL `draftOrderCreate` mutation | `tags` field in `DraftOrderInput` | WIRED | `...(hasSamples && { tags: ["kleurstaal"] })` spread directly inside the `input:` object passed to the mutation variables |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| CHKOUT-01 | 22-01-PLAN.md | Product page displays price with "Incl. 21% BTW" label | SATISFIED | `incl. 21% BTW` in dimension-configurator.tsx; `incl. BTW` in cart-item.tsx and cart-summary.tsx |
| CHKOUT-02 | 22-01-PLAN.md | Cart clears only after confirmed purchase completion, not on every confirmation page visit | PARTIAL | The `/bevestiging` guard is implemented correctly — visiting without `order_id` does NOT clear cart. However, `cart-summary.tsx` clears the cart on checkout initiation (Draft Order creation), before payment is completed. Whether CHKOUT-02 is "satisfied" depends on interpretation: the confirmation page no longer clears unconditionally, but the cart may already be empty before reaching it. |
| TRACK-01 | 22-02-PLAN.md | Draft Orders containing sample items receive `kleurstaal` tag in Shopify | SATISFIED | Conditional tag spread in `draft-order.ts`; `item.type === "sample"` matches `CartItem.type` definition in `src/lib/cart/types.ts` |

No orphaned requirements found — all 3 requirement IDs (CHKOUT-01, CHKOUT-02, TRACK-01) appear in plan frontmatter and are covered by implementation.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/cart/clear-cart-on-mount.tsx` | 40 | `return null` | Info | Intentional — headless component with no UI output, correct React pattern |
| `src/components/cart/cart-summary.tsx` | 22 | `return null` | Info | Intentional — SSR hydration guard pattern |
| `src/components/cart/cart-summary.tsx` | 42 | `clearCart()` called pre-payment | Warning | Cart is cleared when invoice URL is returned, before the customer pays on Shopify. This is a design inconsistency with the ROADMAP success criterion. Not a code bug — it was pre-existing behaviour that the plan did not remove. |

No TODO/FIXME/HACK markers found in any phase files. No empty implementations. No console.log-only handlers.

### Human Verification Required

#### 1. End-to-end purchase flow cart clearing timing

**Test:** Add an item to cart, proceed to checkout ("Afrekenen"), observe when the cart empties — before or after completing payment on Shopify
**Expected per ROADMAP:** Cart empties only after the customer completes payment and lands on `/bevestiging?order_id=XXX` with a valid verified order
**Actual behaviour:** Cart empties in `handleCheckout` when the Draft Order invoice URL is returned (before redirect to Shopify). The `ClearCartOnMount` on `/bevestiging` provides a second clear, but the cart is already empty.
**Why human:** Requires an active Shopify test store and payment session to verify timing

#### 2. Confirm /bevestiging redirect in browser

**Test:** Visit `/bevestiging` directly in a browser (without `?order_id=`)
**Expected:** Silent redirect to `/` homepage with cart contents preserved
**Why human:** Server-side `redirect()` behaviour is confirmed in code but the browser UX (e.g. back-button behaviour, no flash of confirmation page) needs human confirmation

#### 3. Shopify admin: kleurstaal tag visibility

**Test:** Place an order with at least one sample item in the cart, then inspect the resulting Draft Order in Shopify admin
**Expected:** Draft Order shows `kleurstaal` tag on the order detail page and is filterable by that tag
**Why human:** Requires a connected Shopify store; cannot verify GraphQL response or admin UI appearance programmatically

### Gaps Summary

**One gap identified:** The ROADMAP success criterion "Cart is cleared only when the confirmation page receives a confirmed Shopify order ID" is not precisely met.

The root cause is that `src/components/cart/cart-summary.tsx` retains its pre-phase-22 behaviour of calling `clearCart()` when `handleCheckout` receives a successful invoice URL from the Shopify API (line 42). This happens before the customer pays — the cart empties when the Draft Order is created, not when the purchase is confirmed.

The Phase 22 plan (22-01) correctly addressed the `/bevestiging` side of the problem (guard against unconditional clearing on page visit), but did not update `cart-summary.tsx` to remove the pre-emptive clear. The REQUIREMENTS.md text for CHKOUT-02 ("not on every confirmation page visit") is satisfied, but the stricter ROADMAP success criterion language is not.

This gap may be an intentional design choice (clearing on checkout initiation is a common e-commerce pattern) or an oversight. The correct resolution is to either:
1. Remove the `clearCart()` call from `cart-summary.tsx` and rely solely on `ClearCartOnMount` for clearing (fully satisfies ROADMAP), or
2. Explicitly document this as intentional and update the ROADMAP success criterion to match the actual design

The `/bevestiging` protection (SC2) and the kleurstaal tagging (SC4) are fully working. VAT labels (SC1) are fully present across all three price display locations.

---

_Verified: 2026-02-19T18:30:00Z_
_Verifier: Claude (gsd-verifier)_
