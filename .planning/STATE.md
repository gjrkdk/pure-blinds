# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-29)

**Core value:** Customers can order custom-dimension textiles with accurate matrix-based pricing through Shopify checkout on all plan tiers
**Current focus:** Phase 5 - Shopify Integration & Checkout

## Current Position

Phase: 5 of 5 (Shopify Integration & Checkout)
Plan: 02 of 02 (Frontend Checkout)
Status: Milestone complete
Last activity: 2026-01-31 — Completed 05-02-PLAN.md execution

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: 4.7 min
- Total execution time: 0.70 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-project-setup | 2 | 11 min | 5.5 min |
| 02-pricing-engine---validation | 2 | 3.1 min | 1.6 min |
| 03-product-page---real-time-pricing | 1 | 5 min | 5 min |
| 04-cart-management | 2 | 9.3 min | 4.7 min |
| 05-shopify-integration---checkout | 2 | 15 min | 7.5 min |

**Recent Trend:**
- Last 5 plans: 04-01 (7 min), 04-02 (2.3 min), 05-01 (2 min), 05-02 (13 min)
- Trend: Phase 5 complete - 05-02 took longer due to checkpoint verification (13 min total)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

| Decision | Phase-Plan | Impact |
|----------|------------|--------|
| Use custom line items with title only (no variantId) | 05-01 | Avoids Shopify API price override bug, ensures locked custom pricing |
| Include dimensions in line item title | 05-01 | Clear order display: "Venetian Blinds 25mm - 100cm x 150cm" |
| Store dimensions as custom attributes | 05-01 | Fulfillment team can extract width/height programmatically |
| Use EUR currency code | 05-01 | European textile shop context, matches store's base currency |
| Check userErrors array separately from GraphQL errors | 05-01 | userErrors = validation, GraphqlQueryError = network/auth |
| Use native dialog element for remove confirmation | 04-02 | Proper accessibility (focus trap, Escape key, backdrop), simpler than modal libraries |
| Text input with inputMode=numeric for quantity stepper | 04-02 | Consistent with dimension inputs, avoids React number bugs, mobile numeric keyboard |
| Sticky footer with pb-40 page padding | 04-02 | Prevents last cart item overlap with fixed bottom footer |
| Use Zustand with persist middleware for cart state | 04-01 | Lightweight state management, built-in localStorage support, no provider boilerplate |
| 7-day TTL with lazy cleanup pattern | 04-01 | Cart expires automatically after inactivity, cleanup on read avoids background timers |
| Hash-based item uniqueness (productId + options signature) | 04-01 | Same dimensions increment quantity, prevents duplicate line items |
| Store original dimensions (not normalized) in cart | 04-01 | Customer sees exactly what they entered, normalization transparent |
| Mount flag pattern for cart icon badge | 04-01 | Prevents hydration mismatch between server/client, eliminates console warnings |
| 2-second success feedback on Add to Cart | 04-01 | Clear confirmation, button disabled during feedback prevents double-add |
| Use text input with inputMode="decimal" instead of type="number" | 03-01 | Avoids React number input bugs, provides numeric keyboard on mobile |
| 400ms debounce delay for pricing API | 03-01 | Balances responsiveness with API efficiency, user stops typing before calculation |
| Ignore flag pattern in useEffect for API calls | 03-01 | Prevents race conditions when rapid typing causes overlapping API calls |
| Client-side validation before debounced API call | 03-01 | Provides instant feedback for obvious errors without server round-trip |
| Parse Zod errors from API details array | 03-01 | Maps field-level errors to inline error display below inputs |
| POST method for pricing endpoint | 02-02 | Avoids Next.js caching issues with query parameters |
| Return Zod error.issues in 400 responses | 02-02 | Frontend gets field-level validation errors for display |
| Thin API handler pattern | 02-02 | Route handlers delegate to pure functions, contain no business logic |
| Use Zod safeParse() pattern for validation | 02-01 | Consumers call safeParse for full error handling control |
| Normalize dimensions via Math.ceil(dimension / 10) * 10 | 02-01 | Ensures 71→80, consistent rounding up to nearest 10cm |
| Bounds checking before array access | 02-01 | Prevents undefined returns, throws descriptive errors |
| formatPrice is single cents-to-dollars conversion point | 02-01 | All other code uses integer cents, prevents rounding bugs |
| Use @shopify/shopify-api v12 request() method | 01-02 | Avoids deprecated query() API, follows current Shopify best practices |
| Configure adminApiAccessToken at shopifyApi init | 01-02 | Required for custom store apps in v12 |
| Create session-based GraphQL client per request | 01-02 | Stateless API pattern, no shared state bugs |
| Use integer cents for all pricing | 01-01 | Prevents floating-point rounding errors in price calculations |
| Store pricing matrix in JSON file | 01-01 | Easy to update prices without code changes |
| Fail-fast env validation on module load | 01-01 | Clear error messages at startup, prevents partial initialization |
| Use Next.js App Router (not Pages Router) | 01-01 | Modern architecture for future features, Server Components support |
| Placeholder values in .env.local | 01-01 | Dev server runs without immediate credential setup |

Architecture decisions from roadmap:
- Roadmap: 7 phases derived from requirements with comprehensive depth
- Architecture: Pricing engine isolated from Shopify (enables future app extraction)
- Technical: Integer-based pricing (cents) to prevent floating-point errors

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-01-31
Stopped at: Completed 05-02-PLAN.md execution (Frontend Checkout)
Resume file: None
Phase status: Phase 5 complete - 2 of 2 plans complete
