# Phase 14: Polish & URL Migration - Research

**Researched:** 2026-02-13
**Domain:** Next.js redirects, URL migration, breadcrumb responsive design, WCAG accessibility
**Confidence:** HIGH

## Summary

Phase 14 implements two polish requirements: renaming the thank-you page to a confirmation page at `/confirmation` with a 301/308 redirect from `/thank-you`, and styling breadcrumbs consistently across all pages with responsive behavior. The phase leverages Next.js's built-in `redirects()` function in `next.config.mjs` for permanent URL redirection with zero runtime overhead (processed at build time), and enhances the existing breadcrumb component with responsive patterns following W3C ARIA guidelines and WCAG 2.5.8 touch target requirements.

The existing codebase already has a solid foundation: `/app/thank-you/page.tsx` displays the order confirmation with structured content, and `/components/layout/breadcrumbs.tsx` implements W3C ARIA patterns with `aria-label="Breadcrumb"`, `aria-current="page"`, and semantic `<nav>` + `<ol>` structure. Breadcrumbs are used consistently across product pages, category pages, and blog pages.

Phase 14 is a focused polish phase with minimal technical complexity: file system renaming (moving `app/thank-you/` → `app/confirmation/`), adding a single redirect entry to `next.config.mjs`, and enhancing breadcrumb styles for responsive behavior including mobile touch targets, text truncation on small screens, and consistent visual hierarchy.

**Primary recommendation:** Use Next.js `next.config.mjs` redirects with `permanent: true` (308 status) for SEO-safe URL migration, implement file-based route renaming via directory move, enhance breadcrumb component with Tailwind responsive utilities for mobile-first touch targets (min 44×44px per WCAG 2.5.8), add text-overflow ellipsis for long labels on mobile, and ensure consistent styling across all pages.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | next.config.mjs redirects, file-based routing | Built-in redirect support with build-time processing, zero runtime cost for static redirects |
| Tailwind CSS | 4.x | Responsive breadcrumb styling, mobile-first utilities | Already in project, mobile-first breakpoint system (sm:, md:, lg:) |
| TypeScript | 5.x | Type safety for breadcrumb props | Already in project |

**Installation:** Already installed in project.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Next.js redirects API | Built-in | Permanent URL redirects in next.config.mjs | Static redirects known at build time (thank-you → confirmation) |
| Tailwind responsive prefixes | Built-in | Mobile-first responsive design (md:, lg:) | Touch target sizing, text truncation, gap spacing |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next.config.mjs redirects | Middleware redirects | Middleware adds runtime overhead (Edge function execution); config redirects are build-time with zero latency |
| File system move | Keep old path + redirect | Moving directory is cleaner, avoids maintaining deprecated routes, Next.js handles it natively |
| Custom breadcrumb truncation JS | CSS text-overflow ellipsis | CSS-only solution is simpler, SSR-friendly, no hydration needed |
| Fixed breadcrumb spacing | Responsive gap utilities | Responsive utilities (gap-2 md:gap-3) adapt to screen size, better mobile UX |

## Architecture Patterns

### Recommended File Changes

```
src/app/
├── thank-you/                    # DELETE
│   └── page.tsx                 # Move to confirmation/
├── confirmation/                 # CREATE
│   └── page.tsx                 # Moved from thank-you/
next.config.mjs                   # UPDATE: add redirect
src/components/layout/
└── breadcrumbs.tsx              # ENHANCE: responsive styles
```

### Pattern 1: Next.js next.config.mjs Redirects (Build-Time)

**What:** Static redirects processed at build time and included in route manifest.

**When to use:** Permanent URL migrations known at build time (page renames, URL consolidations).

**Example:**

```javascript
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects

import { build } from 'velite'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/thank-you',
        destination: '/confirmation',
        permanent: true, // 308 status code
      },
    ]
  },
}

const isDev = process.argv.includes('dev')
const isBuild = process.argv.includes('build')

if (isDev || isBuild) {
  await build({ watch: isDev, clean: !isDev })
}

export default nextConfig
```

