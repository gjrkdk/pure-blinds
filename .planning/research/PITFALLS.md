# Pitfalls Research

**Domain:** Dutch content & SEO for Next.js 15 App Router ecommerce webshop
**Researched:** 2026-02-14
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Removing Product Categories Without 301 Redirects

**What goes wrong:**
When removing product categories (venetian-blinds, textiles) from the live site, all existing URLs become 404s. This causes:
- Loss of search engine rankings for those category pages
- Broken links from external sites (backlinks)
- Loss of accumulated link equity and authority
- Poor user experience for visitors using bookmarked URLs or coming from search results
- Google may interpret this as site quality issues if many pages suddenly return 404

**Why it happens:**
Developers focus on removing the code/routes but forget that these URLs exist in:
- Google's search index
- External backlinks from other websites
- User bookmarks
- Internal links from blog posts or content pages
- Sitemap files that haven't been updated

**How to avoid:**
1. **Audit before deletion:** Identify all URLs that will be affected (use Google Search Console to find indexed pages)
2. **Create 301 redirect map:** For each removed category, determine the most relevant replacement:
   - `/venetian-blinds` → `/roller-blinds` (main remaining category)
   - `/venetian-blinds/product-x` → `/roller-blinds/similar-product` OR `/roller-blinds` if no similar product exists
   - `/textiles` → `/roller-blinds` (main category) or homepage if no logical match
3. **Implement redirects in next.config.js:**
   ```javascript
   async redirects() {
     return [
       {
         source: '/venetian-blinds/:path*',
         destination: '/roller-blinds',
         permanent: true, // 301 redirect
       },
     ]
   }
   ```
4. **DO NOT redirect everything to homepage** - Google treats this as a soft 404 and may deindex pages anyway
5. **Update sitemap.xml** immediately - remove deleted URLs from sitemap to preserve crawl budget
6. **Update internal links** in any static content, blog posts, or footer links

**Warning signs:**
- Sudden drop in organic traffic after category removal
- Google Search Console shows spike in 404 errors
- Crawl budget wasted on removed pages
- Loss of rankings for keywords that used to rank via removed categories

**Phase to address:**
Phase 1 (Category Cleanup & Route Restructuring) - must be first phase before any other changes

---

### Pitfall 2: Metadata Streaming Breaking SEO for Social Media Bots

**What goes wrong:**
Next.js 15 introduced metadata streaming where `generateMetadata` resolves after initial HTML is sent. For JavaScript-capable bots (like Googlebot), metadata appears in the `<body>` tag after streaming. However:
- Facebook's crawler (`facebookexternalhit`) is HTML-limited and cannot execute JavaScript
- LinkedIn, Twitter/X, and WhatsApp bots may not wait for streamed metadata
- Open Graph tags end up in `<body>` instead of `<head>` for these bots
- Result: broken preview cards when sharing on social media, missing product images, wrong titles

**Why it happens:**
- Using `generateMetadata` with database calls or external API fetches creates async metadata
- Next.js streams this metadata to improve TTFB, but not all bots support this
- The default behavior prioritizes performance over compatibility with HTML-only bots

**How to avoid:**
1. **For critical pages (homepage, main product categories), use static metadata object instead of `generateMetadata`:**
   ```typescript
   export const metadata: Metadata = {
     title: 'Rolgordijnen op Maat | Pure Blinds',
     description: '...',
     openGraph: {
       title: 'Rolgordijnen op Maat | Pure Blinds',
       images: [{ url: '/og-image.jpg' }],
       locale: 'nl_NL', // Note: underscore, not hyphen
     },
   }
   ```

2. **If you must use `generateMetadata`, add 'use cache' directive for external data:**
   ```typescript
   export async function generateMetadata() {
     'use cache'
     const data = await fetch('...')
     return { title: data.title }
   }
   ```

3. **Configure `htmlLimitedBots` in next.config.js to block streaming for social bots:**
   ```javascript
   module.exports = {
     htmlLimitedBots: /(facebookexternalhit|LinkedInBot|Twitterbot|WhatsApp)/,
   }
   ```

