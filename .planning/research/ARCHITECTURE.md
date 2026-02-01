# Architecture Research

**Domain:** Multi-page website structure and SEO for Next.js 15 e-commerce
**Researched:** 2026-02-01
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Client Layer (Browser)                           │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │  Homepage  │  │   Product  │  │    Cart    │  │   Static   │        │
│  │    Page    │  │    Page    │  │    Page    │  │   Pages    │        │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │
│        │               │               │               │                │
├────────┴───────────────┴───────────────┴───────────────┴────────────────┤
│                    Root Layout (Nav + Footer)                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Navigation  │  Children Content (varies)  │  Footer             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                         Server Components                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │   Metadata API   │  │    SEO Layer     │  │  Structured Data │      │
│  │  (generateMetadata)│  │  (sitemap/robots)│  │    (JSON-LD)     │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
├─────────────────────────────────────────────────────────────────────────┤
│                         API Routes Layer                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │  /api/     │  │  /api/     │  │  /api/     │  │  /api/     │        │
│  │  pricing   │  │  checkout  │  │  contact   │  │  health    │        │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │
│        │               │               │               │                │
├────────┴───────────────┴───────────────┴───────────────┴────────────────┤
│                         State Management                                 │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐        │
│  │  Zustand Store   │  │  localStorage Persistence            │        │
│  │  (cart state)    │  │  (cart data)                         │        │
│  └──────────────────┘  └──────────────────────────────────────┘        │
├─────────────────────────────────────────────────────────────────────────┤
│                         External Services                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  Shopify Admin   │  │  Email Service   │  │  Vercel Edge     │      │
│  │      API         │  │  (Nodemailer)    │  │   Functions      │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Integration with Existing |
|-----------|----------------|---------------------------|
| **Root Layout** | Global navigation, footer, HTML structure | **MODIFY EXISTING** `src/app/layout.tsx` to add footer, improve nav |
| **Navigation** | Site-wide nav with cart icon | **EXTRACT** from existing header in `layout.tsx`, enhance with new routes |
| **Footer** | Global footer with links to policies, contact | **NEW COMPONENT** `src/components/layout/footer.tsx` |
| **Page Routes** | Homepage, cart, thank-you, static pages | **NEW PAGES** + **MODIFY** existing cart page |
| **Metadata Layer** | SEO tags, Open Graph, Twitter cards | **NEW** `generateMetadata` exports in each page |
| **Sitemap Generator** | Dynamic sitemap.xml for all routes | **NEW** `src/app/sitemap.ts` |
| **Robots Generator** | robots.txt with crawl rules | **NEW** `src/app/robots.ts` |
| **JSON-LD Components** | Structured data injection | **NEW** inline `<script>` tags in pages |
| **Contact Form** | Form + email API route | **NEW** `src/app/contact/page.tsx` + `src/app/api/contact/route.ts` |
| **Blog/FAQ Pages** | Content pages from markdown | **NEW** markdown-based pages or MDX integration |

## Recommended Project Structure

### Current Structure (v1.0)
```
src/
├── app/
│   ├── layout.tsx                    # Root layout (minimal header)
│   ├── page.tsx                      # Homepage placeholder
│   ├── products/[productId]/page.tsx # Product configurator
│   ├── cart/page.tsx                 # Cart page
│   └── api/
│       ├── pricing/route.ts
│       ├── checkout/route.ts
│       └── health/route.ts
├── components/
│   ├── dimension-configurator.tsx
│   └── cart/
│       ├── cart-icon.tsx
│       ├── cart-item.tsx
│       ├── cart-summary.tsx
│       ├── quantity-input.tsx
│       └── remove-dialog.tsx
└── lib/
    ├── cart/
    │   ├── store.ts                  # Zustand cart state
    │   ├── types.ts
    │   └── utils.ts
    ├── pricing/
    │   ├── calculator.ts
    │   ├── types.ts
    │   └── validator.ts
    ├── shopify/
    │   ├── client.ts
    │   ├── draft-order.ts
    │   └── types.ts
    └── env.ts
```

