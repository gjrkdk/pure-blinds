---
phase: 19-bug-fixes
verified: 2026-02-19T14:55:00Z
status: passed
score: 4/4 must-haves verified
re_verification: false
---

# Phase 19: Bug Fixes Verification Report

**Phase Goal:** Codebase is free of env var inconsistencies, dead configuration references, and incorrect data metadata
**Verified:** 2026-02-19T14:55:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | No source file references `NEXT_PUBLIC_SITE_URL` — all use `NEXT_PUBLIC_BASE_URL` | VERIFIED | `grep -r "NEXT_PUBLIC_SITE_URL" src/` returns zero results; `page.tsx:30`, `blog/[slug]/page.tsx:11`, `producten/[...slug]/page.tsx:17` all use `NEXT_PUBLIC_BASE_URL` |
| 2 | The app builds without `SHOPIFY_PRODUCT_ID` in the environment | VERIFIED | `src/lib/env.ts` Zod schema has no `SHOPIFY_PRODUCT_ID` field; `.github/workflows/ci.yml` has no `SHOPIFY_PRODUCT_ID` env injection; grep of `src/` and `.github/` returns zero results |
| 3 | All pricing matrix JSON files declare `"currency": "EUR"` | VERIFIED | All three files confirmed: `data/pricing/roller-blind-white.json:5`, `data/pricing/roller-blind-black.json:5`, `data/pricing-matrix.json:5` each declare `"currency": "EUR"` |
| 4 | All domain fallbacks resolve to `pure-blinds.nl`, not `pureblinds.nl` | VERIFIED | `grep -r "pureblinds.nl" src/` returns zero results; all seven affected files use `pure-blinds.nl` |

**Score:** 4/4 truths verified

---

### Required Artifacts

