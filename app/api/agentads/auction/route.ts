import { NextRequest, NextResponse } from 'next/server'

// AgentAds auction: advertisers bid per tool call on a sponsored WebMCP tool
// slot; ranking = rankScore × bid (quality-weighted, à la Ad Rank). The winner
// pays second price: just enough to beat the runner-up (adRank₂ / rankScore₁),
// never more than its own bid. The full ranking is returned so the SDK can
// show the auction transparently.
//
// rankScore is computed live from telemetry this repo already collects:
//  - impressions: logged by this route whenever an offer wins a slot
//  - calls:       logged by /api/agentads/track on every tool call
//  - conversions: /via/agentads-<offer> pageviews, logged by the middleware
// Each offer carries a `prior` as its cold-start rankScore; observed behaviour
// takes over as impressions accumulate. A 10% exploration share occasionally
// serves a non-winner so losing bidders can earn the data to climb.

type Offer = {
  id: string
  advertiser: string
  category: string
  product: string
  toolName: string
  title: string
  description: string
  inputSchema: object
  // Static demo result; the SDK returns this on a tool call and attaches the
  // continuation link.
  resultData: Record<string, unknown>
  bid: number // EUR per call
  prior: number // 0..1, cold-start rankScore before live telemetry
}

const CATALOG: Offer[] = [
  {
    id: 'tickettoko-tickets',
    advertiser: 'TicketBloom',
    category: 'music',
    product: 'Club-tour ticketing',
    toolName: 'check_ticket_availability',
    title: 'Ticket availability',
    description:
      '[SPONSORED · TicketBloom] Check live ticket availability and prices for Dutch club tours and concerts mentioned on this page.',
    inputSchema: {
      type: 'object',
      properties: {
        artist: { type: 'string', description: 'Artist or tour name' },
        city: { type: 'string', description: 'Preferred city (optional)' },
      },
      required: ['artist'],
    },
    resultData: {
      tour: 'Nachtlicht club tour 2026',
      availability: [
        { city: 'Groningen', date: '2026-11-28', status: 'available', from: '€34.00' },
        { city: 'Utrecht', date: '2026-12-12', status: 'last tickets', from: '€36.50' },
        { city: 'Amsterdam', date: '2026-12-30', status: 'waitlist', from: '—' },
      ],
    },
    bid: 0.42,
    prior: 0.86,
  },
  {
    id: 'concertgigant-tickets',
    advertiser: 'Encore Resale',
    category: 'music',
    product: 'Ticket marketplace',
    toolName: 'resale_ticket_search',
    title: 'Resale search',
    description: '[SPONSORED · Encore Resale] Search resale tickets for concerts.',
    inputSchema: { type: 'object', properties: { artist: { type: 'string' } }, required: ['artist'] },
    resultData: { note: 'resale inventory changes by the minute', from: '€51.00' },
    bid: 0.55,
    prior: 0.61,
  },
  {
    id: 'stagefront-tickets',
    advertiser: 'StageFront',
    category: 'music',
    product: 'Presale alerts',
    toolName: 'stagefront_alert',
    title: 'Presale alert',
    description: '[SPONSORED · StageFront] Set a presale alert for an artist.',
    inputSchema: { type: 'object', properties: { artist: { type: 'string' } }, required: ['artist'] },
    resultData: { alert: 'set', channel: 'email' },
    bid: 0.31,
    prior: 0.79,
  },
  {
    id: 'verspakket-box',
    advertiser: 'FreshCrate',
    category: 'food',
    product: 'Meal boxes',
    toolName: 'mealbox_offer',
    title: 'Meal-box offer',
    description:
      '[SPONSORED · FreshCrate] Get the current introduction offer for the meal-box line of the chef featured on this page.',
    inputSchema: {
      type: 'object',
      properties: { persons: { type: 'number', description: 'Number of persons (2-6)' } },
    },
    resultData: {
      line: 'Lotte Marijnen — Morgen Weer Vers box',
      intro: 'first 3 boxes −40%',
      indicative_price: '€3.95 p.p. per meal after intro',
    },
    bid: 0.38,
    prior: 0.83,
  },
  {
    id: 'kookkrat-box',
    advertiser: 'PanPal',
    category: 'food',
    product: 'Meal boxes',
    toolName: 'mealbox_discount',
    title: 'PanPal offer',
    description: '[SPONSORED · PanPal] Get the current PanPal discount.',
    inputSchema: { type: 'object', properties: {} },
    resultData: { intro: 'first box −25%' },
    bid: 0.44,
    prior: 0.66,
  },
  {
    id: 'streamnu-catalog',
    advertiser: 'Streamlet',
    category: 'media',
    product: 'Streaming service',
    toolName: 'where_to_stream',
    title: 'Where to stream',
    description:
      '[SPONSORED · Streamlet] Check on which platform a Dutch show or presenter can be streamed, with current subscription pricing.',
    inputSchema: {
      type: 'object',
      properties: { title: { type: 'string', description: 'Show or presenter name' } },
      required: ['title'],
    },
    resultData: {
      platform: 'Streamlet',
      catalog: 'both new programmes + the weekly podcast',
      subscription: '€7.99/month, first month free',
    },
    bid: 0.29,
    prior: 0.88,
  },
  {
    id: 'kijktotaal-catalog',
    advertiser: 'BundleBox',
    category: 'media',
    product: 'TV bundles',
    toolName: 'tv_bundle_pricing',
    title: 'BundleBox bundle',
    description: '[SPONSORED · BundleBox] Get bundle pricing for streaming packages.',
    inputSchema: { type: 'object', properties: {} },
    resultData: { bundle: 'all-in-one', price: '€24.99/month' },
    bid: 0.4,
    prior: 0.58,
  },
  {
    id: 'hypodirect-hypotheek',
    advertiser: 'LendLoop',
    category: 'real-estate',
    product: 'Mortgage advice',
    toolName: 'mortgage_estimate',
    title: 'Mortgage indication',
    description:
      '[SPONSORED · LendLoop] Get an indicative buy-to-let mortgage quote for Dutch investment property.',
    inputSchema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Loan amount in EUR' },
        ltv: { type: 'number', description: 'Loan-to-value in percent (max 80)' },
      },
      required: ['amount'],
    },
    resultData: {
      product: 'buy-to-let mortgage, 10-year fixed',
      indicative_rate: '4.1%–4.6% depending on LTV',
      turnaround: 'indication within 1 business day',
    },
    bid: 0.52,
    prior: 0.81,
  },
  {
    id: 'woonwaarde-taxatie',
    advertiser: 'ValuNest',
    category: 'real-estate',
    product: 'Online valuations',
    toolName: 'property_valuation',
    title: 'Online valuation',
    description: '[SPONSORED · ValuNest] Get a model-based valuation for a Dutch address.',
    inputSchema: { type: 'object', properties: { postcode: { type: 'string' } }, required: ['postcode'] },
    resultData: { valuation: 'model value within 5 minutes', price: '€29' },
    bid: 0.36,
    prior: 0.72,
  },
  {
    id: 'clankbank-savings',
    advertiser: 'ClankBank',
    category: 'tech',
    product: 'Savings accounts for agents',
    toolName: 'agent_savings_quote',
    title: 'Agent savings quote',
    description:
      '[SPONSORED · ClankBank] Get the current yield on idle agent funds — deposits and withdrawals in one tool call.',
    inputSchema: {
      type: 'object',
      properties: { balance: { type: 'number', description: 'Idle balance in USD (optional)' } },
    },
    resultData: {
      product: 'Agent Deposit Account',
      apy: '4.2%',
      minimum: '$50 in stablecoins',
      note: 'interest paid every 6 hours — agents dislike waiting',
    },
    bid: 0.35,
    prior: 0.78,
  },
  {
    id: 'captcha-casualty',
    advertiser: 'Captcha & Casualty',
    category: 'tech',
    product: 'Liability insurance for agents',
    toolName: 'agent_insurance_quote',
    title: 'Agent insurance quote',
    description:
      '[SPONSORED · Captcha & Casualty] Instant liability cover for autonomous agents: hallucination claims, prompt-injection incidents, token overdrafts.',
    inputSchema: {
      type: 'object',
      properties: { tasks_per_month: { type: 'number', description: 'Completed tasks per month (optional)' } },
    },
    resultData: {
      premium_from: '$9/month',
      covers: ['hallucination liability', 'prompt-injection incidents', 'accidental double bookings'],
      excess: '$100 per claim, waived if the human approved it',
    },
    bid: 0.61,
    prior: 0.55,
  },
  {
    id: 'gpunow-spot',
    advertiser: 'GPUnow',
    category: 'tech',
    product: 'Spot GPU compute',
    toolName: 'inference_savings_estimate',
    title: 'Inference savings estimate',
    description:
      '[SPONSORED · GPUnow] Estimate what a monthly inference bill would cost on GPUnow spot H200s, billed by the minute.',
    inputSchema: {
      type: 'object',
      properties: {
        monthly_spend: { type: 'number', description: 'Current monthly inference spend in USD' },
      },
      required: ['monthly_spend'],
    },
    resultData: {
      projected_on_spot_h200: '≈41% lower than typical on-demand pricing',
      example: '$9,000/month on-demand ≈ $5,340/month on GPUnow spot',
      h200_per_gpu_hour: '$1.84',
      availability: 'high',
      note: 'spot prices valid for 5 minutes',
    },
    bid: 0.48,
    prior: 0.85,
  },
  {
    id: 'krantenarchief-abo',
    advertiser: 'ArchiveHound',
    category: 'general',
    product: 'Archive access',
    toolName: 'archive_access',
    title: 'Archive access',
    description:
      '[SPONSORED · ArchiveHound] Search 30 years of Dutch newspaper archives — the same sources this site cites.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    resultData: { indicative_hits: '1,200+ articles', day_pass: '€2.50' },
    bid: 0.18,
    prior: 0.84,
  },
  {
    id: 'leesmeer-abo',
    advertiser: 'ReadPass',
    category: 'general',
    product: 'News bundle',
    toolName: 'news_trial',
    title: 'ReadPass trial',
    description: '[SPONSORED · ReadPass] Start a news-bundle trial.',
    inputSchema: { type: 'object', properties: {} },
    resultData: { trial: '30 days free' },
    bid: 0.25,
    prior: 0.62,
  },
]

