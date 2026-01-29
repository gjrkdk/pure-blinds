# Architecture Research

**Domain:** Custom-dimension e-commerce with Shopify checkout
**Researched:** 2026-01-29
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │  Product Page  │  │   Cart UI      │  │ Configurator   │        │
│  │  (dimension    │  │   (session     │  │ (dimension     │        │
│  │   inputs)      │  │    mgmt)       │  │  preview)      │        │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘        │
│          │                   │                   │                  │
├──────────┴───────────────────┴───────────────────┴──────────────────┤
│                      BFF LAYER (Next.js API Routes)                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  API Route: /api/pricing           (pricing calculations)    │   │
│  │  API Route: /api/cart              (cart management)         │   │
│  │  API Route: /api/checkout          (Draft Order creation)    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│          │                   │                   │                  │
├──────────┴───────────────────┴───────────────────┴──────────────────┤
│                         DOMAIN LAYER                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
│  │ Pricing Engine   │  │  Cart Service    │  │ Shopify Client  │   │
│  │ - Matrix lookup  │  │  - Session mgmt  │  │ - Draft Orders  │   │
│  │ - Rounding rules │  │  - Validation    │  │ - Auth          │   │
│  │ - Price calc     │  │  - Persistence   │  │                 │   │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬────────┘   │
│           │                     │                      │            │
├───────────┴─────────────────────┴──────────────────────┴────────────┤
│                        DATA LAYER                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
│  │ Pricing Matrix   │  │  Cart Sessions   │  │ Shopify Store   │   │
│  │ (Database)       │  │  (Database)      │  │ (External API)  │   │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

                            DATA FLOW

User Input (dimensions)
         ↓
Frontend → BFF /api/pricing → Pricing Engine → Matrix DB
         ↓                         ↓
    Display Price            Calculate Price
         ↓
Add to Cart
         ↓
Frontend → BFF /api/cart → Cart Service → Session DB
         ↓
    Cart Updated
         ↓
Checkout Click
         ↓
Frontend → BFF /api/checkout → Shopify Client → Draft Order API
         ↓                                            ↓
  Checkout URL ←────────────────────────────  Invoice URL Created
         ↓
Redirect to Shopify
         ↓
Customer Pays → Shopify Checkout → Order Complete
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Pricing Engine** | Calculate prices from dimension inputs using matrix lookup + rounding rules | Pure TypeScript module with matrix query logic |
| **Cart Service** | Manage cart sessions, validate items, persist state | Service class with session management (DB or memory) |
| **Shopify Client** | Create Draft Orders, handle authentication, manage API communication | SDK wrapper or custom HTTP client with admin token |
| **Product Configurator** | Capture dimension inputs, validate constraints, show preview | React components with form validation |
| **BFF API Routes** | Aggregate backend services, secure sensitive operations, transform data | Next.js Route Handlers in /app/api |
| **Matrix Storage** | Store pricing matrix data with dimension ranges and pricing tiers | Database table with indexed lookups |
| **Session Storage** | Persist cart state between page loads | Database sessions or encrypted cookies |

