# Architecture

**Analysis Date:** 2026-02-01

## Pattern Overview

**Overall:** Layered Next.js application with domain separation (pricing, cart, Shopify integration)

**Key Characteristics:**
- Client-server separation with server components handling data and client components handling UI
- Pure domain logic isolated from framework dependencies
- Real-time pricing calculation with client-side validation
- Zustand store for client-side state management with localStorage persistence
- REST API endpoints wrapping domain logic and Shopify integration

## Layers

**Presentation Layer (Client):**
- Purpose: Render UI and handle user interactions
- Location: `src/app`, `src/components`
- Contains: Page components, layout files, client components with event handlers
- Depends on: Cart store, pricing calculator (for formatting), API endpoints
- Used by: Browser/Next.js router

**API/Route Handlers Layer:**
- Purpose: HTTP endpoint handlers that validate input and orchestrate domain logic
- Location: `src/app/api/`
- Contains: Route handlers for pricing, checkout, health checks
- Depends on: Pricing calculator, Shopify draft order module, Zod validators
- Used by: Client-side fetch requests

**Domain Logic Layer:**
- Purpose: Pure business logic with zero framework dependencies
- Location: `src/lib/pricing/`, `src/lib/cart/`, `src/lib/shopify/`
- Contains: Pricing matrix lookups, cart state management, Shopify API integration
- Depends on: External packages (Zustand, Zod, Shopify API), local types
- Used by: API routes, client components

**Data Layer:**
- Purpose: External data sources and persistence
- Location: `data/` (pricing matrix JSON), localStorage (cart state)
- Contains: Static pricing matrix, browser persistence
- Depends on: None
- Used by: Pricing calculator, Zustand persist middleware

## Data Flow

**Product Browsing & Pricing:**

1. User navigates to `/products/[productId]` (server component)
2. Client-side `DimensionConfigurator` component renders with empty price state
3. User enters width/height dimensions (client state via `useState`)
4. Dimensions are debounced (400ms via `use-debounce`)
5. `DimensionConfigurator` sends POST request to `/api/pricing`
6. Route handler validates with `DimensionInputSchema` (Zod)
7. `calculatePrice()` normalizes dimensions and looks up in pricing matrix
8. Route handler returns `PricingResponse` with price in cents
9. Component displays formatted price via `formatPrice()`
10. User clicks "Add to Cart" → `addItem()` dispatched to Zustand store

**Cart Management:**

1. Zustand `useCartStore` creates unique item ID: `${productId}-${optionsSignature}`
2. If item ID exists, increment quantity; otherwise add as new item
3. Zustand persist middleware serializes items array to localStorage with TTL
4. `CartIcon` and `CartSummary` subscribe to store changes
5. User removes items or updates quantities via store actions
6. Zustand automatically syncs to localStorage

**Checkout Flow:**

1. User clicks "Proceed to Checkout" in `CartSummary`
2. Component sends POST request to `/api/checkout` with cart items
3. Route handler calls `createDraftOrder(items)` with cart array
4. `createDraftOrder()` transforms cart items into Shopify GraphQL mutation:
   - Maps each item to Shopify line item with custom dimensions in title
   - Sets `originalUnitPriceWithCurrency` with locked custom price (EUR)
   - Stores width/height as custom attributes
5. GraphQL client executes mutation with 2 retries
6. Route handler extracts `invoiceUrl` from response
7. Component clears cart and redirects to Shopify invoice URL
8. User completes checkout in Shopify

**State Management:**

- **Client UI State:** React `useState` in components (width, height, loading, error states)
- **Client Cart State:** Zustand store with localStorage persistence (7-day TTL)
- **Server State:** None (stateless route handlers)
- **Persistence:** localStorage wrapper with JSON serialization and timestamp-based expiration

## Key Abstractions

**PricingCalculator:**
- Purpose: Pure pricing matrix lookup logic
- Examples: `src/lib/pricing/calculator.ts`
- Pattern: Pure functions with no side effects
- Functions: `calculatePrice()`, `normalizeDimension()`, `dimensionToIndex()`, `formatPrice()`
- Dependencies: `src/lib/pricing/types.ts`, `data/pricing-matrix.json`

