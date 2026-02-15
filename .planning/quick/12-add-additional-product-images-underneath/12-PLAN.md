---
phase: quick-12
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/product/types.ts
  - data/products.json
  - src/components/product/product-image-gallery.tsx
  - src/app/producten/[...slug]/page.tsx
autonomous: true

must_haves:
  truths:
    - "Product detail page shows main image at current 4:3 aspect ratio"
    - "Thumbnail row appears below the main image showing all available images"
    - "Clicking a thumbnail swaps it into the main image position"
    - "Main product image is always shown as the first thumbnail"
    - "Current/active thumbnail is visually distinguished from others"
  artifacts:
    - path: "src/lib/product/types.ts"
      provides: "Product type with optional images array"
      contains: "images?: string[]"
    - path: "data/products.json"
      provides: "Product data with gallery image paths"
      contains: "images"
    - path: "src/components/product/product-image-gallery.tsx"
      provides: "Client component for image gallery with thumbnail swap"
      exports: ["default"]
    - path: "src/app/producten/[...slug]/page.tsx"
      provides: "Product page using ProductImageGallery component"
      contains: "ProductImageGallery"
  key_links:
    - from: "src/app/producten/[...slug]/page.tsx"
      to: "src/components/product/product-image-gallery.tsx"
      via: "import and render with image + images props"
      pattern: "ProductImageGallery"
    - from: "src/components/product/product-image-gallery.tsx"
      to: "next/image"
      via: "Next.js Image component for optimized rendering"
      pattern: "import Image from"
---

<objective>
Add an image gallery to the product detail page with thumbnail images below the main image that swap on click.

Purpose: Give customers multiple views of products, increasing purchase confidence.
Output: Working image gallery on product pages with clickable thumbnails that swap with the main image.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/product/types.ts
@data/products.json
@src/app/producten/[...slug]/page.tsx
@src/components/dimension-configurator.tsx (client component pattern reference)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add images field to Product type and product data</name>
  <files>src/lib/product/types.ts, data/products.json</files>
  <action>
1. In `src/lib/product/types.ts`, add an optional `images` field to the `Product` interface after the existing `image` field:
   ```
   images?: string[]; // Additional gallery images, e.g., ['/png/transparant-rolgordijn-keuken.png']
   ```

2. In `data/products.json`, add `images` arrays to each product. The main `image` field stays unchanged (it is the primary/hero image). The `images` array contains ADDITIONAL gallery images only (not the main image):
   - For "roller-blind-white" (transparent/wit): add `"images": ["/png/transparant-rolgordijn-keuken.png", "/png/rolgordijn-in-woonkamer-situatie.png"]`
   - For "roller-blind-black" (verduisterend/zwart): add `"images": ["/png/rolgordijn-keuken.png", "/png/rolgordijn-in-woonkamer-situatie.png"]`

Place the `images` field directly after the `image` field in each product object for readability.
  </action>
  <verify>Run `npx tsc --noEmit` to confirm no type errors.</verify>
  <done>Product type has optional `images?: string[]` field. Both products in products.json have `images` arrays with 2 additional image paths each. TypeScript compiles without errors.</done>
</task>

<task type="auto">
  <name>Task 2: Create ProductImageGallery client component and integrate into product page</name>
  <files>src/components/product/product-image-gallery.tsx, src/app/producten/[...slug]/page.tsx</files>
  <action>
1. Create `src/components/product/product-image-gallery.tsx` as a `'use client'` component:

   Props interface:
   ```typescript
   interface ProductImageGalleryProps {
     image: string;       // Main/primary product image
     images?: string[];   // Additional gallery images
     alt: string;         // Alt text for images (product name)
   }
   ```

   Component behavior:
   - Combine all images into a single array: `[image, ...(images || [])]` — main image is always first.
   - Use `useState` to track the currently selected image index (default: 0).
   - Render the selected image as the main/hero image in a `relative aspect-4/3 overflow-hidden rounded-2xl bg-white shadow-lifted` container using Next.js `Image` with `fill` and `object-cover` — matching the existing styling exactly.
   - Below the main image, render a row of thumbnails only if there are 2+ total images. Use a flex container with `mt-3 flex gap-2` styling.
   - Each thumbnail: a `button` element wrapping a `relative` div that is 64x48px (`w-16 h-12`) with `overflow-hidden rounded-lg bg-white` styling. Use Next.js `Image` with `fill` and `object-cover`.
   - Active thumbnail gets a ring: `ring-2 ring-accent ring-offset-1`. Inactive thumbnails get `opacity-60 hover:opacity-100 transition-opacity` and `cursor-pointer`.
   - On thumbnail click, update selected index to show that image as the main image.
   - If only 1 image total (no additional images), render just the main image with no thumbnail row — same visual output as current page.
   - Fallback: if `image` is falsy, render the existing placeholder div with "Productafbeelding" text.

2. Update `src/app/producten/[...slug]/page.tsx`:
   - Add import: `import ProductImageGallery from "@/components/product/product-image-gallery";`
   - Replace the entire left column content (the `{product.image ? (...) : (...)}` conditional block, lines ~118-131) with:
     ```tsx
     <ProductImageGallery
       image={product.image}
       images={product.images}
       alt={product.name}
     />
     ```
   - The wrapping `<div>` for the left column stays as-is.
  </action>
  <verify>
Run `npx tsc --noEmit` to confirm no type errors. Run `npm run build` to confirm the page builds successfully. Then run `npm run dev` and visit a product page (e.g., http://localhost:3000/producten/rolgordijnen/transparante-rolgordijnen/wit-rolgordijn) to verify: main image displays, thumbnails appear below, clicking a thumbnail swaps the main image.
  </verify>
  <done>Product pages show image gallery with main image and clickable thumbnail row. Clicking thumbnails swaps the main image. Products with no additional images show just the main image (no thumbnail row). Build succeeds without errors.</done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with no errors
- `npm run build` succeeds
- Product page renders main image in 4:3 container with existing styling
- Thumbnail row appears below main image with all available images
- Active thumbnail has accent ring indicator
- Clicking any thumbnail swaps it into the main image
- Products with only a main image (no `images` array) render identically to before
</verification>

<success_criteria>
Both product pages display an image gallery with the main image and clickable thumbnails below. Thumbnails swap the main image on click. The visual style matches the existing design (rounded-2xl, shadow-lifted, 4:3 aspect ratio). TypeScript and build both pass cleanly.
</success_criteria>

<output>
After completion, create `.planning/quick/12-add-additional-product-images-underneath/12-SUMMARY.md`
</output>