4. **Test with social media preview tools:**
   - Facebook Sharing Debugger
   - LinkedIn Post Inspector
   - Twitter Card Validator

**Warning signs:**
- Social media share previews show generic/missing images
- Open Graph meta tags appear in `<body>` when viewing page source
- `generateMetadata` appears in server component trace in devtools

**Phase to address:**
Phase 2 (Dutch Content & Metadata) - when implementing all meta tags and Open Graph

---

### Pitfall 3: Dutch Language Translation Quality Destroying Trust

**What goes wrong:**
Using automatic translation (Google Translate, ChatGPT without review) for Dutch content results in:
- Unnatural phrasing that native speakers immediately recognize as machine-translated
- Grammar errors (Dutch has gendered articles: de/het)
- Wrong terminology for window blinds industry (rolgordijn vs rolgordijnen, jaloezie vs venetiaanse jaloezie)
- Formal vs informal Dutch mismatch (u vs jij/je) - critical for ecommerce trust
- Loss of credibility and perceived professionalism
- Google penalizes low-quality content with poor grammar

Studies show 90%+ of Dutch searches are in Dutch language, but poor Dutch is worse than good English.

**Why it happens:**
- Developers assume automated translation is "good enough" for MVP
- No budget allocated for native Dutch speaker review
- Underestimating how critical language quality is for trust in ecommerce
- Not understanding Dutch grammar complexity (compound words, de/het articles)

**How to avoid:**
1. **Never use raw machine translation** - use it only as a draft, then:
   - Hire native Dutch speaker (preferably from Netherlands, not Belgium - different terminology)
   - Use professional translation service specialized in ecommerce
   - Get industry-specific review for technical terms (rolgordijn, screentype, etc.)

2. **Decide tone early:** Dutch ecommerce typically uses informal "je/jij" for B2C, but confirm with competitor analysis

3. **Create terminology glossary before translation:**
   - Roller blind = rolgordijn (singular) / rolgordijnen (plural)
   - Custom-made = op maat
   - Width = breedte
   - Height = hoogte
   - Fabric = stof OR doek (different contexts)

4. **Use Context7 or competitor websites for reference:**
   - veneta.com
   - raamdecoratie.com
   - raamdecoratievantuiss.nl
   - 123jaloezie.nl

5. **Test with native speakers** before launch - not just translation accuracy but natural feel

**Warning signs:**
- High bounce rate from Netherlands traffic
- Low time-on-site for Dutch pages vs English
- Direct feedback from users about "strange Dutch"
- De/het article errors (very obvious to native speakers)

**Phase to address:**
Phase 2 (Dutch Content & Metadata) - content quality is non-negotiable before launch

---

### Pitfall 4: Open Graph Locale Format Breaking Social Sharing

**What goes wrong:**
Using wrong locale format in Open Graph tags causes:
- Facebook/LinkedIn ignoring locale metadata
- Wrong language shown in social previews
- Inconsistent metadata across platforms
- May default to English interpretation even for Dutch content

Common mistakes:
- Using `nl-NL` (hyphen) instead of `nl_NL` (underscore)
- Using `nl` without country code
- Using `<meta name="og:locale">` instead of `<meta property="og:locale">`

**Why it happens:**
- Open Graph protocol requires underscore format (`en_US`, `nl_NL`), unlike hreflang which uses hyphen
- Next.js metadata API doesn't validate locale format
- Confusion between hreflang (`nl-NL`) and Open Graph (`nl_NL`) standards

**How to avoid:**
```typescript
export const metadata: Metadata = {
  openGraph: {
    locale: 'nl_NL', // CORRECT - underscore
    // NOT 'nl-NL' with hyphen
    title: 'Dutch title',
    description: 'Dutch description',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}
```

