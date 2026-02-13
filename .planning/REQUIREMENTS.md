# Requirements: Custom Dimension Textile Webshop

**Defined:** 2026-02-13
**Core Value:** Customers can order custom-dimension textiles with accurate matrix-based pricing that works reliably through Shopify checkout on all plan tiers.

## v1.2 Requirements

Requirements for Product Catalog & Navigation milestone. Each maps to roadmap phases.

### Product Catalog Foundation

- [ ] **CATALOG-01**: System stores product data with ID, name, category, description, pricing matrix path
- [ ] **CATALOG-02**: System supports multiple product categories (Light Rollerblinds, Dark Rollerblinds)
- [ ] **CATALOG-03**: Each product references its own pricing matrix JSON file
- [ ] **CATALOG-04**: Pricing engine accepts pricing matrix as parameter (not hardcoded import)
- [ ] **CATALOG-05**: API route `/api/pricing` accepts productId and loads correct pricing matrix
- [ ] **CATALOG-06**: Cart item ID generation includes productId to prevent collisions
- [ ] **CATALOG-07**: Product data includes Shopify variant ID mapping for checkout

### Category Navigation

- [ ] **CATEGORY-01**: User can view Products overview page at `/products`
- [ ] **CATEGORY-02**: Products overview displays category cards for Light and Dark Rollerblinds
- [ ] **CATEGORY-03**: User can click category card to navigate to category listing page
- [ ] **CATEGORY-04**: Light Rollerblinds category page displays 2-3 placeholder products in grid
- [ ] **CATEGORY-05**: Dark Rollerblinds category page displays 2-3 placeholder products in grid
- [ ] **CATEGORY-06**: Product cards show image, name, short description, and "Configure" CTA
- [ ] **CATEGORY-07**: Category pages are responsive (2-column mobile, multi-column desktop)
- [ ] **CATEGORY-08**: Breadcrumb navigation shows current page path (Home > Products > Category)

### Product Detail Enhancement

- [ ] **PRODUCT-01**: Product detail page loads product data based on productId from URL
- [ ] **PRODUCT-02**: Product detail page displays correct product name and description
- [ ] **PRODUCT-03**: Product detail page loads correct pricing matrix for selected product
- [ ] **PRODUCT-04**: Dimension configurator works with any product's pricing matrix
- [ ] **PRODUCT-05**: Product detail page shows product-specific image
- [ ] **PRODUCT-06**: Add to cart includes correct productId and product name

### Blog

- [ ] **BLOG-01**: User can view blog listing page at `/blog`
- [ ] **BLOG-02**: Blog listing displays grid of blog posts with metadata
- [ ] **BLOG-03**: Blog post cards show title, excerpt, date, and reading time
- [ ] **BLOG-04**: User can click blog post card to view full post
- [ ] **BLOG-05**: Blog post detail page displays full content with formatting
- [ ] **BLOG-06**: System includes 2-3 sample blog posts (buying guides, care instructions)
- [ ] **BLOG-07**: Blog uses Velite for type-safe MDX content management
- [ ] **BLOG-08**: Blog post detail pages are responsive with good typography

### Navigation & Header

- [ ] **NAV-01**: Header navigation includes "Products" link to `/products`
- [ ] **NAV-02**: Header navigation includes "Blog" link to `/blog`
- [ ] **NAV-03**: Header navigation removes "Configuration" link
- [ ] **NAV-04**: Header navigation shows: Pure Blinds (logo/home) | Products | Blog | Cart
- [ ] **NAV-05**: Mobile menu includes updated navigation structure
- [ ] **NAV-06**: Footer updated with links to product categories
- [ ] **NAV-07**: Footer includes link to blog

### Polish & Metadata

- [ ] **POLISH-01**: Thank you page renamed to Confirmation page at `/confirmation`
- [ ] **POLISH-02**: 301 redirect from `/thank-you` to `/confirmation`
- [ ] **POLISH-03**: Products overview page has SEO metadata (title, description, OG tags)
- [ ] **POLISH-04**: Category pages have dynamic SEO metadata
- [ ] **POLISH-05**: Blog pages have SEO metadata
- [ ] **POLISH-06**: Product detail pages have dynamic metadata based on product
- [ ] **POLISH-07**: Breadcrumbs styled consistently across all pages

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Product Enhancements

- **ENHANCE-01**: Product sorting by price/popularity (wait for 10+ products)
- **ENHANCE-02**: Product filtering by attributes (wait for 10+ products per category)
- **ENHANCE-03**: Product reviews and ratings (wait for real customer reviews)
- **ENHANCE-04**: Quick-view modal from category pages (not needed for custom products)
- **ENHANCE-05**: Product comparison feature (defer until multiple similar products exist)

### Blog Enhancements

- **BLOG-ADV-01**: Blog categories and tags (manual tagging, wait for 10+ posts)
- **BLOG-ADV-02**: Blog search functionality (wait for 20+ posts)
- **BLOG-ADV-03**: Blog comments (moderation overhead, 3-7% engagement)
- **BLOG-ADV-04**: Related posts suggestions (wait for content volume)
- **BLOG-ADV-05**: Newsletter signup on blog posts (marketing integration)

### User Features

- **USER-01**: Wishlist/favorites (requires authentication, doesn't validate core value)
- **USER-02**: Order history and tracking (beyond confirmation page)
- **USER-03**: User accounts and profiles (not needed for guest checkout)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real product images | Using placeholders for v1.2, real photography is separate content effort |
| Real blog content | Sample posts for structure, actual content strategy separate |
| Advanced filtering (faceted search) | Only 2-3 products per category, adds friction without value |
| Product reviews/ratings | No real reviews yet, empty states create poor UX |
| Wishlist/favorites | Adds authentication complexity, doesn't validate core custom-dimension value |
| Blog comments | Moderation overhead, typically 3-7% engagement, not worth complexity |
| Quick-add to cart from listings | Doesn't work for products requiring dimension configuration |
| Multi-level category hierarchy | Only 2 categories initially, no need for nested structure |
| Search functionality | Small catalog (4-6 products), search creates more friction than browsing |
| Contact form backend | Client-side validation only, backend submission deferred from v1.1 |
| Advanced SEO (content strategy) | SEO foundation only, advanced optimization separate effort |
| Real-time inventory | Shopify handles inventory, not needed in custom dimension flow |
| Product bundles/kits | Single-product orders only, defer bundling |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (To be filled by roadmapper) | | |

**Coverage:**
- v1.2 requirements: 0 total
- Mapped to phases: 0
- Unmapped: 0

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-02-13 after initial definition*