| Artifact | Provides | Status | Details |
|----------|----------|--------|---------|
| `src/lib/env.ts` | Env validation without dead `SHOPIFY_PRODUCT_ID` | VERIFIED | File exists, 19 lines, contains `SHOPIFY_STORE_DOMAIN`, does NOT contain `SHOPIFY_PRODUCT_ID`; Zod schema is clean |
| `data/pricing/roller-blind-white.json` | White roller blind pricing with EUR currency | VERIFIED | `"currency": "EUR"` at line 5 |
| `data/pricing/roller-blind-black.json` | Black roller blind pricing with EUR currency | VERIFIED | `"currency": "EUR"` at line 5 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/page.tsx` | `NEXT_PUBLIC_BASE_URL` | `process.env` lookup | VERIFIED | Line 30: `process.env.NEXT_PUBLIC_BASE_URL \|\| 'https://pure-blinds.nl'` |
| `src/app/layout.tsx` | `pure-blinds.nl` | metadataBase fallback | VERIFIED | Line 13: `new URL(process.env.NEXT_PUBLIC_BASE_URL \|\| 'https://pure-blinds.nl')` |

Additional key links confirmed (not in PLAN frontmatter but verified):

| File | Change | Status |
|------|--------|--------|
| `src/app/blog/[slug]/page.tsx` | `NEXT_PUBLIC_BASE_URL` + `pure-blinds.nl` fallback | VERIFIED — line 11 |
| `src/app/producten/[...slug]/page.tsx` | `NEXT_PUBLIC_BASE_URL` + `pure-blinds.nl` fallback | VERIFIED — line 17 |
| `src/app/robots.ts` | `pure-blinds.nl` baseUrl fallback | VERIFIED — line 4 |
| `src/app/sitemap.ts` | `pure-blinds.nl` baseUrl fallback | VERIFIED — line 6 |
| `src/lib/schema/organization.ts` | `info@pure-blinds.nl` email | VERIFIED — line 10 |
| `src/components/home/contact-section.tsx` | `info@pure-blinds.nl` href and visible text | VERIFIED — lines 90, 93 |
| `.github/workflows/ci.yml` | `SHOPIFY_PRODUCT_ID` removed | VERIFIED — zero matches |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| FIX-01 | 19-01-PLAN.md | All pages use `NEXT_PUBLIC_BASE_URL` consistently; remove `NEXT_PUBLIC_SITE_URL` references | SATISFIED | Zero `NEXT_PUBLIC_SITE_URL` references in `src/`; all three page files use `NEXT_PUBLIC_BASE_URL` |
| FIX-02 | 19-01-PLAN.md | Remove dead `SHOPIFY_PRODUCT_ID` from env validation | SATISFIED | `src/lib/env.ts` Zod schema has no `SHOPIFY_PRODUCT_ID`; CI yml has no `SHOPIFY_PRODUCT_ID` env block |
| FIX-03 | 19-01-PLAN.md | Pricing matrix JSON currency metadata corrected from USD to EUR | SATISFIED | All three pricing JSON files declare `"currency": "EUR"` at line 5; zero `"currency": "USD"` in `data/` |
| FIX-04 | 19-01-PLAN.md | Hardcoded domain fallback corrected from `pureblinds.nl` to `pure-blinds.nl` | SATISFIED | Zero `pureblinds.nl` in `src/`, `data/`, `.github/`; all fallbacks and email addresses use `pure-blinds.nl` |

All four requirement IDs from PLAN frontmatter accounted for. No orphaned requirements found in REQUIREMENTS.md for Phase 19.

---

### ROADMAP Success Criteria Coverage

| # | Success Criterion | Status | Note |
|---|-------------------|--------|------|
| 1 | All pages resolve canonical URLs using `NEXT_PUBLIC_BASE_URL` — no `NEXT_PUBLIC_SITE_URL` references remain | SATISFIED | Verified across all three page files and zero-match grep |
| 2 | The env validation in `src/lib/env.ts` no longer references `SHOPIFY_PRODUCT_ID` | SATISFIED | Zod schema confirmed clean |
| 3 | Pricing matrix JSON files declare `"currency": "EUR"` — the USD value is gone | SATISFIED | All three data files verified |
| 4 | The domain fallback in `src/lib/env.ts` resolves to `pure-blinds.nl`, not `pureblinds.nl` | SATISFIED (with note) | `env.ts` never held a domain fallback — the criterion wording is imprecise. FIX-04 targeted domain fallbacks in `layout.tsx`, `robots.ts`, `sitemap.ts`, `organization.ts`, and `contact-section.tsx`, all of which are verified clean. The intent of the criterion is fully met. |

---

### Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `src/components/home/contact-section.tsx` | `placeholder=` attribute values on `<input>` elements | INFO | HTML form field placeholder text (`"Jan Jansen"`, `"janjansen@email.nl"`, etc.) — legitimate UI attributes, not code stubs. Not a concern. |

No blocker or warning anti-patterns found. The `placeholder` grep hits are false positives from HTML input attributes.

---

### Informational Notes

**`.env.local` and `.env.prod` retain `SHOPIFY_PRODUCT_ID`:** Both local env files still declare `SHOPIFY_PRODUCT_ID`. This is harmless — Zod's `envSchema.parse()` ignores unknown environment variables. The env validator no longer requires this key, so the app starts and builds without it. The env files are not source code and the PLAN scope was limited to `src/` and `.github/`. This is not a gap.

**`.next/` build cache binary files:** The `.next/dev/cache/` directory contains stale binary cache files that match old values. This is expected build artifact behavior and not a source code concern.

---

### Commit Verification

Both task commits exist and match expected file changes:

- `7737247` — `fix(19-01): replace NEXT_PUBLIC_SITE_URL with NEXT_PUBLIC_BASE_URL, remove SHOPIFY_PRODUCT_ID`
  - Files: `.github/workflows/ci.yml`, `src/app/blog/[slug]/page.tsx`, `src/app/page.tsx`, `src/app/producten/[...slug]/page.tsx`, `src/lib/env.ts`
  - 5 files changed, 3 insertions(+), 5 deletions(-)

- `554186d` — `fix(19-01): correct pricing currency USD to EUR, fix domain fallbacks to pure-blinds.nl`
  - Files: `data/pricing-matrix.json`, `data/pricing/roller-blind-black.json`, `data/pricing/roller-blind-white.json`, `src/app/layout.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/components/home/contact-section.tsx`, `src/lib/schema/organization.ts`
  - 8 files changed, 9 insertions(+), 9 deletions(-)

---

### Human Verification Required

None. All changes are string substitutions in source files and JSON data. The verification is fully programmable and complete through grep-based checks.

---

## Summary

Phase 19 fully achieved its goal. All four bugs (FIX-01 through FIX-04) were eliminated atomically across two commits touching 13 files. Every truth is verified against the actual codebase — not SUMMARY claims. The codebase is clean of `NEXT_PUBLIC_SITE_URL`, `SHOPIFY_PRODUCT_ID`, USD currency metadata, and `pureblinds.nl` domain references across all source, data, and CI configuration files.

---

_Verified: 2026-02-19T14:55:00Z_
_Verifier: Claude (gsd-verifier)_
