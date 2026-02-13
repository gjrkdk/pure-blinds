# Stack Research: Multi-Product Catalog, Categories, and Blog

**Domain:** Custom textile e-commerce expansion
**Researched:** 2026-02-13
**Confidence:** HIGH

## Executive Summary

The existing Next.js 15 App Router stack is already well-suited for multi-product catalogs, category pages, and blog functionality. **NO major framework additions are needed.** The App Router's built-in features (dynamic routes, file-based routing, metadata API) handle all core requirements.

For the blog, we need a lightweight MDX processing solution. Given Contentlayer's abandonment, **Velite** is the recommended choice for type-safe content management with Zod validation.

For product catalog expansion, the existing architecture (JSON data files, TypeScript interfaces, dynamic routes) scales well. No database or heavy CMS is warranted.

## Stack Additions Required

### Content Management (Blog Only)

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| `velite` | ^0.1.0 | MDX/Markdown content processor | Contentlayer is abandoned. Velite provides type-safe content layer with Zod validation, built-in MDX support, and active maintenance. Used in production by many projects. |
| `gray-matter` | ^4.0.3 | Frontmatter parser | Industry-standard YAML/JSON frontmatter parser. Used by Gatsby, Netlify, Shopify Polaris, Astro. Needed if not using Velite's built-in frontmatter handling. |

### Content Enhancement (Optional)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `reading-time` | ^1.5.0 | Calculate blog post reading time | Enhances blog UX. Simple utility, minimal overhead. |
| `date-fns` | ^3.3.1 | Date formatting utility | Format blog post dates. Modular, tree-shakeable alternative to moment.js. |
| `rehype-pretty-code` | ^0.13.0 | Syntax highlighting for code blocks | If blog contains code examples. Better than Prism or Highlight.js for MDX. |
| `remark-gfm` | ^4.0.0 | GitHub Flavored Markdown support | Add tables, strikethrough, task lists to MDX. Standard in modern blogs. |

### Static Assets (Optional)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `plaiceholder` | ^3.0.0 | Generate blur placeholder images | If adding product images with blur-up effect. Only needed for remote images. |

## NO Additional Dependencies Needed For

### Multi-Product Catalog
- **Routing:** App Router's `[productId]` dynamic routes already handle product pages
- **Category pages:** App Router's `/products/[category]` pattern is built-in
- **Data management:** TypeScript interfaces + JSON files scale to hundreds of products
- **Type safety:** Existing Zod can validate product schemas

### Pricing Architecture
- **Multiple matrices:** Use naming convention (`pricing-{productId}.json` or nested objects)
- **Matrix loading:** Node.js `fs` module in Server Components (already available)
- **Type safety:** Existing Zod + TypeScript types

### SEO & Metadata
- **Product metadata:** `generateMetadata()` function (built into Next.js 15)
- **Sitemap:** `app/sitemap.ts` file convention (built into Next.js 15)
- **OG images:** `opengraph-image.tsx` file convention (built into Next.js 15)

### Images
- **Optimization:** `next/image` component (already in use)
- **Blur placeholders:** Built-in for static imports
- **Responsive sizing:** Built-in with `sizes` prop

## Recommended Stack for Blog

### Approach: Velite + MDX

**File structure:**
```
content/
  blog/
    post-1.mdx
    post-2.mdx
velite.config.ts
```

**Velite configuration:**
```typescript
import { defineConfig, s } from 'velite'

export default defineConfig({
  collections: {
    posts: {
      name: 'Post',
      pattern: 'blog/**/*.mdx',
      schema: s.object({
        title: s.string(),
        description: s.string(),
        date: s.isodate(),
        published: s.boolean().default(true),
        slug: s.path(),
        body: s.mdx()
      })
    }
  }
})
```

**Why Velite over alternatives:**
- Contentlayer: Abandoned (maintainer has 1 day/month)
- next-mdx-remote: No type safety, no content validation
- @next/mdx: No frontmatter parsing, no content collections
- Velite: Active, type-safe, Zod validation, JSON output for Server Components

