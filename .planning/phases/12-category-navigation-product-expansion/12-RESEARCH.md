# Phase 12: Category Navigation & Product Expansion - Research

**Researched:** 2026-02-13
**Domain:** Next.js App Router navigation, category-based routing, responsive product grids
**Confidence:** HIGH

## Summary

Phase 12 implements category-based navigation with a three-tier page structure: `/products` overview → `/products/[category]` listing → `/products/[productId]` detail. The phase leverages Next.js 15 App Router's dynamic routes with the new `params` Promise pattern, builds responsive product grids using Tailwind's mobile-first breakpoint system, and implements accessible breadcrumb navigation following W3C ARIA patterns.

The existing codebase already has strong foundations: product catalog with `getProductsByCategory()`, a working `/products/rollerblinds` page demonstrating the listing pattern, and a dynamic `/products/[productId]` page with breadcrumbs. Phase 12 expands this to a complete category navigation system with a products overview page, updates header navigation from product-specific links to a general Products entry, and ensures consistent breadcrumb patterns across all product pages.

**Primary recommendation:** Use Server Components for all pages (static category listings, product details), update header to client component with new navigation structure, implement breadcrumbs as reusable component following W3C ARIA guidelines, and leverage Tailwind's `grid-cols-1 md:grid-cols-2` pattern for responsive product cards.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15+ (App Router) | Dynamic routing, SSR, static generation | Industry standard for React SSR, built-in dynamic routes with `[folder]` convention |
| React | 19.2.3 | UI components, Server/Client split | Already in project, Server Components by default in App Router |
| Tailwind CSS | 4.x | Responsive grids, utility classes | Already in project, mobile-first responsive design with breakpoint prefixes |
| TypeScript | 5.x | Type safety | Already in project, helps with `params` Promise types |

**Installation:** Already installed in project.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/navigation | Built-in | `Link`, `usePathname`, `notFound` | Core routing utilities, already used in project |
| next/image | Built-in | Optimized images | For product images when real images added (currently placeholders) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native img tags | next/image | Use native `<img>` for placeholders, switch to `next/image` when adding real product images (WebP optimization, lazy loading) |
| Custom breadcrumb library | nextjs-breadcrumbs npm package | Custom implementation gives full control and avoids dependency for simple use case; library adds ~5KB for marginal convenience |
| CSS Grid auto-fit | Explicit breakpoint columns | Auto-fit (`grid-auto-fit-[16rem]`) more flexible, but explicit breakpoints (`md:grid-cols-2`) more predictable for 2-3 products per category |

## Architecture Patterns

### Recommended Project Structure

```
src/app/
├── products/
│   ├── page.tsx                    # Overview: category cards
│   ├── [category]/
│   │   └── page.tsx               # Listing: product grid for category
│   └── [productId]/
│       └── page.tsx               # Detail: existing, update breadcrumbs
src/components/
├── layout/
│   ├── header.tsx                 # Update navigation links
│   └── breadcrumbs.tsx           # New: reusable breadcrumb component
└── products/
    ├── category-card.tsx          # New: category card component
    └── product-card.tsx           # New: product card component
```

### Pattern 1: Dynamic Route with Params Promise (Next.js 15+)

**What:** In Next.js 15, `params` is now a Promise and must be awaited.

**When to use:** All dynamic routes `[folder]`, including `[productId]` and `[category]`.

**Example:**

```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes

export default async function Page({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const product = getProduct(productId)

  if (!product) {
    notFound()
  }

  return <div>{product.name}</div>
}
```

**Key insight:**
- Server Components: Use `await params` (async function)
- Client Components: Use React's `use(params)` or `useParams()` hook
- Always type `params` as `Promise<{ key: string }>` for TypeScript

### Pattern 2: Category Listing with Static Generation

**What:** Pre-render category pages at build time using `generateStaticParams`.

**When to use:** When category list is known at build time (rollerblinds, venetian-blinds, textiles).

**Example:**

