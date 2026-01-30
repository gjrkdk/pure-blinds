# Phase 3: Product Page & Real-time Pricing - Research

**Researched:** 2026-01-30
**Domain:** Next.js App Router client-side interactivity, React state management, form validation
**Confidence:** HIGH

## Summary

This phase builds an interactive product page where customers input custom dimensions (width and height in cm) and see prices update in real-time. The architecture leverages Next.js 16 App Router's Server/Client Component model: a Server Component renders the product page shell with static content, while a Client Component handles the interactive dimension configurator.

The standard approach uses controlled inputs with `inputMode="decimal"` for mobile numeric keyboards, debounced state updates (300-500ms) to reduce API calls, and the `use-debounce` library for reliable debouncing without memory leaks. The pricing API is called via `fetch()` POST requests from the client, with inline error display for validation failures and loading states during calculation.

**Primary recommendation:** Use `<input type="text">` with `inputMode="decimal"` and `pattern` validation instead of `type="number"` to avoid React's well-documented issues with number inputs (empty string returns for invalid values, "e" character handling problems).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router framework | Already in project, Server/Client component model is industry standard for 2026 |
| React | 19.2.3 | UI library | Already in project, controlled inputs and hooks are standard for interactive forms |
| Zod | 4.3.6 | Validation library | Already in project for backend validation, ensures frontend matches backend rules |
| use-debounce | 10.1.0 | Debouncing hook | De facto standard React debounce library, <1KB, prevents memory leaks |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TypeScript | 5.x | Type safety | Already in project, ensures type-safe API contracts |
| Tailwind CSS | 4.x | Styling | Already in project for responsive layouts and mobile-first design |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| use-debounce | Custom useEffect with setTimeout | Custom solution prone to memory leaks without cleanup, use-debounce provides tested cleanup logic |
| Controlled inputs | Uncontrolled with refs | Controlled inputs required for real-time validation and debounced updates |
| fetch() | TanStack Query / SWR | Overkill for single POST endpoint, these libraries excel at caching GET requests which this phase doesn't need |

**Installation:**
```bash
npm install use-debounce
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── products/
│   │   └── [productId]/
│   │       └── page.tsx           # Server Component - product page shell
│   └── api/
│       └── pricing/
│           └── route.ts            # Already exists - POST /api/pricing
├── components/
│   └── dimension-configurator.tsx  # Client Component - interactive form
└── lib/
    └── pricing/
        ├── types.ts                # Already exists - PricingResponse interface
        └── validator.ts            # Already exists - DimensionInputSchema
```

### Pattern 1: Server Component Shell + Client Component Island
**What:** Product page is a Server Component that fetches product data, passes it as props to a Client Component for the interactive configurator.
**When to use:** When mixing static content (product details) with interactive elements (dimension inputs).
**Example:**
```typescript
// src/app/products/[productId]/page.tsx (Server Component - default)
import DimensionConfigurator from '@/components/dimension-configurator'

export default async function ProductPage({
  params
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  // In real app: fetch product from Shopify
  const product = { id: productId, name: "Custom Textile", description: "..." }

  return (
    <main>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      {/* Client Component boundary - interactive configurator */}
      <DimensionConfigurator productId={product.id} />
    </main>
  )
}
```

**Why this pattern:** Keeps product data fetching on the server (better performance, no waterfalls), while isolating interactivity to a minimal client bundle.

### Pattern 2: Debounced API Calls with useDebounce
**What:** Use `useDebounce` from `use-debounce` library to delay API calls until user stops typing.
**When to use:** Any scenario where user input triggers expensive operations (API calls, complex calculations).
**Example:**
```typescript
// src/components/dimension-configurator.tsx
'use client'
import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'

export default function DimensionConfigurator({ productId }: { productId: string }) {
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [debouncedWidth] = useDebounce(width, 400)
  const [debouncedHeight] = useDebounce(height, 400)

  useEffect(() => {
    if (debouncedWidth && debouncedHeight) {
      // Call pricing API only after 400ms of no typing
      fetchPrice(debouncedWidth, debouncedHeight)
    }
  }, [debouncedWidth, debouncedHeight])

  return (
    <div>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*"
        value={width}
        onChange={(e) => setWidth(e.target.value)}
        placeholder="Width (cm)"
      />
      {/* height input similar */}
    </div>
  )
}
```

**Why this pattern:** Reduces API calls from potentially hundreds (every keystroke) to one per edit session, while maintaining perceived responsiveness.

