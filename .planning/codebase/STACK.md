# Technology Stack

**Analysis Date:** 2026-02-01

## Languages

**Primary:**
- TypeScript 5.x - Used throughout application (frontend, backend, build config)
- JSX/TSX - React component syntax in `src/components/` and `src/app/`

**Secondary:**
- CSS - Tailwind CSS for styling
- JavaScript - PostCSS configuration

## Runtime

**Environment:**
- Node.js (version managed via package.json, no .nvmrc specified)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework for app routing, API routes, and SSR
  - Location: `next.config.ts`, `src/app/` directory structure
  - Used for: Page routing, API endpoints, server components

**UI:**
- React 19.2.3 - Component library
- React DOM 19.2.3 - DOM rendering

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework
- PostCSS 4.x - CSS transformation tool
  - Config: `postcss.config.mjs`

**Testing:**
- Vitest 4.0.18 - Unit test runner (faster than Jest for Node/Vite projects)
  - Config: `vitest.config.ts`
  - Environment: jsdom for DOM testing
- @testing-library/react 16.3.2 - React component testing utilities
- @testing-library/dom 10.4.1 - DOM query and interaction utilities
- @testing-library/jest-dom 6.9.1 - Custom DOM matchers for assertions
- jsdom 27.4.0 - JavaScript implementation of web standards (DOM environment for tests)

**Build/Dev:**
- ESLint 9.x - JavaScript/TypeScript linter
  - Config: `eslint.config.mjs`
  - Extends: `eslint-config-next` for Next.js best practices
- @vitejs/plugin-react 5.1.2 - React plugin for Vitest environment

## Key Dependencies

**Critical:**
- @shopify/shopify-api 12.3.0 - Official Shopify GraphQL API client
  - Used for: Draft order creation, admin API communication
  - Location: `src/lib/shopify/client.ts`, `src/lib/shopify/draft-order.ts`
  - Includes web-api adapter for browser/Node.js environments

**Validation & Schema:**
- zod 4.3.6 - TypeScript-first schema validation library
  - Used for: Environment variable validation, API request validation
  - Location: `src/lib/env.ts`, `src/lib/pricing/validator.ts`

**State Management:**
- zustand 5.0.10 - Lightweight state management library
  - Used for: Cart state persistence
  - Location: `src/lib/cart/store.ts`
  - Includes persist middleware with localStorage support
  - Custom TTL implementation for 7-day expiration

**Utilities:**
- use-debounce 10.1.0 - React hook for debounced values
  - Used for: Real-time pricing calculation debounce
  - Location: `src/components/dimension-configurator.tsx`

## Configuration

**Environment:**
- Environment variables validated at runtime using Zod schema
- Required vars:
  - `SHOPIFY_STORE_DOMAIN` - Shopify store hostname
  - `SHOPIFY_ADMIN_ACCESS_TOKEN` - API authentication token
  - `SHOPIFY_API_VERSION` - Shopify GraphQL API version (defaults to "2026-01")
  - `SHOPIFY_PRODUCT_ID` - Product identifier for catalog
  - `NODE_ENV` - "development" | "production" | "test"
- Config location: `src/lib/env.ts`
- Example template: `.env.example`

**Build:**
- TypeScript compilation: `tsconfig.json`
  - Target: ES2017
  - Strict mode enabled
  - Path alias: `@/*` maps to `./src/*`
- Next.js config: `next.config.ts` (currently minimal, no custom config)
- ESLint rules: `eslint.config.mjs`
- Vitest config: `vitest.config.ts`
  - jsdom environment for DOM tests
  - Supports @ path alias resolution

## Platform Requirements

**Development:**
- Node.js with npm
- Modern browser (React 19, Tailwind CSS 4 require ES2017+)
- Environment variables in `.env.local` or `.env.example`

**Production:**
- Node.js runtime for Next.js server
- Browser support: Modern browsers with ES2017 support
- Recommended deployment: Vercel (Next.js creator, mentioned in README)
- Static assets: Hosted from `/public` directory

## Scripts

**Development:**
```bash
npm run dev        # Start development server on http://localhost:3000
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint checks
npm test           # Run Vitest suite
```

---

*Stack analysis: 2026-02-01*