## Recommended Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── products/                 # Product pages
│   │   └── [slug]/
│   │       └── page.tsx          # Product detail with dimension inputs
│   ├── cart/
│   │   └── page.tsx              # Cart review page
│   ├── api/                      # BFF API Routes
│   │   ├── pricing/
│   │   │   └── route.ts          # POST /api/pricing
│   │   ├── cart/
│   │   │   └── route.ts          # GET/POST/DELETE /api/cart
│   │   └── checkout/
│   │       └── route.ts          # POST /api/checkout
│   └── layout.tsx
│
├── domains/                      # Domain Layer (isolated, reusable)
│   ├── pricing/                  # Pricing Engine (reusable for Shopify app)
│   │   ├── engine.ts             # Core pricing calculation logic
│   │   ├── matrix.ts             # Matrix lookup + interpolation
│   │   ├── rounding.ts           # Rounding rules
│   │   ├── types.ts              # Domain types (Dimensions, Price, Matrix)
│   │   └── index.ts              # Public API exports
│   │
│   ├── cart/                     # Cart Domain
│   │   ├── service.ts            # Cart business logic
│   │   ├── session.ts            # Session management
│   │   ├── types.ts              # Cart types
│   │   └── index.ts
│   │
│   └── shopify/                  # Shopify Integration Domain
│       ├── client.ts             # Shopify Admin API client
│       ├── draft-orders.ts       # Draft Order operations
│       ├── types.ts              # Shopify types
│       └── index.ts
│
├── components/                   # React components
│   ├── product/
│   │   ├── DimensionInput.tsx    # Dimension input fields
│   │   └── PriceDisplay.tsx      # Calculated price display
│   ├── cart/
│   │   └── CartItem.tsx          # Cart line item
│   └── ui/                       # Shared UI components
│
├── lib/                          # Infrastructure utilities
│   ├── db.ts                     # Database client (Prisma singleton)
│   ├── env.ts                    # Environment variable validation
│   └── utils.ts                  # General utilities
│
└── prisma/
    ├── schema.prisma             # Database schema
    └── migrations/               # Database migrations
```

### Structure Rationale

- **domains/:** Isolated, framework-agnostic business logic. Each domain can be extracted to a separate package or Shopify app with minimal changes. No direct imports of Next.js, React, or app-specific code.
- **domains/pricing/:** Pricing engine is completely self-contained. No knowledge of Next.js, Shopify, or cart logic. Can be copied to a Shopify app unchanged.
- **app/api/:** BFF layer orchestrates domains. API routes are thin controllers that call domain services and transform responses.
- **components/:** Presentation layer. No business logic, only UI concerns and client-side state.
- **lib/:** Infrastructure that domains depend on (database access), but domains access via interfaces/abstractions.

## Architectural Patterns

### Pattern 1: Domain Isolation with Public API Exports

**What:** Each domain exports a clean public API through index.ts, hiding implementation details. Domains never import from each other directly - only through public exports.

**When to use:** Essential for reusability requirements. The pricing engine must be extractable to a Shopify app without modifications.

**Trade-offs:**
- ✅ Enforces decoupling, makes refactoring safer, enables future extraction to monorepo packages
- ❌ Requires discipline to not create circular dependencies

**Example:**
```typescript
// domains/pricing/index.ts (Public API)
export { calculatePrice } from './engine'
export { loadMatrix } from './matrix'
export type { Dimensions, Price, PricingMatrix } from './types'
// Implementation files (engine.ts, matrix.ts) are NOT exported

// app/api/pricing/route.ts (Consumer)
import { calculatePrice, type Dimensions } from '@/domains/pricing'
// ✅ Can only access public API
// ❌ Cannot import from '@/domains/pricing/engine' directly
```

### Pattern 2: BFF with Server-Side Aggregation

**What:** Next.js API Routes act as Backend-for-Frontend, aggregating multiple domain calls, securing secrets, and shaping responses for frontend needs.

**When to use:** Always in headless commerce. Frontend should never call Shopify Admin API directly (exposes tokens). BFF handles auth, retries, error transformation.

**Trade-offs:**
- ✅ Security (no API keys in browser), simplified frontend, can combine multiple domain calls in single request
- ❌ Extra network hop for client-side calls, requires backend deployment

**Example:**
```typescript
// app/api/checkout/route.ts
import { getCartSession } from '@/domains/cart'
import { createDraftOrder } from '@/domains/shopify'

