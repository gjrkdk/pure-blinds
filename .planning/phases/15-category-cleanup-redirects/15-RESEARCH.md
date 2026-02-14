# Phase 15: Category Cleanup & Redirects - Research

**Researched:** 2026-02-14
**Domain:** Next.js App Router route cleanup, SEO redirects, TypeScript catalog narrowing
**Confidence:** HIGH

## Summary

This phase removes venetian-blinds and textiles categories from the webshop, leaving only roller-blinds. The work spans four domains: (1) Next.js redirect configuration for SEO preservation, (2) file structure cleanup (routes, data, pricing), (3) TypeScript type narrowing for the simplified catalog, and (4) cart validation to handle products removed from inventory.

The critical insight: Next.js 16 provides two redirect approaches (next.config.js vs middleware), but for this phase's static redirect list (8-10 total redirects), next.config.js is optimal. The 1024-redirect limit is nowhere near a concern. All redirects should use 301 status (per user decision), which Google treats identically to 308 for SEO equity transfer.

Cart handling requires silent cleanup on load using Zustand's existing version migration system already in place (version 3, /Users/robinkonijnendijk/Desktop/pure-blinds/src/lib/cart/store.ts lines 156-161).

**Primary recommendation:** Use next.config.js for redirects (simple, fast, SEO-safe). Delete route folders and data files directly. Narrow TypeScript types to prevent re-introduction of removed categories. Leverage existing Zustand migration to clear invalid cart items.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
**Redirect destinations:**
- All removed category URLs (`/products/venetian-blinds`, `/products/textiles`) redirect to `/products`
- All removed product URLs (`/products/venetian-blinds/venetian-blinds-25mm`, `/products/textiles/custom-textile`) redirect to `/products`
- Use 301 permanent redirects (not 308)
- Wildcard catch-all: any path under `/products/venetian-blinds/*` or `/products/textiles/*` redirects to `/products`

**Navigation simplification:**
- `/products` page keeps same layout, shows only the Roller Blinds category card (remove venetian and textile cards)
- Header nav stays as-is: "Products" linking to `/products`
- Footer links cleaned up — remove any references to removed categories
- Breadcrumbs keep full hierarchy (Home > Products > Roller Blinds > ...)

**Removed product handling:**
- Delete pricing matrix JSON files for removed products completely
- Delete route files (page.tsx) for venetian-blinds and textiles categories
- Handle redirects via Next.js config or middleware, not route files
- Silently remove invalid cart items on load (no user-facing message)
- No Shopify-side changes — leave Shopify products as-is

**Catalog data cleanup:**
- Remove venetian-blinds and textiles category entries from products.json entirely
- Remove venetian-blinds-25mm and custom-textile product entries from products.json
- Products page: just remove the two hardcoded cards (keep hardcoded approach)
- Full codebase audit: search and remove all references to venetian/textiles everywhere
- Tighten TypeScript types to reflect the simpler catalog (narrow category unions)

### Claude's Discretion
- Redirect implementation approach (next.config.js redirects vs middleware)
- Order of cleanup operations
- How to handle any edge cases discovered during codebase audit

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router redirects | Built-in redirect config in next.config.js with SEO-safe 301/308 support |
| TypeScript | ^5 | Type narrowing | Union literal types for catalog safety |
| Zustand | ^5.0.10 | Cart persistence | Built-in migration system for version-based data cleanup |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | - | No additional libraries needed for this phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next.config.js redirects | Middleware | Use middleware only for dynamic redirects (cookie/header-based). For static redirect lists like this phase, next.config.js is faster (build-time vs runtime) and simpler |

**Installation:**
No new packages required — all functionality exists in current stack.

## Architecture Patterns

### Recommended File Cleanup Sequence
```
1. Add redirects to next.config.mjs
2. Delete route folders (prevents 404s before redirects active)
3. Delete pricing JSON files
4. Update products.json (remove entries)
5. Update UI components (footer, products page)
6. Narrow TypeScript types
7. Add cart migration logic
8. Codebase-wide text search for references
```

**Rationale:** Redirects first ensures no 404s during file deletion. TypeScript narrowing at end prevents accidental re-introduction.

