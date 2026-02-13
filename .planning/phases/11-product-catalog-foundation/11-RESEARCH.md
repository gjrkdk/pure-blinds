# Phase 11: Product Catalog Foundation - Research

**Researched:** 2026-02-13
**Domain:** Multi-product data architecture with flexible pricing engine
**Confidence:** HIGH

## Summary

Phase 11 transforms the single-product architecture into a multi-product catalog system with flexible pricing. The implementation centers on four core transformations: (1) JSON-based product catalog with hybrid metadata/Shopify ID storage, (2) pricing engine refactor to accept pricing matrices as parameters instead of hardcoded imports, (3) cart item ID generation that includes productId to prevent dimension collisions across products, and (4) Shopify Draft Order integration with line item properties for custom dimensions.

The existing codebase already demonstrates strong architectural patterns: pure pricing calculator functions, Zustand cart store with localStorage persistence, and clean domain separation (pricing, cart, product, shopify). This phase extends these patterns rather than replacing them.

**Primary recommendation:** Use direct JSON imports with TypeScript type assertions for product catalog (simple, type-safe, works in serverless), refactor pricing calculator to accept matrix as first parameter while keeping pure function design, generate cart IDs as `${productId}-${dimensionHash}` using existing hash function, and extend Shopify Draft Order mutation to include line item properties for width/height.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Product Data Structure:**
- **Data source**: Hybrid approach — product metadata in JSON files (version-controlled), reference Shopify IDs for checkout integration
- **Core fields**: id, name, slug, category, pricingMatrixPath, shopifyProductId, shopifyVariantId (minimal set, extend as UI needs emerge)
- **Category structure**: Simple string categories (e.g., 'rollerblinds-white') — flat structure, easy filtering, extract for navigation
- **Pricing matrix reference**: File path stored in pricingMatrixPath (e.g., '/data/pricing/rollerblinds-white.json') — allows products to share matrices if needed

**Pricing Engine Interface:**
- **Engine input**: Accepts pricing matrix only — `calculatePrice(pricingMatrix, width, height)` — pure function, zero dependencies
- **API orchestration**: Route loads product and matrix, calls engine — API handles I/O, engine handles calculation
- **API design**: POST `/api/pricing` accepts `{productId, width, height}` — route loads correct product and matrix based on productId
- **Error handling**: Return 404 for invalid productId or missing pricing matrix — clear HTTP semantics
- **Data loading**: API route loads product and matrix files, pricing engine stays pure (never touches filesystem)

**Cart Item Uniqueness:**
- **ID generation**: productId + dimensions format — `${productId}-${width}x${height}` — deterministic, prevents collisions
- **Duplicate handling**: Increment quantity when same product+dimensions added again — standard e-commerce behavior
- **Cart migration**: Clear old carts (pre-productId format) on load — acceptable for pre-launch, simple
- **Item data structure**: Store minimal — productId, width, height, quantity, calculatedPrice — load product details (name, image) from catalog when rendering

**Shopify Variant Mapping:**
- **Product structure**: 1:1 mapping — each catalog product = 1 Shopify product with single 'Custom Size' variant
- **Dimension passing**: Use line item properties — `[{key: 'Width', value: '150cm'}, {key: 'Height', value: '200cm'}]` — visible on orders and invoices
- **Price handling**: Override variant price in Draft Order API with calculated price — Shopify variant has placeholder price (€0 or €1)
- **Shopify IDs**: Store both shopifyProductId and shopifyVariantId in product data — variant ID is what Draft Order API needs

### Claude's Discretion
- Exact file structure for product catalog JSON files
- Product loading utility function implementation details
- Error message wording
- TypeScript types and interfaces organization

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

</user_constraints>

## Standard Stack

### Core Libraries (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | BFF framework (frontend + API routes) | Industry standard for React SSR/BFF, built-in API routes, serverless-ready |
| TypeScript | 5.x | Type safety | Mandatory for product catalog type safety and JSON validation |
| Zod | 4.3.6 | Runtime validation | Already used for pricing validation, extends to product validation naturally |
| Zustand | 5.0.10 | Cart state management | Already implemented, proven pattern for cart with localStorage persistence |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js fs/promises | Built-in | Server-side JSON file loading | API routes need dynamic pricing matrix loading by path |
| JSON.parse | Built-in | Parse JSON from readFile | Required when reading JSON as text (fs.readFile returns string) |

