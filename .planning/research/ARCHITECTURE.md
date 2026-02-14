# Architecture Research: Dutch Content & SEO Integration

**Domain:** Dutch content & SEO integration in Next.js 15 App Router
**Researched:** 2026-02-14
**Confidence:** HIGH

## Executive Summary

This research analyzes how Dutch content, metadata, structured data (JSON-LD), sitemap generation, robots.txt, OpenGraph tags, and category removal integrate with the existing Next.js 15 App Router architecture for Pure Blinds webshop.

**Key Finding:** Next.js 15's Metadata API and file-based metadata conventions (sitemap.ts, robots.ts) provide first-class SEO support without external packages. Dutch content can be implemented as single-locale inline content without i18n routing complexity. Build order is dependency-driven: data updates → route removal → content updates → SEO infrastructure.

## Current Architecture (Baseline)

### Existing System Structure

```
┌──────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                         │
│  Next.js App Router Pages (Server Components + Client)       │
│  /                    /products/[...slug]     /cart           │
│  └─ DimensionConfigurator (client)                            │
├──────────────────────────────────────────────────────────────┤
│                     API LAYER                                 │
│  /api/pricing (POST)  /api/checkout (POST)  /api/health      │
│  └─ Zod validation → Domain logic → JSON response            │
├──────────────────────────────────────────────────────────────┤
│                   DOMAIN LOGIC LAYER                          │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────────┐      │
│  │  Pricing    │  │  Product   │  │    Cart          │      │
│  │  Engine     │  │  Catalog   │  │   Store          │      │
│  │             │  │            │  │  (Zustand)       │      │
│  └─────────────┘  └────────────┘  └──────────────────┘      │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │    Shopify       │  │    Blog          │                  │
│  │  Integration     │  │   (Velite)       │                  │
│  │  (Draft Orders)  │  │                  │                  │
│  └──────────────────┘  └──────────────────┘                  │
├──────────────────────────────────────────────────────────────┤
│                      DATA LAYER                               │
│  data/products.json                                           │
│  data/pricing/*.json                                          │
│  content/posts/*.mdx (Velite)                                 │
│  localStorage (cart state)                                    │
└──────────────────────────────────────────────────────────────┘
```

### Current Metadata State

- **Root layout:** `lang="en"`, generic English title/description
- **Page metadata:** Minimal or none on most routes
- **Structured data:** None (no JSON-LD)
- **Sitemap:** Not generated
- **Robots.txt:** Not configured
- **OpenGraph:** Not configured

## Target Architecture: Dutch + SEO

### Enhanced System Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    App Router Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ layout.ts│  │ page.tsx │  │ sitemap.ts│                   │
│  │ (root)   │  │ (route)  │  │ robots.ts │                   │
│  └────┬─────┘  └────┬─────┘  └────┬──────┘                   │
│       │ metadata    │ generate     │ static                   │
│       │ object      │ Metadata()   │ generation               │
├───────┴─────────────┴──────────────┴──────────────────────────┤
│                    Metadata API Layer                         │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Metadata Object / generateMetadata()                │    │
│  │  - title, description, openGraph                     │    │
│  │  - alternates (canonical, hreflang)                  │    │
│  │  - robots, keywords                                  │    │
│  └──────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────┤
│                    Content Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Dutch    │  │ Product  │  │ Blog MDX │                   │
│  │ Content  │  │ JSON     │  │ (Velite) │                   │
│  │ (inline) │  │ Data     │  │          │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
├──────────────────────────────────────────────────────────────┤
│                 Structured Data Layer                        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  JSON-LD <script> tags in page components            │    │
│  │  - Product schema (products)                         │    │
│  │  - FAQPage schema (FAQ sections)                     │    │
│  │  - LocalBusiness schema (root layout)                │    │
│  │  - BreadcrumbList schema (breadcrumbs component)     │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `layout.tsx` (root) | Global metadata, lang="nl", LocalBusiness JSON-LD | Static Metadata object + JSON-LD script tag |
| `page.tsx` (routes) | Page-specific metadata, Dutch content, page-specific JSON-LD | generateMetadata() for dynamic routes, static Metadata for static routes |
| `sitemap.ts` | Generate sitemap.xml with all routes | Export default function returning MetadataRoute.Sitemap array |
| `robots.ts` | Generate robots.txt | Export default function returning Robots object |
| Product catalog | Single source of truth for product data | JSON file with Dutch translations, imported by catalog utilities |
| Blog posts (Velite) | MDX content with frontmatter | Velite schema with Dutch content fields |
| Breadcrumbs component | BreadcrumbList JSON-LD | Client or server component with embedded JSON-LD |

## Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # MODIFY: lang="nl", global metadata, LocalBusiness JSON-LD
│   ├── page.tsx                      # MODIFY: Dutch content, homepage metadata
│   ├── sitemap.ts                    # NEW: Sitemap generation
│   ├── robots.ts                     # NEW: Robots.txt generation
│   ├── products/
│   │   ├── page.tsx                  # MODIFY: Dutch content
│   │   ├── roller-blinds/
│   │   │   ├── page.tsx              # MODIFY: Dutch content, metadata
│   │   │   ├── transparent-roller-blinds/
│   │   │   │   └── page.tsx          # MODIFY: Dutch content, metadata
│   │   │   └── blackout-roller-blinds/
│   │   │       └── page.tsx          # MODIFY: Dutch content, metadata
│   │   └── [...slug]/
│   │       └── page.tsx              # MODIFY: generateMetadata(), Product JSON-LD
│   ├── blog/
│   │   ├── page.tsx                  # MODIFY: Dutch content, metadata
│   │   └── [slug]/
│   │       └── page.tsx              # MODIFY: generateMetadata(), Article JSON-LD
│   ├── cart/
│   │   └── page.tsx                  # MODIFY: Dutch content, noindex robots
│   └── confirmation/
│       └── page.tsx                  # MODIFY: Dutch content, noindex robots
├── components/
│   ├── layout/
│   │   ├── breadcrumbs.tsx           # MODIFY: BreadcrumbList JSON-LD
│   │   ├── header.tsx                # MODIFY: Dutch navigation labels
│   │   └── footer.tsx                # MODIFY: Dutch footer content
│   ├── home/
│   │   ├── faq-section.tsx           # MODIFY: Dutch FAQs + FAQPage JSON-LD
│   │   └── [other sections]          # MODIFY: Dutch content
│   └── seo/                          # NEW: SEO utility components
│       ├── json-ld.tsx               # JSON-LD wrapper component
│       └── schema-generators.ts      # Schema generation utilities
├── lib/
│   ├── product/
│   │   ├── catalog.ts                # MODIFY: Handle Dutch product data
│   │   └── types.ts                  # MODIFY: Add Dutch fields to types
│   ├── metadata/                     # NEW: Metadata utilities
│   │   ├── generators.ts             # generateMetadata helpers
│   │   ├── constants.ts              # Default metadata, site config
│   │   └── types.ts                  # Metadata type definitions
│   └── seo/                          # NEW: SEO utilities
│       ├── structured-data.ts        # JSON-LD generation utilities
│       └── sitemap-helpers.ts        # Sitemap generation helpers
├── data/
│   ├── products.json                 # MODIFY: Add Dutch names/descriptions, remove venetian/textiles
│   ├── pricing/
│   │   ├── roller-blind-white.json   # Keep
│   │   ├── roller-blind-black.json   # Keep
│   │   ├── [venetian-blinds-25mm.json] # REMOVE
│   │   └── [custom-textile.json]     # REMOVE
│   └── seo/                          # NEW: SEO data
│       └── faqs.json                 # Dutch FAQ data (optional, or inline)
└── content/
    └── posts/
        └── *.mdx                     # MODIFY: Dutch blog posts