### Pattern 1: Next.js Redirects in next.config.mjs
**What:** Static redirect configuration for permanent URL moves
**When to use:** Known redirect list, no dynamic logic, SEO equity preservation
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects
async redirects() {
  return [
    // Category pages
    {
      source: '/products/venetian-blinds',
      destination: '/products',
      permanent: true, // 308 by default, but Next.js handles 301 when specified
    },
    // Wildcard catch-all
    {
      source: '/products/venetian-blinds/:path*',
      destination: '/products',
      permanent: true,
    },
  ]
}
```

**Key insight:** Next.js uses 308 by default for `permanent: true`, but treats it identically to 301 for SEO. Google officially treats both the same for link equity transfer (per Google Search Central documentation).

**User override:** CONTEXT.md specifies 301 explicitly, not 308. While functionally identical for SEO, to honor user decision, redirects should be verified to return 301 status (Next.js may need explicit status code if 308 is default).

### Pattern 2: Wildcard Redirects with :path*
**What:** Catch-all redirect for any nested path under a base route
**When to use:** Delete entire route subtree, redirect all possible paths to single destination
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects
{
  source: '/products/venetian-blinds/:path*',
  destination: '/products',
  permanent: true,
}
```

**Covers:**
- `/products/venetian-blinds`
- `/products/venetian-blinds/venetian-blinds-25mm`
- `/products/venetian-blinds/anything/nested/here`

**Limits:** Next.js allows 1024 total redirects on Vercel. This phase needs ~8-10 redirects (well under limit).

### Pattern 3: TypeScript Literal Union Narrowing
**What:** Narrow union types to prevent invalid values at compile time
**When to use:** After removing data, update types to reflect new constraints
**Example:**
```typescript
// Source: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
// Before (accepts any category)
type Category = string;

// After (only valid categories)
type Category = 'roller-blinds';

// For products with subcategories
type Subcategory = 'transparent-roller-blinds' | 'blackout-roller-blinds';
```

**Benefit:** Compile-time safety prevents accidental references to removed categories. TypeScript will error if code tries to use 'venetian-blinds' or 'textiles'.

### Pattern 4: Zustand Version Migration for Cart Cleanup
**What:** Use Zustand persist middleware's migration system to clean invalid cart items
**When to use:** Data structure changes, removed products, invalid persisted state
**Example:**
```typescript
// Source: https://zustand.docs.pmnd.rs/middlewares/persist
// Current implementation in src/lib/cart/store.ts (lines 152-161)
migrate: (persistedState, version) => {
  if (version < 4) {
    // Version 4: Remove venetian-blinds and textiles from cart
    const state = persistedState as { items: CartItem[] };
    const validItems = state.items.filter(item => {
      const product = getProduct(item.productId);
      return product !== undefined; // Keep only products that still exist
    });
    if (validItems.length < state.items.length) {
      console.warn('Removed invalid cart items (deleted products)');
    }
    return { items: validItems };
  }
  return persistedState as { items: CartItem[] };
}
```

**Current cart store:** Version 3 migration clears cart for old product IDs. Increment to version 4 and add product validation filter.

### Pattern 5: Next.js App Router Route Deletion
**What:** Remove route folders to delete pages from site
**When to use:** Permanently removing pages, preventing access
**Example:**
```bash
# Source: https://nextjs.org/docs/app/getting-started/project-structure
# Delete category route
rm -rf src/app/products/venetian-blinds

# Delete subcategory routes (if nested)
rm -rf src/app/products/textiles
```

**Critical:** Delete page.tsx files — Next.js App Router uses file-based routing. No page.tsx = no route (404 without redirect).

**Files to delete:**
- `/Users/robinkonijnendijk/Desktop/pure-blinds/src/app/products/venetian-blinds/page.tsx`
- `/Users/robinkonijnendijk/Desktop/pure-blinds/src/app/products/textiles/page.tsx`

### Anti-Patterns to Avoid
- **Client-side redirects:** Don't use `useRouter().push()` or `<meta>` redirects — these hurt SEO and require JavaScript. Always use server-side redirects (next.config.js).
- **Leaving route files with redirects:** Don't keep page.tsx files that manually redirect. Delete the files and use next.config.js redirects instead.
- **Redirect chains:** Don't redirect A → B → C. Redirect directly to final destination (A → C).
- **Hardcoded category strings:** After narrowing types, don't use string literals for categories. Use type-safe constants or let TypeScript infer from narrowed unions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL redirects | Custom redirect handler in route files | next.config.js redirects | Next.js handles all redirect logic (status codes, caching, SEO headers) automatically. Custom handlers miss edge cases (trailing slashes, query params, etc.) |
| Cart migration | Manual localStorage parsing/cleanup on every render | Zustand persist middleware `migrate` | Runs once on hydration, version-controlled, handles JSON parse errors gracefully. Manual approach risks infinite loops or performance hits |
| Type safety for removed categories | Runtime validation with if/switch | TypeScript literal union types | Compile-time prevention is always better than runtime checks. Literal unions block invalid code from compiling |

