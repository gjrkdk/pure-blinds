# Phase 16: Dutch Content & Metadata - Research

**Researched:** 2026-02-14
**Domain:** Next.js content localization, metadata management, Dutch SEO
**Confidence:** HIGH

## Summary

Phase 16 transforms the Pure Blinds site from English to native Dutch with comprehensive SEO metadata. This is a **content replacement phase**, not an internationalization implementation. The site will be Dutch-only with nl-NL locale, unique meta tags per page, and Open Graph configuration for social sharing.

The current codebase has no i18n infrastructure and doesn't need it. Content exists in three forms: (1) hardcoded strings in React components, (2) static data in JSON files, and (3) MDX blog posts via Velite. The transformation requires direct text replacement, metadata configuration using Next.js built-in APIs, and creating new Dutch blog content.

**Primary recommendation:** Replace all English content in-place with Dutch equivalents, add generateMetadata() functions to all routes for unique SEO tags, configure OpenGraph with nl_NL locale, and create a comprehensive Dutch blog post about room-specific roller blind selection.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js Metadata API | 16.1.6 | SEO meta tags and OpenGraph | Built-in to Next.js App Router, no additional dependencies needed |
| Velite | 0.3.1 | MDX blog content management | Already installed, type-safe content with frontmatter |
| date-fns | 4.1.0 | Date formatting with locale support | Already installed, supports Dutch locale (nl) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns/locale/nl | 4.1.0 | Dutch date formatting | For blog post dates and timestamps |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Metadata API | next-intl | Overkill for single-language site, adds complexity and dependencies |
| In-place replacement | Content files/JSON | Adds layer of indirection for content that rarely changes |
| Velite | Contentlayer | Velite already installed and working, no migration needed |

**Installation:**
No new packages required. All necessary functionality exists in current dependencies.

## Architecture Patterns

### Recommended Content Organization

Current structure (no changes needed):
```
content/
└── posts/           # Velite MDX blog posts
    ├── *.mdx        # Replace English posts with Dutch equivalents

src/
├── app/
│   ├── layout.tsx   # Update lang="nl-NL", add metadata
│   ├── page.tsx     # Homepage - replace hardcoded strings
│   ├── blog/
│   │   ├── page.tsx         # Add generateMetadata
│   │   └── [slug]/page.tsx  # Already has generateMetadata
│   ├── cart/page.tsx        # Replace UI strings
│   ├── products/
│   │   ├── page.tsx                          # Add metadata
│   │   ├── roller-blinds/page.tsx            # Replace content, add metadata
│   │   ├── roller-blinds/*/page.tsx          # Replace content, add metadata
│   │   └── [...slug]/page.tsx                # Add generateMetadata
│   └── confirmation/page.tsx                  # Add metadata
├── components/
│   ├── home/        # Replace all hardcoded strings
│   ├── layout/      # Replace navigation and footer text
│   └── *.tsx        # Replace labels, buttons, messages
└── data/
    └── products.json # Replace product names, descriptions, details
```

### Pattern 1: Metadata Configuration (Unique Per Page)

