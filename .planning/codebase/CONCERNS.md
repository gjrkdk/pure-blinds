# Codebase Concerns

**Analysis Date:** 2026-02-01

## Tech Debt

**Hash collision vulnerability in cart item uniqueness:**
- Issue: `generateOptionsSignature()` uses a simple 32-bit integer hash function for uniqueness detection. While suitable for ~400 dimension combinations (20×20), this is not cryptographically secure and theoretically vulnerable to collisions.
- Files: `src/lib/cart/utils.ts`
- Impact: Two different dimension pairs could (rarely) hash to the same ID, causing cart items to incorrectly merge.
- Fix approach: Replace with deterministic JSON-based ID (`${productId}-${width}-${height}`) or use a more robust hash like SHA256.

**Console.error leaking sensitive GraphQL responses:**
- Issue: GraphQL errors including raw Shopify API responses are logged to console without sanitization.
- Files: `src/lib/shopify/draft-order.ts` (line 77)
- Impact: Client-side console exposes internal Shopify API structure and error details to end users.
- Fix approach: Log error ID to console for debugging, store full error server-side only.

**No input validation on checkout request:**
- Issue: `/api/checkout` only checks if items is non-empty array, but does not validate item structure (productId, priceInCents, options fields).
- Files: `src/app/api/checkout/route.ts`
- Impact: Malformed cart items could be sent to Shopify, causing runtime errors or unexpected behavior.
- Fix approach: Add Zod schema validation for CartItem array before passing to `createDraftOrder()`.

**Hardcoded EUR currency in Shopify draft order:**
- Issue: Draft orders always use "EUR" currency regardless of store configuration or user region.
- Files: `src/lib/shopify/draft-order.ts` (line 45)
- Impact: Customers in non-EUR regions see incorrect currency symbol; potential payment processing issues.
- Fix approach: Load currency from environment configuration or Shopify store settings.

## Known Bugs

**Cart-to-checkout test expects unimplemented behavior:**
- Symptoms: `cart-summary.test.tsx` expects cart to clear after successful checkout redirect, but current implementation clears cart before redirect (which may be lost if page unload race condition occurs).
- Files: `src/components/cart/cart-summary.test.tsx` (lines 52-54), `src/components/cart/cart-summary.tsx` (lines 44-45)
- Trigger: Run test suite; test will fail as implementation exists but timing is fragile.
- Workaround: Test documents this as RED phase expecting implementation. Current code clears cart correctly but comment notes this is intentional.

**Dialog backdrop click handler may not close on all browsers:**
- Symptoms: Clicking outside remove dialog may not trigger onCancel on browsers with different dialog implementations.
- Files: `src/components/cart/remove-dialog.tsx` (lines 31-44)
- Trigger: Click outside dialog on Firefox or Safari with non-standard dialog element support.
- Workaround: Add `onEsc` handler or use `<Escape>` keyboard event as fallback.

## Security Considerations

**API keys and tokens in environment variables without rotation policy:**
- Risk: SHOPIFY_ADMIN_ACCESS_TOKEN has no documented rotation schedule; leaked token gives full admin access.
- Files: `src/lib/env.ts`, `src/lib/shopify/client.ts`
- Current mitigation: Token stored in `.env.local` (not committed), requires manual rotation.
- Recommendations: Implement token rotation schedule (quarterly), add audit logging for API calls, consider using Shopify access scope constraints, use read-only scopes for non-admin operations.

**Cart data persisted in localStorage without encryption:**
- Risk: Price and product information stored in plaintext localStorage; user could manipulate priceInCents before checkout.
- Files: `src/lib/cart/store.ts`
- Current mitigation: Server-side validation in `/api/pricing` prevents custom prices from being charged; Shopify uses custom pricing on draft order creation.
- Recommendations: Add integrity check (HMAC) to localStorage data, or remove priceInCents from localStorage and always fetch from server.

**No CSRF protection on checkout endpoint:**
- Risk: `/api/checkout` POST accepts requests without verifying origin or session token.
- Files: `src/app/api/checkout/route.ts`
- Current mitigation: None; relies on same-origin policy.
- Recommendations: Add SameSite cookie policy (automatic in Next.js 13+), consider adding CSRF token verification if needed.