### Pattern 3: Race Condition Prevention with Ignore Flag
**What:** Use cleanup function in useEffect to ignore stale API responses if component re-renders before fetch completes.
**When to use:** Any time you fetch data inside useEffect based on changing dependencies.
**Example:**
```typescript
useEffect(() => {
  let ignore = false

  async function fetchPrice() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ width: debouncedWidth, height: debouncedHeight })
      })

      const data = await response.json()

      if (!ignore) {  // Only update state if this is still the latest request
        if (response.ok) {
          setPrice(data.price)
        } else {
          setError(data.error)
        }
      }
    } catch (err) {
      if (!ignore) {
        setError('Unable to calculate price')
      }
    } finally {
      if (!ignore) {
        setLoading(false)
      }
    }
  }

  if (debouncedWidth && debouncedHeight) {
    fetchPrice()
  }

  return () => {
    ignore = true  // Cleanup: ignore responses from stale requests
  }
}, [debouncedWidth, debouncedHeight])
```

**Why this pattern:** Prevents displaying outdated prices when user changes dimensions before previous API call completes. Official React documentation recommends this pattern for all data fetching in useEffect.

### Pattern 4: Controlled Inputs with User-Visible Values
**What:** Keep raw user input in state (e.g., "165") while backend silently rounds (to 170cm). User sees exactly what they typed.
**When to use:** When backend normalization (rounding, formatting) should be invisible to user.
**Example:**
```typescript
const [width, setWidth] = useState('')

// User types "165" -> width = "165" (display shows "165cm")
// Backend receives 165, rounds to 170, calculates price
// User never sees "170", just sees price for their "165" input
<input
  type="text"
  value={width}  // Always shows user's raw input
  onChange={(e) => setWidth(e.target.value)}
/>
<span>{width}cm</span>  // Display user's value, not rounded value
```

**Why this pattern:** Matches user decision from CONTEXT.md - "rounding transparency: hide the rounding from user."

### Anti-Patterns to Avoid
- **Using `<input type="number">` in React:** Has documented bugs - allows "e" character, returns empty string for invalid values, formatting issues. Use `type="text"` with `inputMode="decimal"` instead.
- **Debouncing with raw useEffect + setTimeout without cleanup:** Causes memory leaks and duplicate timers. Use `use-debounce` library which handles cleanup automatically.
- **Adding 'use client' to parent page:** Breaks Server Component benefits (direct data fetching, smaller bundles). Only add 'use client' to the interactive configurator component.
- **Validating only on frontend:** Backend already has Zod validation in `/api/pricing`. Frontend should show inline errors but backend is source of truth.
- **Not handling loading states:** Users need visual feedback when price is calculating (400ms debounce + network latency = noticeable delay).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Debouncing user input | Custom useEffect with setTimeout and cleanup | `use-debounce` library (`useDebounce` hook) | Handles cleanup automatically, prevents memory leaks, memoization built-in, <1KB, battle-tested |
| Mobile numeric keyboard | JavaScript keyboard detection | HTML `inputMode="decimal"` attribute | Built-in browser feature, works across iOS/Android, no JavaScript needed |
| Input validation | Custom regex and error state | Reuse Zod `DimensionInputSchema` from backend | Already exists in `/lib/pricing/validator.ts`, ensures frontend/backend validation match |
| Currency formatting | Custom string manipulation | Native `Intl.NumberFormat` | Handles locale, decimal separators, currency symbols correctly across regions |

**Key insight:** React's ecosystem is mature - most input handling patterns have battle-tested libraries. Custom debouncing solutions are prone to memory leaks (missing cleanup functions) and race conditions (stale closure bugs).

## Common Pitfalls

### Pitfall 1: Missing Dependencies in useEffect
**What goes wrong:** Effect uses reactive values (props, state) but doesn't include them in dependency array. Effect runs with stale data or doesn't re-run when it should.
**Why it happens:** Developer thinks empty array means "run once on mount" but forgets values used inside effect might change.
**How to avoid:** Use ESLint plugin `eslint-plugin-react-hooks` (already enabled in Next.js). Add all reactive values to dependency array.
**Warning signs:** Price doesn't update when changing dimensions, or shows price for old dimensions.

### Pitfall 2: Memory Leaks from useEffect Fetch Calls
**What goes wrong:** Component unmounts while fetch is in progress. When fetch completes, it tries to update state on unmounted component, causing memory leak and console warning.
**Why it happens:** No cleanup function to cancel fetch or ignore response.
**How to avoid:** Always return cleanup function that sets `ignore = true` flag. Check flag before calling `setState`.
**Warning signs:** Console warning "Can't perform a React state update on an unmounted component."

### Pitfall 3: input type="number" with React Controlled Inputs
**What goes wrong:** User types "2e" (attempting "2.5" but finger slips) - HTML spec says invalid number = empty string. React's onChange fires with empty string, clearing the input unexpectedly.
**Why it happens:** HTML5 `<input type="number">` spec returns empty string for invalid numbers. React faithfully reports this to onChange.
**How to avoid:** Use `<input type="text" inputMode="decimal" pattern="[0-9]*">` instead. Gives numeric keyboard on mobile but allows React to see actual typed value.
**Warning signs:** Input clears when user types "e", ".", "+", "-" characters. Formatting doesn't work (can't convert ".98" to "0.98").