export async function POST(req: Request) {
  const session = await getCartSession(req)
  const cart = session.cart

  // Aggregate: validate cart + create Draft Order
  if (!cart.items.length) {
    return Response.json({ error: 'Cart empty' }, { status: 400 })
  }

  const draftOrder = await createDraftOrder({
    lineItems: cart.items,
    email: session.email,
  })

  // Transform response for frontend
  return Response.json({
    checkoutUrl: draftOrder.invoiceUrl
  })
}
```

### Pattern 3: Matrix-Based Pricing with Interpolation

**What:** Store pricing as multi-dimensional matrix (dimension ranges → price), calculate prices via lookup + interpolation for exact dimensions.

**When to use:** Custom-dimension products (cut-to-size, made-to-measure). Standard SKU-based pricing won't work.

**Trade-offs:**
- ✅ Handles infinite dimension combinations, business users can update matrix without code changes
- ❌ Requires interpolation logic, matrix design complexity, careful indexing for performance

**Example:**
```typescript
// domains/pricing/matrix.ts
export type PricingMatrix = {
  dimensions: ['width', 'height']
  data: Array<{
    width: [min: number, max: number]
    height: [min: number, max: number]
    pricePerUnit: number
  }>
}

export function lookupPrice(
  matrix: PricingMatrix,
  dimensions: { width: number; height: number }
): number {
  // Find matching range
  const match = matrix.data.find(row =>
    dimensions.width >= row.width[0] && dimensions.width <= row.width[1] &&
    dimensions.height >= row.height[0] && dimensions.height <= row.height[1]
  )

  if (!match) throw new Error('Dimensions outside matrix range')

  // Calculate area-based price
  return dimensions.width * dimensions.height * match.pricePerUnit
}
```

### Pattern 4: Prisma Singleton with Connection Pooling

**What:** Single PrismaClient instance reused across Next.js hot reloads in development, with appropriate connection pool limits.

**When to use:** Required in Next.js with Prisma to prevent "too many connections" errors during development.

**Trade-offs:**
- ✅ Prevents connection exhaustion, safe for serverless, improves cold start time
- ❌ Requires globalThis pattern (looks unusual but necessary)

**Example:**
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // For serverless: limit connections
  // connection_limit=1 for edge, increase if needed
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
```

### Pattern 5: Draft Order Checkout Flow

**What:** Create Draft Order via Admin API, redirect customer to invoice URL for Shopify-hosted checkout and payment.

**When to use:** Headless commerce on any Shopify plan (Plus not required). Offloads payment/tax/shipping calculation to Shopify.

**Trade-offs:**
- ✅ Works on all plans, no PCI compliance burden, automatic tax calculation, supports all payment methods
- ❌ Customer leaves your site, limited checkout customization (Plus only), asynchronous order creation

**Example:**
```typescript
// domains/shopify/draft-orders.ts
export async function createDraftOrder(params: {
  lineItems: Array<{ variantId: string; quantity: number; customAttributes?: any }>
  email?: string
}) {
  const response = await shopifyClient.post('/admin/api/2026-01/draft_orders.json', {
    draft_order: {
      line_items: params.lineItems.map(item => ({
        variant_id: item.variantId,
        quantity: item.quantity,
        custom_attributes: item.customAttributes, // Store custom dimensions
      })),
      email: params.email,
      use_customer_default_address: true,
    }
  })

  // Response includes invoice_url for checkout redirect
  return {
    id: response.data.draft_order.id,
    invoiceUrl: response.data.draft_order.invoice_url,
  }
}
```

## Data Flow

### Request Flow: Dimension Input → Price Display

```
1. User enters dimensions (width: 120, height: 80)
      ↓
2. Frontend debounces input, sends POST /api/pricing
      ↓
3. BFF validates request, calls Pricing Engine
      ↓
4. Pricing Engine queries Matrix DB for matching range
      ↓
5. Pricing Engine calculates price (interpolation + rounding)
      ↓
6. BFF returns { price: 45.99, currency: 'EUR' }
      ↓
7. Frontend displays calculated price
```

### Request Flow: Add to Cart

