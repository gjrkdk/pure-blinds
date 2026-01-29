# Phase 01 Plan 01: Project Initialization Summary

**One-liner:** Next.js 15+ TypeScript foundation with Zod environment validation and 20x20 integer-based pricing matrix JSON

---

## Plan Metadata

- **Phase:** 01-project-setup
- **Plan:** 01
- **Subsystem:** foundation
- **Completed:** 2026-01-29
- **Duration:** 3 minutes

---

## What Was Built

### Core Deliverables

1. **Next.js 15+ Application**
   - TypeScript with strict type checking
   - App Router architecture (not Pages Router)
   - Tailwind CSS for styling
   - ESLint configuration
   - Running on localhost:3000 without errors

2. **Environment Variable Validation**
   - `src/lib/env.ts` with Zod schema validation
   - Validates: SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_ACCESS_TOKEN, SHOPIFY_API_VERSION, NODE_ENV
   - Fail-fast on module load with clear error messages
   - Type-safe environment exports

3. **Pricing Matrix Data**
   - `data/pricing-matrix.json` with full 20x20 grid
   - 400 integer cent values (no floats to avoid rounding errors)
   - Dimensions: 10-200cm width x 10-200cm height in 10cm steps
   - Range: $10.00 (1000 cents) to $86.00 (8600 cents)

4. **Project Dependencies**
   - @shopify/shopify-api: v12.3.0 (Official Shopify GraphQL client)
   - zod: v4.3.6 (Schema validation)
   - All Next.js 15+ core dependencies

5. **Environment Configuration**
   - `.env.example`: Template with required Shopify credentials (committed)
   - `.env.local`: Placeholder values for local development (gitignored)
   - `.gitignore`: Updated to exclude .claude/ directory and .env* files

### Technical Approach

- **Pricing Storage:** Integer cents (not floats) to prevent JavaScript floating-point errors
- **Environment Safety:** Zod validation catches missing/invalid env vars at startup (not runtime)
- **App Router Only:** Modern Next.js architecture with Server Components support
- **TypeScript First:** Zero compilation errors, full type safety

---

## Task Commits