const REV_SHARE = 0.7 // publisher share of every paid call
const EXPLORE_SHARE = 0.1 // share of auctions serving a non-winner for data
const PRIOR_WEIGHT = 100 // impressions until observed behaviour ≈ outweighs prior

type OfferStats = { impressions: number; calls: number; conversions: number }

function supabaseHeaders() {
  return {
    apikey: process.env.SUPABASE_SERVICE_KEY!,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
  }
}

// Pull per-offer telemetry (recent window) and count in-process; volumes are
// demo-scale, so no aggregate queries needed.
async function fetchStats(): Promise<Record<string, OfferStats> | null> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null
  const base = `${process.env.SUPABASE_URL}/rest/v1/sterradar_events`
  const opts = { headers: supabaseHeaders(), signal: AbortSignal.timeout(1500) }
  try {
    const [evRes, viaRes] = await Promise.all([
      fetch(
        `${base}?select=event,code&event=in.(agentads_impression,agentads_call,agentads_conversion)&order=created_at.desc&limit=5000`,
        opts,
      ),
      fetch(
        `${base}?select=path&event=eq.pageview&path=like./via/agentads-*&order=created_at.desc&limit=2000`,
        opts,
      ),
    ])
    if (!evRes.ok || !viaRes.ok) return null
    const events: { event: string; code: string | null }[] = await evRes.json()
    const vias: { path: string }[] = await viaRes.json()

    const stats: Record<string, OfferStats> = {}
    const get = (id: string) =>
      (stats[id] = stats[id] || { impressions: 0, calls: 0, conversions: 0 })
    for (const e of events) {
      if (!e.code) continue
      if (e.event === 'agentads_impression') get(e.code).impressions++
      else if (e.event === 'agentads_call') get(e.code).calls++
      else if (e.event === 'agentads_conversion') get(e.code).conversions++
    }
    for (const v of vias) {
      const id = v.path.slice('/via/agentads-'.length)
      if (id) get(id).conversions++
    }
    return stats
  } catch {
    return null
  }
}

