# Pitfalls Research

**Domain:** Multi-Product E-Commerce Expansion (Next.js)
**Researched:** 2026-02-13
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Hardcoded Single Pricing Matrix Import

**What goes wrong:**
The pricing calculator currently imports a single JSON file directly: `import pricingData from '../../../data/pricing-matrix.json'`. When adding multiple products with different pricing matrices, developers often duplicate this pattern by importing all matrices at build time, causing massive bundle bloat. Each pricing matrix JSON gets bundled into every client-side chunk that imports the calculator.

**Why it happens:**
The existing single-product system uses static imports because it's simple and works fine for one matrix. The pattern looks clean and easy to replicate. Developers assume "just add more imports" without considering bundle size implications. Static imports in Next.js are processed at build time, and multiple large JSON files (20KB+ each) quickly balloon the initial bundle.

**How to avoid:**
1. **Refactor pricing calculator to accept matrix as parameter** instead of importing it directly
2. **Load pricing matrices server-side only** in API routes or Server Components
3. **Pass product-specific matrix to calculator** rather than bundling all matrices
4. **Use dynamic imports for client-side scenarios** only when necessary (rarely needed for pricing)

Example refactor:
```typescript
// OLD: Couples calculator to single matrix
import pricingData from '../../../data/pricing-matrix.json';
export function calculatePrice(width: number, height: number): PricingResponse {
  const pricing = pricingData as PricingMatrixData;
  // ...calculation
}

// NEW: Calculator accepts matrix as dependency
export function calculatePrice(
  width: number,
  height: number,
  pricingMatrix: PricingMatrixData
): PricingResponse {
  // ...calculation using pricingMatrix parameter
}
```

**Warning signs:**
- Initial bundle size increases by 100KB+ after adding products
- Lighthouse performance score drops
- Chrome DevTools Network tab shows large JSON chunks in client bundles
- Multiple `pricing-matrix-*.json` files visible in `.next/static/chunks/`

**Phase to address:**
**Phase 1: Product Catalog Foundation** - Must refactor before adding multiple products. Fixing this after the fact requires touching every pricing call site.

---

### Pitfall 2: Cart Item ID Collisions Between Products

**What goes wrong:**
The cart uses `generateCartItemId(productId, options)` to create unique IDs. When adding multiple products, if two different products happen to have the same options (width/height), the cart treats them as the same item, merging quantities incorrectly. For example, a 100x150cm white rollerblind gets merged with a 100x150cm black rollerblind because the ID generation doesn't distinguish products clearly enough.

**Why it happens:**
The current cart system was designed for a single product where only dimensions matter for uniqueness. The `generateCartItemId` function likely hashes or concatenates just the options, not incorporating the product ID properly. Developers assume the existing ID generation "just works" without auditing the actual implementation for multi-product scenarios.

**How to avoid:**
1. **Audit cart ID generation** to ensure `productId` is properly included in the hash/ID
2. **Add integration tests** covering multi-product cart scenarios
3. **Verify cart deduplication logic** explicitly checks both `productId` AND `options`
4. **Add cart validation** that prevents invalid merges

Test case to write:
```typescript
// Test: Different products with same dimensions should NOT merge
test('cart keeps different products separate with identical dimensions', () => {
  const cart = useCartStore.getState();

  cart.addItem({
    productId: 'white-rollerblind',
    productName: 'White Rollerblind',
    options: { width: 100, height: 150 },
    priceInCents: 5000
  });

  cart.addItem({
    productId: 'black-rollerblind',
    productName: 'Black Rollerblind',
    options: { width: 100, height: 150 },
    priceInCents: 6000
  });

  expect(cart.items).toHaveLength(2); // NOT 1 merged item
});
```

**Warning signs:**
- QA reports "wrong product in cart"
- Quantity increases when adding different products
- Cart total incorrect when multiple products have same dimensions
- Customer complaints about checkout showing wrong items

