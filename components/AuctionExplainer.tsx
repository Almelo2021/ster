'use client'
import { useEffect, useMemo, useState } from 'react'

// Live auction demo for the landing page. Fetches the real auction endpoint
// (dry=1, so demo runs don't count as impressions) and lets the visitor raise
// a losing bidder's bid to see quality-weighted ranking and second-price
// billing react in real time.

type RankedOffer = {
  id: string
  advertiser: string
  product: string
  bid: number
  rankScore: number
}

type Auction = {
  context: string
  live: boolean
  ranking: RankedOffer[]
}

const CONTEXTS = [
  { key: 'tech', label: 'Tech article' },
  { key: 'music', label: 'Music article' },
  { key: 'food', label: 'Food article' },
  { key: 'media', label: 'Media article' },
  { key: 'real-estate', label: 'Real-estate article' },
]

function euro(n: number) {
  return '€' + n.toFixed(2)
}

export default function AuctionExplainer() {
  const [context, setContext] = useState('tech')
  const [auction, setAuction] = useState<Auction | null>(null)
  const [bidOverride, setBidOverride] = useState<number | null>(null)

  useEffect(() => {
    setBidOverride(null)
    setAuction(null)
    fetch(`/api/agentads/auction?context=${context}&publisher=landing&path=/&dry=1`)
      .then((r) => r.json())
      .then(setAuction)
      .catch(() => {})
  }, [context])

  // the challenger is the strongest loser; the slider raises its bid
  const view = useMemo(() => {
    if (!auction) return null
    const base = auction.ranking.map((o) => ({ ...o }))
    const challenger = base[1]
    if (challenger && bidOverride !== null) challenger.bid = bidOverride
    const scored = base
      .map((o) => ({ ...o, adRank: o.bid * o.rankScore }))
      .sort((a, b) => b.adRank - a.adRank)
    const max = scored[0].adRank
    const price = Math.min(
      scored[0].bid,
      scored[1] ? scored[1].adRank / scored[0].rankScore + 0.01 : scored[0].bid,
    )
    return { scored, max, price, challenger }
  }, [auction, bidOverride])

  const challengerWins = view && view.challenger && view.scored[0].id === view.challenger.id

  return (
    <div className="aex">
      <div className="aex-chips" role="tablist" aria-label="Page context">
        {CONTEXTS.map((c) => (
          <button
            key={c.key}
            className={c.key === context ? 'on' : ''}
            onClick={() => setContext(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {!view && <p className="aex-loading">Running the auction…</p>}

      {view && (
        <>
          <div className="aex-board">
            {view.scored.map((o, i) => (
              <div key={o.id} className={'aex-row' + (i === 0 ? ' aex-win' : '')}>
                <div className="aex-name">
                  <strong>{o.advertiser}</strong>
                  <span>{o.product}</span>
                </div>
                <div className="aex-barwrap">
                  <div className="aex-bar" style={{ width: `${(o.adRank / view.max) * 100}%` }} />
                  <span className="aex-math">
                    {o.rankScore.toFixed(2)} × {euro(o.bid)} = {o.adRank.toFixed(3)}
                  </span>
                </div>
                <div className="aex-outcome">
                  {i === 0 ? `wins · pays ${euro(view.price)}/call` : 'loses'}
                </div>
              </div>
            ))}
          </div>

          {view.challenger && (
            <div className="aex-slider">
              <label htmlFor="aex-bid">
                Try to buy the slot — raise <strong>{view.challenger.advertiser}</strong>&rsquo;s
                bid: <strong>{euro(bidOverride ?? view.challenger.bid)}</strong>
              </label>
              <input
                id="aex-bid"
                type="range"
                min={0.05}
                max={1.5}
                step={0.01}
                value={bidOverride ?? view.challenger.bid}
                onChange={(e) => setBidOverride(Number(e.target.value))}
              />
              <p className="aex-verdict">
                {challengerWins
                  ? `It bought the slot — at ${euro(view.price)} per call. And that price only holds until agents start ignoring a worse tool: every unanswered impression drags its rankScore down, and the slot flips back.`
                  : 'Still loses. The ranking is rankScore × bid, so money alone can’t take the slot from a better tool — it has to outbid the quality gap.'}
              </p>
            </div>
          )}

          <p className="aex-note">
            This is the production auction endpoint, not a mock
            {auction?.live
              ? ' — rankScores include live telemetry from real agent traffic.'
              : '.'}
          </p>
        </>
      )}
    </div>
  )
}
