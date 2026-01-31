# Phase 5: Shopify Integration & Checkout - Research

**Researched:** 2026-01-31
**Domain:** Shopify Draft Order API (GraphQL), checkout redirection, custom pricing integration
**Confidence:** HIGH

## Summary

Phase 5 integrates the custom cart with Shopify's native checkout by creating Draft Orders via GraphQL Admin API. The standard approach uses the `draftOrderCreate` mutation to generate orders with custom line items (locked pricing) and custom attributes (dimension metadata), then redirects customers to the `invoiceUrl` for payment completion.

Key findings:
- `draftOrderCreate` mutation returns `invoiceUrl` immediately without requiring `draftOrderInvoiceSend`
- Custom line items support locked pricing via `originalUnitPrice` (deprecated) or `originalUnitPriceWithCurrency` (current)
- Using `variantId` with custom pricing has known issues - custom line items are more reliable
- GraphQL mutations use `userErrors` array for validation feedback (different from HTTP-level `graphQLErrors`)
- Existing `@shopify/shopify-api` v12 client with `request()` method already configured in codebase

**Primary recommendation:** Use custom line items with `title` and `originalUnitPriceWithCurrency` for dimension-based products, avoid `variantId` + price override pattern due to API limitations. Store dimensions as `customAttributes` on line items for order fulfillment reference.

## Standard Stack

The established libraries/tools for Shopify GraphQL integration:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @shopify/shopify-api | v12+ | Shopify Admin API client | Official library, handles auth/sessions/rate limiting, required for custom apps |
| Next.js API Routes | App Router | Backend endpoints | Already in project, thin handler pattern established |
| Zod | Latest | Schema validation | Already used for pricing validation, consistent error structure |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @shopify/api-codegen-preset | Latest | TypeScript type generation | Optional - adds compile-time safety for GraphQL operations |
| gql.tada | Latest | Dynamic type generation | Alternative to codegen - runtime type safety |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GraphQL Admin API | REST Admin API | REST has draft order endpoints but less flexible for custom attributes |
| Custom line items | Product variants with price override | Variant approach has API bugs preventing price override |
| @shopify/shopify-api | Raw fetch to GraphQL endpoint | Lose session management, rate limiting, error handling |

**Installation:**
Already installed: `@shopify/shopify-api@^12.0.0` (confirmed in project)

Optional type safety:
```bash
npm install --save-dev @shopify/api-codegen-preset @graphql-codegen/cli
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── api/
│       └── checkout/
│           └── route.ts          # POST endpoint - thin handler
├── lib/
│   ├── shopify/
│   │   ├── client.ts             # Existing - createAdminClient()
│   │   ├── draft-order.ts        # NEW - createDraftOrder() pure function
│   │   └── types.ts              # NEW - TypeScript types for mutations
│   └── cart/
│       └── store.ts              # Existing - cart state
```

### Pattern 1: Thin API Handler with Pure Business Logic
**What:** API route delegates to pure function, contains no GraphQL logic
**When to use:** Consistent with existing `/api/pricing` pattern
**Example:**
```typescript
// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { createDraftOrder } from "@/lib/shopify/draft-order";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation happens in pure function
    const result = await createDraftOrder(body.items);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // User-friendly error only
    return NextResponse.json(
      { error: "Unable to process checkout. Please try again." },
      { status: 500 }
    );
  }
}
```

### Pattern 2: Custom Line Items for Locked Pricing
**What:** Use `title` + `originalUnitPriceWithCurrency` instead of `variantId` + price override
**When to use:** When product pricing differs from catalog price
**Example:**
```typescript
// Source: https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftordercreate
const lineItems = cartItems.map(item => ({
  title: `${item.productName} - ${item.options.width}cm x ${item.options.height}cm`,
  originalUnitPriceWithCurrency: {
    amount: (item.priceInCents / 100).toFixed(2),
    currencyCode: "USD"
  },
  quantity: item.quantity,
  customAttributes: [
    { key: "width", value: item.options.width.toString() },
    { key: "height", value: item.options.height.toString() }
  ]
}));
```

