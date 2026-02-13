# Architecture Research: Multi-Product Catalog & Blog Integration

**Domain:** E-commerce Product Catalog with Custom Pricing
**Researched:** 2026-02-13
**Confidence:** HIGH

## Executive Summary

This research analyzes how to integrate multi-product catalog, category navigation, product-specific pricing matrices, and blog pages into the existing Next.js 15 App Router webshop while preserving the pure pricing engine architecture and existing cart/checkout flow.

**Key Finding:** Next.js App Router's file-based routing naturally supports multi-product catalog architecture with dynamic routes. The existing pricing engine needs minimal modification—the primary change is loading product-specific pricing matrices instead of a single global matrix. Cart and checkout flows remain unchanged.

## Current Architecture (Baseline)

### Existing System Structure

```
┌──────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                         │
│  Next.js App Router Pages (Server Components + Client)       │
│  /                    /products/[id]         /cart            │
│  └─ DimensionConfigurator (client)                            │
├──────────────────────────────────────────────────────────────┤
│                     API LAYER                                 │
│  /api/pricing (POST)  /api/checkout (POST)  /api/health      │
│  └─ Zod validation → Domain logic → JSON response            │
├──────────────────────────────────────────────────────────────┤
│                   DOMAIN LOGIC LAYER                          │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────────┐      │
│  │  Pricing    │  │    Cart    │  │    Shopify       │      │
│  │  Engine     │  │   Store    │  │  Integration     │      │
│  │ (pure fns)  │  │ (Zustand)  │  │ (Draft Orders)   │      │
│  └─────────────┘  └────────────┘  └──────────────────┘      │
├──────────────────────────────────────────────────────────────┤
│                      DATA LAYER                               │
│  pricing-matrix.json (single file)                            │
│  localStorage (cart state)                                    │
└──────────────────────────────────────────────────────────────┘
```

### Key Constraints to Preserve

1. **Pricing Engine Purity:** Zero external dependencies in `src/lib/pricing/` (no Shopify, no Next.js imports)
2. **API Route Structure:** POST /api/pricing, POST /api/checkout, GET /api/health
3. **Cart Functionality:** Zustand store with localStorage persistence remains unchanged
4. **Shopify Checkout Flow:** Draft Order creation for checkout remains the same
5. **Integer Cents:** All prices stored and calculated in integer cents
6. **Rounding Strategy:** Math.ceil to nearest 10cm increment

## Target Architecture: Multi-Product Catalog

### Enhanced System Structure

```
┌──────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                         │
│  /                      [NEW ROUTES]                          │
│  /products              ← Products overview (category cards)  │
│  /products/rollerblinds ← Category listing page              │
│  /products/[productId]  ← Product detail (MODIFIED)          │
│  /blog                  ← Blog listing                        │
│  /blog/[slug]           ← Blog post detail                    │
│  /cart                  ← Cart page (UNCHANGED)               │
├──────────────────────────────────────────────────────────────┤
│                     API LAYER                                 │
│  /api/pricing (POST)    ← MODIFIED: accepts productId        │
│  /api/checkout (POST)   ← UNCHANGED                           │
│  /api/health (GET)      ← UNCHANGED                           │
├──────────────────────────────────────────────────────────────┤
│                   DOMAIN LOGIC LAYER                          │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────────┐      │
│  │  Pricing    │  │   Product  │  │    Cart          │      │
│  │  Engine     │  │   Data     │  │   Store          │      │
│  │ (MODIFIED)  │  │   (NEW)    │  │ (UNCHANGED)      │      │
│  └─────────────┘  └────────────┘  └──────────────────┘      │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │    Shopify       │  │    Blog          │                  │
│  │  Integration     │  │    Content       │                  │
│  │  (UNCHANGED)     │  │    (NEW)         │                  │
│  └──────────────────┘  └──────────────────┘                  │
├──────────────────────────────────────────────────────────────┤
│                      DATA LAYER                               │
│  data/pricing/                                                │
│    ├─ white-rollerblind.json  ← Product-specific matrices   │
│    ├─ black-rollerblind.json                                 │
│    └─ venetian-blinds-25mm.json                              │
│  data/products.ts              ← Product catalog metadata    │
│  content/blog/                 ← Blog posts (MDX or JSON)    │
│  localStorage (cart state - UNCHANGED)                       │
└──────────────────────────────────────────────────────────────┘
```

