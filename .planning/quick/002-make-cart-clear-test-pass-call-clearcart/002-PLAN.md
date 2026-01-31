---
plan: 002
type: tdd-green
wave: 1
depends_on: ["001"]
files_modified: ["src/components/cart/cart-summary.tsx"]
autonomous: true

must_haves:
  truths:
    - "Cart is empty after successful checkout redirect"
    - "clearCart() is called before window.location.href redirect"
  artifacts:
    - path: "src/components/cart/cart-summary.tsx"
      provides: "handleCheckout calls clearCart before redirect"
      contains: "clearCart"
  key_links:
    - from: "src/components/cart/cart-summary.tsx"
      to: "useCartStore.clearCart"
      via: "called inside handleCheckout on successful response"
      pattern: "clearCart\\(\\)"
---

<objective>
TDD GREEN: Make the failing cart-clear test pass by adding a single clearCart() call in handleCheckout.

Purpose: Complete the GREEN step of the TDD cycle started in quick task 001.
Output: Test passes, cart is cleared before Shopify redirect.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/cart/cart-summary.tsx
@src/components/cart/cart-summary.test.tsx
@src/lib/cart/store.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add clearCart() call in handleCheckout before redirect</name>
  <files>src/components/cart/cart-summary.tsx</files>
  <action>
    In cart-summary.tsx, add `clearCart` to the useCartStore selector at the top of CartSummary:
    ```
    const clearCart = useCartStore((state) => state.clearCart);
    ```

    Then in handleCheckout, add `clearCart()` on line 48 (after the `if (response.ok && data.invoiceUrl)` check, BEFORE the `window.location.href = data.invoiceUrl` assignment):
    ```
    clearCart();
    window.location.href = data.invoiceUrl;
    ```

    This is the minimal change to make the test pass. Do NOT refactor anything else.
  </action>
  <verify>Run `npx vitest run src/components/cart/cart-summary.test.tsx` and confirm the test passes (0 failures).</verify>
  <done>The "clears cart after successful checkout redirect" test passes. Cart items array is empty after handleCheckout completes with a successful response.</done>
</task>

</tasks>

<verification>
`npx vitest run src/components/cart/cart-summary.test.tsx` exits with 0 failures.
</verification>

<success_criteria>
- Test "clears cart after successful checkout redirect" passes
- No other test regressions
- clearCart() is called before redirect in handleCheckout
</success_criteria>

<output>
After completion, create `.planning/quick/002-make-cart-clear-test-pass-call-clearcart/002-SUMMARY.md`
</output>