### Pitfall 4: Race Conditions from Rapid API Calls
**What goes wrong:** User types "100" then quickly changes to "200". First API call (width=100) is slow, second call (width=200) is fast. Fast response arrives first, then slow response overwrites with wrong price.
**Why it happens:** No request cancellation or response ordering logic.
**How to avoid:** Use `ignore` flag in useEffect cleanup. Later requests set `ignore = true` for earlier requests, preventing stale responses from updating state.
**Warning signs:** Price briefly shows correct value then reverts to old value. Flickering prices.

### Pitfall 5: Placing 'use client' Too High in Component Tree
**What goes wrong:** Adding 'use client' to the product page (`app/products/[id]/page.tsx`) makes entire page client-rendered. Loses benefits of Server Components (direct database queries, smaller JavaScript bundle).
**Why it happens:** Developer needs interactivity somewhere on page, adds 'use client' to top-level component without considering granular boundaries.
**How to avoid:** Create separate Client Component for interactive parts (dimension configurator). Import it into Server Component page. Only the configurator needs 'use client'.
**Warning signs:** Large JavaScript bundle size, can't use async/await in page component, seeing hydration errors.

### Pitfall 6: Missing inputMode Attribute on Mobile
**What goes wrong:** Mobile users see full QWERTY keyboard when entering dimensions (numbers only). Harder to type, more errors, poor UX.
**Why it happens:** Developer uses `<input type="text">` for React compatibility but forgets to add `inputMode="decimal"`.
**How to avoid:** Always pair `type="text"` with `inputMode="decimal"` for numeric inputs. Add `pattern="[0-9]*"` for additional hint to browsers.
**Warning signs:** User feedback about difficult mobile input, high error rates on mobile devices.

### Pitfall 7: Not Debouncing API Calls
**What goes wrong:** Every keystroke triggers API call. User types "150" = 3 API calls (1, 15, 150). Unnecessary server load, potential rate limiting, perceived lag.
**Why it happens:** Developer connects onChange directly to fetch call without debouncing.
**How to avoid:** Use `useDebounce` to wait 300-500ms after user stops typing before triggering API call.
**Warning signs:** Network tab shows dozens of API calls for single input session, backend logs show high request volume.

### Pitfall 8: Infinite Loops in useEffect
**What goes wrong:** Effect updates state that's in the dependency array, causing effect to re-run infinitely.
**Why it happens:** Common with object/array dependencies that get recreated on every render.
**How to avoid:** Only depend on primitive values (strings, numbers) or use `useMemo` for stable object references.
**Warning signs:** Browser freezes, console floods with logs, React DevTools shows thousands of re-renders.

## Code Examples

Verified patterns from official sources:

### Mobile Numeric Keyboard Pattern
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode
// Use inputMode="decimal" for numeric input with decimal support (cm dimensions)
<input
  type="text"          // Use text, not number, for React compatibility
  inputMode="decimal"  // Shows numeric keyboard with decimal separator on mobile
  pattern="[0-9]*"     // Additional hint for browsers, helps with validation
  placeholder="Width (cm)"
  value={width}
  onChange={(e) => setWidth(e.target.value)}
/>
```

### Debounced State with use-debounce
```typescript
// Source: https://www.npmjs.com/package/use-debounce
import { useState } from 'react'
import { useDebounce } from 'use-debounce'

function DimensionInput() {
  const [text, setText] = useState('')
  const [debouncedText] = useDebounce(text, 400)

  // debouncedText only updates 400ms after setText stops being called
  // Use debouncedText in useEffect dependency array for API calls

  return (
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  )
}
```

### Race Condition Prevention in useEffect
```typescript
// Source: https://react.dev/reference/react/useEffect
useEffect(() => {
  let ignore = false

  async function fetchData() {
    const result = await fetch('/api/endpoint')
    const data = await result.json()

    if (!ignore) {  // Check before updating state
      setState(data)
    }
  }

  fetchData()

  return () => {
    ignore = true  // Cleanup: ignore stale responses
  }
}, [dependency])
```

### Server/Client Component Composition
```typescript
// Source: https://nextjs.org/docs/app/getting-started/server-and-client-components
// Server Component (default in App Router)
import ClientWidget from '@/components/client-widget'

export default async function Page() {
  const data = await fetchFromDatabase()  // Can fetch directly

  return (
    <div>
      <h1>{data.title}</h1>
      {/* Pass data to Client Component via props */}
      <ClientWidget initialData={data} />
    </div>
  )
}