## Integration Points: New vs Existing

### 1. Route Structure Integration

**NEW ROUTES:**

```
src/app/
├── products/
│   ├── page.tsx                    [NEW] Products overview with category cards
│   ├── [category]/
│   │   └── page.tsx                [NEW] Category listing page
│   └── [productId]/
│       └── page.tsx                [MODIFY] Product detail - now fetches product data
├── blog/
│   ├── page.tsx                    [NEW] Blog listing grid
│   └── [slug]/
│       └── page.tsx                [NEW] Individual blog post
└── (existing routes unchanged)
```

**ROUTE INTEGRATION STRATEGY:**

- `/products` becomes the overview/hub page (replaces need for direct product links)
- `/products/rollerblinds` category page lists products in that category
- `/products/[productId]` remains product detail but now accepts any product ID
- Existing `/cart`, `/thank-you`, API routes remain unchanged
- Header navigation updated: Add "Products" and "Blog" links

**BREADCRUMB PATTERN:**

```
Home > Products > Rollerblinds > White Rollerblind
Home > Blog > [Post Title]
```

Implementation using Next.js App Router conventions:
- Use `usePathname()` hook to build breadcrumb segments
- Split path by `/` and map to human-readable labels
- Category names stored in product metadata for breadcrumb labels

### 2. Data Architecture Integration

**PRODUCT DATA MODEL (NEW):**

Location: `src/lib/product/types.ts`

```typescript
export interface Product {
  id: string;                    // "white-rollerblind"
  name: string;                  // "White Rollerblind"
  category: string;              // "rollerblinds"
  categoryDisplay: string;       // "Rollerblinds"
  description: string;
  details: ProductDetail[];
  pricingMatrixPath: string;    // "data/pricing/white-rollerblind.json"
  images?: ProductImage[];       // Future: product images
}

export interface ProductDetail {
  label: string;
  value: string;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Category {
  id: string;                    // "rollerblinds"
  name: string;                  // "Rollerblinds"
  description: string;
  productIds: string[];          // ["white-rollerblind", "black-rollerblind"]
}
```

**PRODUCT DATA SOURCE (NEW):**

Location: `src/lib/product/data.ts`

```typescript
const products: Record<string, Product> = {
  "white-rollerblind": {
    id: "white-rollerblind",
    name: "White Rollerblind",
    category: "rollerblinds",
    categoryDisplay: "Rollerblinds",
    pricingMatrixPath: "data/pricing/white-rollerblind.json",
    // ... details
  },
  "black-rollerblind": {
    id: "black-rollerblind",
    name: "Black Rollerblind",
    category: "rollerblinds",
    categoryDisplay: "Rollerblinds",
    pricingMatrixPath: "data/pricing/black-rollerblind.json",
    // ... details
  },
};

const categories: Record<string, Category> = {
  "rollerblinds": {
    id: "rollerblinds",
    name: "Rollerblinds",
    description: "Made-to-measure rollerblinds...",
    productIds: ["white-rollerblind", "black-rollerblind"],
  },
};

export function getProduct(productId: string): Product | undefined;
export function getAllProducts(): Product[];
export function getProductsByCategory(categoryId: string): Product[];
export function getCategory(categoryId: string): Category | undefined;
export function getAllCategories(): Category[];
```

**INTEGRATION WITH EXISTING PRODUCT DATA:**

Current implementation already has `src/lib/product/data.ts` with basic product data. Enhancement path:

1. Add `pricingMatrixPath` field to existing ProductData interface
2. Add category metadata (Category interface and functions)
3. Migrate existing products to new structure
4. No breaking changes to existing `/products/[productId]` page

### 3. Pricing Engine Integration

**CURRENT IMPLEMENTATION:**

```typescript
// src/lib/pricing/calculator.ts
import pricingData from '../../../data/pricing-matrix.json';
const pricing = pricingData as PricingMatrixData;

export function calculatePrice(width: number, height: number): PricingResponse {
  // Uses global pricing matrix
}
```

