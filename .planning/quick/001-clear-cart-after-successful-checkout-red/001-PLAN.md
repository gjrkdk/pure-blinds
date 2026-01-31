---
phase: quick
plan: 001
type: tdd
wave: 1
depends_on: []
files_modified:
  - package.json
  - vitest.config.ts
  - src/components/cart/cart-summary.test.tsx
autonomous: true

must_haves:
  truths:
    - "Vitest + jsdom test environment runs successfully"
    - "Failing test exists that asserts cart is cleared after successful checkout redirect"
    - "Test RED state is committed (test fails because clearCart is not called in handleCheckout)"
  artifacts:
    - path: "vitest.config.ts"
      provides: "Test runner configuration"
    - path: "src/components/cart/cart-summary.test.tsx"
      provides: "Failing test for cart-clear-on-checkout behavior"
  key_links:
    - from: "src/components/cart/cart-summary.test.tsx"
      to: "src/components/cart/cart-summary.tsx"
      via: "imports and renders CartSummary"
      pattern: "import.*CartSummary"
---

<objective>
Write a failing test (TDD RED) that proves the cart is NOT cleared after successful checkout, so the GREEN phase can wire `clearCart()` into the checkout flow.

Purpose: Establish test infrastructure and the failing test that drives the clear-cart-on-checkout feature.
Output: Vitest config, failing test file, RED commit.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/cart/store.ts — Zustand store with `clearCart()` action already implemented
@src/components/cart/cart-summary.tsx — `handleCheckout` function that calls `/api/checkout` and redirects to `data.invoiceUrl`. Currently does NOT call `clearCart()`.
@package.json — No test framework installed yet
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Vitest and configure test environment</name>
  <files>package.json, vitest.config.ts</files>
  <action>
Install vitest, @testing-library/react, @testing-library/jest-dom, and jsdom as dev dependencies:

```
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

Create `vitest.config.ts` at project root:
- Use `@vitejs/plugin-react` plugin
- Set test environment to `jsdom`
- Set globals to `true`
- Add path alias: `@/` maps to `./src/`
- Set `setupFiles` to `./vitest.setup.ts` (optional, skip if not needed)

Add `"test": "vitest run"` script to package.json.

Do NOT install @testing-library/user-event (not needed for this test).
  </action>
  <verify>Run `npx vitest --version` to confirm installation. Run `npx vitest run` and confirm it exits with "no test files found" (not a config error).</verify>
  <done>Vitest installed, configured with jsdom + React plugin + path aliases, `npm test` script works.</done>
</task>

<task type="auto">
  <name>Task 2: Write failing test for clear-cart-on-checkout</name>
  <files>src/components/cart/cart-summary.test.tsx</files>
  <action>
Create test file `src/components/cart/cart-summary.test.tsx` with a single test:

**Test: "clears cart after successful checkout redirect"**

Setup:
1. Mock `global.fetch` to return `{ ok: true, json: () => Promise.resolve({ invoiceUrl: 'https://shop.myshopify.com/checkout/123' }) }`
2. Mock `window.location.href` using `Object.defineProperty` with a writable setter (or use a spy) so the redirect doesn't actually navigate
3. Pre-populate the Zustand cart store with one item using `useCartStore.getState().addItem(...)` with a valid AddCartItemInput (e.g., productId: 'test-product', productTitle: 'Test', width: 100, height: 100, priceInCents: 1000, options: { width: 100, height: 100 })
4. Render `<CartSummary />`
5. Click the "Proceed to Checkout" button
6. Wait for the fetch to resolve (use `waitFor` from testing-library)
7. Assert: `useCartStore.getState().items` has length 0

Between tests, reset the Zustand store: `useCartStore.setState({ items: [] })` in a `beforeEach`.

This test MUST FAIL because `handleCheckout` in cart-summary.tsx currently does `window.location.href = data.invoiceUrl` without calling `clearCart()` first. The cart items will still be in the store after checkout.

Important: The test should be realistic -- it tests the actual component behavior, not a mock. The assertion checks the real Zustand store state.
  </action>
  <verify>Run `npm test` and confirm the test FAILS with an assertion error showing items.length is 1 (not 0). This is the expected RED state.</verify>
  <done>Test exists and fails because clearCart is not called during checkout. RED phase complete.</done>
</task>

</tasks>

<verification>
- `npm test` runs without configuration errors
- Exactly 1 test exists and it FAILS (RED state)
- The failure message clearly shows cart was not cleared (items.length expected 0, received 1)
</verification>

<success_criteria>
- Vitest + jsdom + React Testing Library installed and configured
- One failing test that asserts cart clearing on checkout
- Test failure is due to missing behavior (not broken setup)
</success_criteria>

<output>
After completion, create `.planning/quick/001-clear-cart-after-successful-checkout-red/001-SUMMARY.md`
</output>
