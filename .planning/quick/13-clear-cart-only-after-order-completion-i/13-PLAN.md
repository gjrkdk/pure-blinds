---
phase: quick-13
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/cart/cart-summary.tsx
  - src/components/cart/clear-cart-on-mount.tsx
  - src/app/bevestiging/page.tsx
autonomous: true
requirements: [QUICK-13]

must_haves:
  truths:
    - "Cart is NOT cleared when user clicks checkout (before payment)"
    - "Cart IS cleared when user lands on the confirmation page after completing payment"
    - "If user abandons checkout and navigates back, cart items are still present"
  artifacts:
    - path: "src/components/cart/clear-cart-on-mount.tsx"
      provides: "Client component that clears cart on mount via useEffect"
      exports: ["ClearCartOnMount"]
    - path: "src/components/cart/cart-summary.tsx"
      provides: "Cart summary without premature clearCart call"
    - path: "src/app/bevestiging/page.tsx"
      provides: "Confirmation page with ClearCartOnMount component"
      contains: "ClearCartOnMount"
  key_links:
    - from: "src/app/bevestiging/page.tsx"
      to: "src/components/cart/clear-cart-on-mount.tsx"
      via: "import and render"
      pattern: "import.*ClearCartOnMount"
    - from: "src/components/cart/clear-cart-on-mount.tsx"
      to: "src/lib/cart/store.ts"
      via: "useCartStore clearCart action"
      pattern: "useCartStore.*clearCart"
---

<objective>
Clear the shopping cart only after the customer completes their order, not when they are redirected to Shopify checkout.

Purpose: Previously, the cart was cleared immediately when the user clicked "Afrekenen" (Checkout), before they even completed payment. If the user abandoned the Shopify checkout and returned to the site, their cart was empty. This fix moves cart clearing to the confirmation page so items persist until the order is actually completed.

Output: Modified cart-summary (no premature clear), new ClearCartOnMount component, updated confirmation page.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@src/components/cart/cart-summary.tsx
@src/components/cart/clear-cart-on-mount.tsx
@src/app/bevestiging/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Verify changes are correctly implemented and committed</name>
  <files>
    src/components/cart/cart-summary.tsx
    src/components/cart/clear-cart-on-mount.tsx
    src/app/bevestiging/page.tsx
  </files>
  <action>
    All code changes are already committed (commit d2ec260). Verify:

    1. `src/components/cart/cart-summary.tsx` — The `clearCart` call and import have been removed from the checkout handler. The handler now only redirects to `data.invoiceUrl` without clearing the cart first.

    2. `src/components/cart/clear-cart-on-mount.tsx` — New client component exists that:
       - Uses `'use client'` directive
       - Imports `useCartStore` and gets `clearCart` action
       - Calls `clearCart()` inside a `useEffect` on mount
       - Returns `null` (renders nothing)

    3. `src/app/bevestiging/page.tsx` — Imports and renders `<ClearCartOnMount />` inside the page layout so the cart is cleared when the confirmation page loads.

    4. Run `npx tsc --noEmit` to confirm TypeScript compiles without errors.
    5. Run `npx next build` to confirm the build succeeds.
  </action>
  <verify>
    - `npx tsc --noEmit` exits with code 0
    - `git log --oneline -1` shows the commit with cart clearing changes
    - `git diff HEAD` shows no uncommitted changes
  </verify>
  <done>
    All changes verified: cart-summary no longer clears cart on checkout, ClearCartOnMount component exists, confirmation page uses it. TypeScript compiles cleanly.
  </done>
</task>

</tasks>

<verification>
- TypeScript compiles without errors (`npx tsc --noEmit`)
- No references to `clearCart` in `cart-summary.tsx`
- `ClearCartOnMount` is imported and rendered in `bevestiging/page.tsx`
- `clear-cart-on-mount.tsx` calls `clearCart()` in a `useEffect`
</verification>

<success_criteria>
- Cart items persist when user is redirected to Shopify checkout
- Cart is cleared only when the user reaches the /bevestiging confirmation page
- All code compiles and builds successfully
</success_criteria>

<output>
After completion, create `.planning/quick/13-clear-cart-only-after-order-completion-i/13-SUMMARY.md`
</output>
