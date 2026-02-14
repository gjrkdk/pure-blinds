# Phase 17: Structured Data - Research

**Researched:** 2026-02-14
**Domain:** Schema.org JSON-LD structured data for SEO
**Confidence:** HIGH

## Summary

Schema.org JSON-LD structured data enhances search engine understanding and enables rich results eligibility. Next.js 15 recommends inline `<script>` tags with `type="application/ld+json"` in page/layout components. The primary security concern is XSS injection through JSON.stringify, mitigated by replacing `<` with `\u003c`. TypeScript type safety via schema-dts (Google-maintained) prevents schema validation errors. Google's Rich Results Test validates eligibility, while Schema.org Markup Validator validates spec compliance.

The user has decided on five schema types: Product (with EUR pricing and InStock availability), FAQPage, BreadcrumbList, Organization, and BlogPosting. The implementation must prevent XSS vulnerabilities and validate in Google's tools.

**Primary recommendation:** Use inline JSON-LD script tags in Server Components with schema-dts TypeScript types, XSS escaping via `.replace(/</g, '\\u003c')`, and validation with both Google Rich Results Test and Schema.org Markup Validator.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Product price display:**
- Use starting price (lowest matrix price) as the schema price — "vanaf" pricing
- Currency: EUR
- Availability: InStock (made-to-measure, always available)
- Condition: NewCondition
- Brand: "Pure Blinds"

**Schema types to implement:**
- **Product** — On product detail pages (required by success criteria)
- **FAQPage** — On homepage FAQ section (required by success criteria)
- **BreadcrumbList** — On all pages with breadcrumb navigation (matches existing UI breadcrumbs)
- **Organization** — On homepage (brand presence in Knowledge Panel)
- **BlogPosting** — On individual blog post pages (rich results for content marketing)
- **Skip WebSite** — No site search exists, add WebSite schema later when search is built

**Business identity (Organization schema):**
- Name: "Pure Blinds"
- Email: info@pureblinds.nl (placeholder — update with real email later)
- Logo: Reference current site logo asset
- No phone number for now

### Claude's Discretion

- JSON-LD placement strategy (layout-level vs page-level components)
- Exact Schema.org property selection beyond what's specified
- BlogPosting author/publisher structure
- BreadcrumbList generation approach (static vs dynamic from route)
- XSS escaping strategy for JSON-LD content

### Deferred Ideas (OUT OF SCOPE)

- WebSite schema with SearchAction — add when site search functionality is built
- AggregateRating/Review schema — add when real customer reviews exist
- LocalBusiness schema — consider if physical location becomes relevant

</user_constraints>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| schema-dts | ^1.1.2 | TypeScript definitions for Schema.org | Google-maintained, complete type coverage, discriminated unions for validation |
| Next.js (built-in) | 16.1.6 | JSON-LD rendering in Server Components | Official Next.js recommendation, no extra dependencies |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| serialize-javascript | ^6.0.2 | XSS-safe JSON serialization | Alternative to manual `.replace()` escaping (optional) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| schema-dts | Untyped objects | Lose compile-time validation, easier to make schema errors |
| Inline script tags | next-seo library | Adds dependency, but provides pre-built components and validation |
| Manual `.replace()` | serialize-javascript | Slightly more robust escaping, but adds dependency |

**Installation:**

```bash
npm install schema-dts
# Optional for XSS escaping alternative:
npm install serialize-javascript
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   └── schema/              # Schema.org utilities
│       ├── types.ts         # Re-exported schema-dts types
│       ├── product.ts       # Product schema builder
│       ├── faq.ts           # FAQPage schema builder
│       ├── breadcrumb.ts    # BreadcrumbList schema builder
│       ├── organization.ts  # Organization schema builder
│       ├── blog.ts          # BlogPosting schema builder
│       └── jsonld.tsx       # Reusable JsonLd component
└── app/
    ├── layout.tsx           # Organization schema (site-wide)
    ├── page.tsx             # FAQPage schema (homepage)
    ├── products/[...slug]/page.tsx  # Product + BreadcrumbList schemas
    └── blog/[slug]/page.tsx         # BlogPosting + BreadcrumbList schemas
```

### Pattern 1: Server Component with Inline JSON-LD

**What:** Render JSON-LD as inline `<script>` tag directly in Server Component
**When to use:** Data is known at build/request time (most cases)
**Example:**

