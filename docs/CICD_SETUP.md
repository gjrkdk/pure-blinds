# CI/CD Setup Guide

This guide covers the complete CI/CD pipeline for **Pure Blinds**, a Next.js e-commerce site deployed on Vercel with GitHub Actions for continuous integration.

## Overview

```
Feature Branch → Pull Request → CI Checks → Preview Deploy → Merge to main → Production Deploy
```

- **CI**: GitHub Actions runs lint, type checking, tests, and security audits on every PR
- **CD**: Vercel automatically deploys previews for PRs and production on merge to `main`
- **Dependencies**: Dependabot keeps npm packages up to date with auto-merge for patches

---

## 1. GitHub Secrets Configuration

Navigate to your repository: **Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

| Secret Name                    | Description                            | Example Value                        |
| ------------------------------ | -------------------------------------- | ------------------------------------ |
| `SHOPIFY_STORE_DOMAIN`         | Your Shopify store domain              | `your-store.myshopify.com`           |
| `SHOPIFY_ADMIN_ACCESS_TOKEN`   | Shopify Admin API access token         | `shpat_xxxxxxxxxxxxxxxxxxxxx`        |
| `SHOPIFY_API_VERSION`          | Shopify API version                    | `2026-01`                            |
| `SHOPIFY_PRODUCT_ID`           | Shopify product ID used in build       | `gid://shopify/Product/xxxxx`        |
| `NEXT_PUBLIC_BASE_URL`         | Public base URL for the site           | `https://pureblinds.nl`              |

These secrets are used by the CI build job to verify the application compiles correctly with real configuration values.

> **Note**: Vercel manages its own environment variables separately (see section 2).

---

## 2. Vercel Setup

### Import the Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select **Import Git Repository** and choose your GitHub repo
3. Vercel auto-detects Next.js — accept the default settings
4. Click **Deploy**

### Configure Environment Variables

In the Vercel dashboard: **Project → Settings → Environment Variables**

Add each variable for the appropriate environments (Production, Preview, Development):

| Variable                       | Environments        |
| ------------------------------ | ------------------- |
| `SHOPIFY_STORE_DOMAIN`         | All                 |
| `SHOPIFY_ADMIN_ACCESS_TOKEN`   | All                 |
| `SHOPIFY_API_VERSION`          | All                 |
| `SHOPIFY_PRODUCT_ID`           | All                 |
| `NEXT_PUBLIC_BASE_URL`         | Production only     |

> For `NEXT_PUBLIC_BASE_URL`, use your production domain (`https://pureblinds.nl`) for Production and leave Preview/Development to use Vercel's auto-generated URLs.

### Custom Domain

1. Go to **Project → Settings → Domains**
2. Add `pureblinds.nl` and `www.pureblinds.nl`
3. Update DNS records at your domain registrar:
   - **A Record**: `@` → `76.76.21.21`
   - **CNAME Record**: `www` → `cname.vercel-dns.com`
4. Vercel provisions SSL certificates automatically

### Vercel Configuration

The `vercel.json` in the project root configures:

- **Region**: `ams1` (Amsterdam) for optimal performance for Dutch visitors
- **API caching**: `no-store` headers on `/api/*` routes to prevent stale checkout/pricing data
- **Build**: Uses `npm ci` for deterministic installs and `npm run build`

---

## 3. Branch Protection Rules

For a solo developer, keep branch protection lightweight but safe.

Navigate to: **Settings → Branches → Add rule** for `main`

Recommended settings:

- [x] **Require a pull request before merging** (prevents accidental pushes to main)
- [x] **Require status checks to pass before merging**
  - Select: `Lint & Type Check`, `Test`, `Build`, `Security Audit`
- [ ] Require approvals — *skip this for solo development*
- [ ] Require branches to be up to date — *optional, can slow you down*
- [x] **Do not allow bypassing the above settings** (keeps you honest)

This ensures every change to `main` passes CI before merging, while keeping the workflow fast for a single developer.

---

## 4. Testing the Pipeline

### Create a Test PR

