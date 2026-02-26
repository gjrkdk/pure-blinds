---
status: complete
phase: 24-e-commerce-events
source: [24-01-SUMMARY.md, 24-02-SUMMARY.md]
started: 2026-02-23T22:00:00Z
updated: 2026-02-26T07:37:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. view_item fires on product page
expected: Open a product detail page. In DevTools Network tab (filter "collect?"), a `view_item` event fires with item_id (product slug), item_name, currency EUR, and VAT-inclusive price.
result: pass

### 2. view_item fires only once per page visit
expected: On the same product page, change the width and height dimensions multiple times. The `view_item` event should NOT fire again — only the initial one from page load.
result: pass

### 3. add_to_cart fires with dimensions
expected: Add an item to cart. In DevTools Network tab, an `add_to_cart` event fires with item_id, item_name, EUR price, and width_cm/height_cm custom parameters matching the configured dimensions.
result: pass

### 4. begin_checkout fires on checkout click
expected: Go to cart page and click "Afrekenen". In DevTools Network tab, a `begin_checkout` event fires with items array and EUR total BEFORE the redirect to Shopify.
result: issue
reported: "GA4 does not dispatch the collect request before the page navigates to Shopify. Tried transport_type beacon, event_callback, and setTimeout delay — none worked."
severity: major

### 5. sessionStorage snapshot before redirect
expected: Before clicking checkout, open DevTools > Application > Session Storage. After clicking "Afrekenen", a `purchase_snapshot` key appears with transactionId, items array, and totalValue in EUR.
result: issue
reported: "Session storage is empty on all domains after clicking Afrekenen. No purchase_snapshot key appears on the pure-blinds origin."
severity: major

### 6. _gl parameter on Shopify redirect URL
expected: When the checkout redirects to Shopify, the URL contains a `_gl=` query parameter for cross-domain GA4 session continuity. Check the Network tab for the navigation request to myshopify.com.
result: issue
reported: "No _gl parameter in the Shopify checkout URL. URL is: https://pure-blinds-development.myshopify.com/checkouts/do/.../nl/thank-you with no _gl= query parameter. Return URL to pure-blinds.nl also has no _gl parameter."
severity: major

### 7. purchase event fires on return from Shopify
expected: After completing a checkout on Shopify's thank-you page, navigate back to any page on the site. A `purchase` event fires with transaction_id and the items array matching what was in the cart. (Requires real test checkout)
result: issue
reported: "No events at all. Network tab is completely empty after returning from Shopify checkout to pure-blinds.nl — no purchase event fires."
severity: major

### 8. purchase deduplication on refresh
expected: After the purchase event fires (test 7), refresh the page. No second `purchase` event should appear in the Network tab. Also verify the `purchase_snapshot` sessionStorage key has been cleared.
result: skipped
reason: Purchase event never fired (test 7 failed), so deduplication cannot be verified.

## Summary

total: 8
passed: 3
issues: 4
pending: 0
skipped: 1

## Gaps

- truth: "GA4 DebugView shows a begin_checkout event with items array and EUR value when a user clicks the checkout button, before the Shopify redirect fires"
  status: failed
  reason: "GA4 does not dispatch the collect request before the page navigates to Shopify. Tried transport_type beacon, event_callback, and setTimeout delay — none worked."
  severity: major
  test: 4
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Shopify checkout redirect URL contains _gl= query parameter for cross-domain GA4 session continuity"
  status: failed
  reason: "No _gl parameter in the Shopify checkout URL. URL is plain https://pure-blinds-development.myshopify.com/checkouts/do/.../nl/thank-you with no _gl= query parameter."
  severity: major
  test: 6
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "A purchase event fires with transaction_id and items array when returning to pure-blinds.nl after completing Shopify checkout"
  status: failed
  reason: "No events at all. Network tab is completely empty after returning from Shopify checkout — no purchase event fires."
  severity: major
  test: 7
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "After clicking Afrekenen, a purchase_snapshot key appears in sessionStorage with transactionId, items array, and totalValue in EUR"
  status: failed
  reason: "Session storage is empty on all domains after clicking Afrekenen. No purchase_snapshot key appears on the pure-blinds origin."
  severity: major
  test: 5
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
