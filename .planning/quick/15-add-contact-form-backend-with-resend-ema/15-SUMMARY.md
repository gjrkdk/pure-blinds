---
phase: 15-add-contact-form-backend-with-resend-ema
plan: 01
subsystem: api
tags: [resend, email, contact-form, rate-limiting, honeypot, zod, next.js]

# Dependency graph
requires:
  - phase: src/lib/env.ts
    provides: Server-side env validation with Zod
provides:
  - /api/contact POST endpoint with validation, honeypot, rate limiting, dual email delivery
  - RESEND_API_KEY and CONTACT_EMAIL env var validation
  - Updated contact form with async submission, loading state, and error handling
affects: [contact-form, email-delivery, spam-protection]

# Tech tracking
tech-stack:
  added: [resend@4.x]
  patterns:
    - In-memory rate limiter using Map with TTL reset (3 req/15min per IP)
    - Honeypot silent rejection (returns 200 to confuse bots)
    - Module-level Resend client initialization from validated env
    - Dutch error messages in API responses

key-files:
  created:
    - src/app/api/contact/route.ts
  modified:
    - src/lib/env.ts
    - src/components/home/contact-section.tsx
    - package.json
    - .env.local

key-decisions:
  - "Use onboarding@resend.dev as sender until domain verified — avoids blocking feature on domain setup"
  - "Rate limit key by x-forwarded-for first IP — appropriate for Vercel/proxy deployments"
  - "Honeypot check before rate limiting — prevents wasting rate limit slots on bot submissions"
  - "Add RESEND_API_KEY placeholder to .env.local so build succeeds before real key is configured"

patterns-established:
  - "Rate limiter: module-level Map with { count, resetAt } entries, cleanup on each request"
  - "Honeypot: aria-hidden div with tabIndex=-1 input, silent 200 response for filled field"

requirements-completed: [CONTACT-01]

# Metrics
duration: 3min
completed: 2026-02-19
---

# Quick Task 15: Add Contact Form Backend with Resend Email

**Resend-powered /api/contact endpoint with in-memory rate limiting, honeypot spam protection, dual Dutch emails, and async form submission with loading/error states**

## Performance

- **Duration:** ~3 min (184s)
- **Started:** 2026-02-19T20:40:15Z
- **Completed:** 2026-02-19T20:43:19Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created `/api/contact` POST endpoint with Zod validation, honeypot check, IP-based rate limiting (3 req/15 min), notification email to business owner, and Dutch confirmation email to customer
- Added `RESEND_API_KEY` and `CONTACT_EMAIL` to env schema in `src/lib/env.ts` with sensible defaults
- Updated contact form with async `handleSubmit`, hidden honeypot field, `isSubmitting` loading state, and `apiError` display with red text

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Resend, add env vars, create /api/contact route** - `9a7bd27` (feat)
2. **Task 2: Update contact-section.tsx with honeypot, loading state, API submission** - `11c94bd` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/app/api/contact/route.ts` - POST endpoint with Zod validation, honeypot, rate limiter, dual Resend emails
- `src/lib/env.ts` - Added RESEND_API_KEY (required) and CONTACT_EMAIL (default: info@pure-blinds.nl)
- `src/components/home/contact-section.tsx` - Honeypot field, async submit with fetch, loading state, error display
- `package.json` + `package-lock.json` - Added resend dependency
- `.env.local` - Added placeholder RESEND_API_KEY and CONTACT_EMAIL for local builds

## Decisions Made
- Used `onboarding@resend.dev` as sender domain instead of blocking on domain verification — user can update after verifying pure-blinds.nl in Resend dashboard
- Rate limiter uses `x-forwarded-for` first IP as key, appropriate for Vercel/reverse proxy deployments
- Honeypot check happens before rate limit check to avoid wasting rate limit slots on bot submissions
- Added placeholder `RESEND_API_KEY=re_placeholder_replace_with_real_key` to `.env.local` so `npm run build` succeeds without a real key configured yet

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added placeholder RESEND_API_KEY to .env.local**
- **Found during:** Task 1 (build verification)
- **Issue:** `npm run build` failed with ZodError because RESEND_API_KEY was required but missing from .env.local — the local env file only had Shopify vars
- **Fix:** Added `RESEND_API_KEY=re_placeholder_replace_with_real_key` and `CONTACT_EMAIL=info@pure-blinds.nl` to `.env.local`; also updated `.env.example` with documentation (not committed — .env.example is gitignored)
- **Files modified:** `.env.local`
- **Verification:** `npm run build` passes after adding placeholder
- **Committed in:** `9a7bd27` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (blocking build issue)
**Impact on plan:** Necessary fix — build environment requires the env var to be present. Placeholder clearly named to prompt replacement.

## Issues Encountered
- Build failed on first attempt because `RESEND_API_KEY` is required in Zod schema but wasn't present in local `.env.local`. Resolved by adding a named placeholder that clearly indicates it needs to be replaced.

## User Setup Required

**External service (Resend) requires manual configuration before emails will work.**

Steps required:
1. Sign up at [resend.com](https://resend.com)
2. Create an API key in the Resend dashboard (API Keys section)
3. Replace `RESEND_API_KEY=re_placeholder_replace_with_real_key` in `.env.local` with your real key
4. Add `RESEND_API_KEY` and `CONTACT_EMAIL` to Vercel environment variables for production
5. Optionally: verify `pure-blinds.nl` domain in Resend dashboard (Domains section) and update the `from` address in `src/app/api/contact/route.ts` from `onboarding@resend.dev` to your verified domain

Until a real API key is set, form submissions will return a 500 error from Resend.

## Next Phase Readiness
- Contact form is fully functional end-to-end once a real RESEND_API_KEY is configured
- Rate limiting (3/15min per IP) and honeypot spam protection are active
- Both notification and confirmation emails implemented in Dutch

---
*Phase: 15-add-contact-form-backend-with-resend-ema*
*Completed: 2026-02-19*
