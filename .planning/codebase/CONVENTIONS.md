# Coding Conventions

**Analysis Date:** 2026-02-01

## Naming Patterns

**Files:**
- Components: kebab-case (e.g., `cart-icon.tsx`, `dimension-configurator.tsx`)
- Utilities/Libraries: kebab-case (e.g., `cart-item.tsx`, `draft-order.ts`)
- API routes: kebab-case directories with `route.ts` handler (e.g., `/api/checkout/route.ts`)
- Index files: rarely used; explicit imports preferred

**Functions:**
- camelCase for all function names
- Exported utility functions use camelCase (e.g., `generateCartItemId`, `normalizeDimension`, `formatPrice`)
- Event handlers prefixed with `handle` (e.g., `handleCheckout`, `handleWidthChange`, `handleAddToCart`)
- Getter functions prefixed with `get` when accessing state (e.g., `getTotalPrice`, `getItemCount`)
- Fetching/async operations explicit (e.g., `fetchPrice`)

**Variables:**
- Local state: camelCase (e.g., `width`, `height`, `loading`, `error`)
- Boolean state: descriptive names or prefixed with `is/can/has` where useful (e.g., `addedFeedback`, `canAddToCart`, `mounted`)
- Constants at module level: camelCase (e.g., `TTL`)
- React hooks variables: normal camelCase (e.g., `debouncedWidth`, `fieldErrors`)

**Types:**
- Interfaces: PascalCase (e.g., `CartItem`, `CartState`, `DimensionConfiguratorProps`)
- Type aliases: PascalCase (e.g., `AddCartItemInput`, `FieldErrors`)
- Enums: not observed in codebase
- Zod schemas: PascalCase with `Schema` suffix (e.g., `DimensionInputSchema`)

## Code Style

**Formatting:**
- Tailwind CSS for styling (no separate CSS files observed)
- Indentation: 2 spaces (observed in all TypeScript/TSX files)
- Line length: no strict limit enforced, but favors readability
- Semicolons: used consistently throughout

**Linting:**
- ESLint 9.x with Next.js config
- Config: `eslint.config.mjs` using flat config format
- Rules: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- No prettier observed; uses native ESLint formatting

**TypeScript Strict Mode:**
- Enabled: `"strict": true` in `tsconfig.json`
- All files use full type annotations
- Types inferred from Zod schemas where applicable (e.g., `type DimensionInput = z.infer<typeof DimensionInputSchema>`)
- Explicit type annotations on function parameters and return types

## Import Organization

**Order:**
1. External dependencies (React, Next.js, third-party packages)
2. Relative imports from `@/` path alias
3. Type imports grouped separately with `import type`

**Path Aliases:**
- `@/*` resolves to `./src/*` (configured in `tsconfig.json` and `vitest.config.ts`)
- Used consistently throughout: `@/lib/cart/store`, `@/components/cart/cart-summary`

**Example from `src/components/dimension-configurator.tsx`:**
```typescript
import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import { useCartStore } from '@/lib/cart/store'
import { formatPrice } from '@/lib/pricing/calculator'
```

## Error Handling

**Patterns:**
- Try-catch blocks for async operations (API calls, JSON parsing)
- Type guards: `error instanceof Error` to safely extract message
- Validation errors returned as 400 status with structured `{ error, details }` format
- Runtime errors returned as 500 status with user-friendly message (never expose implementation details)
- Field-level validation errors from Zod passed through in `details` array
- Client-side validation with immediate feedback (no debounce) vs. server validation on API calls

**Example from `src/app/api/pricing/route.ts`:**
```typescript
try {
  const body = await request.json();
  const result = DimensionInputSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid dimensions",
        details: result.error.issues,
      },
      { status: 400 }
    );
  }
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json(
    {
      error: "Internal server error",
      message,
    },
    { status: 500 }
  );
}
```

