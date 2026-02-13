# Phase 11: Product Catalog Foundation - Context

**Gathered:** 2026-02-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform single-product architecture into multi-product catalog system. Support multiple products with unique IDs, categories, and independent pricing matrices. The pricing engine must accept any product's pricing matrix (not hardcoded), and the cart must prevent collisions between products with identical dimensions.

This phase establishes the data architecture. Product browsing UI comes in Phase 12.

</domain>

<decisions>
## Implementation Decisions

### Product Data Structure
- **Data source**: Hybrid approach — product metadata in JSON files (version-controlled), reference Shopify IDs for checkout integration
- **Core fields**: id, name, slug, category, pricingMatrixPath, shopifyProductId, shopifyVariantId (minimal set, extend as UI needs emerge)
- **Category structure**: Simple string categories (e.g., 'rollerblinds-white') — flat structure, easy filtering, extract for navigation
- **Pricing matrix reference**: File path stored in pricingMatrixPath (e.g., '/data/pricing/rollerblinds-white.json') — allows products to share matrices if needed

### Pricing Engine Interface
- **Engine input**: Accepts pricing matrix only — `calculatePrice(pricingMatrix, width, height)` — pure function, zero dependencies
- **API orchestration**: Route loads product and matrix, calls engine — API handles I/O, engine handles calculation
- **API design**: POST `/api/pricing` accepts `{productId, width, height}` — route loads correct product and matrix based on productId
- **Error handling**: Return 404 for invalid productId or missing pricing matrix — clear HTTP semantics
- **Data loading**: API route loads product and matrix files, pricing engine stays pure (never touches filesystem)

### Cart Item Uniqueness
- **ID generation**: productId + dimensions format — `${productId}-${width}x${height}` — deterministic, prevents collisions
- **Duplicate handling**: Increment quantity when same product+dimensions added again — standard e-commerce behavior
- **Cart migration**: Clear old carts (pre-productId format) on load — acceptable for pre-launch, simple
- **Item data structure**: Store minimal — productId, width, height, quantity, calculatedPrice — load product details (name, image) from catalog when rendering

### Shopify Variant Mapping
- **Product structure**: 1:1 mapping — each catalog product = 1 Shopify product with single 'Custom Size' variant
- **Dimension passing**: Use line item properties — `[{key: 'Width', value: '150cm'}, {key: 'Height', value: '200cm'}]` — visible on orders and invoices
- **Price handling**: Override variant price in Draft Order API with calculated price — Shopify variant has placeholder price (€0 or €1)
- **Shopify IDs**: Store both shopifyProductId and shopifyVariantId in product data — variant ID is what Draft Order API needs

### Claude's Discretion
- Exact file structure for product catalog JSON files
- Product loading utility function implementation details
- Error message wording
- TypeScript types and interfaces organization

</decisions>

<specifics>
## Specific Ideas

- Pricing engine must remain dependency-free so it can be reused in other contexts (client-side, background jobs, etc.)
- Cart ID format should be readable for debugging: `rollerblinds-white-150x200` better than hash
- Line item properties are better than custom attributes because they show on invoices automatically

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-product-catalog-foundation*
*Context gathered: 2026-02-13*