**GraphQL error logging exposes API structure:**
- Risk: Console logs in `draft-order.ts` expose Shopify GraphQL schema and field names to end users.
- Files: `src/lib/shopify/draft-order.ts` (line 77)
- Current mitigation: Errors only visible in browser console.
- Recommendations: Sanitize errors before logging; return generic error to client.

## Performance Bottlenecks

**Debounce window is 400ms causing user friction:**
- Problem: Price calculation delay of 400ms between typing dimensions and price display feels sluggish.
- Files: `src/components/dimension-configurator.tsx` (line 22)
- Cause: useDebounce(400) intended to prevent excessive API calls, but creates noticeable UX lag.
- Improvement path: Reduce to 200-250ms, or add optimistic UI (show calculating price immediately while debouncing server call).

**Unused fetch abort cleanup pattern:**
- Problem: useEffect cleanup sets `ignore = true` to prevent state updates, but doesn't actually abort the fetch request.
- Files: `src/components/dimension-configurator.tsx` (lines 69, 146-148)
- Cause: Old component still makes network requests even after unmount, wasting bandwidth.
- Improvement path: Implement AbortController to cancel in-flight requests.

**No pagination or lazy loading on cart page:**
- Problem: Cart renders all items at once; scales poorly if user adds 100+ items.
- Files: `src/app/cart/page.tsx` (lines 73-76)
- Cause: Simple `.map()` over all items with no virtualization.
- Improvement path: Implement windowed list virtualization if cart sizes exceed 50 items.

**Pricing calculation done on every keystroke in debounced window:**
- Problem: Each keystroke triggers API call even if value hasn't changed enough to normalize to new price.
- Files: `src/components/dimension-configurator.tsx` (lines 68-149)
- Cause: No memoization of normalized dimensions.
- Improvement path: Memoize `normalizeDimension()` output and only call API if normalized value changes.

## Fragile Areas

**Zustand store localStorage serialization:**
- Files: `src/lib/cart/store.ts` (lines 41-75)
- Why fragile: Custom TTL storage wrapper manually parses JSON twice (`JSON.parse()` inside getItem, then again by Zustand). Any corruption in stored data silently clears cart without error logging.
- Safe modification: Add try/catch with specific error logging around JSON.parse on line 47; don't silently removeItem.
- Test coverage: No unit tests for storageWithTTL behavior; TTL expiration untested.

**Dimension normalization math must match between client and server:**
- Files: `src/lib/pricing/calculator.ts` (lines 16-18, 24-26), `src/components/dimension-configurator.tsx` (lines 73-74)
- Why fragile: Client normalizes dimensions before API call, but if normalization logic diverges between files, prices mismatch.
- Safe modification: Share `normalizeDimension()` function as import, don't duplicate.
- Test coverage: No tests comparing client-side normalization to server-side.

**Dialog element ref could be null during render:**
- Files: `src/components/cart/remove-dialog.tsx` (lines 20-29)
- Why fragile: Code checks `if (!dialog) return`, but doesn't handle race where `isOpen` changes between render and effect execution.
- Safe modification: Add cleanup function to close dialog on unmount.
- Test coverage: No tests for dialog open/close state transitions.

**Catch-all error handlers swallow meaningful context:**
- Files: `src/app/api/checkout/route.ts` (lines 19-25), `src/lib/shopify/draft-order.ts` (lines 74-82)
- Why fragile: Generic "Unable to process checkout" error masks real issues (rate limit, network timeout, Shopify validation failure).
- Safe modification: Log full error server-side with unique error ID, return that ID to client for support reference.
- Test coverage: No tests for error path behavior.

## Scaling Limits

**Pricing matrix is hardcoded 20×20 (400 combinations) in JSON:**
- Current capacity: Supports 10-200cm in 10cm increments for both dimensions.
- Limit: Expanding range to 5cm increments would require 40×40 matrix; current architecture scales linearly with matrix size.
- Scaling path: Move pricing to database with computed grid lookup instead of static file; or generate matrix dynamically.
- Files: `data/pricing-matrix.json`