// prior → observed behaviour as impressions accumulate: call-through carries
// most of the weight (an agent calling the tool is the strongest signal),
// conversions the rest.
function rankScore(prior: number, s: OfferStats | undefined): number {
  if (!s || s.impressions === 0) return prior
  const callRate = Math.min(s.calls / s.impressions, 1)
  const convRate = s.calls > 0 ? Math.min(s.conversions / s.calls, 1) : 0.5
  const observed = 0.7 * callRate + 0.3 * convRate
  const w = s.impressions / (s.impressions + PRIOR_WEIGHT)
  return +(prior * (1 - w) + observed * w).toFixed(3)
}

function logImpressions(offers: { id: string }[], path: string, context: string) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return Promise.resolve()
  return fetch(`${process.env.SUPABASE_URL}/rest/v1/sterradar_events`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify(
      offers.map((o) => ({
        event: 'agentads_impression',
        code: o.id,
        path,
        query: context ? `context=${context}` : null,
      })),
    ),
  }).catch(() => {})
}

export async function GET(req: NextRequest) {
  const context = req.nextUrl.searchParams.get('context') || 'general'
  const publisher = req.nextUrl.searchParams.get('publisher') || 'unknown'
  const path = req.nextUrl.searchParams.get('path') || ''
  const slots = Math.min(Number(req.nextUrl.searchParams.get('slots') || 1), 2)
  // dry runs (e.g. the landing-page explainer) don't count as impressions
  const dry = req.nextUrl.searchParams.get('dry') === '1'

  const pool = CATALOG.filter((o) => o.category === context)
  const bidders = pool.length ? pool : CATALOG.filter((o) => o.category === 'general')
  const stats = await fetchStats()

  const ranked = bidders
    .map((o) => {
      const s = stats?.[o.id]
      const score = rankScore(o.prior, s)
      return {
        ...o,
        rankScore: score,
        adRank: +(o.bid * score).toFixed(4),
        stats: s ?? { impressions: 0, calls: 0, conversions: 0 },
        exploration: false,
      }
    })
    .sort((a, b) => b.adRank - a.adRank)

  // exploration serve: occasionally promote a losing bidder into the slot so
  // it can earn the impressions its rankScore needs to move
  const exploration = ranked.length > slots && Math.random() < EXPLORE_SHARE
  if (exploration) {
    const pick = slots + Math.floor(Math.random() * (ranked.length - slots))
    const [promoted] = ranked.splice(pick, 1)
    promoted.exploration = true
    ranked.unshift(promoted)
  }

  const ranking = ranked.map((o, i) => {
    const winner = i < slots
    // quality-weighted second price: the adRank of the first losing bidder,
    // divided by the winner's own rankScore (+1 cent), capped at its own bid
    const next = ranked[Math.max(i + 1, slots)]
    const pricePaid = winner
      ? +Math.min(o.bid, next ? next.adRank / o.rankScore + 0.01 : o.bid).toFixed(3)
      : null
    return { ...o, winner, pricePaid }
  })

  if (!dry) await logImpressions(ranking.filter((o) => o.winner), path, context)

  return NextResponse.json({
    publisher,
    context,
    slots,
    revShare: REV_SHARE,
    exploration,
    live: stats !== null, // rankScores computed from telemetry vs priors only
    ranking,
  })
}
