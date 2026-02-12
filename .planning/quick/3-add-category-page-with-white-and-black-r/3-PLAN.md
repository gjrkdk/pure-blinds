---
phase: quick-3
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/product/data.ts
  - src/app/products/rollerblinds/page.tsx
  - src/components/layout/header.tsx
autonomous: true

must_haves:
  truths:
    - "User can navigate to /products/rollerblinds and see a category listing page"
    - "Category page displays white rollerblinds and black rollerblinds as product cards"
    - "Clicking a product card navigates to the individual product page with dimension configurator"
    - "Header navigation includes a link to the rollerblinds category"
  artifacts:
    - path: "src/app/products/rollerblinds/page.tsx"
      provides: "Category listing page for rollerblinds"
    - path: "src/lib/product/data.ts"
      provides: "Product data entries for white-rollerblind and black-rollerblind with category field"
  key_links:
    - from: "src/app/products/rollerblinds/page.tsx"
      to: "src/lib/product/data.ts"
      via: "getProductsByCategory function"
      pattern: "getProductsByCategory"
    - from: "src/app/products/rollerblinds/page.tsx"
      to: "src/app/products/[productId]/page.tsx"
      via: "Link href to /products/{productId}"
      pattern: "href.*products/"
---

<objective>
Add a category page at /products/rollerblinds that displays white and black rollerblind products as browsable cards, each linking to their individual product/configurator page.

Purpose: Give users a way to browse rollerblinds by color before configuring dimensions, establishing the category browsing pattern for the shop.
Output: Category page, two new product data entries, and updated navigation.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/product/data.ts
@src/app/products/[productId]/page.tsx
@src/components/layout/header.tsx
@src/app/globals.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extend product data with category support and rollerblind entries</name>
  <files>src/lib/product/data.ts</files>
  <action>
    Update the ProductData interface to add an optional `category` field (string).

    Add a `getProductsByCategory(category: string): ProductData[]` export that filters products by category and returns matching entries as an array.

    Add two new product entries to the products record:

    1. Key: "white-rollerblind"
       - id: "white-rollerblind"
       - name: "White Rollerblind"
       - category: "rollerblinds"
       - description: "Clean white rollerblind made to measure. Enter your desired width and height to get an instant price quote."
       - details: Slat material (Fabric), Color (White), Dimensions (10-200 cm width & height), Production time (3-5 business days), Mounting (Inside or outside recess), Operation (Chain-operated), Care (Wipe clean with damp cloth)

    2. Key: "black-rollerblind"
       - id: "black-rollerblind"
       - name: "Black Rollerblind"
       - category: "rollerblinds"
       - description: "Sleek black rollerblind made to measure. Enter your desired width and height to get an instant price quote."
       - details: Same structure as white but Color (Black), add Blackout (Yes - blocks 99% of light)

    Keep existing products unchanged. The existing "custom-textile" and "venetian-blinds-25mm" entries should NOT get a category field (they remain as-is with category undefined).
  </action>
  <verify>Run `npx tsc --noEmit` to confirm no type errors. Verify getProductsByCategory("rollerblinds") returns exactly 2 items.</verify>
  <done>Product data contains white-rollerblind and black-rollerblind entries with category "rollerblinds". getProductsByCategory function exported and working.</done>
</task>

<task type="auto">
  <name>Task 2: Create rollerblinds category page and update navigation</name>
  <files>src/app/products/rollerblinds/page.tsx, src/components/layout/header.tsx</files>
  <action>
    Create `src/app/products/rollerblinds/page.tsx` as a server component (no "use client").

    Page structure:
    - Breadcrumb nav: Home / Rollerblinds (matching the existing product page breadcrumb style from [productId]/page.tsx - same classes, same pattern)
    - Page header: small uppercase "Rollerblinds" subtitle (text-sm font-semibold uppercase tracking-wider text-muted), then h1 "Rollerblinds" (text-3xl font-light tracking-tight text-foreground sm:text-4xl), then a short description paragraph
    - Product grid: 2-column grid on md+ (grid md:grid-cols-2 gap-8), single column on mobile
    - Each product card: a Link wrapping the card, containing:
      - An aspect-[4/3] placeholder div with bg-white rounded-2xl shadow-lifted (matching work-section.tsx pattern) showing "Product Image" text
      - Product name as h2 (text-xl font-medium text-foreground)
      - Product description truncated to 2 lines (line-clamp-2 text-sm text-muted)
      - A subtle "Configure" link indicator (text-sm font-medium text-foreground with arrow, similar to header CTA style)
    - Use max-w-5xl mx-auto px-6 py-12 sm:py-16 container (matching product page)
    - Import and call getProductsByCategory("rollerblinds") to get the products dynamically

    The Link href for each card should be `/products/{product.id}` (e.g., /products/white-rollerblind).

    Update header.tsx:
    - Add "Rollerblinds" to the navLinks array: `{ href: "/products/rollerblinds", label: "Rollerblinds" }` — insert it as the first item in the navLinks array
    - Change the anchor tags (`<a>`) in the navLinks.map for this item to use Next.js `<Link>` instead, since it's a route not a hash link. The simplest approach: check if href starts with "/" and render Link, otherwise render anchor tag. Apply this logic in both desktop and mobile nav sections.
  </action>
  <verify>Run `npx tsc --noEmit` for type check. Run `npm run build` to confirm page builds without errors. Visit /products/rollerblinds in dev to confirm page renders with two product cards. Click a card to confirm it navigates to the product configurator page.</verify>
  <done>Category page at /products/rollerblinds shows white and black rollerblind cards. Each card links to /products/{id}. Header has "Rollerblinds" nav link that routes to the category page. Both desktop and mobile nav work correctly.</done>
</task>

</tasks>

<verification>
- `npm run build` completes without errors
- /products/rollerblinds renders with two product cards (white, black)
- Clicking "White Rollerblind" card navigates to /products/white-rollerblind which shows the dimension configurator
- Clicking "Black Rollerblind" card navigates to /products/black-rollerblind which shows the dimension configurator
- Header "Rollerblinds" link navigates to /products/rollerblinds (both desktop and mobile)
- Breadcrumb on category page shows Home / Rollerblinds
</verification>

<success_criteria>
- Category page exists at /products/rollerblinds with two browsable product cards
- Product data includes white-rollerblind and black-rollerblind entries
- Navigation updated with Rollerblinds link
- All existing pages and functionality unchanged
- Build passes cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/3-add-category-page-with-white-and-black-r/3-SUMMARY.md`
</output>
