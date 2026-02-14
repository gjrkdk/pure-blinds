# Plan 16-04: Blog Dutch Content

## Result
**Status:** Complete

## What Was Built
Replaced English blog content with Dutch articles, created new Dutch blog post, and added Dutch metadata and date localization.

### Key Changes
- Blog listing: Dutch heading "Gidsen en tips", date-fns nl locale, metadata with OG nl_NL
- Blog detail: Dynamic Dutch metadata with OG nl_NL, Dutch-formatted dates (15 januari 2025)
- Deleted 3 English posts: choosing-blinds-guide, blind-care-tips, measuring-windows
- Created 4 Dutch posts:
  1. "De Complete Gids voor het Kiezen van Rolgordijnen" (~450 words)
  2. "Zo Onderhoud je Rolgordijnen: Tips en Tricks" (~380 words)
  3. "Ramen Opmeten voor Rolgordijnen: Stap voor Stap" (~380 words)
  4. "Welk Rolgordijn voor Welke Kamer?" (~1150 words, new post)

### Key Files
- `src/app/blog/page.tsx` — Dutch heading, nl locale dates, metadata
- `src/app/blog/[slug]/page.tsx` — Dynamic Dutch metadata, nl locale dates
- `content/posts/rolgordijnen-kiezen-gids.mdx` — Dutch buying guide
- `content/posts/rolgordijnen-onderhoud-tips.mdx` — Dutch care tips
- `content/posts/ramen-opmeten-rolgordijnen.mdx` — Dutch measuring guide
- `content/posts/welk-rolgordijn-voor-welke-kamer.mdx` — Room selection guide (NEW)

## Commits
- `d442d69` feat(16-04): add Dutch metadata and date localization to blog pages
- `2ea9eb8` feat(16-04): replace English blog posts with Dutch content

## Deviations
None.

## Self-Check: PASSED
- [x] Blog listing shows Dutch heading and dates
- [x] All metadata includes OG nl_NL
- [x] New post ~1150 words (800-1500 target range)
- [x] All 3 English posts replaced with Dutch
- [x] 4 Dutch blog posts with Dutch slugs
- [x] Build succeeds with all 4 SSG blog pages
