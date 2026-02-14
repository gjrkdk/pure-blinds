---
phase: quick-7
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/layout/header.tsx
autonomous: true
must_haves:
  truths:
    - "Header appears more compact with less whitespace between elements"
    - "Logo, nav links, and cart icon are visually tighter together"
    - "Header remains functional on both desktop and mobile"
  artifacts:
    - path: "src/components/layout/header.tsx"
      provides: "Compact header layout"
  key_links: []
---

<objective>
Reduce excessive spacing in the navigation header to make it more compact.

Purpose: The floating pill-style header has too much whitespace — generous padding, wide gaps between nav links, and a narrow max-width that spreads elements apart. Tightening these values will produce a cleaner, more compact header.

Output: Updated header.tsx with reduced spacing classes.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/layout/header.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Reduce header spacing via Tailwind classes</name>
  <files>src/components/layout/header.tsx</files>
  <action>
Adjust the following Tailwind classes in `src/components/layout/header.tsx` to reduce whitespace:

1. **Outer container** (line 31, the `div` wrapping the pill):
   - Change `px-4 pt-4` to `px-4 pt-3` (reduce top spacing above the pill)

2. **Inner pill container** (line 33, the rounded-full div):
   - Change `px-5 py-3` to `px-4 py-2` (tighter internal padding within the pill)

3. **Desktop nav links** (line 45, the `nav` element):
   - Change `gap-6` to `gap-4` (tighter spacing between "Products" and "Blog")

4. **Cart icon container** (line 57, the cart div):
   - Change `gap-3` to `gap-2` (tighter spacing around cart icon)

Do NOT change:
- The `max-w-3xl` constraint (this controls overall header width, not internal spacing)
- The mobile menu styles (only the desktop pill header needs adjustment)
- Any font sizes, colors, or transition classes
- The `rounded-full` pill shape or backdrop-blur styling
  </action>
  <verify>
Run `npm run build` to confirm no build errors. Visually inspect the changes by reviewing the diff — confirm only spacing-related Tailwind classes were changed (px, py, pt, gap values).
  </verify>
  <done>
Header pill has reduced padding (py-2 px-4 instead of py-3 px-5), tighter nav link gap (gap-4 instead of gap-6), and slightly less top offset (pt-3 instead of pt-4). All other header functionality and styling remains unchanged.
  </done>
</task>

</tasks>

<verification>
- `npm run build` passes without errors
- Only Tailwind spacing classes in header.tsx were modified
- Desktop header appears more compact
- Mobile hamburger menu still functions correctly
</verification>

<success_criteria>
Header whitespace is visibly reduced through tighter padding and gap values while maintaining the existing pill-shaped floating design.
</success_criteria>

<output>
After completion, create `.planning/quick/7-reduce-spacing-in-navigation-header/7-SUMMARY.md`
</output>
