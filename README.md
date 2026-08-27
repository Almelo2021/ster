# AgentAds by Oasy — WebMCP Challenge entry

**AgentAds** is an honest ad auction inside a page's WebMCP tools: one script
tag turns any site that exposes WebMCP tools into ad inventory for agents, with
a quality-weighted auction, disclosure, and a live rev-share for the site owner.
Built by [Oasy](https://www.oasy.ai) — the advertising layer for the AI era.

The demo publisher is a fictional editorial site covering the age, career and
estimated net worth of (fictional) celebrities. Its articles are readable by
humans and exposed as WebMCP tools to agents; the AgentAds SDK monetizes that
surface.

See `DEVPOST.md` for the full submission write-up.

## How it works

The site exposes its content as WebMCP tools (`list_articles`, `read_article`,
`search_articles`) via `lib/webmcp.ts`, with a human-visible panel
(`components/AgentToolsPanel.tsx`, bottom-right) that shows the same tool list
the agent sees, one-click try buttons, and a live call log of both human and
agent calls.

The **AgentAds SDK** (`public/agentads-sdk.js`) is a standalone script embedded
with one tag:

```html
<script src="/agentads-sdk.js" data-publisher="oasy-demo" defer></script>
```

It asks `/api/agentads/auction` for the auction matching the page's context —
ranking = rankScore × bid, winner pays a quality-weighted second price — and
registers the winning tool(s) as sponsored WebMCP tools, disclosed once via the
`[SPONSORED · advertiser]` opener in the tool description. Sponsored tools are
additive, never replace site tools, and every call pays the publisher a
rev-share, shown live in the widget.

**rankScore is computed live from telemetry**: impressions (logged by the
auction route per served winner), calls (`/api/agentads/track`), and conversions
(`/via/agentads-*` attribution pageviews logged by the middleware), blended
with a cold-start prior that fades as impressions accumulate. A 10% exploration
share occasionally serves a losing bidder so it can earn the data to climb.

The WebMCP layer supports both `navigator.modelContext` / `document.modelContext`
and both `registerTool()` and the older `provideContext()`, via a shared
registry on `window.__webmcpTools`; it also keeps watching for runtimes that
inject after page load. Without a WebMCP runtime everything still works by hand.

## Routes

- `/` — homepage (Dutch, the publisher's own site chrome)
- `/artikelen` + `/artikelen/[slug]` — articles (English), also exposed as
  WebMCP tools; article pages host the AgentAds widget
- `/via/[slug]` — attribution landing paths (`/via/agentads-<offer>` counts as
  a conversion), path is logged
- `/api/agentads/auction` — runs the sponsored-tool auction for a page context
- `/api/agentads/track` — logs sponsored tool calls/conversions
- `/stats` — telemetry dashboard: per-offer impressions/calls/conversions (the
  rankScore inputs), AI-agent traffic, recent pageviews

## Setup

1. **Database** — run `ster-migration.sql` once in the Supabase SQL editor.
2. **Env** — copy `.env.example` to `.env.local` and fill in:
   - `SUPABASE_URL` — `https://<project>.supabase.co` (no trailing slash)
   - `SUPABASE_SERVICE_KEY` — service role key
3. **Local dev** — `npm install && npm run dev` (without Supabase env the
   auction falls back to prior rankScores and skips telemetry)
4. **Deploy** — push to a repo, import in Vercel, set the same env vars.

## Testing with an agent

Open an article in ChatGPT's in-app browser (WebMCP out of the box) or Chrome
with the WebMCP flag/origin trial, and ask the agent to e.g. check ticket
availability for the tour it just read about. Every page view and tool call
feeds the live rankScores.