### Pattern 3: GraphQL Client Request with Error Handling
**What:** Use existing `createAdminClient()` with try-catch for `GraphqlQueryError`
**When to use:** All GraphQL operations
**Example:**
```typescript
// Source: https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/docs/reference/clients/Graphql.md
import { GraphqlQueryError } from '@shopify/shopify-api';
import { createAdminClient } from '@/lib/shopify/client';

const client = createAdminClient();

try {
  const response = await client.request(mutation, { variables });

  // Check userErrors from mutation response (validation errors)
  if (response.data?.draftOrderCreate?.userErrors?.length > 0) {
    const errors = response.data.draftOrderCreate.userErrors;
    throw new Error(errors.map(e => e.message).join(', '));
  }

  const invoiceUrl = response.data?.draftOrderCreate?.draftOrder?.invoiceUrl;
  return { invoiceUrl };

} catch (error) {
  if (error instanceof GraphqlQueryError) {
    // GraphQL-level errors (network, auth, rate limit)
    console.error('GraphQL Errors:', error.body?.errors);
  }
  throw error;
}
```

### Pattern 4: Client-Side Loading State with Redirect
**What:** Disable button, show spinner, redirect on success
**When to use:** Any async operation requiring user feedback
**Example:**
```typescript
// Client component pattern (consistent with dimension-configurator.tsx)
const [loading, setLoading] = useState(false);

const handleCheckout = async () => {
  setLoading(true);

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems })
    });

    const data = await response.json();

    if (response.ok) {
      // Same-window redirect for seamless experience
      window.location.href = data.invoiceUrl;
    } else {
      setError(data.error || 'Unable to process checkout');
      setLoading(false);
    }
  } catch (error) {
    setError('Unable to process checkout. Please try again.');
    setLoading(false);
  }
};

// Button with loading state
<button
  onClick={handleCheckout}
  disabled={loading || cartItems.length === 0}
>
  {loading ? 'Preparing checkout...' : 'Checkout'}
</button>
```

### Anti-Patterns to Avoid
- **Using variantId with price override:** API ignores `originalUnitPrice` when `variantId` is present (known bug since 2025)
- **Calling draftOrderInvoiceSend to get URL:** Sends email unnecessarily; `invoiceUrl` is in `draftOrderCreate` response
- **Clearing cart on API call:** Cart should persist until Phase 6 webhook confirms payment
- **Technical error messages to user:** Show generic "Unable to process checkout" only
- **New window redirect:** Breaks mobile checkout flow; use same-window redirect

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GraphQL client with auth | Custom fetch wrapper | @shopify/shopify-api client | Handles session management, rate limiting, retries (0-3), API versioning |
| TypeScript types for mutations | Manual interface definitions | @shopify/api-codegen-preset | Auto-generates types from schema, prevents drift |
| Error parsing from GraphQL | String matching on error.message | Check userErrors array first | userErrors are structured validation errors with field paths |
| Price formatting for API | Manual string manipulation | (cents / 100).toFixed(2) | Prevents floating-point precision bugs |
| Loading state management | Custom promise tracking | useState + try/finally pattern | Existing pattern in dimension-configurator.tsx |

**Key insight:** Shopify's GraphQL API has two error layers (userErrors for validation, graphQLErrors for system issues) that require different handling strategies. The `@shopify/shopify-api` client abstracts network-level complexity but you must still check mutation-level `userErrors`.

## Common Pitfalls

### Pitfall 1: variantId + Custom Price Override Ignored
**What goes wrong:** When you include both `variantId` and `originalUnitPrice` in a line item, Shopify ignores the custom price and uses the variant's catalog price.
**Why it happens:** Known API limitation since 2025-01 version - the API prioritizes variant pricing over custom pricing when both are present.
**How to avoid:** Use custom line items with `title` only (no `variantId`). Store original product/variant ID in `customAttributes` if needed for fulfillment tracking.
**Warning signs:** Draft order shows different price than cart price; customer complains about wrong total.
**Source:** https://community.shopify.dev/t/draft-order-graphql-originalunitprice-ignored-when-variantid-is-present/21670

