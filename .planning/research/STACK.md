# Stack Research: v1.1 - Multi-Page Website with SEO Foundation

**Domain:** E-commerce website expansion (SEO, content pages, contact forms)
**Milestone:** v1.1 (subsequent milestone, building on validated v1.0 stack)
**Researched:** 2026-02-01
**Confidence:** HIGH

## Executive Summary

For v1.1's multi-page website structure with SEO foundation, **leverage Next.js 15+ built-in features first**, then add minimal external packages only where necessary. Next.js 15+ App Router provides native support for metadata, sitemaps, robots.txt, and Open Graph images—no external SEO libraries needed. Add Resend for contact forms, schema-dts for type-safe structured data, and optionally @next/mdx for blog content (only if truly needed).

**Critical insight:** Avoid over-engineering. Next.js 15+ eliminated the need for packages like `next-seo` and `next-sitemap`. Use built-in capabilities, add libraries only for email sending and optional structured data typing.

## Existing v1.0 Stack (VALIDATED - DO NOT CHANGE)

From v1.0 research (2026-01-29), the following stack is already validated and in production:

| Technology | Version | Status |
|------------|---------|--------|
| Next.js | 16.1.6 (installed) | ✅ Production |
| React | 19.2.3 | ✅ Production |
| TypeScript | 5.x | ✅ Production |
| Tailwind CSS | 4.x | ✅ Production |
| Zustand | 5.0.10 | ✅ Production (cart state) |
| Zod | 4.3.6 | ✅ Production (validation) |
| @shopify/shopify-api | 12.3.0 | ✅ Production (Draft Orders) |
| Vitest | 4.0.18 | ✅ Dev/Test |

**Do NOT re-research or change these.** Focus ONLY on NEW capabilities for v1.1.

## v1.1 Stack Additions

### Built-in Next.js SEO Features (NO NEW PACKAGES)

| Feature | Implementation | Available Since | Why Built-in |
|---------|---------------|-----------------|--------------|
| Metadata API | `generateMetadata()` function | Next.js 13+ | Type-safe metadata (title, description, Open Graph, Twitter) without external libraries |
| Sitemap | `app/sitemap.ts` file | Next.js 13+ | Dynamic sitemap generation at `/sitemap.xml`, supports `generateSitemaps()` for 50k+ URLs |
| Robots.txt | `app/robots.ts` file | Next.js 13+ | Dynamic robots.txt at `/robots.txt`, per-bot rules, sitemap links, crawl delays |
| Open Graph Images | `opengraph-image.tsx` file | Next.js 13+ | Dynamic OG image generation using React components |
| JSON-LD | `<script type="application/ld+json">` | Next.js any | Structured data via script tags in layout/page components |
| Canonical URLs | `metadata.alternates.canonical` | Next.js 13+ | Prevents duplicate content, set per page or via root `metadataBase` |
| Viewport | `viewport` export | Next.js 14+ | Replaces deprecated `metadata.viewport` (removed in Next.js 14) |