**MODIFIED IMPLEMENTATION:**

```typescript
// src/lib/pricing/calculator.ts
export function calculatePrice(
  width: number,
  height: number,
  pricingMatrix: PricingMatrixData  // NEW: accepts matrix as parameter
): PricingResponse {
  // Same logic, different matrix source
}

// NEW: Matrix loader utility
export function loadPricingMatrix(matrixPath: string): PricingMatrixData {
  const matrix = require(`../../../${matrixPath}`);
  return matrix as PricingMatrixData;
}
```

**API ROUTE MODIFICATION:**

```typescript
// src/app/api/pricing/route.ts (MODIFIED)
import { calculatePrice, loadPricingMatrix } from "@/lib/pricing/calculator";
import { getProduct } from "@/lib/product/data";

export async function POST(request: Request) {
  const body = await request.json();

  // NEW: Validate productId
  const { width, height, productId } = body;

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  // NEW: Load product-specific matrix
  const product = getProduct(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const pricingMatrix = loadPricingMatrix(product.pricingMatrixPath);

  // Validate dimensions with Zod (unchanged)
  const result = DimensionInputSchema.safeParse({ width, height });
  if (!result.success) {
    return NextResponse.json({ error: "Invalid dimensions", details: result.error.issues }, { status: 400 });
  }

  // NEW: Pass matrix to calculator
  const pricingResponse = calculatePrice(result.data.width, result.data.height, pricingMatrix);

  return NextResponse.json(pricingResponse, { status: 200 });
}
```

**MIGRATION PATH:**

1. Move `data/pricing-matrix.json` → `data/pricing/custom-textile.json` (original product)
2. Create product-specific matrices: `white-rollerblind.json`, `black-rollerblind.json`
3. Update `calculatePrice()` to accept matrix parameter (backward compatible via wrapper)
4. Update API route to load product-specific matrix
5. Update `DimensionConfigurator` to send `productId` in API request

**PRICING ENGINE PURITY PRESERVED:**

- `calculatePrice()` still has zero external dependencies
- Matrix loading happens at API boundary, not in pricing logic
- Calculator functions remain pure (same input → same output)
- No Shopify dependencies introduced

### 4. Component Integration

**DIMENSION CONFIGURATOR (MODIFIED):**

```typescript
// src/components/dimension-configurator.tsx
interface DimensionConfiguratorProps {
  productId: string;      // Already exists
  productName: string;    // Already exists
}

// CHANGE: Include productId in API request
const response = await fetch('/api/pricing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    width: widthNum,
    height: heightNum,
    productId,           // NEW: Send productId to API
  })
});
```

**CART STORE (UNCHANGED):**

Cart already stores `productId` and `productName` per item. No changes needed.

```typescript
// src/lib/cart/types.ts - Already supports multiple products
export interface CartItem {
  id: string;           // Generated from productId + options
  productId: string;    // Identifies which product
  productName: string;
  options: { width: number; height: number };
  priceInCents: number;
  quantity: number;
}
```

**CHECKOUT FLOW (UNCHANGED):**

`/api/checkout` receives cart items with `productId` and creates Draft Order line items. No changes needed—existing implementation already handles multiple products via cart items array.

### 5. Blog Integration

**BLOG ARCHITECTURE OPTIONS:**

Two approaches evaluated:

**Option A: MDX with @next/mdx (Recommended)**

- Blog posts as `.mdx` files in `content/blog/`
- Rich content support (React components in markdown)
- Type-safe with Next.js built-in support
- Server Components by default (no client JS)

**Option B: JSON with Metadata**

- Blog posts as structured JSON
- Simpler for non-technical editors
- Easier to integrate with headless CMS later
- Requires custom renderer

**Recommendation:** Option A (MDX) for v1.2—better developer experience, no need for CMS yet.

**BLOG DATA STRUCTURE:**

```
content/blog/
├── welcome-to-our-blog.mdx
├── choosing-the-right-blinds.mdx
└── installation-guide.mdx

src/lib/blog/
├── types.ts         (BlogPost interface)
└── posts.ts         (getPost, getAllPosts utilities)
```

**BLOG POST METADATA:**

