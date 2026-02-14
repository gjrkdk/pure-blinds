---
phase: quick-5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - data/products.json
  - src/lib/product/types.ts
  - src/lib/product/catalog.ts
  - src/app/products/page.tsx
  - src/app/products/rollerblinds/page.tsx
  - src/app/products/rollerblinds/transparent/page.tsx
  - src/app/products/rollerblinds/blackout/page.tsx
  - src/app/products/[productId]/page.tsx
autonomous: true
must_haves:
  truths:
    - "/products page shows Rollerblinds as a main category card (alongside Venetian Blinds, Textiles)"
    - "/products/rollerblinds page shows Transparent and Blackout as subcategory cards"
    - "/products/rollerblinds/transparent shows transparent rollerblind products"
    - "/products/rollerblinds/blackout shows blackout rollerblind products"
    - "Product detail breadcrumbs show: Home > Products > Rollerblinds > Transparent > Product Name"
    - "Old /products/transparent and /products/blackout routes no longer exist"
  artifacts:
    - path: "src/app/products/rollerblinds/page.tsx"
      provides: "Rollerblinds category page showing subcategories"
    - path: "src/app/products/rollerblinds/transparent/page.tsx"
      provides: "Transparent subcategory product listing"
    - path: "src/app/products/rollerblinds/blackout/page.tsx"
      provides: "Blackout subcategory product listing"
  key_links:
    - from: "src/app/products/page.tsx"
      to: "/products/rollerblinds"
      via: "Link href in category card"
    - from: "src/app/products/rollerblinds/page.tsx"
      to: "/products/rollerblinds/transparent and /products/rollerblinds/blackout"
      via: "Link href in subcategory cards"
    - from: "src/app/products/[productId]/page.tsx"
      to: "/products/rollerblinds/transparent or /products/rollerblinds/blackout"
      via: "Breadcrumb links using product.subcategory and parent category"
---

<objective>
Restructure the product category hierarchy so that "Rollerblinds" is a main category with "Transparent" and "Blackout" as subcategories beneath it.

Purpose: The current flat structure (/products/transparent, /products/blackout) doesn't communicate that these are both types of rollerblinds. The new hierarchy (/products/rollerblinds/transparent, /products/rollerblinds/blackout) makes the product taxonomy clear.

Output: New route structure with 3-level navigation: Products -> Rollerblinds -> Transparent/Blackout
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@data/products.json
@src/lib/product/types.ts
@src/lib/product/catalog.ts
@src/app/products/page.tsx
@src/app/products/transparent/page.tsx
@src/app/products/blackout/page.tsx
@src/app/products/[productId]/page.tsx
@src/components/layout/footer.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update data model and catalog functions for subcategories</name>
  <files>
    data/products.json
    src/lib/product/types.ts
    src/lib/product/catalog.ts
  </files>
  <action>
1. Update `src/lib/product/types.ts`:
   - Add `subcategory` field to Product interface: `subcategory?: string;`
   - This field holds the subcategory slug (e.g., "transparent", "blackout")
   - Keep `category` as the main category (will become "rollerblinds" for these products)

2. Update `data/products.json`:
   - For "rollerblinds-white": change `"category": "transparent"` to `"category": "rollerblinds"` and add `"subcategory": "transparent"`
   - For "rollerblinds-black": change `"category": "blackout"` to `"category": "rollerblinds"` and add `"subcategory": "blackout"`
   - Leave venetian-blinds and textiles products unchanged (no subcategory needed)

3. Update `src/lib/product/catalog.ts`:
   - Add function `getProductsBySubcategory(category: string, subcategory: string): Product[]` that filters by both `category` and `subcategory`
   - Keep existing `getProductsByCategory` function as-is (still useful for categories without subcategories)
  </action>
  <verify>
    Run `npx tsc --noEmit` to confirm no type errors. Verify the JSON is valid by checking the build doesn't fail.
  </verify>
  <done>
    Product data has category "rollerblinds" with subcategory "transparent"/"blackout". New catalog function `getProductsBySubcategory` exists and filters correctly.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create new route structure and update existing pages</name>
  <files>
    src/app/products/page.tsx
    src/app/products/rollerblinds/page.tsx
    src/app/products/rollerblinds/transparent/page.tsx
    src/app/products/rollerblinds/blackout/page.tsx
    src/app/products/[productId]/page.tsx
  </files>
  <action>
1. Update `src/app/products/page.tsx`:
   - Replace the "transparent" and "blackout" entries in the `categories` array with a single "rollerblinds" entry:
     ```
     {
       id: "rollerblinds",
       name: "Rollerblinds",
       description: "Made-to-measure rollerblinds in transparent and blackout options",
       href: "/products/rollerblinds",
     }
     ```
   - Keep venetian-blinds and textiles entries as-is
   - The page should now show 3 category cards: Rollerblinds, Venetian Blinds, Textiles

