---
phase: quick-17
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/home/contact-section.tsx
autonomous: true
requirements: [QUICK-17]
must_haves:
  truths:
    - "Contact form inputs do not trigger iOS Safari auto-zoom on focus"
    - "All input and textarea fields render at 16px font-size on all viewports"
  artifacts:
    - path: "src/components/home/contact-section.tsx"
      provides: "Contact form with zoom-safe font sizes"
      contains: "text-base"
  key_links: []
---

<objective>
Prevent iOS Safari from auto-zooming when users focus contact form input fields on mobile.

Purpose: iOS Safari auto-zooms the viewport when an input has font-size below 16px. The contact form uses `text-sm` (14px) on all inputs, causing an annoying zoom effect on mobile. This was already fixed for the dimension configurator inputs in quick task 16 using the same approach.

Output: Updated contact-section.tsx with text-base on all form inputs.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/home/contact-section.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Change contact form input font-size from text-sm to text-base</name>
  <files>src/components/home/contact-section.tsx</files>
  <action>
In `src/components/home/contact-section.tsx`, change the Tailwind class `text-sm` to `text-base` on all four form field elements:

1. **Name input** (line ~281): Change `text-sm` to `text-base` in the className string
2. **Email input** (line ~302): Change `text-sm` to `text-base` in the className string
3. **Phone input** (line ~325): Change `text-sm` to `text-base` in the className string
4. **Message textarea** (line ~343): Change `text-sm` to `text-base` in the className string

Do NOT change `text-sm` on labels, error messages, or the submit button -- only the input/textarea elements themselves.

The honeypot input (hidden, line ~258) does not need changing as it is invisible.

This matches the approach used in quick task 16 (commit 373f18a) which applied the same fix to dimension-configurator.tsx and quantity-input.tsx.
  </action>
  <verify>
Run `grep -n "text-sm\|text-base" src/components/home/contact-section.tsx` and confirm:
- All four input/textarea elements use `text-base`
- Labels, error text, and button still use `text-sm`
- Run `npm run build` to confirm no build errors
  </verify>
  <done>All contact form input and textarea elements use text-base (16px), preventing iOS Safari auto-zoom on focus. Labels, error messages, and button remain at text-sm.</done>
</task>

</tasks>

<verification>
- `grep "text-base" src/components/home/contact-section.tsx` returns 4 matches (name, email, phone, message fields)
- `npm run build` succeeds without errors
</verification>

<success_criteria>
- All four contact form input/textarea fields use `text-base` instead of `text-sm`
- No other elements in the component were changed
- Build passes
</success_criteria>

<output>
After completion, create `.planning/quick/17-remove-mobile-zoom-on-contact-form-input/17-SUMMARY.md`
</output>