// Client Component (separate file)
'use client'  // Only add to files that need interactivity
export default function ClientWidget({ initialData }) {
  const [state, setState] = useState(initialData)
  // Can use hooks, event handlers, browser APIs
  return <button onClick={() => setState(...)}>Click</button>
}
```

### Next.js Dynamic Routes with Params (App Router)
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes
// File: app/products/[productId]/page.tsx
export default async function ProductPage({
  params
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params  // params is a Promise in Next.js 15+

  return <h1>Product {productId}</h1>
}
```

### Inline Validation Error Display
```typescript
// Pattern for showing field-level errors below input
const [widthError, setWidthError] = useState<string | null>(null)

function validateWidth(value: string) {
  const num = parseInt(value)
  if (num < 10) return "Minimum 10cm"
  if (num > 200) return "Maximum 200cm"
  return null
}

<div>
  <input
    type="text"
    value={width}
    onChange={(e) => {
      setWidth(e.target.value)
      setWidthError(validateWidth(e.target.value))
    }}
    aria-invalid={widthError !== null}
    aria-describedby="width-error"
  />
  {widthError && (
    <p id="width-error" className="text-red-600 text-sm mt-1">
      {widthError}
    </p>
  )}
</div>
```

### Currency Formatting
```typescript
// Use Intl.NumberFormat instead of custom string manipulation
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

// price is in cents (integer)
const displayPrice = formatter.format(price / 100)
// displayPrice = "$45.00"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router | App Router | Next.js 13 (2023) | Server Components by default, better performance, no need for getServerSideProps |
| Custom debounce with useCallback | use-debounce library | ~2020 | Eliminates common memory leak bugs, cleaner API |
| input type="number" | input type="text" with inputMode | Ongoing | Avoids React + number input bugs, better mobile UX |
| useFormState | useActionState | React 19 (2025) | Renamed hook, same functionality for Server Actions |
| Synchronous params | Async params Promise | Next.js 15 (2024) | params must be awaited in page components |

**Deprecated/outdated:**
- **getServerSideProps / getStaticProps**: App Router uses async Server Components instead, fetch directly in component
- **_app.tsx / _document.tsx**: App Router uses `layout.tsx` and `RootLayout` pattern
- **API routes in pages/api**: Still work but App Router uses `route.ts` files with better type safety
- **Lodash debounce in React**: Works but use-debounce is more React-idiomatic with hook API

## Open Questions

Things that couldn't be fully resolved:

1. **Product data source for prototype**
   - What we know: Phase depends on Shopify integration (Phase 1), but real product fetching not implemented yet
   - What's unclear: Should prototype use mock data or wait for Shopify integration?
   - Recommendation: Use hardcoded mock product data for this phase. CONTEXT.md shows phase boundary is "dimension configurator" - product fetching can be added later when Shopify is ready.

2. **Exact debounce timing (300ms vs 500ms)**
   - What we know: CONTEXT.md says "~300-500ms", both are acceptable
   - What's unclear: Optimal value for this specific use case
   - Recommendation: Start with 400ms (middle of range). Too short = unnecessary API calls, too long = feels sluggish. 400ms is standard for search inputs.

3. **Loading indicator style (spinner vs skeleton)**
   - What we know: CONTEXT.md marks this as "Claude's discretion"
   - What's unclear: User preference between the two
   - Recommendation: Use simple text loading indicator ("Calculating...") next to price. Simpler than spinner/skeleton, matches "clean, simple display" requirement from CONTEXT.md.

## Sources

### Primary (HIGH confidence)
- [Next.js App Router - Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Official Next.js documentation on component composition patterns
- [React useEffect Reference](https://react.dev/reference/react/useEffect) - Official React documentation on data fetching and race condition prevention
- [MDN: inputmode attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode) - Official HTML specification for mobile keyboard control
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) - Official documentation on [productId] route parameters

### Secondary (MEDIUM confidence)
- [use-debounce GitHub](https://github.com/xnimorz/use-debounce) - Official library repository with examples and API documentation
- [React input problems with type="number"](https://stackoverflow.blog/2022/12/26/why-the-number-input-is-the-worst-input/) - Stack Overflow analysis of documented React + number input issues
- [React Hook Form validation patterns](https://www.react-hook-form.com/api/useformstate/errormessage/) - Community standard for inline error messages (not using this library but pattern is valid)

### Tertiary (LOW confidence)
- Medium articles on Next.js 2026 patterns - Reflect current community practices but need verification against official docs
- Various tutorials on debouncing - Patterns confirmed but specific timing recommendations vary

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries either already in project or have official documentation confirming current usage
- Architecture: HIGH - Patterns verified against official Next.js and React documentation
- Pitfalls: HIGH - Issues documented in official React GitHub issues, Next.js docs, and authoritative sources

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (30 days - Next.js and React are stable, patterns unlikely to change)
