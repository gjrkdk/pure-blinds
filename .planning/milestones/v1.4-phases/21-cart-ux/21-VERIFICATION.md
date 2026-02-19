---
phase: 21-cart-ux
verified: 2026-02-19T15:30:00Z
status: human_needed
score: 4/4 must-haves verified
re_verification: false
human_verification:
  - test: "Load a product page on mobile, enter dimensions, add to cart — confirm the single Toevoegen button splits into two stacked buttons: Naar winkelwagen (top, accent style) and Nog een toevoegen (bottom, neutral-100 style)"
    expected: "Single button disappears; two stacked buttons appear. Naar winkelwagen navigates to /winkelwagen. Nog een toevoegen clears width, height, price, and returns to single Toevoegen button."
    why_human: "Button-split transition and navigation are runtime behaviors that require a browser and cart interaction"
  - test: "On the same product page, click Kleurstaal bestellen"
    expected: "Button text changes immediately to Bekijk winkelwagen and clicking it navigates to /winkelwagen. Reload page — button still shows Bekijk winkelwagen (localStorage persistence)."
    why_human: "State persistence across page reload requires a live browser session with localStorage"
  - test: "Change a width or height input after adding to cart"
    expected: "The split buttons disappear and the single Toevoegen button returns"
    why_human: "Reactive form-reset-on-dimension-change requires a running application"
  - test: "Resize browser below 768px — verify mobile cart icon placement"
    expected: "A shopping bag icon appears to the LEFT of the hamburger menu. Desktop nav at 768px+ shows no shopping bag next to hamburger — only the desktop CartIcon in nav remains."
    why_human: "Responsive layout behavior requires visual inspection in a browser at different viewport widths"
  - test: "On mobile, add items to cart and observe the badge"
    expected: "Badge with item count appears on the shopping bag icon. Badge shows a brief scale-125 pulse animation when count changes. Badge disappears when cart is emptied."
    why_human: "Badge animation and real-time count update require a live browser session"
---

# Phase 21: Cart UX Verification Report

**Phase Goal:** The add-to-cart and sample flows give customers clear next-step navigation, and the cart is always visible on mobile
**Verified:** 2026-02-19T15:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | After adding product, Toevoegen button splits into Naar winkelwagen (primary, top) + Nog een toevoegen (secondary, bottom) | VERIFIED | `dimension-configurator.tsx` L295-318: `{addedToCart ? <div flex-col gap-2><button Naar winkelwagen router.push>/winkelwagen</button><button Nog een toevoegen handleResetForm></button></div> : <button Toevoegen>}` |
| 2 | Clicking Nog een toevoegen resets width, height, price, errors, and restores single Toevoegen button | VERIFIED | `dimension-configurator.tsx` L189-196: `handleResetForm` sets width="", height="", price=null, error=null, fieldErrors={}, addedToCart=false |
| 3 | Changing any dimension input after adding resets to single Toevoegen button | VERIFIED | `dimension-configurator.tsx` L57-78: Both `handleWidthChange` and `handleHeightChange` call `setAddedToCart(false)` |
| 4 | After adding a sample, sample button changes to Bekijk winkelwagen and navigates to /winkelwagen | VERIFIED | `dimension-configurator.tsx` L321-335: `{hasSample ? <button router.push(/winkelwagen)>Bekijk winkelwagen</button> : <button handleAddSample>Kleurstaal bestellen</button>}` |
| 5 | On page load, if sample already in cart, sample button shows Bekijk winkelwagen immediately | VERIFIED | `hasSample` selector reads from Zustand persist store (`store.ts` L143-147), which loads from localStorage on mount. No additional logic needed. |
| 6 | Product add-to-cart state and sample button state are completely independent | VERIFIED | `addedToCart` is local component state (affects product button only); `hasSample` comes from cart store scoped to `productId` (affects sample button only). They share no state. |
| 7 | On mobile (below md), a cart icon is visible in the header to the left of the hamburger menu | VERIFIED | `header.tsx` L89-135: `<div className="md:hidden flex items-center gap-2">` wraps cart Link + hamburger button. Cart Link is first child (left of hamburger). |
| 8 | On desktop (md and above), mobile cart icon is hidden; desktop CartIcon unchanged | VERIFIED | `header.tsx` L89: wrapper is `md:hidden`. Desktop `<div className="hidden md:flex">` with `<CartIcon />` at L84-86 is untouched. |
| 9 | When cart has items, a badge with item count appears on the mobile icon | VERIFIED | `header.tsx` L109-117: `{mounted && itemCount > 0 && <span>{itemCount}</span>}` conditionally renders badge. Badge absent when itemCount === 0. |
| 10 | Badge count updates immediately when items are added/removed | VERIFIED | `header.tsx` L16: `const itemCount = useCartStore((state) => state.getItemCount())` — reactive Zustand selector, re-renders on store change. `getItemCount` (`store.ts` L177-180) sums all item quantities. |
| 11 | Badge shows subtle pulse animation when count changes | VERIFIED | `header.tsx` L22-30: `useEffect` detects `itemCount !== prevCountRef.current`, sets `badgePulse=true` for 300ms. Badge class at L111: `scale-125` when pulsing, `scale-100` otherwise. |