```
1. User clicks "Add to Cart" with dimensions + price
      ↓
2. Frontend sends POST /api/cart with { productId, dimensions, price }
      ↓
3. BFF validates price (re-calculates to prevent tampering)
      ↓
4. Cart Service adds item to session
      ↓
5. Cart Service persists session to DB
      ↓
6. BFF returns updated cart
      ↓
7. Frontend updates cart UI
```

### Request Flow: Checkout → Shopify

```
1. User clicks "Checkout"
      ↓
2. Frontend sends POST /api/checkout
      ↓
3. BFF loads cart session from DB
      ↓
4. BFF validates cart (items exist, prices current)
      ↓
5. Shopify Client creates Draft Order via Admin API
      ↓
6. Shopify returns Draft Order with invoice_url
      ↓
7. BFF returns { checkoutUrl: invoice_url }
      ↓
8. Frontend redirects to checkoutUrl (window.location.href)
      ↓
9. Customer completes payment on Shopify checkout
      ↓
10. Shopify processes payment → creates Order
      ↓
11. (Optional) Webhook notifies your system of order completion
```

### State Management

```
Client State (React)
   ↓
[Dimension Inputs] → Local state (useState)
[Price Display]    → Optimistic UI (shows loading, then price from API)
[Cart Count]       → Global state (Context/Zustand) synced with backend

Server State (Database)
   ↓
[Cart Sessions]    → Database with session ID cookie
[Pricing Matrix]   → Database with indexed dimension ranges
[Orders]           → Shopify (external system of record)
```

### Key Data Flows

1. **Real-time pricing:** User types dimensions → debounced API call → matrix lookup → price display (200-500ms latency)
2. **Cart persistence:** Add to cart → validate price backend → save to DB → return updated cart → sync frontend state
3. **Checkout handoff:** Load cart → create Draft Order → receive invoice URL → redirect → Shopify owns flow
4. **Configuration storage:** Store dimension values as Draft Order line item custom attributes for fulfillment visibility

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Single Next.js instance with Postgres, no caching, synchronous Draft Order creation |
| 1k-10k users | Add Redis for session storage (faster than DB), cache pricing matrix in memory (revalidate hourly), connection pooling tuned |
| 10k-100k users | Edge caching for product pages (ISR), Prisma Accelerate for connection pooling, consider queue for Draft Order creation (async) |
| 100k+ users | Extract pricing engine to separate service (horizontal scaling), CDN for static assets, Shopify Plus for checkout customization |

### Scaling Priorities

1. **First bottleneck: Database connections** - Prisma with serverless can exhaust connections quickly. Fix: Prisma Accelerate (connection pooling) or PgBouncer. Occurs around 5k-10k concurrent users.

2. **Second bottleneck: Shopify Admin API rate limits** - 2 requests/second on REST API, 1000 points/second on GraphQL. Fix: Queue Draft Order creation, batch operations, cache product data. Occurs around 50-100 checkouts/minute.

3. **Third bottleneck: Matrix lookup performance** - Linear scan for large matrices (1000+ rows) becomes slow. Fix: Add database indexes on dimension ranges, denormalize for common lookups, cache in Redis. Occurs with complex matrices + 10k+ pricing requests/minute.

## Anti-Patterns

### Anti-Pattern 1: Pricing Logic in Frontend

**What people do:** Calculate prices in React components using hardcoded formulas or client-side matrix data.

**Why it's wrong:** Customers can manipulate prices via browser DevTools, pricing logic can't be reused in Shopify app, matrix updates require frontend deployment.

**Do this instead:** Always calculate prices server-side in Pricing Engine. Frontend displays API responses only. Validate cart prices backend before Draft Order creation.

### Anti-Pattern 2: Tight Coupling Between Domains

**What people do:** Import Shopify client directly in pricing engine, or import pricing logic in cart service via relative paths like `../pricing/engine`.

**Why it's wrong:** Creates circular dependencies, prevents extracting pricing engine to Shopify app, makes testing difficult (need to mock Shopify even for pricing tests).