```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-static-params

export async function generateStaticParams() {
  return [
    { category: 'rollerblinds' },
    { category: 'venetian-blinds' },
    { category: 'textiles' },
  ]
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const products = getProductsByCategory(category)

  if (products.length === 0) {
    notFound()
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Pattern 3: Responsive Grid Layout (Tailwind Mobile-First)

**What:** Build responsive grids using Tailwind's mobile-first breakpoint system.

**When to use:** Product cards, category cards, any grid-based layouts.

**Example:**

```typescript
// Source: https://tailwindcss.com/docs/responsive-design

// 1 column on mobile, 2 on tablet (768px+), 3 on desktop (1024px+)
<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Product cards for 2-3 products: 1 column mobile, 2 on tablet+
<div className="grid gap-8 md:grid-cols-2">
  {products.map(product => <ProductCard key={product.id} {...product} />)}
</div>
```

**Key insight:**
- Unprefixed utilities (e.g., `grid`) apply to ALL screen sizes
- Prefixed utilities (e.g., `md:grid-cols-2`) apply at that breakpoint AND above
- Don't use `sm:` to target mobile; use unprefixed for mobile, then add breakpoints
- Default breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`

### Pattern 4: Accessible Breadcrumbs (W3C ARIA)

**What:** Semantic breadcrumb navigation following W3C ARIA Authoring Practices.

**When to use:** Any multi-level navigation (products overview → category → product).

**Example:**

```typescript
// Source: https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-10">
      <ol className="flex items-center gap-2 text-sm text-muted">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.current ? (
              <span className="text-foreground" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

**Key requirements:**
- Wrap in `<nav aria-label="Breadcrumb">`
- Use `<ol>` for ordered list (semantic hierarchy)
- Mark current page with `aria-current="page"`
- Hide visual separators from screen readers with `aria-hidden="true"`
- Use `<Link>` for navigation, `<span>` for current page

### Pattern 5: Server Component vs Client Component Split

**What:** Use Server Components by default, Client Components only when needed for interactivity.

**When to use:** Pages are Server Components, interactive elements (Header with state, modals) are Client Components.

**Example:**

```typescript
// Source: https://nextjs.org/docs/app/getting-started/server-and-client-components

// Server Component (default) - pages, layouts
export default async function ProductsPage() {
  const products = getAllProducts() // Can access DB/files directly
  return <div>{/* Static content */}</div>
}

