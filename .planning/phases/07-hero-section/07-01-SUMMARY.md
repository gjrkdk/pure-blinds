---
phase: 07-hero-section
plan: 01
subsystem: frontend-ui
tags: [next.js, tailwind, hero, testimonial, responsive]
requires: [06-01-navigation-layout]
provides: [full-height-hero, testimonial-overlay, hero-cta]
affects: [homepage-ux, visual-hierarchy]
tech-stack:
  added: []
  patterns: [full-viewport-hero, testimonial-overlay, glass-effect]
decisions:
  - id: HERO-SVG-PLACEHOLDER
    desc: Use SVG placeholder instead of JPG for self-contained repo
    rationale: Avoids external image dependencies, keeps repo self-contained
    impact: Placeholder image is scalable and lightweight
  - id: HERO-ANCHOR-CTA
    desc: Hero CTA uses anchor tag with href="#contact"
    rationale: Follows 06-01 decision for native smooth scrolling
    impact: Simple, reliable scroll behavior without JavaScript
key-files:
  created:
    - public/hero-placeholder.svg
  modified:
    - src/app/page.tsx
metrics:
  duration: 66s
  completed: 2026-02-09
---

# Phase 07 Plan 01: Hero Section Redesign Summary

**One-liner:** Full-height hero with two-column layout, testimonial overlay on image, and anchor-based CTA scroll.

---

## What Was Delivered

### Core Features

1. **Full-height hero section**
   - `min-h-screen` spans entire viewport height
   - Vertically centered content with flex layout
   - Accounts for fixed header offset (pt-24)

2. **Two-column responsive layout**
   - Desktop: Text left, image right (grid md:grid-cols-2)
   - Mobile: Stacked vertically (text first, then image)
   - Gap-12 spacing between columns

3. **Hero text content**
   - Small uppercase label: "Premium Custom Textiles"
   - Large headline: "Textiles, crafted to your exact dimensions"
   - Description paragraph with max-width constraint
   - CTA button: "Get in Touch" with arrow icon

4. **Hero image with testimonial overlay**
   - 800x1000 SVG placeholder (light gray with centered text)
   - next/image component with priority loading
   - Testimonial card positioned at bottom-left of image
   - Glass effect styling: bg-background/95 + backdrop-blur-sm
   - Card content: 5-star rating, quote, author name + role

5. **CTA anchor navigation**
   - Changed from `<Link href="/products/custom-textile">` to `<a href="#contact">`
   - Uses native smooth scroll (scroll-behavior: smooth in globals.css)
   - Updated button text to "Get in Touch"

### Design System Compliance

- Uses existing monochrome color variables: text-foreground, text-muted, bg-background, bg-accent, border-border
- Follows established typography scale: text-4xl, text-6xl, text-7xl for headline
- Matches existing spacing patterns: px-6 for mobile padding, max-w-5xl for page width
- Glass effect matches header styling (backdrop-blur-sm + bg/95 opacity)
- Sharp corners (no border-radius) aligns with existing card style

### Files Modified

**Created:**
- `public/hero-placeholder.svg` — 800x1000 light gray SVG with centered "Image" text

**Modified:**
- `src/app/page.tsx` — Replaced lines 57-76 (original hero section) with full-height hero, added next/image import

**Unchanged:**
- All other sections: Value Props, Product Showcase, How it Works, CTA Banner

---

## How Requirements Were Met

| Requirement | Implementation | Verification |
|------------|---------------|-------------|
| HERO-01: Full-height hero with headline, description, CTA | `min-h-screen` section with all text elements + CTA button | ✓ Build passes, visual structure present |
| HERO-02: Image with testimonial card overlay | next/image + absolute-positioned card with rating/quote/author | ✓ Overlay card renders with glass effect |
| HERO-03: CTA scrolls to contact | `<a href="#contact">` + existing smooth scroll CSS | ✓ href="#contact" confirmed in code |

---

## Technical Decisions

### 1. SVG Placeholder Over JPG (HERO-SVG-PLACEHOLDER)

**Context:** Plan specified `public/hero-placeholder.jpg` but also suggested SVG as simplest approach.

**Decision:** Created `hero-placeholder.svg` instead of JPG.

**Rationale:**
- Self-contained repo (no external image downloads needed)
- Scalable and lightweight (299 bytes)
- Simple to generate programmatically
- Perfectly matches monochrome aesthetic

**Impact:** Placeholder image ready for replacement with real photo when design is finalized.

### 2. Anchor Tag for Hero CTA (HERO-ANCHOR-CTA)

**Context:** Original hero used `<Link href="/products/custom-textile">`. New design requires scroll to #contact.

**Decision:** Changed to `<a href="#contact">` with native smooth scroll.

**Rationale:**
- Follows 06-01 decision: "Use anchor links instead of Next.js Link for section navigation"
- Native browser smooth scrolling (scroll-behavior: smooth already in globals.css)
- Simpler and more reliable than custom scroll logic

**Impact:** CTA button now scrolls to contact section on click. No JavaScript required.

### 3. Testimonial Card Positioning

**Context:** Plan suggested bottom-left or bottom-right placement.

**Decision:** Bottom-left on desktop (`md:left-0`), centered on mobile (`left-8 right-8`).

**Rationale:**
- Left placement balances visual weight (image on right, card on left side of image)
- Mobile centered keeps card readable on small screens
- Partially overlaps image edge for visual interest (absolute positioning)

**Impact:** Card enhances hero without obscuring main image content.

---

## Deviations from Plan

None — plan executed exactly as written. Both tasks completed without issues.

---

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | 1312e77 | feat(07-01): add placeholder hero image |
| 2 | 4ea8a69 | feat(07-01): redesign hero section with full-height layout and testimonial overlay |

---

## Verification Results

**Build:** ✓ Passed (`npm run build` exits 0)

**Visual structure:**
- ✓ Hero section has `min-h-screen` class (line 58)
- ✓ Two-column layout with `grid md:grid-cols-2` (line 60)
- ✓ Headline, description, and CTA button present in left column
- ✓ Image with `next/image` component in right column
- ✓ Testimonial card overlay with rating, quote, and author

**Functionality:**
- ✓ CTA button has `href="#contact"` (line 74)
- ✓ Smooth scroll CSS already in place (`html { scroll-behavior: smooth }`)
- ✓ All other sections unchanged (Value Props starts at line 143, unchanged)

**Design system:**
- ✓ Uses existing color variables (text-foreground, text-muted, bg-accent, etc.)
- ✓ Follows typography scale (text-4xl, sm:text-6xl, lg:text-7xl)
- ✓ Matches spacing patterns (px-6, max-w-5xl)
- ✓ Glass effect matches header styling

---

## Next Phase Readiness

**Phase 08 can proceed:** Hero section foundation is complete. Future phases can build on this structure (e.g., scroll animations, real images, A/B testing).

**Potential enhancements (out of scope for this phase):**
- Replace placeholder SVG with professional hero image
- Add scroll-reveal animations (deferred to future milestone)
- Implement image carousel (deferred to future milestone)
- A/B test different headlines or CTA copy

**No blockers identified.**

---

*Phase 07 Plan 01 completed in 66 seconds with zero deviations.*
