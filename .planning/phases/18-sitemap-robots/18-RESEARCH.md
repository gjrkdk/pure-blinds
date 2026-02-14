# Phase 18: Sitemap & Robots - Research

**Researched:** 2026-02-14
**Domain:** Next.js file-based metadata API (sitemap.ts, robots.ts), SEO best practices
**Confidence:** HIGH

## Summary

Next.js 16 provides built-in file-based conventions for generating dynamic sitemaps and robots.txt files through `sitemap.ts` and `robots.ts` files in the app directory. These are special Route Handlers that export functions returning structured data, which Next.js automatically converts to XML/text format and serves at the appropriate URLs.

For this phase, we'll create a dynamic sitemap that pulls from the existing product catalog JSON and Velite-generated blog posts, ensuring all public pages are included while excluding cart and confirmation pages via noindex robots meta tags. The implementation uses Next.js native capabilities without external dependencies.

**Primary recommendation:** Use Next.js built-in `app/sitemap.ts` and `app/robots.ts` conventions with TypeScript types from `MetadataRoute` namespace. Include `lastmod` but omit `changefreq` and `priority` as Google ignores them. Add `metadataBase` to root layout for URL generation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Include ALL public pages: homepage, products overview, category page, subcategory pages, product detail pages, blog listing, and blog posts
- Exclude cart (`/cart`) and confirmation (`/bevestiging`) — these get noindex robots meta instead
- Exclude removed categories and products (already redirected via 301s)

### Claude's Discretion
- Whether to include `lastmod`, `changefreq`, `priority` in sitemap entries (Google largely ignores changefreq/priority, but lastmod is useful)
- Exact robots.txt disallow rules (API routes, internal paths)
- Implementation approach for noindex meta tags on cart/confirmation pages
- Whether to use Next.js `sitemap.ts` convention or custom API route

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 (already installed) | App Router with built-in sitemap/robots support | Official Next.js metadata file conventions, zero additional dependencies |
| TypeScript | 5.x (already installed) | Type safety for metadata routes | `MetadataRoute.Sitemap` and `MetadataRoute.Robots` types provided |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.1.0 (already installed) | Date formatting for lastmod | Already used in project for blog dates |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Built-in sitemap.ts | next-sitemap package | next-sitemap adds 200+ lines of config but handles edge cases like ISR revalidation and index sitemaps automatically. Not needed for <50k URLs |
| Built-in robots.ts | Static robots.txt file | Static file simpler but loses dynamic generation capability (e.g., environment-based rules) |
| Dynamic sitemap function | Static sitemap.xml | Static XML requires manual updates when content changes; dynamic approach stays in sync with data sources |

**Installation:**
No new packages required — all functionality available in Next.js 16.1.6.

## Architecture Patterns

### Recommended Project Structure
```
src/app/
├── sitemap.ts              # Dynamic sitemap generation
├── robots.ts               # Robots.txt generation
├── layout.tsx              # Add metadataBase here
├── cart/
│   └── page.tsx            # Add generateMetadata with robots.index: false
└── confirmation/
    └── page.tsx            # Add generateMetadata with robots.index: false
```

### Pattern 1: Dynamic Sitemap from Multiple Data Sources
**What:** Combine product catalog JSON and Velite blog posts into single sitemap
**When to use:** When sitemap needs to reflect dynamic content from multiple sources
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
import type { MetadataRoute } from 'next'
import { getAllProducts } from '@/lib/product/catalog'
import { posts } from '../../.velite'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/producten`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Product pages
  const products = getAllProducts()
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/producten/${product.category}/${product.subcategory}/${product.slug}`,
    lastModified: new Date(), // Could use product.updatedAt if available
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Blog pages
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}${post.permalink}`,
    lastModified: new Date(post.date),
    changeFrequency: 'never' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...blogPages]
}
```

### Pattern 2: Noindex Robots Meta Tag
**What:** Set robots metadata on specific pages to prevent indexing
**When to use:** For cart, checkout, confirmation, and other transactional pages
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    nocache: true,
  },
}
```

### Pattern 3: Robots.txt with Sitemap Reference
**What:** Generate robots.txt that allows all crawlers but references sitemap
**When to use:** Standard SEO setup for public-facing sites
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
  }
}
```