// Client Component - interactive elements
'use client'
import { useState } from 'react'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  // Can use hooks, event handlers, browser APIs
  return <header>...</header>
}
```

**Use Client Components when you need:**
- State and event handlers (`onClick`, `onChange`)
- Lifecycle logic (`useEffect`)
- Browser-only APIs (`localStorage`, `window`)
- Custom hooks (`usePathname`, `useParams`)

**Use Server Components when you need:**
- Fetch data from databases or APIs
- Use API keys/secrets without exposing to client
- Reduce JavaScript bundle size
- Improve First Contentful Paint (FCP)

### Anti-Patterns to Avoid

- **Don't use `sm:` for mobile styles**: Mobile-first means unprefixed utilities target mobile, breakpoints target larger screens
- **Don't await params synchronously**: In Next.js 15+, `params` is a Promise, always `await` it or use `use()`
- **Don't mark entire pages as Client Components**: Keep pages as Server Components, extract interactive bits to Client Components
- **Don't skip `aria-current` on breadcrumbs**: Critical for screen reader users to know current page
- **Don't use `fetch` in Client Components**: Data fetching should happen in Server Components (or API routes)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL parameter parsing | Custom URL parser for category/productId | Next.js dynamic routes `[folder]` | Built-in, type-safe with TypeScript helpers, handles encoding/decoding, integrates with `generateStaticParams` |
| Breadcrumb path generation | Manual pathname parsing and formatting | W3C ARIA breadcrumb pattern with `usePathname` | Accessible by default, screen reader compatible, semantic HTML |
| Responsive breakpoints | Custom media query hooks | Tailwind breakpoint prefixes | Standard, documented, no JS needed, SSR-friendly |
| Image optimization | Custom image loader | `next/image` (when adding real images) | Automatic WebP/AVIF conversion, responsive sizing, lazy loading, prevents layout shift |
| 404 handling for invalid products | Custom error checking | `notFound()` from `next/navigation` | Returns proper 404 status, renders `not-found.tsx`, adds `<meta name="robots" content="noindex" />` |

**Key insight:** Next.js App Router provides most category/product navigation primitives out of the box. Focus on composition, not custom routing logic.

## Common Pitfalls

### Pitfall 1: Params Type Mismatch in Next.js 15

**What goes wrong:** Build fails with "Type 'Promise<{ slug: string }>' is not assignable to type '{ slug: string }'"

**Why it happens:** Next.js 15 changed `params` from synchronous object to Promise. Old code assumes synchronous access.

**How to avoid:**
- Always type `params` as `Promise<{ key: string }>`
- Always `await params` in Server Components
- Use `use(params)` in Client Components or `useParams()` hook

**Warning signs:** TypeScript errors on params access, "cannot destructure" errors

**Source:** https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes

### Pitfall 2: Missing `aria-current` on Breadcrumbs

**What goes wrong:** Screen reader users can't identify which page they're on

**Why it happens:** Developers focus on visual styling, forget semantic attributes

**How to avoid:**
- Always add `aria-current="page"` to current breadcrumb
- Use `<span>` for current page (not clickable), `<Link>` for navigation
- Test with screen reader or browser accessibility tools

**Warning signs:** All breadcrumb items are links, no semantic indicator for current page

**Source:** https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/

### Pitfall 3: Using `sm:` Prefix for Mobile Styles

**What goes wrong:** Mobile layout broken because `sm:` only applies at 640px+, not on smaller screens

**Why it happens:** Misunderstanding Tailwind's mobile-first approach

**How to avoid:**
- Use unprefixed utilities for mobile base styles
- Add `md:`, `lg:` prefixes for larger breakpoints
- Remember: `md:grid-cols-2` means "2 columns at 768px AND ABOVE"

**Warning signs:** Layout looks good on desktop, broken on mobile; excessive use of `sm:` prefix

**Source:** https://tailwindcss.com/docs/responsive-design

### Pitfall 4: Preloading All Product Images in Grid

**What goes wrong:** Slow page load, poor Largest Contentful Paint (LCP), wasted bandwidth

**Why it happens:** Setting `priority` on all images or using `next/image` without proper `loading` strategy

**How to avoid:**
- Use `priority` only on above-the-fold images (first 2-3 products)
- Default to lazy loading for below-fold images
- For placeholder images (current phase), use native `<img>` tags
- Switch to `next/image` when adding real product images with proper `sizes` attribute

**Warning signs:** Network tab shows all images loading immediately, high LCP score

**Source:** https://nextjs.org/docs/app/api-reference/components/image

### Pitfall 5: Forgetting `notFound()` for Invalid Categories

**What goes wrong:** Invalid URLs like `/products/invalid-category` show empty page with 200 status

**Why it happens:** No validation that category exists before rendering

**How to avoid:**
- Check `products.length > 0` after `getProductsByCategory()`
- Call `notFound()` if no products found
- Let Next.js return proper 404 status and render `not-found.tsx`

**Warning signs:** Empty category pages, Google indexing invalid URLs

**Example:**

```typescript
export default async function CategoryPage({ params }) {
  const { category } = await params
  const products = getProductsByCategory(category)

  if (products.length === 0) {
    notFound() // Proper 404
  }

  return <ProductGrid products={products} />
}
```

**Source:** https://nextjs.org/docs/app/api-reference/functions/not-found

### Pitfall 6: Client Component Overuse

**What goes wrong:** Larger JavaScript bundles, slower Time to Interactive (TTI), unnecessary hydration

**Why it happens:** Adding `'use client'` to entire pages "just to make it work"

**How to avoid:**
- Keep pages as Server Components (default)
- Extract only interactive bits to Client Components
- Example: Products page is Server Component, but category filter dropdown is Client Component
- Remember: Current header is already Client Component (has state for mobile menu)

**Warning signs:** Many files with `'use client'`, large JS bundles, hydration errors

**Source:** https://nextjs.org/docs/app/getting-started/server-and-client-components

## Code Examples

Verified patterns from official sources:

### Dynamic Category Route with Static Generation

```typescript
// src/app/products/[category]/page.tsx
// Source: Next.js official docs

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductsByCategory } from '@/lib/product/catalog'