**Score:** 11/11 truths verified (automated checks). Human verification required for runtime behavior.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/dimension-configurator.tsx` | Split button states for product add-to-cart and sample navigation | VERIFIED | 339 lines. Contains `Naar winkelwagen`, `Nog een toevoegen`, `Bekijk winkelwagen`, `Kleurstaal bestellen`, `router.push('/winkelwagen')` in both branches. Substantive implementation. |
| `src/components/layout/header.tsx` | Mobile cart icon with badge next to hamburger menu | VERIFIED | 163 lines. Contains `md:hidden`, `useCartStore`, `getItemCount`, `useSyncExternalStore`, badge rendering, pulse animation. Substantive implementation. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `dimension-configurator.tsx` | `/winkelwagen` | `router.push` on Naar winkelwagen and Bekijk winkelwagen buttons | WIRED | L298: `router.push("/winkelwagen")` (product button); L323: `router.push("/winkelwagen")` (sample button). `useRouter` imported L4, instantiated L23. |
| `header.tsx` | `@/lib/cart/store` | `useCartStore` with `getItemCount` selector | WIRED | L7: `import { useCartStore } from "@/lib/cart/store"`. L16: `useCartStore((state) => state.getItemCount())`. `getItemCount` confirmed at `store.ts` L177-180. |
| `dimension-configurator.tsx` | product page | Imported and rendered | WIRED | `src/app/producten/[...slug]/page.tsx` L3: imports `DimensionConfigurator`; L179: renders `<DimensionConfigurator ...>`. |
| `header.tsx` | root layout | Imported and rendered | WIRED | `src/app/layout.tsx` L4: imports `{ Header }`; L52: renders `<Header />`. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| CART-01 | 21-01-PLAN.md | After adding product to cart, button splits into "Nog een toevoegen" + "Naar winkelwagen" | SATISFIED | `dimension-configurator.tsx` L295-318: full conditional rendering of split buttons keyed on `addedToCart` state |
| CART-02 | 21-01-PLAN.md | After adding sample to cart, sample button changes to "Bekijk winkelwagen" linking to cart page | SATISFIED | `dimension-configurator.tsx` L321-335: full conditional rendering keyed on `hasSample(productId)` from cart store |
| CART-03 | 21-02-PLAN.md | Cart icon with item count badge visible next to hamburger menu on mobile | SATISFIED | `header.tsx` L89-135: `md:hidden` wrapper with shopping bag SVG link, badge conditional on `itemCount > 0`, pulse animation |

All three requirements from REQUIREMENTS.md are satisfied. No orphaned requirements detected.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `dimension-configurator.tsx` | 234, 263 | `placeholder=` attribute on input elements | Info | HTML input placeholder text — not a code stub. Not an anti-pattern. |

No blockers or warnings found. No empty implementations, no TODO/FIXME comments, no static returns in place of real logic.

### Human Verification Required

#### 1. Product page split-button transition

**Test:** Load a product page on desktop or mobile. Enter valid width and height (e.g. 100 x 150). Price appears. Click Toevoegen.
**Expected:** Single Toevoegen button instantly replaced by two stacked buttons — Naar winkelwagen (filled accent, top) and Nog een toevoegen (neutral-100 muted, bottom). Click Naar winkelwagen — navigates to /winkelwagen.
**Why human:** Button-swap on cart add and router.push navigation require a live browser session.

#### 2. Nog een toevoegen reset behavior

**Test:** After the split state appears, click Nog een toevoegen.
**Expected:** Width, height, and price fields reset to empty. Single Toevoegen button returns.
**Why human:** Form field reset requires a running application with React state.

#### 3. Dimension-change reset

**Test:** After adding to cart (split state showing), change the width or height input.
**Expected:** Split buttons immediately disappear; single Toevoegen button returns.
**Why human:** Reactive state update on input change requires runtime verification.

#### 4. Sample button state and persistence

**Test:** Click Kleurstaal bestellen. Observe button. Reload the page.
**Expected:** Button changes to Bekijk winkelwagen immediately. After reload, button still shows Bekijk winkelwagen (localStorage persisted via Zustand). Clicking it navigates to /winkelwagen.
**Why human:** localStorage persistence and page-reload state restoration require a live browser.

#### 5. Mobile cart icon — layout and responsiveness

**Test:** Open on mobile (or resize below 768px). Look at the header pill.
**Expected:** Shopping bag icon visible to the LEFT of the hamburger menu (two horizontal lines). No icon visible next to hamburger at desktop width (768px+). Desktop CartIcon in nav remains.
**Why human:** Visual placement and responsive breakpoint behavior require browser viewport inspection.

#### 6. Mobile cart badge — count and animation

**Test:** On mobile, add one or more items to cart.
**Expected:** Badge appears on shopping bag icon with the correct item count. Brief scale-pulse animation plays when count changes. Badge disappears entirely when cart is emptied.
**Why human:** Badge animation and real-time Zustand reactivity require a live browser session with cart interactions.

### Gaps Summary

No gaps found. All artifacts exist, are substantive, and are wired. All three requirement IDs (CART-01, CART-02, CART-03) are satisfied with concrete implementation evidence. Both documented commits (`62c2526`, `698793c`) are confirmed present in git history.

The phase is blocked on human verification only — the implementation is complete and correct based on static analysis.

---

_Verified: 2026-02-19T15:30:00Z_
_Verifier: Claude (gsd-verifier)_