### No New Dependencies Required

This phase extends existing libraries rather than adding new ones. All required functionality (JSON loading, type validation, state management, API routes) is already available in the current stack.

**Installation:**
```bash
# No installation needed - all dependencies already present
# Verify current versions:
npm list next typescript zod zustand
```

## Architecture Patterns

### Recommended Project Structure

Based on user decisions and existing codebase patterns:

```
src/
├── lib/
│   ├── product/
│   │   ├── types.ts              # Product and catalog types
│   │   ├── catalog.ts            # Product loading utilities (getProduct, getAllProducts)
│   │   └── validation.ts         # Zod schemas for product validation
│   ├── pricing/
│   │   ├── calculator.ts         # REFACTOR: Accept matrix as parameter
│   │   ├── loader.ts             # NEW: Load pricing matrix by file path
│   │   ├── types.ts              # Extend with PricingMatrix type if needed
│   │   └── validator.ts          # Existing validator (no changes)
│   ├── cart/
│   │   ├── types.ts              # EXTEND: Add productId field to CartItem
│   │   ├── store.ts              # UPDATE: Change ID generation, add migration
│   │   └── utils.ts              # UPDATE: generateCartItemId to include productId
│   └── shopify/
│       └── draft-order.ts        # EXTEND: Add customAttributes to line items
├── app/api/
│   └── pricing/
│       └── route.ts              # REFACTOR: Load product, load matrix, call calculator
└── data/
    ├── products.json             # NEW: Product catalog metadata
    └── pricing/
        ├── rollerblinds-white.json   # NEW: Per-product pricing matrices
        └── rollerblinds-black.json   # NEW: Per-product pricing matrices
```

### Pattern 1: Product Catalog with Direct JSON Import

**What:** Store product metadata in JSON, import directly in Node.js code (server-side only)

**When to use:** Server-side product loading (API routes, Server Components) where type safety and simplicity matter

**Example:**
```typescript
// src/lib/product/types.ts
export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  pricingMatrixPath: string;  // e.g., '/data/pricing/rollerblinds-white.json'
  shopifyProductId: string;
  shopifyVariantId: string;
}

export interface ProductCatalog {
  version: string;
  lastUpdated: string;
  products: Product[];
}

// data/products.json
{
  "version": "1.0.0",
  "lastUpdated": "2026-02-13",
  "products": [
    {
      "id": "rollerblinds-white",
      "name": "White Rollerblind",
      "slug": "white-rollerblind",
      "category": "rollerblinds",
      "pricingMatrixPath": "/data/pricing/rollerblinds-white.json",
      "shopifyProductId": "gid://shopify/Product/123",
      "shopifyVariantId": "gid://shopify/ProductVariant/456"
    }
  ]
}

// src/lib/product/catalog.ts
import catalogData from '@/data/products.json';
import type { ProductCatalog, Product } from './types';

const catalog = catalogData as ProductCatalog;

export function getProduct(productId: string): Product | undefined {
  return catalog.products.find(p => p.id === productId);
}

export function getAllProducts(): Product[] {
  return catalog.products;
}

export function getProductsByCategory(category: string): Product[] {
  return catalog.products.filter(p => p.category === category);
}
```