### Pitfall 2: Confusing userErrors with graphQLErrors
**What goes wrong:** Developer checks only for caught exceptions, misses validation errors in successful 200 responses.
**Why it happens:** GraphQL returns HTTP 200 even with validation failures; errors are in response payload, not thrown exceptions.
**How to avoid:** Always check `response.data?.mutationName?.userErrors?.length > 0` before assuming success. `userErrors` are validation failures (empty cart, invalid email). `graphQLErrors` (in caught exception) are system failures (auth, network, rate limit).
**Warning signs:** API call succeeds but draft order not created; no error shown to user.
**Source:** https://shopify.dev/docs/api/admin-graphql/latest/objects/UserError

### Pitfall 3: Draft Order Auto-Purging After 1 Year
**What goes wrong:** Draft orders created after April 1, 2025 are automatically deleted after 1 year of inactivity.
**Why it happens:** Shopify optimization to reduce database bloat.
**How to avoid:** Not applicable to Phase 5 (checkout happens immediately). Relevant if building order management/admin features later.
**Warning signs:** Old draft orders disappearing from Shopify admin.
**Source:** https://help.shopify.com/en/manual/fulfillment/managing-orders/create-orders/create-draft

### Pitfall 4: Sending draftOrderInvoiceSend When Not Needed
**What goes wrong:** Developer calls `draftOrderInvoiceSend` mutation to get `invoiceUrl`, which triggers email to customer even though app is handling redirect.
**Why it happens:** Misleading naming - "invoice send" sounds like "get invoice URL" but it actually sends email.
**How to avoid:** `invoiceUrl` is returned directly from `draftOrderCreate` response. Only use `draftOrderInvoiceSend` if you actually want to email the customer.
**Warning signs:** Customers receiving unexpected "invoice" emails during checkout.
**Source:** https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftOrderInvoiceSend

### Pitfall 5: Not Handling Multiple Currency Pricing
**What goes wrong:** Using `originalUnitPrice` (deprecated) instead of `originalUnitPriceWithCurrency` causes currency ambiguity.
**Why it happens:** Old examples and documentation use deprecated field.
**How to avoid:** Always use `originalUnitPriceWithCurrency` with explicit `currencyCode`. For single-currency stores, hardcode "USD" (or store's base currency).
**Warning signs:** TypeScript warnings about deprecated fields; pricing display mismatch in multi-currency setups.
**Source:** https://shopify.dev/docs/api/admin-graphql/latest/input-objects/draftorderlineiteminput

### Pitfall 6: Environment Variable Validation Timing
**What goes wrong:** Missing `SHOPIFY_PRODUCT_ID` env var causes runtime error during checkout instead of startup error.
**Why it happens:** Unlike required Shopify credentials (validated in `env.ts`), new env vars added only for this phase.
**How to avoid:** Add new env vars to existing `envSchema` in `src/lib/env.ts` for fail-fast validation on module load. Consistent with Phase 1 decision.
**Warning signs:** Checkout fails in production but local dev works (different .env files).

## Code Examples

Verified patterns from official sources:

### draftOrderCreate Mutation with Custom Line Items
```typescript
// Source: https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftordercreate
const DRAFT_ORDER_CREATE = `#graphql
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        invoiceUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const variables = {
  input: {
    lineItems: [
      {
        title: "Venetian Blinds 25mm - 100cm x 150cm",
        originalUnitPriceWithCurrency: {
          amount: "42.50",
          currencyCode: "USD"
        },
        quantity: 2,
        customAttributes: [
          { key: "width", value: "100" },
          { key: "height", value: "150" }
        ]
      }
    ]
  }
};
```

### GraphQL Client Usage with Error Handling
```typescript
// Source: https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/docs/reference/clients/Graphql.md
import { GraphqlQueryError } from '@shopify/shopify-api';
import { createAdminClient } from '@/lib/shopify/client';

async function createDraftOrder(items: CartItem[]) {
  const client = createAdminClient();

  try {
    const response = await client.request(DRAFT_ORDER_CREATE, {
      variables: {
        input: {
          lineItems: items.map(item => ({
            title: `${item.productName} - ${item.options.width}cm x ${item.options.height}cm`,
            originalUnitPriceWithCurrency: {
              amount: (item.priceInCents / 100).toFixed(2),
              currencyCode: "USD"
            },
            quantity: item.quantity,
            customAttributes: [
              { key: "width", value: item.options.width.toString() },
              { key: "height", value: item.options.height.toString() }
            ]
          }))
        }
      },
      retries: 2
    });

    // Check for validation errors (userErrors)
    const userErrors = response.data?.draftOrderCreate?.userErrors;
    if (userErrors && userErrors.length > 0) {
      throw new Error(userErrors.map(e => e.message).join(', '));
    }

    const invoiceUrl = response.data?.draftOrderCreate?.draftOrder?.invoiceUrl;
    if (!invoiceUrl) {
      throw new Error('No invoice URL returned from Shopify');
    }

    return { invoiceUrl };

  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      // Network/auth/rate limit errors
      console.error('GraphQL Error:', error.body?.errors);
      throw new Error('Shopify API error');
    }
    throw error;
  }
}
```

### Client-Side Checkout Button with Loading State
```typescript
// Pattern from existing dimension-configurator.tsx, adapted for checkout
'use client'

