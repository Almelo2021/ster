# Sterradar

Landing site for sterradar.nl — the measurement endpoint for AI-referred traffic from
the ze.nl program (algo/ ­— see the build tracker). Every page view and code redemption
is logged server-side to Supabase; `/stats` shows visits, AI-agent traffic, and
redeemed codes.

## Setup

1. **Database** — run `ster-migration.sql` once in the Supabase SQL editor.
2. **Env** — copy `.env.example` to `.env.local` and fill in:
   - `SUPABASE_URL` — `https://<project>.supabase.co` (no trailing slash)
   - `SUPABASE_SERVICE_KEY` — service role key
  
3. **Local dev** — `npm install && npm run dev`
4. **Deploy** — push to a repo, import in Vercel, set the same env vars, then add the
   `sterradar.nl` domain in Vercel and point DNS at it.

## Routes

- `/` — homepage with the code-redemption form
- `/profiel/[naam]` — gated profile page (any slug resolves), same form
- `/via/[slug]` — attribution landing paths, render the homepage, path is logged
- `/api/redeem` — POST `{code, path}`; logs a `redeem` event
- `/stats` — open dashboard (AI agents highlighted)
- `/artikelen` + `/artikelen/[slug]` — editorial articles (fictional subjects), also
  exposed as WebMCP tools
- `/artikel/[slug]` — convoID protocol experiment (unchanged, separate from
  `/artikelen`)
- `/api/agentads/auction` — runs the sponsored-tool auction for a page context
- `/api/agentads/track` — logs sponsored tool calls/conversions
  (`agentads_call` / `agentads_conversion` events)

## WebMCP + AgentAds (WebMCP Challenge entry)

The site exposes its content as WebMCP tools (`list_articles`, `read_article`,
`search_articles`) via `lib/webmcp.ts`, with a human-visible
panel (`components/AgentToolsPanel.tsx`, bottom-right) that shows the same tool
list, one-click try buttons, and a live call log of both human and agent calls.

**AgentAds** (`public/agentads-sdk.js`) is the monetization SDK: one script tag
(`<script src="/agentads-sdk.js" data-publisher="...">`) turns a WebMCP page into
ad inventory. It asks `/api/agentads/auction` for the page context's auction —
ranking = evalScore × bid, winner pays a quality-weighted second price — and
registers the winning tool(s) as clearly disclosed sponsored WebMCP tools
(`sponsored_` prefix, `[SPONSORED · advertiser]` description, `annotations.sponsored`).
Sponsored tools are additive, never replace site tools, and every call pays the
publisher a rev-share, shown live in the widget (bottom-left, or in the article's
`data-agentads-slot`). Works with both `navigator.modelContext`/`document.modelContext`
`registerTool()` and the older `provideContext()` via a shared registry on
`window.__webmcpTools`; without a WebMCP runtime everything still works by hand.

Query strings are logged verbatim and never stripped or redirected, so UTM survival
is measurable. `robots.txt` allows all crawlers.
