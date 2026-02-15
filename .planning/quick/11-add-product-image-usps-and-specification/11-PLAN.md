---
phase: quick-11
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/product/types.ts
  - data/products.json
  - src/app/producten/[...slug]/page.tsx
  - src/app/producten/rolgordijnen/transparante-rolgordijnen/page.tsx
  - src/app/producten/rolgordijnen/verduisterende-rolgordijnen/page.tsx
autonomous: true

must_haves:
  truths:
    - "Product detail page shows a product image above or alongside the product info"
    - "Product detail page displays USPs (unique selling points) as visual bullet points"
    - "Product detail page has a specifications section with structured product data"
    - "Subcategory listing pages show product images instead of placeholders"
  artifacts:
    - path: "src/lib/product/types.ts"
      provides: "Product type with image, usps, and specifications fields"
      contains: "image"
    - path: "data/products.json"
      provides: "Product data with image paths, USPs, and specifications"
      contains: "usps"
    - path: "src/app/producten/[...slug]/page.tsx"
      provides: "Product detail page with image, USPs, and specifications sections"
      contains: "usps"
  key_links:
    - from: "src/app/producten/[...slug]/page.tsx"
      to: "data/products.json"
      via: "catalog import"
      pattern: "product\\.image"
---

<objective>
Add product image, USPs (unique selling points), and a specifications section to the product detail page. Extend the Product data model with new fields and update the product detail page layout to display them in a compelling way.

Purpose: Product pages currently lack visual product representation, selling points, and structured specifications. Adding these makes the page more informative and conversion-friendly.
Output: Enhanced product detail page with image, USPs, and specifications. Updated product data model and catalog data.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@src/lib/product/types.ts
@src/lib/product/catalog.ts
@data/products.json
@src/app/producten/[...slug]/page.tsx
@src/app/producten/rolgordijnen/transparante-rolgordijnen/page.tsx
@src/app/producten/rolgordijnen/verduisterende-rolgordijnen/page.tsx
@src/app/globals.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extend Product type and data with image, USPs, and specifications</name>
  <files>src/lib/product/types.ts, data/products.json</files>
  <action>
1. In `src/lib/product/types.ts`, add three new fields to the `Product` interface:
   - `image: string` — path to product image in /public (e.g., "/png/transparant-rolgordijn-woonkamer.png")
   - `usps: string[]` — array of 3-4 unique selling points as short Dutch strings
   - `specifications: { label: string; value: string }[]` — array of specification key-value pairs (similar to existing `details` but for a separate specifications section)

2. In `data/products.json`, add these fields to both products:

   For "roller-blind-white" (Wit Rolgordijn - transparant):
   - `image`: "/png/transparant-rolgordijn-woonkamer.png" (existing image in public/png/)
   - `usps`: [
       "Op maat gemaakt binnen 3-5 werkdagen",
       "Lichtdoorlatend met privacy",
       "Eenvoudige montage in of buiten de dag",
       "Duurzame, onderhoudsvriendelijke stof"
     ]
   - `specifications`: [
       { "label": "Type", "value": "Transparant rolgordijn" },
       { "label": "Materiaal", "value": "Hoogwaardige polyester stof" },
       { "label": "Kleur", "value": "Wit" },
       { "label": "Breedte bereik", "value": "10 - 200 cm" },
       { "label": "Hoogte bereik", "value": "10 - 200 cm" },
       { "label": "Bediening", "value": "Kettingbediening (rechts)" },
       { "label": "Montage", "value": "In of buiten de dag" },
       { "label": "Lichtdoorlatendheid", "value": "Lichtfiltrerend" },
       { "label": "Onderhoud", "value": "Afneembaar met vochtige doek" },
       { "label": "Productietijd", "value": "3-5 werkdagen" }
     ]

   For "roller-blind-black" (Zwart Rolgordijn - verduisterend):
   - `image`: "/png/verduisterend-rolgordijn-slaapkamer.png" (existing image in public/png/)
   - `usps`: [
       "Op maat gemaakt binnen 3-5 werkdagen",
       "Blokkeert 99% van het licht",
       "Extra isolerend tegen warmte en kou",
       "Eenvoudige montage in of buiten de dag"
     ]
   - `specifications`: [
       { "label": "Type", "value": "Verduisterend rolgordijn" },
       { "label": "Materiaal", "value": "Hoogwaardige verduisterende stof" },
       { "label": "Kleur", "value": "Zwart" },
       { "label": "Breedte bereik", "value": "10 - 200 cm" },
       { "label": "Hoogte bereik", "value": "10 - 200 cm" },
       { "label": "Bediening", "value": "Kettingbediening (rechts)" },
       { "label": "Montage", "value": "In of buiten de dag" },
       { "label": "Lichtblokkering", "value": "99% verduisterend" },
       { "label": "Isolatie", "value": "Thermisch isolerend" },
       { "label": "Onderhoud", "value": "Afneembaar met vochtige doek" },
       { "label": "Productietijd", "value": "3-5 werkdagen" }
     ]

   Keep the existing `details` field as-is (used by "Productdetails" section and backward compatibility layer).
  </action>
  <verify>Run `npx tsc --noEmit` — no type errors. Verify products.json is valid JSON.</verify>
  <done>Product type has image, usps, and specifications fields. Both products in products.json have populated values for all three new fields.</done>
