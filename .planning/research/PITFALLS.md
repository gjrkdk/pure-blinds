# Pitfalls Research

**Domain:** Custom-Dimension E-commerce with Shopify
**Researched:** 2026-01-29
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Price Manipulation via Frontend Cart State

**What goes wrong:**
Customers can manipulate calculated prices by modifying frontend cart state, sending custom API requests, or using browser developer tools to alter pricing data before checkout. This allows purchasing custom-dimension products at fraudulent prices (e.g., $0.01 for a 500cm x 500cm textile).

**Why it happens:**
Developers trust the frontend-calculated price and pass it directly to Shopify Draft Orders without server-side validation. The pricing matrix lives on the frontend, making it inspectable and exploitable.

**How to avoid:**
- **NEVER** accept price from frontend - always recalculate on backend
- Store pricing matrix on server (even if it's JSON in v1)
- Backend must independently calculate: `price = matrix[roundedWidth][roundedHeight] * quantity`
- Validate dimensions against min/max bounds server-side
- Log price calculation inputs/outputs for fraud detection
- Add cryptographic signature to cart items (HMAC of dimensions + timestamp) that backend verifies

**Warning signs:**
- Orders with unusual dimension/price ratios
- Multiple orders from same customer at suspiciously low prices
- Cart items with prices that don't match matrix lookup
- Missing or invalid cart signatures

**Phase to address:**
Phase 1 (Core Pricing) - Backend validation must be built from day one, not retrofitted

---

### Pitfall 2: Floating-Point Arithmetic Causing Penny Discrepancies

**What goes wrong:**
Using floating-point numbers for price calculations creates rounding errors. Example: `0.1 + 0.2 = 0.30000000000000004`. In one real case, 389 transactions were off by $0.01 due to floating-point conversion. With dimension-based pricing and rounding, these errors compound quickly.

**Why it happens:**
JavaScript/TypeScript defaults to IEEE 754 floating-point. Developers write `price = basePrice * 1.21` (VAT) without realizing 0.1 can't be represented exactly in binary. Matrix lookups return floats, multiplication introduces error, rounding doesn't fix underlying precision loss.

**How to avoid:**
- **Store all prices in cents (integers)**: $12.34 = 1234 cents
- Pricing matrix should contain integers (cents), not floats
- All calculations use integer arithmetic: `(price * 121) / 100` for 21% VAT
- Use libraries for decimal precision if floats unavoidable (Decimal.js, Big.js)
- Final rounding: `Math.round(priceInCents)` only at display time
- Test edge cases: `3.6% of $3.75 = 0.135` → should round to $0.14, not $0.13

**Warning signs:**
- Customer complaints about "wrong total" (off by 1-2 cents)
- Prices ending in .99 or .01 unexpectedly
- Unit tests failing on exact price matching
- Discrepancies between cart total and Shopify Draft Order total

**Phase to address:**
Phase 1 (Core Pricing) - Foundation must use integers; refactoring later is painful and risky

---

### Pitfall 3: Draft Order Auto-Deletion After 1 Year

**What goes wrong:**
Draft orders created on/after April 1, 2025 are automatically deleted after 1 year of inactivity. For B2B custom textile orders (quotes, bulk orders), customers may revisit quotes months later to find them gone. Loses sales and damages trust.

**Why it happens:**
Shopify changed policy in 2025. Developers assume draft orders persist indefinitely (pre-2025 behavior). No reminder system for expiring quotes. Business treats draft orders as permanent quotes.

**How to avoid:**
- Track draft order creation date in own database
- Implement expiration warning system (email at 11 months, 11.5 months)
- Any edit resets the timer - automate monthly "touch" if needed
- For long-term quotes: Store quote data independently, recreate draft order when customer returns
- Set business expectation: Quotes valid 90 days, not indefinitely
- Use draft order metadata to track: `{quote_expires: "2026-12-31"}`

**Warning signs:**
- Customer reports "quote disappeared"
- Draft order count decreasing without conversions
- Old draft orders (9+ months) with no activity
- No automated quote follow-up system

**Phase to address:**
Phase 2 (Draft Order Integration) - Build expiration tracking when draft order creation is implemented

---

### Pitfall 4: Inventory Race Condition (Reserved ≠ Removed)

**What goes wrong:**
Draft order "Reserve Items" doesn't actually remove items from inventory count. Customers see product as available on store, add to cart, proceed to checkout, then get "sold out" error. Creates terrible UX and lost sales.

Specific scenario: Create draft order for 50m custom textile → Reserve items → Website still shows 50m available → Another customer tries to buy 50m → Checkout fails.

**Why it happens:**
Shopify's "Reserve" puts items in "Unavailable" state but doesn't decrement inventory count visible to storefront. This is by design for B2B/wholesale workflows but breaks B2C custom product flows.

**How to avoid:**
**For v1 (No inventory tracking):**
- Set products to "Continue selling when out of stock"
- Don't rely on Shopify inventory for custom-dimension products
- Each order is made-to-order anyway (no physical stock)

**For v2+ (If tracking raw material):**
- Use separate SKUs for draft orders vs. live sales
- Implement own inventory tracking in database
- Use Shopify inventory webhooks to synchronize
- Third-party app like "Draft Order Helper" for automatic deduction
- Add warning in draft order flow: "This quote reserves product but inventory remains visible"

**Warning signs:**
- Customers complaining about "false availability"
- Checkout errors for products shown as in-stock
- Multiple draft orders for same limited inventory
- Inventory discrepancies between Shopify and reality

**Phase to address:**
v1: Phase 1 (Document limitation in quote flow)
v2+: Later milestone if inventory tracking becomes requirement

---

### Pitfall 5: Dimension Rounding Edge Cases Creating Price Jumps

**What goes wrong:**
Rounding "up to nearest 10cm" creates pricing cliffs: 190cm → 190cm ($X) but 191cm → 200cm ($Y, potentially much higher). Customer enters 191cm, shocked by price jump. Worse: Developers implement inconsistent rounding (backend rounds differently than frontend).

Example with 20x20 matrix:
- Frontend: `Math.ceil(191 / 10) * 10 = 200`
- Backend: `Math.round(191 / 10) * 10 = 190`
- Result: Price mismatch, cart shows $50, backend calculates $60

**Why it happens:**
- `Math.ceil()` vs `Math.round()` vs custom logic
- Rounding before vs after multiplying quantity
- Off-by-one errors at exact boundaries (200cm → 200 or 210?)
- No validation that frontend/backend use identical rounding

**How to avoid:**
- **Single source of truth**: Extract rounding to shared function
- Use consistent algorithm: `Math.ceil(dimension / 10) * 10`
- Test boundary cases explicitly:
  - `190cm → 190cm ✓`
  - `191cm → 200cm ✓`
  - `200cm → 200cm ✓` (not 210!)
  - `201cm → 210cm ✓`
- Validate backend result matches frontend preview: `expectedPrice` param in API
- Show customer the rounded dimensions: "You entered 191cm, price calculated for 200cm"
- Add test suite for rounding: 0, 1, 9, 10, 11, 19, 20, 190, 191, 199, 200, 201

**Warning signs:**
- Customer complaints about "price changed at checkout"
- Cart preview price ≠ Draft Order price
- Unit tests passing individually but integration tests failing
- Rounding logic duplicated in multiple files

**Phase to address:**
Phase 1 (Core Pricing) - Shared rounding utility from day one; extract to `@/lib/rounding.ts`

---

### Pitfall 6: Shopify API Rate Limits Causing Checkout Failures

**What goes wrong:**
During high traffic (sale day, marketing campaign), multiple customers create draft orders simultaneously. App hits Shopify rate limits (REST: 2 req/sec, GraphQL: 50 points/sec). Draft order creation fails with 429 errors. Customers see "Checkout unavailable" and abandon cart.

**Why it happens:**
- No rate limit handling in API client
- Synchronous draft order creation (blocks until complete)
- No request queuing or retry logic
- Using REST instead of GraphQL (REST more limited)
- Making unnecessary API calls (fetching product details per request)

**How to avoid:**
- **Use GraphQL Admin API** for draft orders (better rate limits)
- Implement exponential backoff for 429 responses:
  ```typescript
  if (response.status === 429) {
    await sleep(Math.pow(2, retryCount) * 1000);
    retry();
  }
  ```
- Queue draft order creation (Redis/BullMQ) for async processing
- Cache Shopify product data (avoid repeated fetches)
- Monitor rate limit headers: `X-Shopify-Shop-Api-Call-Limit: 32/40`
- Load test before launch: Simulate 10 concurrent checkouts
- Show user "Processing your order..." during queue wait

**Warning signs:**
- 429 errors in logs
- Checkout completion rate drops during traffic spikes
- API call count approaching 40/min (REST) or 1000 points/min (GraphQL)
- Customers reporting "something went wrong" at checkout

**Phase to address:**
Phase 2 (Draft Order Integration) - Build rate limiting into API client from start

---

### Pitfall 7: Webhook Duplicate Events Causing Double Processing

**What goes wrong:**
Shopify sends duplicate webhooks (same event, same `X-Shopify-Webhook-Id`). Without idempotency checks, app processes draft order completion twice: sends 2 confirmation emails, creates 2 database records, triggers 2 inventory deductions.

**Why it happens:**
- Webhook retries if response is slow (>5 sec)
- Network timeouts causing Shopify to resend
- No idempotency key checking in webhook handler
- Processing before acknowledging (should be async)

**How to avoid:**
- **Always check `X-Shopify-Webhook-Id` header**:
  ```typescript
  const webhookId = req.headers['x-shopify-webhook-id'];
  if (await db.processedWebhooks.exists(webhookId)) {
    return res.status(200).send('Already processed');
  }
  ```
- Create `processed_webhooks` table with unique constraint on `webhook_id`
- Acknowledge immediately (200 response), process asynchronously:
  ```typescript
  res.status(200).send('OK');
  queue.add('process-webhook', { webhookId, payload });
  ```
- Respond within 5 seconds to avoid retries
- Implement reconciliation job: Compare Shopify orders vs. local database daily

**Warning signs:**
- Duplicate confirmation emails
- Database constraint violations on webhook ID
- Orders appearing twice in admin
- Customer complaints: "I got charged twice" (if webhook triggers payment)
- Webhook delivery success rate <100%

**Phase to address:**
Phase 3 (Webhooks & Order Management) - Build idempotency before any webhook goes live

---

### Pitfall 8: Tight Coupling to Shopify Preventing Reusability

**What goes wrong:**
Pricing engine directly imports Shopify SDK, uses Shopify-specific types, calls Shopify APIs inline. When building Shopify app (v2), must rewrite entire pricing engine because it's tightly coupled to custom BFF. Can't test pricing without Shopify API access.

Example of tight coupling:
```typescript
// Bad: Pricing logic mixed with Shopify
function calculatePrice(width: number, height: number) {
  const product = await shopify.products.get(PRODUCT_ID); // Shopify call
  const matrix = parseShopifyMetafield(product.metafields); // Shopify type
  return matrix[width][height];
}
```

**Why it happens:**
- Fast MVP pressure leads to "just get it working"
- No clear separation between pricing logic and Shopify integration
- Pricing functions directly access Shopify data
- No interface/contract defining pricing engine boundaries

**How to avoid:**
- **Extract pricing to pure functions** (no Shopify dependencies):
  ```typescript
  // Good: Pure pricing logic
  function calculatePrice(
    width: number,
    height: number,
    matrix: PriceMatrix
  ): number {
    const roundedWidth = roundDimension(width);
    const roundedHeight = roundDimension(height);
    return matrix[roundedWidth][roundedHeight];
  }
  ```
- Pricing engine interface:
  ```typescript
  interface PricingEngine {
    loadMatrix(source: string): PriceMatrix;
    calculatePrice(dimensions: Dimensions): PriceResult;
    validateDimensions(dimensions: Dimensions): ValidationResult;
  }
  ```
- Shopify adapter wraps pricing engine:
  ```typescript
  class ShopifyPricingAdapter {
    constructor(private engine: PricingEngine) {}
    async createDraftOrder(cart: Cart) {
      const price = this.engine.calculatePrice(cart.dimensions);
      return shopify.draftOrders.create({ price });
    }
  }
  ```
- Pricing engine tests use fixtures (no Shopify API)
- Store matrix in JSON file, not Shopify metafields (v1)

**Warning signs:**
- Can't run pricing tests without Shopify dev store
- Pricing functions have `shopify` in import statements
- Mock hell: 10+ Shopify mocks per test
- "We can't reuse this for [other platform]" conversations
- Pricing logic scattered across route handlers

**Phase to address:**
Phase 1 (Core Pricing) - Architecture decision, must be pure from start

---

### Pitfall 9: Missing Dimension Bounds Allowing Out-of-Matrix Lookups

**What goes wrong:**
Customer enters width=999cm, height=999cm. Matrix is 20x20 (max 200cm x 200cm). Code attempts `matrix[999][999]`, returns `undefined`, displays "Price: $NaN" or crashes. Even worse: Fallback to $0, customer checks out for free.

**Why it happens:**
- No input validation before matrix lookup
- Assuming frontend validation is sufficient (it's not - API bypass)
- Matrix bounds not explicitly defined/enforced
- No "maximum dimension" UX messaging

**How to avoid:**
- **Define explicit bounds** in config:
  ```typescript
  const DIMENSION_LIMITS = {
    minWidth: 10,
    maxWidth: 200,
    minHeight: 10,
    maxHeight: 200,
    step: 10
  };
  ```
- Validate before any calculation:
  ```typescript
  function validateDimensions(width: number, height: number) {
    if (width < LIMITS.minWidth || width > LIMITS.maxWidth) {
      throw new Error(`Width must be ${LIMITS.minWidth}-${LIMITS.maxWidth}cm`);
    }
    // Same for height
    if (width <= 0 || height <= 0) {
      throw new Error('Dimensions must be positive');
    }
  }
  ```
- Test boundary cases: 0, -1, 9, 10, 200, 201, 9999, null, undefined, "abc"
- Frontend: Disable checkout if dimensions invalid
- Backend: Reject API request with 400 if dimensions invalid
- Never return `undefined` from pricing - throw clear error instead

**Warning signs:**
- `$NaN` in logs or customer screenshots
- Orders with impossible dimensions in database
- No input validation in API endpoint
- Matrix lookup without bounds checking
- Error: "Cannot read property '999' of undefined"

**Phase to address:**
Phase 1 (Core Pricing) - Input validation is security, not nice-to-have

---

### Pitfall 10: Cart State Synchronization Issues Across Tabs/Devices

**What goes wrong:**
Customer has cart open in 2 browser tabs. Adds 100cm x 100cm item in Tab A, adds 150cm x 150cm in Tab B. localStorage sync fails. Tab A shows 1 item, Tab B shows 1 item, but they're different. Customer checks out from Tab A, wrong item purchased.

Even worse: Customer starts on mobile (adds item), continues on desktop (empty cart because localStorage isn't synced).

**Why it happens:**
- Cart state only in localStorage (not synced)
- No Storage event listener for cross-tab sync
- localStorage is per-device (mobile vs. desktop = different carts)
- No server-side cart persistence

**How to avoid:**
**For v1 (localStorage cart):**
- Listen to Storage events for cross-tab sync:
  ```typescript
  window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
      updateCartUI(JSON.parse(e.newValue));
    }
  });
  ```
- Display warning: "Cart is device-specific. Complete checkout on this device."
- Session-based cart expiry (clear after 24h)

**For v2 (Server-persisted cart):**
- Store cart in database with session ID
- Sync cart to server on every change
- Load cart from server on page load
- Handle conflicts: "Cart updated on another device. Reload?"

**Avoid:**
- Multiple cookies (creates sync nightmares, race conditions)
- Relying solely on localStorage for multi-session UX

**Warning signs:**
- Customer complaints: "My cart is empty" or "Wrong item in cart"
- Cart item count differs across tabs
- No Storage event handler in code
- Cart state in multiple places (Redux + localStorage + URL params)

**Phase to address:**
v1: Phase 1 (Document limitation: single-device cart)
v2: Later milestone if multi-device requirement emerges

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Frontend-only price calculation | Faster MVP, no backend needed | Price manipulation vulnerability, impossible to fix safely without rewrite | **NEVER** - Security issue |
| Floating-point prices | "Works" for most cases | Penny discrepancies, customer complaints, accounting headaches | **NEVER** - Use cents from day one |
| No webhook idempotency | Simpler webhook handler | Duplicate orders, emails, inventory errors | **NEVER** - 10 lines of code prevents disasters |
| Pricing logic in route handlers | Faster to write inline | Untestable, unportable, duplicated logic | **Only for v1 prototype** - Extract by Phase 2 |
| localStorage cart only | No backend, fast MVP | No cross-device, no recovery, no persistence | **Acceptable for v1 MVP** - Document limitation |
| Hard-coded pricing matrix | No CMS, no database | Can't update prices without deploy, no A/B testing | **Acceptable for v1** - Move to CMS in v2 |
| Draft orders without expiry tracking | Simpler initial implementation | Lost sales, customer frustration after 1 year | **Not acceptable** - 2025+ auto-deletion is real |
| No rate limit handling | Works fine in dev/testing | Production failures during traffic spikes | **Only acceptable for v1 low-traffic** - Add before scale |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Shopify Draft Orders | Trusting "Reserved" inventory actually removes stock | Set products to "Continue selling when out of stock" for made-to-order custom products |
| Shopify API Rate Limits | Using REST API without rate limit handling | Use GraphQL API + exponential backoff + request queuing |
| Shopify Webhooks | Processing synchronously before sending 200 response | Return 200 immediately, process asynchronously via queue |
| Shopify Draft Orders | Assuming draft orders never expire | Track creation date, implement expiration warnings (1 year auto-delete for 2025+ orders) |
| Shopify Line Item Properties | Using properties to directly modify price | Properties only store metadata; use Cart Transform API or manual price override for pricing |
| Shopify Payment Links | Assuming payment links last forever | Links expire after 30 days by default; warn customers |
| Shopify Checkout | Allowing direct `/checkout` URL access bypasses cart validation | Validate dimensions + price on backend regardless of entry point |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading entire 20x20 matrix on every request | Slow API responses | Cache matrix in memory, load once at startup | 100+ requests/min |
| Synchronous Draft Order creation | Checkout button hangs, timeouts | Queue creation asynchronously, return "processing" state | 10+ concurrent checkouts |
| No database indexes on webhook_id lookups | Slow webhook processing, missed 5-sec deadline | Add unique index on `webhook_id` column | 1000+ webhooks processed |
| Fetching Shopify product on every price calculation | Rate limits, slow pricing | Cache product/matrix data, only fetch on update | 50+ price calculations/min |
| Recalculating price on every cart state change | Laggy UX as matrix grows | Memoize calculation, only recalc when dimensions change | Matrix grows to 50x50+ |
| No pagination on order history | Admin page times out | Paginate + filter by date range | 500+ orders |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Accepting price from frontend | Customer buys $500 product for $0.01 via browser DevTools | **Always** recalculate price on backend; never trust client |
| No dimension validation on backend | Customer submits width=-999, crashes pricing engine or gets free product | Validate: positive, within bounds, not null/undefined/NaN |
| Missing HMAC signature on cart items | Customer modifies cart data between frontend and backend | Add HMAC signature: `HMAC(dimensions + timestamp + secret)` |
| Trusting quantity from cart | Customer sends quantity=-1, exploits pricing formula | Validate: positive integer, max quantity limits |
| No rate limiting on pricing API | Attacker scrapes entire pricing matrix, competitor gains pricing data | Add rate limiting: 100 requests/hour per IP |
| Exposing pricing matrix JSON publicly | Competitor downloads pricing strategy | Require auth token to fetch matrix, or embed in server |
| No input sanitization on dimensions | SQL injection if storing in database, XSS if displaying | Sanitize inputs, use parameterized queries |
| Using GET for checkout creation | URLs logged with sensitive data, CSRF attacks | Use POST for state-changing operations |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Not showing rounded dimensions | Price jumps unexpectedly (191cm → 200cm charged) | Display: "You entered 191cm, we'll cut 200cm (price for 200cm)" |
| No real-time price preview | Customer only sees price at checkout, abandons | Live price calculation as they type dimensions |
| Generic error messages | "Something went wrong" – customer doesn't know why | Specific: "Width must be between 10cm and 200cm" |
| No dimension bounds in UI | Customer enters 999cm, gets error | Show limits in placeholder: "Width (10-200 cm)" |
| Cart shows "Price: $NaN" | Looks broken, damages trust | Fallback: "Unable to calculate price. Please check dimensions." |
| No draft order expiry warning | Quote disappears after 1 year, customer frustrated | Email reminder at 11 months: "Quote expires in 30 days" |
| Checkout fails without explanation | Draft order API error, customer sees blank screen | "We're processing your order. Please wait..." or queue + redirect |
| No indication of made-to-order | Customer expects immediate shipping | Clearly state: "Custom-cut to your dimensions. Ships in 5-7 days." |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Pricing calculation:** Backend validation implemented (not just frontend) — verify by bypassing frontend
- [ ] **Price storage:** Stored in cents/integers (not floats) — verify with test: 0.1 + 0.2 = 0.3
- [ ] **Rounding logic:** Identical on frontend + backend — verify with boundary test suite (190, 191, 200, 201)
- [ ] **Dimension validation:** Enforced on backend API — verify by sending width=999 directly to API
- [ ] **Draft Order creation:** Rate limit handling + retry logic — verify by triggering 429 error
- [ ] **Webhook handlers:** Idempotency check on `X-Shopify-Webhook-Id` — verify by sending duplicate webhook
- [ ] **Cart state:** Storage event listener for cross-tab sync — verify by opening 2 tabs
- [ ] **Pricing engine:** No Shopify imports in core logic — verify by running tests without Shopify SDK
- [ ] **Matrix bounds:** Explicit min/max defined + enforced — verify config file exists
- [ ] **Error handling:** Specific messages (not "Something went wrong") — verify by triggering each error case
- [ ] **Draft order tracking:** Creation date stored for expiry warnings — verify database schema
- [ ] **Security:** HMAC signature on cart items — verify by modifying cart data
- [ ] **Inventory:** Product set to "Continue selling when out of stock" — verify in Shopify admin

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Price manipulation (customer exploited frontend pricing) | **HIGH** - Financial loss | 1. Identify fraudulent orders (price too low for dimensions) 2. Cancel/refund if not fulfilled 3. Add backend validation immediately 4. Audit all recent orders |
| Floating-point errors (penny discrepancies) | **MEDIUM** - Refund affected customers | 1. Identify affected orders (total doesn't match recalculation) 2. Refund difference 3. Migrate to integer pricing 4. Add test suite |
| Draft order expired (1-year auto-delete) | **LOW** - Recreate manually | 1. Check if quote data stored elsewhere 2. Recreate draft order with same terms 3. Apologize + offer discount 4. Implement expiry tracking |
| Webhook duplicates (double processing) | **MEDIUM** - Fix database inconsistencies | 1. Identify duplicate records by webhook_id 2. Delete duplicates 3. Refund double charges 4. Add idempotency check |
| Rate limit exceeded (checkout failures) | **MEDIUM** - Process queued orders | 1. Implement queue system 2. Contact affected customers 3. Process failed checkouts manually 4. Add rate limit handling |
| Dimension out of bounds (order with invalid dimensions) | **LOW** - Contact customer | 1. Identify order 2. Contact customer for valid dimensions 3. Recreate draft order 4. Add validation |
| Tight coupling (can't reuse for app) | **HIGH** - Rewrite pricing engine | 1. Extract pricing to pure functions 2. Create interface/adapter pattern 3. Write comprehensive tests 4. Migrate incrementally |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Price manipulation | Phase 1: Core Pricing | Send malicious API request with price=$0.01, verify rejection |
| Floating-point errors | Phase 1: Core Pricing | Test: 0.1 + 0.2 = 0.3 exactly (in cents) |
| Rounding inconsistencies | Phase 1: Core Pricing | Boundary test suite passes on frontend + backend |
| Dimension bounds | Phase 1: Core Pricing | API rejects width=999, height=-1, width=null |
| Tight coupling | Phase 1: Core Pricing | Pricing tests run without Shopify SDK installed |
| Rate limit failures | Phase 2: Draft Order Integration | Load test: 10 concurrent draft order creations succeed |
| Draft order expiry | Phase 2: Draft Order Integration | Database schema includes `created_at` tracking |
| Inventory race condition | Phase 2: Draft Order Integration | Product config: "Continue selling when out of stock" enabled |
| Webhook duplicates | Phase 3: Webhooks & Order Management | Send duplicate webhook, verify single processing |
| Cart state sync issues | Phase 1: Frontend Cart | Open 2 tabs, add item in Tab A, verify visible in Tab B |

---

## Sources

**Shopify Draft Orders:**
- [Creating draft orders - Shopify Help Center](https://help.shopify.com/en/manual/fulfillment/managing-orders/create-orders/create-draft)
- [Getting paid for draft orders - Shopify Help Center](https://help.shopify.com/en/manual/fulfillment/managing-orders/create-orders/get-paid)
- [Shopify Draft Orders: Complete Guide - Revize](https://www.revize.app/blog/shopify-draft-orders-guide)

**Price Manipulation Security:**
- [The Importance of Backend Price Validation in E-commerce Applications - Medium](https://medium.com/@cjun1775/the-importance-of-backend-price-validation-in-e-commerce-applications-850ac7f773c1)
- [Price Manipulation in E-commerce Applications - Sourcery](https://www.sourcery.ai/vulnerabilities/price-manipulation-ecommerce)
- [Top 6 Most Common Price Manipulation Vulnerabilities - Intigriti](https://www.intigriti.com/blog/news/top-6-price-manipulation-vulnerabilities-ecommerce)

**Shopify API Rate Limits:**
- [Shopify API limits](https://shopify.dev/docs/api/usage/limits)
- [REST Admin API rate limits](https://shopify.dev/docs/api/admin-rest/usage/rate-limits)
- [An Introduction to Rate Limits - Shopify Partners](https://www.shopify.com/partners/blog/rate-limits)

**Floating-Point Precision:**
- [Floats Don't Work For Storing Cents - Modern Treasury](https://www.moderntreasury.com/journal/floats-dont-work-for-storing-cents)
- [Precision Matters: Why Using Cents Instead of Floating Point - HackerOne](https://www.hackerone.com/blog/precision-matters-why-using-cents-instead-floating-point-transaction-amounts-crucial)
- [Floating Point Arithmetic and Why It Makes Cents](https://brd.mn/articles/floating-point/)

**Webhook Reliability:**
- [Best practices for webhooks - Shopify](https://shopify.dev/docs/apps/build/webhooks/best-practices)
- [Ignore duplicate webhooks - Shopify](https://shopify.dev/docs/apps/build/webhooks/ignore-duplicates)
- [The Definitive Guide to Reliably Working with Shopify Webhooks - Hookdeck](https://hookdeck.com/webhooks/platforms/definitive-guide-shopify-webhooks-https-hookdeck)

**Dimension Rounding:**
- [Rounding strategies and decimal place pricing - Craft Commerce GitHub](https://github.com/craftcms/commerce/issues/695)

**Cart State Management:**
- [Scalable E-Commerce Architecture - Part 2: Shopping Cart - DEV](https://dev.to/savyjs/scalable-e-commerce-architecture-part-2-shopping-cart-3blg)
- [State-Driven Shopping Cart with Srvra-Sync - DEV](https://dev.to/sign/state-driven-shopping-cart-development-a-clean-approach-with-srvra-sync-7mi)

**Shopify Inventory Issues:**
- [Reserve Product In Draft Order Does Not Remove It From Inventory - Shopify Community](https://community.shopify.com/c/shopify-design/reserve-product-in-draft-order-does-not-remove-it-from-inventory/m-p/1592387)
- [How to deduct inventory for draft order on Shopify](https://yagisoftware.com/articles/how-to-deduct-inventory-for-draft-order.html)

**Line Item Properties:**
- [How to Customize Shopify Line Item Properties - EComposer](https://ecomposer.io/blogs/shopify-knowledge/custom-shopify-line-item-properties)
- [Liquid objects: line_item - Shopify](https://shopify.dev/docs/api/liquid/objects/line_item)

**Checkout Security:**
- [Problem: Customer can bypass cart limits by jumping to checkout - Shopify Community](https://community.shopify.com/c/shopify-design/problem-if-customer-jumps-to-my-store-com-checkout-they-can/td-p/1412669)

**Loose Coupling Best Practices:**
- [Software Development Best Practice — Loose Coupling - Medium](https://medium.com/life-at-apollo-division/software-development-best-practice-2-loose-coupling-5994e7ce006c)
- [Loosely Coupled Architecture: Easy Explanation](https://www.clickittech.com/devops/loosely-coupled-architecture/)

**Edge Case Testing:**
- [Edge Case Testing Explained - VirtuosoQA](https://www.virtuosoqa.com/post/edge-case-testing)
- [Handling Edge Cases In Boundary Testing - FasterCapital](https://fastercapital.com/topics/handling-edge-cases-in-boundary-testing.html)

---

*Pitfalls research for: Custom-Dimension E-commerce with Shopify*
*Researched: 2026-01-29*
*Confidence: HIGH (verified with authoritative sources)*
