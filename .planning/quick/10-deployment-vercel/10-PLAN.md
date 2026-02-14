---
phase: 10-deployment-vercel
plan: 10
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: false
user_setup:
  - service: vercel
    why: "Production hosting for Next.js app"
    env_vars:
      - name: SHOPIFY_STORE_DOMAIN
        source: "Shopify Admin -> Settings -> Domains (your-store.myshopify.com)"
      - name: SHOPIFY_ADMIN_ACCESS_TOKEN
        source: "Shopify Admin -> Settings -> Apps -> Develop apps -> API credentials"
      - name: SHOPIFY_API_VERSION
        source: "Use 2026-01 as specified in .env.example"
      - name: NEXT_PUBLIC_BASE_URL
        source: "Your production URL (https://pureblinds.nl or Vercel-assigned domain)"
must_haves:
  truths:
    - "Site is accessible via a public Vercel URL"
    - "Build succeeds on Vercel with Velite MDX compilation"
    - "All pages render correctly (homepage, products, blog, cart)"
    - "Shopify checkout flow works end-to-end with production env vars"
  artifacts:
    - path: "Vercel deployment"
      provides: "Production hosting"
  key_links:
    - from: "Vercel build"
      to: "next.config.mjs"
      via: "Velite build integration"
      pattern: "build.*velite"
    - from: "API routes"
      to: "Shopify Admin API"
      via: "Environment variables"
      pattern: "SHOPIFY_ADMIN_ACCESS_TOKEN"
---

<objective>
Deploy the pure-blinds Next.js webshop to Vercel for production hosting.

Purpose: Make the site publicly accessible at a production URL so customers can browse products and place orders.
Output: Live Vercel deployment accessible via public URL with working Shopify checkout integration.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@next.config.mjs
@package.json
@.env.example
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Vercel CLI and deploy project</name>
  <files>No files modified - CLI operations only</files>
  <action>
    1. Install Vercel CLI globally: `npm i -g vercel`
    2. Run `vercel login` to authenticate (will open browser for OAuth)
    3. Run `vercel link` in the project root to connect to a Vercel project
       - If prompted to set up a new project, confirm yes
       - Use the existing GitHub repo gjrkdk/pure-blinds
       - Framework preset: Next.js (should auto-detect)
    4. Set environment variables via CLI for production:
       - `vercel env add SHOPIFY_STORE_DOMAIN production` (user provides value)
       - `vercel env add SHOPIFY_ADMIN_ACCESS_TOKEN production` (user provides value)
       - `vercel env add SHOPIFY_API_VERSION production` (value: 2026-01)
       - `vercel env add NEXT_PUBLIC_BASE_URL production` (value: the Vercel domain or pureblinds.nl)
    5. Run `vercel --prod` to trigger a production deployment
    6. Wait for deployment to complete and capture the production URL

    Important notes:
    - The Velite build step runs inside next.config.mjs during `next build` - no special Vercel config needed
    - No vercel.json needed - Next.js 16 is auto-detected by Vercel
    - The redirects in next.config.mjs will work natively on Vercel
    - If the user prefers to connect via Vercel Dashboard (Import Git Repository) instead of CLI, that is equally valid - guide them through the dashboard flow instead

    If auth fails or CLI is unavailable, fall back to guiding the user through vercel.com dashboard:
    1. Go to vercel.com/new
    2. Import the gjrkdk/pure-blinds repository
    3. Framework preset: Next.js
    4. Add environment variables in the UI
    5. Deploy
  </action>
  <verify>
    - `vercel ls` shows the project with a successful deployment
    - The production URL returns HTTP 200
    - `curl -s -o /dev/null -w "%{http_code}" <PRODUCTION_URL>` returns 200
  </verify>
  <done>Vercel project is linked, environment variables are configured, and a production deployment is live with a public URL.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Verify production deployment</name>
  <files>No files - verification only</files>
  <action>
    Human verifies the production deployment works correctly by testing all major user flows
    in the browser. This is a checkpoint task - Claude has completed the deployment, and the
    user now validates everything works on the live URL.
  </action>
  <verify>
    1. Open the production URL in a browser
    2. Verify homepage loads with all 7 Dutch sections (Hero, About, Services, Our Work, Testimonials, FAQ, Contact)
    3. Navigate to /producten - verify product categories display
    4. Navigate to a product page (e.g., /producten/rolgordijnen/transparante-rolgordijnen/wit-rolgordijn) - verify configurator loads with pricing
    5. Enter dimensions (e.g., 100cm x 150cm) and verify price calculates
    6. Add to cart and verify cart page shows the item
    7. Navigate to /blog - verify blog posts display
    8. Check /sitemap.xml loads correctly
    9. Check /robots.txt loads correctly
    10. (Optional) Test checkout flow: add item to cart, proceed to checkout, verify Shopify redirect works
        - This requires valid Shopify env vars to be configured
    11. Verify redirects work: visit /products and confirm redirect to /producten
  </verify>
  <done>User confirms the production deployment is working correctly - all pages render, pricing works, and checkout flow functions end-to-end. Type "approved" or describe issues.</done>
</task>

</tasks>

<verification>
- Production URL accessible and returns 200
- All static pages render (homepage, products, blog, sitemap, robots.txt)
- API routes respond (/api/health returns 200)
- Redirects work (301s from old URLs)
- Shopify checkout integration works with production env vars
</verification>

<success_criteria>
- The pure-blinds webshop is live on a public Vercel URL
- All pages render correctly with Dutch content
- Pricing calculator works on product pages
- Cart and checkout flow function end-to-end
</success_criteria>

<output>
After completion, create `.planning/quick/10-deployment-vercel/10-SUMMARY.md`
</output>