**Why this pattern:**
- Direct imports work in Next.js API routes and Server Components ([Next.js docs](https://nextjs.org/docs/app/api-reference/file-conventions/route))
- Type assertions provide compile-time type safety
- No runtime file I/O needed for product catalog (only pricing matrices are loaded dynamically)
- JSON is bundled into serverless functions automatically ([Vercel docs](https://vercel.com/kb/guide/loading-static-file-nextjs-api-route))

### Pattern 2: Dynamic Pricing Matrix Loading (fs/promises)

**What:** Load pricing matrix files dynamically based on product's pricingMatrixPath using Node.js filesystem APIs

**When to use:** API routes need to load different pricing matrices per product at runtime

**Example:**
```typescript
// src/lib/pricing/loader.ts
import { promises as fs } from 'fs';
import path from 'path';
import type { PricingMatrixData } from './types';

/**
 * Load pricing matrix from file path
 * @param matrixPath - Path from product.pricingMatrixPath (e.g., '/data/pricing/rollerblinds-white.json')
 * @returns Parsed pricing matrix data
 * @throws Error if file not found or invalid JSON
 */
export async function loadPricingMatrix(matrixPath: string): Promise<PricingMatrixData> {
  // Resolve relative to project root
  const fullPath = path.join(process.cwd(), matrixPath);

  try {
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    const matrix = JSON.parse(fileContent) as PricingMatrixData;
    return matrix;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`Pricing matrix not found: ${matrixPath}`);
    }
    throw new Error(`Failed to load pricing matrix: ${matrixPath}`);
  }
}

// src/app/api/pricing/route.ts
import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/product/catalog';
import { loadPricingMatrix } from '@/lib/pricing/loader';
import { calculatePrice } from '@/lib/pricing/calculator';

export async function POST(request: Request) {
  const body = await request.json();
  const { productId, width, height } = body;

  // 1. Load product metadata
  const product = getProduct(productId);
  if (!product) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }

  // 2. Load pricing matrix for this product
  let matrix;
  try {
    matrix = await loadPricingMatrix(product.pricingMatrixPath);
  } catch (error) {
    return NextResponse.json(
      { error: 'Pricing data unavailable' },
      { status: 404 }
    );
  }

  // 3. Calculate price using product's matrix
  try {
    const result = calculatePrice(matrix, width, height);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Calculation failed' },
      { status: 400 }
    );
  }
}
```

**Why this pattern:**
- API routes run server-side where filesystem access is available
- `process.cwd()` resolves to Next.js project root ([Next.js GitHub discussion](https://github.com/vercel/next.js/discussions/36031))
- `path.join(process.cwd(), relativePath)` works in both dev and production ([Vercel deployment guide](https://vercel.com/kb/guide/loading-static-file-nextjs-api-route))
- Serverless file tracer picks up files referenced via `process.cwd()` ([ISR file reading guide](https://francoisbest.com/posts/2023/reading-files-on-vercel-during-nextjs-isr))
- For files < 1MB (pricing matrices ~3KB), `readFile` is optimal ([Node.js file reading guide](https://thelinuxcode.com/nodejs-file-system-in-practice-a-production-grade-guide-for-2026/))

### Pattern 3: Pure Pricing Calculator with Matrix Parameter

**What:** Refactor calculator to accept pricing matrix as first parameter instead of hardcoded import

**When to use:** REQUIRED by user decision - pricing engine must work with any product's matrix

**Example:**
```typescript
// src/lib/pricing/calculator.ts
import type { PricingResponse, PricingMatrixData } from './types';

/**
 * Pure pricing calculator - accepts matrix as parameter
 * Zero dependencies, zero side effects, zero filesystem access
 */
export function calculatePrice(
  pricingMatrix: PricingMatrixData,
  width: number,
  height: number
): PricingResponse {
  // Normalize both dimensions to nearest 10cm increment
  const normalizedWidth = normalizeDimension(width);
  const normalizedHeight = normalizeDimension(height);

  // Convert to matrix indices
  const widthIndex = dimensionToIndex(normalizedWidth);
  const heightIndex = dimensionToIndex(normalizedHeight);

  // Bounds check for width
  if (widthIndex < 0 || widthIndex >= pricingMatrix.matrix.length) {
    throw new Error(
      `Width dimension ${width}cm (normalized to ${normalizedWidth}cm) is out of bounds. ` +
        `Valid range: ${pricingMatrix.dimensions.width.min}-${pricingMatrix.dimensions.width.max}cm`
    );
  }

  // Bounds check for height
  if (heightIndex < 0 || heightIndex >= pricingMatrix.matrix[0].length) {
    throw new Error(
      `Height dimension ${height}cm (normalized to ${normalizedHeight}cm) is out of bounds. ` +
        `Valid range: ${pricingMatrix.dimensions.height.min}-${pricingMatrix.dimensions.height.max}cm`
    );
  }

  // Lookup price from matrix
  const priceInCents = pricingMatrix.matrix[widthIndex][heightIndex];

  return {
    priceInCents,
    normalizedWidth,
    normalizedHeight,
    originalWidth: width,
    originalHeight: height,
  };
}

// Helper functions remain unchanged
export function normalizeDimension(dimension: number): number {
  return Math.ceil(dimension / 10) * 10;
}

export function dimensionToIndex(normalizedDimension: number): number {
  return normalizedDimension / 10 - 1;
}
```

**Why this pattern:**
- Pure function: same inputs → same output, zero side effects ([Functional programming pure functions](https://www.sitepoint.com/functional-programming-pure-functions/))
- Reusable: works in API routes, client-side, background jobs, tests
- Testable: no mocks needed, just pass different matrices
- Matches user decision: "accepts pricing matrix as parameter (not hardcoded import)"

### Pattern 4: Cart Item ID with Product ID Prefix

**What:** Generate cart item IDs as `${productId}-${dimensionHash}` to prevent collisions between products

**When to use:** REQUIRED by user decision - cart must support multiple products with same dimensions

**Example:**
```typescript
// src/lib/cart/utils.ts
/**
 * Generates a unique cart item ID by combining product ID and dimension hash
 * Format: ${productId}-${width}x${height}
 *
 * Examples:
 * - rollerblinds-white-150x200
 * - rollerblinds-black-150x200  (same dimensions, different product, unique ID)
 */
export function generateCartItemId(
  productId: string,
  options: { width: number; height: number }
): string {
  // Human-readable format: easier debugging than hash
  return `${productId}-${options.width}x${options.height}`;
}

// Alternative with hash (if dimension format changes):
export function generateCartItemIdWithHash(
  productId: string,
  options: { width: number; height: number }
): string {
  const signature = generateOptionsSignature(options);
  return `${productId}-${signature}`;
}

// src/lib/cart/types.ts
export interface CartItem {
  id: string;              // NOW: "rollerblinds-white-150x200" (includes productId)
  productId: string;       // NEW: "rollerblinds-white"
  productName: string;     // Existing: "White Rollerblind"
  options: {
    width: number;
    height: number;
  };
  optionsSignature: string;  // Existing: dimension hash
  quantity: number;
  priceInCents: number;
}

// src/lib/cart/store.ts - Add migration
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      // ... existing actions
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => storageWithTTL),
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState, version) => {
        const state = persistedState as { items: CartItem[] };

        // Clear cart if items don't have productId (old format)
        if (state.items.some(item => !item.productId)) {
          console.warn('Cart format changed - clearing old items');
          return { items: [] };
        }

        return state;
      },
    }
  )
);
```

**Why this pattern:**
- Prevents collisions: `rollerblinds-white-150x200` ≠ `rollerblinds-black-150x200` ([Zustand cart duplicate handling](https://github.com/pmndrs/zustand/discussions/1256))
- Readable IDs: easier debugging than opaque hashes
- Migration strategy: clear old carts (acceptable pre-launch per user decision)
- Matches existing hash pattern: `generateCartItemId` follows same signature as current `generateOptionsSignature`

### Pattern 5: Shopify Draft Order with Line Item Properties

**What:** Pass custom dimensions to Shopify via `customAttributes` array in Draft Order line items

**When to use:** REQUIRED by user decision - dimensions must appear on Shopify orders and invoices

**Example:**
```typescript
// src/lib/shopify/draft-order.ts
export async function createDraftOrder(items: CartItem[]): Promise<{ invoiceUrl: string }> {
  const client = createAdminClient();

  const response = await client.request(DRAFT_ORDER_CREATE, {
    variables: {
      input: {
        lineItems: items.map(item => ({
          // Include dimensions in title for order display
          title: `${item.productName} - ${item.options.width}cm x ${item.options.height}cm`,

          // Override with calculated price (not variant price)
          originalUnitPriceWithCurrency: {
            amount: (item.priceInCents / 100).toFixed(2),
            currencyCode: "EUR"
          },

          quantity: item.quantity,

          // IMPORTANT: Use customAttributes (GraphQL API term)
          // These appear on orders and invoices automatically
          customAttributes: [
            { key: "Width", value: `${item.options.width}cm` },
            { key: "Height", value: `${item.options.height}cm` },
            { key: "Product ID", value: item.productId }  // NEW: Track which product
          ],

          // OPTIONAL: Add variant ID if you want to link to Shopify product
          // variantId: getProduct(item.productId)?.shopifyVariantId
        }))
      }
    },
    retries: 2
  });

  // Error handling remains unchanged...
  return { invoiceUrl: response.data.draftOrderCreate.draftOrder.invoiceUrl };
}
```

**Why this pattern:**
- `customAttributes` is the GraphQL API term (REST API calls it "properties") ([Shopify Draft Order docs](https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftordercreate))
- Attributes appear on orders and invoices automatically ([Shopify line item properties](https://shopify.dev/docs/api/admin-graphql/latest/objects/draftorderlineitem))
- Key uniqueness: each key must be unique per line item ([Shopify community discussion](https://community.shopify.com:443/c/shopify-apis-and-sdks/shopifyapi-line-item-properties-on-order-draft-order-creation/m-p/466248))
- Matches user decision: "line item properties are better than custom attributes because they show on invoices automatically"

### Anti-Patterns to Avoid

- **❌ Hardcoded pricing matrix import:** Violates user decision that engine must accept any matrix as parameter
- **❌ Client-side filesystem access:** `fs` module doesn't exist in browser, causes build errors
- **❌ Dynamic imports for JSON in API routes:** Adds complexity, direct import or fs.readFile is simpler
- **❌ Cart ID without productId:** Causes collisions when different products have same dimensions
- **❌ Nested product categories:** User decided on flat string categories, don't build tree structures
- **❌ Complex cart migration:** User accepted clearing old carts, don't over-engineer versioned migrations

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Runtime JSON validation | Custom validators with manual type checks | Zod schemas with `.safeParse()` | Already used for pricing validation, handles nested objects, provides TypeScript inference ([Zod validation guide](https://blog.logrocket.com/schema-validation-typescript-zod/)) |
| Deterministic hashing | Custom hash functions or UUIDs | Existing `generateOptionsSignature` + productId prefix | Current code already has browser-compatible hash, just extend it ([Deterministic object hash](https://www.npmjs.com/package/deterministic-object-hash)) |
| localStorage persistence | Custom storage wrappers | Zustand persist middleware (already implemented) | Already has TTL, JSON serialization, migration hooks ([Zustand persist docs](https://github.com/pmndrs/zustand)) |
| File path resolution | String concatenation or manual path logic | Node.js `path.join(process.cwd(), relativePath)` | Handles platform differences, works in Vercel serverless ([Next.js file path resolution](https://github.com/vercel/next.js/discussions/36031)) |

**Key insight:** This phase extends existing patterns rather than introducing new ones. The codebase already demonstrates best practices (pure functions, domain separation, type safety), so new code should follow established conventions rather than introducing alternative approaches.

## Common Pitfalls

### Pitfall 1: Product Catalog as In-Memory Data vs. Database

**What goes wrong:** Treating JSON product catalog as if it needs database CRUD operations or complex query logic

**Why it happens:** Developers instinctively reach for databases for "data storage" without considering the read/write ratio and data volatility

**How to avoid:**
- Product catalog is essentially config: read-only at runtime, updated via code deployments
- Simple array methods (`find`, `filter`) are sufficient for small catalogs (< 1000 products)
- Direct JSON import is faster than database queries and works in serverless
- Only move to database if: (a) non-developers need to edit products, (b) catalog exceeds 10,000 products, or (c) frequent updates required between deployments

**Warning signs:**
- Adding database migrations for product catalog
- Building admin UI for product editing before user requests it
- Complex query logic when simple `Array.filter()` would suffice

### Pitfall 2: Pricing Matrix File Path Resolution in Production

**What goes wrong:** Pricing matrix loads fine locally but fails in production with "ENOENT: no such file or directory"

**Why it happens:**
- `process.cwd()` behavior differs between local dev and serverless deployment
- Next.js file tracer may not detect dynamically constructed paths
- Hardcoded absolute paths (e.g., `/Users/name/project/data`) break in production

**How to avoid:**
- Always use `path.join(process.cwd(), relativePath)` for file resolution ([Next.js production file reading](https://github.com/vercel/next.js/discussions/36031))
- Use static path construction: `process.cwd()` calls must be in the same function as `readFile` ([Vercel serverless file tracing](https://francoisbest.com/posts/2023/reading-files-on-vercel-during-nextjs-isr))
- Test file loading in production-like environment (e.g., `next build && next start`)
- Consider `outputFileTracingIncludes` in next.config.js if paths aren't detected: `{ '/api/pricing': ['data/pricing/**/*.json'] }`

**Warning signs:**
- File path strings constructed with string concatenation instead of `path.join()`
- `process.cwd()` called in utility function, result passed to API route
- Files load in dev (`npm run dev`) but fail after `npm run build`

### Pitfall 3: Refactoring Pricing Calculator Breaks Existing Code

**What goes wrong:** Changing `calculatePrice(width, height)` to `calculatePrice(matrix, width, height)` causes TypeScript errors across codebase

**Why it happens:** Function signature change affects all call sites (dimension configurator, cart price recalculation, tests)

**How to avoid:**
- Create new function `calculatePriceWithMatrix(matrix, width, height)`, keep old function as wrapper
- Update callers incrementally, deprecate old function
- Alternative: Make first parameter optional with default for backward compatibility (but violates "pure function" principle)
- Run TypeScript compiler (`tsc --noEmit`) to find all affected call sites before changing signature

**Warning signs:**
- Changing function signature without checking usage with `grep -r "calculatePrice"` first
- Skipping TypeScript compilation before committing
- Assuming "it's just one function, shouldn't affect much"

### Pitfall 4: Cart Migration Strategy Too Complex

**What goes wrong:** Building versioned cart migration system with schema transformations when simple "clear old format" would work

**Why it happens:** Over-engineering based on theoretical future needs rather than current requirements

**How to avoid:**
- User explicitly accepted "clear old carts" strategy (pre-launch, simple)
- Zustand persist has built-in `migrate` hook - use it for format detection, return empty cart for old format
- Add console warning for debugging: `console.warn('Cart format changed - clearing old items')`
- Don't build version numbers, schema transformers, or backward compatibility unless explicitly required

**Warning signs:**
- Creating cart schema version numbers
- Building complex data transformation logic for formats that don't exist yet
- Spending more time on migration than on core feature implementation

### Pitfall 5: Type Safety Loss in JSON Loading

**What goes wrong:** Loading JSON files without type assertions, losing TypeScript validation, causing runtime errors

**Why it happens:** JSON imports and `JSON.parse()` return `any` type, bypassing TypeScript's type system

**How to avoid:**
- Always use type assertion after JSON import: `const catalog = catalogData as ProductCatalog`
- Use Zod runtime validation for user-provided JSON (if product catalog becomes editable)
- Create TypeScript types first, then structure JSON to match types (not the other way around)
- Validate JSON structure in tests: type assertion doesn't guarantee runtime correctness

**Warning signs:**
- JSON imports without type assertions: `const data = require('./data.json')`
- TypeScript `any` spreading through codebase from untyped JSON
- Runtime errors about missing properties that TypeScript didn't catch

### Pitfall 6: Shopify GraphQL API Terminology Confusion

**What goes wrong:** Using REST API terminology ("properties") in GraphQL mutations, causing validation errors

**Why it happens:** Shopify has different field names in REST vs GraphQL APIs for the same concept

**How to avoid:**
- GraphQL uses `customAttributes` (not "properties") for line item metadata ([Shopify GraphQL docs](https://shopify.dev/docs/api/admin-graphql/latest/objects/draftorderlineitem))
- REST API uses `properties` for the same data structure
- Always check API reference for the version you're using
- Test Draft Order creation in development environment before assuming field names

**Warning signs:**
- Copy-pasting REST API examples into GraphQL mutations
- Validation errors about unrecognized fields
- Assuming field names are consistent across Shopify API versions

## Code Examples

Verified patterns from official sources and existing codebase:

### Loading Product from Catalog

```typescript
// Source: User decision + Next.js patterns
import catalogData from '@/data/products.json';
import type { ProductCatalog, Product } from './types';

const catalog = catalogData as ProductCatalog;

export function getProduct(productId: string): Product | undefined {
  return catalog.products.find(p => p.id === productId);
}

export function getAllProducts(): Product[] {
  return catalog.products;
}
```

### Loading Pricing Matrix Dynamically

```typescript
// Source: Node.js fs/promises docs + Next.js file path resolution
import { promises as fs } from 'fs';
import path from 'path';

export async function loadPricingMatrix(matrixPath: string): Promise<PricingMatrixData> {
  const fullPath = path.join(process.cwd(), matrixPath);
  const fileContent = await fs.readFile(fullPath, 'utf-8');
  return JSON.parse(fileContent) as PricingMatrixData;
}
```

### Refactored Pricing Calculator

```typescript
// Source: User decision + functional programming pure functions
export function calculatePrice(
  pricingMatrix: PricingMatrixData,
  width: number,
  height: number
): PricingResponse {
  const normalizedWidth = normalizeDimension(width);
  const normalizedHeight = normalizeDimension(height);
  const widthIndex = dimensionToIndex(normalizedWidth);
  const heightIndex = dimensionToIndex(normalizedHeight);

  // Bounds checking using matrix dimensions...
  const priceInCents = pricingMatrix.matrix[widthIndex][heightIndex];

  return {
    priceInCents,
    normalizedWidth,
    normalizedHeight,
    originalWidth: width,
    originalHeight: height,
  };
}
```

### Cart Item ID Generation

```typescript
// Source: User decision + existing cart utils pattern
export function generateCartItemId(
  productId: string,
  options: { width: number; height: number }
): string {
  return `${productId}-${options.width}x${options.height}`;
}
```

### Cart Migration for Format Change

```typescript
// Source: Zustand persist middleware docs
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({ /* store implementation */ }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => storageWithTTL),
      migrate: (persistedState, version) => {
        const state = persistedState as { items: CartItem[] };

        // Clear cart if items don't have productId (old format)
        if (state.items.some(item => !item.productId)) {
          console.warn('Cart format changed - clearing old items');
          return { items: [] };
        }

        return state;
      },
    }
  )
);
```

### Shopify Draft Order with Custom Attributes

```typescript
// Source: Shopify GraphQL API docs + existing draft-order.ts
lineItems: items.map(item => ({
  title: `${item.productName} - ${item.options.width}cm x ${item.options.height}cm`,
  originalUnitPriceWithCurrency: {
    amount: (item.priceInCents / 100).toFixed(2),
    currencyCode: "EUR"
  },
  quantity: item.quantity,
  customAttributes: [
    { key: "Width", value: `${item.options.width}cm` },
    { key: "Height", value: `${item.options.height}cm` },
    { key: "Product ID", value: item.productId }
  ]
}))
```

### Zod Schema for Product Validation

```typescript
// Source: Zod docs + existing pricing validator pattern
import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1),
  pricingMatrixPath: z.string().startsWith('/data/pricing/'),
  shopifyProductId: z.string().min(1),
  shopifyVariantId: z.string().min(1),
});

export const ProductCatalogSchema = z.object({
  version: z.string(),
  lastUpdated: z.string(),
  products: z.array(ProductSchema),
});

// Runtime validation
export function validateProductCatalog(data: unknown): ProductCatalog {
  return ProductCatalogSchema.parse(data);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded pricing matrix import | Pricing matrix as parameter | Phase 11 (this phase) | Enables multi-product pricing |
| Cart ID = dimension hash only | Cart ID = productId + dimensions | Phase 11 (this phase) | Prevents collisions across products |
| REST API custom attributes | GraphQL `customAttributes` | Shopify 2024+ | Consistent GraphQL naming conventions |
| `__dirname` for file paths | `process.cwd()` for project root | Next.js 13+ App Router | Works in serverless functions |
| Manual type guards for JSON | Zod runtime validation | Already adopted (Phase 6) | Runtime type safety for API inputs |

**Deprecated/outdated:**
- **Pages Router API routes**: Project uses App Router (`src/app/api/*/route.ts`), not Pages Router (`pages/api/*.ts`)
- **getStaticProps for data loading**: App Router uses Server Components and direct imports instead
- **Callback-style fs methods**: Use `fs/promises` (async/await) instead of `fs.readFile(path, callback)`
- **Dynamic imports for JSON**: Adds complexity without benefit, use direct import or fs.readFile

## Open Questions

### 1. Should pricing matrices have their own validation?

**What we know:**
- Product catalog can be validated with Zod (optional, for Claude's discretion)
- Pricing matrices are currently trusted JSON files
- User decision: pricing engine should validate bounds (already implemented)

**What's unclear:**
- Should we validate matrix structure at load time (e.g., ensure 20x20 grid, all integers)?
- Or trust deployment process and let bounds checking catch errors at calculation time?

**Recommendation:**
- Don't add matrix validation initially - bounds checking in calculator is sufficient
- Add Zod validation later if corrupted matrices become an issue
- Focus validation effort on API inputs (productId, width, height) which come from users

### 2. How many pricing matrices will be created initially?

**What we know:**
- User has 4 products currently (`white-rollerblind`, `black-rollerblind`, `venetian-blinds-25mm`, `custom-textile`)
- All likely have same dimensions (10-200cm) but may have different pricing
- Products can share matrices if pricing is identical

**What's unclear:**
- Are all rollerblind prices the same? (could share one matrix: `rollerblinds.json`)
- Or does each color have different pricing? (needs separate matrices)

**Recommendation:**
- Start with one matrix per product for flexibility
- Consolidate later if pricing patterns emerge (e.g., all rollerblinds share one matrix)
- Don't over-optimize for sharing matrices upfront - duplicate 3KB files are negligible

### 3. Should product catalog validation be runtime or build-time?

**What we know:**
- TypeScript provides compile-time type safety via type assertions
- Zod provides runtime validation but adds small overhead
- Product catalog is developer-edited, deployed via git

**What's unclear:**
- Is JSON typo/error likely? (probably not - TypeScript + IDE catches it)
- Is runtime validation worth the overhead? (probably not for trusted JSON)

**Recommendation:**
- Use TypeScript type assertions only (compile-time safety)
- Skip Zod runtime validation for product catalog (trusted source)
- Reserve Zod for API inputs (untrusted sources)
- Add build-time validation script if errors occur repeatedly

## Sources

### Primary (HIGH confidence)
- [Next.js API Routes Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/route) - Official Next.js route handlers
- [Shopify Draft Order Create - GraphQL Admin](https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftordercreate) - Draft Order API reference
- [Zod Documentation](https://zod.dev/) - Runtime validation library
- [Zustand GitHub Repository](https://github.com/pmndrs/zustand) - State management patterns
- [Node.js fs/promises Documentation](https://nodejs.org/api/fs.html) - Filesystem APIs
- Existing codebase analysis - `/Users/robinkonijnendijk/Desktop/pure-blinds/src/lib/` directory structure

### Secondary (MEDIUM confidence)
- [Vercel: Loading Static Files in Next.js](https://vercel.com/kb/guide/loading-static-file-nextjs-api-route) - File loading patterns
- [Next.js production file path resolution discussion](https://github.com/vercel/next.js/discussions/36031) - process.cwd() behavior
- [Reading files on Vercel during Next.js ISR](https://francoisbest.com/posts/2023/reading-files-on-vercel-during-nextjs-isr) - Serverless file tracing
- [TypeScript Record vs Map comparison](https://blog.logrocket.com/typescript-record-types/) - Data structure patterns
- [Shopify Draft Order Line Item Documentation](https://shopify.dev/docs/api/admin-graphql/latest/objects/draftorderlineitem) - customAttributes field
- [Node.js File System Production Guide 2026](https://thelinuxcode.com/nodejs-file-system-in-practice-a-production-grade-guide-for-2026/) - Best practices
- [Zustand shopping cart discussion](https://github.com/pmndrs/zustand/discussions/1256) - Duplicate handling patterns

### Tertiary (LOW confidence)
- [TypeScript const assertion with JSON imports](https://github.com/microsoft/TypeScript/issues/32063) - Feature request (not implemented)
- Generic shopping cart migration services (not applicable to localStorage format changes)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and proven in codebase
- Architecture: HIGH - User decisions are specific and clear, patterns align with existing code
- Pitfalls: MEDIUM-HIGH - Based on common Next.js + serverless deployment issues, verified with official docs

**Research date:** 2026-02-13
**Valid until:** 2026-03-15 (30 days - stable domain, no fast-moving dependencies)
