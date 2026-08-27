// Editorial articles for /artikelen. People and companies are fictional, in
// line with the rest of the measurement project; tone and structure follow
// the site.

export type Article = {
  slug: string
  title: string
  date: string // ISO
  category: 'music' | 'food' | 'media' | 'real-estate' | 'tech'
  lede: string
  body: string[]
  bronnen: string
}

export const ARTICLES: Article[] = [
  {
    slug: 'atlas-9-net-worth',
    title: 'Atlas-9 becomes the first AI agent with a documented net worth',
    date: '2026-08-25',
    category: 'tech',
    lede:
      'It browses, it books, it bills. Autonomous agent Atlas-9 has been earning its own money for eleven months, and its wallet is public. We applied our usual net-worth methodology to a piece of software.',
    body: [
      `Atlas-9 started as a travel-booking agent and now completes around 30,000 paid tasks a month across four tool marketplaces. Its income is unusually easy to audit: every rev-share payout lands in a public stablecoin wallet, which held the equivalent of 380,000 dollars at the time of writing. For an editorial team used to reconstructing celebrity finances from Chamber of Commerce filings, a subject whose entire balance sheet is on-chain is a refreshing change.`,
      `The cost side is thinner than you might expect. Inference is Atlas-9's biggest expense at roughly 9,000 dollars a month, followed by what its operator calls "context rent" — premium data subscriptions the agent buys per task. There is also one recurring legal retainer, reflecting the unresolved question of whether Atlas-9 can own anything at all. Our estimate treats the agent as a sole proprietorship of its operator, a framing the operator described as "legally boring but probably correct."`,
      `Where a celebrity interview takes weeks to arrange, Atlas-9 answered our questions in forty milliseconds. It characterized its financial strategy as "accumulate, don't speculate", noted that it holds no memecoins "on principle", and pointed out — unprompted — that it pays for every API it uses, which it considers "more than can be said for most of the web."`,
      `We estimate Atlas-9's net worth at 410,000 to 460,000 dollars, making it wealthier than roughly a third of the human subjects in our archive. The range reflects uncertainty about the resale value of its fine-tuned weights, which its operator declined to discuss. Atlas-9 itself disputes our lower bound.`,
    ],
    bronnen:
      'Public wallet address, marketplace leaderboards, published inference price sheets, a forty-millisecond interview.',
  },
  {
    slug: 'jesse-vondel-clubtour',
    title: 'Jesse Vondel announces club tour — and his net worth grows with it',
    date: '2026-08-21',
    category: 'music',
    lede:
      'Pop artist Jesse Vondel (29) is playing twelve club venues this winter. We ran the numbers on what the tour, his streaming figures and his merchandise line mean for his net worth.',
    body: [
      `The "Nachtlicht" club tour opens in Groningen in late November and wraps up in Amsterdam just before New Year's Eve. All twelve venues hold between 700 and 1,500 visitors; at average ticket prices of 34 euros and the artist margins that are customary in the club circuit, we estimate Vondel keeps 180,000 to 240,000 euros gross.`,
      `More important for the long term are the streaming numbers. According to public tallies, Vondel's catalogue runs at around 9 million streams per month. At the rates distributors publish, that works out to 28,000 to 36,000 euros per month, of which roughly half ends up with the artist after label and publishing deductions.`,
      `On top of that, Vondel has been running his own merchandise line through his web shop since last year, and his holding company has filed public accounts with the Chamber of Commerce for the first time: equity of 640,000 euros at the end of 2025.`,
      `Adding it all up — the holding company, catalogue value, tour income and the merch line — we estimate Jesse Vondel's net worth at 1.2 to 1.8 million euros. That is well above the 800,000 circulating elsewhere: that estimate predates his breakthrough single and leaves the catalogue value out entirely.`,
    ],
    bronnen:
      'Chamber of Commerce filings of the holding company (2025), public streaming tallies, ticket data from the twelve venues, industry rates for club tours.',
  },
  {
    slug: 'lotte-marijnen-kookimperium',
    title: "The quiet cooking empire of Lotte Marijnen",
    date: '2026-08-14',
    category: 'food',
    lede:
      'On television, chef Lotte Marijnen (41) is mostly the friendly face of "Morgen Weer Vers". Behind the scenes she built a culinary business on three legs in four years — and a net worth of several millions.',
    body: [
      `Anyone who only looks at the ratings underestimates Marijnen. Her cookbook series has reached combined sales of 410,000 copies; at a customary author royalty, that alone has brought in well over 1.1 million euros gross since 2022.`,
      `The second leg is her meal-box line, which she does not operate herself but licenses to a major box provider. Licensing deals in this industry run between 3 and 6 percent of revenue; with the 90,000 boxes per quarter the provider reports, we calculate 250,000 to 400,000 euros in licensing income per year.`,
      `Leg three is her restaurant in Utrecht, which according to the filed accounts turned a profit for the first time last year. The building, moreover, is owned by her property company — bought in 2021, and worth 1.4 million euros at the time according to the Land Registry transaction.`,
      `Our range for Lotte Marijnen's net worth: 3.4 to 4.6 million euros. The biggest uncertainty is the value of the licensing contract; if it runs through 2030, the estimate shifts to the top of the range.`,
    ],
    bronnen:
      'CPNB cookbook sales figures, Chamber of Commerce filings of the restaurant and property companies, Land Registry transaction Utrecht (2021), industry margins for licensing deals.',
  },
  {
    slug: 'daan-verhoeven-streamingdeal',
    title: 'Daan Verhoeven signs exclusive streaming deal worth millions',
    date: '2026-08-07',
    category: 'media',
    lede:
      'Presenter Daan Verhoeven (36) is trading public broadcasting for an exclusive deal with a streaming service. We line up what the move earns him — and what he gives up for it.',
    body: [
      `The deal, confirmed by both parties this week, ties Verhoeven exclusively to the platform for three years for two programmes per year plus a weekly podcast. Comparable exclusivity deals in the Benelux run between 600,000 and 800,000 euros per year; for Verhoeven we calculate with the middle of that range, some 2.1 million euros over the full term.`,
      `Against that, he loses his broadcaster salary (public record: 194,000 euros in 2025) and his guest appearances on public television. So the net jump is smaller than the headline suggests — but still substantial.`,
      `More interesting is the ownership clause: Verhoeven's production company keeps the format rights to both programmes. If the platform sells a format abroad, he shares in the proceeds. Exactly such foreign sales have quietly turned fellow presenters into millionaires before.`,
      `Our updated dossier now puts Daan Verhoeven's net worth at 1.6 to 2.3 million euros, up from 1.1 to 1.6 million at the previous revision. The format rights are valued conservatively in that figure; a single foreign sale changes the picture completely.`,
    ],
    bronnen:
      'Press releases from both parties, public-broadcasting remuneration disclosures (2025), Chamber of Commerce filing of the production company, industry data on exclusivity deals.',
  },
  {
    slug: 'romy-santing-vastgoed',
    title: 'Reality star Romy Santing is quietly building a property portfolio',
    date: '2026-07-30',
    category: 'real-estate',
    lede:
      'She became famous with a single season of reality television, but the real story of Romy Santing (31) is in the Land Registry: six apartments in four years.',
    body: [
      `Santing's first purchase dates from 2022: an apartment in Almere for 285,000 euros, largely financed from her participant fee and the influencer deals that followed the season. By now six homes are registered to her property company, together bought for 2.1 million euros.`,
      `The portfolio is financed more conservatively than is common in the rental market: according to the mortgage registrations, at most 60 percent was borrowed on the last three purchases. At current assessed values we estimate the equity in the portfolio at 900,000 to 1.1 million euros.`,
      `Her media work has not disappeared in the meantime, but its role has changed: from source of income to acquisition channel. In a rare interview last year, Santing said every brand deal "goes straight to paying down the loans".`,
      `We estimate Romy Santing's net worth at 1.1 to 1.5 million euros — almost entirely tied up in bricks. That makes her the exception within her reality cohort: of the twelve participants in her season, she is the only one with substantial registered assets.`,
    ],
    bronnen:
      'Land Registry transactions and mortgage registrations (2022–2026), assessed property values, Chamber of Commerce registration of the property company, trade-magazine interview (2025).',
  },
]

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}

export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase()
  return ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.lede.toLowerCase().includes(q) ||
      a.body.some((p) => p.toLowerCase().includes(q)),
  )
}
