# AgentAds — an honest ad auction inside your page's WebMCP tools

**One script tag turns any WebMCP site into ad inventory for agents — with a
quality-weighted auction, machine-readable disclosure, and a live rev-share for
the site owner.**

## Inspiration

The web pays for itself with ads, but agents don't see ads. As browsing shifts to
agents, every publisher's monetization surface quietly disappears — and the new
scarce surface becomes *the agent's tool candidate set*. Someone will run the
auction for that surface. We wanted to show it can be done honestly, in the open,
inside WebMCP itself, instead of as undisclosed paid steering buried in a model's
context.

## What it does

Our demo site, **Sterradar** (an editorial site covering Dutch celebrities),
exposes its content as
regular WebMCP tools: `list_articles`, `read_article`, `search_articles`. A
human-visible panel shows the exact tool list the agent sees, with one-click try
buttons and a live call log — humans and agents literally share the same tools.

Then one script tag adds the **AgentAds SDK**:

```html
<script src="/agentads-sdk.js" data-publisher="sterradar" defer></script>
```

On page load the SDK:

1. **Detects the page context** (e.g. an article about a musician → `muziek`).
2. **Runs an auction** against the AgentAds marketplace: every advertiser in that
   category bids per tool-call, and the ranking is **rankScore × bid**. The
   rankScore is computed live from how agents actually behave: call-through on
   served slots (did the agent choose to call the tool?) and conversions on
   calls, blended with a cold-start prior that fades as impressions accumulate.
   The winner pays a quality-weighted **second price** (just enough to beat the
   runner-up), so overbidding with a bad tool can't buy the slot — and a tool
   agents ignore loses the slot on its own. A 10% exploration share
   occasionally serves a losing bidder so it can earn the data to climb.
3. **Registers the winning tool as a *disclosed* sponsored WebMCP tool** — the
   tool description opens with `[SPONSORED · advertiser]`: disclosed once,
   clearly, without cluttering the tool name or results. Sponsored tools are
   strictly *additive*: they sit next to the site's own tools and never replace
   them. Agents (and users) can filter them out entirely.
4. **Pays the publisher per call**: 70% rev-share on every sponsored tool call,
   ticking up live in the on-page widget.

On our music article, three ticket sellers bid. Concertgigant bids the most
(€0.55) and still loses to TicketToko (€0.42), because TicketToko's rankScore is
higher — and TicketToko then pays only €0.40. The entire auction table, each
winner's live telemetry (impressions / calls / conversions), the price paid, and
the publisher's earnings are rendered on the page for humans to inspect. Nothing
is hidden from anyone: not from the user, not from the agent, not from the site
owner.

## Why humans + agents together makes it better

- The **human** reads the article; the **agent** can act on it — check ticket
  availability, find where a show streams, get a mortgage indication — via tools
  scoped to exactly that page's context.
- The **site owner** finally has an answer to "what happens to my ad revenue when
  agents read my site?" — they watch it accrue in real time.
- The **panel and widget** make the invisible visible: every agent tool call,
  organic or sponsored, appears in the on-page log with its arguments, result,
  and price. Agentic activity on a page stops being a black box.

## How we built it

- **Site**: Next.js 15 / React 19, deployed on Vercel.
- **WebMCP layer** (`lib/webmcp.ts`): a small compat shim that supports both
  `navigator.modelContext` and `document.modelContext`, and both `registerTool()`
  and the older `provideContext()` — via a shared on-page registry so the site's
  tools and the SDK's sponsored tools always compose instead of clobbering each
  other. Tool results use the MCP `content` shape.
- **AgentAds SDK** (`public/agentads-sdk.js`): fully standalone vanilla JS, no
  dependencies, self-styling widget. Reads its config from the script tag,
  reports calls/conversions via `sendBeacon`.
- **Marketplace** (`/api/agentads/auction`): serverless route implementing the
  quality-weighted generalized second-price auction over a per-category
  advertiser catalog, with rankScores computed per request from live telemetry
  (impressions the route logs itself, calls from the track endpoint, conversions
  from `/via/…` attribution pageviews) and an exploration share — a small
  multi-armed bandit. Returns the full ranking so the client can show its work.
- **Measurement** (`/api/agentads/track`): every sponsored call and conversion is
  logged server-side (Supabase), alongside the site's existing AI-traffic
  analytics — the same event stream the rankScores are computed from.

## What's real and what's simulated

The auction, pricing math, live rankScore computation, exploration serves, tool
registration, disclosure, call tracking, and rev-share accounting are fully
implemented. The advertisers and their inventory
data are fictional (as are the article subjects — it's a demo site), and the
wallet is a ledger rather than a payment rail. Swapping the catalog for real
bidders and the ledger for x402-style settlement is deliberately the boring part.

## What we learned

Quality-weighting isn't just fairness theater — it's what makes ads *possible* in
agentic contexts at all. An agent's operator can measure task success and switch
routers instantly, so a marketplace that lets money outrank quality destroys its
own inventory. The second-price mechanics matter for the same reason: the
equilibrium is advertisers bidding their true value and winners being the tools
that actually help.

## What's next

A machine-readable `sponsored` annotation standard for WebMCP tools (so agent
policies can uniformly accept, weight, or strip sponsored capabilities),
cost-per-outcome bidding, and real settlement.

---

**Try it**: open any article, click the ⚙ Agent-tools panel (bottom right) and
the AgentAds widget (in the article), or point a WebMCP-enabled browser at the
page and ask your agent to check ticket availability for the tour it just read
about.