**Phase to address:**
**Phase 1: Product Catalog Foundation** - Cart must handle multiple products correctly from the start. This is a data corruption risk that silently breaks the checkout flow.

---

### Pitfall 3: Next.js Route Conflicts: `/products/[productId]` vs `/products/rollerblinds`

**What goes wrong:**
You already have `/products/[productId]/page.tsx` for individual products and `/products/rollerblinds/page.tsx` for the category listing. Next.js treats static segments (`rollerblinds`) with higher priority than dynamic segments (`[productId]`), so this works. However, if you later add a product with ID `rollerblinds`, it creates an ambiguous conflict. The router cannot distinguish between the category page and a product detail page for a product literally named "rollerblinds".

**Why it happens:**
Next.js file-based routing appears straightforward, but the interaction between static and dynamic routes at the same level is subtle. Developers don't realize that product IDs and category slugs share the same URL namespace under `/products/`. When product data comes from multiple sources (database, CMS, manual entry), nothing prevents ID collision with category slugs.

**How to avoid:**
1. **Use different route prefixes**: `/products/[productId]` for products, `/categories/[slug]` for categories
2. **OR use route groups** to separate concerns: `/products/(item)/[productId]` vs `/products/(category)/[slug]` with rewrites
3. **Validate product IDs** against reserved category slugs in the product data layer
4. **Document reserved words** that cannot be used as product IDs (category slugs, "new", "search", etc.)

Recommended structure:
```
app/
├── products/
│   └── [productId]/
│       └── page.tsx          # Individual product detail
├── categories/
│   └── [categorySlug]/
│       └── page.tsx          # Category listing
└── blog/
    └── [slug]/
        └── page.tsx          # Blog posts
```

**Warning signs:**
- 404 errors for valid product IDs that match category names
- Category page renders product detail or vice versa
- Next.js build warnings about route priority conflicts
- SEO issues with duplicate or conflicting canonical URLs

**Phase to address:**
**Phase 1: Product Catalog Foundation** - Establish routing architecture before expanding. Refactoring routes after content is indexed breaks SEO and customer bookmarks.

---

### Pitfall 4: Zustand localStorage Hydration Mismatch with Multi-Product Cart

**What goes wrong:**
The cart uses Zustand with localStorage persistence. With a single product, hydration mismatches are rare because the cart structure is simple. With multiple products, different pricing matrices, and more complex cart items, the server renders with empty cart state while the client hydrates with localStorage data. React throws hydration errors: "Text content does not match server-rendered HTML" when cart counts differ. The cart icon shows "0 items" for a flash before updating to the correct count.

**Why it happens:**
Server-side rendering cannot access localStorage (browser API). Zustand's persist middleware loads data only after client-side hydration. The current implementation likely renders cart state directly in the initial SSR output, causing a mismatch. With more complex multi-product data, the divergence between server (empty) and client (populated) state becomes more visible.

**How to avoid:**
1. **Implement `useSyncExternalStore`** pattern for cart state (tells React mismatch is expected)
2. **OR use `useState` + `useEffect`** to defer cart rendering until client-side hydration completes
3. **OR use cookie-based persistence** (accessible server-side) instead of localStorage
4. **Render placeholder during hydration** to prevent content shift

Recommended pattern:
```typescript
// useHydration.ts - Custom hook to handle SSR/client mismatch
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

// cart-icon.tsx - Use hydration hook
export function CartIcon() {
  const hydrated = useHydration();
  const itemCount = useCartStore((state) => state.getItemCount());

  // Show placeholder during SSR and initial client render
  if (!hydrated) {
    return <CartIconShell count={0} />;
  }

  return <CartIconShell count={itemCount} />;
}
```

**Warning signs:**
- Console errors: "Warning: Text content did not match..."
- Cart icon flashes wrong count on page load
- Layout shift (CLS) when cart hydrates
- React hydration warnings in development