```typescript
// Source: https://nextjs.org/docs/app/guides/json-ld
import { Product, WithContext } from 'schema-dts'

export default async function ProductPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug[slug.length - 1])

  const jsonLd: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Pure Blinds'
    },
    offers: {
      '@type': 'Offer',
      price: '10.00', // Starting price in EUR
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  }

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
        }}
      />
      {/* Rest of page content */}
    </section>
  )
}
```

### Pattern 2: Reusable JsonLd Component

**What:** Extract JSON-LD rendering into reusable component
**When to use:** Reduce duplication across multiple pages
**Example:**

```typescript
// src/lib/schema/jsonld.tsx
import { Thing, WithContext } from 'schema-dts'

export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c')
      }}
    />
  )
}

// Usage in page
import { JsonLd } from '@/lib/schema/jsonld'

export default function ProductPage() {
  const jsonLd: WithContext<Product> = { /* ... */ }
  return (
    <>
      <JsonLd data={jsonLd} />
      {/* Page content */}
    </>
  )
}
```

### Pattern 3: Schema Builder Functions

**What:** Separate schema construction logic from page components
**When to use:** Complex schemas with conditional properties, reusable across multiple pages
**Example:**

```typescript
// src/lib/schema/product.ts
import type { Product as ProductType } from '@/lib/product/types'
import type { PricingMatrixData } from '@/lib/pricing/types'
import { Product, WithContext } from 'schema-dts'

export function buildProductSchema(
  product: ProductType,
  pricingMatrix: PricingMatrixData,
  baseUrl: string
): WithContext<Product> {
  // Find minimum price from matrix (for "vanaf" pricing)
  const minPrice = Math.min(...pricingMatrix.matrix.flat())
  const priceInEur = (minPrice / 100).toFixed(2)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Pure Blinds'
    },
    offers: {
      '@type': 'Offer',
      price: priceInEur,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  }
}
```

### Pattern 4: Multiple Schemas on Same Page

**What:** Render multiple JSON-LD scripts on a single page
**When to use:** Pages that represent multiple schema types (e.g., Product page with BreadcrumbList)
**Example:**

```typescript
export default function ProductPage() {
  const productSchema: WithContext<Product> = { /* ... */ }
  const breadcrumbSchema: WithContext<BreadcrumbList> = { /* ... */ }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema).replace(/</g, '\\u003c')
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c')
        }}
      />
      {/* Page content */}
    </>
  )
}
```

### Pattern 5: FAQPage from Array Data

**What:** Transform FAQ array into FAQPage schema
**When to use:** Pages with Q&A sections like homepage FAQ
**Example:**

```typescript
// Source: https://developers.google.com/search/docs/appearance/structured-data/faqpage
import { FAQPage, WithContext } from 'schema-dts'

const FAQ_ITEMS = [
  { question: "What sizes?", answer: "Any custom size..." },
  // ... more FAQs
]

const faqSchema: WithContext<FAQPage> = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
    }
  }))
}
```

### Anti-Patterns to Avoid

- **Client-side JSON-LD rendering:** Google may not index client-rendered schemas. Always use Server Components.
- **Mismatched UI and schema data:** BreadcrumbList schema must exactly match visible breadcrumbs. Discrepancies signal manipulation.
- **Marking up invisible content:** All schema content must be visible to users on the page (except structural properties like @context).
- **Using JSON.stringify without XSS escaping:** Always replace `<` characters or use serialize-javascript.
- **Hardcoding URLs:** Use absolute URLs constructed from request context, not hardcoded domains.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema.org TypeScript types | Manual interface definitions for 800+ schema types | schema-dts | Google-maintained, auto-generated from official Schema.org definitions, discriminated unions catch errors |
| XSS sanitization | Custom regex-based HTML tag stripping | `.replace(/</g, '\\u003c')` or serialize-javascript | Proven patterns, XSS is subtle and dangerous to get wrong |
| Schema validation | Custom JSON-LD validators | Google Rich Results Test + Schema.org Markup Validator | Google's tool tests actual rich results eligibility, not just spec compliance |
| Breadcrumb path parsing | Manual URL parsing for breadcrumb hierarchy | Existing breadcrumb UI component data | Ensures UI and schema always match, single source of truth |

