---
phase: 15-add-contact-form-backend-with-resend-ema
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/env.ts
  - src/app/api/contact/route.ts
  - src/components/home/contact-section.tsx
  - package.json
autonomous: true
requirements: [CONTACT-01]
user_setup:
  - service: resend
    why: "Transactional email delivery for contact form"
    env_vars:
      - name: RESEND_API_KEY
        source: "Resend Dashboard (resend.com) -> API Keys -> Create API Key"
      - name: CONTACT_EMAIL
        source: "Business owner email address to receive contact form submissions (e.g. info@pure-blinds.nl)"
    dashboard_config:
      - task: "Verify sending domain (pure-blinds.nl) or use Resend's onboarding domain for testing"
        location: "Resend Dashboard -> Domains -> Add Domain"

must_haves:
  truths:
    - "Contact form submits data to /api/contact and shows success state"
    - "Business owner receives email notification with form data"
    - "Customer receives Dutch confirmation email"
    - "Bot submissions with filled honeypot are silently rejected"
    - "Rapid repeat submissions from same IP are rate limited"
    - "Form shows loading state during submission and error messages on failure"
  artifacts:
    - path: "src/app/api/contact/route.ts"
      provides: "Contact form POST endpoint with validation, honeypot, rate limiting, Resend emails"
      exports: ["POST"]
    - path: "src/lib/env.ts"
      provides: "RESEND_API_KEY and CONTACT_EMAIL env validation"
      contains: "RESEND_API_KEY"
    - path: "src/components/home/contact-section.tsx"
      provides: "Updated contact form with honeypot, loading state, API submission, error handling"
      contains: "honeypot"
  key_links:
    - from: "src/components/home/contact-section.tsx"
      to: "/api/contact"
      via: "fetch POST in handleSubmit"
      pattern: "fetch.*api/contact"
    - from: "src/app/api/contact/route.ts"
      to: "resend"
      via: "Resend SDK send()"
      pattern: "resend\\.emails\\.send"
---

<objective>
Add a working contact form backend: install Resend, create /api/contact API route with server-side validation, honeypot spam protection, in-memory rate limiting, and dual email sending (notification to owner + confirmation to customer in Dutch). Update the existing contact-section.tsx to submit to the API with honeypot field, loading state, and error handling.

Purpose: Turn the client-only contact form into a fully functional form that delivers emails.
Output: Working contact form end-to-end, rate-limited and spam-protected.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/env.ts
@src/app/api/contact/route.ts
@src/app/api/pricing/route.ts
@src/app/api/checkout/route.ts
@src/components/home/contact-section.tsx
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Resend, add env vars, create /api/contact route</name>
  <files>
    package.json
    src/lib/env.ts
    src/app/api/contact/route.ts
  </files>
  <action>
1. Run `npm install resend` to add the Resend SDK.

2. Update `src/lib/env.ts` to add two new env vars to the Zod schema:
   - `RESEND_API_KEY`: z.string().min(1, "RESEND_API_KEY is required") -- required for email sending
   - `CONTACT_EMAIL`: z.string().email().default("info@pure-blinds.nl") -- optional with sensible default
   Keep the existing `typeof window === "undefined"` guard pattern exactly as-is. Add the new fields alongside the existing SHOPIFY fields in `envSchema`.

3. Create `src/app/api/contact/route.ts` with a POST handler. Follow the same pattern as `src/app/api/pricing/route.ts` and `src/app/api/checkout/route.ts` (try/catch, NextResponse.json, structured error responses).

   The route must:

   a) **Parse and validate** the JSON body using Zod inline (no separate file needed):
      - `name`: string, min 1, max 100
      - `email`: string, email format
      - `phone`: string, optional
      - `message`: string, min 1, max 5000
      - `honeypot`: string, optional (the trap field)
      Return 400 with validation errors if invalid.

   b) **Honeypot check**: If `honeypot` field is non-empty, return 200 with `{ success: true }` (silent rejection -- do NOT return an error, bots should think it worked). Do this BEFORE rate limiting to avoid wasting rate limit slots on bots.

   c) **In-memory rate limiter**: Use a module-level `Map<string, { count: number; resetAt: number }>`. Key by IP from `request.headers.get("x-forwarded-for")` (first IP if comma-separated) or fallback to `"unknown"`. Allow 3 submissions per IP per 15 minutes. On each request, check if entry exists and is not expired; if expired, reset. If count >= 3 and not expired, return 429 with `{ error: "Te veel verzoeken. Probeer het later opnieuw." }`. Clean up expired entries on each request (iterate map, delete expired -- keeps memory bounded).

   d) **Send notification email** to business owner using Resend:
      ```typescript
      import { Resend } from "resend";
      import env from "@/lib/env";
      const resend = new Resend(env.RESEND_API_KEY);
      ```
      Email to `env.CONTACT_EMAIL`, from `"Pure Blinds Website <onboarding@resend.dev>"` (use Resend's default sender for now; user can update after domain verification), subject: `Nieuw contactformulier bericht van ${name}`.
      Body as HTML with simple styling -- a heading, then each field (Naam, E-mail, Telefoon, Bericht) in a clean layout. Keep it minimal. All Dutch labels.

   e) **Send confirmation email** to customer:
      To the submitted email address, from same sender, subject: `"We ontvingen uw bericht - Pure Blinds"`.
      Body: Simple Dutch message confirming receipt. Something like: "Beste {name}, Bedankt voor uw bericht. We hebben uw aanvraag ontvangen en nemen zo snel mogelijk contact met u op. Met vriendelijke groet, Pure Blinds". Keep it minimal HTML.

   f) **Return** `{ success: true }` with 200 status on success. If Resend throws, catch and return 500 with `{ error: "Er is iets misgegaan bij het versturen. Probeer het later opnieuw." }`.

   g) Add `console.error("[contact]", error)` in the catch block, matching the pattern from checkout/route.ts.
  </action>
  <verify>
    - `npm run build` succeeds with no TypeScript errors
    - `src/app/api/contact/route.ts` exists and exports POST
    - `src/lib/env.ts` includes RESEND_API_KEY and CONTACT_EMAIL in the schema
    - `npm run lint` passes
  </verify>
  <done>
    /api/contact POST endpoint exists with Zod validation, honeypot check, rate limiting (3/15min per IP), notification email to owner, confirmation email to customer, all error responses in Dutch.
  </done>