**What:** Each route must export generateMetadata() or static metadata with unique Dutch title/description
**When to use:** Every page that can be indexed
**Example:**
```typescript
// Static metadata for simple pages
export const metadata: Metadata = {
  title: 'Rolgordijnen op maat — Made to Measure',
  description: 'Bestel rolgordijnen op maat online. Directe prijsberekening, premium materialen, thuisbezorgd.',
  openGraph: {
    locale: 'nl_NL',
    type: 'website',
    title: 'Rolgordijnen op maat — Made to Measure',
    description: 'Bestel rolgordijnen op maat online. Directe prijsberekening, premium materialen, thuisbezorgd.',
  },
}

// Dynamic metadata for parameterized routes
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug)

  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      locale: 'nl_NL',
      type: 'article',
      title: post.title,
      description: post.excerpt,
    },
  }
}
```
**Source:** [Next.js generateMetadata API Reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

### Pattern 2: HTML Lang Attribute

**What:** Set html lang attribute to nl-NL in root layout
**When to use:** Root layout only
**Example:**
```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl-NL">
      <body>{children}</body>
    </html>
  )
}
```
**Source:** [Next.js Internationalization Guide](https://nextjs.org/docs/app/guides/internationalization)

### Pattern 3: Dutch Date Formatting

**What:** Use date-fns with Dutch locale for blog dates
**When to use:** Blog listing and post pages
**Example:**
```typescript
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

// Changes "January 15, 2025" to "15 januari 2025"
format(new Date(post.date), 'd MMMM yyyy', { locale: nl })
```

### Pattern 4: Product Data Replacement

**What:** Replace English product data with Dutch equivalents in products.json
**When to use:** Product catalog
**Example:**
```json
{
  "name": "Wit Rolgordijn",
  "description": "Schoon wit rolgordijn op maat. Voer uw gewenste breedte en hoogte in voor een directe prijsopgave.",
  "details": [
    { "label": "Materiaal", "value": "Stof" },
    { "label": "Kleur", "value": "Wit" },
    { "label": "Afmetingen", "value": "10–200 cm (breedte & hoogte)" }
  ]
}
```

### Anti-Patterns to Avoid

- **Creating i18n infrastructure**: Don't add next-intl, i18next, or locale-based routing for a single-language site
- **External content files for UI strings**: Don't create separate translation JSON files for labels/buttons that rarely change
- **Generic metadata**: Don't copy-paste the same title/description across pages
- **Forgetting OpenGraph locale**: Don't omit openGraph.locale from metadata objects
- **English in alt text**: Don't forget to translate image alt attributes

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Metadata management | Custom head injection system | Next.js Metadata API | Built-in, type-safe, handles deduplication and merging |
| Blog content | Custom markdown parser | Velite (already installed) | Already configured, type-safe, handles frontmatter and MDX |
| Date localization | Custom date formatter | date-fns with nl locale | Handles edge cases, format strings, timezone-aware |
| SEO meta tags | Manual meta tag strings | generateMetadata() | Automatic Open Graph generation, Twitter cards, etc. |

**Key insight:** Next.js 13+ provides everything needed for metadata and SEO out of the box. Adding external libraries for single-language sites creates unnecessary complexity.

## Common Pitfalls

### Pitfall 1: Inconsistent Character Counts in Meta Tags
**What goes wrong:** Meta titles/descriptions get truncated in search results
**Why it happens:** Google displays ~60 chars for titles, ~160 for descriptions; exceeding these limits causes ugly cutoffs
**How to avoid:**
- Titles: 50-60 characters maximum
- Descriptions: 150-160 characters maximum
- Use character counter during content writing
**Warning signs:** Ellipsis (...) in Google search results preview
**Source:** [Meta Title/Description Best Practices 2026](https://www.stanventures.com/blog/meta-title-length-meta-description-length/)

### Pitfall 2: Missing OpenGraph Locale
**What goes wrong:** Social media platforms default to wrong language/region for shared content
**Why it happens:** Forgetting to set openGraph.locale in metadata
**How to avoid:** Add `locale: 'nl_NL'` to all openGraph objects
**Warning signs:** Facebook/LinkedIn showing wrong language indicators on shared links
**Source:** [Next.js Metadata Files Reference](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)

### Pitfall 3: Hardcoded English in Component Props
**What goes wrong:** UI labels remain in English after content replacement
**Why it happens:** Missing string literals in JSX attributes (placeholder, aria-label, alt, title)
**How to avoid:**
- Search codebase for common English words: "Width", "Height", "Cart", "Add to", etc.
- Check all form inputs for placeholder text
- Review all images for alt text
**Warning signs:** Mixed Dutch/English UI, especially in forms and buttons

### Pitfall 4: Forgetting Date Locale
**What goes wrong:** Blog dates display as "January 15, 2025" instead of "15 januari 2025"
**Why it happens:** date-fns defaults to English locale
**How to avoid:** Import and pass `locale: nl` to all format() calls
**Warning signs:** English month names on Dutch pages

### Pitfall 5: Duplicate or Missing Metadata
**What goes wrong:** Pages share identical SEO tags or have no metadata at all
**Why it happens:** Copy-pasting metadata or forgetting to add generateMetadata to new routes
**How to avoid:**
- Create checklist of all routes that need unique metadata
- Each category, subcategory, product, and blog post needs unique title/description
- Use route params to generate dynamic metadata
**Warning signs:** Google Search Console shows duplicate title tags

## Code Examples

Verified patterns from official sources:

### Unique Metadata Per Route
```typescript
// src/app/products/roller-blinds/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rolgordijnen op maat — Pure Blinds',
  description: 'Kies uit ons assortiment rolgordijnen op maat. Verkrijgbaar in transparante en verduisterende uitvoeringen.',
  openGraph: {
    locale: 'nl_NL',
    type: 'website',
    title: 'Rolgordijnen op maat',
    description: 'Kies uit ons assortiment rolgordijnen op maat. Verkrijgbaar in transparante en verduisterende uitvoeringen.',
    siteName: 'Pure Blinds',
  },
}
```
**Source:** [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

### Dynamic Product Metadata
```typescript
// src/app/products/[...slug]/page.tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params
  const productSlug = slug[slug.length - 1]
  const product = getProductBySlug(productSlug)

  if (!product) return {}

  return {
    title: `${product.name} — Rolgordijnen op maat`,
    description: product.description,
    openGraph: {
      locale: 'nl_NL',
      type: 'website',
      title: product.name,
      description: product.description,
    },
  }
}
```

### Dutch Date Formatting
```typescript
// src/app/blog/page.tsx
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

export default function BlogPage() {
  return (
    <time className="text-sm text-muted">
      {format(new Date(post.date), 'd MMMM yyyy', { locale: nl })}
    </time>
  )
}
```

### Component String Replacement
```typescript
// Before
<button className="...">Add to Cart</button>

// After
<button className="...">Toevoegen aan winkelwagen</button>

// Before
<input placeholder="e.g., 100" />

// After
<input placeholder="bijv. 100" />

// Before
<img src="..." alt="Custom roller blinds showcase" />

// After
<img src="..." alt="Rolgordijnen op maat showcase" />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next/head component | Metadata API | Next.js 13 (2022) | Type-safe, no manual meta tag construction |
| Static metadata only | generateMetadata() | Next.js 13 (2022) | Dynamic metadata per route with params |
| Manual i18n setup | Built-in i18n routing | Next.js 10+ | Simpler locale configuration (not needed for single language) |
| 155 char meta descriptions | 150-160 chars | 2024-2026 | Google SERP display optimization |

**Deprecated/outdated:**
- Using `<Head>` component from next/head in App Router
- Hardcoding meta tags in layout HTML
- Character limits based on pixel width only (now use character count primarily)

## Open Questions

1. **Blog Post Word Count**
   - What we know: Requirement specifies 800-1500 words for "Welk rolgordijn voor welke kamer?"
   - What's unclear: Whether this is hard requirement or target range
   - Recommendation: Target 1200 words (middle of range) with structured sections per room type

2. **Existing Blog Post Removal vs Replacement**
   - What we know: Requirement says "English sample blog posts replaced with Dutch content or removed"
   - What's unclear: Whether to translate existing posts or write new Dutch content
   - Recommendation: Write new Dutch blog content relevant to Dutch market; existing English posts can be replaced entirely since they're sample content

3. **Subcategory Page Copy Length**
   - What we know: 150-200 words required for subcategory pages
   - What's unclear: Whether this includes technical specs or just introductory copy
   - Recommendation: Count only introductory/descriptive copy, not bullet lists of specifications

4. **OpenGraph Images**
   - What we know: Should configure OpenGraph tags with nl_NL locale
   - What's unclear: Whether unique OG images needed per page
   - Recommendation: Start with default OG image at root, add route-specific images if time permits (not in requirements)

## Content Research Insights

From analyzing Dutch roller blind industry content:

**Room-Specific Guidance** (for blog post):
- Living rooms: Transparent roller blinds for light filtering
- Bedrooms: Blackout roller blinds (verduisterend) for sleep quality
- Kitchens: Easy-to-clean transparent options
- Bathrooms: Moisture-resistant materials
- Children's rooms: Blackout options with safety features
- Home offices: Light filtering for screen glare reduction

**Common Dutch Terms**:
- Rolgordijnen = Roller blinds
- Op maat = Made to measure/custom-sized
- Transparant = Transparent/light-filtering
- Verduisterend = Blackout
- Raamdecoratie = Window decoration/treatment
- Breedte = Width
- Hoogte = Height
- Toevoegen aan winkelwagen = Add to cart

**Sources:** [Lodiblogt room selection guide](https://lodiblogt.nl/gordijnen-interieur/), [RolgordijnenExpert blackout guide](https://www.rolgordijnenexpert.nl/blog/51/), [InhuisPlaza verduisterende raamdecoratie](https://inhuisplaza.nl/blog/verduisterende-raamdecoratie)

## Sources

### Primary (HIGH confidence)
- [Next.js Metadata API Reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - generateMetadata, Metadata type, OpenGraph configuration
- [Next.js Internationalization Guide](https://nextjs.org/docs/app/guides/internationalization) - html lang attribute, locale configuration
- [Next.js OpenGraph Images](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image) - OG image configuration and best practices
- [date-fns documentation](https://date-fns.org/) - Dutch locale support and formatting

### Secondary (MEDIUM confidence)
- [Meta Title/Description Best Practices 2026](https://www.stanventures.com/blog/meta-title-length-meta-description-length/) - SEO character limits
- [Meta Title Character Limit 2026](https://advancedcharactercounter.com/blog/meta-title-character-limit/) - Title tag optimization
- [Next.js SEO Optimization Guide 2026](https://www.djamware.com/post/697a19b07c935b6bb054313e/next-js-seo-optimization-guide--2026-edition) - Metadata and OG implementation

### Tertiary (Domain knowledge)
- [Dutch roller blind industry content](https://lodiblogt.nl/gordijnen-interieur/) - Room-specific guidance for blog content
- [RolgordijnenExpert](https://www.rolgordijnenexpert.nl/blog/51/) - Blackout roller blind best practices
- [InhuisPlaza raamdecoratie](https://inhuisplaza.nl/blog/verduisterende-raamdecoratie) - Verduisterende options analysis

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All functionality exists in Next.js 16.1.6 built-in APIs
- Architecture: HIGH - Clear patterns from official Next.js documentation
- Pitfalls: HIGH - Based on verified SEO best practices and Next.js gotchas
- Dutch content: MEDIUM - Based on industry research but requires native speaker review

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (30 days - stable domain, Next.js metadata API is mature)

## Implementation Scope Summary

**Pages requiring unique metadata** (9 routes):
1. Homepage (/)
2. Products index (/products)
3. Roller Blinds category (/products/roller-blinds)
4. Transparent subcategory (/products/roller-blinds/transparent-roller-blinds)
5. Blackout subcategory (/products/roller-blinds/blackout-roller-blinds)
6. Product detail pages (2 products)
7. Blog index (/blog)
8. Blog posts (replace 3 English, add 1 new Dutch)
9. Cart page (/cart)

**Components requiring string replacement** (11+ files):
- Layout: header.tsx, footer.tsx, breadcrumbs.tsx
- Home sections: hero (page.tsx), about-section.tsx, services-accordion.tsx, how-it-works-section.tsx, faq-section.tsx, contact-section.tsx
- Product: dimension-configurator.tsx
- Cart: cart-item.tsx, cart-summary.tsx

**Data files requiring updates**:
- data/products.json (2 products)
- content/posts/*.mdx (3 replacements + 1 new)

This is a **content replacement phase** with clear boundaries. No infrastructure changes, no new dependencies, no routing changes.