```typescript
// Frontmatter in MDX files
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;  // ISO date
  author: string;
  tags?: string[];
  coverImage?: string;
}
```

**BLOG PAGES:**

```typescript
// src/app/blog/page.tsx - Blog listing
export default async function BlogPage() {
  const posts = await getAllPosts();
  return <BlogGrid posts={posts} />;
}

// src/app/blog/[slug]/page.tsx - Blog post detail
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article>
      <h1>{post.title}</h1>
      <MDXContent />
    </article>
  );
}
```

**BLOG INTEGRATION POINTS:**

- Header navigation: Add "Blog" link
- Homepage: Optional "Latest Posts" section (future enhancement)
- Product pages: Optional "Related Articles" (future enhancement)
- Blog posts: No pricing or cart integration—pure content

## Component Modification Matrix

| Component | Status | Changes Required |
|-----------|--------|------------------|
| DimensionConfigurator | MODIFY | Send `productId` in pricing API request body |
| /products/[productId]/page.tsx | MODIFY | Fetch product data via `getProduct(productId)` |
| /api/pricing/route.ts | MODIFY | Accept `productId`, load product-specific matrix |
| calculatePrice() | MODIFY | Accept `pricingMatrix` parameter |
| CartStore | UNCHANGED | Already supports multiple products |
| /api/checkout/route.ts | UNCHANGED | Already handles cart items array |
| Header navigation | MODIFY | Add "Products" and "Blog" links |
| Footer | MODIFY | Add product/blog links to Quick Links |
| All other components | UNCHANGED | No modifications needed |

**NEW COMPONENTS:**

| Component | Purpose | Location |
|-----------|---------|----------|
| ProductsOverview | Category cards grid | /products/page.tsx |
| CategoryPage | Product listing | /products/[category]/page.tsx |
| ProductCard | Product preview card | src/components/product/product-card.tsx |
| BlogGrid | Blog post grid | src/components/blog/blog-grid.tsx |
| BlogPostCard | Blog preview card | src/components/blog/blog-post-card.tsx |
| BlogPostLayout | Post detail layout | src/components/blog/blog-post-layout.tsx |

## Data Flow Changes

### Current: Single Product Pricing Flow

```
User enters dimensions
  ↓
DimensionConfigurator debounces
  ↓
POST /api/pricing { width, height }
  ↓
Load global pricing-matrix.json
  ↓
calculatePrice(width, height)
  ↓
Return { priceInCents, ... }
```

### New: Multi-Product Pricing Flow

```
User enters dimensions on product page
  ↓
DimensionConfigurator debounces
  ↓
POST /api/pricing { width, height, productId }  ← NEW: productId included
  ↓
getProduct(productId) → product.pricingMatrixPath  ← NEW: Look up matrix path
  ↓
loadPricingMatrix(path) → matrix                   ← NEW: Load product matrix
  ↓
calculatePrice(width, height, matrix)              ← NEW: Pass matrix
  ↓
Return { priceInCents, ... }
```

**KEY INSIGHT:** Only the matrix loading step changes. The calculation logic remains identical.

### Cart to Checkout Flow (UNCHANGED)

```
User adds item to cart (productId stored)
  ↓
CartStore: addItem({ productId, productName, options, priceInCents })
  ↓
localStorage persistence (7-day TTL)
  ↓
User proceeds to checkout
  ↓
POST /api/checkout { items: [{ productId, productName, options, priceInCents, quantity }] }
  ↓
createDraftOrder(items) - maps to Shopify line items
  ↓
Return { invoiceUrl }
  ↓
Clear cart, redirect to Shopify checkout
```

**NO CHANGES NEEDED** - Cart already stores productId, checkout already handles multiple products.

## Architectural Patterns

### Pattern 1: Dynamic Pricing Matrix Loading

**What:** Load pricing matrices on-demand based on productId rather than bundling all matrices at build time.

**When to use:** When each product has a different pricing structure (dimensions, increments, or price points).

**Trade-offs:**
- **Pro:** Reduces bundle size, matrices loaded only when needed
- **Pro:** Easy to add new products without code changes
- **Con:** Small runtime overhead to load JSON (negligible for files <50KB)
- **Con:** Requires matrix path configuration in product metadata