2. Create `src/app/products/rollerblinds/page.tsx`:
   - This is the rollerblinds category page showing subcategories
   - Use the same card layout pattern as the main products page
   - Define subcategories inline (same pattern as categories in products/page.tsx):
     ```
     const subcategories = [
       {
         id: "transparent",
         name: "Transparent",
         description: "Light-filtering blinds that let natural light through while providing privacy",
         href: "/products/rollerblinds/transparent",
       },
       {
         id: "blackout",
         name: "Blackout",
         description: "Block up to 99% of light for complete darkness and privacy",
         href: "/products/rollerblinds/blackout",
       },
     ];
     ```
   - Breadcrumbs: Home > Products > Rollerblinds (current)
   - Page header: subtitle "Rollerblinds", title "Rollerblinds", description "Choose from our range of made-to-measure rollerblinds. Available in transparent and blackout options."
   - Use the same card grid layout with the same styling (aspect-[4/3] placeholder, p-6 info section, "View products" link text with arrow)

3. Create `src/app/products/rollerblinds/transparent/page.tsx`:
   - Copy the pattern from the old `src/app/products/transparent/page.tsx`
   - Import `getProductsBySubcategory` from `@/lib/product/catalog`
   - Call `getProductsBySubcategory("rollerblinds", "transparent")` instead of `getProductsByCategory("transparent")`
   - Update breadcrumbs: Home > Products > Rollerblinds (/products/rollerblinds) > Transparent (current)
   - Product links should still go to `/products/${product.id}`

4. Create `src/app/products/rollerblinds/blackout/page.tsx`:
   - Same as transparent but for blackout subcategory
   - Call `getProductsBySubcategory("rollerblinds", "blackout")`
   - Update breadcrumbs: Home > Products > Rollerblinds (/products/rollerblinds) > Blackout (current)

5. Update `src/app/products/[productId]/page.tsx`:
   - Update the breadcrumbs to handle the subcategory hierarchy
   - The `formatCategoryName` function stays
   - Add a helper to build the correct breadcrumb path. For products with a subcategory:
     ```
     Breadcrumbs: Home > Products > Rollerblinds (/products/rollerblinds) > Transparent (/products/rollerblinds/transparent) > Product Name (current)
     ```
   - For products WITHOUT a subcategory (venetian-blinds, textiles), keep current behavior:
     ```
     Breadcrumbs: Home > Products > Venetian Blinds (/products/venetian-blinds) > Product Name (current)
     ```
   - Conditionally add the subcategory breadcrumb item only when `product.subcategory` exists

6. Delete the old route directories:
   - Delete `src/app/products/transparent/` directory (entire directory)
   - Delete `src/app/products/blackout/` directory (entire directory)
  </action>
  <verify>
    Run `npm run build` to confirm all routes compile without errors. Manually verify the route structure:
    - `src/app/products/page.tsx` exists (main products page)
    - `src/app/products/rollerblinds/page.tsx` exists (rollerblinds category)
    - `src/app/products/rollerblinds/transparent/page.tsx` exists (transparent subcategory)
    - `src/app/products/rollerblinds/blackout/page.tsx` exists (blackout subcategory)
    - `src/app/products/transparent/` does NOT exist
    - `src/app/products/blackout/` does NOT exist
  </verify>
  <done>
    Route hierarchy is /products -> /products/rollerblinds -> /products/rollerblinds/{transparent,blackout}. Old flat routes are removed. All breadcrumbs reflect the new hierarchy. Build succeeds with no errors.
  </done>
</task>

</tasks>

<verification>
- `npm run build` completes without errors
- Route `/products` shows 3 categories: Rollerblinds, Venetian Blinds, Textiles
- Route `/products/rollerblinds` shows 2 subcategories: Transparent, Blackout
- Route `/products/rollerblinds/transparent` shows the White Rollerblind product
- Route `/products/rollerblinds/blackout` shows the Black Rollerblind product
- Product detail pages have correct multi-level breadcrumbs
- Old routes `/products/transparent` and `/products/blackout` no longer exist (deleted directories)
- Footer link to `/products/rollerblinds` now resolves correctly
</verification>

<success_criteria>
The product hierarchy is restructured: /products shows Rollerblinds as a main category, clicking it shows Transparent and Blackout subcategories, clicking a subcategory shows the filtered products. All breadcrumbs reflect the new 3-level hierarchy. The build passes cleanly.
</success_criteria>

<output>
After completion, create `.planning/quick/5-restructure-categories-rollerblinds-as-m/5-SUMMARY.md`
</output>