## Alternative Approach: Simple MDX (No Velite)

If blog remains minimal (< 10 posts), you can skip Velite:

**Dependencies:**
- `gray-matter` (parse frontmatter)
- `@next/mdx` (render MDX)
- Node.js `fs` (read files)

**Tradeoffs:**
- PRO: Fewer dependencies, simpler setup
- CON: No type safety, manual validation, no content schema
- CON: More boilerplate for listing/sorting posts

**Recommendation:** Use Velite. The type safety and schema validation are worth it even for 5-10 posts.

## Installation Commands

### Minimal (No blog yet)
```bash
# Nothing needed - existing stack covers catalog expansion
```

### Blog with Velite (Recommended)
```bash
npm install velite reading-time date-fns

# Optional enhancements
npm install rehype-pretty-code remark-gfm
```

### Blog without Velite (Not recommended)
```bash
npm install @next/mdx gray-matter reading-time date-fns
```

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| velite@^0.1.0 | Next.js 15+, React 19+ | Built for App Router, supports RSC |
| reading-time@^1.5.0 | Any Node.js environment | Pure utility, no framework coupling |
| date-fns@^3.3.1 | Any JavaScript environment | Tree-shakeable, no dependencies |
| rehype-pretty-code@^0.13.0 | MDX + Shiki | Requires Shiki for syntax highlighting |
| remark-gfm@^4.0.0 | MDX, Remark v15+ | GFM spec compliant |

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|-------------------------|
| Content management | Velite | Contentlayer | Never (abandoned project) |
| Content management | Velite | next-mdx-remote | If you need remote MDX from API/CMS |
| Content management | Velite | Sanity/Contentful | If non-technical users edit content |
| Date formatting | date-fns | Day.js | If bundle size is critical (day.js is smaller) |
| Date formatting | date-fns | Intl.DateTimeFormat | If only basic formatting needed (built-in) |
| Syntax highlighting | rehype-pretty-code | Prism.js | If client-side highlighting preferred |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Contentlayer | Abandoned (1 day/month maintenance) | Velite |
| Moment.js | Deprecated, bloated (67KB) | date-fns (11KB modular) |
| Redux/Redux Toolkit | Overkill for product catalog | Keep using Zustand |
| Prisma/Database | Unnecessary complexity for JSON data | Node.js fs + TypeScript types |
| Full CMS (Sanity, Contentful) | Adds external dependency, cost, complexity | Velite + Git-based content |
| next-mdx-remote | No type safety, no schema validation | Velite |
| @next/mdx alone | No frontmatter, no collections | Velite |

## Architecture Patterns

### Multi-Product Data Structure

**Option 1: Single file with all products (Current approach, good for < 50 products)**
```typescript
// src/lib/product/data.ts
export const products: Record<string, ProductData> = {
  'white-rollerblind': { ... },
  'black-rollerblind': { ... },
  // ...
}
```

**Option 2: Separate files per category (Better for 50+ products)**
```typescript
// src/lib/product/data/rollerblinds.ts
// src/lib/product/data/venetian.ts
// src/lib/product/data/index.ts (aggregates all)
```

**Recommendation:** Stick with Option 1 until 50+ products. Then refactor to Option 2.

### Pricing Matrix Architecture

**Current:** Single `data/pricing-matrix.json`

**For multi-product:**

**Option A: Product ID prefix**
```
data/pricing-matrix-white-rollerblind.json
data/pricing-matrix-black-rollerblind.json
data/pricing-matrix-venetian-25mm.json
```

**Option B: Nested structure**
```json
{
  "white-rollerblind": {
    "version": "1.0.0",
    "matrix": [[...], [...]]
  },
  "black-rollerblind": {
    "version": "1.0.0",
    "matrix": [[...], [...]]
  }
}
```

**Recommendation:** Option A (separate files). Easier to version, smaller file reads, clearer ownership per product.

### Blog Route Structure