```

### Structure Rationale

- **app/ follows Next.js 15 conventions:** Metadata files (sitemap.ts, robots.ts) at root level for automatic generation
- **components/seo/ for reusable SEO logic:** JSON-LD wrapper, schema generators avoid duplication across pages
- **lib/metadata/ centralizes metadata logic:** Shared metadata generation functions, constants, types
- **lib/seo/ for structured data utilities:** Separate from metadata as it's injected differently (script tags vs meta tags)
- **data/ remains single source of truth:** Product catalog modified with Dutch content, deprecated products removed
- **No i18n routing needed:** Single Dutch locale, no multi-language routing complexity

## Architectural Patterns

### Pattern 1: Metadata API Integration

**What:** Next.js 15 Metadata API via static `metadata` object or dynamic `generateMetadata()` function

**When to use:**
- Static pages (homepage, category pages): Use `export const metadata: Metadata = {...}`
- Dynamic pages (product details, blog posts): Use `export async function generateMetadata({ params }): Promise<Metadata> {...}`

**Trade-offs:**
- **Pros:** Type-safe, automatic head tag generation, streaming support, no manual head management
- **Cons:** Can't use both metadata object and generateMetadata in same file, requires Server Components

**Example:**
```typescript
// Static metadata (src/app/products/roller-blinds/page.tsx)
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rolgordijnen op Maat | Pure Blinds',
  description: 'Bestel rolgordijnen op maat online. Direct prijzen, premium kwaliteit.',
  openGraph: {
    title: 'Rolgordijnen op Maat | Pure Blinds',
    description: 'Bestel rolgordijnen op maat online.',
    images: ['/og-roller-blinds.jpg'],
  },
}

// Dynamic metadata (src/app/products/[...slug]/page.tsx)
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params
  const productSlug = slug[slug.length - 1]
  const product = getProductBySlug(productSlug)

  if (!product) return {}

  return {
    title: `${product.name} | Pure Blinds`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.imageUrl || '/og-default.jpg'],
      type: 'product',
    },
  }
}
```

### Pattern 2: JSON-LD Structured Data Injection

**What:** Render JSON-LD structured data as `<script type="application/ld+json">` tags within page components

**When to use:**
- Product pages: Product schema
- FAQ sections: FAQPage schema
- Root layout: LocalBusiness schema
- Breadcrumbs: BreadcrumbList schema
- Blog posts: Article schema

**Trade-offs:**
- **Pros:** Separate from metadata, flexible placement, multiple schemas per page, can be dynamic
- **Cons:** XSS risk if not escaped properly, must manually ensure valid JSON, not part of Metadata API

**Example:**
```typescript
// lib/seo/structured-data.ts
export function generateProductSchema(product: Product, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: '49.99',
      highPrice: '299.99',
      availability: 'https://schema.org/InStock',
    },
    brand: {
      '@type': 'Brand',
      name: 'Pure Blinds',
    },
  }
}

// components/seo/json-ld.tsx
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}

// src/app/products/[...slug]/page.tsx
import { JsonLd } from '@/components/seo/json-ld'
import { generateProductSchema } from '@/lib/seo/structured-data'

export default async function ProductPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug[slug.length - 1])

  const productSchema = generateProductSchema(product, `https://pureblinds.nl${getProductUrl(product)}`)

  return (
    <>
      <JsonLd data={productSchema} />
      {/* Page content */}
    </>
  )
}
```

### Pattern 3: Sitemap Generation with Static Routes

**What:** Generate sitemap.xml programmatically using `sitemap.ts` file convention

**When to use:**
- All static routes (homepage, category pages, subcategory pages)
- All product routes (from catalog)
- All blog posts (from Velite)

**Trade-offs:**
- **Pros:** Automatic XML generation, type-safe, integrates with build process, no external packages
- **Cons:** Regenerates on every build (fine for static sites), manual route management

**Example:**
```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from 'next'
import { getAllProducts, getProductUrl } from '@/lib/product/catalog'
import { posts } from '@/.velite'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pureblinds.nl'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products/roller-blinds`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products/roller-blinds/transparent-roller-blinds`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/products/roller-blinds/blackout-roller-blinds`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]

  // Product routes
  const products = getAllProducts().filter(p =>
    p.category === 'roller-blinds' // Exclude removed categories
  )
  const productRoutes: MetadataRoute.Sitemap = products.map(product => ({
    url: `${baseUrl}${getProductUrl(product)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Blog routes
  const blogRoutes: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${baseUrl}${post.permalink}`,
    lastModified: new Date(post.date),
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  }))

  return [...staticRoutes, ...productRoutes, ...blogRoutes]
}
```

### Pattern 4: Dutch Content Without i18n Routing

**What:** Single-locale Dutch content stored inline in components and data files, no routing-based internationalization

**When to use:**
- Single target market (Netherlands)
- No multi-language requirements
- Simpler architecture preferred

**Trade-offs:**
- **Pros:** No i18n library, no routing complexity, simpler build, faster page loads, easier debugging
- **Cons:** Difficult to add second language later, Dutch content hardcoded in components
- **Migration cost:** Low initially, medium-high if internationalization needed later

**Example:**
```typescript
// data/products.json (Dutch names/descriptions)
{
  "id": "roller-blind-white",
  "name": "Wit Rolgordijn",
  "description": "Strak wit rolgordijn op maat gemaakt. Voer je gewenste breedte en hoogte in voor een directe prijsopgave.",
  "category": "roller-blinds",
  "subcategory": "transparent-roller-blinds",
  "details": [
    { "label": "Materiaal", "value": "Stof" },
    { "label": "Kleur", "value": "Wit" },
    { "label": "Afmetingen", "value": "10–200 cm (breedte & hoogte)" },
    { "label": "Productietijd", "value": "3–5 werkdagen" }
  ]
}

