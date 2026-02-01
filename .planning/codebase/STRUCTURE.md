# Codebase Structure

**Analysis Date:** 2026-02-01

## Directory Layout

```
gsh-demo/
├── src/                        # Application source code
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Home page
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   ├── products/           # Product pages
│   │   │   └── [productId]/
│   │   │       └── page.tsx    # Product detail page
│   │   ├── cart/               # Cart page
│   │   │   └── page.tsx
│   │   └── api/                # API route handlers
│   │       ├── pricing/
│   │       │   └── route.ts    # POST /api/pricing
│   │       ├── checkout/
│   │       │   └── route.ts    # POST /api/checkout
│   │       └── health/
│   │           └── route.ts    # GET /api/health
│   ├── components/             # React components
│   │   ├── dimension-configurator.tsx  # Product dimension input
│   │   └── cart/               # Cart-related components
│   │       ├── cart-summary.tsx
│   │       ├── cart-summary.test.tsx
│   │       ├── cart-item.tsx
│   │       ├── cart-icon.tsx
│   │       ├── quantity-input.tsx
│   │       └── remove-dialog.tsx
│   └── lib/                    # Shared utilities and domain logic
│       ├── env.ts             # Environment variable validation
│       ├── pricing/           # Pricing domain
│       │   ├── types.ts
│       │   ├── calculator.ts
│       │   └── validator.ts
│       ├── cart/              # Cart domain
│       │   ├── types.ts
│       │   ├── store.ts
│       │   └── utils.ts
│       └── shopify/           # Shopify integration
│           ├── client.ts
│           ├── types.ts
│           └── draft-order.ts
├── data/                      # Static data files
│   └── pricing-matrix.json   # Pricing lookup table
├── public/                    # Static assets
├── .claude/                   # Claude integration files (GSD)
├── .planning/                 # Planning documents
│   └── codebase/             # This directory
├── package.json
├── tsconfig.json
└── next.config.js
```

## Directory Purposes

**src/app:**
- Purpose: Next.js App Router pages and route handlers
- Contains: Page components (tsx), API routes (route.ts), layouts
- Key files: `page.tsx` for pages, `route.ts` for endpoints, `layout.tsx` for shared wrappers

**src/app/api:**
- Purpose: REST API endpoints
- Contains: Route handlers that receive requests, validate input, call domain logic, return JSON
- Pattern: Each endpoint is a subdirectory with `route.ts` file

**src/components:**
- Purpose: Reusable React components
- Contains: Client components (marked with 'use client') that render UI and handle interactions
- Subdivision: Components grouped by feature (cart, forms, etc.)

**src/lib:**
- Purpose: Shared, reusable logic
- Contains: Pure functions, stores, types, integrations
- Subdivision: Logic grouped by domain (pricing, cart, shopify)

**src/lib/pricing:**
- Purpose: Dimension-to-price calculation logic
- Contains: Pure functions, Zod validators, TypeScript types
- Key abstraction: `calculatePrice()` performs matrix lookup with normalization

**src/lib/cart:**
- Purpose: Shopping cart state and operations
- Contains: Zustand store, cart-specific types, utility functions for hashing
- Key abstraction: `useCartStore` - single source of truth for cart items

**src/lib/shopify:**
- Purpose: Shopify API integration
- Contains: GraphQL client setup, draft order creation
- Key abstraction: `createDraftOrder()` - wraps Shopify API mutation

**data:**
- Purpose: Static data files loaded at build time
- Contains: `pricing-matrix.json` with 20×20 price grid
- Usage: Imported directly in calculator, not fetched at runtime

**public:**
- Purpose: Served as-is to clients (images, favicons, etc.)
- Contains: Static assets referenced in HTML

## Key File Locations

**Entry Points:**

- `src/app/page.tsx`: Home/landing page
- `src/app/products/[productId]/page.tsx`: Product detail page (server component)
- `src/app/cart/page.tsx`: Shopping cart page
- `src/app/layout.tsx`: Root layout with navigation header
- `src/app/api/pricing/route.ts`: Pricing calculation endpoint
- `src/app/api/checkout/route.ts`: Checkout/draft order creation endpoint

**Configuration:**

- `tsconfig.json`: TypeScript configuration
- `package.json`: Dependencies and scripts
- `next.config.js`: Next.js build configuration
- `src/lib/env.ts`: Environment variable schema and validation

**Core Logic:**