**Do this instead:** Domains communicate only through BFF orchestration. Pricing engine has zero dependencies on Shopify or cart. BFF calls `calculatePrice()` then `createDraftOrder()` separately.

### Anti-Pattern 3: Storing Cart in Frontend-Only State

**What people do:** Use React state or localStorage for cart, send entire cart to backend only at checkout.

**Why it's wrong:** Cart lost on page refresh (if localStorage fails), no server-side validation until checkout (security risk), difficult to implement cart abandonment features.

**Do this instead:** Backend session storage with cookie-based session ID. Every cart mutation goes through `/api/cart`. Frontend syncs with backend state. Adds resilience and enables future features (cart abandonment emails).

### Anti-Pattern 4: Mixing Draft Order and Storefront API Checkout

**What people do:** Use Storefront API for product browsing, then switch to Draft Orders for checkout, creating complexity in tracking cart state.

**Why it's wrong:** Storefront API has its own cart/checkout flow (checkoutCreate). Mixing patterns requires maintaining two cart systems. Draft Orders are Admin API only.

**Do this instead:** Choose one pattern: **Draft Orders** (this project - custom pricing needs Admin API) or **Storefront API checkout** (standard products only). Don't mix unless you have specific Plus-tier requirements.

### Anti-Pattern 5: Premature Extraction to Microservices

**What people do:** Build separate services for pricing, cart, Shopify integration from day one because "we might need to scale later."

**Why it's wrong:** Adds operational complexity (deployment, monitoring, service mesh), slows development (cross-service debugging), overkill for <100k users. Monolith scales far with proper architecture.

**Do this instead:** Start with domain-isolated monolith (this architecture). Domains are separated in code but deployed together. Extract to services only when scaling bottlenecks proven by metrics, not speculation.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Shopify Admin API** | HTTP client with OAuth token | Requires `draft_orders` scope, 2 req/sec rate limit (REST), use GraphQL for higher limits |
| **Shopify Storefront API** | Not used in this architecture | Only needed if building custom product browsing (optional enhancement) |
| **Database (Postgres)** | Prisma ORM with singleton pattern | Required for pricing matrix + cart sessions, must configure connection pooling |
| **Session Storage** | Database or Redis | Database sufficient for <10k users, Redis recommended beyond that |
| **Payment Processing** | Fully delegated to Shopify | Draft Order checkout handles all payment methods configured in Shopify admin |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Frontend ↔ BFF** | HTTP JSON APIs | Always use POST for mutations, GET for reads, include session cookie |
| **BFF ↔ Pricing Engine** | Direct function calls | `import { calculatePrice } from '@/domains/pricing'` - synchronous, type-safe |
| **BFF ↔ Cart Service** | Direct function calls | Pass session ID from cookie, Cart Service loads from DB |
| **BFF ↔ Shopify Client** | Direct function calls | Shopify Client handles auth/retries, returns typed responses |
| **Domains ↔ Database** | Via abstraction (Prisma) | Domains import `db` from `@/lib/db`, but don't know it's Prisma |
| **Pricing Engine ↔ Other Domains** | NO direct communication | Pricing Engine is pure function, no side effects, no external calls |

## Build Order Implications

### Phase 1: Pricing Engine (Isolated)
Build pricing engine first as standalone domain. Can develop and test completely independently without Next.js, Shopify, or cart logic.

**Dependencies:** None (pure TypeScript)
**Deliverable:** `domains/pricing/` with tests
**Validation:** Unit tests with sample matrix data

### Phase 2: Database + Matrix Storage
Add Prisma schema for pricing matrix storage, create migration, seed with initial matrix data.

**Dependencies:** Phase 1 complete (have pricing types)
**Deliverable:** `prisma/schema.prisma`, migration, seed script
**Validation:** Can query matrix from database

### Phase 3: BFF Pricing API
Build Next.js API route that calls pricing engine with matrix from database.

**Dependencies:** Phase 1 + 2 complete
**Deliverable:** `app/api/pricing/route.ts`
**Validation:** `curl POST /api/pricing` returns calculated price

