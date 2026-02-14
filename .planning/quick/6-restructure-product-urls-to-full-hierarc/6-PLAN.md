---
phase: quick-6
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - data/products.json
  - data/pricing/roller-blind-white.json
  - data/pricing/roller-blind-black.json
  - src/lib/product/catalog.ts
  - src/lib/product/types.ts
  - src/lib/cart/store.ts
  - src/app/products/page.tsx
  - src/app/products/[...slug]/page.tsx
  - src/app/products/roller-blinds/page.tsx
  - src/app/products/roller-blinds/transparent-roller-blinds/page.tsx
  - src/app/products/roller-blinds/blackout-roller-blinds/page.tsx
  - src/app/products/venetian-blinds/page.tsx
  - src/app/products/textiles/page.tsx
  - src/components/layout/footer.tsx
  - src/app/cart/page.tsx
autonomous: true
must_haves:
  truths:
    - "Visiting /products/roller-blinds shows the roller blinds category page"
    - "Visiting /products/roller-blinds/transparent-roller-blinds shows the transparent subcategory"
    - "Visiting /products/roller-blinds/transparent-roller-blinds/roller-blind-white shows the product detail page"
    - "Visiting /products/roller-blinds/blackout-roller-blinds/roller-blind-black shows the product detail page"
    - "Visiting /products/venetian-blinds/venetian-blinds-25mm shows the venetian blinds product page"
    - "Visiting /products/textiles/custom-textile shows the custom textile product page"
    - "All breadcrumbs reflect the full hierarchical URL path"
    - "All internal links use the new hyphenated hierarchical URLs"
    - "Pricing API still works with updated product IDs"
    - "Add-to-cart still works with updated product IDs"
  artifacts:
    - path: "data/products.json"
      provides: "Updated product IDs, slugs, category/subcategory slugs"
    - path: "src/app/products/[...slug]/page.tsx"
      provides: "Dynamic catch-all route for product detail pages"
    - path: "src/app/products/roller-blinds/page.tsx"
      provides: "Renamed category page with hyphenated slug"
  key_links:
    - from: "subcategory pages"
      to: "product detail pages"
      via: "hierarchical URL path using product slug"
    - from: "product detail page"
      to: "/api/pricing"
      via: "product.id sent as productId"
    - from: "data/products.json pricingMatrixPath"
      to: "data/pricing/*.json"
      via: "file path reference"
---

<objective>
Restructure product URLs from flat `/products/[productId]` to full hierarchical paths with hyphenated slugs: `/products/[category]/[subcategory]/[product]`.

Purpose: SEO-friendly URLs that reflect the product hierarchy and use consistent hyphenation.
Output: All product, category, and subcategory pages accessible via new hierarchical URLs with correct breadcrumbs and internal links.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@data/products.json
@src/lib/product/types.ts
@src/lib/product/catalog.ts
@src/app/products/[productId]/page.tsx
@src/app/products/page.tsx
@src/app/products/rollerblinds/page.tsx
@src/app/products/rollerblinds/transparent/page.tsx
@src/app/products/rollerblinds/blackout/page.tsx
@src/app/products/venetian-blinds/page.tsx
@src/app/products/textiles/page.tsx
@src/components/layout/footer.tsx
@src/app/cart/page.tsx
@src/lib/cart/store.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update data layer - product IDs, slugs, pricing files, and catalog helpers</name>
  <files>
    data/products.json
    data/pricing/roller-blind-white.json
    data/pricing/roller-blind-black.json
    src/lib/product/types.ts
    src/lib/product/catalog.ts
    src/lib/cart/store.ts
  </files>
  <action>
1. **Rename pricing matrix files** (the JSON content stays identical, only filenames change):
   - `data/pricing/rollerblinds-white.json` -> `data/pricing/roller-blind-white.json`
   - `data/pricing/rollerblinds-black.json` -> `data/pricing/roller-blind-black.json`
   - `venetian-blinds-25mm.json` and `custom-textile.json` stay as-is (already hyphenated correctly)

2. **Update `data/products.json`** - change all 4 products:
   - `rollerblinds-white` -> id: `roller-blind-white`, slug: `roller-blind-white`, category: `roller-blinds`, subcategory: `transparent-roller-blinds`, pricingMatrixPath: `/data/pricing/roller-blind-white.json`
   - `rollerblinds-black` -> id: `roller-blind-black`, slug: `roller-blind-black`, category: `roller-blinds`, subcategory: `blackout-roller-blinds`, pricingMatrixPath: `/data/pricing/roller-blind-black.json`
   - `venetian-blinds-25mm` -> id: `venetian-blinds-25mm` (unchanged), slug: `venetian-blinds-25mm`, category: `venetian-blinds` (unchanged). No subcategory.
   - `custom-textile` -> id: `custom-textile` (unchanged), slug: `custom-textile`, category: `textiles` (unchanged). No subcategory.

