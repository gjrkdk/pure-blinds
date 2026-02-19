---
phase: quick-14
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/icon.svg
  - src/app/favicon.ico
autonomous: true
requirements: [QUICK-14]
must_haves:
  truths:
    - "Browser tab shows the Pure Blinds logo icon (dark circle with white blinds) as favicon"
    - "No reference to old favicon.ico remains in the app directory"
  artifacts:
    - path: "src/app/icon.svg"
      provides: "SVG favicon matching the logo icon"
      contains: "circle.*fill.*#111"
  key_links:
    - from: "src/app/icon.svg"
      to: "browser favicon"
      via: "Next.js App Router automatic icon detection"
      pattern: "icon\\.svg"
---

<objective>
Replace the default favicon.ico with the Pure Blinds logo-icon SVG as the site favicon.

Purpose: Brand consistency -- the browser tab should show the Pure Blinds logo.
Output: `src/app/icon.svg` serving as the site favicon.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@public/svg/logo-icon.svg
@src/app/layout.tsx
@src/app/favicon.ico
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace favicon.ico with logo-icon SVG</name>
  <files>src/app/icon.svg, src/app/favicon.ico</files>
  <action>
    1. Create `src/app/icon.svg` using the content from `public/svg/logo-icon.svg`. The SVG is already well-formed (1024x1024 viewBox, dark circle with white blinds design). Copy it as-is -- Next.js App Router automatically detects `icon.svg` in the app directory and serves it as the favicon with the correct Content-Type header.

    2. Delete `src/app/favicon.ico` -- it will be superseded by `icon.svg`. Next.js prefers `icon.svg` over `favicon.ico` when both exist, but removing the old file keeps things clean.

    3. No changes needed to `layout.tsx` -- Next.js App Router handles favicon serving automatically via file-based conventions. Do NOT add any `icons` property to the metadata object.
  </action>
  <verify>
    - Confirm `src/app/icon.svg` exists and contains the logo SVG markup (circle + polygon elements)
    - Confirm `src/app/favicon.ico` no longer exists
    - Run `npx next build` or `npx next lint` to verify no build errors
  </verify>
  <done>
    `src/app/icon.svg` exists with the Pure Blinds logo-icon content. Old `favicon.ico` is deleted. Build succeeds without errors.
  </done>
</task>

</tasks>

<verification>
- `src/app/icon.svg` exists and contains the dark circle + white blinds SVG
- `src/app/favicon.ico` does not exist
- `npm run build` completes without errors
- Dev server shows the logo icon in the browser tab
</verification>

<success_criteria>
The browser tab displays the Pure Blinds logo icon (dark circle with white blinds design) as the favicon. No remnants of the old favicon.ico.
</success_criteria>

<output>
After completion, create `.planning/quick/14-use-logo-icon-as-favicon/14-SUMMARY.md`
</output>