### Proposed Structure (v1.1 - Adding Pages + SEO)
```
src/
├── app/
│   ├── layout.tsx                    # MODIFY: Add footer, improve nav structure
│   ├── page.tsx                      # MODIFY: Build real homepage
│   ├── sitemap.ts                    # NEW: Generate sitemap.xml
│   ├── robots.ts                     # NEW: Generate robots.txt
│   ├── products/[productId]/page.tsx # EXISTING: Add generateMetadata
│   ├── cart/page.tsx                 # MODIFY: Add metadata, improve layout
│   ├── thank-you/page.tsx            # NEW: Post-checkout confirmation
│   ├── contact/page.tsx              # NEW: Contact form
│   ├── blog/                         # NEW: Blog section
│   │   ├── page.tsx                  # Blog index
│   │   └── [slug]/page.tsx           # Individual posts (from markdown)
│   ├── faq/page.tsx                  # NEW: FAQ page
│   └── (policies)/                   # NEW: Route group for policy pages
│       ├── privacy/page.tsx
│       ├── terms/page.tsx
│       ├── shipping/page.tsx
│       └── returns/page.tsx
│   └── api/
│       ├── pricing/route.ts          # EXISTING
│       ├── checkout/route.ts         # EXISTING
│       ├── contact/route.ts          # NEW: Handle contact form submission
│       └── health/route.ts           # EXISTING
├── components/
│   ├── layout/                       # NEW: Layout components
│   │   ├── header.tsx                # NEW: Extract from layout.tsx
│   │   ├── navigation.tsx            # NEW: Main nav component
│   │   ├── footer.tsx                # NEW: Site footer
│   │   └── structured-data.tsx       # NEW: JSON-LD wrapper component
│   ├── forms/                        # NEW: Form components
│   │   ├── contact-form.tsx          # NEW: Contact form UI
│   │   └── form-field.tsx            # NEW: Reusable form field
│   ├── ui/                           # NEW: Design system components
│   │   ├── button.tsx                # NEW: Button variants
│   │   ├── card.tsx                  # NEW: Card component
│   │   └── input.tsx                 # NEW: Input component
│   ├── dimension-configurator.tsx    # EXISTING
│   └── cart/                         # EXISTING: Cart components
│       ├── cart-icon.tsx
│       ├── cart-item.tsx
│       ├── cart-summary.tsx
│       ├── quantity-input.tsx
│       └── remove-dialog.tsx
├── content/                          # NEW: Content directory
│   ├── blog/                         # NEW: Blog posts (markdown/MDX)
│   │   ├── post-1.md
│   │   └── post-2.md
│   └── faq.ts                        # NEW: FAQ data structure
└── lib/
    ├── cart/                         # EXISTING
    │   ├── store.ts
    │   ├── types.ts
    │   └── utils.ts
    ├── pricing/                      # EXISTING
    │   ├── calculator.ts
    │   ├── types.ts
    │   └── validator.ts
    ├── shopify/                      # EXISTING
    │   ├── client.ts
    │   ├── draft-order.ts
    │   └── types.ts
    ├── email/                        # NEW: Email utilities
    │   ├── transport.ts              # Nodemailer setup
    │   └── templates.ts              # Email templates
    ├── metadata/                     # NEW: SEO utilities
    │   ├── defaults.ts               # Default metadata values
    │   ├── schemas.ts                # JSON-LD schema generators
    │   └── seo.ts                    # Helper functions
    ├── content/                      # NEW: Content utilities
    │   └── markdown.ts               # Markdown processing
    └── env.ts                        # EXISTING
```

### Structure Rationale

- **Route groups `(policies)`:** Groups related policy pages without adding `/policies/` to URLs (e.g., `/privacy` not `/policies/privacy`)
- **`/content` directory:** Separates content (markdown blog posts, FAQ data) from code, making it easy for non-developers to edit
- **`/components/layout`:** Centralizes layout components used across all pages
- **`/components/ui`:** Design system components for consistent styling (shadcn/ui pattern)
- **`/lib/metadata`:** Reusable SEO utilities reduce duplication across pages
- **Colocation:** Route-specific components stay close to their routes (planned for future expansion)

