# Stack Research

**Domain:** Custom-dimension e-commerce with Shopify integration
**Researched:** 2026-01-29
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.5+ | Full-stack React framework with App Router | Industry standard for React apps in 2025. App Router is stable, provides Server Components and Server Actions for type-safe mutations. Next.js 15.5 includes Turbopack (beta), stable Node.js middleware, and React 19 support. Perfect for BFF architecture where frontend and backend live in one codebase. |
| TypeScript | 5.5+ | Type safety across stack | Required for Zod compatibility and modern Next.js features. Provides compile-time safety for pricing calculations and API contracts. |
| React | 19 (stable) | UI library | React 19 is now stable in Next.js 15.1+. Required for Next.js App Router. Server Components reduce client bundle size. |
| Vercel | Latest | Hosting platform | First-party Next.js deployment with zero config. Automatic environment variable management, edge functions, and preview deployments. Native integration with Next.js features. |

### Shopify Integration

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| @shopify/shopify-api | 12.3.0+ | Admin API client (Node.js) | Official Shopify library for Admin API. Supports GraphQL mutations for Draft Orders. Version 12.3.0 (Jan 2025) includes support for API version 2025-10. Use for server-side Draft Order creation. **HIGH confidence** |
| @shopify/storefront-api-client | Latest | Storefront API client | Official lightweight client for reading products/variants. Use for fetching product catalog and displaying to customers. Supports privacy compliance features (visitorConsent directive post-2025-10). **HIGH confidence** |

**API Version Strategy:**
- Use API version `2025-10` or later (latest stable as of Jan 2025)
- Draft Orders with custom pricing are fully supported
- **Known issue:** There's a reported bug in 2025-01 where `variant_id + price` doesn't override variant default price. Verify fix in 2025-10 or use workarounds.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 4.x | Runtime validation + TypeScript inference | **Always**. Use for validating dimension inputs, pricing matrix structure, and API payloads. Zod 4 is 14x faster than v3 with 57% smaller bundle. @zod/mini (1.9KB) available for client-side validation. **HIGH confidence** |
| React Hook Form | 7.x | Form state management | **Always**. Use for dimension input forms. 8KB bundle, zero dependencies, uncontrolled components = fewer re-renders. Integrates with Zod via @hookform/resolvers. Outperforms Formik in 2025 benchmarks. **HIGH confidence** |
| @hookform/resolvers | Latest | Zod + React Hook Form bridge | **Always when using Zod + RHF**. Provides zodResolver for seamless schema validation in forms. |
| Zustand | 5.x | Client state management | **Recommended for cart state**. Lightweight (minimal bundle), better performance than Context API for frequently updated state. Use for shopping cart, current product configuration. Overkill for simple theme/auth state (use Context for those). **MEDIUM confidence** |
| Tailwind CSS | 4.x | Utility-first styling | **Recommended**. Tailwind v4 is latest in 2025. Fully compatible with Next.js App Router and Server Components (static classes). Faster than v3, zero-config with PostCSS. Alternative: v3 still supported. **HIGH confidence** |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vitest | Unit/integration testing | 10-20x faster than Jest in watch mode. 95% Jest-compatible API. Use for pricing engine tests, API route tests. Recommended over Jest for new Vite-based projects. **MEDIUM confidence** |
| ESLint | Code linting | Next.js includes built-in ESLint config. Extend with TypeScript rules. |
| Prettier | Code formatting | Standard for consistent formatting. Integrates with Tailwind CSS plugin for class sorting. |
| Shopify CLI | Development tooling | Use GraphiQL explorer (tap 'g' in dev mode) to test queries. Not required but helpful for API exploration. |

## Installation