**Recommended:**
```
src/app/blog/page.tsx           → Blog listing
src/app/blog/[slug]/page.tsx    → Individual post
content/blog/*.mdx              → Post content
```

**Why:**
- Separates content from code
- Easy to add/edit posts without touching React
- Git history tracks content changes separately
- Velite processes `content/` directory

### Category Route Structure

**Current structure works:**
```
src/app/products/[productId]/page.tsx        → Individual product
src/app/products/rollerblinds/page.tsx       → Category listing
```

**Scaling to more categories:**
```
src/app/products/[category]/page.tsx         → Dynamic category listing
src/app/products/[category]/[productId]/page.tsx  → Product within category
```

**Recommendation:** Keep current structure until 5+ categories. Current approach is explicit and easier to customize per category.

## Integration Points with Existing Stack

### Zustand (Cart State)
- No changes needed
- Cart already handles product IDs as strings
- Works with any product ID format

### Shopify Admin API
- No changes needed
- Draft order creation already uses product IDs
- Pricing calculated server-side before Shopify call

### Tailwind CSS v4
- No changes needed
- All new pages use existing design tokens
- Blog can reuse existing typography styles

### TypeScript + Zod
- Extend existing `ProductData` interface with category field (already done)
- Add `PricingMatrix` type for validation
- Use Zod for Velite schema definitions (if using Velite)

## Sources

### Next.js 15 App Router & Product Catalogs
- [Next.js App Router Official Docs](https://nextjs.org/docs/app) — App Router overview
- [Next.js Dynamic Routes Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) — Dynamic segments for products
- [Next.js: The Complete Guide for 2026 | DevToolbox Blog](https://devtoolbox.dedyn.io/blog/nextjs-complete-guide) — 2026 best practices
- [Next.js Dynamic Route Segments (2026 Guide) – TheLinuxCode](https://thelinuxcode.com/nextjs-dynamic-route-segments-in-the-app-router-2026-guide/) — Product catalog patterns

### MDX & Content Management
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx) — Official MDX support
- [ContentLayer has been Abandoned - What are the Alternatives? - Wisp CMS](https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives) — Contentlayer status
- [Refactoring ContentLayer to Velite](https://www.mikevpeeren.nl/blog/refactoring-contentlayer-to-velite) — Migration guide
- [Integrating a Static Blog in Next.js with Velite](https://nooc.me/en/posts/integrate-a-blog-in-nextjs-with-velite) — Velite setup
- [gray-matter on npm](https://www.npmjs.com/package/gray-matter) — Frontmatter parser

### Metadata & SEO
- [Next.js generateMetadata Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — Dynamic metadata
- [Next.js Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) — SEO setup
- [Next.js Sitemap Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) — Sitemap generation
- [Next.js SEO Optimization Guide (2026 Edition)](https://www.djamware.com/post/697a19b07c935b6bb054313e/next-js-seo-optimization-guide--2026-edition) — Current SEO best practices

### Image Optimization
- [Next.js Image Component Documentation](https://nextjs.org/docs/app/api-reference/components/image) — Image optimization
- [Next.js Image Optimization Guide](https://nextjs.org/docs/app/getting-started/images) — Blur placeholders

### Supporting Libraries
- [date-fns on npm](https://www.npmjs.com/package/date-fns) — Date formatting
- [date-fns official website](https://date-fns.org/) — Documentation
- [reading-time on npm](https://www.npmjs.com/package/reading-time) — Reading time calculation

---

**Confidence Assessment:**
- Next.js 15 capabilities: HIGH (official docs, current version)
- Velite recommendation: HIGH (verified active development, production usage)
- Contentlayer status: HIGH (maintainer's public statement on GitHub)
- MDX ecosystem: HIGH (official Next.js support, established patterns)
- Alternative libraries: MEDIUM (community recommendations, not officially endorsed)

**Key Takeaway:** The existing stack is already excellent for this expansion. Only add Velite + reading-time + date-fns when ready to implement the blog. Everything else is built-in to Next.js 15.