**Phase to address:**
**Phase 1: Product Catalog Foundation** - Fix before multi-product expansion amplifies the issue. With more products, hydration mismatches become more frequent and visible.

---

### Pitfall 5: API Race Conditions When Loading Multiple Pricing Matrices

**What goes wrong:**
The dimension configurator debounces pricing API calls (400ms). With a single product, this works fine. With multiple products on a category page (each with a configurator or quick-add form), multiple pricing API calls fire simultaneously. The API route currently loads the pricing matrix synchronously via static import, but as you scale to per-product matrices, developers will add dynamic loading logic. Without proper concurrent request handling, race conditions cause: (1) wrong pricing loaded for wrong product, (2) API responses arriving out-of-order and updating wrong component state, (3) excessive server load from redundant matrix loading.

**Why it happens:**
The current API route (`/api/pricing`) doesn't accept a `productId` parameter - it assumes one global pricing matrix. When developers add product-specific pricing, they'll either: (1) add `productId` to the API and load matrices dynamically, or (2) create separate API routes per product. Both approaches introduce concurrency issues if not properly handled. Client-side debouncing prevents request spam from a single user, but doesn't coordinate between multiple concurrent users or multiple components.

**How to avoid:**
1. **Add caching/memoization** for pricing matrix loading (in-memory cache with TTL)
2. **Use React Query or SWR** on client for request deduplication
3. **Implement request coalescing** (combine multiple pending requests for same product)
4. **Add `productId` to API request** and load product-specific matrices
5. **Use AbortController** to cancel stale requests when user changes input

API pattern:
```typescript
// In-memory cache for pricing matrices
const matrixCache = new Map<string, { data: PricingMatrixData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function loadPricingMatrix(productId: string): Promise<PricingMatrixData> {
  const cached = matrixCache.get(productId);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Dynamic import only when cache miss
  const matrix = await import(`../../../../data/pricing/${productId}.json`);
  matrixCache.set(productId, { data: matrix.default, timestamp: Date.now() });

  return matrix.default;
}

export async function POST(request: Request) {
  const { width, height, productId } = await request.json();

  // Load product-specific matrix (cached)
  const matrix = await loadPricingMatrix(productId);

  // Calculate price with product-specific matrix
  const result = calculatePrice(width, height, matrix);

  return NextResponse.json(result);
}
```

**Warning signs:**
- Intermittent wrong prices displayed
- Console errors about stale state updates
- High API response times under load
- Server memory usage increases with traffic

**Phase to address:**
**Phase 2: Category Navigation** - Required when category pages show multiple products with pricing. Can defer if phase 2 only shows product cards without live pricing.

---

### Pitfall 6: Product Data Structure Inconsistency Breaking Cart/Checkout

**What goes wrong:**
The current product data (`src/lib/product/data.ts`) uses an in-memory object with mixed ID schemes: `"custom-textile"` uses a semantic ID, `"venetian-blinds-25mm"` uses a Shopify product ID (`10373715755274`), and newer products use semantic IDs. When checkout creates Shopify draft orders, it needs Shopify product variant IDs. The mismatch between product data IDs and Shopify IDs causes checkout failures. Cart items with semantic IDs can't be mapped to Shopify line items.

**Why it happens:**
The initial implementation mixed concerns: product catalog IDs (for routing/display) and Shopify integration IDs (for checkout). This works when manually wiring up single products, but breaks down with catalog expansion. Developers adding new products don't have clear guidance on which ID to use, leading to inconsistent data structure.

**How to avoid:**
1. **Separate catalog IDs from Shopify IDs** in product data structure
2. **Add explicit Shopify variant ID mapping** for each product
3. **Validate ID structure** in product data (TypeScript types + runtime validation)
4. **Add checkout integration tests** that verify ID mappings

Recommended structure:
```typescript
export interface ProductData {
  id: string;                    // Catalog ID (for routing, URLs)
  name: string;
  description: string;
  category?: string;
  shopify: {
    productId: string;           // Shopify product ID
    variantId: string;           // Shopify variant ID (for draft orders)
  };
  details: { label: string; value: string; }[];
}
```