**Key insight:** Next.js, TypeScript, and Zustand all provide built-in solutions for this phase's problems. Zero custom code needed for redirects, type safety, or cart cleanup — just configuration.

## Common Pitfalls

### Pitfall 1: 308 vs 301 Status Code Confusion
**What goes wrong:** Next.js defaults to 308 for `permanent: true` redirects, but user specified 301
**Why it happens:** Next.js documentation emphasizes 308 as "the newer version" and defaults to it
**How to avoid:** After adding redirects, test with `curl -I http://localhost:3000/products/venetian-blinds` to verify status code. If 308 appears instead of 301, next.config.js may need explicit `statusCode: 301` property
**Warning signs:** Redirect works but returns HTTP 308 instead of HTTP 301
**Source:** [Understanding Redirects in Next.js: next.config.js vs Middleware](https://medium.com/@sumit.upadhyay108/understanding-redirects-in-next-js-next-config-js-vs-middleware-edge-functions-b62add15e911)

### Pitfall 2: Deleting Routes Before Adding Redirects
**What goes wrong:** Users hit 404s between deploy and redirect activation
**Why it happens:** Developer deletes page.tsx files first, commits, then adds redirects in separate commit
**How to avoid:** Add redirects to next.config.mjs in same commit as route deletion. Redirects take precedence over file routes.
**Warning signs:** 404 errors in deployment preview or production for removed URLs

### Pitfall 3: Missing Wildcard Catch-All Redirects
**What goes wrong:** Direct product URLs redirect, but nested paths (with subcategories) return 404
**Why it happens:** Developer adds specific redirects but forgets wildcard pattern
**How to avoid:** For each removed category, add TWO redirects: (1) exact path, (2) wildcard `:path*` pattern
**Warning signs:** `/products/venetian-blinds` redirects but `/products/venetian-blinds/venetian-blinds-25mm` returns 404
**Example:**
```typescript
// Missing wildcard = broken
{ source: '/products/venetian-blinds', destination: '/products', permanent: true }

// Correct approach
{ source: '/products/venetian-blinds', destination: '/products', permanent: true },
{ source: '/products/venetian-blinds/:path*', destination: '/products', permanent: true }
```

### Pitfall 4: Stale Cart Items Persisting After Product Deletion
**What goes wrong:** Cart shows "venetian-blinds-25mm" items after product removed, breaks checkout
**Why it happens:** Zustand persists to localStorage with 7-day TTL. Users who added items before deletion still have them in cart
**How to avoid:** Bump cart store version (currently 3 → increment to 4) and add migration that filters out items where `getProduct(item.productId)` returns undefined
**Warning signs:** Console errors in product configurator, undefined product lookups, checkout failures
**Source:** [Persisting store data - Zustand](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)

### Pitfall 5: TypeScript Types Not Updated After Data Removal
**What goes wrong:** New code accidentally references removed categories (e.g., `category: 'venetian-blinds'`) and TypeScript doesn't catch it
**Why it happens:** Product.category is typed as `string` instead of literal union
**How to avoid:** Update type definitions to use literal unions: `type Category = 'roller-blinds'` instead of `type Category = string`
**Warning signs:** No TypeScript errors when writing code that references removed categories
**Source:** [TypeScript: Documentation - Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

### Pitfall 6: Incomplete Codebase Text References
**What goes wrong:** Footer still shows "Venetian Blinds" link, about section mentions "textiles", etc.
**Why it happens:** Developer updates data files but misses hardcoded text in components
**How to avoid:** After file/data cleanup, run codebase-wide search for "venetian", "textiles", "custom-textile", "venetian-blinds-25mm" (case-insensitive). Update or remove all matches.
**Warning signs:** UI still shows removed categories in navigation or marketing copy
**Files found with references (from grep):**
- `/Users/robinkonijnendijk/Desktop/pure-blinds/src/components/layout/footer.tsx` (lines 5-7, hardcoded links)
- `/Users/robinkonijnendijk/Desktop/pure-blinds/src/components/home/about-section.tsx` (line 32, "textiles" in copy)
- `/Users/robinkonijnendijk/Desktop/pure-blinds/src/components/home/faq-section.tsx` (mentions "textiles" in FAQ copy)

### Pitfall 7: Redirect Limit Misunderstanding
**What goes wrong:** Developer thinks redirect limit is 1024 per category/pattern, not total
**Why it happens:** Vercel documentation mentions "1024 redirects" without emphasizing it's cumulative
**How to avoid:** Understand 1024 is TOTAL across all redirects, rewrites, headers combined. This phase adds ~8-10 redirects (no risk of hitting limit).
**Warning signs:** Build fails with "Maximum number of routes exceeded" (only if project already has 1000+ redirects)
**Source:** [Is there a limit to redirects and rewrites?](https://github.com/vercel/next.js/discussions/16191)

## Code Examples

Verified patterns from official sources:

### Next.js Redirects Configuration (next.config.mjs)
```typescript
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Venetian blinds category
      {
        source: '/products/venetian-blinds',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/products/venetian-blinds/:path*',
        destination: '/products',
        permanent: true,
      },
      // Textiles category
      {
        source: '/products/textiles',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/products/textiles/:path*',
        destination: '/products',
        permanent: true,
      },
      // Note: Next.js defaults to 308, may need statusCode: 301 if explicit 301 required
    ]
  },
}

export default nextConfig;
```

### TypeScript Literal Union Type Narrowing
```typescript
// Source: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
// File: src/lib/product/types.ts

// Before: accepts any string
export interface Product {
  category: string;
  subcategory?: string;
  // ...
}

// After: only valid categories
export type Category = 'roller-blinds';
export type Subcategory = 'transparent-roller-blinds' | 'blackout-roller-blinds';

export interface Product {
  category: Category;
  subcategory?: Subcategory;
  // ...
}
```

**Benefit:** TypeScript will error on `category: 'venetian-blinds'` at compile time.

### Zustand Cart Version Migration
```typescript
// Source: https://zustand.docs.pmnd.rs/middlewares/persist
// File: src/lib/cart/store.ts

import { getProduct } from '@/lib/product/catalog';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // ... store implementation
    }),
    {
      name: 'cart-storage',
      version: 4, // Increment from 3 → 4
      storage: createJSONStorage(() => storageWithTTL),
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState, version) => {
        // Previous migrations
        if (version < 3) {
          console.warn('Cart format changed (v3: new product IDs) - clearing old items');
          return { items: [] };
        }

        // NEW: Version 4 migration - remove invalid products
        if (version < 4) {
          const state = persistedState as { items: CartItem[] };
          const validItems = state.items.filter(item => {
            const product = getProduct(item.productId);
            return product !== undefined; // Only keep existing products
          });

          if (validItems.length < state.items.length) {
            console.warn('Removed invalid cart items (deleted products)');
          }

          return { items: validItems };
        }

        return persistedState as { items: CartItem[] };
      },
    }
  )
);
```

### Hardcoded Categories Array Cleanup
```typescript
// Source: Current codebase at src/app/products/page.tsx
// File: src/app/products/page.tsx

// Before: 3 categories
const categories: Category[] = [
  {
    id: "roller-blinds",
    name: "Roller Blinds",
    description: "Made-to-measure roller blinds in transparent and blackout options",
    href: "/products/roller-blinds",
  },
  {
    id: "venetian-blinds",
    name: "Venetian Blinds",
    description: "Classic venetian blinds in various sizes",
    href: "/products/venetian-blinds",
  },
  {
    id: "textiles",
    name: "Textiles",
    description: "Premium custom-dimension textiles",
    href: "/products/textiles",
  },
];

// After: 1 category
const categories: Category[] = [
  {
    id: "roller-blinds",
    name: "Roller Blinds",
    description: "Made-to-measure roller blinds in transparent and blackout options",
    href: "/products/roller-blinds",
  },
];
```

### Footer Links Cleanup
```typescript
// Source: Current codebase at src/components/layout/footer.tsx
// File: src/components/layout/footer.tsx

// Before: links to removed categories
const links = [
  { label: "Roller Blinds", href: "/products/roller-blinds" },
  { label: "Venetian Blinds", href: "/products/venetian-blinds" },
  { label: "Textiles", href: "/products/textiles" },
  { label: "Blog", href: "/blog" },
  { label: "About us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

// After: only valid links
const links = [
  { label: "Roller Blinds", href: "/products/roller-blinds" },
  { label: "Blog", href: "/blog" },
  { label: "About us", href: "#about" },
  { label: "Contact", href: "#contact" },
];
```

### products.json Data Cleanup
```json
// Source: Current data at /Users/robinkonijnendijk/Desktop/pure-blinds/data/products.json

// Before: 4 products (2 roller blinds, 1 venetian, 1 textile)
{
  "version": "1.0.0",
  "lastUpdated": "2026-02-13",
  "products": [
    {
      "id": "roller-blind-white",
      "category": "roller-blinds",
      // ... keep this
    },
    {
      "id": "roller-blind-black",
      "category": "roller-blinds",
      // ... keep this
    },
    {
      "id": "venetian-blinds-25mm",
      "category": "venetian-blinds",
      // ... DELETE THIS ENTIRE OBJECT
    },
    {
      "id": "custom-textile",
      "category": "textiles",
      // ... DELETE THIS ENTIRE OBJECT
    }
  ]
}

// After: 2 products (roller blinds only)
{
  "version": "1.0.0",
  "lastUpdated": "2026-02-14",
  "products": [
    {
      "id": "roller-blind-white",
      "category": "roller-blinds",
      // ...
    },
    {
      "id": "roller-blind-black",
      "category": "roller-blinds",
      // ...
    }
  ]
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 301 redirects only | 308 permanent redirects | Next.js 13+ (2023) | Both treated identically by Google for SEO. 308 preserves HTTP method (POST stays POST), 301 may change to GET. For GET requests (standard web pages), no functional difference. |
| Middleware for all redirects | next.config.js for static, middleware for dynamic | Next.js 16 (2026) | next.config.js redirects are faster (build-time) and simpler. Middleware should only be used for conditional logic (cookies, headers, etc.) |
| Manual localStorage cleanup | Zustand persist middleware migration | Zustand v4+ (2023) | Version-based migrations handle state changes cleanly. Runs once on hydration, not every render. |

**Deprecated/outdated:**
- **getStaticPaths/getStaticProps for redirects:** Pages Router approach. App Router uses redirects() in next.config.js or redirect() function in Server Components.
- **String unions without literal types:** TypeScript now strongly encourages literal union types for finite string sets. String type is too permissive for category fields.

## Open Questions

1. **Does Next.js 16.1.6 default to 308 or 301 for permanent: true?**
   - What we know: Documentation says 308 is "the newer version", but some sources suggest 301 is still default
   - What's unclear: Exact status code returned by current Next.js version
   - Recommendation: Test redirect in development with `curl -I http://localhost:3000/products/venetian-blinds` after adding redirects. If returns 308 instead of user-specified 301, add `statusCode: 301` property to redirect objects.

2. **Should about section / FAQ "textiles" references be updated?**
   - What we know: About section (line 32) says "Crafting custom textiles", FAQ mentions "textiles" generically
   - What's unclear: Whether "textiles" as generic term (vs "Textiles" product category) should be removed
   - Recommendation: Update about section to "Crafting custom roller blinds" or "custom window treatments". FAQ can reference "products" instead of "textiles" to stay generic without mentioning removed category.

3. **Are there any blog posts or content pages mentioning removed categories?**
   - What we know: Blog exists at /blog route (from header nav)
   - What's unclear: Whether blog content references venetian blinds or textiles categories
   - Recommendation: During codebase audit, grep .md/.mdx files in content directory for "venetian", "textiles" references. Update or remove as needed.

## Sources

### Primary (HIGH confidence)
- [next.config.js: redirects | Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects) - Official Next.js redirect configuration
- [Redirects and Google Search | Google Search Central](https://developers.google.com/search/docs/crawling-indexing/301-redirects) - Google's official redirect guidance
- [TypeScript: Documentation - Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) - Official TypeScript narrowing handbook
- [Persisting store data - Zustand](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) - Official Zustand persist middleware docs
- [Getting Started: Project Structure | Next.js](https://nextjs.org/docs/app/getting-started/project-structure) - Official Next.js App Router file structure

### Secondary (MEDIUM confidence)
- [Understanding Redirects in Next.js: next.config.js vs Middleware](https://medium.com/@sumit.upadhyay108/understanding-redirects-in-next-js-next-config-js-vs-middleware-edge-functions-b62add15e911) - Published July 2025, verified against official docs
- [308 vs 301 Redirect: Which Is Best](https://viralchilly.com/blog/308-vs-301-redirection) - SEO comparison, consistent with Google documentation
- [Is there a limit to redirects and rewrites?](https://github.com/vercel/next.js/discussions/16191) - Vercel official discussion confirming 1024 limit

### Tertiary (LOW confidence)
None - all findings verified with official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, no new dependencies
- Architecture: HIGH - All patterns from official Next.js/TypeScript/Zustand docs
- Pitfalls: HIGH - Identified from current codebase structure and common redirect issues

**Research date:** 2026-02-14
**Valid until:** March 2026 (30 days - stable domain, unlikely to change rapidly)