**Implementation:**

```typescript
// Lazy loading with dynamic require
export function loadPricingMatrix(matrixPath: string): PricingMatrixData {
  try {
    const matrix = require(`../../../${matrixPath}`);
    return matrix as PricingMatrixData;
  } catch (error) {
    throw new Error(`Pricing matrix not found: ${matrixPath}`);
  }
}

// Alternative: Import mapping for build-time validation
const MATRIX_MAP: Record<string, PricingMatrixData> = {
  "white-rollerblind": require("../../../data/pricing/white-rollerblind.json"),
  "black-rollerblind": require("../../../data/pricing/black-rollerblind.json"),
};

export function loadPricingMatrix(productId: string): PricingMatrixData {
  if (!MATRIX_MAP[productId]) {
    throw new Error(`No pricing matrix for product: ${productId}`);
  }
  return MATRIX_MAP[productId];
}
```

**Recommendation:** Use import mapping for type safety and build-time validation.

### Pattern 2: Category-First Navigation

**What:** Organize products by category first, then individual products within categories.

**When to use:** When products naturally cluster into 3-8 categories with multiple products each.

**Trade-offs:**
- **Pro:** Reduces cognitive load (users browse categories before products)
- **Pro:** Scales well (can add products without overwhelming navigation)
- **Pro:** SEO benefits (category pages rank for broader terms)
- **Con:** Extra click to reach product (overview → category → product)
- **Con:** May feel over-engineered for <10 total products

**Implementation:**

```
URL Structure:
/products                       (Overview - category cards)
/products/rollerblinds          (Category page - product grid)
/products/white-rollerblind     (Product detail)

Navigation:
Header: "Products" link → /products
Products page: Category cards
Category page: Product cards
Product page: Breadcrumb navigation back
```

**Recommendation:** Use for v1.2 - prepares for catalog growth, matches user mental model.

### Pattern 3: Blog as Separate Content Domain

**What:** Blog content managed independently from product catalog, no tight coupling.

**When to use:** Blog serves marketing/education, not product configuration.

**Trade-offs:**
- **Pro:** Clean separation of concerns
- **Pro:** Easy to migrate blog to CMS later
- **Pro:** Blog doesn't complicate product/pricing logic
- **Con:** Missed opportunity for contextual product links in posts
- **Con:** Duplicate metadata (SEO, images) between systems

**Implementation:**

```typescript
// Blog has no dependencies on product catalog
// content/blog/[slug].mdx files are self-contained

// Optional: Link from blog post to product
export default function BlogPost() {
  return (
    <article>
      <p>Learn about our <Link href="/products/white-rollerblind">white rollerblinds</Link></p>
    </article>
  );
}

// Products do NOT link to blog posts (one-way relationship)
```

**Recommendation:** Start with separation, add product→blog links in future if analytics show value.

### Pattern 4: Server Components for Static Content

**What:** Use React Server Components (RSC) for product pages, category pages, blog pages—anything that doesn't need client state.

**When to use:** Always, unless component needs event handlers, browser APIs, or real-time state.

**Trade-offs:**
- **Pro:** Zero client JavaScript for static content
- **Pro:** Faster initial page load, better SEO
- **Pro:** Direct data access (no API routes for reads)
- **Con:** Cannot use hooks like useState, useEffect
- **Con:** Must explicitly mark client components with 'use client'

**Implementation:**

```typescript
// Server Component (default in App Router)
export default async function ProductsPage() {
  const categories = getAllCategories();  // Direct data access
  return <CategoryGrid categories={categories} />;
}

// Client Component (only where needed)
'use client'
export default function DimensionConfigurator({ productId }: Props) {
  const [width, setWidth] = useState('');  // Requires client
  // ...
}
```

**Recommendation:** Follow Next.js App Router defaults - server first, client only when needed.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Global Pricing Configuration in Client Code

**What people do:** Import all pricing matrices into client components for "offline" calculation.

**Why it's wrong:**
- Exposes all pricing data to browser (security risk, competitive intelligence leak)
- Bloats client bundle (400 price points × N products)
- Makes price updates require client deployment

**Do this instead:** Keep pricing calculation server-side, client only sends dimensions and productId.

