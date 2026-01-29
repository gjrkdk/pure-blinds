# Phase 2: Pricing Engine & Validation - Research

**Researched:** 2026-01-29
**Domain:** Next.js App Router API Routes, TypeScript pricing calculations, input validation
**Confidence:** HIGH

## Summary

This phase builds a backend pricing API endpoint that validates dimension inputs, normalizes them by rounding up to 10cm increments, and calculates prices using a 2D matrix lookup with integer-based arithmetic. The research identified Next.js Route Handlers as the standard API layer, Zod as the industry-standard validation library (already installed in the project at v4.3.6), and pure function architecture for the pricing engine to maintain zero Shopify dependencies.

The standard approach separates concerns into three layers: (1) Route Handler for HTTP concerns, (2) Zod schema for validation, and (3) pure TypeScript functions for pricing calculations. Integer cents arithmetic prevents floating-point rounding errors that plague financial calculations. The formula `Math.ceil(dimension / 10) * 10` normalizes dimensions to the nearest 10cm increment.

Key recommendation: Matrix lookup using direct 2D array indexing requires bounds checking before access. Array indices are calculated as `(normalizedDimension / 10) - 1` to map the 10-200cm range to 0-19 indices.

**Primary recommendation:** Use Zod `.safeParse()` for validation returning discriminated unions, pure functions in `src/lib/pricing/` for calculations, and Route Handlers in `src/app/api/` that compose these layers with proper error responses (400 for validation, 500 for server errors).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zod | 4.3.6 | Runtime validation with TypeScript inference | TypeScript-first, zero dependencies, 2kb gzipped, 41.7k GitHub stars. Industry standard for Next.js validation |
| Next.js Route Handlers | 16.1.6 | API endpoints using Web Request/Response APIs | Built into Next.js App Router, replaces Pages Router API routes |
| TypeScript | 5.x | Type safety for pricing domain | Prevents type mix-ups (width vs height, cents vs dollars) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | Latest | Unit testing pure functions | Fast test execution (10-20x faster than Jest), native ESM support |
| @testing-library/react | Latest | Integration testing API routes | Testing Route Handlers with mock requests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zod | Yup, Joi, class-validator | Zod has best TypeScript inference and smallest bundle size |
| Integer cents | Dinero.js, big.js | Libraries add weight; integer arithmetic is sufficient for this use case |
| Vitest | Jest | Jest is more mature but slower; Vitest is standard for new Next.js projects |

**Installation:**
```bash
# Zod already installed (v4.3.6)
# For testing (optional for Phase 2):
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── api/
│       └── pricing/
│           └── route.ts           # Route Handler (HTTP layer)
├── lib/
│   └── pricing/
│       ├── calculator.ts          # Pure pricing functions
│       ├── validator.ts           # Zod schemas
│       └── types.ts               # TypeScript types
└── __tests__/
    └── lib/
        └── pricing/
            └── calculator.test.ts # Unit tests for pure functions
```

**Rationale:** Next.js is unopinionated about structure, but the community standard stores application code in `src/lib/` for reusability and keeps `src/app/` purely for routing. The `lib/pricing/` folder isolates pricing domain logic from Shopify dependencies.

### Pattern 1: Three-Layer Architecture
**What:** Separate HTTP concerns (Route Handler), validation (Zod), and business logic (pure functions)

**When to use:** Any API endpoint requiring validation and calculations

**Example:**
```typescript
// src/lib/pricing/validator.ts
import { z } from 'zod';

export const DimensionInputSchema = z.object({
  width: z.number().min(10).max(200),
  height: z.number().min(10).max(200),
});

export type DimensionInput = z.infer<typeof DimensionInputSchema>;

// src/lib/pricing/calculator.ts
export function normalizeDimension(dimension: number): number {
  return Math.ceil(dimension / 10) * 10;
}

export function calculatePrice(width: number, height: number): number {
  // Pure function - no I/O, no side effects
  const normalizedWidth = normalizeDimension(width);
  const normalizedHeight = normalizeDimension(height);

  // Matrix lookup logic here
  const widthIndex = (normalizedWidth / 10) - 1;
  const heightIndex = (normalizedHeight / 10) - 1;

  return pricingMatrix[widthIndex][heightIndex];
}

// src/app/api/pricing/route.ts
import { NextResponse } from 'next/server';
import { DimensionInputSchema } from '@/lib/pricing/validator';
import { calculatePrice } from '@/lib/pricing/calculator';

export async function POST(request: Request) {
  const body = await request.json();

  const result = DimensionInputSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues },
      { status: 400 }
    );
  }

  const price = calculatePrice(result.data.width, result.data.height);

  return NextResponse.json({ priceInCents: price });
}
```