- `src/lib/pricing/calculator.ts`: Pure pricing matrix lookup functions
- `src/lib/pricing/validator.ts`: Zod schema for dimension validation
- `src/lib/cart/store.ts`: Zustand cart store with localStorage persistence
- `src/lib/cart/utils.ts`: Hash generation for cart item uniqueness
- `src/lib/shopify/draft-order.ts`: Shopify draft order creation via GraphQL

**Components - Product:**

- `src/components/dimension-configurator.tsx`: Real-time dimension input with live pricing
  - Handles debounced API calls, field validation, "Add to Cart" interaction

**Components - Cart:**

- `src/components/cart/cart-icon.tsx`: Header cart badge
- `src/components/cart/cart-item.tsx`: Individual cart item in cart page
- `src/components/cart/cart-summary.tsx`: Fixed bottom summary bar with checkout button
- `src/components/cart/quantity-input.tsx`: Quantity up/down control
- `src/components/cart/remove-dialog.tsx`: Confirmation dialog for item removal

## Naming Conventions

**Files:**

- **Pages:** `page.tsx` in route directory (Next.js convention)
- **API Routes:** `route.ts` in route directory (Next.js convention)
- **Components:** `kebab-case.tsx` or `camelCase.tsx` for React components
  - Example: `dimension-configurator.tsx`, `cart-summary.tsx`
- **Utilities/Modules:** `camelCase.ts` for pure functions and exports
  - Example: `calculator.ts`, `store.ts`, `utils.ts`
- **Types:** `types.ts` for TypeScript interfaces (grouped by domain)
- **Validators:** `validator.ts` for Zod schemas

**Directories:**

- **Features:** `kebab-case` or descriptive plural
  - Example: `src/app/products`, `src/components/cart`, `src/lib/pricing`
- **Route segments:** `[bracketed]` for dynamic routes
  - Example: `src/app/products/[productId]`

## Where to Add New Code

**New Feature (e.g., wishlist, reviews):**

1. **Domain Logic:** Create `src/lib/wishlist/` directory with:
   - `types.ts`: Domain types (WishlistItem, etc.)
   - `store.ts`: Zustand store or state management
   - `utils.ts`: Helper functions

2. **API Endpoint:** Create `src/app/api/wishlist/route.ts` with POST/GET handlers

3. **Components:** Create `src/components/wishlist/` with UI components

4. **Page (optional):** Create `src/app/wishlist/page.tsx` if a dedicated page is needed

**New Component:**

- Pure UI components: `src/components/[feature]/[component-name].tsx`
- Mark as `'use client'` if using React hooks or event handlers
- Co-locate test files: `src/components/[feature]/[component-name].test.tsx`

**Utilities & Helpers:**

- **Pricing/Cart related:** Add to `src/lib/pricing/` or `src/lib/cart/`
- **Shared across app:** Create `src/lib/shared/` or add to existing domain
- **Framework utilities:** Add to root of `src/lib/`

**Tests:**

- Test files co-locate with implementation: `src/lib/[domain]/[file].test.ts`
- Component tests co-locate: `src/components/[feature]/[component].test.tsx`
- Test configuration: `vitest.config.ts` in project root

**Types:**

- Domain-specific types: `src/lib/[domain]/types.ts`
- Shared types: `src/lib/types.ts` (if needed)

## Special Directories

**src/app/api:**
- Purpose: RESTful API routes
- Generated: No
- Committed: Yes
- Note: Each endpoint is a subdirectory with `route.ts` file
- Next.js automatically routes POST/GET/etc. based on exported functions

**.next:**
- Purpose: Next.js build output (compiled pages, static assets)
- Generated: Yes (by `npm run build`)
- Committed: No (in .gitignore)

**node_modules:**
- Purpose: Installed npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in .gitignore)

**data:**
- Purpose: Static data files (pricing matrix)
- Generated: No
- Committed: Yes
- Note: Imported directly in code, not fetched at runtime

**.claude/get-shit-done:**
- Purpose: GSD configuration and templates (internal)
- Generated: No
- Committed: Yes

**.planning:**
- Purpose: Project planning and analysis documents
- Generated: Yes (by GSD commands)
- Committed: Recommended (tracks decisions)

## Import Path Aliases

**Configured in tsconfig.json:**

- `@/`: Maps to `src/` directory
  - `@/lib/pricing` → `src/lib/pricing`
  - `@/components/cart` → `src/components/cart`

**Usage:**

- Always use absolute imports with `@/` prefix
- Never use relative imports like `../../../lib`
- Example: `import { useCartStore } from '@/lib/cart/store'`