### Pattern 4: metadataBase in Root Layout
**What:** Set base URL once in root layout for all metadata to inherit
**When to use:** Always — prevents hardcoding URLs across multiple files
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'),
  // ... other metadata
}
```

### Anti-Patterns to Avoid
- **Hardcoding domain URLs in sitemap:** Use environment variable + metadataBase pattern instead
- **Including changefreq/priority without data to support them:** Google ignores these; only include if you have genuine signals
- **Forgetting to exclude noindex pages from sitemap:** Cart/confirmation should be in metadata only, not sitemap
- **Using static sitemap.xml for dynamic content:** Product catalog changes should auto-reflect in sitemap

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XML sitemap generation | Custom XML builder with string concatenation | Next.js `sitemap.ts` returning array of objects | Next.js handles XML formatting, character escaping, schema validation automatically |
| Sitemap splitting for >50k URLs | Manual file chunking logic | Next.js `generateSitemaps` function | Handles sitemap index creation, URL distribution, and 50k limit automatically |
| Robots.txt generation | String template with manual formatting | Next.js `robots.ts` returning Robots object | Ensures correct syntax, handles multiple user agents, validates against standard |
| URL canonicalization | String concatenation with slashes | `metadataBase` + relative paths | Next.js normalizes trailing slashes, handles subdirectories correctly |

**Key insight:** Next.js has built-in solutions for all SEO metadata patterns. Custom solutions miss edge cases like character encoding, schema validation, and proper HTTP headers.

## Common Pitfalls

### Pitfall 1: Missing metadataBase Causes Relative URL Issues
**What goes wrong:** Sitemap URLs appear as relative paths (e.g., `/blog/post`) instead of absolute URLs (e.g., `https://example.com/blog/post`)
**Why it happens:** Sitemap protocol requires fully qualified URLs, but Next.js defaults to relative paths without metadataBase
**How to avoid:** Set `metadataBase` in root `app/layout.tsx` before implementing sitemap
**Warning signs:** Sitemap validation tools report "Invalid URL format" errors

### Pitfall 2: Including Excluded Pages in Sitemap
**What goes wrong:** Cart and confirmation pages appear in sitemap despite having noindex meta tags
**Why it happens:** Sitemap generation logic doesn't automatically exclude pages with noindex metadata
**How to avoid:** Manually filter out excluded routes in sitemap.ts; treat noindex and sitemap exclusion as separate concerns
**Warning signs:** Google Search Console reports "Indexed, though blocked by robots meta tag"

### Pitfall 3: Incorrect lastmod Timestamps
**What goes wrong:** All sitemap entries have identical lastmod timestamps (e.g., build time)
**Why it happens:** Using `new Date()` without per-resource modification dates
**How to avoid:** Use product catalog `lastUpdated` field and blog post `date` field for accurate timestamps
**Warning signs:** Bing Webmaster Tools reports "lastmod values are identical" warning

### Pitfall 4: Forgetting to Disallow Internal Routes
**What goes wrong:** Search engines crawl and index `/api/*` routes, `/_next/*` static files
**Why it happens:** Default robots.txt allows all paths unless explicitly disallowed
**How to avoid:** Add `disallow: ['/api/', '/_next/']` to robots.ts rules
**Warning signs:** Google Search Console shows API routes in index coverage

### Pitfall 5: Not Caching Sitemap Generation
**What goes wrong:** Sitemap regenerates on every request, slowing down crawlers
**Why it happens:** Forgetting that sitemap.ts is a Route Handler (cached by default unless using Dynamic APIs)
**How to avoid:** Verify sitemap.ts doesn't use `cookies()`, `headers()`, or other Dynamic APIs that disable caching; use static export if needed
**Warning signs:** High server load when crawler hits /sitemap.xml multiple times

## Code Examples

Verified patterns from official sources:

### Example 1: Complete Sitemap Implementation
```typescript
// app/sitemap.ts
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
import type { MetadataRoute } from 'next'
import { getAllProducts, getProductUrl } from '@/lib/product/catalog'
import { posts } from '../../.velite'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pureblinds.nl'

  // Homepage
  const homepage: MetadataRoute.Sitemap = [{
    url: baseUrl,
    lastModified: new Date(),
    priority: 1,
  }]

  // Products overview
  const productsOverview: MetadataRoute.Sitemap = [{
    url: `${baseUrl}/producten`,
    lastModified: new Date(),
    priority: 0.9,
  }]

  // Category pages (rolgordijnen)
  const categoryPage: MetadataRoute.Sitemap = [{
    url: `${baseUrl}/producten/rolgordijnen`,
    lastModified: new Date(),
    priority: 0.8,
  }]

  // Subcategory pages
  const subcategoryPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/producten/rolgordijnen/transparante-rolgordijnen`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/producten/rolgordijnen/verduisterende-rolgordijnen`,
      lastModified: new Date(),
      priority: 0.7,
    },
  ]

  // Product detail pages
  const products = getAllProducts()
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}${getProductUrl(product)}`,
    lastModified: new Date(), // Use product.lastUpdated if available in future
  }))

  // Blog listing
  const blogListing: MetadataRoute.Sitemap = [{
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    priority: 0.7,
  }]

  // Blog posts
  const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}${post.permalink}`,
    lastModified: new Date(post.date),
  }))

  return [
    ...homepage,
    ...productsOverview,
    ...categoryPage,
    ...subcategoryPages,
    ...productPages,
    ...blogListing,
    ...blogPosts,
  ]
}
```