import { useState } from 'react';
import { useCartStore } from '@/lib/cart/store';

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const items = useCartStore((state) => state.items);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to Shopify checkout in same window
        window.location.href = data.invoiceUrl;
        // Loading state persists until redirect completes
      } else {
        setError(data.error || 'Unable to process checkout. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Unable to process checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Preparing checkout...
          </span>
        ) : (
          'Checkout'
        )}
      </button>

      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
```

### Environment Variable Addition
```typescript
// Source: Existing pattern in src/lib/env.ts
// Add to envSchema object:
const envSchema = z.object({
  // ... existing fields ...
  SHOPIFY_PRODUCT_ID: z.string().min(1, "SHOPIFY_PRODUCT_ID is required"),
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| REST /admin/api/.../draft_orders.json | GraphQL draftOrderCreate | 2022+ | GraphQL is primary API, REST maintenance mode |
| originalUnitPrice (number) | originalUnitPriceWithCurrency (object) | 2024+ | Multi-currency support required explicit currency |
| client.query() method | client.request() method | v12.0.0 (2023) | query() deprecated, request() is current |
| Number type for IDs | String type for IDs | v12.0.0 (2023) | Prevents precision loss with large IDs |
| Manual GraphQL fetch | @shopify/shopify-api client | Always | Official SDK handles versioning/auth/rate limits |

**Deprecated/outdated:**
- **REST Draft Order API**: Still works but GraphQL is recommended for new development
- **originalUnitPrice field**: Use `originalUnitPriceWithCurrency` instead
- **client.query() method**: Use `client.request()` in @shopify/shopify-api v12+

## Open Questions

Things that couldn't be fully resolved:

1. **Draft Order invoiceUrl Expiration Policy**
   - What we know: invoiceUrl is generated immediately from draftOrderCreate, customers can use it to complete checkout
   - What's unclear: How long the URL remains valid (hours, days, weeks?), whether it expires after draft order completion
   - Recommendation: Assume URL is short-lived (redirect immediately). Phase 6 handles abandoned checkouts via webhook monitoring. If expiration becomes issue, can investigate programmatically refreshing URL or converting to regular checkout.
   - Source: No expiration documented in https://shopify.dev/docs/api/admin-graphql/latest/objects/DraftOrder

2. **Invoice URL Behavior on Mobile Devices**
   - What we know: Shopify checkout is mobile-responsive, 76% of e-commerce is mobile, Shopify optimizes for 4-6 taps maximum
   - What's unclear: Whether mobile browsers handle window.location.href differently (app switching, back button behavior)
   - Recommendation: Use same-window redirect (context decision). Test on iOS Safari and Android Chrome. Alternative: Could use `<a href>` tag instead of programmatic redirect if issues arise.
   - Source: https://help.shopify.com/en/manual/fulfillment/managing-orders/create-orders/get-paid

3. **Custom Attribute Value Length Limits**
   - What we know: customAttributes accept key-value strings, used for metadata like dimensions
   - What's unclear: Maximum length for value field (our use case is small: "100", "150"), whether there's a limit on number of attributes per line item
   - Recommendation: Keep values simple (dimension numbers as strings). If complex metadata needed later, investigate metafields as alternative.
   - Source: https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftordercreate

4. **TypeScript Type Safety Trade-offs**
   - What we know: @shopify/api-codegen-preset generates types, gql.tada provides runtime types, both add complexity
   - What's unclear: Whether type safety overhead worth it for single mutation (draftOrderCreate) vs multiple complex queries
   - Recommendation: Start without codegen (consistent with project's pragmatic approach). Add if mutation count grows in Phase 6+. Manual TypeScript interfaces sufficient for MVP.
   - Source: https://shopify.dev/docs/api/shopify-app-remix/v2/guide-graphql-types

## Sources

### Primary (HIGH confidence)
- [draftOrderCreate - GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftordercreate) - Mutation structure, input fields, response format
- [DraftOrder object - GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql/latest/objects/DraftOrder) - invoiceUrl field, object structure
- [DraftOrderLineItemInput - GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql/latest/input-objects/draftorderlineiteminput) - Line item fields, customAttributes, pricing
- [UserError object - GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql/latest/objects/UserError) - Error handling pattern
- [@shopify/shopify-api GraphQL Client Reference](https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/docs/reference/clients/Graphql.md) - client.request() API, error handling
- [Shopify Help Center - Draft Orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/create-orders/create-draft) - Business context, checkout flow

### Secondary (MEDIUM confidence)
- [Draft Order variantId + price override issue - Shopify Community](https://community.shopify.dev/t/draft-order-graphql-originalunitprice-ignored-when-variantid-is-present/21670) - Known API limitation, workaround
- [GraphQL Mutations Guide - Shopify.dev](https://shopify.dev/docs/apps/build/graphql/basics/mutations) - userErrors pattern, best practices
- [Next.js Error Handling Guide](https://nextjs.org/docs/app/getting-started/error-handling) - Client-side error state patterns
- [Building E-commerce with Next.js + Shopify - Vercel](https://vercel.com/kb/guide/building-ecommerce-sites-with-next-js-and-shopify) - Environment variable patterns

### Tertiary (LOW confidence - verification needed)
- Multiple WebSearch results about draft order pricing, multi-currency handling - community discussions without official verification
- Loading button patterns from shadcn/ui and React ecosystem - general patterns, not Shopify-specific
- TypeScript type generation approaches - multiple alternatives exist, no single standard

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @shopify/shopify-api is official library, already in project, verified in codebase
- Architecture: HIGH - Patterns verified against official GraphQL client docs and existing project patterns
- Pitfalls: MEDIUM-HIGH - variantId + price issue verified in community forums (multiple reports), other pitfalls from official docs

**Research date:** 2026-01-31
**Valid until:** 2026-02-28 (30 days - Shopify API stable, 2026-01 version current)

**Additional notes:**
- Phase context decisions (CONTEXT.md) successfully constrain research scope - no alternatives explored for locked decisions
- Existing architecture (thin handlers, Zod validation, client error handling) provides strong patterns to follow
- GraphQL client already configured in src/lib/shopify/client.ts - no additional setup needed
- Custom line items approach cleaner than variant approach for MVP (avoids API bugs, simpler mental model)