**Confidence:** HIGH — Verified via [official Next.js documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

**Implementation example:**

```typescript
// app/page.tsx - Metadata API
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Custom Curtains & Flags',
    description: 'Dimension-based pricing for custom textiles',
    metadataBase: new URL('https://yoursite.com'),
    openGraph: {
      title: 'Custom Curtains & Flags',
      description: 'Dimension-based pricing for custom textiles',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
    },
    alternates: {
      canonical: 'https://yoursite.com',
    },
  }
}

// app/sitemap.ts - Sitemap generation
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://yoursite.com', lastModified: new Date(), priority: 1 },
    { url: 'https://yoursite.com/cart', lastModified: new Date(), priority: 0.8 },
    { url: 'https://yoursite.com/faq', lastModified: new Date(), priority: 0.5 },
  ]
}

// app/robots.ts - Robots.txt generation
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: 'https://yoursite.com/sitemap.xml',
  }
}
```

### Contact Form: Email Service (NEW PACKAGES REQUIRED)

| Package | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **Resend** | ^6.7.0 | Email delivery service | Modern developer-focused API, Next.js Server Actions native, 10-minute integration, free tier sufficient |
| **react-email** | ^5.2.5 (optional) | Email template components | Type-safe React-based templates with Tailwind support, pairs with Resend |

**Why Resend over alternatives:**
- **vs SendGrid:** Simpler API, better DX, modern Next.js integration (Server Actions), less complex pricing
- **vs Nodemailer:** No SMTP server management, higher deliverability, serverless-friendly (Vercel)
- **vs FormSubmit/Formspree:** Full control over email design, no vendor lock-in, professional branding

**Installation:**
```bash
npm install resend
npm install react-email  # Optional, for templated emails
```

**Confidence:** HIGH — Verified via [Resend Next.js docs](https://resend.com/nextjs) and [comparison research](https://dev.to/ethanleetech/5-best-email-services-for-nextjs-1fa2)

**Implementation pattern with Server Actions:**

```typescript
// app/actions/contact.ts
'use server'

import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const contactSchema = z.object({
  email: z.string().email(),
  message: z.string().min(10),
})

export async function sendContactEmail(formData: FormData) {
  const validated = contactSchema.parse({
    email: formData.get('email'),
    message: formData.get('message'),
  })

  const { data, error } = await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: 'support@yourdomain.com',
    subject: 'Contact Form Submission',
    replyTo: validated.email,
    text: validated.message,
  })

  if (error) throw error
  return { success: true }
}
```

### Structured Data Typing (OPTIONAL BUT RECOMMENDED)

| Package | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **schema-dts** | ^1.x | TypeScript types for Schema.org JSON-LD | Type-safe structured data (Product, Organization, FAQPage, etc.) |

**Not required** but highly recommended for avoiding typos in JSON-LD structured data.

**Installation:**
```bash
npm install -D schema-dts
```

**Usage:**
```typescript
import type { WithContext, Organization } from 'schema-dts'

const jsonLd: WithContext<Organization> = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Your Business',
  url: 'https://yoursite.com',
  // TypeScript autocomplete + validation
}
```

**Confidence:** HIGH — Verified via [schema-dts npm](https://www.npmjs.com/package/schema-dts) and [Next.js JSON-LD guide](https://nextjs.org/docs/app/guides/json-ld)

### Content/Blog System (ONLY IF NEEDED)

**CRITICAL:** For v1.1's simple content pages (homepage, FAQ, policies, thank you), **DO NOT use MDX**. Use plain TSX components.

**Use MDX only if:**
- You need markdown-based authoring workflow
- You want to mix markdown with interactive React components
- You have external content contributors who prefer markdown

**MDX packages (install ONLY if truly needed):**

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| @next/mdx | Match Next.js version (^16.1.6 for this project) | MDX support in App Router | Must match Next.js major version |
| @mdx-js/loader | Latest | MDX compilation | Required by @next/mdx |
| @mdx-js/react | Latest | React integration | Required by @next/mdx |
| @types/mdx | Latest | TypeScript support | Required by @next/mdx |
| gray-matter | ^4.x | Frontmatter parsing | @next/mdx doesn't support frontmatter by default |
| remark-gfm | Latest | GitHub Flavored Markdown | Only if you need tables, strikethrough, task lists |

**Installation (only if using MDX):**
```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react
npm install -D @types/mdx
npm install gray-matter  # If you need frontmatter
npm install remark-gfm   # If you need GFM features
```

**Configuration (`next.config.ts`):**
```typescript
import createMDX from '@next/mdx'

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
```

**Required file (`mdx-components.tsx` at project root):**
```typescript
import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components }
}
```

**Confidence:** HIGH — Verified via [Next.js MDX guide](https://nextjs.org/docs/app/guides/mdx)

**Recommendation for v1.1:** **Skip MDX**. Use TSX components for FAQ, policies, homepage. Add MDX later only if you launch a real blog with regular content updates.

### Styling Enhancement (OPTIONAL)

| Package | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tailwindcss/typography | ^0.5.x | Prose styling plugin | Long-form content styling (blog posts, policies, FAQ) |

**Note:** May need v1.x when released for Tailwind CSS 4. Check compatibility.

**Installation:**
```bash
npm install -D @tailwindcss/typography
```

**Usage in `tailwind.config.ts`:**
```typescript
import type { Config } from 'tailwindcss'

export default {
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config
```

**Then use in components:**
```tsx
<article className="prose lg:prose-xl">
  <h1>Your content</h1>
  <p>Styled automatically</p>
</article>
```

**Confidence:** MEDIUM — Tailwind CSS 4 compatibility needs verification (may need plugin update)

## Installation Summary

### Minimal v1.1 Setup (No Blog)

**Recommended for v1.1 milestone:**

```bash
# Email service (required for contact form)
npm install resend

# Optional: Email templates
npm install react-email

# Optional: Type-safe JSON-LD
npm install -D schema-dts

# Optional: Prose styling
npm install -D @tailwindcss/typography
```

**Total new production dependencies: 1-2** (Resend required, react-email optional)

### Full Setup (With MDX Blog - NOT RECOMMENDED FOR v1.1)

Only if you absolutely need MDX:

```bash
# Email service
npm install resend react-email

# MDX support
npm install @next/mdx @mdx-js/loader @mdx-js/react
npm install -D @types/mdx

# Frontmatter + enhanced markdown
npm install gray-matter remark-gfm

# Type-safe JSON-LD
npm install -D schema-dts

# Prose styling
npm install -D @tailwindcss/typography
```

**Not recommended.** Save MDX for future milestone when blog content is validated need.

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **next-seo** | Deprecated, Next.js 15+ native Metadata API is superior | Built-in `generateMetadata()` |
| **next-sitemap** | Not needed, Next.js 15+ has native `sitemap.ts` | Built-in `app/sitemap.ts` |
| **@vercel/og** | Complex setup, limited use cases for this project | Static OG images or built-in `opengraph-image.tsx` |
| **SendGrid** (for small sites) | Overkill for simple contact form, complex API, higher cost | Resend (simpler, modern, free tier) |
| **Nodemailer** | SMTP management overhead, deliverability issues, not serverless-friendly | Resend (managed service) |
| **Contentlayer** | Over-engineering for 4-5 static pages, adds build complexity | Plain TSX components |
| **Sanity/Strapi CMS** | Unnecessary for static content, adds hosting/maintenance burden | Filesystem-based content (TSX or MDX) |
| **MDX** (for v1.1) | Premature for unvalidated blog need, adds complexity | TSX components for static pages |

## Integration with Existing v1.0 Stack

### No Breaking Changes

All v1.1 additions are **additive only**, no changes to existing v1.0 functionality:

| v1.0 Feature | v1.1 Impact | Integration |
|-------------|-------------|-------------|
| Product page with pricing | ✅ No change | Add `generateMetadata()` for SEO |
| Cart overlay (Zustand) | ✅ No change | Works with new `/cart` page |
| Shopify checkout flow | ✅ No change | Add thank you page after redirect |
| API routes (/api/pricing, /api/checkout, /api/health) | ✅ No change | Continue using for existing functionality |
| Tailwind CSS styling | ✅ Enhanced | Add @tailwindcss/typography for content pages |
| Zod validation | ✅ Extended | Reuse for contact form validation |

### New Integration Points

1. **Metadata API** — Add `generateMetadata()` to all pages (existing + new)
2. **Sitemap** — Create `app/sitemap.ts` listing all routes
3. **Robots.txt** — Create `app/robots.ts` allowing all except `/api/`
4. **Contact Form** — New Server Action using existing Zod pattern + Resend
5. **JSON-LD** — Add structured data to homepage (Organization), product (Product), FAQ (FAQPage)
6. **Design System** — Extend Tailwind config with typography plugin for content pages

### File Structure Changes

```
app/
├── page.tsx                 # Homepage (NEW) + metadata
├── cart/
│   └── page.tsx            # Dedicated cart page (NEW, replaces overlay)
├── contact/
│   └── page.tsx            # Contact page (NEW) with form
├── faq/
│   └── page.tsx            # FAQ page (NEW)
├── blog/
│   ├── page.tsx            # Blog listing (NEW, optional)
│   └── [slug]/
│       └── page.tsx        # Blog post (NEW, optional)
├── policies/
│   ├── privacy/
│   │   └── page.tsx        # Privacy policy (NEW)
│   ├── terms/
│   │   └── page.tsx        # Terms (NEW)
│   ├── shipping/
│   │   └── page.tsx        # Shipping policy (NEW)
│   └── returns/
│       └── page.tsx        # Returns policy (NEW)
├── thank-you/
│   └── page.tsx            # Thank you page (NEW)
├── sitemap.ts              # Sitemap generation (NEW)
├── robots.ts               # Robots.txt generation (NEW)
├── actions/
│   └── contact.ts          # Contact form Server Action (NEW)
└── api/                     # Existing API routes (NO CHANGE)
    ├── pricing/
    ├── checkout/
    └── health/
```

**Key changes:**
- Add 9+ new page routes
- Add `sitemap.ts` and `robots.ts` at app root
- Add `actions/contact.ts` for email sending
- NO changes to existing `/api/` routes

## Critical Stack Decisions for v1.1

### Decision 1: MDX vs TSX for Content Pages

**Question:** Use MDX for FAQ, policies, and other content pages?

**Recommendation:** **Use TSX components**

**Rationale:**
- v1.1 has 9 content pages (homepage, /cart, /thank-you, FAQ, 4 policies, contact)
- All are static, rarely updated content
- MDX adds build complexity, bundle size, and requires configuration
- TSX provides full type safety, easier refactoring, simpler deployment
- Add MDX later only if blog becomes regular content stream

**When to reconsider:** If blog launches and gets 1+ posts/week, evaluate MDX in future milestone.

### Decision 2: Resend vs Other Email Services

**Question:** Which email service for contact form?

**Recommendation:** **Resend**

**Rationale:**
- Modern API designed for Next.js Server Actions
- Simple integration (10 minutes per docs)
- Free tier: 100 emails/day, 3,000/month (sufficient for contact form)
- Better DX than SendGrid (less configuration)
- More reliable than Nodemailer (no SMTP management)
- Vercel-optimized (serverless-friendly)

**Cost:** Free tier covers MVP. Paid: $20/month for 50k emails (only upgrade if contact form gets heavy usage).

### Decision 3: Static vs Dynamic OG Images

**Question:** Generate OG images dynamically or use static images?

**Recommendation:** **Start with static OG images**

**Rationale:**
- v1.1 has ~10 pages, all known at build time
- Create 1-2 static OG images in Figma/Canva
- Use `metadata.openGraph.images` to reference static files
- Add dynamic `opengraph-image.tsx` later only if product count grows (multi-product future)

**When to reconsider:** If launching 50+ products, dynamic OG image generation becomes worthwhile.

### Decision 4: Structured Data Scope

**Question:** Which Schema.org types to implement?

**Recommendation:** **3 schemas initially**

1. **Organization** (homepage) — Business info, logo, contact
2. **Product** (product page) — Product name, image, price, availability
3. **FAQPage** (FAQ page) — Q&A pairs for rich snippets

**Skip for v1.1:**
- BreadcrumbList (wait for multi-product navigation)
- Review/Rating (no reviews yet)
- BlogPosting (no blog yet)

**Implementation order:**
1. Organization (highest SEO value, easiest)
2. FAQPage (enables rich snippets in search)
3. Product (enables product rich snippets)

## Environment Variables

**New variables for v1.1:**

```bash
# Resend (for contact form)
RESEND_API_KEY=re_xxxxxxxxxxxx       # Private, server-only

# Optional: Contact form recipient
CONTACT_EMAIL=support@yourdomain.com  # Can hardcode in Server Action instead
```

**Existing v1.0 variables (no change):**
```bash
SHOPIFY_STORE_DOMAIN=yourstore.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxx
SHOPIFY_ADMIN_ACCESS_TOKEN=xxx
NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION=2025-10
```

**Security:**
- `RESEND_API_KEY` must be server-only (no `NEXT_PUBLIC_` prefix)
- Call Resend only from Server Actions or API Routes, never client components
- Add to Vercel environment variables (production, preview, development)

## Alternatives Considered

### Email Service Alternatives

| Service | Pros | Cons | Verdict |
|---------|------|------|---------|
| **Resend** | Modern API, Server Actions native, simple, free tier | Newer service (less track record) | ✅ Recommended |
| SendGrid | Established, reliable, high volume support | Complex API, expensive for small sites, overkill | ❌ Not for MVP |
| Nodemailer | Free, full control | SMTP management, deliverability issues, not serverless | ❌ Not for Vercel |
| FormSubmit | No code, free | No template control, vendor lock-in, not professional | ❌ Too basic |

### Content Management Alternatives

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **TSX components** | Type-safe, simple, no build config | Manual HTML/JSX authoring | ✅ Recommended for v1.1 |
| MDX | Markdown authoring, mix React components | Build complexity, bundle size, requires config | ⚠️ Wait for validated blog need |
| Contentlayer | Build-time validation, type generation | Overkill for 10 pages, adds dependency | ❌ Over-engineering |
| Headless CMS | Non-technical editing, preview, workflows | Hosting cost, maintenance, complexity | ❌ Not needed for static content |

### SEO Library Alternatives

| Tool | Status | Verdict |
|------|--------|---------|
| **Next.js built-in Metadata API** | ✅ Native, maintained, type-safe | ✅ Use this |
| next-seo | ⚠️ Deprecated (Next.js 13+ has native support) | ❌ Don't use |
| next-sitemap | ⚠️ Not needed (Next.js 13+ has native sitemap.ts) | ❌ Don't use |

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| Next.js | 16.1.6 (installed) | - | All built-in SEO features available |
| Resend | ^6.7.0 | Next.js 15+ | Server Actions support, latest release Jan 2026 |
| react-email | ^5.2.5 | React 19+ | Compatible with Next.js 15+, latest release Jan 2026 |
| @next/mdx | ^16.1.6 (if used) | Next.js 16.1.6 | Must match Next.js version exactly |
| schema-dts | ^1.x | TypeScript 5+ | Dev-only, no runtime dependency |
| @tailwindcss/typography | ^0.5.x | Tailwind CSS 3.x | May need v1.x for Tailwind 4 (verify) |

**Critical:** Match `@next/mdx` version to Next.js version (both should be 16.1.6 for this project).

## Performance Considerations

### SEO Features (Built-in)
- **Static generation:** Metadata, sitemap, robots.txt generated at build time (no runtime cost)
- **Edge-compatible:** All Next.js metadata features work with Edge Runtime
- **Caching:** Sitemap/robots cached by default unless using dynamic functions

### Email Service (Resend)
- **Server-side only:** Never call Resend from client components (API key exposure)
- **Timeout:** Set 5-10 second timeout for email sending
- **Error handling:** Don't block user flow if email fails (show success message, log error)

### Content Pages (TSX)
- **Static generation:** All content pages should use static generation (no data fetching)
- **Bundle size:** TSX pages smaller than MDX (no markdown runtime)
- **Performance:** TSX = instant build, MDX = compilation overhead

## Security Considerations

### Email (Resend)
- **API Key:** Store in environment variable, never commit to git
- **Rate limiting:** Implement rate limiting on contact form (prevent spam)
- **Validation:** Use Zod to validate email format and message length
- **Spam protection:** Consider honeypot field or hCaptcha for public form

### JSON-LD
- **XSS prevention:** Always sanitize JSON-LD: `.replace(/</g, '\\u003c')`
- **Trusted data only:** Only use trusted data sources (no user input in structured data)

### MDX (if used)
- **File source:** Only load MDX from trusted filesystem (never user uploads)
- **Component scope:** Whitelist allowed components in `mdx-components.tsx`

## Success Metrics for v1.1 Stack

| Metric | Target | Measurement |
|--------|--------|-------------|
| New production dependencies | ≤ 2 packages | Resend + optional react-email only |
| Build time increase | < 10 seconds | Compare v1.0 vs v1.1 Vercel builds |
| Bundle size increase | < 50KB | Client bundle analysis |
| Contact form email delivery | > 95% success rate | Resend dashboard analytics |
| SEO metadata coverage | 100% of pages | All pages have generateMetadata() |
| Structured data validation | 0 errors | Google Rich Results Test |

## Roadmap Implications

Based on this stack research, v1.1 roadmap should:

1. **Phase 1: SEO Foundation** — Implement built-in features (no packages)
   - Add `generateMetadata()` to existing pages
   - Create `sitemap.ts` and `robots.ts`
   - Set `metadataBase` in root layout

2. **Phase 2: Content Pages** — Use TSX components
   - Build homepage, FAQ, policies, thank you pages
   - Skip MDX setup (defer to future milestone)
   - Add @tailwindcss/typography for long-form styling

3. **Phase 3: Contact Form** — Add Resend
   - Install Resend package
   - Create Server Action with Zod validation
   - Build contact page with form

4. **Phase 4: Structured Data** — Add JSON-LD
   - Optionally install schema-dts for typing
   - Add Organization schema to homepage
   - Add FAQPage schema to FAQ
   - Add Product schema to product page

5. **Phase 5: Design Refresh** — Extend Tailwind
   - Customize Tailwind theme for brand
   - Build reusable components
   - Apply consistent styling across all pages

**No "MDX setup" phase needed for v1.1.** Defer blog infrastructure to v1.2 or later.

## Sources

### Official Documentation (HIGH Confidence)

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — Metadata, Open Graph, Twitter cards
- [Next.js Sitemap API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) — Sitemap generation
- [Next.js Robots API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) — Robots.txt generation
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) — Structured data implementation
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx) — MDX setup (optional)
- [Next.js Forms & Server Actions](https://nextjs.org/docs/app/guides/forms) — Form handling best practices
- [Resend Next.js Integration](https://resend.com/nextjs) — Official Resend setup guide

### Package Documentation (HIGH Confidence)

- [Resend npm](https://www.npmjs.com/package/resend) — Latest version 6.7.0 (Jan 2026)
- [react-email npm](https://www.npmjs.com/package/react-email) — Latest version 5.2.5 (Jan 2026)
- [schema-dts npm](https://www.npmjs.com/package/schema-dts) — TypeScript types for Schema.org
- [@next/mdx npm](https://www.npmjs.com/package/@next/mdx) — Official MDX plugin
- [gray-matter npm](https://www.npmjs.com/package/gray-matter) — Frontmatter parser

### Community Best Practices (MEDIUM Confidence)

- [Next.js 15 SEO Best Practices 2026](https://www.digitalapplied.com/blog/nextjs-seo-guide) — Comprehensive SEO guide
- [Next.js SEO Complete Guide](https://www.adeelhere.com/blog/2025-12-09-complete-nextjs-seo-guide-from-zero-to-hero) — Metadata, canonical URLs, viewport
- [Resend vs SendGrid vs Nodemailer Comparison](https://dev.to/ethanleetech/5-best-email-services-for-nextjs-1fa2) — Email service comparison for Next.js
- [Next.js Server Actions Best Practices 2026](https://dev.to/marufrahmanlive/nextjs-server-actions-complete-guide-with-examples-for-2026-2do0) — Form handling patterns
- [MDX with Next.js Best Practices](https://staticmania.com/blog/markdown-and-mdx-in-next.js-a-powerful-combination-for-content-management) — MDX setup guide
- [Next.js Sitemap Built-in vs next-sitemap](https://techolyze.com/open/blog/nextjs-15-sitemap-guide-built-in-vs-xml/) — Native sitemap comparison
- [Schema.org with Next.js](https://mikebifulco.com/posts/structured-data-json-ld-for-next-js-sites) — JSON-LD implementation guide

---

**Research completed:** 2026-02-01
**Milestone:** v1.1 - Multi-page website with SEO foundation
**Stack focus:** SEO (built-in Next.js features), contact forms (Resend), optional content (MDX), structured data (schema-dts)
**Recommendation:** Minimal new dependencies (1-2 packages), leverage Next.js built-in capabilities, defer MDX to future milestone