```typescript
// ❌ WRONG
'use client'
import allMatrices from '@/data/pricing/all-matrices.json';
function calculateLocally(width, height, productId) {
  return allMatrices[productId][width][height];
}

// ✅ CORRECT
'use client'
async function fetchPrice(width, height, productId) {
  const response = await fetch('/api/pricing', {
    method: 'POST',
    body: JSON.stringify({ width, height, productId })
  });
  return response.json();
}
```

### Anti-Pattern 2: Category Slug as Product Identifier

**What people do:** Use URL structure `/products/rollerblinds/white` where category is part of product identity.

**Why it's wrong:**
- Products can't move between categories without URL breaking
- Requires complex routing logic to extract both category and product
- Breaks if product belongs to multiple categories

**Do this instead:** Use productId as canonical identifier, category in URL for navigation UX only.

```typescript
// ❌ WRONG - productId depends on category
/products/rollerblinds/white-blind
product.id = "rollerblinds/white-blind"  // Coupled to category

// ✅ CORRECT - productId is independent
/products/white-rollerblind
product.id = "white-rollerblind"
product.category = "rollerblinds"  // Separate field
```

### Anti-Pattern 3: Nested Category Routes

**What people do:** Create deeply nested routes `/products/[category]/[subcategory]/[productId]` for taxonomy.

**Why it's wrong:**
- Overcomplicated routing for <20 products
- Poor UX (too many clicks to reach product)
- Hard to maintain as taxonomy evolves
- Not needed until 100+ products

**Do this instead:** Two-level hierarchy maximum: overview → category → product.

```typescript
// ❌ WRONG - unnecessary nesting
/products/window-treatments/rollerblinds/light/white-rollerblind

// ✅ CORRECT - flat product IDs
/products/white-rollerblind
(breadcrumb shows: Products > Rollerblinds > White Rollerblind)
```

### Anti-Pattern 4: Mixing Blog Posts with Product Routes

**What people do:** Put blog posts under `/products/guides/[slug]` to "keep content together."

