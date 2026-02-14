# Quick Task 8: Change the hero section image

## Goal
Replace the single hero image with a bento-style image grid collage (like Dreamflux.ai) using all 4 product images.

## Tasks

### Task 1: Replace hero right-side image with bento grid
**File:** `src/app/page.tsx`

Replace the single `<Image>` in the desktop hero right side with a 2-column bento grid:
- Left column: living room (tall), kitchen transparent (short)
- Right column: bedroom blackout (short), kitchen beige (tall)
- Rounded corners on each image card
- Gap between cards
- Offset columns for visual interest (like Dreamflux example)
- Keep mobile background image as-is

### Task 2: Verify mobile layout unaffected
Ensure the mobile hero (background image with overlay) still works correctly.