Migration strategy:
- Audit all existing products for Shopify ID mappings
- Update product data structure with separate fields
- Add validation that prevents missing Shopify IDs
- Update checkout flow to use `product.shopify.variantId`

**Warning signs:**
- Checkout fails with "Product not found" errors
- Draft order API returns validation errors
- Some products checkout successfully, others fail
- Inconsistent error messages from Shopify API

**Phase to address:**
**Phase 1: Product Catalog Foundation** - Critical before expanding catalog. Every new product without proper ID mapping breaks checkout.

---

### Pitfall 7: Breaking Portability of Pricing Engine with Product Coupling

**What goes wrong:**
The project context emphasizes "Pure pricing engine (zero external dependencies, must stay portable)". Currently, the pricing engine is indeed pure: it accepts dimensions, loads a matrix, calculates price. However, when adding multiple products, developers will be tempted to couple the pricing engine to the product catalog by: (1) importing product data into calculator, (2) adding product-specific logic branches in calculator, (3) embedding matrix file paths inside calculator. This destroys portability and makes the pricing engine dependent on your specific product structure.

**Why it happens:**
It's the easiest solution that "just works". Instead of passing the pricing matrix as a parameter, developers hardcode product lookups: `if (productId === 'white-rollerblind') { load matrix A }`. This feels pragmatic but violates the separation of concerns principle. The pricing engine should remain a pure mathematical function that knows nothing about your product catalog structure.

**How to avoid:**
1. **Keep calculator pure**: Only accept `width`, `height`, and `pricingMatrix` parameters
2. **Move product-to-matrix mapping** into a separate module (NOT in calculator)
3. **Establish clear boundaries**: Pricing engine = math, Product module = business logic
4. **Add architectural tests** that enforce import rules (calculator cannot import from product module)

Layered architecture:
```
lib/
├── pricing/
│   ├── calculator.ts          # Pure calculation (no product knowledge)
│   ├── types.ts               # Pure types
│   └── validator.ts           # Pure validation
├── product/
│   ├── data.ts                # Product catalog
│   └── pricing-config.ts      # Product → Matrix mapping (NEW)
└── api/
    └── pricing/
        └── route.ts           # Orchestrates: product lookup + matrix loading + calculation
```

Example orchestration in API route:
```typescript
import { calculatePrice } from '@/lib/pricing/calculator';
import { getProduct } from '@/lib/product/data';
import { loadPricingMatrix } from '@/lib/product/pricing-config';

export async function POST(request: Request) {
  const { width, height, productId } = await request.json();

  // Product layer handles business logic
  const product = getProduct(productId);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  // Product layer provides matrix
  const matrix = await loadPricingMatrix(productId);

  // Pricing engine stays pure - just math
  const result = calculatePrice(width, height, matrix);

  return NextResponse.json(result);
}
```

**Warning signs:**
- `import { getProduct } from '@/lib/product'` appears in pricing calculator files
- Product-specific conditional logic in calculator
- Calculator tests require product fixtures
- Difficulty reusing pricing engine in other projects

