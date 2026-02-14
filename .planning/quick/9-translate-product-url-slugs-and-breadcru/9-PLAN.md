---
phase: quick-9
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - data/products.json
  - src/lib/product/types.ts
  - src/lib/product/catalog.ts
  - src/lib/schema/product.ts
  - src/app/products/page.tsx
  - src/app/products/roller-blinds/page.tsx
  - src/app/products/roller-blinds/transparent-roller-blinds/page.tsx
  - src/app/products/roller-blinds/blackout-roller-blinds/page.tsx
  - src/app/products/[...slug]/page.tsx
  - src/app/producten/page.tsx
  - src/app/producten/rolgordijnen/page.tsx
  - src/app/producten/rolgordijnen/transparante-rolgordijnen/page.tsx
  - src/app/producten/rolgordijnen/verduisterende-rolgordijnen/page.tsx
  - src/app/producten/[...slug]/page.tsx
  - src/components/layout/header.tsx
  - src/components/layout/footer.tsx
  - src/app/cart/page.tsx
  - next.config.mjs
  - content/posts/welk-rolgordijn-voor-welke-kamer.mdx
autonomous: true

must_haves:
  truths:
    - "Visiting /producten/rolgordijnen/transparante-rolgordijnen/wit-rolgordijn shows the white roller blind product page"
    - "Visiting /producten/rolgordijnen shows the roller blinds category page"
    - "Visiting old English URLs (/products/roller-blinds/transparent-roller-blinds/roller-blind-white) returns 301 redirect to new Dutch URL"
    - "Breadcrumbs display Dutch labels: Home > Producten > Rolgordijnen > Transparante Rolgordijnen > Wit Rolgordijn"
    - "Navigation and footer link to /producten paths"
    - "Schema.org URLs use new Dutch paths"
  artifacts:
    - path: "src/app/producten/page.tsx"
      provides: "Dutch products overview page"
    - path: "src/app/producten/rolgordijnen/page.tsx"
      provides: "Dutch roller blinds category page"
    - path: "src/app/producten/[...slug]/page.tsx"
      provides: "Dutch product detail catch-all route"
    - path: "data/products.json"
      provides: "Dutch product slugs (wit-rolgordijn, zwart-rolgordijn)"
    - path: "next.config.mjs"
      provides: "301 redirects from all old English URLs to new Dutch URLs"
  key_links:
    - from: "src/lib/product/catalog.ts"
      to: "src/app/producten/[...slug]/page.tsx"
      via: "getProductUrl returns /producten/... paths"
      pattern: "/producten/"
    - from: "next.config.mjs"
      to: "new Dutch routes"
      via: "301 redirects from old English paths"
      pattern: "statusCode: 301"
---