**Cart state persists indefinitely (with 7-day TTL) without pagination:**
- Current capacity: ~1000 items before localStorage approaches 5-10MB limits on most browsers.
- Limit: Very active users could hit localStorage quota on mobile (often 2-5MB).
- Scaling path: Implement server-side session cart storage; use localStorage only for cart ID reference.
- Files: `src/lib/cart/store.ts`

**Shopify draft order creation not batched:**
- Current capacity: One draft order per checkout; no bulk operations.
- Limit: If future feature adds batch ordering, current implementation scales O(n) with request count.
- Scaling path: Implement bulk draft order creation if Shopify API supports it.
- Files: `src/lib/shopify/draft-order.ts`

## Dependencies at Risk

**@shopify/shopify-api@^12.3.0 - Major version pinning:**
- Risk: Uses caret (^) range; next minor upgrade could introduce breaking changes.
- Impact: Upgrade to 13.0.0+ would require code changes to GraphQL client usage.
- Migration plan: Test minor/patch upgrades quarterly; pin to exact version if stability is critical.

**use-debounce@^10.1.0 - Unused dependency for complex debouncing:**
- Risk: Library is unmaintained since 2024; custom debounce would be ~10 lines of code.
- Impact: No active bug fixes; could have React 20 compatibility issues if released.
- Migration plan: Implement custom `useDebounce()` hook to eliminate dependency; copy from React docs.

**Zustand persist middleware version lock:**
- Risk: Zustand middleware API changed significantly between v4 and v5; current code uses v5 API.
- Impact: Downgrade to v4 would require rewriting store middleware.
- Migration plan: Lock to exact version (remove ^); test against planned Zustand versions.

## Missing Critical Features

**No inventory/stock checking:**
- Problem: Cart allows unlimited quantity (max 999); no check against Shopify product stock.
- Blocks: User could add 999 items, proceed to checkout, then fail at Shopify stage.
- Priority: Medium (impacts UX on high-demand products).

**No order confirmation or receipt handling:**
- Problem: After checkout redirect to Shopify, user is redirected away; no confirmation page on this site.
- Blocks: User can't verify order was placed; no email receipt integration.
- Priority: Low (Shopify handles this, but UX could be better).

**No analytics or purchase tracking:**
- Problem: Zero visibility into conversion funnel; can't measure where users drop off.
- Blocks: Can't optimize pricing or cart flow.
- Priority: Low (future business insight, not blocking sales).

## Test Coverage Gaps

**No API endpoint tests:**
- What's not tested: `/api/pricing`, `/api/checkout`, `/api/health` endpoint behavior, error cases, validation failures.
- Files: `src/app/api/*`
- Risk: Breaking changes in API signature go undetected until production.
- Priority: High (API contracts are critical).

**No pricing calculator unit tests:**
- What's not tested: `normalizeDimension()`, `dimensionToIndex()`, `calculatePrice()` edge cases (boundary values, out-of-bounds), `formatPrice()` formatting.
- Files: `src/lib/pricing/calculator.ts`
- Risk: Pricing logic bugs go undetected; out-of-bounds dimensions throw confusing errors.
- Priority: High (pricing correctness is business-critical).

**No cart store state machine tests:**
- What's not tested: `addItem()` deduplication logic, `updateQuantity()` bounds enforcement, `clearCart()`, TTL expiration behavior.
- Files: `src/lib/cart/store.ts`
- Risk: Store state mutations could silently corrupt cart data.
- Priority: High (cart is core feature).

**No integration tests for checkout flow:**
- What's not tested: Full flow from dimension input → pricing → add to cart → checkout → Shopify redirect.
- Files: Multiple files involved in flow.
- Risk: Changes to one component could break the end-to-end flow undetected.
- Priority: Medium (single component test exists but full flow untested).

**No E2E tests:**
- What's not tested: Real browser behavior, hydration mismatches, localStorage persistence across page reloads, dialog interactions, quantity input edge cases.
- Risk: SSR/hydration bugs go undetected; UI interactions untested.
- Priority: Medium (vitest + jsdom have coverage, but no Playwright/Cypress tests).

---

*Concerns audit: 2026-02-01*