**Key insight:**
- `permanent: true` uses 308 status code (preserves HTTP method), treated as 301 by Google for SEO
- Redirects checked BEFORE filesystem (runs even if old route still exists)
- Build-time processing means zero runtime latency
- Query parameters automatically forwarded: `/thank-you?order_id=123` → `/confirmation?order_id=123`

**Source:** [next.config.js: redirects | Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)

### Pattern 2: File-Based Route Renaming

**What:** Rename URL by moving directory in App Router file structure.

**When to use:** Changing public URL paths (thank-you → confirmation).

**Example:**

```bash
# Move directory to rename URL
mv src/app/thank-you src/app/confirmation

# Result:
# /thank-you → 404 (route no longer exists)
# /confirmation → renders page.tsx
```

**Key insight:**
- Next.js App Router maps directory names directly to URLs
- Moving `app/thank-you/` to `app/confirmation/` changes URL from `/thank-you` to `/confirmation`
- Use redirect in next.config.mjs to maintain backward compatibility
- No code changes needed in page.tsx unless referencing the URL

**Source:** [Next.js App Router](https://nextjs.org/docs/app)

### Pattern 3: Responsive Breadcrumb Touch Targets (WCAG 2.5.8)

**What:** Mobile-first breadcrumb design with minimum 44×44px touch targets per WCAG 2.5.8 (Level AA).

**When to use:** All breadcrumb navigation on touch-enabled devices.

**Example:**

```typescript
// Source: https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/
// WCAG: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-10">
      <ol className="flex items-center gap-2 text-sm text-muted">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item.current ? (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href || "/"}
                // WCAG 2.5.8: minimum 44×44px touch target
                className="py-2 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            )}
            {index < items.length - 1 && (
              <span aria-hidden="true">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

**Key requirements:**
- WCAG 2.5.8 (Level AA): minimum 24×24px, best practice 44×44px
- Add vertical padding (`py-2` = 0.5rem × 2 = 16px, plus line height ~20px = ~36px total)
- Increase to `py-3` (24px + 20px = 44px) for strict WCAG AAA compliance
- Links need clickable area, but current page `<span>` does not

**Source:** [Understanding Success Criterion 2.5.8: Target Size (Minimum) | W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

### Pattern 4: Mobile Breadcrumb Text Truncation

**What:** Truncate long breadcrumb labels with ellipsis on small screens.

**When to use:** Product names, blog titles, or category names that may exceed mobile width.

**Example:**

```typescript
// Source: CSS text-overflow pattern
// https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-10">
      <ol className="flex items-center gap-2 text-sm text-muted">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 min-w-0">
            {item.current ? (
              <span
                aria-current="page"
                className="text-foreground truncate max-w-[200px] sm:max-w-none"
                title={item.label} // Show full text on hover
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href || "/"}
                className="py-2 transition-colors hover:text-foreground truncate max-w-[150px] sm:max-w-none"
                title={item.label}
              >
                {item.label}
              </Link>
            )}
            {index < items.length - 1 && (
              <span aria-hidden="true" className="flex-none">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

**Key insight:**
- Tailwind `truncate` = `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`
- Set max-width on mobile (`max-w-[200px]`), remove on larger screens (`sm:max-w-none`)
- Add `title` attribute for full text on hover (accessibility + UX)
- `flex-none` on separator prevents shrinking when text truncates
- `min-w-0` on list item allows flex child to shrink below content size

**Source:** [text-overflow - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-overflow)

### Pattern 5: Consistent Breadcrumb Spacing (Mobile-First)

**What:** Responsive gap spacing that adapts to screen size.

**When to use:** Breadcrumb separators and item spacing.

**Example:**

```typescript
// Source: https://tailwindcss.com/docs/responsive-design

<nav aria-label="Breadcrumb" className="mb-10">
  <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm text-muted">
    {/* Compact spacing on mobile (6px), normal on tablet+ (8px) */}
  </ol>
</nav>
```

**Key insight:**
- Mobile-first: `gap-1.5` (6px) for compact mobile layout
- Tablet+: `sm:gap-2` (8px) for comfortable spacing
- `flex-wrap` allows breadcrumbs to wrap on very small screens if needed
- Consistent with Tailwind's mobile-first philosophy (unprefixed = mobile, prefixed = larger)

**Source:** [Responsive Design - Tailwind CSS](https://tailwindcss.com/docs/responsive-design)

### Anti-Patterns to Avoid

- **Don't use middleware for static redirects**: Middleware adds Edge runtime overhead; use next.config.mjs for build-time redirects
- **Don't skip title attribute on truncated text**: Screen reader users and mouse users need access to full text
- **Don't use fixed pixel widths for touch targets**: Use Tailwind padding utilities (py-2, py-3) for responsive, maintainable touch targets
- **Don't forget aria-hidden on separators**: Visual separators (/, >) should not be announced by screen readers
- **Don't use client-side routing for redirects**: Next.js `<Link>` won't trigger next.config.mjs redirects; users typing URL directly need server-side redirect

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL redirection logic | Custom redirect middleware or API route | `next.config.mjs` redirects | Build-time processing, zero runtime cost, SEO-safe, query param forwarding built-in |
| Text truncation JavaScript | Custom ellipsis logic with substring | Tailwind `truncate` utility + CSS | Browser-native, works without JS, SSR-friendly, respects font rendering |
| Responsive breakpoints | Custom useMediaQuery hook | Tailwind responsive prefixes | No JS needed, works in SSR, standard breakpoints, smaller bundle |
| Touch target sizing | Manual pixel calculations | Tailwind padding utilities + WCAG guidelines | Accessible by default, responsive, maintainable |
| Breadcrumb ARIA attributes | Custom accessibility implementation | W3C ARIA breadcrumb pattern | Standardized, tested with assistive tech, screen reader compatible |

**Key insight:** Next.js and Tailwind provide primitives for redirects and responsive styling. Focus on configuration and composition, not custom logic.

## Common Pitfalls

### Pitfall 1: Redirects Not Working in Development

**What goes wrong:** Redirect from `/thank-you` to `/confirmation` doesn't work in `next dev`.

**Why it happens:** Next.js caches next.config.mjs and doesn't reload on changes in dev mode.

**How to avoid:**
- Restart dev server after modifying `next.config.mjs`
- Build and start production mode to test redirects: `npm run build && npm start`
- Redirects are processed during build, not runtime

**Warning signs:** Old URL still works, redirect doesn't trigger, no error message

**Source:** [Trouble with redirecting in next.config · vercel/next.js · Discussion #52611](https://github.com/vercel/next.js/discussions/52611)

### Pitfall 2: Forgetting to Forward Query Parameters

**What goes wrong:** `/thank-you?order_id=123` redirects to `/confirmation` without query params.

**Why it happens:** Redirect destination doesn't include query parameter forwarding.

**How to avoid:**
- Next.js automatically forwards query params with simple redirects
- Don't use `:path*` wildcards unless you need dynamic path segments
- Test redirect with query params: `curl -I http://localhost:3000/thank-you?order_id=123`

**Warning signs:** Order confirmation page loads but order_id is missing from URL

**Example:**

```javascript
// ✅ Good: Query params automatically forwarded
{
  source: '/thank-you',
  destination: '/confirmation',
  permanent: true,
}
// Result: /thank-you?order_id=123 → /confirmation?order_id=123

// ❌ Bad: Explicit path without query handling
{
  source: '/thank-you/:path*',
  destination: '/confirmation/:path*',
  permanent: true,
}
// Only needed for nested paths like /thank-you/details/123
```

**Source:** [next.config.js: redirects | Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)

### Pitfall 3: Touch Targets Too Small on Mobile

**What goes wrong:** Breadcrumb links hard to tap on mobile, users tap wrong item.

**Why it happens:** Text-only links without padding fall below WCAG 2.5.8 minimum (24×24px).

**How to avoid:**
- Add vertical padding: `py-2` (36-40px total) or `py-3` (44-48px total)
- Test on real device or Chrome DevTools mobile emulation
- Use browser accessibility inspector to measure click area

**Warning signs:** Users misclick breadcrumbs on mobile, accessibility audit flags small targets

**Example:**

```typescript
// ❌ Bad: Text-only link (~20px height)
<Link href="/products" className="text-sm">
  Products
</Link>

// ✅ Good: Padded link (~44px height)
<Link href="/products" className="py-3 text-sm">
  Products
</Link>
```

**Source:** [Understanding Success Criterion 2.5.8: Target Size (Minimum) | W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

### Pitfall 4: Breadcrumb Text Overflow on Mobile

**What goes wrong:** Long product names break breadcrumb layout, push content off screen.

**Why it happens:** No max-width or truncation on breadcrumb labels.

**How to avoid:**
- Use `truncate` utility with responsive `max-w-*` classes
- Add `flex-wrap` to `<ol>` for multi-line fallback
- Include `title` attribute for full text on hover
- Test with longest realistic product name

**Warning signs:** Breadcrumbs overflow horizontally, separator position breaks, mobile layout issues

**Example:**

```typescript
// ❌ Bad: No truncation, long text breaks layout
<Link href="/products/123" className="text-sm">
  Premium Custom-Dimension Textiles with Advanced Light Filtering Technology
</Link>

// ✅ Good: Truncated on mobile, full width on desktop
<Link
  href="/products/123"
  className="text-sm truncate max-w-[200px] sm:max-w-none"
  title="Premium Custom-Dimension Textiles with Advanced Light Filtering Technology"
>
  Premium Custom-Dimension Textiles with Advanced Light Filtering Technology
</Link>
```

**Source:** [Trimming Breadcrumb Title Lengths With CSS | mtekk's Crib](https://mtekk.us/archives/guides/trimming-breadcrumb-title-lengths-with-css/)

### Pitfall 5: Using 301 Instead of 308 in Next.js

**What goes wrong:** Not a functional issue, but `permanent: true` in Next.js uses 308, not 301.

**Why it happens:** Developers expect traditional 301 redirect status code.

**How to avoid:**
- Understand that Next.js uses 308 (permanent, preserves HTTP method) for `permanent: true`
- 308 is treated identically to 301 by Google for SEO purposes
- Don't override to 301 unless you specifically need legacy browser compatibility
- Use `permanent: false` for 307 (temporary)

**Warning signs:** Confusion about status codes in network inspector, expecting 301 but seeing 308

**Source:** [Understanding Redirects in Next.js: next.config.js vs Middleware | Medium](https://medium.com/@sumit.upadhyay108/understanding-redirects-in-next-js-next-config-js-vs-middleware-edge-functions-b62add15e911)

### Pitfall 6: Redirect Order Matters

**What goes wrong:** More specific redirects don't trigger because broader redirect matches first.

**Why it happens:** Next.js processes redirects in array order, first match wins.

**How to avoid:**
- Place specific redirects before general redirects in array
- For this phase (single redirect), order doesn't matter
- Keep in mind for future redirect additions

**Example:**

```javascript
// ❌ Bad: Broad redirect matches first
{
  source: '/:path*',
  destination: '/new/:path*',
  permanent: true,
},
{
  source: '/thank-you',
  destination: '/confirmation',
  permanent: true,
}, // Never reached!

// ✅ Good: Specific first, general last
{
  source: '/thank-you',
  destination: '/confirmation',
  permanent: true,
},
{
  source: '/:path*',
  destination: '/new/:path*',
  permanent: true,
},
```

**Source:** [next.config.js: redirects | Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)

## Code Examples

Verified patterns from official sources:

### Complete Redirect Configuration

```javascript
// next.config.mjs
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects

import { build } from 'velite'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/thank-you',
        destination: '/confirmation',
        permanent: true, // Uses 308 status code (treated as 301 by Google)
      },
    ]
  },
}

const isDev = process.argv.includes('dev')
const isBuild = process.argv.includes('build')

if (isDev || isBuild) {
  await build({ watch: isDev, clean: !isDev })
}

export default nextConfig
```

### Enhanced Breadcrumb Component with Responsive Styles

```typescript
// src/components/layout/breadcrumbs.tsx
// Source: W3C ARIA + WCAG 2.5.8 + Tailwind responsive patterns

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-10">
      <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm text-muted">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {item.current ? (
              <span
                aria-current="page"
                className="text-foreground truncate max-w-[200px] sm:max-w-none"
                title={item.label}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href || "/"}
                // WCAG 2.5.8: py-3 ensures ~44px touch target height
                className="py-3 transition-colors hover:text-foreground truncate max-w-[150px] sm:max-w-none"
                title={item.label}
              >
                {item.label}
              </Link>
            )}
            {index < items.length - 1 && (
              <span aria-hidden="true" className="flex-none">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

**Key enhancements from current implementation:**
1. **Touch targets**: Added `py-3` to links for 44×44px WCAG compliance
2. **Responsive spacing**: `gap-1.5 sm:gap-2` for compact mobile, comfortable desktop
3. **Text truncation**: `truncate max-w-[150px] sm:max-w-none` prevents overflow on mobile
4. **Tooltip**: `title={item.label}` shows full text on hover
5. **Flex wrapping**: `flex-wrap` allows multi-line on very small screens
6. **Consistent gaps**: Same gap value for list and item spacing

### Renamed Confirmation Page

```typescript
// src/app/confirmation/page.tsx
// Previously: src/app/thank-you/page.tsx
// NO CODE CHANGES - just directory rename

import Link from "next/link";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;

  return (
    <div className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-lg text-center">
        {/* Success icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8 text-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="mt-8 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
          Thank you for your order
        </h1>

        {order_id && (
          <p className="mt-3 font-mono text-sm text-muted">
            Order {order_id}
          </p>
        )}

        <p className="mt-4 text-base text-muted">
          Your custom textile is on its way to being made.
        </p>

        {/* What happens next */}
        <div className="mx-auto mt-14 max-w-sm text-left">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            What happens next
          </h2>
          <ol className="mt-6 space-y-5">
            {[
              {
                step: "01",
                title: "Order confirmation",
                description:
                  "You'll receive an email with your order details shortly.",
              },
              {
                step: "02",
                title: "Production",
                description:
                  "Your textile is cut to your exact dimensions and finished.",
              },
              {
                step: "03",
                title: "Shipping",
                description:
                  "Once ready, your order is packed and shipped to your address.",
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <span className="flex-none font-mono text-xs text-muted pt-0.5">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <Link
          href="/"
          className="mt-14 inline-flex items-center gap-2 bg-accent px-8 py-3.5 text-sm font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-80"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
```

**Note:** File content is identical to current `thank-you/page.tsx`. The URL change is achieved purely through directory rename + redirect.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 301 status code for permanent redirects | 308 status code in Next.js (`permanent: true`) | Next.js 9.5.0+ (2020) | Preserves HTTP method (POST/GET), treated same as 301 by Google for SEO |
| next.config.js (CommonJS) | next.config.mjs (ES modules) | Next.js 15+ (2024) | Allows top-level await for build tools like Velite |
| Middleware for all redirects | next.config.mjs for static redirects | Best practice evolution | Build-time vs runtime: config is zero-latency for known redirects |
| Fixed touch targets | WCAG 2.5.8 minimum 24×24px (44×44px best practice) | WCAG 2.2 (2023) | Improved mobile accessibility, Level AA compliance |
| CSS media queries | Tailwind responsive utilities | Tailwind adoption | Faster development, mobile-first by default, SSR-friendly |

**Deprecated/outdated:**
- **301 redirects in Next.js**: Still works with `statusCode: 301`, but `permanent: true` (308) is preferred
- **Middleware for static redirects**: Use next.config.mjs for better performance
- **Text-only breadcrumb links**: Below WCAG 2.5.8 Level AA touch target minimum

## Open Questions

1. **Should we update Shopify checkout redirect target?**
   - What we know: Shopify redirects to `/thank-you` after successful checkout
   - What's unclear: Whether Shopify config needs updating or Next.js redirect handles it
   - Recommendation: Test checkout flow after migration; Next.js redirect from `/thank-you` → `/confirmation` should work transparently, but verify Shopify doesn't validate redirect target

2. **Breadcrumb max-width values for mobile truncation**
   - What we know: Current breadcrumbs don't truncate, risk overflow on mobile
   - What's unclear: Optimal max-width values for different breadcrumb positions (early vs final)
   - Recommendation: Start with `max-w-[150px]` for links, `max-w-[200px]` for current page; adjust based on real product names after testing

3. **Touch target size: py-2 (36-40px) vs py-3 (44-48px)**
   - What we know: WCAG 2.5.8 Level AA requires 24×24px minimum, 44×44px is best practice
   - What's unclear: Whether to use `py-2` (meets Level AA) or `py-3` (meets best practice/AAA)
   - Recommendation: Use `py-3` for strict WCAG AAA compliance and better mobile UX; small visual change, big accessibility improvement

4. **Should we add explicit page title update?**
   - What we know: Page file is renamed but H1 still says "Thank you for your order"
   - What's unclear: Whether "Thank you" page title is acceptable for `/confirmation` URL
   - Recommendation: Keep current H1 ("Thank you for your order") as it's user-facing copy, not technical; URL change is for SEO/clarity, content is still a thank you message

## Sources

### Primary (HIGH confidence)

- Next.js redirects: https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects (official docs, v16.1.6, updated 2026-02-11)
- W3C ARIA Breadcrumb Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/ (official W3C spec)
- WCAG 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html (official WCAG 2.2 spec)
- Tailwind Responsive Design: https://tailwindcss.com/docs/responsive-design (official docs)
- CSS text-overflow: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-overflow (MDN official docs)

### Secondary (MEDIUM confidence)

- [Understanding Redirects in Next.js: next.config.js vs Middleware | Medium](https://medium.com/@sumit.upadhyay108/understanding-redirects-in-next-js-next-config-js-vs-middleware-edge-functions-b62add15e911) (verified with official docs)
- [Redirects and Google Search | Google Search Central](https://developers.google.com/search/docs/crawling-indexing/301-redirects) (official Google guidance)
- [Breadcrumbs: 11 Design Guidelines for Desktop and Mobile - NN/G](https://www.nngroup.com/articles/breadcrumbs/) (UX research)
- [Accessible Breadcrumbs - example and best practices | Aditus](https://www.aditus.io/patterns/breadcrumbs/) (verified against W3C)
- [Trimming Breadcrumb Title Lengths With CSS | mtekk's Crib](https://mtekk.us/archives/guides/trimming-breadcrumb-title-lengths-with-css/) (CSS pattern)

### Tertiary (LOW confidence)

None - all findings verified against official documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All technologies already in project, standard Next.js patterns
- Architecture: HIGH - Patterns verified against Next.js 16.1.6 official docs (updated 2026-02-11), W3C ARIA, WCAG 2.2
- Pitfalls: HIGH - Sourced from official docs and verified GitHub discussions

**Research date:** 2026-02-13
**Valid until:** 2026-03-13 (30 days - stable Next.js release cycle)