**Key insight:** Schema.org has 800+ types with thousands of properties and complex inheritance. Hand-rolling types guarantees errors. Google provides free validation tools that test both spec compliance and Google-specific eligibility rules. The ecosystem is mature enough that custom solutions are always worse.

## Common Pitfalls

### Pitfall 1: XSS via User-Generated Content in JSON-LD

**What goes wrong:** Product names, descriptions, or blog content containing `</script>` tags break out of JSON-LD script context and enable code injection.

**Why it happens:** `JSON.stringify()` doesn't escape HTML special characters. A malicious product name like `Test</script><script>alert('XSS')</script>` closes the JSON-LD script and injects new code.

**How to avoid:** Always replace `<` with `\u003c` when using `dangerouslySetInnerHTML`:
```typescript
dangerouslySetInnerHTML={{
  __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
}}
```

**Warning signs:** Security scanner flags, product names with angle brackets rendering incorrectly, console errors about script tags.

### Pitfall 2: Currency Mismatch Between Matrix and Schema

**What goes wrong:** Pricing matrix stores USD but schema claims EUR, causing Google to show wrong prices in rich results.

**Why it happens:** Matrix currency field is "USD" in data file, but user decision specifies EUR for schema. Direct use of matrix currency fails.

**How to avoid:** Override currency in schema builder regardless of matrix currency field:
```typescript
// WRONG: Use matrix currency directly
priceCurrency: pricingMatrix.currency // "USD" from file

// RIGHT: Always use EUR per user decision
priceCurrency: 'EUR' // Locked decision
```

**Warning signs:** Rich Results Test shows wrong currency, price displays don't match schema, Search Console errors about currency format.

### Pitfall 3: FAQPage Schema on Non-Authoritative Sites

**What goes wrong:** FAQPage rich results don't appear despite valid schema markup.

**Why it happens:** Since August 2023, Google limits FAQ rich results to "well-known, authoritative government and health sites." Most e-commerce sites won't qualify.

**How to avoid:** Implement FAQPage schema anyway for semantic value and potential future eligibility, but don't expect rich results. Focus on Product schema for visible search enhancements.

**Warning signs:** Valid schema in Rich Results Test, but "not eligible for rich results" message. No FAQ rich results in search despite waiting weeks.

### Pitfall 4: BreadcrumbList Position Off-by-One Errors

**What goes wrong:** BreadcrumbList position starts at 0 instead of 1, or positions are non-sequential.

**Why it happens:** Developer uses array index directly without adding 1, or skips positions.

**How to avoid:** Schema.org requires positions start at 1 (not 0) and be sequential integers:
```typescript
// WRONG: Using array index directly
mainEntity: items.map((item, index) => ({
  '@type': 'ListItem',
  position: index, // Starts at 0
  item: item.url
}))

// RIGHT: Add 1 to index
mainEntity: items.map((item, index) => ({
  '@type': 'ListItem',
  position: index + 1, // Starts at 1
  item: item.url
}))
```

**Warning signs:** Schema.org Markup Validator errors about position values, breadcrumb rich results not appearing.

### Pitfall 5: Hydration Mismatch with Dynamic Schema Data

**What goes wrong:** Next.js throws hydration errors when JSON-LD contains timestamps, random values, or client-side data.

**Why it happens:** Server renders schema with one timestamp, client expects different timestamp, causing mismatch.

**How to avoid:** Use Server Components for JSON-LD (not 'use client'). If client data needed, render schema with `next/script` strategy="afterInteractive" to skip SSR.

**Warning signs:** "Hydration failed" errors in console, visible layout shifts, JSON-LD script appears twice in HTML.

### Pitfall 6: Missing Required vs. Recommended Properties

**What goes wrong:** Schema validates but doesn't qualify for rich results.

**Why it happens:** Confusion between Schema.org spec (permissive) and Google's requirements (stricter). For example, Product schema without `offers` validates but won't show price in search.

**How to avoid:** Use Google Rich Results Test, not just Schema.org Validator. Google's tool shows which properties block rich results eligibility.

**Warning signs:** Green validation in Schema.org Validator, but "not eligible for rich results" in Google's tool. Missing "price", "availability", or "image" errors.

### Pitfall 7: Relative URLs in Schema Properties

**What goes wrong:** Schema contains relative URLs like `/products/roller-blind-white` instead of absolute URLs.

**Why it happens:** Developer uses Next.js `href` values directly without converting to absolute URLs.

