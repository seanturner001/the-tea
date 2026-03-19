# The Tea — Design Spec

A reality TV news aggregator with spoiler protection, built as a gift.

## Overview

Port the existing `TheTea.jsx` prototype into a Next.js app deployable on Vercel. Move the Claude API call server-side, swap inline styles for Tailwind CSS, and keep the existing UI design intact.

## Decisions

- **Framework:** Next.js App Router
- **Styling:** Tailwind CSS with custom theme (same colors/fonts as prototype)
- **API:** Serverless API route (`/api/tea`) proxies Claude with web search
- **Auth:** None — URL access only
- **API key:** Owner's Anthropic key as Vercel env var
- **Shows:** 11 shows hardcoded (+ "All" option = 12 entries total)
- **Architecture:** Minimal migration — single main component, not decomposed
- **Layout:** Mobile-first, max-width 430px centered

## Dependencies

- `next` — framework
- `react`, `react-dom` — UI
- `lucide-react` — icons (Eye, EyeOff, Sparkles, AlertTriangle, RefreshCw)
- `@anthropic-ai/sdk` — Claude API client (server-side only)
- `tailwindcss`, `@tailwindcss/postcss` — styling

## Project Structure

```
the-tea/
├── app/
│   ├── layout.js          # Root layout, fonts (Playfair Display + DM Sans), metadata
│   ├── page.js            # Server component, renders TheTea
│   ├── globals.css         # Tailwind directives + fadeUp/pulse/spin animations
│   └── api/
│       └── tea/
│           └── route.js    # POST — receives { show }, calls Claude, returns articles[]
├── components/
│   └── TheTea.jsx          # "use client" — full app UI ported to Tailwind
├── lib/
│   └── shows.js            # SHOWS array + CAT_META constants
├── tailwind.config.js      # Custom colors, fonts
├── next.config.js
├── package.json
└── .env.local              # ANTHROPIC_API_KEY
```

## API Route: `/api/tea`

**Request:** `POST /api/tea` with `{ show: "love-is-blind" | "all" }`

**Flow:**
1. Validate show ID against SHOWS array (return 400 if invalid)
2. Build query string — single show uses its label; "all" lists all 11 show names
3. Call Claude API (claude-sonnet-4-20250514) with web_search tool and system prompt
4. Extract last text block from response
5. Strip markdown code fences (```` ```json ````  wrappers) since Claude sometimes adds them despite instructions
6. Parse JSON array
7. Return `{ articles: [...] }` (200) or `{ error: "message" }` (500)

**System prompt:** Requests 5-7 articles with fields: title, source, url, date, show, safe_summary, is_spoiler, spoiler_summary, category.

**Model:** claude-sonnet-4-20250514 (latest Sonnet at time of writing).

## Shared Data: `lib/shows.js`

**SHOWS array** (12 entries):
- All Trash TV (id: "all")
- Real Housewives, Love Is Blind, Survivor, The Bachelor, Vanderpump Rules, Below Deck, The Traitors, Big Brother, Selling Sunset, The Challenge, Jersey Shore

**CAT_META** — 6 article categories with colors:
- `drama` — pink (#FF1B8D)
- `cast` — purple (#C39BD3)
- `recap` — red (#E8736A)
- `preview` — green (#2ECC71)
- `reunion` — amber (#F5B942)
- `news` — blue (#5DADE2)

## Component: `TheTea.jsx`

Mobile-first layout, max-width 430px, centered. Identical UX to prototype ported to Tailwind.

- **Header:** "The Tea" title (Playfair Display 58px), pink italic accent, sparkles icon, subtitle "All the drama, none of the spoilers"
- **Spoiler toggle:** Bar with EyeOff/Eye icon, label ("Spoiler-Free Mode" / "Spoilers Allowed"), iOS-style toggle switch
- **Show filter:** Horizontal scrollable pill buttons for all shows
- **Fetch button:** Gradient pink button — "Spill the Tea on [Show]" / "Brewing the tea..." (with spinner) / "Refresh the Tea"
- **Results header:** "{N} articles found" with spoiler protection status indicator
- **Article cards:**
  - Top row: show name (gold) + category badge (colored pill)
  - Title (Playfair Display)
  - Source + date meta line
  - Spoiler articles: pink border glow, "SPOILER ALERT" banner with reveal/hide button, blurred summary
  - Non-spoiler articles: normal summary display
  - "Read full article →" external link at bottom
- **States:**
  - Pre-search empty: coffee emoji + "Ready to spill?" + instructions
  - Loading: 3 skeleton cards with pulse animation
  - Error: red banner with "The tea spilled!" message
  - No results: teapot emoji + "No tea found"

**Key change:** `fetchTea` calls `/api/tea` instead of `api.anthropic.com` directly.

## Tailwind Theme

```js
colors: {
  pink: '#FF1B8D',
  gold: '#C9A84C',
  bg: '#0C0A0B',
  card: '#161214',
  'text-primary': '#F2EFF0',
  'text-muted': '#666666',
  'text-sub': '#999999',
}
fontFamily: {
  playfair: ['Playfair Display', 'serif'],
  sans: ['DM Sans', 'sans-serif'],
}
```

Additional one-off values (borders, gradients, category colors) use Tailwind arbitrary values.

## Deployment

- Vercel connected to git repo
- `ANTHROPIC_API_KEY` set as environment variable in Vercel dashboard
- No custom domain required (Vercel `.vercel.app` URL is fine)