### Phase 4: Frontend Dimension Input
Build product page with dimension inputs and price display calling BFF API.

**Dependencies:** Phase 3 complete
**Deliverable:** `app/products/[slug]/page.tsx`, `components/product/`
**Validation:** Can enter dimensions and see price update

### Phase 5: Cart Domain + Sessions
Build cart service, session management, database schema for cart storage.

**Dependencies:** Phase 2 complete (database setup), Phase 1 optional (if validating prices)
**Deliverable:** `domains/cart/`, cart schema in Prisma
**Validation:** Unit tests for cart operations

### Phase 6: BFF Cart API
Build cart API routes (add/remove/get) using cart service.

**Dependencies:** Phase 5 complete
**Deliverable:** `app/api/cart/route.ts`
**Validation:** `curl POST /api/cart` adds item, `GET /api/cart` returns items

### Phase 7: Cart UI
Build cart page displaying items from cart API.

**Dependencies:** Phase 6 complete
**Deliverable:** `app/cart/page.tsx`, `components/cart/`
**Validation:** Can add items to cart and view them

### Phase 8: Shopify Integration Domain
Build Shopify client and Draft Order creation logic.

**Dependencies:** None (isolated domain, but needs Shopify store for testing)
**Deliverable:** `domains/shopify/`
**Validation:** Can create Draft Order via API (manual test or integration test)

### Phase 9: BFF Checkout API
Build checkout API that loads cart and creates Draft Order.

**Dependencies:** Phase 6 + 8 complete
**Deliverable:** `app/api/checkout/route.ts`
**Validation:** `curl POST /api/checkout` returns Shopify invoice URL

### Phase 10: Checkout Flow Integration
Connect cart page to checkout API, handle redirect to Shopify.

**Dependencies:** Phase 7 + 9 complete
**Deliverable:** Checkout button in cart UI
**Validation:** End-to-end test from dimension input → add to cart → checkout → Shopify payment

### Dependency Graph

```
Phase 1: Pricing Engine (isolated)
    ↓
Phase 2: Database Setup (needs Pricing types)
    ↓                           ↓
Phase 3: BFF Pricing API    Phase 5: Cart Domain
    ↓                           ↓
Phase 4: Frontend Input     Phase 6: BFF Cart API
                                ↓
                            Phase 7: Cart UI
                                ↓
Phase 8: Shopify Domain (parallel with 5-7)
                ↓               ↓
            Phase 9: BFF Checkout API
                        ↓
                Phase 10: Full Flow
```

**Critical path:** 1 → 2 → 3 → 4 (can demo pricing)
**Parallel work:** Phases 5-7 (cart) and Phase 8 (Shopify) can develop simultaneously after Phase 2

## Reusability Strategy for Pricing Engine

### Maintaining Reusability

To ensure the pricing engine can be extracted to a Shopify app in the future:

**1. Zero Framework Dependencies**
```typescript
// ✅ GOOD: Pure TypeScript, no imports
export function calculatePrice(dimensions: Dimensions, matrix: Matrix): number {
  // Pure calculation logic
}

// ❌ BAD: Imports Next.js or React
import { cookies } from 'next/headers'
export function calculatePrice(dimensions: Dimensions): number {
  const session = cookies().get('session') // Coupled to Next.js
}
```

**2. No Side Effects**
```typescript
// ✅ GOOD: Returns value, no side effects
export function calculatePrice(dimensions: Dimensions, matrix: Matrix): Price {
  const result = lookupMatrix(dimensions, matrix)
  return applyRounding(result)
}

// ❌ BAD: Writes to database, makes HTTP calls
export async function calculatePrice(dimensions: Dimensions): Promise<Price> {
  const matrix = await db.pricingMatrix.findFirst() // Side effect
  return calculate(dimensions, matrix)
}
```

