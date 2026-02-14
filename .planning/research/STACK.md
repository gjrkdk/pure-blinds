# Stack Research

**Domain:** Dutch E-commerce SEO & Localization
**Researched:** 2026-02-14
**Confidence:** HIGH

## Executive Summary

For adding Dutch content, SEO meta tags, structured data, and GEO optimization to an existing Next.js 15 App Router application, **NO external dependencies are required**. Next.js 15 (v16.1.6) provides native built-in APIs for all required functionality:

- **Metadata API** for meta tags, OpenGraph, Twitter cards, hreflang
- **File conventions** for sitemap.xml and robots.txt generation
- **Native JSON-LD** support for structured data (Product, FAQ, LocalBusiness schemas)
- **Built-in i18n** capabilities for language/locale specification

The only recommended addition is **schema-dts** (dev dependency) for TypeScript type safety when authoring JSON-LD structured data.

**Key Decision:** Do NOT add next-intl, next-sitemap, or react-schemaorg. Next.js native features are superior for single-language sites.

## Recommended Stack Additions

### Type Safety for Structured Data

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| schema-dts | ^1.1.5 | TypeScript types for Schema.org JSON-LD | Google-maintained TypeScript definitions for all Schema.org types. Provides compile-time validation for Product, FAQ, LocalBusiness schemas. Zero runtime cost (types-only package). |

### No Framework Changes Required

**Existing Stack Remains:**
- Next.js 16.1.6 (already installed as "next": "16.1.6")
- TypeScript
- All existing dependencies

## Installation

```bash
# Only add type definitions for structured data
npm install -D schema-dts
```

## Next.js 15 Built-In SEO Features (No Installation Needed)

### 1. Metadata API (Built-in)

**What it does:** Generates meta tags, OpenGraph, Twitter cards, canonical URLs, hreflang
**Already available:** Yes, imported from `'next'` as `Metadata` type
**Current usage:** Project already uses this in `src/app/layout.tsx`

**Key capabilities:**
- `metadata` object for static metadata
- `generateMetadata()` function for dynamic metadata
- Hierarchical metadata merging from root → page
- Full TypeScript support with `Metadata` type

**Dutch market specifics:**
```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://pureblinds.nl'),
  title: 'Maatwerk Rolgordijnen Online',
  description: 'Bestel rolgordijnen op maat online...',
  openGraph: {
    locale: 'nl_NL',
    type: 'website',
    siteName: 'Pure Blinds',
  },
  alternates: {
    canonical: 'https://pureblinds.nl',
    languages: {
      'nl-NL': 'https://pureblinds.nl',
    },
  },
}
```

### 2. Sitemap Generation (Built-in)

**What it does:** Creates sitemap.xml automatically
**File convention:** `app/sitemap.ts` or `app/sitemap.xml`
**Already available:** Yes (Next.js 15.0+)

**Implementation pattern:**
```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://pureblinds.nl',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://pureblinds.nl/rolgordijnen',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
}
```

**Advanced features:**
- Dynamic sitemap generation from database/CMS
- Image sitemaps (product images)
- Multiple sitemaps via `generateSitemaps()` for large catalogs (50k+ URLs)
- Cached by default unless using Dynamic APIs

### 3. Robots.txt Generation (Built-in)

**What it does:** Creates robots.txt for search engine crawlers
**File convention:** `app/robots.ts` or `app/robots.txt`
**Already available:** Yes (Next.js 15.0+)

**Implementation pattern:**
```typescript
// src/app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://pureblinds.nl/sitemap.xml',
  }
}
```

### 4. JSON-LD Structured Data (Built-in)

**What it does:** Adds Schema.org structured data for rich snippets
**Implementation:** Inline `<script type="application/ld+json">` in components
**Already available:** Yes (standard Next.js pattern)

**Recommended with schema-dts:**
```typescript
import { Product, LocalBusiness, FAQPage, WithContext } from 'schema-dts'

// In product page component
const productSchema: WithContext<Product> = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Transparant Rolgordijn op Maat',
  description: 'Hoogwaardig transparant rolgordijn...',
  image: 'https://pureblinds.nl/products/transparant.jpg',
  offers: {
    '@type': 'Offer',
    price: '49.99',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
  },
}

return (
  <section>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(productSchema).replace(/</g, '\\u003c'),
      }}
    />
    {/* Product UI */}
  </section>
)
```