**Why it's wrong:**
- Confuses users (is this a product or article?)
- Breaks semantic URLs (guides aren't products)
- Complicates routing logic (need to distinguish product vs post)
- Hurts SEO (mixed content types in same sitemap section)

**Do this instead:** Separate `/blog` and `/products` top-level routes.

```typescript
// ❌ WRONG - content type confusion
/products/guides/choosing-blinds
/products/white-rollerblind
(are these both products?)

// ✅ CORRECT - clear content types
/blog/choosing-blinds
/products/white-rollerblind
```

## Build Order Recommendation

Based on dependencies and risk, recommended implementation order:

### Phase 1: Product Data Foundation (Low Risk)
**Goal:** Set up multi-product data model without breaking existing functionality.

**Tasks:**
1. Create `src/lib/product/types.ts` with Product and Category interfaces
2. Enhance `src/lib/product/data.ts` with category support and `pricingMatrixPath` field
3. Split `data/pricing-matrix.json` into product-specific files in `data/pricing/`
4. Add `getAllCategories()`, `getCategory()` helper functions
5. Verify existing product page still works with enhanced data model

**Acceptance:** `/products/[productId]` page loads product data correctly for all products.

**Why first:** Zero risk to existing functionality, establishes foundation for everything else.

### Phase 2: Pricing Engine Multi-Product Support (Medium Risk)
**Goal:** Enable per-product pricing matrices without breaking existing calculator logic.

**Tasks:**
1. Modify `calculatePrice()` to accept `pricingMatrix` parameter
2. Create `loadPricingMatrix()` utility function
3. Update `/api/pricing` route to accept `productId` and load product-specific matrix
4. Update `DimensionConfigurator` to send `productId` in API request
5. Add tests for multi-product pricing calculation

**Acceptance:** Pricing works correctly for all products, existing cart/checkout unaffected.

**Why second:** Core business logic change, must be solid before building UI on top.

### Phase 3: Product Navigation Routes (Low Risk)
**Goal:** Add products overview and category listing pages.

**Tasks:**
1. Create `/products/page.tsx` - category cards overview
2. Create `/products/[category]/page.tsx` - product listing for category
3. Build `ProductCard` component for product previews
4. Add breadcrumb component for navigation
5. Update header navigation to include "Products" link

**Acceptance:** Users can browse categories and navigate to product detail pages.

**Why third:** UI layer on top of solid data foundation, easy to iterate on design.

### Phase 4: Blog Foundation (Low Risk, Independent)
**Goal:** Add blog listing and post pages with placeholder content.

**Tasks:**
1. Create `content/blog/` directory with 3 sample MDX posts
2. Create `src/lib/blog/` utilities for fetching posts
3. Create `/blog/page.tsx` - blog listing grid
4. Create `/blog/[slug]/page.tsx` - blog post detail
5. Build `BlogPostCard` and `BlogPostLayout` components
6. Update header navigation to include "Blog" link

**Acceptance:** Blog pages render with sample content, navigation works.

**Why fourth:** Independent of product changes, can be built in parallel if needed.

### Phase 5: Polish & Metadata (Low Risk)
**Goal:** Improve UX, SEO, and navigation consistency.

**Tasks:**
1. Add dynamic metadata (title, description) for all new pages
2. Rename `/thank-you` to `/confirmation` (URL migration)
3. Update footer links to include product categories and blog
4. Add product images placeholders to product cards
5. Improve breadcrumb styling and mobile responsiveness

**Acceptance:** All pages have proper SEO metadata, navigation is consistent.

**Why last:** Polish layer, doesn't block functionality, easy to adjust based on testing.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 5-20 products | Current architecture is ideal. Single-level categories, JSON-based pricing matrices, server-side product data all perform excellently. No changes needed. |
| 20-100 products | Consider category hierarchy (2 levels max), implement product search, add filtering/sorting on category pages. Pricing matrices still fine as JSON. Consider dynamic imports for matrices to reduce memory. |
| 100-500 products | Move product catalog to database (Postgres, MongoDB), implement full-text search (Algolia, Meilisearch), add pagination to category pages. Pricing matrices may need database with caching layer. |
| 500+ products | Add product search infrastructure, implement CDN for product images, consider static site generation (ISR) for product pages, evaluate edge caching for pricing API. May need dedicated pricing service. |

### Scaling Priorities

1. **First bottleneck: Product data loading** - Around 50+ products, loading all product data into memory becomes inefficient. Solution: Paginate category pages, add search/filtering, lazy load product details.

2. **Second bottleneck: Pricing matrix storage** - Around 100+ products with unique matrices, JSON files become hard to manage. Solution: Move matrices to database with Redis caching, versioning system for price updates.

3. **Third bottleneck: Client bundle size** - Product images and components increase bundle. Solution: Dynamic imports, image optimization with next/image, code splitting by route.

**For v1.2 (5-10 products):** Current architecture is over-sufficient. No scaling changes needed.

## Migration Strategy from Current Architecture

### Step 1: Backward Compatible Product Data

```typescript
// Current: src/lib/product/data.ts (simplified)
export function getProduct(productId: string): ProductData | undefined {
  return products[productId];
}

// Enhanced: Add pricingMatrixPath without breaking existing usage
export interface ProductData {
  id: string;
  name: string;
  description: string;
  category?: string;              // Add category (optional for backward compat)
  pricingMatrixPath?: string;     // Add matrix path (optional)
  details: ProductDetail[];
}
```

### Step 2: Graceful Pricing Engine Migration

```typescript
// Option A: Wrapper function (no breaking changes)
export function calculatePrice(width: number, height: number): PricingResponse {
  const matrix = require('../../../data/pricing-matrix.json');
  return calculatePriceWithMatrix(width, height, matrix);
}

export function calculatePriceWithMatrix(
  width: number,
  height: number,
  matrix: PricingMatrixData
): PricingResponse {
  // Core calculation logic
}

// Option B: Default parameter (backward compatible)
export function calculatePrice(
  width: number,
  height: number,
  matrix: PricingMatrixData = defaultMatrix
): PricingResponse {
  // ...
}
```

### Step 3: API Route Versioning (if needed)

If breaking changes are unavoidable:

```typescript
// Keep old endpoint for existing clients
// /api/pricing (POST) - single matrix, no productId

// Add new endpoint for multi-product
// /api/pricing/v2 (POST) - requires productId

// Or: Accept both formats in single endpoint
export async function POST(request: Request) {
  const body = await request.json();

  if ('productId' in body) {
    // New multi-product flow
  } else {
    // Legacy single-product flow (default matrix)
  }
}
```

**Recommendation:** Use backward compatible wrapper functions. Avoid API versioning unless absolutely necessary.

## Integration Testing Strategy

**Key Integration Points to Test:**

1. **Multi-product pricing:** Verify correct matrix loaded per product
2. **Cart with mixed products:** Add multiple products with different pricing to cart
3. **Checkout with mixed products:** Create Draft Order with products from different categories
4. **Navigation flows:** Products overview → category → product → cart → checkout
5. **Blog independence:** Blog pages load without interfering with product/cart state

**Critical Test Cases:**

```typescript
// Test: Different products have different prices for same dimensions
test('white and black rollerblinds have different prices', async () => {
  const whitePrice = await fetchPrice(100, 100, 'white-rollerblind');
  const blackPrice = await fetchPrice(100, 100, 'black-rollerblind');
  expect(whitePrice).not.toBe(blackPrice);
});

// Test: Cart handles multiple products correctly
test('cart stores multiple products with different IDs', () => {
  addItem({ productId: 'white-rollerblind', options: { width: 100, height: 100 }, priceInCents: 5000 });
  addItem({ productId: 'black-rollerblind', options: { width: 100, height: 100 }, priceInCents: 6000 });
  expect(cartStore.items).toHaveLength(2);
  expect(cartStore.getTotalPrice()).toBe(11000);
});

// Test: Pricing matrix not found error handling
test('API returns 404 for unknown product', async () => {
  const response = await fetch('/api/pricing', {
    method: 'POST',
    body: JSON.stringify({ width: 100, height: 100, productId: 'unknown' })
  });
  expect(response.status).toBe(404);
});
```

## Sources

### Next.js App Router Architecture
- [Next.js 15 App Router Complete Guide](https://medium.com/@livenapps/next-js-15-app-router-a-complete-senior-level-guide-0554a2b820f7)
- [Next.js Architecture in 2026 — Server-First Patterns](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router)
- [Next.js 15 Advanced Patterns: Caching Strategies for 2026](https://johal.in/next-js-15-advanced-patterns-app-router-server-actions-and-caching-strategies-for-2026/)

### Dynamic Routes & Navigation
- [Next.js Dynamic Route Segments Guide](https://thelinuxcode.com/nextjs-dynamic-route-segments-in-the-app-router-2026-guide/)
- [How to Handle Dynamic Routing in Next.js](https://oneuptime.com/blog/post/2026-01-24-nextjs-dynamic-routing/view)
- [Next.js Official: Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)

### Breadcrumb Implementation
- [Building Dynamic Breadcrumbs in Next.js App Router](https://jeremykreutzbender.com/blog/app-router-dynamic-breadcrumbs)
- [Creating a Dynamic Breadcrumb Component in Next.js](https://medium.com/@kcabading/creating-a-breadcrumb-component-in-a-next-js-app-router-a0ea24cdb91a)
- [Breadcrumb Navigation Ecommerce: SEO and UX Benefits](https://alienroad.com/seo/breadcrumb-navigation-ecommerce/)

### MDX & Blog Integration
- [Next.js Official: MDX Guide](https://nextjs.org/docs/app/guides/mdx)
- [Building a blog with Next.js 15 and React Server Components](https://maxleiter.com/blog/build-a-blog-with-nextjs-13)
- [A Minimal MDX Blog App with Next.js 15 and React 19](https://www.mdxblog.io/blog/a-minimal-mdx-blog-with-nextjs-15-and-react-19)

### Data Fetching & Caching
- [Next.js Official: Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Data Fetching Patterns and Best Practices](https://nextjs.org/docs/14/app/building-your-application/data-fetching/patterns)
- [How to Load Data from a File in Next.js](https://vercel.com/kb/guide/loading-static-file-nextjs-api-route)

---
*Architecture research for: Pure Blinds Multi-Product Catalog*
*Researched: 2026-02-13*
