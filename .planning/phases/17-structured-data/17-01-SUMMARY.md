---
phase: 17-structured-data
plan: 01
subsystem: seo-infrastructure
tags: [schema-org, json-ld, seo, structured-data]
dependency_graph:
  requires: []
  provides:
    - JsonLd component for all schema types
    - Organization schema on homepage
    - FAQPage schema on homepage
    - Product schema builder (ready for use)
    - Breadcrumb schema builder (ready for use)
    - Blog schema builder (ready for use)
  affects:
    - Homepage SEO
    - Google Knowledge Panel eligibility
    - FAQ rich results eligibility
tech_stack:
  added:
    - schema-dts (TypeScript types for Schema.org)
  patterns:
    - Reusable JsonLd component with XSS escaping
    - Schema builder functions pattern
    - Shared data files for client/server component imports
key_files:
  created:
    - src/lib/schema/jsonld.tsx
    - src/lib/schema/organization.ts
    - src/lib/schema/faq.ts
    - src/lib/schema/product.ts
    - src/lib/schema/breadcrumb.ts
    - src/lib/schema/blog.ts
    - src/data/faq-items.ts
  modified:
    - package.json (added schema-dts)
    - src/app/page.tsx (added Organization + FAQPage schemas)
    - src/components/home/faq-section.tsx (import FAQ_ITEMS from data file)
decisions:
  - Use schema-dts for type-safe Schema.org JSON-LD generation
  - Extract FAQ data to shared data file for client/server component access
  - Hardcode EUR currency in product schema (per user decision, not matrix.currency which says USD)
  - Omit phone number from Organization schema (per user decision)
  - XSS protection via JSON.stringify().replace(/</g, '\\u003c') pattern
metrics:
  duration_seconds: 214
  tasks_completed: 2
  files_created: 7
  files_modified: 3
  commits: 2
  completed_date: 2026-02-14
---

# Phase 17 Plan 01: Schema.org Infrastructure Summary

**One-liner:** Created reusable JSON-LD infrastructure with schema-dts, delivering Organization and FAQPage schemas on homepage with XSS protection.

## Objective

Establish Schema.org JSON-LD infrastructure with reusable schema builder pattern and wire Organization + FAQPage schemas into the homepage for Google Knowledge Panel eligibility and FAQ rich results.

## Outcome

Successfully created complete JSON-LD infrastructure with 6 new schema files (JsonLd component + 5 builder functions). Homepage now outputs Organization and FAQPage schemas in HTML source with proper XSS escaping. All schema builders are ready for use across the site.

## Tasks Completed

### Task 1: Create schema infrastructure
- **Commit:** dd9ac47
- **Files:** package.json, package-lock.json, src/lib/schema/*
- **Changes:**
  - Installed schema-dts dependency for type-safe Schema.org types
  - Created JsonLd component with XSS escaping (replace `/</g` with `\\u003c`)
  - Created organization schema builder with Pure Blinds details
  - Created FAQ schema builder mapping questions/answers to Question/Answer pairs
  - Created product schema builder with EUR pricing and availability
  - Created breadcrumb schema builder with position indexing
  - Created blog schema builder with author/publisher metadata
- **Verification:** TypeScript compilation passed, build succeeded

### Task 2: Wire Organization and FAQPage schemas into homepage
- **Commit:** d66884b
- **Files:** src/app/page.tsx, src/components/home/faq-section.tsx, src/data/faq-items.ts
- **Changes:**
  - Extracted FAQ_ITEMS to src/data/faq-items.ts for shared access
  - Updated faq-section component to import FAQ_ITEMS from data file
  - Added Organization schema to homepage with base URL logic
  - Added FAQPage schema to homepage using FAQ_ITEMS
  - Set base URL from NEXT_PUBLIC_SITE_URL env var or default to pureblinds.nl
- **Verification:** Build passed, dev server confirmed both schemas in HTML source, XSS escaping active

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Client/server component import incompatibility**
- **Found during:** Task 2 build
- **Issue:** Cannot import constant FAQ_ITEMS from 'use client' component (faq-section.tsx) into server component (page.tsx) — Next.js bundler treats the import as undefined
- **Fix:** Extracted FAQ_ITEMS to separate data file src/data/faq-items.ts that can be imported by both client and server components
- **Files modified:** src/data/faq-items.ts (created), src/components/home/faq-section.tsx (import from data file), src/app/page.tsx (import from data file)
- **Commit:** d66884b (combined with Task 2)
- **Rationale:** This is a standard Next.js pattern for sharing data between client and server components. Without this fix, the build would fail completely (blocking issue per Rule 3).

## Technical Decisions

1. **schema-dts dependency:** Provides full TypeScript types for Schema.org vocabulary, ensuring type-safe JSON-LD generation
2. **XSS escaping pattern:** `JSON.stringify(data).replace(/</g, '\\u003c')` prevents script injection via JSON-LD
3. **EUR currency hardcoded:** Per user decision, product schema always uses EUR despite pricing matrix saying USD
4. **Shared data pattern:** Extract constants to separate files when needed by both client and server components
5. **Base URL logic:** Use NEXT_PUBLIC_SITE_URL env var with fallback to production domain

## Verification Results

All verification criteria passed:

1. ✅ `npm run build` succeeds with no errors
2. ✅ Homepage HTML source contains `<script type="application/ld+json">` with Organization schema
3. ✅ Homepage HTML source contains `<script type="application/ld+json">` with FAQPage schema
4. ✅ JSON-LD contains `\u003c` instead of `<` where applicable (XSS protection verified)
5. ✅ All schema builder functions exist and have correct TypeScript types

## Self-Check: PASSED

**Created files verification:**
```
FOUND: src/lib/schema/jsonld.tsx
FOUND: src/lib/schema/organization.ts
FOUND: src/lib/schema/faq.ts
FOUND: src/lib/schema/product.ts
FOUND: src/lib/schema/breadcrumb.ts
FOUND: src/lib/schema/blog.ts
FOUND: src/data/faq-items.ts
```

**Commits verification:**
```
FOUND: dd9ac47 (Task 1)
FOUND: d66884b (Task 2)
```

**Schema output verification:**
- Organization schema contains: `"@type":"Organization"`, `"name":"Pure Blinds"`, `"email":"info@pureblinds.nl"`
- FAQPage schema contains: `"@type":"FAQPage"`, all 10 FAQ questions with acceptedAnswer
- XSS escaping active: `\u003c` found in JSON-LD output

## Next Steps

Phase 17 Plan 02 will wire remaining schemas:
- Product schemas on product detail pages
- BreadcrumbList schemas on all pages
- BlogPosting schemas on blog post pages

All infrastructure is now in place and ready for use.

## Related Files

- `.planning/phases/17-structured-data/17-RESEARCH.md` — Research and planning for structured data implementation
- `src/lib/schema/` — All schema builder functions
- `src/data/faq-items.ts` — Shared FAQ data
