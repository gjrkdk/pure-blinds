---
phase: quick-4
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - data/products.json
  - src/app/products/page.tsx
  - src/app/products/rollerblinds/page.tsx
  - src/app/products/transparent/page.tsx
  - src/app/products/blackout/page.tsx
autonomous: true

must_haves:
  truths:
    - "Products page shows Transparent and Blackout as browsable categories (instead of or alongside Rollerblinds)"
    - "Transparent category page lists the white rollerblind product"
    - "Blackout category page lists the black rollerblind product"
    - "Each category page product card links to the product configurator"
    - "Existing venetian-blinds and textiles categories still work"
  artifacts:
    - path: "src/app/products/transparent/page.tsx"
      provides: "Transparent category listing page"
    - path: "src/app/products/blackout/page.tsx"
      provides: "Blackout category listing page"
    - path: "data/products.json"
      provides: "Updated product categories"
      contains: "transparent"
    - path: "src/app/products/page.tsx"
      provides: "Updated products overview with transparency categories"
  key_links:
    - from: "src/app/products/transparent/page.tsx"
      to: "data/products.json"
      via: "getProductsByCategory('transparent')"
    - from: "src/app/products/blackout/page.tsx"
      to: "data/products.json"
      via: "getProductsByCategory('blackout')"
---

<objective>
Change the product categorization from color-based (white/black rollerblinds) to transparency-based categories (transparent, blackout). Create dedicated category pages for each transparency type, update product data with new categories, and update the products overview page.

Purpose: Make product browsing more intuitive by organizing blinds by their functional property (light transparency) rather than color.
Output: Transparency-based category pages with correct product listings.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/3-add-category-page-with-white-and-black-r/3-SUMMARY.md
@data/products.json
@src/app/products/page.tsx
@src/app/products/rollerblinds/page.tsx
@src/lib/product/catalog.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update product data and create transparency category pages</name>
  <files>
    data/products.json
    src/app/products/transparent/page.tsx
    src/app/products/blackout/page.tsx
  </files>
  <action>
1. In `data/products.json`, change the category field for the two rollerblind products:
   - `rollerblinds-white`: change `"category": "rollerblinds"` to `"category": "transparent"`
   - `rollerblinds-black`: change `"category": "rollerblinds"` to `"category": "blackout"`
   - Leave venetian-blinds and textiles products unchanged.

2. Create `src/app/products/transparent/page.tsx` following the exact pattern from the existing rollerblinds page:
   - `const category = "transparent";`
   - `const displayName = "Transparent";`
   - Uses `getProductsByCategory(category)` from `@/lib/product/catalog`
   - Same card layout, breadcrumbs (Home / Products / Transparent), and structure as rollerblinds/page.tsx
   - Description: "Browse our collection of transparent blinds. Light-filtering options that let natural light through while providing privacy."

3. Create `src/app/products/blackout/page.tsx` following the same pattern:
   - `const category = "blackout";`
   - `const displayName = "Blackout";`
   - Uses `getProductsByCategory(category)` from `@/lib/product/catalog`
   - Same card layout, breadcrumbs (Home / Products / Blackout), and structure
   - Description: "Browse our collection of blackout blinds. Block up to 99% of light for complete darkness and privacy."
  </action>
  <verify>
    Run `npm run build` - should compile without errors.
    Verify transparent page imports and filters correctly by checking the build output includes /products/transparent and /products/blackout routes.
  </verify>
  <done>
    Product data uses "transparent" and "blackout" categories. Two new category pages exist and render products filtered by their respective category.
  </done>
</task>

<task type="auto">
  <name>Task 2: Update products overview page and remove old rollerblinds category page</name>
  <files>
    src/app/products/page.tsx
    src/app/products/rollerblinds/page.tsx
  </files>
  <action>
1. In `src/app/products/page.tsx`, replace the `categories` array. Remove the "rollerblinds" entry and add "transparent" and "blackout" entries:
   ```typescript
   const categories: Category[] = [
     {
       id: "transparent",
       name: "Transparent",
       description: "Light-filtering blinds that let natural light through while providing privacy",
       href: "/products/transparent",
     },
     {
       id: "blackout",
       name: "Blackout",
       description: "Block up to 99% of light for complete darkness and privacy",
       href: "/products/blackout",
     },
     {
       id: "venetian-blinds",
       name: "Venetian Blinds",
       description: "Classic venetian blinds in various sizes",
       href: "/products/venetian-blinds",
     },
     {
       id: "textiles",
       name: "Textiles",
       description: "Premium custom-dimension textiles",
       href: "/products/textiles",
     },
   ];
   ```

2. Delete `src/app/products/rollerblinds/page.tsx` since the rollerblinds category no longer exists (products are now under transparent/blackout).
  </action>
  <verify>
    Run `npm run build` - no errors, no broken references.
    Verify /products page renders with Transparent, Blackout, Venetian Blinds, Textiles categories.
    Verify /products/rollerblinds no longer exists as a route.
  </verify>
  <done>
    Products overview shows transparency-based categories. Old rollerblinds category page is removed. Build passes cleanly.
  </done>
</task>

</tasks>

<verification>
- `npm run build` passes without errors
- `/products` page shows 4 categories: Transparent, Blackout, Venetian Blinds, Textiles
- `/products/transparent` shows the White Rollerblind product card
- `/products/blackout` shows the Black Rollerblind product card
- Product cards link to `/products/rollerblinds-white` and `/products/rollerblinds-black` configurator pages
- `/products/venetian-blinds` and `/products/textiles` pages still work unchanged
- Header navigation "Products" link still works
</verification>

<success_criteria>
Category browsing uses transparency-based organization (transparent/blackout) instead of color-based (white/black). All product links work, build passes, existing category pages unaffected.
</success_criteria>

<output>
After completion, create `.planning/quick/4-change-category-page-from-white-black-to/4-SUMMARY.md`
</output>