## Architectural Patterns

### Pattern 1: Root Layout with Nested Navigation

**What:** Single root layout wraps all pages with navigation and footer, maintaining state across route transitions.

**When to use:** For consistent site-wide UI that never unmounts (current app needs this).

**Trade-offs:**
- **Pro:** Navigation and footer components only mount once, preserving state (e.g., cart icon badge)
- **Pro:** Reduces client-side bundle size by not duplicating layout code
- **Con:** Cannot have different layouts without route groups or nested layouts

**Example:**
```typescript
// src/app/layout.tsx
import Navigation from '@/components/layout/navigation'
import Footer from '@/components/layout/footer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

### Pattern 2: File-Based Metadata API (Static + Dynamic)

**What:** Export `metadata` object or `generateMetadata` function from page/layout files for SEO.

**When to use:**
- Static metadata: Pages with fixed titles/descriptions (e.g., `/privacy`, `/faq`)
- Dynamic metadata: Pages with content-based SEO (e.g., `/products/[productId]`, `/blog/[slug]`)

**Trade-offs:**
- **Pro:** Next.js automatically merges metadata from nested layouts (DRY principle)
- **Pro:** Type-safe with TypeScript, preventing SEO mistakes
- **Pro:** Server-rendered in initial HTML (critical for SEO)
- **Con:** Requires understanding metadata precedence rules (page overrides layout)

**Example:**
```typescript
// src/app/products/[productId]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ productId: string }>
}): Promise<Metadata> {
  const { productId } = await params
  const product = await getProduct(productId)

  return {
    title: `${product.name} - Custom Textiles`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image }],
    },
  }
}
```

### Pattern 3: JSON-LD Structured Data Injection

**What:** Inject `<script type="application/ld+json">` tags directly in page components for schema.org structured data.

**When to use:** Every page that benefits from rich search results (products, blog posts, organization info, breadcrumbs).

**Trade-offs:**
- **Pro:** Search engines understand page context, enabling rich results
- **Pro:** Server-rendered, included in initial HTML
- **Con:** Requires manual escaping of `<` characters to prevent XSS
- **Con:** Must validate with Google Rich Results Test to avoid errors

**Example:**
```typescript
// src/app/products/[productId]/page.tsx
export default async function ProductPage({ params }) {
  const { productId } = await params
  const product = await getProduct(productId)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: product.basePrice,
      priceCurrency: 'EUR',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* Rest of page UI */}
    </>
  )
}
```

### Pattern 4: Sitemap and Robots Generation (File-Based)

**What:** Create `sitemap.ts` and `robots.ts` in app directory to auto-generate SEO files.

**When to use:** Always for multi-page sites (enables search engine discovery).

**Trade-offs:**
- **Pro:** Next.js handles generation and caching automatically
- **Pro:** Dynamic sitemaps update when content changes
- **Con:** Must manually list all static routes (or use `generateSitemaps` for dynamic content)

**Example:**
```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://your-domain.com'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products/custom-textile`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    // ... all other routes
  ]
}
```

### Pattern 5: Contact Form with API Route + Email Service

**What:** Client component form POSTs to API route, which sends email via Nodemailer.

**When to use:** Contact forms, newsletter signups, any form requiring server-side processing.

**Trade-offs:**
- **Pro:** Keeps SMTP credentials server-side (secure)
- **Pro:** Can validate, sanitize, rate-limit before sending
- **Con:** Requires email service configuration (SMTP or API-based like Mailgun)

**Example:**
```typescript
// src/app/api/contact/route.ts
import { NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email/transport'

export async function POST(request: Request) {
  const { name, email, message } = await request.json()

  // Validate
  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'All fields required' },
      { status: 400 }
    )
  }

  // Send email
  try {
    await sendContactEmail({ name, email, message })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
```

### Pattern 6: Markdown Content for Blog/FAQ

**What:** Store blog posts as `.md` or `.mdx` files, process with `gray-matter` + `remark`/`next-mdx-remote`.

**When to use:**
- **Markdown:** Simple content with frontmatter (blog posts, docs)
- **MDX:** Content needing React components embedded (interactive tutorials)

**Trade-offs:**
- **Pro:** Version-controlled content, no database needed
- **Pro:** Non-developers can edit markdown easily
- **Pro:** Free (vs. CMS pricing), fast (static generation)
- **Con:** No admin UI (use CMS if non-technical team needs web editing)
- **Con:** Requires build for content updates (vs. CMS instant updates)

**Recommendation for this project:**
- **Blog:** Markdown files (simple posts, infrequent updates, developer-controlled)
- **FAQ:** TypeScript data structure (highly structured, small dataset)

**Example:**
```typescript
// content/blog/welcome.md
---
title: "Welcome to Our Textile Shop"
date: "2026-01-15"
author: "Team"
---

# Welcome

We're excited to launch our custom textile configurator...
```

```typescript
// src/app/blog/[slug]/page.tsx
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

export async function generateStaticParams() {
  const files = fs.readdirSync('content/blog')
  return files.map((filename) => ({
    slug: filename.replace('.md', ''),
  }))
}

export default async function BlogPost({ params }) {
  const { slug } = await params
  const filePath = path.join('content/blog', `${slug}.md`)
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)
  const processedContent = await remark().use(html).process(content)

  return (
    <article>
      <h1>{data.title}</h1>
      <time>{data.date}</time>
      <div dangerouslySetInnerHTML={{ __html: processedContent.toString() }} />
    </article>
  )
}
```

### Pattern 7: Design System with Tailwind + Component Library

**What:** Create `/components/ui` directory with reusable primitives (Button, Card, Input) styled with Tailwind CSS utility classes.

**When to use:** Always for multi-page sites requiring consistent design.

**Trade-offs:**
- **Pro:** Consistency across pages without duplication
- **Pro:** Easy to refactor styles globally (change button, all buttons update)
- **Pro:** Can use shadcn/ui for pre-built accessible components
- **Con:** Initial setup overhead vs. inline styles

**Recommendation:** Use **shadcn/ui** pattern (copy components into codebase, customize as needed).

**Example:**
```typescript
// src/components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  )
}
```

## Data Flow

### Request Flow for New Pages

```
User visits /contact
    ↓