```bash
# Core Next.js project (if not already initialized)
npx create-next-app@latest --typescript --tailwind --app --use-npm

# Shopify clients
npm install @shopify/shopify-api @shopify/storefront-api-client

# Validation & forms
npm install zod react-hook-form @hookform/resolvers

# State management
npm install zustand

# Dev dependencies
npm install -D vitest @vitejs/plugin-react eslint prettier

# Optional: Tailwind v4 (if not included in create-next-app)
npm install -D tailwindcss@next postcss autoprefixer
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js App Router | Remix, Astro | Use Remix if you need nested routing with granular loading states. Use Astro for content-heavy sites with minimal interactivity. Next.js is right choice for this project. |
| @shopify/shopify-api | shopify-api-node | **Don't use shopify-api-node** - it's a community library. Official @shopify/shopify-api is better maintained and supports latest API versions. |
| Server Actions | API Routes | Use API Routes if you need public endpoints or webhooks. For internal mutations (Draft Order creation), Server Actions provide type safety and less boilerplate. Can use both together. |
| Zustand | React Context, Redux | Use Context for simple global state (theme, auth). Use Redux if team already invested in Redux ecosystem. Zustand is sweet spot for cart state. |
| Zod | Yup, Joi | Zod's TypeScript inference is unmatched. Yup/Joi require separate type definitions. Zod v4 performance improvements make it clear winner. |
| React Hook Form | Formik | Formik is feature-rich but heavier (15KB vs 8KB) and slower due to controlled components. RHF is modern standard. |
| Vitest | Jest | Jest if you have existing Jest setup or need React Native testing. Vitest for new projects with better performance. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Shopify Checkout Extensibility | Requires Shopify Plus plan. Project constraint: "no plan-gated features". | Draft Orders API (works on all plans) |
| Shopify Functions | Requires Shopify Plus. Would be ideal for pricing logic but gated. | Custom pricing engine + Draft Orders |
| Pages Router | Legacy routing system in Next.js. App Router is stable and recommended for new projects. | App Router (already chosen) |
| REST Admin API | Deprecated as of Oct 1, 2024. GraphQL is required for new apps as of April 2025. | GraphQL Admin API |
| Client-side Draft Order creation | Admin API requires private credentials. Cannot expose in browser. | Server Actions or API Routes |
| Database for v1 | Over-engineering for matrix storage. Adds deployment complexity. | JSON file storage (already chosen, correct for v1) |

## Stack Patterns by Variant

**If building Shopify app (future state):**
- Extract pricing engine to shared library
- Use @shopify/shopify-app-express for OAuth flow
- Consider Shopify Functions if targeting Plus merchants
- Database becomes necessary for multi-merchant state

**If scaling beyond JSON matrix:**
- Add Vercel Postgres or Supabase for matrix storage
- Keep pricing calculation logic separate (pure functions)
- Consider edge functions for pricing calculations (low latency)

**If exposing public API:**
- Use API Routes alongside Server Actions
- Implement Data Access Layer pattern (shared logic)
- Add rate limiting and authentication middleware

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15.5+ | React 19 | React 19 is stable in Next.js 15.1+. Breaking change: no default caching for fetch/GET routes. |
| Zod 4.x | TypeScript 5.5+ | Zod 4 requires TS 5.5+. Use @zod/mini for client-side tree-shaking. |
| @shopify/shopify-api 12.x | Node.js 18+ | Verify Node version in Vercel settings (18.x or 20.x). |
| Vitest 3.x | Next.js 15+ | Vitest 3 released Jan 2025. Check Next.js compatibility in Vitest config. |
| Tailwind CSS 4.x | PostCSS 8+ | Tailwind v4 requires PostCSS plugin config. Next.js includes PostCSS. |

## Stack Validation: Chosen vs Recommended

**Validation of project's chosen stack:**

| Chosen | Verdict | Notes |
|--------|---------|-------|
| Next.js App Router | ✅ Validated | Correct choice. Stable, performant, supports BFF architecture. |
| TypeScript | ✅ Validated | Required for type-safe pricing logic and API contracts. |
| Shopify Storefront API | ✅ Validated | Correct for reading products. Use official @shopify/storefront-api-client. |
| Shopify Admin API GraphQL | ✅ Validated | Correct for Draft Orders. GraphQL is required standard as of 2025. Use @shopify/shopify-api v12+. |
| Draft Orders approach | ✅ Validated with caveat | Works on all plans (constraint satisfied). **Caveat:** Custom pricing in Draft Orders has known issues in API 2025-01. Use version 2025-10 or later. |
| Vercel hosting | ✅ Validated | First-class Next.js support, zero-config deployment. |
| JSON matrix storage | ✅ Validated for v1 | Appropriate for MVP. Migrate to database when scaling or building multi-merchant app. |
| BFF architecture | ✅ Validated | Next.js Server Actions provide type-safe mutations without separate backend. |

**Missing from chosen stack (add these):**
- **Zod** - Required for runtime validation of dimensions and matrix structure
- **React Hook Form** - Standard for form handling in 2025
- **Zustand** - Recommended for cart state management (better than Context for cart)
- **Testing framework** - Add Vitest for pricing engine tests

## Critical Stack Decisions

### Decision 1: Server Actions vs API Routes

**Recommendation:** Use **both**
- **Server Actions** for Draft Order creation (internal mutation, type-safe)
- **API Routes** if you need webhooks later (Shopify order status callbacks)

**Rationale:** Server Actions eliminate boilerplate and provide end-to-end type safety when calling from client components. API Routes needed only for external integrations.

### Decision 2: Client State Management

**Recommendation:** Use **Zustand for cart, Context for theme/settings**

**Rationale:**
- Cart state updates frequently (add item, change dimensions, recalculate price)
- Context causes unnecessary re-renders across component tree
- Zustand's selective subscription prevents performance issues
- Context is fine for infrequent updates (theme, locale)

### Decision 3: Validation Strategy

**Recommendation:** **Zod everywhere** (forms, API payloads, matrix structure)

**Rationale:**
- Single source of truth for validation rules
- TypeScript types automatically inferred from schemas
- Runtime validation catches bad data from external sources (Shopify API)
- Pricing matrix structure validation prevents runtime errors

### Decision 4: Draft Order Custom Pricing Implementation

**Critical finding:** Draft Orders API has known issues with custom pricing in version 2025-01.

**Recommendation:**
1. Use API version **2025-10** (latest stable)
2. Test custom pricing thoroughly in development store
3. Implement fallback: if price override fails, create line item with custom product variant
4. Monitor Shopify changelog for pricing API fixes

**Alternative approach if pricing issues persist:**
- Create temporary "custom product" variants with calculated prices
- Add to Draft Order using these variants
- Delete temporary variants after order completion

## Environment Variables Strategy

**Required for Vercel deployment:**

```bash
# Shopify API (use Vercel dashboard or .env.local)
SHOPIFY_STORE_DOMAIN=yourstore.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxx  # Public token (client-safe)
SHOPIFY_ADMIN_ACCESS_TOKEN=xxx       # Private token (server-only)

