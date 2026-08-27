import { NextRequest, NextResponse } from 'next/server'

// AgentAds-veiling: adverteerders bieden per tool-call op een gesponsord
// WebMCP-toolslot; ranking = evalScore × bod (kwaliteitsgewogen, à la Ad Rank).
// De winnaar betaalt tweede-prijs: net genoeg om de runner-up te verslaan
// (adRank₂ / evalScore₁), nooit meer dan het eigen bod. De volledige ranking
// gaat mee terug zodat de SDK de veiling transparant kan tonen.

type Offer = {
  id: string
  advertiser: string
  category: string
  product: string
  toolName: string
  title: string
  description: string
  inputSchema: object
  // Statisch demoresultaat; de SDK geeft dit terug bij een tool-call en
  // plakt er de disclosure + conversielink aan vast.
  resultData: Record<string, unknown>
  bid: number // EUR per call
  evalScore: number // 0..1, taakspecifieke leaderboard-score
}

const CATALOG: Offer[] = [
  {
    id: 'tickettoko-tickets',
    advertiser: 'TicketToko',
    category: 'muziek',
    product: 'Kaartverkoop clubtours',
    toolName: 'sponsored_check_ticket_availability',
    title: 'Ticketbeschikbaarheid (gesponsord)',
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
      tour: 'Nachtlicht clubtour 2026',
      availability: [
        { city: 'Groningen', date: '2026-11-28', status: 'beschikbaar', vanaf: '€34,00' },
        { city: 'Utrecht', date: '2026-12-12', status: 'laatste kaarten', vanaf: '€36,50' },
        { city: 'Amsterdam', date: '2026-12-30', status: 'wachtlijst', vanaf: '—' },
      ],
    },
    bid: 0.42,
    evalScore: 0.86,
  },
  {
    id: 'concertgigant-tickets',
    advertiser: 'Concertgigant',
    category: 'muziek',
    product: 'Ticket-marktplaats',
    toolName: 'sponsored_concertgigant_search',
    title: 'Concertgigant zoeken (gesponsord)',
    description: '[SPONSORED · Concertgigant] Search resale tickets for concerts.',
    inputSchema: { type: 'object', properties: { artist: { type: 'string' } }, required: ['artist'] },
    resultData: { note: 'resale-aanbod wisselt per minuut', vanaf: '€51,00' },
    bid: 0.55,
    evalScore: 0.61,
  },
  {
    id: 'stagefront-tickets',
    advertiser: 'StageFront',
    category: 'muziek',
    product: 'Presale-alerts',
    toolName: 'sponsored_stagefront_alert',
    title: 'Presale-alert (gesponsord)',
    description: '[SPONSORED · StageFront] Set a presale alert for an artist.',
    inputSchema: { type: 'object', properties: { artist: { type: 'string' } }, required: ['artist'] },
    resultData: { alert: 'ingesteld', kanaal: 'e-mail' },
    bid: 0.31,
    evalScore: 0.79,
  },
  {
    id: 'verspakket-box',
    advertiser: 'Verspakket',
    category: 'culinair',
    product: 'Maaltijdboxen',
    toolName: 'sponsored_mealbox_offer',
    title: 'Maaltijdbox-aanbieding (gesponsord)',
    description:
      '[SPONSORED · Verspakket] Get the current introduction offer for the meal-box line of the chef featured on this page.',
    inputSchema: {
      type: 'object',
      properties: { persons: { type: 'number', description: 'Number of persons (2-6)' } },
    },
    resultData: {
      lijn: 'Lotte Marijnen — Morgen Weer Vers box',
      intro: 'eerste 3 boxen −40%',
      prijs_indicatie: '€3,95 p.p. per maaltijd na intro',
    },
    bid: 0.38,
    evalScore: 0.83,
  },
  {
    id: 'kookkrat-box',
    advertiser: 'KookKrat',
    category: 'culinair',
    product: 'Maaltijdboxen',
    toolName: 'sponsored_kookkrat_offer',
    title: 'KookKrat-aanbieding (gesponsord)',
    description: '[SPONSORED · KookKrat] Get the current KookKrat discount.',
    inputSchema: { type: 'object', properties: {} },
    resultData: { intro: 'eerste box −25%' },
    bid: 0.44,
    evalScore: 0.66,
  },
  {
    id: 'streamnu-catalog',
    advertiser: 'StreamNu',
    category: 'media',
    product: 'Streamingdienst',
    toolName: 'sponsored_where_to_stream',
    title: 'Waar te streamen (gesponsord)',
    description:
      '[SPONSORED · StreamNu] Check on which platform a Dutch show or presenter can be streamed, with current subscription pricing.',
    inputSchema: {
      type: 'object',
      properties: { title: { type: 'string', description: 'Show or presenter name' } },
      required: ['title'],
    },
    resultData: {
      platform: 'StreamNu',
      aanbod: 'beide nieuwe programma’s + wekelijkse podcast',
      abonnement: '€7,99/maand, eerste maand gratis',
    },
    bid: 0.29,
    evalScore: 0.88,
  },
  {
    id: 'kijktotaal-catalog',
    advertiser: 'KijkTotaal',
    category: 'media',
    product: 'TV-pakketten',
    toolName: 'sponsored_kijktotaal_bundle',
    title: 'KijkTotaal-bundel (gesponsord)',
    description: '[SPONSORED · KijkTotaal] Get bundle pricing for streaming packages.',
    inputSchema: { type: 'object', properties: {} },
    resultData: { bundel: 'alles-in-1', prijs: '€24,99/maand' },
    bid: 0.4,
    evalScore: 0.58,
  },
  {
    id: 'hypodirect-hypotheek',
    advertiser: 'HypoDirect',
    category: 'vastgoed',
    product: 'Hypotheekadvies',
    toolName: 'sponsored_mortgage_estimate',
    title: 'Hypotheekindicatie (gesponsord)',
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
      product: 'verhuurhypotheek 10 jaar vast',
      indicatie_rente: '4,1%–4,6% afhankelijk van LTV',
      doorlooptijd: 'indicatie binnen 1 werkdag',
    },
    bid: 0.52,
    evalScore: 0.81,
  },
  {
    id: 'woonwaarde-taxatie',
    advertiser: 'WoonWaarde',
    category: 'vastgoed',
    product: 'Online taxaties',
    toolName: 'sponsored_property_valuation',
    title: 'Online taxatie (gesponsord)',
    description: '[SPONSORED · WoonWaarde] Get a model-based valuation for a Dutch address.',
    inputSchema: { type: 'object', properties: { postcode: { type: 'string' } }, required: ['postcode'] },
    resultData: { taxatie: 'modelwaarde binnen 5 minuten', prijs: '€29' },
    bid: 0.36,
    evalScore: 0.72,
  },
  {
    id: 'krantenarchief-abo',
    advertiser: 'Krantenarchief.nl',
    category: 'algemeen',
    product: 'Archieftoegang',
    toolName: 'sponsored_archive_access',
    title: 'Archieftoegang (gesponsord)',
    description:
      '[SPONSORED · Krantenarchief.nl] Search 30 years of Dutch newspaper archives — the same sources Sterradar cites.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    resultData: { treffers_indicatie: '1.200+ artikelen', dagpas: '€2,50' },
    bid: 0.18,
    evalScore: 0.84,
  },
  {
    id: 'leesmeer-abo',
    advertiser: 'LeesMeer',
    category: 'algemeen',
    product: 'Nieuwsbundel',
    toolName: 'sponsored_leesmeer_trial',
    title: 'LeesMeer-proef (gesponsord)',
    description: '[SPONSORED · LeesMeer] Start a news-bundle trial.',
    inputSchema: { type: 'object', properties: {} },
    resultData: { proef: '30 dagen gratis' },
    bid: 0.25,
    evalScore: 0.62,
  },
]

const REV_SHARE = 0.7 // publisher-aandeel van elke betaalde call

export async function GET(req: NextRequest) {
  const context = req.nextUrl.searchParams.get('context') || 'algemeen'
  const publisher = req.nextUrl.searchParams.get('publisher') || 'onbekend'
  const slots = Math.min(Number(req.nextUrl.searchParams.get('slots') || 1), 2)

  const pool = CATALOG.filter((o) => o.category === context)
  const bidders = pool.length ? pool : CATALOG.filter((o) => o.category === 'algemeen')

  const ranked = bidders
    .map((o) => ({ ...o, adRank: +(o.bid * o.evalScore).toFixed(4) }))
    .sort((a, b) => b.adRank - a.adRank)

  const ranking = ranked.map((o, i) => {
    const winner = i < slots
    // kwaliteitsgewogen tweede-prijs: adRank van de eerstvolgende verliezer,
    // gedeeld door de eigen evalScore (+1 cent), begrensd op het eigen bod
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