**How to avoid:** Always construct absolute URLs for schema properties:
```typescript
// WRONG: Relative URL
item: product.slug

// RIGHT: Absolute URL
item: `https://pureblinds.nl/products/${product.category}/${product.slug}`
```

**Warning signs:** Schema validation errors about invalid URL format, rich results not appearing despite valid schema.

## Code Examples

Verified patterns from official sources:

### Product Schema with Minimum Price

```typescript
// Source: https://schema.org/Product
// Strategy: Use minimum matrix price for "vanaf" pricing
import { Product, WithContext, Offer } from 'schema-dts'
import type { Product as ProductType } from '@/lib/product/types'
import type { PricingMatrixData } from '@/lib/pricing/types'

export function buildProductSchema(
  product: ProductType,
  pricingMatrix: PricingMatrixData,
  baseUrl: string
): WithContext<Product> {
  // Calculate minimum price from matrix (for "vanaf" pricing)
  const minPriceInCents = Math.min(...pricingMatrix.matrix.flat())
  const minPriceInEur = (minPriceInCents / 100).toFixed(2)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: `${baseUrl}/png/${product.slug}.png`, // Absolute URL
    brand: {
      '@type': 'Brand',
      name: 'Pure Blinds'
    },
    offers: {
      '@type': 'Offer',
      price: minPriceInEur,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `${baseUrl}/products/${product.category}/${product.subcategory}/${product.slug}`
    }
  }
}
```

### FAQPage Schema from Array

```typescript
// Source: https://developers.google.com/search/docs/appearance/structured-data/faqpage
import { FAQPage, WithContext } from 'schema-dts'

interface FaqItem {
  question: string
  answer: string
}

export function buildFaqSchema(faqItems: FaqItem[]): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }
}
```

### BreadcrumbList Schema from UI Breadcrumbs

```typescript
// Source: https://schema.org/BreadcrumbList
import { BreadcrumbList, WithContext } from 'schema-dts'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

export function buildBreadcrumbSchema(
  items: BreadcrumbItem[],
  baseUrl: string
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1, // IMPORTANT: Schema.org positions start at 1
      name: item.label,
      item: item.href ? `${baseUrl}${item.href}` : undefined
    }))
  }
}
```

### Organization Schema

```typescript
// Source: https://developers.google.com/search/docs/appearance/structured-data/organization
import { Organization, WithContext } from 'schema-dts'

export function buildOrganizationSchema(baseUrl: string): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pure Blinds',
    url: baseUrl,
    logo: `${baseUrl}/svg/logo.svg`, // Absolute URL to logo
    email: 'info@pureblinds.nl',
    // Optional: Add social media profiles when available
    // sameAs: [
    //   'https://www.facebook.com/pureblinds',
    //   'https://www.instagram.com/pureblinds'
    // ]
  }
}
```

### BlogPosting Schema

```typescript
// Source: https://developers.google.com/search/docs/appearance/structured-data/article
import { BlogPosting, WithContext } from 'schema-dts'

interface BlogPost {
  title: string
  excerpt: string
  date: string
  slug: string
  readingTime: string
}

export function buildBlogPostSchema(
  post: BlogPost,
  baseUrl: string
): WithContext<BlogPosting> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Organization', // Use Organization as author/publisher
      name: 'Pure Blinds'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pure Blinds',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/svg/logo.svg`
      }
    },
    url: `${baseUrl}/blog/${post.slug}`
  }
}
```

### Reusable JsonLd Component with XSS Protection

```typescript
// Source: https://nextjs.org/docs/app/guides/json-ld
import { Thing, WithContext } from 'schema-dts'

export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        // XSS protection: Replace < with Unicode escape
        __html: JSON.stringify(data).replace(/</g, '\\u003c')
      }}
    />
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Microdata in HTML | JSON-LD in `<script>` tags | 2015-2016 | Cleaner separation of content and schema, easier maintenance |
| Manual schema types | schema-dts TypeScript definitions | 2021 (v1.0) | Compile-time validation prevents schema errors |
| Structured Data Testing Tool | Rich Results Test + Schema Markup Validator | 2020 | Rich Results Test shows Google-specific eligibility vs. generic spec validation |
| FAQ rich results for all sites | Limited to government/health sites | August 2023 | E-commerce sites no longer eligible for FAQ rich results |
| 'use client' components | Server Components for JSON-LD | Next.js 13+ (2022) | Avoids hydration issues, simpler implementation |