</task>

<task type="auto">
  <name>Task 2: Update contact-section.tsx with honeypot, loading state, and API submission</name>
  <files>
    src/components/home/contact-section.tsx
  </files>
  <action>
1. Add a `honeypot` field to the `formData` state, initialized to empty string `""`.

2. Add a hidden honeypot input field in the form. Place it BEFORE the name field. Use an `aria-hidden="true"` div with `className="absolute opacity-0 h-0 w-0 overflow-hidden"` (NOT `display:none` -- screen readers and some bots detect that). Inside, an input with `name="honeypot"`, `tabIndex={-1}`, `autoComplete="off"`, `value={formData.honeypot}`, `onChange={handleChange}`. Label it something attractive to bots like "Website" or "Company".

3. Add `isSubmitting` state (boolean, default false) and `apiError` state (string, default "").

4. Update `handleSubmit` to be async:
   - Keep the existing client-side validation exactly as-is (name, email, message checks).
   - After validation passes, set `isSubmitting` to `true` and clear `apiError`.
   - Make a `fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) })` call.
   - If response is not ok:
     - If status 429: set `apiError` to "Te veel verzoeken. Probeer het later opnieuw."
     - Otherwise: parse the JSON and use `data.error` if available, or a generic "Er is iets misgegaan. Probeer het later opnieuw."
     - Set `isSubmitting` to `false` and return (do NOT set `submitted`).
   - If response is ok: set `submitted` to `true`.
   - Wrap the entire fetch in try/catch. In catch, set `apiError` to "Er is iets misgegaan. Probeer het later opnieuw." and set `isSubmitting` to `false`.

5. Show `apiError` if it exists: Add a `<p>` with red text above or below the submit button (before the button), similar styling to field errors: `className="text-xs text-red-500"`.

6. Update the submit button:
   - Add `disabled={isSubmitting}` attribute.
   - When `isSubmitting` is true, change button text to "Versturen..." and add `className` with `opacity-50 cursor-not-allowed` appended.
   - When not submitting, keep the original text "Verstuur bericht".
  </action>
  <verify>
    - `npm run build` succeeds
    - `npm run lint` passes
    - The form HTML includes a visually-hidden honeypot input
    - The handleSubmit function contains `fetch("/api/contact"`
    - Button has disabled state and loading text
  </verify>
  <done>
    Contact form submits to /api/contact with all form data including honeypot. Shows loading state ("Versturen...") during submission, displays API error messages in red, and shows success state on successful submission. Honeypot field is visually hidden but present in DOM.
  </done>
</task>

</tasks>

<verification>
- `npm run build` completes without errors
- `npm run lint` passes
- `npm run test` passes (no existing tests broken)
- Manual test: With valid RESEND_API_KEY set, submitting the form at /#contact sends emails and shows success
- Manual test: Submitting 4+ times rapidly from same IP returns rate limit error
- Manual test: Form with filled honeypot returns success silently (no email sent)
</verification>

<success_criteria>
- Contact form at /#contact submits to /api/contact and receives JSON response
- Honeypot field present in form, visually hidden, silently rejects bots
- Rate limiter blocks >3 submissions per IP per 15 minutes with Dutch error message
- Business owner receives notification email with all form fields
- Customer receives Dutch confirmation email
- Form shows "Versturen..." loading state and disables button during submission
- API errors display in red text near the submit button
- Build and lint pass cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/15-add-contact-form-backend-with-resend-ema/15-SUMMARY.md`
</output>