### Pattern 2: Integer Cents Arithmetic
**What:** Store and calculate all monetary values as integer cents, not decimal dollars

**When to use:** Any financial calculation to avoid floating-point precision errors

**Example:**
```typescript
// WRONG: Floating-point errors
const price = 0.1 + 0.2; // Returns 0.30000000000000004

// RIGHT: Integer arithmetic
const price = 10 + 20; // Returns 30 (cents)

// Convert for display
function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

formatPrice(30); // Returns "$0.30"
```

**Source:** [How to Handle Monetary Values in JavaScript - frontstuff.io](https://frontstuff.io/how-to-handle-monetary-values-in-javascript)

### Pattern 3: Round Up to Nearest Multiple
**What:** Use `Math.ceil(value / step) * step` to round up to nearest increment

**When to use:** Normalizing dimensions to 10cm steps

**Example:**
```typescript
function roundUpToNearest10(value: number): number {
  return Math.ceil(value / 10) * 10;
}

// Examples:
roundUpToNearest10(71);    // Returns 80
roundUpToNearest10(79.9);  // Returns 80
roundUpToNearest10(70);    // Returns 70 (already multiple of 10)
roundUpToNearest10(10.01); // Returns 20
```

**Source:** [Round a Number to the Nearest Multiple - bobbyhadz](https://bobbyhadz.com/blog/javascript-round-number-to-nearest-five)

### Pattern 4: Zod .safeParse() for Error Handling
**What:** Use `.safeParse()` instead of `.parse()` to avoid try-catch blocks

**When to use:** API route validation where you need to return 400 responses

**Example:**
```typescript
// AVOID: .parse() throws ZodError
try {
  const data = schema.parse(input);
} catch (error) {
  // Handle error
}

// PREFER: .safeParse() returns discriminated union
const result = schema.safeParse(input);

if (!result.success) {
  // result.error is ZodError with detailed issues
  return NextResponse.json(
    { error: result.error.issues },
    { status: 400 }
  );
}

// result.data is strongly typed
const { width, height } = result.data;
```

**Source:** [Next.js Route Handlers - Official Docs](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

### Pattern 5: 2D Array Indexing with Bounds Checking
**What:** Convert dimension values to 0-based array indices and validate bounds

**When to use:** Matrix lookups where indices are calculated

**Example:**
```typescript
function getPriceFromMatrix(
  width: number,
  height: number,
  matrix: number[][]
): number {
  // Normalize dimensions
  const normalizedWidth = Math.ceil(width / 10) * 10;
  const normalizedHeight = Math.ceil(height / 10) * 10;

  // Calculate indices (10cm → index 0, 20cm → index 1, etc.)
  const widthIndex = (normalizedWidth / 10) - 1;
  const heightIndex = (normalizedHeight / 10) - 1;

  // Bounds check (defensive programming)
  if (widthIndex < 0 || widthIndex >= matrix.length) {
    throw new Error(`Width index ${widthIndex} out of bounds`);
  }

  if (heightIndex < 0 || heightIndex >= matrix[0].length) {
    throw new Error(`Height index ${heightIndex} out of bounds`);
  }

  return matrix[widthIndex][heightIndex];
}
```

**Note:** TypeScript does not prevent array index out-of-bounds errors at compile time. Use `noUncheckedIndexedAccess` in tsconfig.json to force handling of `undefined` returns.

**Source:** [Avoiding runtime errors with array indexing in TypeScript - Ignace Maes](https://blog.ignacemaes.com/avoiding-runtime-errors-with-array-indexing-in-typescript/)

### Anti-Patterns to Avoid
- **Floating-point arithmetic for money:** Use integer cents, not decimal dollars
- **Validating in Route Handler:** Extract Zod schemas to separate files for reusability and testing
- **Coupling pricing logic to Shopify:** Keep pricing functions pure (no API calls, no side effects)
- **Using `.parse()` in API routes:** Throws errors; use `.safeParse()` for discriminated unions
- **Forgetting bounds checks:** Array access in TypeScript can return undefined at runtime
- **Manual validation:** Don't hand-roll validation when Zod provides type-safe schemas

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Input validation | Custom validation functions | Zod schemas | Type inference, error formatting, composability, zero deps |
| Decimal arithmetic | `parseFloat`, `toFixed` for money | Integer cents | Eliminates floating-point precision errors entirely |
| Request parsing | Manual `JSON.parse` with try-catch | `request.json()` + Zod `.safeParse()` | Built-in parsing, structured error handling |
| Error responses | Custom error classes | NextResponse.json() with status codes | Standard Web APIs, Next.js optimized |
| Rounding logic | Custom rounding functions | Math.ceil() with division/multiplication | Native, fast, well-tested |

**Key insight:** Zod provides compile-time type safety through `z.infer<>` while guaranteeing runtime validation. This dual benefit eliminates an entire class of bugs where TypeScript types and runtime values diverge.

## Common Pitfalls

### Pitfall 1: Floating-Point Precision Errors in Pricing
**What goes wrong:** Using decimal numbers for money causes rounding errors that compound over calculations. Example: `0.1 + 0.2 === 0.30000000000000004` in JavaScript.

**Why it happens:** JavaScript's `Number` type uses binary representation (IEEE 754), which cannot precisely represent many decimal fractions.

**How to avoid:** Always store monetary values as integer cents. Multiply by 100 before calculations, divide by 100 only for display.

**Warning signs:**
- Price calculations with decimals (e.g., `price * 1.2`)
- Using `toFixed()` to "fix" rounding errors
- Test failures with money comparisons

**Source:** [How to Handle Monetary Values in JavaScript - frontstuff.io](https://frontstuff.io/how-to-handle-monetary-values-in-javascript)

### Pitfall 2: Off-By-One Errors in Array Indexing
**What goes wrong:** Matrix indices calculated incorrectly lead to wrong prices or runtime errors. Example: 10cm dimension should map to index 0, but `10 / 10 = 1`.

**Why it happens:** Array indices are 0-based, but dimension steps start at 10cm. Forgetting to subtract 1 shifts all indices.

**How to avoid:**
- Use formula: `index = (normalizedDimension / step) - 1`
- Write unit tests for boundary values (10cm, 200cm)
- Add explicit bounds checking before array access

**Warning signs:**
- IndexError / undefined array access
- Prices off by one matrix cell
- Failing tests for min/max dimension values

**Source:** [Avoiding runtime errors with array indexing in TypeScript - Ignace Maes](https://blog.ignacemaes.com/avoiding-runtime-errors-with-array-indexing-in-typescript/)

### Pitfall 3: Validating Wrong Layer (Route Handler vs Schema)
**What goes wrong:** Putting validation logic directly in Route Handler makes it untestable and not reusable.

**Why it happens:** Convenience of validating inline without creating separate schema files.

**How to avoid:**
- Define Zod schemas in `src/lib/pricing/validator.ts`
- Import and use `.safeParse()` in Route Handler
- Test schemas independently of HTTP layer

**Warning signs:**
- Lots of `if (typeof x !== 'number')` checks in route.ts
- Unable to test validation without mocking Request objects
- Duplication of validation logic across endpoints

**Source:** [Next.js API route validation Zod best practices - Dub Blog](https://dub.co/blog/zod-api-validation)

### Pitfall 4: Not Handling Zod Error Format
**What goes wrong:** Zod errors are machine-readable but not user-friendly. Returning raw `ZodError` objects confuses frontend developers.

**Why it happens:** `.safeParse()` returns error object directly without transformation.

**How to avoid:**
- Return `result.error.issues` for detailed field-level errors
- OR map issues to custom error format
- OR use libraries like `zod-validation-error` for formatting

**Warning signs:**
- Frontend receiving nested error objects they can't parse
- API consumers complaining about error format
- Repeated error formatting logic across routes

**Example:**
```typescript
// RAW (unclear to frontend)
{ error: ZodError { ... } }

// BETTER (field-level details)
{
  error: [
    { path: ['width'], message: 'Number must be greater than or equal to 10' }
  ]
}

// BEST (user-friendly)
{ error: 'Width must be between 10 and 200 cm' }
```

**Source:** [How to validate Next.js API routes using Zod - kirandev.com](https://kirandev.com/nextjs-api-routes-zod-validation)

### Pitfall 5: Route Handlers Cached by Default (GET)
**What goes wrong:** GET Route Handlers are cached by default in Next.js App Router, causing stale data.

**Why it happens:** Next.js optimizes for performance with static-first rendering.

**How to avoid:**
- Use POST for non-idempotent operations (correct for pricing endpoint)
- For GET routes, opt out with `export const dynamic = 'force-dynamic'`
- Understand caching semantics before choosing HTTP method

**Warning signs:**
- GET endpoint returning stale/cached data
- Dynamic data appearing static
- Confusion migrating from Pages Router API routes

**Note:** This phase uses POST for `/api/pricing`, so this pitfall doesn't apply. Documented for awareness.

**Source:** [Common mistakes with Next.js App Router - Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)

### Pitfall 6: Forgetting to Normalize Before Validation
**What goes wrong:** Validating raw input (e.g., 15cm) against matrix bounds passes validation but fails during index calculation.

**Why it happens:** Validation and normalization happen in different steps.

**How to avoid:**
- Validate raw input first (10-200 range)
- Normalize in pure function
- Trust that normalized values are always valid matrix indices

**Correct flow:**
1. Validate: 10 ≤ raw input ≤ 200
2. Normalize: `Math.ceil(input / 10) * 10`
3. Calculate index: `(normalized / 10) - 1`
4. Index is guaranteed to be 0-19 for valid input

**Warning signs:**
- Bounds errors despite validation
- Index calculations failing for valid inputs
- Normalization logic duplicated across functions

## Code Examples

Verified patterns from official sources:

### Next.js POST Route Handler with Validation
```typescript
// src/app/api/pricing/route.ts
// Source: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

import { NextResponse } from 'next/server';
import { DimensionInputSchema } from '@/lib/pricing/validator';
import { calculatePrice } from '@/lib/pricing/calculator';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate with Zod
    const result = DimensionInputSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid dimensions', details: result.error.issues },
        { status: 400 }
      );
    }

    // Calculate price using pure function
    const priceInCents = calculatePrice(result.data.width, result.data.height);

    return NextResponse.json({
      priceInCents,
      width: result.data.width,
      height: result.data.height,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', message },
      { status: 500 }
    );
  }
}
```

### Zod Validation Schema
```typescript
// src/lib/pricing/validator.ts
// Source: https://github.com/colinhacks/zod

import { z } from 'zod';

export const DimensionInputSchema = z.object({
  width: z.number()
    .min(10, 'Width must be at least 10cm')
    .max(200, 'Width must not exceed 200cm'),
  height: z.number()
    .min(10, 'Height must be at least 10cm')
    .max(200, 'Height must not exceed 200cm'),
});

// Extract TypeScript type from schema
export type DimensionInput = z.infer<typeof DimensionInputSchema>;

// Example usage in tests or other code
const result = DimensionInputSchema.safeParse({ width: 50, height: 100 });

if (result.success) {
  console.log(result.data); // { width: 50, height: 100 } - strongly typed
} else {
  console.log(result.error.issues); // Array of validation errors
}
```

### Pure Pricing Calculator Functions
```typescript
// src/lib/pricing/calculator.ts
// Source: Clean Architecture patterns + integer cents best practices

import pricingData from '../../../data/pricing-matrix.json';

/**
 * Rounds dimension up to nearest 10cm increment.
 * Examples: 71 → 80, 80 → 80, 10.1 → 20
 */
export function normalizeDimension(dimension: number): number {
  return Math.ceil(dimension / 10) * 10;
}

/**
 * Converts normalized dimension (10-200) to matrix index (0-19).
 * Examples: 10 → 0, 20 → 1, 200 → 19
 */
export function dimensionToIndex(normalizedDimension: number): number {
  return (normalizedDimension / 10) - 1;
}

/**
 * Calculates price in cents for given dimensions.
 * Uses integer arithmetic to avoid floating-point errors.
 *
 * @param width - Width in cm (10-200)
 * @param height - Height in cm (10-200)
 * @returns Price in integer cents
 */
export function calculatePrice(width: number, height: number): number {
  // Normalize to 10cm increments
  const normalizedWidth = normalizeDimension(width);
  const normalizedHeight = normalizeDimension(height);

  // Calculate array indices
  const widthIndex = dimensionToIndex(normalizedWidth);
  const heightIndex = dimensionToIndex(normalizedHeight);

  // Bounds check (defensive programming)
  if (widthIndex < 0 || widthIndex >= pricingData.matrix.length) {
    throw new Error(`Width ${width}cm out of bounds`);
  }

  if (heightIndex < 0 || heightIndex >= pricingData.matrix[0].length) {
    throw new Error(`Height ${height}cm out of bounds`);
  }

  // Matrix lookup returns integer cents
  return pricingData.matrix[widthIndex][heightIndex];
}

/**
 * Formats price in cents as dollar string.
 * Only for display - keep calculations in cents.
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
```

### TypeScript Type Definitions
```typescript
// src/lib/pricing/types.ts
// Source: TypeScript best practices for domain modeling

/**
 * Pricing matrix structure from JSON file.
 */
export interface PricingMatrixData {
  version: string;
  lastUpdated: string;
  description: string;
  currency: string;
  priceUnit: 'cents';
  dimensions: {
    width: DimensionConfig;
    height: DimensionConfig;
  };
  matrix: number[][]; // 20x20 array of integer cents
}

export interface DimensionConfig {
  min: number;
  max: number;
  step: number;
  unit: 'cm';
}

/**
 * API request/response types
 */
export interface PricingRequest {
  width: number;
  height: number;
}

export interface PricingResponse {
  priceInCents: number;
  width: number;
  height: number;
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
}
```

### Vitest Unit Tests for Pure Functions
```typescript
// src/__tests__/lib/pricing/calculator.test.ts
// Source: https://nextjs.org/docs/app/guides/testing/vitest

import { describe, it, expect } from 'vitest';
import { normalizeDimension, dimensionToIndex, calculatePrice } from '@/lib/pricing/calculator';

describe('normalizeDimension', () => {
  it('rounds up to nearest 10cm', () => {
    expect(normalizeDimension(71)).toBe(80);
    expect(normalizeDimension(79.9)).toBe(80);
    expect(normalizeDimension(10.1)).toBe(20);
  });

  it('keeps values already at 10cm increments', () => {
    expect(normalizeDimension(10)).toBe(10);
    expect(normalizeDimension(50)).toBe(50);
    expect(normalizeDimension(200)).toBe(200);
  });
});

describe('dimensionToIndex', () => {
  it('converts normalized dimensions to 0-based indices', () => {
    expect(dimensionToIndex(10)).toBe(0);
    expect(dimensionToIndex(20)).toBe(1);
    expect(dimensionToIndex(200)).toBe(19);
  });
});

describe('calculatePrice', () => {
  it('calculates price for exact matrix values', () => {
    const price = calculatePrice(10, 10);
    expect(price).toBe(1000); // From matrix[0][0]
  });

  it('normalizes dimensions before lookup', () => {
    const price1 = calculatePrice(15, 25); // Normalizes to 20x30
    const price2 = calculatePrice(20, 30); // Direct lookup
    expect(price1).toBe(price2);
  });

  it('handles boundary values', () => {
    expect(() => calculatePrice(10, 10)).not.toThrow();
    expect(() => calculatePrice(200, 200)).not.toThrow();
  });

  it('throws for out-of-bounds values (defensive)', () => {
    expect(() => calculatePrice(5, 50)).toThrow('out of bounds');
    expect(() => calculatePrice(50, 250)).toThrow('out of bounds');
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router API Routes | App Router Route Handlers | Next.js 13 (2022) | Use Web Request/Response APIs, better TypeScript support, no bodyParser config |
| Manual validation | Zod schemas | Zod 1.0 (2020), mainstream 2022+ | Type inference eliminates type/runtime divergence |
| Jest for testing | Vitest | Vitest 1.0 (2022) | 10-20x faster test execution, native ESM |
| Dinero.js / big.js for money | Integer cents | Always valid, rediscovered ~2020+ | Simpler, lighter, sufficient for most cases |
| Classes for domain models | Pure functions | Ongoing shift (2020+) | Easier to test, compose, and reason about |

**Deprecated/outdated:**
- **Pages Router API Routes** (`pages/api/`): Still supported but App Router is recommended for new projects
- **`.parse()` in API handlers**: Use `.safeParse()` to avoid throwing errors and handle validation failures gracefully
- **Zod v3**: Upgrade to v4 (current: 4.3.6) for performance improvements and bug fixes

## Open Questions

1. **Should we add custom error messages to Zod schemas?**
   - What we know: Zod supports `.refine()` and custom error messages
   - What's unclear: Whether to transform Zod errors or return raw `.issues` array
   - Recommendation: Start with raw `.issues` array (frontend can format), add custom messages if needed

2. **Should we add TypeScript branded types for Cents?**
   - What we know: Branded types prevent mixing number types (cents vs dollars, width vs height)
   - What's unclear: Whether this adds value for a simple pricing calculator
   - Recommendation: Not necessary for Phase 2; consider if price calculations become complex

3. **Should we cache pricing matrix in memory?**
   - What we know: JSON file is loaded on import (Node.js caches modules)
   - What's unclear: Whether explicit caching provides benefits
   - Recommendation: No explicit caching needed; Node.js module cache is sufficient

4. **Should we add Vitest configuration now or defer to testing phase?**
   - What we know: Testing is Phase 3; could set up now
   - What's unclear: User preference for when to add test infrastructure
   - Recommendation: Defer to Phase 3 unless user requests early setup

## Sources

### Primary (HIGH confidence)
- [Next.js Route Handlers - Official Docs](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) - API route patterns, TypeScript, error handling
- [Zod GitHub Repository](https://github.com/colinhacks/zod) - v4.3.6 docs, validation patterns
- [Next.js Vitest Testing Guide](https://nextjs.org/docs/app/guides/testing/vitest) - Official testing setup
- [How to Handle Monetary Values in JavaScript - frontstuff.io](https://frontstuff.io/how-to-handle-monetary-values-in-javascript) - Integer cents rationale

### Secondary (MEDIUM confidence)
- [Round Number to Nearest Multiple - bobbyhadz](https://bobbyhadz.com/blog/javascript-round-number-to-nearest-five) - Math.ceil() rounding formula
- [Next.js API Validation with Zod - Dub Blog](https://dub.co/blog/zod-api-validation) - Validation patterns verified with official docs
- [Common mistakes with Next.js App Router - Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) - Official Vercel guidance
- [Avoiding Array Index Errors - Ignace Maes](https://blog.ignacemaes.com/avoiding-runtime-errors-with-array-indexing-in-typescript/) - Bounds checking patterns
- [Clean Architecture with TypeScript - Medium](https://medium.com/@deivisonisidoro_94304/revolutionizing-software-development-unveiling-the-power-of-clean-architecture-with-typescript-5ee968357d35) - Separation of concerns patterns

### Tertiary (LOW confidence)
- [Next.js Testing with Vitest - Strapi Blog](https://strapi.io/blog/nextjs-testing-guide-unit-and-e2e-tests-with-vitest-and-playwright) - Community tutorial, not official
- [Branded Types in TypeScript - DEV Community](https://dev.to/tumf/implementing-the-newtype-pattern-with-zod-enhancing-type-safety-in-typescript-5c62) - Advanced pattern, not critical for Phase 2

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Zod v4.3.6 already installed, Next.js Route Handlers official API, well-documented
- Architecture: HIGH - Patterns verified with official Next.js docs and industry standards
- Pitfalls: HIGH - Sourced from official Vercel blog, Next.js docs, and verified community resources
- Code examples: HIGH - Based on official Next.js documentation and Zod GitHub repository
- Testing patterns: MEDIUM - Vitest is standard but not critical for Phase 2 core functionality

**Research date:** 2026-01-29
**Valid until:** 2026-03-01 (30 days - stable ecosystem, slow-changing patterns)