| Task | Description | Commit | Files Changed |
|------|-------------|--------|---------------|
| 1 | Initialize Next.js project with dependencies | 54d6d55 | package.json, tsconfig.json, next.config.ts, src/app/*, .env.example, .gitignore (18 files) |
| 2 | Create env validation and pricing matrix | ea3e6a7 | src/lib/env.ts, data/pricing-matrix.json (2 files) |

**Total commits:** 2 task commits

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] .env.example gitignored by .env* pattern**
- **Found during:** Task 1 commit
- **Issue:** `.env.example` was blocked by `.env*` pattern in .gitignore, but it needs to be committed as a template
- **Fix:** Used `git add -f .env.example` to force add the template file
- **Files modified:** .env.example
- **Commit:** 54d6d55 (amended)

**2. [Rule 3 - Blocking] .claude/ directory not gitignored**
- **Found during:** Task 1 commit stage
- **Issue:** .claude/ directory (Claude Code internal docs) was showing as untracked and would be committed
- **Fix:** Added `.claude/` to .gitignore to exclude internal documentation
- **Files modified:** .gitignore
- **Commit:** 54d6d55

**3. [Rule 3 - Blocking] create-next-app directory conflict**
- **Found during:** Task 1 initialization
- **Issue:** create-next-app refuses to initialize in non-empty directory (contains .planning/ and .claude/)
- **Fix:** Created Next.js app in temp-next directory, moved files to root, removed temp directory
- **Files modified:** N/A (scaffolding step)
- **Commit:** N/A (before first commit)

---

## Decisions Made

| Decision | Rationale | Impact | Alternatives Considered |
|----------|-----------|--------|-------------------------|
| Use integer cents for all pricing | JavaScript floating-point arithmetic causes rounding errors (0.1 + 0.2 !== 0.3) | All price calculations precise to the cent, no rounding bugs | Float dollars (rejected: prone to errors), string-based decimal library (rejected: unnecessary complexity) |
| Store pricing matrix in JSON file | Simple, version-controllable, fast lookup for 400 values | Easy to update prices without code changes, can be loaded at runtime | Database table (overkill for static matrix), hardcoded in TypeScript (not flexible), CSV file (harder to parse structure) |
| Fail-fast env validation on module load | Missing credentials cause cryptic runtime errors deep in Shopify API calls | Clear error messages at startup, prevents partial initialization | Lazy validation on first use (rejected: harder to debug), try/catch at usage sites (rejected: repetitive) |
| Use Next.js App Router (not Pages Router) | Pages Router is legacy, App Router enables Server Components and better performance | Modern architecture for future features, aligns with Next.js 15+ best practices | Pages Router (rejected: deprecated for new projects), Remix (rejected: not in requirements) |
| Placeholder values in .env.local | Prevents app crashes during development before real Shopify credentials exist | Dev server runs without immediate credential setup, can test non-Shopify features | No .env.local (rejected: app crashes on startup), dummy Shopify dev store immediately (rejected: adds setup friction) |

---

## Key Files

### Created
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript compiler configuration
- `next.config.ts` - Next.js configuration
- `src/app/layout.tsx` - Root layout component
- `src/app/page.tsx` - Homepage with "Development environment ready" confirmation
- `src/lib/env.ts` - Zod-validated environment variables
- `data/pricing-matrix.json` - 20x20 pricing grid in integer cents
- `.env.example` - Template for required environment variables
- `.env.local` - Local environment with placeholder values
- `.gitignore` - Git exclusions (includes .env*, .claude/)

### Modified
- N/A (all files created from scratch)

### Deleted
- N/A

---

## Verification Results

All success criteria met:

- [x] `npm run dev` starts without errors on localhost:3000
- [x] `npm run build` completes with zero TypeScript errors
- [x] Pricing matrix has exactly 20 rows x 20 columns of integer cents
- [x] `.env.local` is gitignored (verified with `git check-ignore`)
- [x] `@shopify/shopify-api` and `zod` are in package.json dependencies

---

## Dependencies

### Requires (Built Upon)
- None (phase 1 baseline)

### Provides (For Subsequent Phases)
- **Next.js foundation:** App Router, TypeScript, development server
- **Environment validation:** Zod schema for Shopify credentials
- **Pricing data:** 20x20 matrix JSON file
- **Project structure:** src/ directory, data/ directory, standard Next.js layout

### Affects (Future Phases That Need This)
- Phase 2 (Shopify Integration): Uses env.ts for Shopify API credentials
- Phase 3 (Pricing Engine): Loads pricing-matrix.json for calculations
- Phase 4+ (All subsequent phases): Build on Next.js foundation

---

## Technical Context

### Technology Stack

**Added in this phase:**
- Next.js: 16.1.6 (App Router)
- React: 19+ (required by Next.js 15+)
- TypeScript: 5.1.0+
- @shopify/shopify-api: 12.3.0
- zod: 4.3.6
- Tailwind CSS: Latest (via create-next-app)

**Patterns established:**
- Environment validation pattern (Zod schema parse on module load)
- Integer cents pricing (no floats)
- Data-driven pricing (JSON file, not hardcoded)

### Architecture Decisions
- **App Router over Pages Router:** Future-proof architecture, Server Components support
- **Pricing isolated from Shopify:** Matrix stored independently, can be extracted to separate service later
- **Type-safe environment:** Zod validation prevents runtime failures from missing config

---

## Next Phase Readiness

### Blockers
None. All deliverables complete and verified.

### Concerns
None at this stage.

### Recommendations for Next Phase
1. **Phase 02 (Shopify Integration):**
   - Create Shopify development store and custom app
   - Generate Admin API access token
   - Update .env.local with real credentials
   - Test env.ts validation with real values

2. **Phase 03 (Pricing Engine):**
   - Load pricing-matrix.json and validate structure
   - Implement price lookup by width/height
   - Add cents-to-dollars conversion for Shopify API
   - Add formatPrice() for display

---

## Lessons Learned

### What Went Well
- create-next-app scaffolding fast and reliable
- Zod env validation pattern clear and reusable
- Integer cents approach prevents common pricing bugs
- Temp directory workaround for non-empty directory worked cleanly

### What Could Be Improved
- Consider adding .env.local to .env.example comments to clarify local setup
- Could add NODE_ENV default in .env.example for clarity
- Pricing matrix could include validation metadata (min/max values, row/col labels)

### Surprises
- Next.js 16.1.6 is latest (not 15.x as expected from research)
- .env* pattern in .gitignore blocks .env.example (required force add)
- Turbopack warnings about yarn.lock in parent directory (non-blocking)

---

## Tags
`nextjs`, `typescript`, `shopify-api`, `zod`, `environment-validation`, `pricing-matrix`, `app-router`, `tailwind`, `project-setup`, `foundation`