// src/app/products/roller-blinds/page.tsx (inline Dutch)
export default function RollerBlindsPage() {
  return (
    <div>
      <h1>Rolgordijnen</h1>
      <p>Kies uit ons assortiment rolgordijnen op maat. Verkrijgbaar in transparante en verduisterende uitvoeringen.</p>
    </div>
  )
}
```

## Data Flow

### SEO Metadata Flow

```
Page Component Request
    ↓
Next.js evaluates metadata export
    ↓
Static metadata object OR generateMetadata() called
    ↓
Metadata API generates <head> tags
    ↓ (parallel)
HTML sent to client with meta tags in <head>
```

### Structured Data Flow

```
Page Component Render (Server Component)
    ↓
JSON-LD generation function called with data
    ↓
JsonLd component renders <script> tag
    ↓
<script> included in HTML sent to client
    ↓
Search engine crawlers parse JSON-LD
```

### Sitemap Generation Flow

```
Build time: next build
    ↓
sitemap.ts exports default function called
    ↓
Function queries product catalog, blog posts
    ↓
Returns array of route objects
    ↓
Next.js generates /sitemap.xml
    ↓
Available at https://domain.com/sitemap.xml
```

### Key Data Flows

1. **Product metadata generation:** Product page renders → generateMetadata() reads product from catalog → returns Metadata object → Next.js generates meta tags
2. **Product schema injection:** Product page renders → generateProductSchema() creates schema object → JsonLd component renders script tag → included in HTML
3. **Sitemap compilation:** Build runs → sitemap.ts queries catalog + Velite posts → returns unified route list → Next.js generates XML
4. **Dutch content rendering:** Component imports from JSON catalog or uses inline Dutch strings → renders to client

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k products | Current approach: Static JSON catalog, build-time sitemap generation |
| 1k-10k products | Incremental Static Regeneration (ISR) for product pages, split sitemap using generateSitemaps() |
| 10k+ products | Database-backed catalog, dynamic sitemap generation, consider CDN caching |

### Scaling Priorities

1. **First bottleneck:** Build time for sitemap with large product catalog
   - **Fix:** Use `generateSitemaps()` to create multiple sitemap files (sitemap index)
   - **Example:** `/sitemap/0.xml`, `/sitemap/1.xml`, etc.
2. **Second bottleneck:** JSON catalog size in client bundles
   - **Fix:** Move to server-only imports, use database for product queries
   - **Note:** Already server-side with current architecture, but JSON parsed at build time

## Anti-Patterns

### Anti-Pattern 1: Reusing English Metadata for All Pages

**What people do:** Set metadata once in root layout, don't override in child routes
**Why it's wrong:** Generic metadata doesn't help SEO, missed opportunity for targeted keywords
**Do this instead:** Every route should have specific, descriptive metadata matching Dutch content

### Anti-Pattern 2: Mixing i18n Library with Single-Locale Content

**What people do:** Install next-intl or react-i18next for single Dutch locale
**Why it's wrong:** Adds complexity, bundle size, slower builds for zero benefit when not supporting multiple languages
**Do this instead:** Use inline Dutch content, JSON with Dutch values, simple approach

### Anti-Pattern 3: Manual Meta Tag Management

**What people do:** Bypass Metadata API, use `<Head>` or manual `<meta>` tags in components
**Why it's wrong:** Breaks Next.js optimization, streaming, type safety, automatic deduplication
**Do this instead:** Always use Metadata API (metadata object or generateMetadata())

### Anti-Pattern 4: Generating JSON-LD at Client Side

**What people do:** Create JSON-LD in client components or useEffect hooks
**Why it's wrong:** Search engines may not execute JavaScript, slower indexing, not in initial HTML
**Do this instead:** Render JSON-LD in Server Components so it's in initial HTML response

### Anti-Pattern 5: Forgetting noindex for Non-Public Pages

**What people do:** Leave cart, checkout, confirmation pages indexable
**Why it's wrong:** Wastes crawl budget, creates thin content, confuses users in search results
**Do this instead:** Add `robots: { index: false, follow: false }` to metadata for private pages

**Example:**
```typescript
// src/app/cart/page.tsx
export const metadata: Metadata = {
  title: 'Winkelwagen | Pure Blinds',
  robots: {
    index: false,
    follow: false,
  },
}
```

### Anti-Pattern 6: Not Escaping JSON-LD Content

**What people do:** Use `dangerouslySetInnerHTML` with user input or unescaped content
**Why it's wrong:** XSS vulnerability, security risk
**Do this instead:** Always escape `<` characters: `JSON.stringify(data).replace(/</g, '\\u003c')`

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Search Console | Submit sitemap.xml | After deployment, submit https://pureblinds.nl/sitemap.xml |
| Schema.org validators | Test JSON-LD | Use Rich Results Test, Schema Markup Validator |
| OpenGraph debuggers | Test OG tags | Facebook Sharing Debugger, LinkedIn Post Inspector |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Metadata API ↔ Product Catalog | Direct import | Product data imported in generateMetadata(), synchronous |
| Sitemap ↔ Product Catalog | Direct import | Catalog queried at build time, must be pure function |
| Sitemap ↔ Velite Blog | Import from .velite output | Posts array imported, type-safe |
| JSON-LD ↔ Components | Function call | Schema generators called with component data |
| Root Layout ↔ Child Pages | Metadata inheritance | Child metadata merged with parent, can override |

## Migration Strategy for Category Removal

### Affected Integration Points

1. **Product catalog (data/products.json):**
   - Remove venetian-blinds and textiles entries
   - Update filters in sitemap generation

2. **Route files:**
   - Delete `/src/app/products/venetian-blinds/`
   - Delete `/src/app/products/textiles/`

3. **Sitemap generation:**
   - Filter products: `getAllProducts().filter(p => p.category === 'roller-blinds')`

4. **Pricing files:**
   - Remove `/data/pricing/venetian-blinds-25mm.json`
   - Remove `/data/pricing/custom-textile.json`

5. **Type definitions:**
   - Update category type unions if hardcoded

### Safe Removal Order

1. Remove route files (prevents 200 responses)
2. Update product catalog (removes data source)
3. Update sitemap filter (prevents orphaned URLs)
4. Remove pricing files (cleanup)
5. Test build, verify sitemap excludes removed categories

## Build Order Recommendations

Based on dependency analysis, recommended implementation order:

### Phase 1: Foundation (No Dependencies)
1. **Root layout lang change:** `<html lang="nl">` (single line change)
2. **Create lib/metadata/constants.ts:** Site-wide metadata defaults, base URL
3. **Create lib/seo/structured-data.ts:** Schema generator utilities
4. **Create components/seo/json-ld.tsx:** JSON-LD wrapper component

### Phase 2: Data Layer (Depends on Phase 1 constants)
5. **Update data/products.json:** Dutch names, descriptions; remove venetian-blinds, textiles
6. **Remove deprecated pricing files:** venetian-blinds-25mm.json, custom-textile.json
7. **Update lib/product/types.ts:** Ensure types match Dutch data structure

### Phase 3: Route Removal (Depends on Phase 2 data)
8. **Delete deprecated routes:** /products/venetian-blinds/, /products/textiles/
9. **Test product catalog functions:** Verify no references to removed categories

### Phase 4: Static Routes Content (Depends on Phase 2 data)
10. **Update homepage (/):** Dutch content, metadata, LocalBusiness JSON-LD
11. **Update products overview (/products):** Dutch content, metadata
12. **Update category page (/products/roller-blinds):** Dutch content, metadata
13. **Update subcategory pages:** transparent-roller-blinds, blackout-roller-blinds

### Phase 5: Dynamic Routes Metadata (Depends on Phase 4)
14. **Update product detail page:** generateMetadata(), Product JSON-LD
15. **Update blog index:** Dutch content, metadata
16. **Update blog post page:** generateMetadata(), Article JSON-LD (optional)

### Phase 6: Components (Depends on Phase 4 content)
17. **Update Header:** Dutch navigation labels
18. **Update Footer:** Dutch footer content
19. **Update Breadcrumbs:** Dutch labels, BreadcrumbList JSON-LD
20. **Update FAQ section:** Dutch FAQs, FAQPage JSON-LD
21. **Update other home sections:** Dutch content

### Phase 7: SEO Infrastructure (Depends on all previous phases)
22. **Create sitemap.ts:** Generate from catalog + blog posts
23. **Create robots.ts:** Configure crawling rules
24. **Add noindex to cart/confirmation:** Prevent indexing

### Phase 8: Polish (Depends on Phase 7)
25. **Add OpenGraph images:** opengraph-image.jpg files per route (optional)
26. **Test all metadata:** Validate with tools
27. **Test all JSON-LD:** Validate with Rich Results Test

### Dependency Rationale

- **Phase 1 before 2:** Constants needed by data updates
- **Phase 2 before 3:** Data must be updated before routes removed (prevents broken references)
- **Phase 3 before 4:** Clean slate before content updates
- **Phase 4 before 5:** Static route patterns inform dynamic route patterns
- **Phase 5 before 6:** Components reference routes, better to have route metadata ready
- **Phase 6 before 7:** Sitemap needs all routes finalized
- **Phase 7 before 8:** Infrastructure must exist before optimization

### Critical Path

**Fastest path to working Dutch site with SEO:**
Phase 1 (#1) → Phase 2 (#5, #6) → Phase 3 (#8) → Phase 4 (#10-13) → Phase 7 (#22, #23)

This gives:
- Dutch language attribute
- Dutch product data
- Removed deprecated categories
- Dutch static pages
- Sitemap and robots.txt

Remaining phases (5, 6, 8) are enhancements that can be done incrementally.

## Sources

**Next.js 15 Metadata API:**
- [Functions: generateMetadata | Next.js](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Getting Started: Metadata and OG images | Next.js](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Next.js 15 SEO: Complete Guide to Metadata & Optimization](https://www.digitalapplied.com/blog/nextjs-seo-guide)

**Sitemap Generation:**
- [Metadata Files: sitemap.xml | Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Functions: generateSitemaps | Next.js](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps)

**Robots.txt:**
- [Metadata Files: robots.txt | Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)

**JSON-LD Structured Data:**
- [Guides: JSON-LD | Next.js](https://nextjs.org/docs/app/guides/json-ld)
- [JSON‑LD in Next.js 15 App Router: product, blog and breadcrumb schemas](https://medium.com/@sureshdotariya/json-ld-in-next-js-15-app-router-product-blog-and-breadcrumb-schemas-f752b7422c4f)

**OpenGraph Images:**
- [Metadata Files: opengraph-image and twitter-image | Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)

**Internationalization:**
- [Guides: Internationalization | Next.js](https://nextjs.org/docs/pages/guides/internationalization)
- [Next.js App Router internationalization (i18n)](https://next-intl.dev/docs/getting-started/app-router)

**Hreflang and Locale Metadata:**
- [How to Use Canonical Tags and Hreflang for in Next.js 15](https://www.buildwithmatija.com/blog/nextjs-advanced-seo-multilingual-canonical-tags)
- [Next.js 15 SEO: Complete Guide to Metadata & Optimization](https://www.digitalapplied.com/blog/nextjs-seo-guide)

---
*Architecture research for: Dutch content & SEO integration in Next.js 15 App Router*
*Researched: 2026-02-14*