Next.js matches route → app/contact/page.tsx
    ↓
Server Component renders (RSC)
    ↓
├─ generateMetadata() runs → <head> tags
├─ JSON-LD script generated → structured data
└─ ContactForm component rendered → Client Component
    ↓
HTML sent to browser
    ↓
ContactForm hydrates → interactive
    ↓
User submits form
    ↓
POST /api/contact
    ↓
API route validates → sends email via Nodemailer
    ↓
Success response → UI shows confirmation
```

### Metadata Inheritance Flow

```
Root Layout (app/layout.tsx)
├─ metadata: { title: { template: '%s | Custom Textiles' } }
    ↓
Blog Layout (app/blog/layout.tsx)
├─ metadata: { description: 'Read our latest updates' }
    ↓
Blog Post Page (app/blog/[slug]/page.tsx)
└─ generateMetadata: { title: 'Post Title' }

Final merged metadata:
{
  title: 'Post Title | Custom Textiles',  // From template + page
  description: 'Read our latest updates',  // From layout
  // + all other inherited/merged metadata
}
```

### State Management Flow (Existing - No Changes)

```
User adds to cart
    ↓
DimensionConfigurator → addItem() action
    ↓
Zustand store updates
    ↓
├─ State persisted to localStorage
└─ CartIcon re-renders (badge count updates)
```

## Integration Points

### Integrations with Existing Architecture

| New Feature | Existing Component | Integration Approach |
|-------------|-------------------|----------------------|
| **Navigation component** | Header in `layout.tsx` | Extract existing header code into `src/components/layout/navigation.tsx`, enhance with links to new pages |
| **Footer component** | None (new) | Add below `{children}` in root layout, import from `src/components/layout/footer.tsx` |
| **Homepage** | Placeholder `page.tsx` | Replace with real content, link to `/products/custom-textile`, add hero section |
| **Cart page metadata** | Existing `cart/page.tsx` | Add `export const metadata = { title: 'Cart', description: '...' }` |
| **Product page SEO** | Existing `products/[productId]/page.tsx` | Add `generateMetadata` function, add JSON-LD Product schema |
| **Sitemap generation** | None | New `app/sitemap.ts` includes all existing routes (`/`, `/cart`, `/products/*`) + new routes |
| **Contact form email** | None | New API route `/api/contact` follows same pattern as `/api/pricing` and `/api/checkout` |
| **Design system components** | None (using inline Tailwind) | Gradually extract common patterns (buttons, cards) into `src/components/ui` for reuse |

### External Service Integration

| Service | Purpose | Integration Point | Configuration |
|---------|---------|-------------------|---------------|
| **Shopify Admin API** | Existing checkout | `src/lib/shopify/client.ts` | Already configured (env vars) |
| **Nodemailer** | Contact form emails | `src/lib/email/transport.ts` (new) | Add SMTP env vars (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) |
| **Vercel Edge Functions** | API routes | Auto-deployed | No config needed |
| **Google Search Console** | Sitemap submission | Submit `https://domain.com/sitemap.xml` after deployment | Manual submission post-launch |

### Component Dependencies

```
Root Layout
├─ Navigation
│  └─ CartIcon (existing)
├─ Children (pages)
│  ├─ Homepage
│  ├─ Product Page
│  │  └─ DimensionConfigurator (existing)
│  ├─ Cart Page
│  │  ├─ CartItem (existing)
│  │  └─ CartSummary (existing)
│  ├─ Contact Page
│  │  └─ ContactForm (new)
│  ├─ Blog Pages
│  │  └─ (markdown content)
│  └─ Static Pages
│     └─ (simple HTML/React)
└─ Footer (new)
   └─ (links to pages)
```

## Suggested Build Order

### Phase 1: Layout Foundation
**Goal:** Establish shared layout structure before adding pages.

1. **Extract Navigation component** from `layout.tsx`
   - Dependencies: None
   - Why first: Foundation for all pages, simple refactor

2. **Create Footer component**
   - Dependencies: None
   - Why now: Completes layout frame, links can point to `/` initially

3. **Update root layout** to use Navigation + Footer
   - Dependencies: Steps 1-2
   - Why now: Test layout on existing pages before adding new routes

**Validation:** Existing pages (product, cart) should render with new nav/footer.

### Phase 2: SEO Infrastructure
**Goal:** Set up metadata and crawlability before content pages.

4. **Create metadata utilities** (`src/lib/metadata/defaults.ts`)
   - Dependencies: None
   - Why now: DRY metadata across pages

5. **Add sitemap generator** (`app/sitemap.ts`)
   - Dependencies: None (initially list only existing routes)
   - Why now: Enables indexing of new pages as they're added

6. **Add robots.txt generator** (`app/robots.ts`)
   - Dependencies: Step 5 (references sitemap)
   - Why now: Controls crawling from day one

**Validation:** Verify `localhost:3000/sitemap.xml` and `localhost:3000/robots.txt` work.

### Phase 3: Static Content Pages
**Goal:** Add simple pages without complex logic.

7. **Create policy pages** (privacy, terms, shipping, returns)
   - Dependencies: Phase 1 (nav/footer with links)
   - Why now: Simple pages, test metadata inheritance

8. **Build FAQ page**
   - Dependencies: Phase 1
   - Why now: Structured data opportunity, tests design system

9. **Add JSON-LD schemas** to existing product page
   - Dependencies: Phase 2 (metadata utilities)
   - Why now: Improves SEO on existing critical page

**Validation:** All pages render, metadata appears in `<head>`, JSON-LD validates in Rich Results Test.

### Phase 4: Homepage
**Goal:** Create landing page that ties everything together.

10. **Design homepage** with hero, product CTA, feature highlights
    - Dependencies: Phase 1 (layout), Phase 3 (links to FAQ/policies)
    - Why now: Requires understanding of site structure (built in Phases 1-3)

**Validation:** Homepage links to all major sections, good Core Web Vitals.

### Phase 5: Contact Form
**Goal:** Add interactive feature with server-side processing.

11. **Create contact form UI** (`src/app/contact/page.tsx`)
    - Dependencies: Design system (Phase 3 optional)
    - Why now: Can build without backend first

12. **Set up email transport** (`src/lib/email/transport.ts`)
    - Dependencies: None
    - Why now: Requires env var config (blocking for next step)

13. **Build contact API route** (`src/app/api/contact/route.ts`)
    - Dependencies: Steps 11-12
    - Why now: Connects form to email sending

**Validation:** Form submission sends email, shows success/error states.

### Phase 6: Blog (Optional for MVP)
**Goal:** Add content marketing capability.

14. **Set up markdown processing** utilities
    - Dependencies: None
    - Why now: Blog infrastructure before content

15. **Create blog index and post pages**
    - Dependencies: Step 14
    - Why now: Can add content iteratively after launch

16. **Write initial blog posts** (markdown files)
    - Dependencies: Step 15
    - Why last: Content can be added post-deployment

**Validation:** Blog index lists posts, individual posts render markdown correctly.

### Dependency Graph

```
Phase 1 (Layout)
├─ Phase 2 (SEO Infrastructure)
│  └─ Phase 3 (Static Pages)
│     └─ Phase 4 (Homepage)
└─ Phase 5 (Contact Form)
└─ Phase 6 (Blog) [Optional]
```

**Critical Path:** Phase 1 → 2 → 3 → 4 (for MVP)
**Optional Extension:** Phase 5 (adds interactivity), Phase 6 (adds content marketing)

## Anti-Patterns

### Anti-Pattern 1: Mixing next-seo with Metadata API

**What people do:** Install `next-seo` package in Next.js 15 App Router projects.

**Why it's wrong:**
- `next-seo` was designed for Pages Router (pre-Next.js 13)
- App Router's Metadata API is built-in, type-safe, and automatically optimized
- Using both causes duplicate `<meta>` tags and potential conflicts

**Do this instead:**
Use only the built-in Metadata API:
```typescript
// ✅ Correct
export const metadata: Metadata = {
  title: 'My Page',
  description: 'Page description',
}

// ❌ Wrong
import { NextSeo } from 'next-seo'
```

### Anti-Pattern 2: Client-Side Rendering for SEO Content

**What people do:** Fetch content in `useEffect` and render on client.

**Why it's wrong:**
- Search engines see empty page before JavaScript loads
- Worse Core Web Vitals (LCP delay)
- Metadata cannot be dynamic (already rendered in `<head>`)

**Do this instead:**
Use Server Components (default in App Router):
```typescript
// ✅ Correct
export default async function Page() {
  const data = await fetchData() // Server-side
  return <div>{data.content}</div>
}

// ❌ Wrong
'use client'
export default function Page() {
  const [data, setData] = useState(null)
  useEffect(() => { fetchData().then(setData) }, [])
  return <div>{data?.content}</div>
}
```

### Anti-Pattern 3: Hardcoding Metadata in Every Page

**What people do:** Copy-paste full metadata object in every page file.

**Why it's wrong:**
- Violates DRY principle
- Hard to maintain (changing site name = editing 20 files)
- Misses metadata inheritance benefits

**Do this instead:**
Use default metadata in root layout + title templates:
```typescript
// ✅ Correct
// app/layout.tsx
export const metadata = {
  title: {
    template: '%s | Custom Textiles',
    default: 'Custom Textiles',
  },
  description: 'Default site description',
}

// app/about/page.tsx
export const metadata = {
  title: 'About', // Becomes "About | Custom Textiles"
}

// ❌ Wrong
// app/about/page.tsx
export const metadata = {
  title: 'About | Custom Textiles',
  description: 'Default site description',
  // ... repeating all fields
}
```

### Anti-Pattern 4: Not Escaping JSON-LD

**What people do:** Use `JSON.stringify(jsonLd)` without escaping `<` characters.

**Why it's wrong:**
- XSS vulnerability if user-generated content in JSON-LD
- Can break HTML parsing if content contains `</script>`

**Do this instead:**
Always escape:
```typescript
// ✅ Correct
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
  }}
/>

// ❌ Wrong
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

### Anti-Pattern 5: Blocking Static Pages with Unnecessary Dynamic Code

**What people do:** Add `const params = await params` or `useSearchParams()` in static pages.

**Why it's wrong:**
- Forces page to be dynamically rendered (slower, more expensive on Vercel)
- Loses static generation benefits (instant page loads)

**Do this instead:**
Keep static pages fully static:
```typescript
// ✅ Correct (static)
export const metadata = { title: 'Privacy Policy' }
export default function PrivacyPage() {
  return <article>...</article>
}

// ❌ Wrong (forces dynamic)
export default async function PrivacyPage({ params }) {
  const p = await params // Unnecessary
  return <article>...</article>
}
```

### Anti-Pattern 6: Missing Canonical URLs

**What people do:** Forget to add canonical URLs to pages.

**Why it's wrong:**
- Search engines may index duplicate content (www vs non-www, trailing slash vs no slash)
- Dilutes page authority across multiple URLs

**Do this instead:**
Add canonical to metadata:
```typescript
// ✅ Correct
export const metadata = {
  title: 'Product Page',
  alternates: {
    canonical: 'https://domain.com/products/custom-textile',
  },
}
```

## Scalability Considerations

| Concern | Current (v1.1 - 10 pages) | Future (50+ pages) | Large Scale (1000+ pages) |
|---------|---------------------------|--------------------|-----------------------------|
| **Sitemap generation** | Hardcode all routes in `sitemap.ts` | Use `generateSitemaps` for dynamic content (blog posts from DB) | Multiple sitemaps split by category |
| **Metadata management** | Default metadata in root layout + per-page overrides | Centralize in `lib/metadata/defaults.ts` with helpers | Dynamic metadata from CMS |
| **Component organization** | `/components/ui` + `/components/layout` flat structure | Group by feature (`/components/blog`, `/components/product`) | Monorepo with shared component library |
| **Content management** | Markdown files in `/content` | Consider MDX for interactive content | Migrate to headless CMS (Sanity, Contentful) for non-dev editing |
| **Build times** | Fast (all static) | Still fast with ISR for blog | Use ISR + dynamic routes to avoid rebuilding all pages |
| **Image optimization** | Manual Next.js `<Image>` | Centralized image component with CDN | Image service (Cloudinary) with automatic optimization |

### Scaling Recommendations

**If blog grows beyond 50 posts:**
- Use `generateStaticParams` with pagination
- Implement ISR (Incremental Static Regeneration) with `revalidate`

**If adding user-generated content:**
- Migrate from Zustand to server-side session (Next-Auth + database)
- Add authentication layer to API routes

**If traffic exceeds 10K users/day:**
- Add Redis caching layer for API routes
- Use Vercel Edge Functions for geo-distributed responses
- Implement CDN for static assets

## Sources

### Official Documentation (HIGH confidence)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js Sitemap Generation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js Robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld)
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)

### Best Practices (MEDIUM confidence - recent 2025-2026 sources)
- [Next.js 15 SEO Guide](https://www.digitalapplied.com/blog/nextjs-seo-guide)
- [Maximizing SEO with Meta Data in Next.js 15](https://dev.to/joodi/maximizing-seo-with-meta-data-in-nextjs-15-a-comprehensive-guide-4pa7)
- [Next.js Contact Form App Router](https://maxschmitt.me/posts/nextjs-contact-form-app-router)
- [Next.js Send Email Tutorial 2026](https://mailtrap.io/blog/nextjs-send-email/)
- [JSON-LD in Next.js 15 App Router](https://medium.com/@sureshdotariya/json-ld-in-next-js-15-app-router-product-blog-and-breadcrumb-schemas-f752b7422c4f)
- [Next.js Folder Structure Best Practices 2026](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide)
- [Markdown and MDX in Next.js](https://staticmania.com/blog/markdown-and-mdx-in-next.js-a-powerful-combination-for-content-management)
- [shadcn/ui Documentation](https://www.shadcn.io/)

---
*Architecture research for: Multi-page website + SEO integration with Next.js 15 e-commerce*
*Researched: 2026-02-01*