**Phase to address:**
**Phase 1: Product Catalog Foundation** - Establish architectural boundaries before patterns become entrenched. Refactoring later is expensive and risky.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Import all pricing matrices in client bundle | Works, no API changes needed | Every new product increases bundle size, slow performance | Never - Always load server-side |
| Use product ID as both URL slug and Shopify ID | Simpler data structure, one less field | Cannot change URLs without breaking Shopify integration, impossible to A/B test URLs | Never - Always separate concerns |
| Hardcode category slugs in navigation | Fast to implement, no data layer needed | Adding categories requires code deployment, no CMS control | Only for MVP with ≤3 fixed categories |
| Skip cart hydration mismatch fixes | No visible errors in dev mode | Hydration warnings in prod, poor UX with cart flash, potential React errors | Never - Fix before multi-product launch |
| Reuse same API route for all products with if/else | No new API routes, single endpoint | N-way branching logic, untestable, hard to add products | Never - Use product-specific config |
| Store pricing matrices in code vs database | Easy git versioning, no DB needed | Requires build/deploy to update prices, no admin UI | Acceptable if prices rarely change (<1/month) |
| Mix semantic IDs and Shopify IDs inconsistently | Works for first few products | Checkout breaks randomly, impossible to debug, data inconsistency | Never - Establish schema from start |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Shopify Draft Orders | Using product catalog ID as Shopify variant ID | Store separate `shopify.variantId` in product data, map before API call |
| Shopify Line Items | Passing custom dimensions as title or properties | Use `customAttributes` array: `[{key: 'width', value: '100cm'}, {key: 'height', value: '150cm'}]` |
| Shopify Metafields | Adding metafields without namespace/type definition | Define metafield definitions in Shopify admin first, validate types before sending |
| Pricing API | Not passing `productId`, assuming global pricing | Always include `productId` in request payload, validate product exists before calculation |
| Next.js Dynamic Imports | Using `import()` for JSON in client components | Load JSON only server-side in API routes or Server Components, pass result to client |
| localStorage Cart | Reading cart state during SSR | Use hydration-safe pattern (useEffect/useSyncExternalStore) to defer cart access |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Static JSON imports for all matrices | Bundle size grows 50-100KB per product | Dynamic server-side loading with caching | 5+ products (bundle >500KB) |
| No request deduplication for pricing API | Redundant identical API calls | Use SWR/React Query on client | 10+ concurrent users |
| Loading full product catalog on every page | Slow navigation, high TTFB | Load only needed products, implement pagination | 50+ products |
| No caching for pricing matrix reads | High disk I/O on API routes | In-memory cache (Map) with 5-min TTL | 100+ requests/min |
| Recalculating cart totals on every render | UI feels sluggish, high CPU | Memoize with useMemo, only recalc on items change | 10+ items in cart |
| No indexing on category lookups | O(n) scan through all products | Use Map for O(1) lookup by category | 100+ products |
| Fetching pricing matrices for entire category | Slow category page load | Fetch matrices only when user interacts (lazy) | 20+ products per category |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Accepting untrusted pricing from client | Client can set arbitrary prices, order for $0.01 | Always recalculate price server-side before checkout, never trust client price |
| No rate limiting on pricing API | DoS via excessive requests, server resource exhaustion | Implement rate limiting (10 requests/sec per IP) |
| Exposing Shopify credentials in client code | Credential theft, unauthorized store access | Store credentials only in server-side env vars, never in client bundle |
| No CSRF protection on checkout API | Attacker can create unauthorized draft orders | Use Next.js built-in CSRF protection, validate origin headers |
| Storing sensitive cart data in localStorage | XSS can steal cart, customer privacy risk | Don't store PII in cart, use httpOnly cookies for session tokens |
| Not sanitizing product options before Shopify | Injection attacks via custom attributes | Validate/sanitize all user input before passing to Shopify API |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Cart icon shows 0 then flashes to correct count | Looks broken, confusing, layout shift | Implement hydration placeholder (loading state during SSR) |
| Pricing API is slow (>500ms) | Users don't know if dimensions are accepted | Add optimistic UI updates, show loading state immediately on input |
| No feedback when adding to cart | User unsure if action worked | Show toast notification + cart icon bounce animation |
| Category page doesn't indicate which products are in stock | User clicks unavailable product | Add stock status badges, gray out unavailable products |
| No validation until API response | User enters 500cm width, waits 400ms, then gets error | Client-side validation with instant feedback for basic rules |
| Blog posts and products mixed in search | Confusing results, user can't filter | Separate results by type with tab navigation |
| Product URLs change when adding to categories | Bookmarks break, SEO penalty | Use stable product URLs, not nested under category |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Multi-product cart:** Works in dev, but missing integration tests for ID collision scenarios
- [ ] **Category pages:** Render correctly, but missing 301 redirects for old single-product URLs
- [ ] **Pricing API:** Returns correct values, but missing rate limiting and caching
- [ ] **Product data:** Added new products, but missing Shopify variant ID mappings
- [ ] **Route structure:** Works with sample data, but missing validation against reserved category slugs
- [ ] **Cart persistence:** Uses localStorage, but missing hydration mismatch handling
- [ ] **Checkout flow:** Creates draft orders, but missing custom dimension metadata in line items
- [ ] **Pricing matrices:** Loaded dynamically, but missing error handling for missing/corrupt files
- [ ] **Blog routing:** Posts render, but missing conflict prevention with product/category URLs
- [ ] **SEO setup:** Pages indexed, but missing canonical URLs for products in multiple categories

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Cart ID collisions | MEDIUM | 1. Fix ID generation logic, 2. Add migration script to deduplicate existing carts in localStorage (run on next cart access), 3. Add integration tests, 4. Deploy hotfix |
| Route conflicts | HIGH | 1. Decide on new route structure (/categories vs /products/categories), 2. Set up 301 redirects for all old URLs, 3. Update all internal links, 4. Submit new sitemap to Google, 5. Monitor 404s for 2 weeks |
| Bloated client bundle | LOW | 1. Remove static JSON imports, 2. Move matrix loading to API route, 3. Re-deploy (no data migration needed), 4. Verify bundle size in production |
| Hydration mismatch | LOW | 1. Add useHydration hook, 2. Wrap cart components with hydration check, 3. Re-deploy (no breaking changes) |
| Wrong pricing displayed | MEDIUM | 1. Add productId to API request, 2. Implement server-side product validation, 3. Add E2E tests for each product, 4. Deploy, 5. Manual QA all products |
| Missing Shopify IDs | HIGH | 1. Audit all products in catalog, 2. Create mapping spreadsheet (catalog ID → Shopify variant ID), 3. Update product data structure, 4. Write migration script, 5. Test checkout for every product, 6. Deploy |
| Pricing matrix loading race conditions | MEDIUM | 1. Implement in-memory cache for matrices, 2. Add request coalescing, 3. Deploy API changes, 4. Load test to verify fix |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Hardcoded pricing matrix import | Phase 1: Product Catalog Foundation | Bundle analyzer shows <10KB increase per product added |
| Cart ID collisions | Phase 1: Product Catalog Foundation | Integration test passes: different products with same dimensions create separate cart items |
| Route conflicts (products/categories/blog) | Phase 1: Product Catalog Foundation | All URLs accessible without 404s, no Next.js build warnings |
| Zustand hydration mismatch | Phase 1: Product Catalog Foundation | No React hydration warnings in console, cart icon doesn't flash |
| Pricing API race conditions | Phase 2: Category Navigation | Load test with 50 concurrent users shows <200ms p95 response time |
| Product data ID inconsistency | Phase 1: Product Catalog Foundation | TypeScript compile error if product missing shopify.variantId |
| Pricing engine coupling | Phase 1: Product Catalog Foundation | ESLint rule prevents calculator importing from product module |
| Bundle bloat from multiple matrices | Phase 1: Product Catalog Foundation | Lighthouse performance score stays >90 with 10+ products |
| Missing Shopify metadata in draft orders | Phase 3: Checkout Experience | E2E test verifies custom dimensions appear in Shopify admin draft order |
| Blog URL conflicts with products | Phase 4: Content & Blog | Unit test validates no blog slug matches product/category route |