3. **Update `src/lib/product/types.ts`** - Add a `categorySlug` field is NOT needed since category already stores the slug. Add a helper type or keep existing. The `slug` field on Product is already used for URL-friendly names. Ensure types are consistent. No structural change needed to the interface.

4. **Update `src/lib/product/catalog.ts`** - Add two new helper functions:
   - `getProductBySlug(slug: string): Product | undefined` - finds product by slug field
   - `getProductUrl(product: Product): string` - builds the full hierarchical URL for a product:
     - If product has subcategory: `/products/${product.category}/${product.subcategory}/${product.slug}`
     - If no subcategory: `/products/${product.category}/${product.slug}`
   - Keep existing `getProduct(productId)` working (it matches on `id`, which now has new values)

5. **Bump cart store version** in `src/lib/cart/store.ts`:
   - Change `version: 2` to `version: 3` in the persist config
   - Update the migrate function: versions < 3 clear cart with message `'Cart format changed (v3: new product IDs) - clearing old items'`
   - This ensures users with old cart items (using `rollerblinds-white` IDs) get a clean slate
  </action>
  <verify>
    Run `npx tsc --noEmit` to confirm no type errors. Verify pricing files exist at new paths: `ls data/pricing/roller-blind-*.json`. Verify old pricing files are removed: `ls data/pricing/rollerblinds-*.json` should fail.
  </verify>
  <done>
    products.json has updated IDs/slugs/categories, pricing files renamed, catalog has getProductBySlug and getProductUrl helpers, cart store version bumped to 3.
  </done>
</task>

<task type="auto">
  <name>Task 2: Restructure routes, update all pages and links to use hierarchical URLs</name>
  <files>
    src/app/products/[...slug]/page.tsx
    src/app/products/page.tsx
    src/app/products/roller-blinds/page.tsx
    src/app/products/roller-blinds/transparent-roller-blinds/page.tsx
    src/app/products/roller-blinds/blackout-roller-blinds/page.tsx
    src/app/products/venetian-blinds/page.tsx
    src/app/products/textiles/page.tsx
    src/components/layout/footer.tsx
    src/app/cart/page.tsx
  </files>
  <action>
1. **Delete old route and directories:**
   - Delete `src/app/products/[productId]/` directory entirely
   - Delete `src/app/products/rollerblinds/` directory entirely (old unhyphenated name)

2. **Create catch-all product detail route** at `src/app/products/[...slug]/page.tsx`:
   - This handles ALL product detail pages via catch-all segments
   - The `params.slug` will be an array like `['roller-blinds', 'transparent-roller-blinds', 'roller-blind-white']`
   - Logic: take the LAST segment as the product slug, call `getProductBySlug(lastSegment)`
   - If no product found, call `notFound()`
   - Use `generateStaticParams()` to pre-render all products: for each product, build the slug array from `getProductUrl(product)` (split by '/' and remove 'products' prefix)
   - Render the same product detail UI as the old `[productId]/page.tsx` (DimensionConfigurator, product details, How It Works)
   - Build breadcrumbs dynamically from the slug segments:
     - Always start with Home -> Products
     - Add category breadcrumb: use `formatCategoryName(product.category)` with href `/products/${product.category}`
     - If product has subcategory: add subcategory breadcrumb with href `/products/${product.category}/${product.subcategory}`
     - Add product name as current
   - Pass `product.id` (not slug) as `productId` prop to DimensionConfigurator (the pricing API needs the internal ID)

3. **Create new category directory** `src/app/products/roller-blinds/page.tsx`:
   - Copy content structure from old `rollerblinds/page.tsx`
   - Update breadcrumb label from "Rollerblinds" to "Roller Blinds"
   - Update subcategory hrefs:
     - `transparent` -> `/products/roller-blinds/transparent-roller-blinds`
     - `blackout` -> `/products/roller-blinds/blackout-roller-blinds`
   - Update subcategory names: "Transparent Roller Blinds", "Blackout Roller Blinds"
   - Update heading text to "Roller Blinds"