<objective>
Translate all product URL slugs and breadcrumb labels from English to Dutch. Move the entire product route tree from /products/* to /producten/* with Dutch slugs, add 301 redirects from all old English URLs, and update all internal links.

Purpose: SEO-friendly Dutch URLs matching the nl-NL language of the site content
Output: Complete URL migration from English to Dutch product paths with zero broken links
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
@src/lib/schema/product.ts
@src/app/products/[...slug]/page.tsx
@next.config.mjs
</context>

<tasks>

<task type="auto">
  <name>Task 1: Migrate product data, types, catalog, and create Dutch route files</name>
  <files>
    data/products.json
    src/lib/product/types.ts
    src/lib/product/catalog.ts
    src/lib/schema/product.ts
    src/app/producten/page.tsx
    src/app/producten/rolgordijnen/page.tsx
    src/app/producten/rolgordijnen/transparante-rolgordijnen/page.tsx
    src/app/producten/rolgordijnen/verduisterende-rolgordijnen/page.tsx
    src/app/producten/[...slug]/page.tsx
  </files>
  <action>
  **1. Update product slugs in `data/products.json`:**
  - Change `"slug": "roller-blind-white"` to `"slug": "wit-rolgordijn"`
  - Change `"slug": "roller-blind-black"` to `"slug": "zwart-rolgordijn"`
  - Change `"category": "roller-blinds"` to `"category": "rolgordijnen"` on both products
  - Change `"subcategory": "transparent-roller-blinds"` to `"subcategory": "transparante-rolgordijnen"`
  - Change `"subcategory": "blackout-roller-blinds"` to `"subcategory": "verduisterende-rolgordijnen"`

  **2. Update `src/lib/product/types.ts`:**
  - Change `Category` type from `'roller-blinds'` to `'rolgordijnen'`
  - Change `Subcategory` type from `'transparent-roller-blinds' | 'blackout-roller-blinds'` to `'transparante-rolgordijnen' | 'verduisterende-rolgordijnen'`

  **3. Update `src/lib/product/catalog.ts`:**
  - Change `getProductUrl` to return `/producten/${product.category}/${product.subcategory}/${product.slug}` (i.e., replace `/products/` with `/producten/`)
  - Same for the non-subcategory path: `/producten/${product.category}/${product.slug}`

  **4. Update `src/lib/schema/product.ts`:**
  - Change the productUrl construction from `/products/` to `/producten/`

  **5. Create new Dutch route files by MOVING content from old English routes:**

  Create `src/app/producten/page.tsx` based on `src/app/products/page.tsx`:
  - Copy content exactly, update the category href from `/products/roller-blinds` to `/producten/rolgordijnen`
  - Update breadcrumb href from `/products` references to `/producten`

  Create `src/app/producten/rolgordijnen/page.tsx` based on `src/app/products/roller-blinds/page.tsx`:
  - Copy content exactly, update subcategory hrefs:
    - `/products/roller-blinds/transparent-roller-blinds` to `/producten/rolgordijnen/transparante-rolgordijnen`
    - `/products/roller-blinds/blackout-roller-blinds` to `/producten/rolgordijnen/verduisterende-rolgordijnen`
  - Update breadcrumb hrefs: `/products` to `/producten`, `/products/roller-blinds` to `/producten/rolgordijnen`

  Create `src/app/producten/rolgordijnen/transparante-rolgordijnen/page.tsx` based on `src/app/products/roller-blinds/transparent-roller-blinds/page.tsx`:
  - Change `getProductsBySubcategory("roller-blinds", "transparent-roller-blinds")` to `getProductsBySubcategory("rolgordijnen", "transparante-rolgordijnen")`
  - Update breadcrumb hrefs to `/producten`, `/producten/rolgordijnen`

  Create `src/app/producten/rolgordijnen/verduisterende-rolgordijnen/page.tsx` based on `src/app/products/roller-blinds/blackout-roller-blinds/page.tsx`:
  - Change `getProductsBySubcategory("roller-blinds", "blackout-roller-blinds")` to `getProductsBySubcategory("rolgordijnen", "verduisterende-rolgordijnen")`
  - Update breadcrumb hrefs to `/producten`, `/producten/rolgordijnen`

  Create `src/app/producten/[...slug]/page.tsx` based on `src/app/products/[...slug]/page.tsx`:
  - Update `generateStaticParams`: change `url.split('/').filter(s => s && s !== 'products')` to `url.split('/').filter(s => s && s !== 'producten')`
  - Update breadcrumb hrefs: `"/products"` to `"/producten"`, template paths to use `/producten/`
  - Update the `formatCategoryName` function to return proper Dutch labels. Instead of auto-capitalizing from slug, use a map: `{ 'rolgordijnen': 'Rolgordijnen', 'transparante-rolgordijnen': 'Transparante Rolgordijnen', 'verduisterende-rolgordijnen': 'Verduisterende Rolgordijnen' }`

  **6. Delete old English route files** after creating new ones:
  - Delete `src/app/products/page.tsx`
  - Delete `src/app/products/roller-blinds/page.tsx`
  - Delete `src/app/products/roller-blinds/transparent-roller-blinds/page.tsx`
  - Delete `src/app/products/roller-blinds/blackout-roller-blinds/page.tsx`
  - Delete `src/app/products/[...slug]/page.tsx`
  - Remove the now-empty `src/app/products/` directory tree
  </action>
  <verify>Run `npx next build` and confirm it completes without errors. Verify the new routes exist: `ls -R src/app/producten/`</verify>
  <done>All product pages render at Dutch URLs. Product data uses Dutch slugs and categories. Old route files are deleted.</done>
</task>

<task type="auto">
  <name>Task 2: Add 301 redirects and update all internal links</name>
  <files>
    next.config.mjs
    src/components/layout/header.tsx
    src/components/layout/footer.tsx
    src/app/cart/page.tsx
    content/posts/welk-rolgordijn-voor-welke-kamer.mdx
  </files>
  <action>
  **1. Update `next.config.mjs` redirects:**
  Add 301 redirects from ALL old English URLs to new Dutch URLs. Keep existing redirects for venetian-blinds and textiles. Add these new redirects:

  ```
  // Products overview
  { source: '/products', destination: '/producten', statusCode: 301 },

  // Category: roller-blinds -> rolgordijnen
  { source: '/products/roller-blinds', destination: '/producten/rolgordijnen', statusCode: 301 },

  // Subcategories
  { source: '/products/roller-blinds/transparent-roller-blinds', destination: '/producten/rolgordijnen/transparante-rolgordijnen', statusCode: 301 },
  { source: '/products/roller-blinds/blackout-roller-blinds', destination: '/producten/rolgordijnen/verduisterende-rolgordijnen', statusCode: 301 },

  // Individual products (old slug -> new slug)
  { source: '/products/roller-blinds/transparent-roller-blinds/roller-blind-white', destination: '/producten/rolgordijnen/transparante-rolgordijnen/wit-rolgordijn', statusCode: 301 },
  { source: '/products/roller-blinds/blackout-roller-blinds/roller-blind-black', destination: '/producten/rolgordijnen/verduisterende-rolgordijnen/zwart-rolgordijn', statusCode: 301 },

  // Catch-all for any other /products paths
  { source: '/products/:path*', destination: '/producten', statusCode: 301 },
  ```

  IMPORTANT: Place the specific product redirects BEFORE the catch-all `/products/:path*` redirect, since Next.js evaluates redirects in order.

  Also update the existing venetian-blinds and textiles redirects to point to `/producten` instead of `/products`.

  **2. Update `src/components/layout/header.tsx`:**
  - Change nav link `{ href: "/products", label: "Producten" }` to `{ href: "/producten", label: "Producten" }`

  **3. Update `src/components/layout/footer.tsx`:**
  - Change footer link `{ label: "Rolgordijnen", href: "/products/roller-blinds" }` to `{ label: "Rolgordijnen", href: "/producten/rolgordijnen" }`

  **4. Update `src/app/cart/page.tsx`:**
  - Change both `href="/products"` occurrences to `href="/producten"`

  **5. Update `content/posts/welk-rolgordijn-voor-welke-kamer.mdx`:**
  - Change `(/products/roller-blinds/transparent)` to `(/producten/rolgordijnen/transparante-rolgordijnen)`
  - Change `(/products/roller-blinds/blackout)` to `(/producten/rolgordijnen/verduisterende-rolgordijnen)`
  </action>
  <verify>Run `npx next build` to confirm no broken links. Run `grep -r "/products" src/ content/ --include="*.tsx" --include="*.ts" --include="*.mdx" | grep -v node_modules | grep -v ".next"` and confirm NO remaining references to `/products/` in source code (except possibly comments). Check that `next.config.mjs` has all redirect entries.</verify>
  <done>All old English product URLs return 301 redirects to new Dutch URLs. All internal links (navigation, footer, cart, blog) point to /producten paths. Zero references to /products/ remain in source code.</done>
</task>

</tasks>

<verification>
1. `npx next build` completes without errors
2. `grep -rn "/products/" src/ content/ --include="*.tsx" --include="*.ts" --include="*.mdx"` returns no hardcoded English product paths (only comments acceptable)
3. Verify redirects: The next.config.mjs contains 301 redirects for /products, /products/roller-blinds, /products/roller-blinds/transparent-roller-blinds, /products/roller-blinds/blackout-roller-blinds, and both individual product pages
4. Verify new routes exist: `ls src/app/producten/` shows page.tsx, rolgordijnen/, and [...slug]/
5. Verify product data: `grep "slug" data/products.json` shows wit-rolgordijn and zwart-rolgordijn
</verification>

<success_criteria>
- /producten shows the products overview page
- /producten/rolgordijnen shows the roller blinds category
- /producten/rolgordijnen/transparante-rolgordijnen shows transparent roller blinds subcategory
- /producten/rolgordijnen/verduisterende-rolgordijnen shows blackout roller blinds subcategory
- /producten/rolgordijnen/transparante-rolgordijnen/wit-rolgordijn shows the white roller blind product
- /producten/rolgordijnen/verduisterende-rolgordijnen/zwart-rolgordijn shows the black roller blind product
- All old /products/* URLs return 301 redirects to equivalent /producten/* URLs
- Breadcrumbs show Dutch labels (Producten, Rolgordijnen, etc.)
- Header, footer, cart all link to /producten paths
- Schema.org JSON-LD uses /producten/ in URLs
- Build succeeds with no errors
</success_criteria>

<output>
After completion, create `.planning/quick/9-translate-product-url-slugs-and-breadcru/9-SUMMARY.md`
</output>