```bash
# Create a feature branch
git checkout -b test/ci-pipeline

# Make a small change (e.g., add a comment)
echo "// CI test" >> src/app/layout.tsx

# Push and create a PR
git add src/app/layout.tsx
git commit -m "test: verify CI pipeline"
git push -u origin test/ci-pipeline
gh pr create --title "test: verify CI pipeline" --body "Testing CI/CD setup"
```

### Verify the Checks

1. Open the PR on GitHub
2. Confirm these checks appear and pass:
   - **Lint & Type Check** — ESLint and TypeScript compilation
   - **Test** — Vitest test suite with coverage
   - **Build** — Full Next.js production build
   - **Security Audit** — `npm audit` for known vulnerabilities
3. Check the Vercel preview deployment link in the PR comments
4. Visit the preview URL to verify the site works

### Clean Up

```bash
# Close and delete the test branch
gh pr close --delete-branch
git checkout main
git branch -D test/ci-pipeline
```

---

## 5. Rollback Procedures

### Option A: Rollback via Vercel Dashboard (Fastest)

1. Go to **Vercel → Project → Deployments**
2. Find the last working deployment
3. Click the **three-dot menu → Promote to Production**
4. The previous version is live within seconds

### Option B: Rollback via Git

```bash
# Revert the problematic commit
git revert <commit-hash>
git push origin main
```

Vercel auto-deploys on push to `main`, so the revert triggers a new production build.

### Option C: Redeploy a Specific Commit

```bash
# Find the last good commit
git log --oneline -10

# Push a revert
git revert HEAD
git push origin main
```

> **Tip**: Always prefer Option A for urgent production issues — it's instant and doesn't require a new build.

---

## 6. Troubleshooting

### Build Fails in CI but Works Locally

- **Missing secrets**: Check that all required secrets are configured in GitHub (Section 1)
- **Node version mismatch**: CI uses Node 20. Check your local version with `node -v`
- **Environment variables**: The build job needs Shopify credentials. Ensure all secrets are set

### Vercel Deploy Fails

- Check the build logs in **Vercel → Deployments → (failed deploy)**
- Verify environment variables are set in Vercel project settings
- Ensure `npm ci` can resolve all dependencies (check `package-lock.json` is committed)

### Tests Fail

```bash
# Run tests locally to reproduce
npm run test

# Run with verbose output
npx vitest run --reporter=verbose
```

### ESLint or TypeScript Errors

```bash
# Run locally
npm run lint
npx tsc --noEmit
```

### Dependabot PRs Failing

- Dependabot PRs run the same CI pipeline
- If a dependency update breaks the build, close the PR and pin the dependency version
- Patch updates auto-merge if CI passes

### Preview Deployment Not Appearing on PR

- Ensure the Vercel GitHub integration is installed: **GitHub → Settings → Applications → Vercel**
- Check that the repository is connected in Vercel project settings

---

## 7. Developer Workflow

### Day-to-Day Development

```bash
# 1. Start from an up-to-date main branch
git checkout main
git pull origin main

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Develop and test locally
npm run dev        # Start dev server
npm run lint       # Check linting
npm run test       # Run tests
npx tsc --noEmit   # Type check

# 4. Commit and push
git add .
git commit -m "feat: describe your change"
git push -u origin feature/your-feature-name

# 5. Create a pull request
gh pr create --title "feat: describe your change" --body "Description of changes"

# 6. Wait for CI checks to pass and review the Vercel preview

# 7. Merge the PR (via GitHub UI or CLI)
gh pr merge --squash --delete-branch

# 8. Pull the latest main
git checkout main
git pull origin main
```

### Commit Message Convention

Use conventional commits for clear history:

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks (dependencies, config)
- `refactor:` — Code changes that don't add features or fix bugs

### Pipeline Summary

| Event            | What Happens                                                    |
| ---------------- | --------------------------------------------------------------- |
| Push to branch   | Nothing (CI only runs on PRs and pushes to `main`)             |
| Open PR          | CI runs all checks + Vercel creates a preview deployment        |
| Update PR        | CI re-runs + Vercel updates the preview                         |
| Merge to `main`  | CI runs + Vercel deploys to production                          |
| Dependabot PR    | CI runs + auto-merge for passing patch updates                  |
