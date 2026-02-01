# External Integrations

**Analysis Date:** 2026-02-01

## APIs & External Services

**Shopify Admin API:**
- Service: Shopify GraphQL Admin API (v2026-01)
- What it's used for: Draft order creation, product information retrieval, store health checks
  - SDK/Client: `@shopify/shopify-api` (v12.3.0)
  - Auth: `SHOPIFY_ADMIN_ACCESS_TOKEN` (custom app token, passed as adminApiAccessToken)
  - Configuration:
    - Store domain: `SHOPIFY_STORE_DOMAIN` env var
    - API version: `SHOPIFY_API_VERSION` env var (defaults to "2026-01")
    - Custom store app mode (not embedded app)

## Data Storage

**Databases:**
- No persistent server-side database
- All data is transient or stored on client

**File Storage:**
- None detected. No file upload or cloud storage integration.

**Client-side Storage:**
- localStorage via Zustand persistence
  - Implementation: `src/lib/cart/store.ts`
  - Data: Cart items with 7-day TTL
  - Storage wrapper: Custom TTL implementation with lazy cleanup
  - Key: `cart-storage`

**Caching:**
- No server-side cache detected
- Client-side: React query/SWR not used; Zustand provides state caching
- Shopify API client has retry mechanism: 2 retries on failed requests

## Authentication & Identity

**Auth Provider:**
- Custom - Shopify custom store app authentication
  - Implementation: `src/lib/shopify/client.ts`
  - Method: Access token passed directly to Shopify SDK
  - Session type: Offline session (not user-based, application-based)
  - No user login required - app uses store-level credentials

**API Security:**
- Shopify credentials stored in environment variables
- Never exposed to client-side code
- All Shopify API calls made from Next.js server routes (`src/app/api/`)
- No CORS issues: server-to-server communication

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, DataDog, Bugsnag)
- Current approach: console.error() in error handlers
  - Examples: `src/lib/shopify/draft-order.ts` logs GraphQL errors
  - API routes return generic error messages to clients

**Logs:**
- Browser console: Client-side logs visible in dev tools
- Server logs: Standard Node.js console output
- No persistent log aggregation or log level configuration

**Health Check:**
- Endpoint: `GET /api/health`
- Implementation: `src/app/api/health/route.ts`
- Tests: Queries Shopify admin API for shop data
- Returns: Shop name, URL, domain, connection status

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured
- Recommended: Vercel (mentioned in README.md as official Next.js deployment)
- Alternative: Any Node.js hosting (Heroku, AWS Lambda, DigitalOcean, etc.)
- Static assets: Served from `/public` directory

**CI Pipeline:**
- Not detected (no GitHub Actions, GitLab CI, or other CI config files)
- Testing: Manual via `npm test` (Vitest)
- Linting: Manual via `npm run lint` (ESLint)
- Build: Manual via `npm run build` (Next.js)

## Environment Configuration

**Required env vars:**
1. `SHOPIFY_STORE_DOMAIN` - Store hostname (e.g., "gsd-demo.myshopify.com")
2. `SHOPIFY_ADMIN_ACCESS_TOKEN` - Admin API token for authentication
3. `SHOPIFY_PRODUCT_ID` - Product to display/sell

**Optional env vars:**
- `SHOPIFY_API_VERSION` - Shopify API version (defaults to "2026-01")
- `NODE_ENV` - Environment mode (defaults to "development")

**Secrets location:**
- Development: `.env.local` (git-ignored, not committed)
- Template: `.env.example` (committed, shows required keys)
- Validation: Enforced at runtime in `src/lib/env.ts` using Zod

**Example .env.local:**
```
SHOPIFY_STORE_DOMAIN=gsd-demo.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpca_xxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_VERSION=2026-01
SHOPIFY_PRODUCT_ID=10373715755274
```

## Webhooks & Callbacks

**Incoming:**
- None detected
- No webhook receivers configured
- Application is stateless regarding order updates

**Outgoing:**
- Draft order created in Shopify (via `POST /api/checkout`)
- Returns `invoiceUrl` from Shopify for checkout redirect
- Flow: Client cart → POST /api/checkout → Shopify draft order → Invoice URL redirect
- No server callbacks to external systems after checkout

## API Routes

**Checkout Flow:**
- Endpoint: `POST /api/checkout`
- Location: `src/app/api/checkout/route.ts`
- Accepts: Cart items array
- Calls: `createDraftOrder()` from `src/lib/shopify/draft-order.ts`
- Returns: `{ invoiceUrl: string }` for payment redirect
- Errors: Returns 400 (empty cart) or 500 (API error)

**Pricing Calculation:**
- Endpoint: `POST /api/pricing`
- Location: `src/app/api/pricing/route.ts`
- Accepts: Width and height dimensions
- Returns: Price breakdown (priceInCents, currencyCode, etc.)
- Validation: Zod schema validation
- Errors: Returns 400 (invalid input) or 500 (calculation error)

**Health Check:**
- Endpoint: `GET /api/health`
- Location: `src/app/api/health/route.ts`
- Returns: Shop connection status and shop details
- Used for: Verifying Shopify credentials on startup

## Third-Party Libraries

**Shopify Integration:**
- Library: `@shopify/shopify-api` (v12.3.0)
- Includes: GraphQL client, Session management, Web-API adapter
- Docs: https://shopify.dev/docs/api/admin-rest

**Form & Data Validation:**
- Library: `zod` (v4.3.6)
- Used for: Type-safe schema validation and TypeScript type inference

**State Management:**
- Library: `zustand` (v5.0.10)
- Features: Minimal bundle size, localStorage persistence via middleware

**UI/Utilities:**
- Library: `use-debounce` (v10.1.0)
- Purpose: Debounce dimension input for pricing updates

---

*Integration audit: 2026-02-01*