export async function generateStaticParams() {
  return [
    { category: 'rollerblinds' },
    { category: 'venetian-blinds' },
    { category: 'textiles' },
  ]
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const products = getProductsByCategory(category)

  if (products.length === 0) {
    notFound()
  }

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-10">
          <ol className="flex items-center gap-2 text-sm text-muted">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/products" className="transition-colors hover:text-foreground">
                Products
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="text-foreground" aria-current="page">
                {category}
              </span>
            </li>
          </ol>
        </nav>

        {/* Product grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group block transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="flex aspect-[4/3] items-center justify-center bg-white">
                  <span className="text-sm text-muted">Product Image</span>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-medium text-foreground">
                    {product.name}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
                    Configure
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Products Overview Page with Category Cards

```typescript
// src/app/products/page.tsx
// Server Component - no interactivity needed

import Link from 'next/link'

export default function ProductsPage() {
  const categories = [
    {
      id: 'rollerblinds',
      name: 'Rollerblinds',
      description: 'Light and dark rollerblinds made to measure',
      href: '/products/rollerblinds',
    },
    {
      id: 'venetian-blinds',
      name: 'Venetian Blinds',
      description: 'Classic venetian blinds in various sizes',
      href: '/products/venetian-blinds',
    },
  ]

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-10">
          <ol className="flex items-center gap-2 text-sm text-muted">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="text-foreground" aria-current="page">
                Products
              </span>
            </li>
          </ol>
        </nav>

        {/* Page header */}
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            Browse Products
          </p>
          <h1 className="mt-2 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            Our Products
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted max-w-2xl">
            Explore our range of made-to-measure window treatments
          </p>
        </div>

        {/* Category grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group block transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="overflow-hidden rounded-2xl border border-border bg-surface p-8">
                <h2 className="text-2xl font-medium text-foreground">
                  {category.name}
                </h2>
                <p className="mt-3 text-sm text-muted">
                  {category.description}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-foreground">
                  View products
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Updated Header Navigation

```typescript
// src/components/layout/header.tsx
// Client Component - has mobile menu state

'use client'

import Link from "next/link"
import CartIcon from "@/components/cart/cart-icon"
import { useState, useEffect } from "react"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: "/products", label: "Products" },
    { href: "/blog", label: "Blog" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <div
          className={`pointer-events-auto rounded-full bg-background/90 backdrop-blur-md shadow-lg border border-border/50 px-5 py-3 flex items-center justify-between ${
            scrolled ? "shadow-xl" : ""
          }`}
        >
          <Link
            href="/"
            className="text-base font-bold text-foreground hover:text-muted transition-colors"
          >
            Pure Blinds
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              link.href.startsWith("/") ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <CartIcon />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {/* Hamburger icon */}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden mt-2 rounded-2xl bg-background/90 backdrop-blur-md shadow-lg border border-border/50 px-5 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
```

### Reusable Breadcrumb Component

```typescript
// src/components/layout/breadcrumbs.tsx
// Server Component - no state needed

import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-10">
      <ol className="flex items-center gap-2 text-sm text-muted">
        {items.map((item, index) => (
          <li key={item.href || item.label} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.current ? (
              <span className="text-foreground" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href!}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Usage in pages:
// <Breadcrumbs items={[
//   { label: "Home", href: "/" },
//   { label: "Products", href: "/products" },
//   { label: "Rollerblinds", current: true }
// ]} />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Synchronous params object | Params as Promise with `await` | Next.js 15 (2024) | Must update all dynamic route handlers to `await params` |
| Pages Router with `getStaticProps` | App Router with Server Components | Next.js 13+ (2023) | Simpler data fetching, no separate getStaticProps function |
| Manual breadcrumb with `useRouter` | W3C ARIA breadcrumb pattern | Ongoing accessibility focus | Better screen reader support, semantic HTML |
| `@media` queries in CSS | Tailwind breakpoint prefixes | Tailwind adoption | Faster development, mobile-first by default |
| Static `next/image` | Dynamic `next/image` with `sizes` | Next.js 13+ | Better responsive images, but requires `sizes` prop for optimal performance |

**Deprecated/outdated:**
- `getStaticProps` / `getServerSideProps`: Replaced by Server Components with direct data fetching
- `useRouter().pathname`: Use `usePathname()` in App Router
- Synchronous `params`: Now Promise in Next.js 15+

## Open Questions

1. **Should we add category metadata/images to products.json?**
   - What we know: Categories currently derive from product `category` field
   - What's unclear: Whether category pages need dedicated metadata (description, image, SEO)
   - Recommendation: Start with hardcoded category data in `/products/page.tsx`, add to products.json if categories expand beyond 3-4

2. **Blog page implementation scope**
   - What we know: Header will link to `/blog`, requirement NAV-02
   - What's unclear: Whether Phase 12 includes blog page creation or just the navigation link
   - Recommendation: Create minimal `/app/blog/page.tsx` with "Coming Soon" to avoid 404, implement full blog in future phase

3. **Product images: placeholder vs next/image**
   - What we know: Current product pages use placeholder `<div>` for images
   - What's unclear: Whether to switch to `next/image` now or wait for real images
   - Recommendation: Use native `<img>` tags with placeholder images for now, switch to `next/image` when real product images added (avoid premature optimization)

## Sources

### Primary (HIGH confidence)

- Next.js Dynamic Routes: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes (official docs, v16.1.6, updated 2026-02-11)
- Next.js generateStaticParams: https://nextjs.org/docs/app/api-reference/functions/generate-static-params (official docs, v16.1.6)
- Next.js Server/Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components (official docs, v16.1.6)
- Next.js usePathname: https://nextjs.org/docs/app/api-reference/functions/use-pathname (official docs, v16.1.6)
- Next.js notFound: https://nextjs.org/docs/app/api-reference/functions/not-found (official docs, v16.1.6)
- Tailwind Responsive Design: https://tailwindcss.com/docs/responsive-design (official docs)
- W3C ARIA Breadcrumb Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/ (official W3C spec)

### Secondary (MEDIUM confidence)

- [Next.js 15 Dynamic Routes Params Promise Pattern](https://fortifiedhq.com/blog/next-js-15-dynamic-routes-params-promise) (verified with official docs)
- [Creating Dynamic Breadcrumbs in Next.js App Router](https://medium.com/@kcabading/creating-a-breadcrumb-component-in-a-next-js-app-router-a0ea24cdb91a) (verified pattern against W3C)
- [Tailwind CSS Grid Template Columns Practical Patterns](https://thelinuxcode.com/tailwind-css-grid-template-columns-practical-patterns-for-2026-layouts/) (verified with official docs)
- [Accessible Breadcrumbs Best Practices](https://accessiblyapp.com/blog/breadcrumbs-accessibility/) (verified against W3C ARIA spec)
- [Next.js Performance Mistakes in 2026](https://medium.com/full-stack-forge/7-common-performance-mistakes-in-next-js-and-how-to-fix-them-edd355e2f9a9) (practical pitfalls)

### Tertiary (LOW confidence)

None - all findings verified against official documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All technologies already in project, official Next.js patterns
- Architecture: HIGH - Patterns verified against Next.js 16.1.6 official docs (updated 2026-02-11)
- Pitfalls: HIGH - Sourced from official docs, verified with 2026 web searches

**Research date:** 2026-02-13
**Valid until:** 2026-03-13 (30 days - stable Next.js release cycle)