# Next.js public variables (prefix required for client access)
NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION=2025-10
NEXT_PUBLIC_STORE_URL=yourstore.com

# Vercel auto-populates these (enable in settings)
VERCEL_ENV                           # development/preview/production
NEXT_PUBLIC_VERCEL_ENV               # client-accessible version
```

**Security:**
- Never expose `SHOPIFY_ADMIN_ACCESS_TOKEN` to client
- Use Server Actions/API Routes to call Admin API
- Storefront token can be public (read-only product access)
- Enable "Automatically expose System Environment Variables" in Vercel

## Sources

### High Confidence Sources (Official Documentation)

- [Next.js 15.5 Release](https://nextjs.org/blog/next-15-5) - Official Next.js blog
- [GraphQL Admin API reference](https://shopify.dev/docs/api/admin-graphql/latest) - Official Shopify docs
- [@shopify/shopify-api npm](https://www.npmjs.com/package/@shopify/shopify-api) - Official package registry
- [@shopify/storefront-api-client npm](https://www.npmjs.com/package/@shopify/storefront-api-client) - Official package
- [Zod v4 Release](https://www.infoq.com/news/2025/08/zod-v4-available/) - InfoQ coverage of Zod 4
- [React Hook Form Official Docs](https://react-hook-form.com/) - Official documentation

### Medium Confidence Sources (Best Practices, 2025 Articles)

- [GraphQL Admin API Best Practices](https://shopify.dev/docs/apps/build/graphql) - Shopify official docs
- [Shopify Draft Orders Custom Pricing](https://shopify.dev/changelog/set-custom-prices-in-draft-orders) - Shopify changelog
- [React Hook Form vs Formik 2025](https://refine.dev/blog/react-hook-form-vs-formik/) - Community comparison
- [Next.js Server Actions vs API Routes 2025](https://dev.to/myogeshchavan97/nextjs-server-actions-vs-api-routes-dont-build-your-app-until-you-read-this-4kb9) - DEV Community
- [Zustand vs React Context 2025](https://dev.to/cristiansifuentes/react-state-management-in-2025-context-api-vs-zustand-385m) - DEV Community
- [Vitest vs Jest 2025](https://medium.com/@ruverd/jest-vs-vitest-which-test-runner-should-you-use-in-2025-5c85e4f2bda9) - Medium article
- [Tailwind CSS v4 with Next.js 2025](https://codeparrot.ai/blogs/nextjs-and-tailwind-css-2025-guide-setup-tips-and-best-practices) - Setup guide
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables) - Official Vercel docs

### Low Confidence / Requires Verification

- Draft Order custom pricing bug in API version 2025-01 - reported in [community forums](https://community.shopify.dev/t/draft-order-api-not-overriding-variant-default-price-with-custom-price/10698), not verified in official docs. **Test thoroughly in development.**

---
*Stack research for: Custom-dimension e-commerce with Shopify integration*
*Researched: 2026-01-29*
*Confidence: HIGH (core stack), MEDIUM (some library versions pending official verification)*