### Example 2: Robots.txt Implementation
```typescript
// app/robots.ts
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pureblinds.nl'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',        // API routes
        '/_next/',      // Next.js internals
        '/cart',        // Exclude cart page
        '/bevestiging', // Exclude confirmation page
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

### Example 3: Noindex Metadata for Cart Page
```typescript
// app/cart/page.tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Uw winkelwagen | Pure Blinds',
  robots: {
    index: false,
    follow: true,
    nocache: true,
  },
}

export default function CartPage() {
  // ... existing cart implementation
}
```

### Example 4: Noindex Metadata for Confirmation Page
```typescript
// app/confirmation/page.tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bevestiging | Pure Blinds',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function ConfirmationPage() {
  // ... existing confirmation implementation
}
```

### Example 5: Adding metadataBase to Root Layout
```typescript
// app/layout.tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://pureblinds.nl'),
  title: 'Rolgordijnen op Maat | Pure Blinds',
  // ... existing metadata
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router API routes for sitemap | App Router `sitemap.ts` file convention | Next.js 13.3 (Apr 2023) | Simpler DX, automatic caching, TypeScript types |
| next-sitemap package | Built-in sitemap support | Next.js 13.3 (Apr 2023) | Zero dependencies for basic use cases |
| String-based robots.txt in public/ | Dynamic `robots.ts` returning object | Next.js 13.3 (Apr 2023) | Environment-based rules, type safety |
| Including changefreq/priority | Omitting these fields | Google 2020-2021 | Google publicly stated they ignore these values |
| Separate sitemap files for different content types | Single sitemap combining all content | Ongoing best practice | Simpler unless >50k URLs |

**Deprecated/outdated:**
- **next-sitemap package for simple sites:** Built-in Next.js support now handles 90% of use cases; only needed for advanced features like ISR revalidation of sitemaps
- **changefreq and priority fields:** Google ignores these; Bing uses lastmod; including them adds file size with no SEO benefit
- **Static sitemap.xml in public/ folder:** Requires manual updates when content changes; dynamic generation is standard

## Open Questions

1. **Domain URL configuration**
   - What we know: Project has no `NEXT_PUBLIC_BASE_URL` environment variable yet
   - What's unclear: Production domain name (placeholder: pureblinds.nl)
   - Recommendation: Add `NEXT_PUBLIC_BASE_URL` to `.env.example` and `.env.local`; planner should create task to verify production URL with user

2. **Product lastUpdated field**
   - What we know: Product catalog JSON has `lastUpdated` at catalog level (2026-02-14), not per-product
   - What's unclear: Whether individual products should track modification dates
   - Recommendation: Use current date for now; consider adding per-product lastmod in future phase if SEO value is proven

3. **Category/subcategory page generation**
   - What we know: Routes exist for `/producten/rolgordijnen` and subcategory pages
   - What's unclear: Whether these are statically defined or generated from catalog data
   - Recommendation: Hardcode URLs in sitemap for now since there's only one category; refactor to dynamic generation if categories expand

## Sources

### Primary (HIGH confidence)
- [Next.js Sitemap Metadata File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) - Official Next.js 16.1.6 documentation
- [Next.js Robots.txt Metadata File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) - Official Next.js 16.1.6 documentation
- [Next.js generateMetadata Function](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Official Next.js 16.1.6 documentation, robots metadata field
- [Next.js generateSitemaps Function](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps) - For splitting sitemaps >50k URLs

### Secondary (MEDIUM confidence)
- [Bing Webmaster: Importance of lastmod Tag](https://blogs.bing.com/webmaster/february-2023/The-Importance-of-Setting-the-lastmod-Tag-in-Your-Sitemap) - Bing states lastmod is valuable
- [Google Search Central: Build and Submit Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) - Google's official sitemap documentation
- [Google Search Central: Large Sitemaps Management](https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps) - 50,000 URL limit and sitemap index files
- [Slickplan: Sitemap Priority & Change Frequency](https://slickplan.com/blog/xml-sitemap-priority-changefreq) - Industry consensus that Google ignores these fields

### Tertiary (LOW confidence)
- [Medium: Dynamic Sitemaps in Next.js App Router](https://medium.com/@arfatapp/generating-dynamic-robots-txt-and-sitemap-xml-in-a-next-js-app-router-with-typescript-f1f4a73f775a) - Community tutorial, aligns with official docs
- [Mike Bifulco: Migrate from next-sitemap](https://mikebifulco.com/posts/migrate-from-next-sitemap-to-app-directory-sitemap) - Confirms built-in approach is sufficient for most sites

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Next.js official documentation verified, no external dependencies needed
- Architecture: HIGH - Official examples from Next.js docs, verified TypeScript types
- Pitfalls: HIGH - Based on official documentation warnings and SEO best practices from Google/Bing
- SEO best practices (lastmod/changefreq): HIGH - Multiple authoritative sources (Google, Bing, Sitemaps.org) confirm current standards

**Research date:** 2026-02-14
**Valid until:** 2026-04-14 (60 days - stable domain, Next.js metadata APIs are mature)