4. **Create new subcategory pages:**
   - `src/app/products/roller-blinds/transparent-roller-blinds/page.tsx`:
     - Based on old `rollerblinds/transparent/page.tsx`
     - Use `getProductsBySubcategory('roller-blinds', 'transparent-roller-blinds')` (matches new subcategory values)
     - Breadcrumbs: Home > Products > Roller Blinds > Transparent Roller Blinds
     - Product links use `getProductUrl(product)` from catalog instead of `/products/${product.id}`
     - Import `getProductUrl` from `@/lib/product/catalog`
   - `src/app/products/roller-blinds/blackout-roller-blinds/page.tsx`:
     - Same pattern as transparent, using `getProductsBySubcategory('roller-blinds', 'blackout-roller-blinds')`
     - Breadcrumbs: Home > Products > Roller Blinds > Blackout Roller Blinds

5. **Update `src/app/products/venetian-blinds/page.tsx`:**
   - Change product link from `href={/products/${product.id}}` to use `getProductUrl(product)` from catalog
   - Import `getProductUrl` from `@/lib/product/catalog`
   - Everything else stays the same (category slug `venetian-blinds` is already hyphenated)

6. **Update `src/app/products/textiles/page.tsx`:**
   - Same change as venetian-blinds: use `getProductUrl(product)` for product links
   - Import `getProductUrl` from `@/lib/product/catalog`

7. **Update `src/app/products/page.tsx`** (products overview):
   - Change rollerblinds category:
     - id: `roller-blinds`, name: `Roller Blinds`, href: `/products/roller-blinds`
     - Description: "Made-to-measure roller blinds in transparent and blackout options"
   - Venetian Blinds and Textiles hrefs stay the same (already correct)

8. **Update `src/components/layout/footer.tsx`:**
   - Change `{ label: "Rollerblinds", href: "/products/rollerblinds" }` to `{ label: "Roller Blinds", href: "/products/roller-blinds" }`

9. **Update `src/app/cart/page.tsx`:**
   - The two links to `/products/custom-textile` (empty cart CTA and "Continue shopping") should become `/products/textiles/custom-textile` using the full hierarchical path
   - Better yet, change them to `/products` (the products overview page) since linking to a specific product from an empty cart is odd. Use `/products` for both links.

10. **IMPORTANT: Route collision avoidance.** The catch-all `[...slug]` route will match ANY path under `/products/`, which conflicts with static category pages. Next.js static routes take precedence over dynamic routes, so:
    - `/products/roller-blinds` -> matches static `roller-blinds/page.tsx` (good)
    - `/products/roller-blinds/transparent-roller-blinds` -> matches static `roller-blinds/transparent-roller-blinds/page.tsx` (good)
    - `/products/roller-blinds/transparent-roller-blinds/roller-blind-white` -> no static match, falls through to `[...slug]` (good)
    - `/products/venetian-blinds` -> matches static `venetian-blinds/page.tsx` (good)
    - `/products/venetian-blinds/venetian-blinds-25mm` -> falls through to `[...slug]` (good)
    This works correctly with Next.js App Router precedence rules.
  </action>
  <verify>
    Run `npm run build` (or `npx next build`) to verify all routes compile and static params generate correctly. Check for no build errors. Verify the old `/products/rollerblinds/` directory no longer exists. Run `npx tsc --noEmit` for type safety.
  </verify>
  <done>
    All product URLs follow the pattern `/products/[category]/[subcategory?]/[product-slug]` with hyphenated slugs. Breadcrumbs reflect the full hierarchy. All internal links (footer, category pages, subcategory pages, cart page, products overview) point to the new URLs. Old unhyphenated routes are removed. Build succeeds with all static pages generated.
  </done>
</task>

</tasks>

<verification>
- `npm run build` succeeds with no errors
- `npx tsc --noEmit` passes
- Product detail pages render at hierarchical URLs:
  - /products/roller-blinds/transparent-roller-blinds/roller-blind-white
  - /products/roller-blinds/blackout-roller-blinds/roller-blind-black
  - /products/venetian-blinds/venetian-blinds-25mm
  - /products/textiles/custom-textile
- Category pages render at hyphenated URLs:
  - /products/roller-blinds
  - /products/venetian-blinds
  - /products/textiles
- Subcategory pages render at descriptive hyphenated URLs:
  - /products/roller-blinds/transparent-roller-blinds
  - /products/roller-blinds/blackout-roller-blinds
- Breadcrumbs on product detail pages show full hierarchy
- Footer links use `/products/roller-blinds`
- No references to old `/products/rollerblinds` path remain in codebase
</verification>

<success_criteria>
All product URLs use full category hierarchy with hyphenated slugs. Build passes. No broken internal links. Pricing and cart functionality preserved with updated product IDs.
</success_criteria>

<output>
After completion, create `.planning/quick/6-restructure-product-urls-to-full-hierarc/6-SUMMARY.md`
</output>
