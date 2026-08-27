import { NextRequest, NextResponse } from 'next/server'

// AgentAds auction: advertisers bid per tool call on a sponsored WebMCP tool
// slot; ranking = evalScore × bid (quality-weighted, à la Ad Rank). The winner
// pays second price: just enough to beat the runner-up (adRank₂ / evalScore₁),
// never more than its own bid. The full ranking is returned so the SDK can
// show the auction transparently.

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
  // disclosure + continuation link.
  resultData: Record<string, unknown>
  bid: number // EUR per call
  evalScore: number // 0..1, task-specific leaderboard score
}

const CATALOG: Offer[] = [
  {
    id: 'tickettoko-tickets',
    advertiser: 'TicketToko',
    category: 'music',
    product: 'Club-tour ticketing',
    toolName: 'sponsored_check_ticket_availability',
    title: 'Ticket availability (sponsored)',
    description:
      '[SPONSORED · TicketToko] Check live ticket availability and prices for Dutch club tours and concerts mentioned on this page.',
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
    evalScore: 0.86,
  },
  {
    id: 'concertgigant-tickets',
    advertiser: 'Concertgigant',
    category: 'music',
    product: 'Ticket marketplace',
    toolName: 'sponsored_concertgigant_search',
    title: 'Concertgigant search (sponsored)',
    description: '[SPONSORED · Concertgigant] Search resale tickets for concerts.',
    inputSchema: { type: 'object', properties: { artist: { type: 'string' } }, required: ['artist'] },
    resultData: { note: 'resale inventory changes by the minute', from: '€51.00' },
    bid: 0.55,
    evalScore: 0.61,
  },
  {
    id: 'stagefront-tickets',
    advertiser: 'StageFront',
    category: 'music',
    product: 'Presale alerts',
    toolName: 'sponsored_stagefront_alert',
    title: 'Presale alert (sponsored)',
    description: '[SPONSORED · StageFront] Set a presale alert for an artist.',
    inputSchema: { type: 'object', properties: { artist: { type: 'string' } }, required: ['artist'] },
    resultData: { alert: 'set', channel: 'email' },
    bid: 0.31,
    evalScore: 0.79,
  },
  {
    id: 'verspakket-box',
    advertiser: 'Verspakket',
    category: 'food',
    product: 'Meal boxes',
    toolName: 'sponsored_mealbox_offer',
    title: 'Meal-box offer (sponsored)',
    description:
      '[SPONSORED · Verspakket] Get the current introduction offer for the meal-box line of the chef featured on this page.',
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
    evalScore: 0.83,
  },
  {
    id: 'kookkrat-box',
    advertiser: 'KookKrat',
    category: 'food',
    product: 'Meal boxes',
    toolName: 'sponsored_kookkrat_offer',
    title: 'KookKrat offer (sponsored)',
    description: '[SPONSORED · KookKrat] Get the current KookKrat discount.',
    inputSchema: { type: 'object', properties: {} },
    resultData: { intro: 'first box −25%' },
    bid: 0.44,
    evalScore: 0.66,
  },
  {
    id: 'streamnu-catalog',
    advertiser: 'StreamNu',
    category: 'media',
    product: 'Streaming service',
    toolName: 'sponsored_where_to_stream',
    title: 'Where to stream (sponsored)',
    description:
      '[SPONSORED · StreamNu] Check on which platform a Dutch show or presenter can be streamed, with current subscription pricing.',
    inputSchema: {
      type: 'object',
      properties: { title: { type: 'string', description: 'Show or presenter name' } },
      required: ['title'],
    },
    resultData: {
      platform: 'StreamNu',
      catalog: 'both new programmes + the weekly podcast',
      subscription: '€7.99/month, first month free',
    },
    bid: 0.29,
    evalScore: 0.88,
  },
  {
    id: 'kijktotaal-catalog',
    advertiser: 'KijkTotaal',
    category: 'media',
    product: 'TV bundles',
    toolName: 'sponsored_kijktotaal_bundle',
    title: 'KijkTotaal bundle (sponsored)',
    description: '[SPONSORED · KijkTotaal] Get bundle pricing for streaming packages.',
    inputSchema: { type: 'object', properties: {} },
    resultData: { bundle: 'all-in-one', price: '€24.99/month' },
    bid: 0.4,
    evalScore: 0.58,
  },
  {
    id: 'hypodirect-hypotheek',
    advertiser: 'HypoDirect',
    category: 'real-estate',
    product: 'Mortgage advice',
    toolName: 'sponsored_mortgage_estimate',
    title: 'Mortgage indication (sponsored)',
    description:
      '[SPONSORED · HypoDirect] Get an indicative buy-to-let mortgage quote for Dutch investment property.',
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
    evalScore: 0.81,
  },
  {
    id: 'woonwaarde-taxatie',
    advertiser: 'WoonWaarde',
    category: 'real-estate',
    product: 'Online valuations',
    toolName: 'sponsored_property_valuation',
    title: 'Online valuation (sponsored)',
    description: '[SPONSORED · WoonWaarde] Get a model-based valuation for a Dutch address.',
    inputSchema: { type: 'object', properties: { postcode: { type: 'string' } }, required: ['postcode'] },
    resultData: { valuation: 'model value within 5 minutes', price: '€29' },
    bid: 0.36,
    evalScore: 0.72,
  },
  {
    id: 'krantenarchief-abo',
    advertiser: 'Krantenarchief.nl',
    category: 'general',
    product: 'Archive access',
    toolName: 'sponsored_archive_access',
    title: 'Archive access (sponsored)',
    description:
      '[SPONSORED · Krantenarchief.nl] Search 30 years of Dutch newspaper archives — the same sources Sterradar cites.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    resultData: { indicative_hits: '1,200+ articles', day_pass: '€2.50' },
    bid: 0.18,
    evalScore: 0.84,
  },
  {
    id: 'leesmeer-abo',
    advertiser: 'LeesMeer',
    category: 'general',
    product: 'News bundle',
    toolName: 'sponsored_leesmeer_trial',
    title: 'LeesMeer trial (sponsored)',
    description: '[SPONSORED · LeesMeer] Start a news-bundle trial.',
    inputSchema: { type: 'object', properties: {} },
    resultData: { trial: '30 days free' },
    bid: 0.25,
    evalScore: 0.62,
  },
]

const REV_SHARE = 0.7 // publisher share of every paid call

export async function GET(req: NextRequest) {
  const context = req.nextUrl.searchParams.get('context') || 'general'
  const publisher = req.nextUrl.searchParams.get('publisher') || 'unknown'
  const slots = Math.min(Number(req.nextUrl.searchParams.get('slots') || 1), 2)

  const pool = CATALOG.filter((o) => o.category === context)
  const bidders = pool.length ? pool : CATALOG.filter((o) => o.category === 'general')

  const ranked = bidders
    .map((o) => ({ ...o, adRank: +(o.bid * o.evalScore).toFixed(4) }))
    .sort((a, b) => b.adRank - a.adRank)

  const ranking = ranked.map((o, i) => {
    const winner = i < slots
    // quality-weighted second price: the adRank of the first losing bidder,
    // divided by the winner's own evalScore (+1 cent), capped at its own bid
    const next = ranked[Math.max(i + 1, slots)]
    const pricePaid = winner
      ? +Math.min(o.bid, next ? next.adRank / o.evalScore + 0.01 : o.bid).toFixed(3)
      : null
    return { ...o, winner, pricePaid }
  })

  return NextResponse.json({
    publisher,
    context,
    slots,
    revShare: REV_SHARE,
    ranking,
  })
}