**Example from `src/components/dimension-configurator.tsx`:**
```typescript
try {
  const response = await fetch('/api/pricing', { ... })
  const data = await response.json()
  if (response.ok) {
    setPrice(data.priceInCents)
    setError(null)
  } else if (response.status === 400) {
    if (data.details && Array.isArray(data.details)) {
      const errors: FieldErrors = {}
      data.details.forEach((detail: { path: string[]; message: string }) => {
        const field = detail.path[0] as 'width' | 'height'
        if (field === 'width' || field === 'height') {
          errors[field] = detail.message
        }
      })
      setFieldErrors(errors)
    }
  }
} catch (err) {
  setError('Unable to calculate price')
}
```

## Logging

**Framework:** console (no custom logging library)

**Patterns:**
- No console logs found in production code
- Errors handled through return values and error states, not console output
- Prefer explicit error states in component state for user feedback

## Comments

**When to Comment:**
- Document why, not what (code should be self-documenting)
- Add comments for non-obvious business logic (e.g., "Check if expired (lazy cleanup)")
- Inline comments for important state management details
- Function documentation using JSDoc-style blocks

**JSDoc/TSDoc:**
- Used extensively for function documentation
- Block comments with `/** ... */` syntax
- Include parameter descriptions with `@param` and return types

**Example from `src/lib/cart/utils.ts`:**
```typescript
/**
 * Creates a deterministic hash from dimension options
 * Used for cart item uniqueness detection
 *
 * @param options - User-entered dimensions
 * @returns Deterministic hash string
 */
export function generateOptionsSignature(options: {
  width: number;
  height: number;
}): string {
  // Create deterministic JSON string with sorted keys
  const normalized = JSON.stringify({
    height: options.height,
    width: options.width,
  });

  // Simple browser-compatible hash function
  // Not cryptographic - just needs to be deterministic and collision-resistant
  // for ~400 dimension combinations (20 widths × 20 heights)
  let hash = 0;
  // ... hash logic ...
  return Math.abs(hash).toString(36);
}
```

## Function Design

**Size:** Functions range from 5-100 lines. Preference for small, single-responsibility functions.

**Parameters:**
- Use object destructuring for multiple parameters (e.g., `{ width, height }`)
- Type all parameters explicitly
- No implicit any types

**Return Values:**
- Always explicitly type return values
- Use union types for nullable returns (e.g., `number | null`)
- Async functions return Promises with explicit response types
- API routes return `NextResponse` objects with JSON and status codes

**Example from `src/lib/pricing/calculator.ts`:**
```typescript
export function calculatePrice(width: number, height: number): PricingResponse {
  // Validate, normalize, and calculate
  // Returns structured object with pricing details
  return {
    priceInCents,
    normalizedWidth,
    normalizedHeight,
    originalWidth: width,
    originalHeight: height,
  };
}
```

## Module Design

**Exports:**
- Named exports used for utilities and types (e.g., `export function calculatePrice`)
- `export default` used for page components and default component exports
- Type exports with `export type` for TypeScript-only exports
- No barrel files (no index.ts re-exporting multiple items)

**Module Structure:**
- Separation of concerns: types in `types.ts`, validation in `validator.ts`, implementation in other files
- Pure functions isolated from React (e.g., pricing calculator has zero dependencies)
- Zustand store in dedicated `store.ts` file with clear action and selector definitions
- API routes in Next.js app directory with explicit HTTP method handlers

**Example from `src/lib/pricing/` directory:**
- `calculator.ts`: Pure business logic (no Next.js, no external deps beyond Zod)
- `validator.ts`: Zod schemas only
- `types.ts`: TypeScript interfaces (used by calculator)

## Client vs Server Code

**Client Components:**
- Marked with `'use client'` directive at top of file
- Use React hooks for state management (e.g., `useState`, `useEffect`)
- Can access browser APIs (localStorage, window.location)
- Cannot directly call Node.js libraries

**Server Components:**
- Default in Next.js app directory
- Used for data fetching and page rendering
- Cannot use React hooks
- Can use Node.js libraries directly

**Example from `src/components/cart/cart-summary.tsx`:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cart/store';

export function CartSummary() {
  const [mounted, setMounted] = useState(false);
  // ... component code ...
}
```

---

*Convention analysis: 2026-02-01*