**CartStore (Zustand):**
- Purpose: Centralized cart state with persistence
- Examples: `src/lib/cart/store.ts`
- Pattern: Single source of truth with subscriber pattern
- Actions: `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, `getTotalPrice()`, `getItemCount()`
- Selectors: Components subscribe to individual state slices via `useCartStore((state) => state.items)`

**DraftOrderCreator:**
- Purpose: Shopify API integration for checkout
- Examples: `src/lib/shopify/draft-order.ts`
- Pattern: Single responsibility async wrapper over GraphQL mutation
- Validation: Checks cart non-empty, validates Shopify response for errors, ensures invoiceUrl exists

**DimensionConfigurator:**
- Purpose: Real-time dimension input with live price updates
- Examples: `src/components/dimension-configurator.tsx`
- Pattern: Controlled form with debounced API calls
- Features: Client-side validation, field-level error display, loading states, immediate feedback

## Entry Points

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: User navigates to `/`
- Responsibilities: Static landing page with navigation

**Product Page:**
- Location: `src/app/products/[productId]/page.tsx`
- Triggers: User navigates to `/products/123`
- Responsibilities: Server-side params handling, render dimension configurator

**Cart Page:**
- Location: `src/app/cart/page.tsx`
- Triggers: User navigates to `/cart` or clicks cart icon
- Responsibilities: Display cart items, render summary, handle hydration mismatch prevention

**Pricing API:**
- Location: `src/app/api/pricing/route.ts`
- Triggers: POST request from `DimensionConfigurator`
- Responsibilities: Validate input with Zod, calculate price, return pricing response

**Checkout API:**
- Location: `src/app/api/checkout/route.ts`
- Triggers: POST request from `CartSummary`
- Responsibilities: Validate non-empty cart, create Shopify draft order, return invoiceUrl

**Health Check API:**
- Location: `src/app/api/health/route.ts`
- Triggers: GET request (monitoring/deployment checks)
- Responsibilities: Simple server health status

## Error Handling

**Strategy:** Layered approach with validation at API boundaries and display at presentation layer

**Patterns:**

- **Input Validation:** Zod schemas at route handlers catch malformed requests before domain logic
  - Example: `DimensionInputSchema` validates width/height before pricing calculation
  - Returns 400 with detailed field-level errors

- **Domain Logic Errors:** Explicit error throws for business rule violations
  - Example: `calculatePrice()` throws if dimensions exceed matrix bounds
  - Example: `createDraftOrder()` throws if Shopify returns userErrors

- **Route Handler Wrapping:** Try-catch blocks translate domain errors to HTTP responses
  - 400 for validation failures (Zod errors, dimension bounds)
  - 500 for unexpected errors (API failures, malformed responses)
  - User-friendly error messages only (not internal stack traces)

- **Client-Side Display:** Components show error state with retry capabilities
  - Dimension errors: Field-level error messages under inputs
  - API errors: Generic error message below price display
  - Checkout errors: Message in checkout summary

- **Hydration Safety:** Components check `mounted` state before rendering cart data
  - Prevents hydration mismatch between server-rendered and client-rendered trees
  - Allows Zustand store to initialize from localStorage

## Cross-Cutting Concerns

**Logging:** Console errors in error paths for debugging (no centralized logging system)
- Example: `console.error('GraphQL Error:', error.body?.errors)` in draft-order.ts

**Validation:** Three-layer approach
- Client-side (immediate): React `validateField()` in DimensionConfigurator for user feedback
- API layer (validation): Zod schemas in route handlers for data integrity
- Business logic (constraints): Bounds checking in calculator functions

**Authentication:** Environment variables loaded via Zod schema in `src/lib/env.ts`
- Shopify admin token validated at app startup
- No user authentication (B2B custom textile shop scenario)
- Credentials never exposed to client (route handlers access via process.env)

**Price Handling:** Integer cents throughout codebase, formatted only for display
- Storage: Always `priceInCents` (integer)
- Calculation: Integer matrix lookups
- Display: `formatPrice()` as single point of conversion to USD string
- Example: `1000` cents = "$10.00"