**3. Interface-Based Database Access**
```typescript
// domains/pricing/types.ts
export interface MatrixRepository {
  findByDimensions(dimensions: Dimensions): Promise<Matrix | null>
}

// domains/pricing/engine.ts
export async function calculatePrice(
  dimensions: Dimensions,
  repo: MatrixRepository // Injected dependency
): Promise<Price> {
  const matrix = await repo.findByDimensions(dimensions)
  return calculate(dimensions, matrix)
}

// app/api/pricing/route.ts (Next.js implementation)
import { calculatePrice } from '@/domains/pricing'
import { PrismaMatrixRepository } from '@/lib/repositories'

const price = await calculatePrice(dimensions, new PrismaMatrixRepository(db))

// Future Shopify app implementation - just provide different repository
const price = await calculatePrice(dimensions, new ShopifyMetafieldRepository(shopify))
```

**4. Configuration via Parameters, Not Environment**
```typescript
// ✅ GOOD: Configuration passed in
export function calculatePrice(
  dimensions: Dimensions,
  matrix: Matrix,
  config: PricingConfig // Rounding rules, currency, etc.
): Price {
  // Uses config parameter
}

// ❌ BAD: Reads environment variables directly
export function calculatePrice(dimensions: Dimensions): Price {
  const roundingMode = process.env.ROUNDING_MODE // Coupled to Node.js
}
```

**5. Extraction Checklist**

When ready to extract to Shopify app:

- [ ] Copy `domains/pricing/` folder unchanged (should have zero modifications needed)
- [ ] Implement `MatrixRepository` interface using Shopify Metafields or external DB
- [ ] Implement configuration loading from Shopify app settings
- [ ] Wrap in Shopify App Bridge UI (but pricing logic stays identical)
- [ ] Unit tests copy over unchanged and pass immediately

## Sources

### Architecture Patterns
- [Building a Secure & Scalable BFF Architecture with Next.js](https://vishal-vishal-gupta48.medium.com/building-a-secure-scalable-bff-backend-for-frontend-architecture-with-next-js-api-routes-cbc8c101bff0)
- [Next.js Backend-for-Frontend Guide](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [Scaling a Real-Time Pricing Engine](https://mitchellkember.com/blog/pricing-engine)
- [Domain-Driven Design In Practice](https://www.infoq.com/articles/ddd-in-practice/)
- [Bounded Context Pattern - Martin Fowler](https://martinfowler.com/bliki/BoundedContext.html)

### Shopify Integration
- [Shopify Draft Orders API - GraphQL](https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftordercreate)
- [Shopify Draft Orders API - REST](https://shopify.dev/docs/api/admin-rest/latest/resources/draftorder)
- [Shopify Headless Commerce Guide 2026](https://litextension.com/blog/shopify-headless/)
- [Shopify Checkout Documentation](https://shopify.dev/docs/agents/checkout)

### Product Configurators & E-commerce
- [Product Configurator Complete Guide 2026](https://dotinum.com/blog/what-is-a-product-configurator-complete-guide-2026-part-1/)
- [Top Product Configurator Features 2026](https://blog.prototechsolutions.com/top-10-best-product-configurator-features-2026/)
- [Logik.io eCommerce Product Configurator](https://www.logik.io/product-configurator-ecommerce)

### Next.js & Database Patterns
- [Prisma ORM Production Guide - Next.js Setup 2025](https://www.digitalapplied.com/blog/prisma-orm-production-guide-nextjs)
- [Next.js with Prisma - Official Guide](https://www.prisma.io/nextjs)
- [Next.js Monorepo Structure Guide](https://medium.com/@omar.shiriniani/mastering-next-js-monorepos-a-comprehensive-guide-15f59f5ef615)
- [Scalable Next.js Project Structure](https://giancarlobuomprisco.com/next/a-scalable-nextjs-project-structure)

---
*Architecture research for: Custom-dimension e-commerce with Shopify checkout*
*Researched: 2026-01-29*