**Deprecated/outdated:**
- **Microdata/RDFa format:** Google still supports it but JSON-LD is preferred. Easier to maintain, no HTML structure coupling.
- **Structured Data Testing Tool:** Deprecated by Google in 2020. Use Rich Results Test for Google eligibility, Schema Markup Validator for spec compliance.
- **next-seo library for JSON-LD:** Still works but Next.js 15 built-in patterns are simpler. No dependency needed for basic JSON-LD.

## Open Questions

1. **Absolute URL construction in Next.js 15**
   - What we know: Schema requires absolute URLs, not relative paths
   - What's unclear: Best pattern for getting base URL in Server Components (env var vs. headers vs. vercel env)
   - Recommendation: Use environment variable `NEXT_PUBLIC_SITE_URL` for base URL, with fallback to `https://pureblinds.nl` in production

2. **Logo file format (SVG vs. PNG)**
   - What we know: Google recommends square/rectangular logos, minimum 112x112px
   - What's unclear: Whether SVG logos work well in Knowledge Panel, or if PNG is safer
   - Recommendation: Test with current SVG logo first, have PNG fallback ready if Rich Results Test shows warnings

3. **Starting price calculation timing**
   - What we know: Need minimum matrix price for "vanaf" pricing
   - What's unclear: Whether to calculate at build time (static) or request time (dynamic)
   - Recommendation: Calculate at build time in `generateStaticParams`, store in Product type extension, or calculate in schema builder (minimal overhead)

4. **Multiple products with same schema on category pages**
   - What we know: Category pages show multiple products
   - What's unclear: Whether to add Product schema for all products on listing pages, or only on detail pages
   - Recommendation: Only add Product schema on detail pages per user decision. Category pages don't need it.

## Sources

### Primary (HIGH confidence)

- [Next.js 16 JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) - Official Next.js documentation (2026-02-11)
- [Schema.org Product Type](https://schema.org/Product) - Official Schema.org specification
- [Schema.org BreadcrumbList Type](https://schema.org/BreadcrumbList) - Official specification
- [Google FAQPage Structured Data](https://developers.google.com/search/docs/appearance/structured-data/faqpage) - Google's official requirements
- [Google Article/BlogPosting Structured Data](https://developers.google.com/search/docs/appearance/structured-data/article) - Google's official requirements
- [Google Organization Structured Data](https://developers.google.com/search/docs/appearance/structured-data/organization) - Google's official requirements
- [schema-dts GitHub](https://github.com/google/schema-dts) - Official Google-maintained TypeScript types
- [Google Rich Results Test](https://search.google.com/test/rich-results) - Official validation tool
- [Schema.org Markup Validator](https://validator.schema.org/) - Official spec validator

### Secondary (MEDIUM confidence)

- [JSON-LD XSS Security Article](https://pragmaticwebsecurity.com/articles/spasecurity/json-stringify-xss) - Security best practices
- [Next.js JSON-LD in App Router Medium Guide](https://medium.com/@sureshdotariya/json-ld-in-next-js-15-app-router-product-blog-and-breadcrumb-schemas-f752b7422c4f) - Community implementation patterns (Oct 2025)
- [FAQ Schema 2023 Changes - Schema App](https://www.schemaapp.com/schema-markup/stand-out-in-search-with-faq-rich-results/) - Google's FAQ rich results limitation
- [Schema Markup Guide 2026](https://www.wearetg.com/blog/schema-markup/) - Current best practices
- [Common JSON-LD Errors - Zeo](https://zeo.org/resources/blog/most-common-json-ld-schema-issues-and-solutions) - Validation pitfalls
- [Hydration Errors in Next.js](https://oneuptime.com/blog/post/2026-01-24-fix-hydration-mismatch-errors-nextjs/view) - Next.js hydration issues (2026-01-24)

### Tertiary (LOW confidence)

- None required - primary and secondary sources provide complete coverage

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Next.js official docs + Google-maintained schema-dts
- Architecture: HIGH - Official Next.js patterns + verified community examples
- Pitfalls: MEDIUM-HIGH - Mix of official Google docs and verified community experience

**Research date:** 2026-02-14
**Valid until:** 2026-04-14 (60 days - Schema.org and Google guidelines are stable)