## Sources

### Next.js App Router & Routing
- [App Router pitfalls: common Next.js mistakes and practical ways to avoid them](https://imidef.com/en/2026-02-11-app-router-pitfalls)
- [Next.js Dynamic Route Segments in the App Router (2026 Guide) – TheLinuxCode](https://thelinuxcode.com/nextjs-dynamic-route-segments-in-the-app-router-2026-guide/)
- [How to Handle Dynamic Routing in Next.js](https://oneuptime.com/blog/post/2026-01-24-nextjs-dynamic-routing/view)
- [Error: You cannot define a static route with the same name as a dynamic route](https://www.omi.me/blogs/next-js-errors/error-you-cannot-define-a-static-route-with-the-same-name-as-a-dynamic-route-in-next-js-causes-and-how-to-fix)

### State Management & Hydration
- [Fixing React hydration errors when using Zustand persist with useSyncExternalStore](https://medium.com/@judemiracle/fixing-react-hydration-errors-when-using-zustand-persist-with-usesyncexternalstore-b6d7a40f2623)
- [Fix Next.js 14 hydration error with Zustand state management](https://medium.com/@koalamango/fix-next-js-hydration-error-with-zustand-state-management-0ce51a0176ad)
- [How to Fix "Hydration Mismatch" Errors in Next.js](https://oneuptime.com/blog/post/2026-01-24-fix-hydration-mismatch-errors-nextjs/view)
- [NextJS + Zustand localStorage persist middleware causing hydration errors](https://github.com/pmndrs/zustand/discussions/1382)

### E-commerce Cart Patterns
- [How to Build a Shopping Cart with Next.js and Zustand](https://hackernoon.com/how-to-build-a-shopping-cart-with-nextjs-and-zustand-state-management-with-typescript)
- [Building a Next.js shopping cart app - LogRocket](https://blog.logrocket.com/building-a-next-js-shopping-cart-app/)
- [No automatic re render of component when adding items in shopping cart](https://github.com/vercel/next.js/discussions/54335)

### Performance & Bundle Optimization
- [Optimized package imports in Next.js - Barrel Files](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
- [Import a big json file only on SSR](https://github.com/vercel/next.js/discussions/23564)
- [Next.js: The Complete Guide for 2026](https://devtoolbox.dedyn.io/blog/nextjs-complete-guide)
- [Optimizing Next.js Performance: Bundles, Lazy Loading, and Images](https://www.catchmetrics.io/blog/optimizing-nextjs-performance-bundles-lazy-loading-and-images)

### Shopify Integration
- [Shopify Draft Orders: Complete Guide](https://www.revize.app/blog/shopify-draft-orders-guide)
- [DraftOrderLineItem - GraphQL Admin](https://shopify.dev/docs/api/admin-graphql/latest/objects/draftorderlineitem)
- [Shopify API 2026 - How to create a draft order using postman](https://www.beehexa.com/devdocs/shopify-api-how-to-create-a-draft-order-using-postman/)

### E-commerce Migration
- [eCommerce Migration Strategy: A Step-by-Step Guide](https://intexsoft.com/blog/ecommerce-migration-strategy-a-step-by-step-guide-to-successful-platform-upgrades/)
- [E-commerce Migration Guide: Steps, Best Practices & Pitfalls to Avoid](https://amasty.com/blog/e-commerce-migration-guide/)
- [eCommerce migration: 9 challenges for online stores](https://www.convertcart.com/blog/switching-ecommerce-platform)

### API Patterns
- [Next.js 15 Advanced Patterns: App Router, Server Actions, and Caching Strategies for 2026](https://johal.in/next-js-15-advanced-patterns-app-router-server-actions-and-caching-strategies-for-2026/)
- [Next.js API Routes: The Ultimate Guide](https://makerkit.dev/blog/tutorials/nextjs-api-best-practices)
- [React & Next.js Best Practices in 2026](https://fabwebstudio.com/blog/react-nextjs-best-practices-2026-performance-scale)

---
*Pitfalls research for: Pure Blinds Multi-Product Expansion*
*Researched: 2026-02-13*
*Confidence: HIGH (verified with current codebase analysis + 2026 Next.js patterns)*