</task>

<task type="auto">
  <name>Task 2: Update product detail page with image, USPs, and specifications</name>
  <files>src/app/producten/[...slug]/page.tsx</files>
  <action>
Restructure the product detail page layout to include image, USPs, and specifications. Use Next.js `Image` component (import from "next/image") following the same pattern used on the rolgordijnen category page.

New layout structure (top to bottom):

1. **Breadcrumbs** (unchanged)

2. **Product image + info section** (2-column grid on lg):
   - Left column: Product image using `next/image` with `fill` and `object-cover` inside a container with `relative aspect-4/3 rounded-2xl overflow-hidden bg-white shadow-lifted`. If no image, fall back to a placeholder div with "Productafbeelding" text.
   - Right column: Product name (h1), description, USPs list, and dimension configurator.

3. **USPs display** (inside right column, between description and configurator):
   - Render `product.usps` as a list with checkmark icons (inline SVG checkmark, color text-accent).
   - Each USP as a flex row: checkmark icon + text in text-sm text-foreground.
   - Wrap in a `div` with `mt-6 space-y-3`.

4. **Specifications section** (full-width below the 2-column grid):
   - Heading: "Specificaties" styled as `text-sm font-semibold uppercase tracking-wider text-foreground` (matches existing "Productdetails" heading style).
   - Render `product.specifications` as a responsive 2-column grid (`grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-6`).
   - Each spec: `dt` with `text-sm text-muted` for label, `dd` with `text-sm font-medium text-foreground` for value.
   - Wrap in a `border border-border p-8 sm:p-10` container (matching existing card style).

5. **Keep existing sections** below:
   - "Productdetails" card (existing `product.details` — keep as-is)
   - "Hoe het werkt" card (keep as-is)
   - Move these two cards into a 2-column grid on lg screens below the specifications section, so the page flows: image+info (2-col) -> specifications (full-width) -> details + how-it-works (2-col).

The overall page structure becomes:
```
[Breadcrumbs]
[Image           ] [Name, Description, USPs, Configurator]
[Specifications - full width                              ]
[Productdetails  ] [Hoe het werkt                         ]
```

Use the checkmark SVG for USPs (simple path, no external icons needed):
```tsx
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-none text-accent">
  <path d="M20 6 9 17l-5-5" />
</svg>
```
  </action>
  <verify>Run `npm run build` — builds without errors. Visit a product page in dev mode and confirm image, USPs, and specifications render correctly.</verify>
  <done>Product detail page shows product image in left column, USPs with checkmarks between description and configurator, specifications in a full-width card below, and existing details/how-it-works in a 2-column layout at the bottom.</done>
</task>

<task type="auto">
  <name>Task 3: Add product images to subcategory listing pages</name>
  <files>src/app/producten/rolgordijnen/transparante-rolgordijnen/page.tsx, src/app/producten/rolgordijnen/verduisterende-rolgordijnen/page.tsx</files>
  <action>
Update both subcategory pages to display the product image from the catalog data instead of the placeholder text.

In both files:
1. Add `import Image from "next/image"` at the top.
2. Replace the placeholder div:
   ```tsx
   <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-white shadow-lifted">
     <span className="text-sm text-muted">Productafbeelding</span>
   </div>
   ```
   With an image container that uses the product's `image` field:
   ```tsx
   <div className="relative aspect-4/3 bg-white shadow-lifted">
     {product.image ? (
       <Image
         src={product.image}
         alt={product.name}
         fill
         className="object-cover"
       />
     ) : (
       <div className="flex h-full items-center justify-center">
         <span className="text-sm text-muted">Productafbeelding</span>
       </div>
     )}
   </div>
   ```
   This matches the pattern already used on `/producten/rolgordijnen/page.tsx` for subcategory cards.
  </action>
  <verify>Run `npm run build` — builds without errors. Visit both subcategory pages and confirm product images display instead of placeholders.</verify>
  <done>Both subcategory listing pages show product images from the catalog data. Placeholder text only appears as fallback when no image is set.</done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with no type errors
- `npm run build` completes successfully
- Product detail pages show: image, USPs with checkmarks, specifications grid, existing details, how-it-works
- Subcategory listing pages show product images instead of placeholder text
- All text is in Dutch
- Layout is responsive (single column on mobile, two columns on desktop)
</verification>

<success_criteria>
- Product type extended with image, usps, and specifications fields
- Both products have populated image paths, USPs, and specifications in products.json
- Product detail page displays product image, USPs with visual checkmarks, and specifications section
- Subcategory listing pages display product images from catalog data
- Build passes without errors
</success_criteria>

<output>
After completion, create `.planning/quick/11-add-product-image-usps-and-specification/11-SUMMARY.md`
</output>
