---
phase: 16-prevent-mobile-zoom
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/dimension-configurator.tsx
  - src/components/cart/quantity-input.tsx
autonomous: true
requirements: [QUICK-16]

must_haves:
  truths:
    - "Width and height inputs do not trigger iOS Safari auto-zoom on focus"
    - "Quantity input in cart does not trigger iOS Safari auto-zoom on focus"
    - "Input fields render at 16px font-size (text-base) instead of 14px (text-sm)"
  artifacts:
    - path: "src/components/dimension-configurator.tsx"
      provides: "Width and height dimension inputs"
      contains: "text-base"
    - path: "src/components/cart/quantity-input.tsx"
      provides: "Cart quantity input"
      contains: "text-base"
  key_links: []
---

<objective>
Prevent iOS Safari auto-zoom on input focus by increasing font-size from 14px (text-sm) to 16px (text-base) on all numeric input fields.

Purpose: iOS Safari auto-zooms the viewport when a user focuses an input with font-size below 16px, causing a jarring UX on mobile. Changing to text-base (16px) prevents this.
Output: Updated input styling in dimension-configurator.tsx and quantity-input.tsx.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/dimension-configurator.tsx
@src/components/cart/quantity-input.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix input font-size to prevent mobile zoom</name>
  <files>src/components/dimension-configurator.tsx, src/components/cart/quantity-input.tsx</files>
  <action>
In `src/components/dimension-configurator.tsx`:
- Line 231: In the width input className, change `text-sm` to `text-base`
- Line 260: In the height input className, change `text-sm` to `text-base`
- Do NOT change `text-sm` on labels or error messages (lines 237, 247) -- only the input elements

In `src/components/cart/quantity-input.tsx`:
- Line 60: In the quantity input className, change `text-sm` to `text-base`

This is a targeted Tailwind class swap: `text-sm` (14px) to `text-base` (16px). No other changes needed.
  </action>
  <verify>
Run `npx next lint` and `npx next build` to confirm no regressions.
Grep for remaining `text-sm` in input elements: confirm only labels/error text still use text-sm, not inputs.
  </verify>
  <done>
All three input elements (width, height, quantity) use `text-base` class. Build passes. Labels and error messages remain `text-sm`.
  </done>
</task>

</tasks>

<verification>
- `grep -n "text-sm" src/components/dimension-configurator.tsx` shows text-sm only on label and error p elements (lines ~237, ~247, ~267), NOT on input elements
- `grep -n "text-sm" src/components/cart/quantity-input.tsx` returns no matches
- `grep -n "text-base" src/components/dimension-configurator.tsx` shows two input lines
- `grep -n "text-base" src/components/cart/quantity-input.tsx` shows one input line
- Build succeeds: `npx next build`
</verification>

<success_criteria>
All numeric input fields in the application use font-size >= 16px (text-base), preventing iOS Safari auto-zoom on focus.
</success_criteria>

<output>
After completion, create `.planning/quick/16-prevent-mobile-zoom-on-width-height-inpu/16-SUMMARY.md`
</output>