**Security note:** Always escape `<` characters to prevent XSS: `.replace(/</g, '\\u003c')`

### 5. Language Specification (Built-in)

**What it does:** Sets HTML lang attribute and hreflang tags
**Already available:** Yes, via Metadata API

**For Dutch single-language site:**
```typescript
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="nl-NL"> {/* Change from "en" to "nl-NL" */}
      <body>{children}</body>
    </html>
  )
}

// Add to metadata in layout.tsx
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    languages: {
      'nl-NL': '/',
    },
  },
}
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Next.js Metadata API** | next-seo package | Never for Next.js 15 App Router. next-seo was designed for Pages Router and adds unnecessary dependency. Metadata API is superior. |
| **Next.js sitemap.ts** | next-sitemap package | Only if you need advanced sitemap index files or complex post-build processing. Built-in API covers 95% of use cases. |
| **schema-dts types** | react-schemaorg | Only if you prefer React component API for schemas. schema-dts is lighter (types-only) and more flexible. |
| **No i18n framework** | next-intl | Only when supporting MULTIPLE languages with locale routing. Overkill for single-language (Dutch-only) site. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **next-seo** | Designed for Pages Router, not App Router. Incompatible with Next.js 15 Metadata API patterns. | Built-in Metadata API |
| **next-intl** | Adds routing complexity, bundle size, and configuration overhead for single-language site. | Built-in metadata.alternates.languages and html lang attribute |
| **react-helmet** | Client-side meta tag manipulation. Breaks Next.js SSR/SSG optimization. Outdated pattern. | Built-in Metadata API (server-side) |
| **react-schemaorg** | Runtime dependency for schema generation. schema-dts provides same TypeScript safety without runtime cost. | schema-dts (dev dependency only) |
| **Manual meta tags** | Writing `<meta>` tags directly in `<head>` bypasses Next.js optimization and breaks metadata merging. | Metadata API with hierarchical merging |

## Stack Patterns for Dutch E-commerce SEO

### Pattern 1: Product Pages with Structured Data

```typescript
// src/app/rolgordijnen/[category]/[slug]/page.tsx
import type { Metadata } from 'next'
import type { Product, WithContext } from 'schema-dts'

export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug)

  return {
    title: `${product.name} | Pure Blinds`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
      locale: 'nl_NL',
      type: 'product.item',
    },
  }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug)

  const schema: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price.toString(),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
        }}
      />
      {/* Product UI */}
    </>
  )
}
```

### Pattern 2: LocalBusiness Schema for GEO Optimization

```typescript
// src/app/layout.tsx or specific landing page
import type { LocalBusiness, WithContext } from 'schema-dts'

const businessSchema: WithContext<LocalBusiness> = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Pure Blinds',
  description: 'Maatwerk rolgordijnen voor heel Nederland',
  url: 'https://pureblinds.nl',
  telephone: '+31-XX-XXX-XXXX',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Straatnaam XX',
    addressLocality: 'Amsterdam',
    postalCode: '1234 AB',
    addressCountry: 'NL',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Nederland',
  },
  priceRange: '€€',
}
```

### Pattern 3: FAQ Schema for Category Pages

```typescript
// src/app/rolgordijnen/page.tsx
import type { FAQPage, WithContext } from 'schema-dts'

const faqSchema: WithContext<FAQPage> = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Hoe meet ik mijn raam op?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Meet de breedte van uw raam...',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat is het verschil tussen transparant en verduisterend?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Transparante rolgordijnen...',
      },
    },
  ],
}
```

### Pattern 4: Dynamic Sitemap from Product Database

```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from 'next'
import { getAllProducts, getAllCategories } from '@/lib/data'

