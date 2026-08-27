import Link from 'next/link'
import AuctionExplainer from '../components/AuctionExplainer'

export default function Home() {
  return (
    <>
      <section className="x-hero">
        <p className="kicker">AgentAds by Oasy · An entry for the OpenAI WebMCP Challenge</p>
        <h1>The web runs on ads. Agents don&rsquo;t see ads.</h1>
        <p className="lede">
          As browsing shifts to agents, every publisher&rsquo;s ad revenue quietly
          disappears — agents don&rsquo;t scroll past banners. AgentAds is one script tag
          that sells the surface agents <em>do</em> use: a sponsored slot in a page&rsquo;s
          WebMCP tools, priced by an auction where quality beats money.
        </p>
        <p className="x-hero-links">
          <Link className="btn" href="/artikelen/atlas-9-net-worth">
            See it on a live article
          </Link>
          <a className="btn btn-ghost" href="#auction">
            Run the auction
          </a>
        </p>
      </section>

      <section id="how">
        <h2>How it works</h2>
        <ol className="x-steps">
          <li>
            <strong>A site exposes WebMCP tools.</strong> This site is the demo: an
            editorial publisher whose articles are readable by people and callable by agents
            — <code>list_articles</code>, <code>read_article</code>,{' '}
            <code>search_articles</code>. Open the ⚙ panel in the corner; that is the
            exact tool list an agent sees.
          </li>
          <li>
            <strong>One script tag runs an auction.</strong>{' '}
            <code>&lt;script src=&quot;/agentads-sdk.js&quot;&gt;</code> reads the
            page&rsquo;s context and asks the marketplace which advertiser gets the
            sponsored tool slot. Ranking is <code>rankScore × bid</code> — the money is
            only half the argument.
          </li>
          <li>
            <strong>The winner becomes one extra tool.</strong> It is registered next to
            the site&rsquo;s own tools, never in their place, and its description opens
            with the sponsor&rsquo;s name. The agent decides whether it&rsquo;s worth
            calling — nothing is injected into content.
          </li>
          <li>
            <strong>The site owner is paid per call.</strong> The winner pays a
            quality-weighted second price — just enough to beat the runner-up — and 70%
            of every call goes to the publisher, ticking up live on the page.
          </li>
        </ol>

        <div className="x-formula">
          <p>
            <span>rankScore</span> = 0.7 × call-through + 0.3 × conversions, blended with
            a prior that fades as impressions accumulate
          </p>
          <p>
            <span>adRank</span> = rankScore × bid &nbsp;·&nbsp; winner pays{' '}
            adRank₂ ÷ rankScore₁
          </p>
        </div>
        <p className="x-fine">
          rankScore isn&rsquo;t asserted, it&rsquo;s measured: the auction logs an
          impression each time it serves a tool, the SDK reports every call, and
          attribution links count conversions. A tool agents ignore loses its slot on its
          own — and a 10% exploration share lets losing bidders earn the data to climb.
        </p>
      </section>

      <section id="auction">
        <h2>The auction, live</h2>
        <p>
          Pick a page context. This runs the same endpoint the article pages use, with the
          same bidders and the same math.
        </p>
        <AuctionExplainer />
      </section>

      <section id="why">
        <h2>Why quality has to win</h2>
        <p>
          An agent is a perfect ad-blocker: it reads every tool description and calls only
          what helps its task. Attention sold to an optimizer is worth nothing — being the
          tool an optimizer <em>chooses</em> is worth everything. That is why the auction
          weighs measured usefulness above the bid, and why the whole thing is shown
          openly: the bidder table, the price paid, the publisher&rsquo;s earnings, every
          call. An ad market for agents survives only if nobody has to be tricked.
        </p>
      </section>

      <section id="try">
        <h2>Try it yourself</h2>
        <ul className="x-try">
          <li>
            Read{' '}
            <Link href="/artikelen/atlas-9-net-worth">
              the dossier on Atlas-9, the first AI agent with a documented net worth
            </Link>{' '}
            — and watch ClankBank, Captcha &amp; Casualty and GPUnow fight over it.
          </li>
          <li>
            Open the <strong>⚙ Agent tools</strong> panel (bottom right) on any page: the
            live tool list, one-click test calls, and a log of every human and agent call.
          </li>
          <li>
            In ChatGPT&rsquo;s in-app browser or Chrome with the WebMCP flag, ask your
            agent to check something an article mentions — the sponsored call pays the
            publisher in front of you.
          </li>
          <li>
            <Link href="/stats">The stats page</Link> shows the raw telemetry the
            rankScores are computed from.
          </li>
        </ul>
        <p className="x-fine">
          And this page eats its own dog food — the ad unit below is live, auctioned for
          this page like on any article:
        </p>
        {/* AgentAds slot: mounts the real widget inline instead of floating */}
        <div data-agentads-slot data-context="general" className="agentads-mount" />
      </section>

      <p className="x-fiction">
        This site is a fictional demo publisher, built for this entry by{' '}
        <a href="https://www.oasy.ai">Oasy</a> — the advertising layer for the AI era. The
        people in its articles, the advertisers and the prices are invented; the auction,
        the payments ledger and the telemetry are real code.
      </p>
    </>
  )
}