**Validation checklist:**
- [ ] Open Graph: `nl_NL` (underscore)
- [ ] Hreflang: `nl-NL` (hyphen)
- [ ] HTML lang attribute: `nl-NL` (hyphen)
- [ ] Property attribute: `<meta property="og:locale">` not `<meta name="og:locale">`

**Warning signs:**
- Facebook Sharing Debugger shows warnings about locale
- Social previews appear in wrong language context

**Phase to address:**
Phase 2 (Dutch Content & Metadata) - when implementing Open Graph tags

---

### Pitfall 5: Structured Data (JSON-LD) XSS Vulnerability

**What goes wrong:**
When generating structured data (Product schema, Organization schema) with user-generated content or external data, directly using `JSON.stringify()` without sanitization creates XSS vulnerability:
```typescript
// DANGEROUS - allows script injection
<script type="application/ld+json">
  {JSON.stringify(productData)}
</script>
```

If `productData.name` contains `</script><script>alert('XSS')</script>`, it breaks out of the JSON-LD script tag.

**Why it happens:**
- Developers assume JSON.stringify is safe (it's not for HTML context)
- Not aware that `<` character needs to be escaped as `\u003c` in JSON within HTML
- Copy-pasting examples without understanding security implications

**How to avoid:**
1. **Replace dangerous characters:**
   ```typescript
   const jsonLd = JSON.stringify(productData).replace(/</g, '\\u003c')
   ```

2. **Use Next.js recommended approach from official docs:**
   ```typescript
   export default function Page() {
     const jsonLd = {
       '@context': 'https://schema.org',
       '@type': 'Product',
       name: 'Rolgordijn op Maat',
       description: 'Custom roller blinds',
     }

     return (
       <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{
           __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
         }}
       />
     )
   }
   ```

3. **Or use community package `serialize-javascript`** for production safety

4. **Never inject raw user input** into structured data without validation

**Warning signs:**
- Security audit flags dangerouslySetInnerHTML usage
- JSON-LD contains unescaped `<` characters
- Using product descriptions directly in structured data without sanitization

**Phase to address:**
Phase 3 (Structured Data & Rich Snippets) - when implementing Schema.org markup

---

### Pitfall 6: Hreflang Tag Mistakes for Single-Country Targeting

**What goes wrong:**
When targeting Netherlands only, developers make these hreflang mistakes:
- Adding hreflang tags when only one language/country is served (unnecessary, but harmless)
- Missing self-referencing hreflang tag if using hreflang at all
- Conflicting signals: hreflang says `nl-NL` but content/IP targeting says something else
- Using wrong country code format (case-sensitive: `nl-NL` not `nl-nl`)

For Netherlands-only site with Dutch language, hreflang is actually **not needed**, but if added incorrectly it can cause problems.

**Why it happens:**
- SEO tutorials focus on multi-language sites, developers add hreflang "to be safe"
- Not understanding that hreflang is for sites serving different languages/regions
- Copy-pasting without understanding when hreflang applies

**How to avoid:**
1. **For Netherlands-only site:** Don't use hreflang at all - it's not needed and adds complexity

2. **If planning future expansion (Belgium, Flanders):** Then implement hreflang correctly from start:
   ```typescript
   alternates: {
     canonical: 'https://pureblinds.nl',
     languages: {
       'nl-NL': 'https://pureblinds.nl', // Self-reference required
       // Future: 'nl-BE': 'https://pureblinds.be',
     },
   }
   ```

3. **Must include self-referencing tag** - every page needs hreflang pointing to itself

4. **Ensure consistency:**
   - HTML lang attribute: `<html lang="nl-NL">`
   - Open Graph locale: `nl_NL` (underscore)
   - Hreflang: `nl-NL` (hyphen)
   - Geo targeting in Google Search Console: Netherlands

**Warning signs:**
- Google Search Console shows hreflang errors
- Missing return tags warning
- Conflicting signals between hreflang and content language

**Phase to address:**
Phase 2 (Dutch Content & Metadata) - decide on hreflang strategy early

---

### Pitfall 7: Sitemap Contains Removed Routes and Redirected URLs

**What goes wrong:**
After removing categories, if sitemap.xml still includes:
- Removed category URLs (`/venetian-blinds`, `/textiles`)
- URLs that 301 redirect to other pages
- Duplicate URLs (both old and new)

This wastes crawl budget and confuses Google:
- Googlebot crawls removed URLs from sitemap
- Sees 301 redirects and has to follow them
- Crawl budget exhausted on redirects instead of new content
- Google may temporarily deindex pages if sitemap quality is poor

**Why it happens:**
- Static sitemap.xml file not updated when routes change
- Using `next-sitemap` package without configuring exclusions
- Not regenerating sitemap after code changes
- Forgetting sitemap exists

**How to avoid:**
1. **Use Next.js 15 App Router dynamic sitemap:**
   ```typescript
   // app/sitemap.ts
   import { MetadataRoute } from 'next'

   export default function sitemap(): MetadataRoute.Sitemap {
     return [
       {
         url: 'https://pureblinds.nl',
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 1,
       },
       {
         url: 'https://pureblinds.nl/roller-blinds',
         lastModified: new Date(),
         changeFrequency: 'weekly',
         priority: 0.8,
       },
       // Generate from database for products
     ]
   }
   ```

2. **Explicitly exclude removed routes:**
   - No venetian-blinds
   - No textiles
   - Only include active categories

3. **Remove URLs with 301 redirects from sitemap** - sitemap should only contain final destinations

4. **Set proper priorities:**
   - Homepage: 1.0
   - Main categories: 0.8
   - Product pages: 0.6
   - Static pages: 0.5

5. **Submit updated sitemap to Google Search Console** immediately after category removal

**Warning signs:**
- Google Search Console shows "Submitted URL returns 3XX redirect"
- Crawl stats show high redirect rate
- Sitemap contains more URLs than actually exist on site

**Phase to address:**
Phase 1 (Category Cleanup & Route Restructuring) - update sitemap same time as implementing redirects

---

### Pitfall 8: Robots.txt Blocking Important Pages After Restructuring

**What goes wrong:**
After removing categories and restructuring routes:
- Old robots.txt rules may block new routes
- Disallow rules for `/venetian-blinds` still present but redirects go to `/roller-blinds` which gets blocked
- Accidentally blocking `/roller-blinds` because of wildcard rules
- Dynamic robots.txt not updated to reflect new site structure

**Why it happens:**
- Static robots.txt file never updated
- Copy-pasted rules from old site structure
- Not testing robots.txt after route changes
- Using overly broad Disallow rules

**How to avoid:**
1. **Use Next.js 15 App Router dynamic robots.txt:**
   ```typescript
   // app/robots.ts
   import { MetadataRoute } from 'next'

   export default function robots(): MetadataRoute.Robots {
     return {
       rules: {
         userAgent: '*',
         allow: '/',
         disallow: ['/admin', '/api'],
       },
       sitemap: 'https://pureblinds.nl/sitemap.xml',
     }
   }
   ```

2. **Remove any Disallow rules for old categories** - they're already 301 redirected

3. **Test with Google's robots.txt Tester** in Search Console

4. **Keep it simple:** Only disallow admin pages and API routes, allow everything else

5. **Include sitemap reference** in robots.txt

**Warning signs:**
- Google Search Console shows "Blocked by robots.txt" errors
- New pages not getting indexed despite proper metadata
- Crawl stats show blocked URLs

**Phase to address:**
Phase 4 (Sitemap & Robots.txt) - after all route changes are complete

---

### Pitfall 9: Missing or Duplicate Meta Descriptions for Dutch Pages

**What goes wrong:**
Meta descriptions issues specific to Dutch content:
- Copying English meta descriptions and forgetting to translate
- Same meta description on multiple pages (category vs homepage)
- Meta descriptions in English while page content is Dutch (language mismatch)
- Meta descriptions too short (<120 chars) or too long (>160 chars)
- Generic descriptions like "Koop rolgordijnen" instead of unique value propositions
- Duplicate meta descriptions across all product pages

Google may ignore your meta description and generate one from page content, reducing CTR.

**Why it happens:**
- Developers set default meta description in root layout, never override in pages
- Forgetting to translate metadata when translating content
- Not understanding that each page needs unique meta description
- Using same template for all products without customization

**How to avoid:**
1. **Create unique meta descriptions for each page type:**
   ```typescript
   // app/page.tsx (Homepage)
   export const metadata = {
     title: 'Rolgordijnen op Maat | Pure Blinds',
     description: 'Bestel rolgordijnen op maat. Gratis thuislevering, 5 jaar garantie. Nederlandse kwaliteit vanaf €X. Configureer nu online.',
   }

   // app/roller-blinds/page.tsx
   export const metadata = {
     title: 'Rolgordijnen Collectie | Pure Blinds',
     description: 'Ontdek onze rolgordijnen collectie. Verschillende stoffen, kleuren en maten. Eenvoudig online configureren en bestellen.',
   }
   ```

2. **For product pages, use generateMetadata with product data:**
   ```typescript
   export async function generateMetadata({ params }) {
     const product = await getProduct(params.id)
     return {
       description: `${product.name} - ${product.fabric} - Op maat gemaakt - Vanaf €${product.price}. Bestel nu!`
     }
   }
   ```

3. **Follow Dutch SEO best practices:**
   - Include target keyword naturally
   - Add unique selling points (gratis levering, garantie)
   - Use action words (bestel, ontdek, configureer)
   - Keep 150-160 characters (Dutch words are often longer than English)

4. **Audit all meta descriptions before launch:**
   - No duplicates
   - All in Dutch
   - All within character limits
   - Include USPs and call-to-action

**Warning signs:**
- Google Search Console shows "Duplicate meta descriptions"
- Low CTR from search results
- Google rewrites your meta descriptions (shown in search results differs from your code)

**Phase to address:**
Phase 2 (Dutch Content & Metadata) - part of content translation effort

---

### Pitfall 10: Next.js Metadata API Duplication Issues

**What goes wrong:**
In Next.js 15 App Router, there are known issues with metadata duplication:
- `generateMetadata` sometimes injects tags twice in `<head>`
- Metadata defined in both layout.js and page.js can conflict
- File-based metadata (opengraph-image.tsx) overrides metadata object without warning
- Title templates don't apply correctly, causing duplicate titles

Example bug: metadata tags appear both in `<head>` and duplicated inside RSC payload.

**Why it happens:**
- Using both `metadata` object AND `generateMetadata` function in same file (not allowed)
- Not understanding metadata merging/overwriting rules
- File-based metadata taking priority without realizing it
- Bug in Next.js 15.x App Router metadata handling (verified in GitHub issues)

**How to avoid:**
1. **Never export both `metadata` object and `generateMetadata` function from same segment:**
   ```typescript
   // WRONG - causes errors
   export const metadata = { title: 'Test' }
   export async function generateMetadata() { return { title: 'Test' } }
   ```

2. **Understand metadata merging:**
   - Child segments **replace** parent fields (not merge)
   - `openGraph` object in child completely replaces parent `openGraph`
   - To extend parent, use `parent` parameter:
   ```typescript
   export async function generateMetadata({ params }, parent) {
     const previousImages = (await parent).openGraph?.images || []
     return {
       openGraph: {
         images: ['/new-image.jpg', ...previousImages],
       },
     }
   }
   ```

3. **File-based metadata has highest priority:**
   - If you have `opengraph-image.tsx`, it overrides `metadata.openGraph.images`
   - Know which approach you're using and stick to it

4. **Use title templates correctly:**
   - Define `title.template` in layout
   - Define `title.default` when using template
   - Child pages set simple title string

5. **Test metadata output:**
   - View page source and check `<head>` section
   - Verify no duplicate meta tags
   - Use React DevTools to check for hydration issues

**Warning signs:**
- Duplicate `<meta>` tags in page source
- Title shows template literally (e.g., "%s | Site Name")
- Hydration errors in console
- Metadata appearing in `<body>` instead of `<head>`

**Phase to address:**
Phase 2 (Dutch Content & Metadata) - when implementing metadata system

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using English meta descriptions temporarily | Faster MVP launch | Low CTR from Dutch searches, unprofessional appearance | Only for initial testing, max 1 week |
| Machine-translated Dutch without review | Saves translation budget | Destroys trust, high bounce rate, brand damage | Never acceptable for ecommerce |
| Redirecting all removed URLs to homepage | Quick implementation | Google treats as soft 404, loses link equity | Never - always redirect to relevant pages |
| Static sitemap.xml instead of dynamic | Simpler setup | Outdated sitemap after changes, wasted crawl budget | Only if site structure never changes (rare) |
| Skipping Open Graph images for product pages | Faster development | Poor social sharing, lost traffic from social media | Never for main pages; acceptable for legal/policy pages |
| Using default metadata from layout everywhere | No per-page configuration needed | Duplicate meta descriptions, poor SEO | Only during initial development, never for production |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google Search Console | Not updating geo-targeting after adding Dutch content | Set target country to Netherlands in Search Console settings |
| Facebook Sharing Debugger | Not testing OG tags before launch | Test every page type (homepage, category, product) with debugger, clear cache if needed |
| Next.js redirects | Using redirect() function instead of next.config.js for removed routes | Use next.config.js redirects for permanent route changes, they're evaluated before rendering |
| Sitemap submission | Submitting sitemap once and forgetting | Resubmit to GSC after any major changes (category removal, new products) |
| Structured data | Adding multiple conflicting Product schemas | One Product schema per product page, validate with Rich Results Test |
| Translation services | Not providing context/glossary to translators | Create terminology list with competitor references before translation |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Fetching metadata from database on every request | Slow TTFB, metadata streaming issues | Use 'use cache' directive or static metadata for non-dynamic pages | First user visit, impacts all bots |
| Large Open Graph images (>1MB) | Slow social media preview generation, timeouts | Optimize OG images to ~100-200KB, 1200x630px | When sharing on social media |
| Redirect chains (old URL → temp URL → final URL) | Slow page loads, potential redirect loops | Audit redirects, always redirect directly to final destination | Immediately, affects every redirect |
| Not removing old URLs from sitemap | Wasted crawl budget, slower indexing of new content | Dynamic sitemap that only includes active pages | As site grows, at ~100+ removed pages |
| Generating sitemap with 1000+ products synchronously | Timeout on sitemap.xml request | Use generateSitemaps for large sites, split into multiple sitemaps | At ~500+ products |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Using unsanitized JSON.stringify in JSON-LD | XSS vulnerability via script injection | Replace `<` with `\\u003c` or use serialize-javascript package |
| Exposing admin routes in sitemap | Admin pages indexed by Google, potential security scanning | Explicitly exclude /admin, /api from sitemap and robots.txt |
| Not validating product data before structured data | Invalid schema markup, potential injection | Validate all data types, sanitize strings before JSON-LD insertion |
| Including sensitive info in meta tags | Leaking internal IDs, prices, or structure | Review all metadata exports, never include internal-only data |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Broken internal links after category removal | Users click category link, get 404 | Audit all internal links (footer, nav, content) before removing categories |
| Language mismatch (English button in Dutch page) | Confusing experience, looks unprofessional | Complete translation including UI elements, buttons, form labels |
| Poor 404 page after removed categories | Users get lost, high bounce rate | Create helpful 404 page in Dutch with links to main categories |
| Social media previews show wrong language | Users see English title for Dutch page | Test OG tags with proper nl_NL locale |
| Meta description doesn't match page content after translation | User expects one thing, gets another | Translate meta descriptions to match actual page content, not just literal translation |

## "Looks Done But Isn't" Checklist

- [ ] **Dutch Translation:** Often missing UI elements - verify buttons, form validation, error messages all in Dutch
- [ ] **301 Redirects:** Often missing product-level redirects - verify category AND individual product URLs redirect correctly
- [ ] **Open Graph Tags:** Often missing locale or using wrong format - verify `nl_NL` with underscore in all OG tags
- [ ] **Structured Data:** Often missing required properties - validate with Rich Results Test, not just schema validator
- [ ] **Sitemap:** Often contains removed URLs - verify sitemap matches actual site structure, no 301s included
- [ ] **Meta Descriptions:** Often duplicate across pages - verify each page type has unique description
- [ ] **Internal Links:** Often still point to removed categories - search codebase for old category slugs
- [ ] **Robots.txt:** Often has stale Disallow rules - verify only admin and API routes blocked
- [ ] **Canonical Tags:** Often pointing to wrong domain - verify canonical URLs use production domain
- [ ] **Title Templates:** Often not working in child pages - verify title format on every page type

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Removed categories without redirects | MEDIUM | 1. Implement 301 redirects immediately 2. Submit updated sitemap 3. Request re-crawl in GSC 4. Monitor for 2-4 weeks for ranking recovery |
| Poor Dutch translation live | HIGH | 1. Hire native translator urgently 2. Fix high-traffic pages first 3. Update in batches 4. May take months to recover brand trust |
| Missing Open Graph tags | LOW | 1. Add OG tags 2. Use Facebook Debugger to clear cache 3. Effect is immediate for new shares |
| Broken structured data | LOW | 1. Fix JSON-LD syntax 2. Validate with Rich Results Test 3. Request re-crawl 4. Rich snippets return in 1-2 weeks |
| Metadata streaming breaking social bots | MEDIUM | 1. Add htmlLimitedBots config 2. Use static metadata for key pages 3. Clear social media caches 4. Effect immediate |
| Sitemap includes removed URLs | LOW | 1. Update sitemap to exclude removed URLs 2. Resubmit to GSC 3. Effect within days as Google re-crawls |
| Hreflang errors | MEDIUM | 1. Fix hreflang format/missing tags 2. Validate with hreflang validator 3. Wait 2-4 weeks for Google to reprocess 4. Monitor GSC for errors |
| Duplicate meta descriptions | LOW | 1. Write unique descriptions per page 2. Deploy changes 3. Wait for re-crawl 4. CTR improves in 1-2 weeks |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Missing 301 redirects for removed categories | Phase 1: Category Cleanup | Test all old URLs return 301, verify redirect destinations in browser and GSC |
| Metadata streaming breaking social bots | Phase 2: Dutch Content & Metadata | Test with Facebook/LinkedIn preview tools, verify OG tags in <head> |
| Poor Dutch translation quality | Phase 2: Dutch Content & Metadata | Native speaker review, competitor comparison, user testing |
| Open Graph locale format errors | Phase 2: Dutch Content & Metadata | Verify nl_NL with underscore in page source, test with social debuggers |
| JSON-LD XSS vulnerability | Phase 3: Structured Data | Security audit of all JSON.stringify usage, validate escaping |
| Hreflang tag mistakes | Phase 2: Dutch Content & Metadata | Validate with hreflang checker, GSC shows no hreflang errors |
| Sitemap contains removed routes | Phase 1: Category Cleanup & Phase 4: Sitemap | Download sitemap.xml, verify no removed URLs, no 301 redirects |
| Robots.txt blocking important pages | Phase 4: Sitemap & Robots.txt | Test with GSC robots.txt tester, verify all public pages allowed |
| Duplicate/missing meta descriptions | Phase 2: Dutch Content & Metadata | Audit with SEO crawler (Screaming Frog), GSC shows no duplication warnings |
| Next.js metadata duplication | Phase 2: Dutch Content & Metadata | View page source for all page types, check for duplicate tags |

## Sources

**Next.js & SEO:**
- [Handling Redirects in Next.js Without Breaking SEO](https://medium.com/@sureshdotariya/handling-redirects-in-next-js-without-breaking-seo-2f8c754bf586)
- [App Router pitfalls: common Next.js mistakes](https://imidef.com/en/2026-02-11-app-router-pitfalls)
- [Next.js Official Docs: generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js Official Docs: redirects](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)
- [Next.js Official Docs: sitemap.xml](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js Official Docs: robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Next.js Official Docs: JSON-LD](https://nextjs.org/docs/app/guides/json-ld)

**Dutch SEO:**
- [Dutch SEO Agency guide - IndigoExtra](https://www.indigoextra.com/blog/dutch-seo)
- [Dutch SEO: Localizing Your Search Strategy - Wordbank](https://www.wordbank.com/blog/digital-marketing/dutch-seo/)
- [Complete Guide for Doing SEO in Dutch - RankTracker](https://www.ranktracker.com/blog/a-complete-guide-for-doing-seo-in-dutch/)
- [SEO in Netherlands - Awisee](https://awisee.com/blog/seo-netherlands/)
- [Dutch Website SEO Key Strategies - SEM Global Tech](https://www.semglobaltech.com/blog/dutch-seo/dutch-website-seo-key-strategies-for-the-dutch-market/)

**Ecommerce Category Removal:**
- [301 Redirect Scenarios for Ecommerce - Volusion](https://www.volusion.com/blog/301-redirect-scenarios-and-best-practices-for-ecommerce/)
- [Removed and out-of-stock products SEO - SiteGuru](https://www.siteguru.co/seo-academy/removed-products)
- [Will Deleting Products Hurt SEO? - Meticulosity](https://www.meticulosity.com/blog/will-deleting-products-hurt-my-seo)
- [301 vs 404: Best Practices for SEO](https://error404.atomseo.com/blog/301-vs-404-redirects)
- [Complete Guide to Redirecting Deleted Pages - Intero Digital](https://www.interodigital.com/blog/the-complete-guide-to-redirecting-deleted-pages-301-404-or-410/)

**Open Graph & Hreflang:**
- [Open Graph Protocol](https://ogp.me/)
- [Yoast SEO OpenGraph Tags: Change og:locale - Yoast](https://developer.yoast.com/features/opengraph/api/changing-og-locale-output/)
- [List of Hreflang Country & Language Codes - Martin Kůra](https://martinkura.com/list-hreflang-country-language-codes-attributes/)
- [Study: 31% of international websites contain hreflang errors - Search Engine Land](https://searchengineland.com/study-31-of-international-websites-contain-hreflang-errors-395161)
- [Hreflang: the ultimate guide - Yoast](https://yoast.com/hreflang-ultimate-guide/)

**Structured Data:**
- [Implementing JSON-LD in Next.js for SEO - Wisp CMS](https://www.wisp.blog/blog/implementing-json-ld-in-nextjs-for-seo)
- [Working With Structured Data in Next.js 14 - craigmadethis](https://craig.madethis.co.uk/2024/structured-data-next-14)
- [Next.js GitHub Discussion: JSON-LD hydration issues #80088](https://github.com/vercel/next.js/discussions/80088)

**Next.js Metadata Issues:**
- [Fixing Duplicate Meta Tag Issue in Next.js - Deni Apps](https://deniapps.com/blog/fixing-duplicate-meta-tag-issue-in-nextjs)
- [generateMetadata renders incorrectly - GitHub Issue #82783](https://github.com/vercel/next.js/issues/82783)
- [Next.js internationalization guide - LogRocket](https://blog.logrocket.com/complete-guide-internationalization-nextjs/)

---
*Pitfalls research for: Dutch content & SEO for Next.js 15 App Router ecommerce webshop*
*Researched: 2026-02-14*
*Confidence level: HIGH (verified with official Next.js docs, multiple SEO sources, and Dutch-specific SEO guides)*