export default async function sitemap(): MetadataRoute.Sitemap {
  const categories = await getAllCategories()
  const products = await getAllProducts()

  const categoryUrls = categories.map((cat) => ({
    url: `https://pureblinds.nl/rolgordijnen/${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const productUrls = products.map((product) => ({
    url: `https://pureblinds.nl/rolgordijnen/${product.category}/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
    images: [product.image],
  }))

  return [
    {
      url: 'https://pureblinds.nl',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...categoryUrls,
    ...productUrls,
  ]
}
```

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| schema-dts | 1.1.5 | Next.js 15+, TypeScript 5+ | Types-only, no runtime dependencies |
| Next.js | 16.1.6 | All features used | Metadata API stable since v13.2.0, sitemap/robots since v13.3.0 |
| TypeScript | 5.x | schema-dts 1.1.5 | Required for WithContext and schema types |

**Critical compatibility notes:**
- Metadata API is Server Components only (cannot use in 'use client' components)
- File-based metadata (opengraph-image.tsx, etc.) takes precedence over Metadata object
- `generateMetadata` automatically memoizes fetch requests across components

## Migration from English to Dutch

### Required Changes

1. **Root layout language:**
   ```typescript
   // src/app/layout.tsx
   <html lang="nl-NL"> {/* was: lang="en" */}
   ```

2. **Metadata locale:**
   ```typescript
   export const metadata: Metadata = {
     openGraph: {
       locale: 'nl_NL', // was: 'en_US'
     },
   }
   ```

3. **metadataBase:**
   ```typescript
   export const metadata: Metadata = {
     metadataBase: new URL('https://pureblinds.nl'),
   }
   ```

4. **Currency in Product schemas:**
   ```typescript
   offers: {
     '@type': 'Offer',
     priceCurrency: 'EUR', // Netherlands uses Euro
   }
   ```

### No Changes Needed

- **No routing changes** (single language, no /nl/ prefix needed)
- **No locale detection** (always serve Dutch)
- **No translation framework** (content is Dutch-only)

## SEO Checklist for Netherlands Market

### Meta Tags (via Metadata API)
- [x] `<html lang="nl-NL">`
- [x] Title (50-60 characters, Dutch keywords)
- [x] Description (150-160 characters)
- [x] OpenGraph tags (og:locale = 'nl_NL')
- [x] Twitter Card tags
- [x] Canonical URL
- [x] hreflang="nl-NL" (via alternates.languages)

### Structured Data (via JSON-LD + schema-dts)
- [x] Product schema (price in EUR)
- [x] LocalBusiness schema (address in Netherlands)
- [x] FAQPage schema (Dutch questions)
- [x] BreadcrumbList schema (category navigation)

### Crawling & Indexing
- [x] robots.txt (via robots.ts)
- [x] sitemap.xml (via sitemap.ts with Dutch URLs)
- [x] Image sitemaps (product photos)

### GEO Optimization
- [x] LocalBusiness.address.addressCountry = 'NL'
- [x] LocalBusiness.areaServed = 'Nederland'
- [x] Currency: EUR throughout
- [x] Phone: +31 country code
- [x] Postal code format: '1234 AB'

## Sources

### Official Next.js Documentation (v16.1.6)
- [Metadata API](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) — Complete metadata guide (last updated: 2026-02-11)
- [generateMetadata Reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — Full API specification with alternates, openGraph, twitter fields
- [sitemap.xml](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) — File convention and MetadataRoute.Sitemap type
- [robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) — File convention and MetadataRoute.Robots type
- [JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) — Recommended patterns for structured data

### Official npm Packages
- [schema-dts v1.1.5](https://www.npmjs.com/package/schema-dts) — Latest version released 2025-03-01
- [schema-dts GitHub](https://github.com/google/schema-dts) — Official repository, 1.1k stars

### Community & Best Practices (2026)
- [Next.js 15 SEO Guide 2026](https://www.sujalbuild.in/blog/nextjs-seo-performance-guide) — MEDIUM confidence (WebSearch verified)
- [Complete Guide to SEO in Next.js 15](https://medium.com/@thomasaugot/the-complete-guide-to-seo-optimization-in-next-js-15-1bdb118cffd7) — MEDIUM confidence (community practices)
- [Next.js Internationalization Guide](https://nextjs.org/docs/app/guides/internationalization) — HIGH confidence (official docs, 2026-02-11)

**Confidence Assessment:**
- **Next.js built-in features:** HIGH (official documentation, verified API references)
- **schema-dts usage:** HIGH (official Google package, npm verified)
- **Dutch market specifics:** MEDIUM (based on standard i18n practices + Schema.org country codes)
- **SEO best practices:** MEDIUM (WebSearch verified with official docs crosscheck)

---

*Stack research for: Pure Blinds Dutch E-commerce SEO*
*Researched: 2026-02-14*
*Next research: Phase-specific implementation patterns*
