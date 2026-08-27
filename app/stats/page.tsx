export const dynamic = 'force-dynamic'

const AI_AGENTS = [
  'ChatGPT-User',
  'Claude-User',
  'Perplexity-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'GPTBot',
  'openai-mcp',
]

type Row = {
  created_at: string
  event: string
  path: string | null
  query: string | null
  referrer: string | null
  user_agent: string | null
  ip: string | null
  code: string | null
}

function aiTag(ua: string | null) {
  if (!ua) return null
  return AI_AGENTS.find((a) => ua.toLowerCase().includes(a.toLowerCase())) || null
}

export default async function Stats() {
  const r = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/sterradar_events?order=created_at.desc&limit=2000`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      },
      cache: 'no-store',
    },
  )
  const rows: Row[] = await r.json()
  if (!Array.isArray(rows)) return <p>Could not load events.</p>

  // AgentAds telemetry per offer — the exact inputs of the auction's rankScore
  const offers = new Map<string, { impressions: number; calls: number; conversions: number }>()
  const offer = (id: string) => {
    const o = offers.get(id) || { impressions: 0, calls: 0, conversions: 0 }
    offers.set(id, o)
    return o
  }
  for (const row of rows) {
    if (row.event === 'agentads_impression' && row.code) offer(row.code).impressions++
    else if (row.event === 'agentads_call' && row.code) offer(row.code).calls++
    else if (row.event === 'agentads_conversion' && row.code) offer(row.code).conversions++
    else if (row.event === 'pageview' && row.path?.startsWith('/via/agentads-'))
      offer(row.path.slice('/via/agentads-'.length)).conversions++
  }

  const byDay = new Map<string, { views: number; adEvents: number; ai: number }>()
  for (const row of rows) {
    const day = row.created_at.slice(0, 10)
    const d = byDay.get(day) || { views: 0, adEvents: 0, ai: 0 }
    if (row.event.startsWith('agentads_')) d.adEvents++
    else d.views++
    if (aiTag(row.user_agent)) d.ai++
    byDay.set(day, d)
  }
  const pageviews = rows.filter((x) => !x.event.startsWith('agentads_'))
  const aiVisits = pageviews.filter((x) => aiTag(x.user_agent))

  return (
    <>
      <h1>Sterradar stats</h1>
      <p style={{ margin: '0.5rem 0 1.5rem' }}>
        Last {rows.length} events. AI agents: {aiVisits.length} pageviews. These are the
        raw events the AgentAds auction computes its live rankScores from.
      </p>

      <h2>AgentAds telemetry per offer</h2>
      <table className="stats">
        <thead>
          <tr><th>Offer</th><th>Impressions</th><th>Calls</th><th>Conversions</th></tr>
        </thead>
        <tbody>
          {[...offers.entries()].map(([id, o]) => (
            <tr key={id}>
              <td>{id}</td><td>{o.impressions}</td><td>{o.calls}</td><td>{o.conversions}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '2rem' }}>Per day</h2>
      <table className="stats">
        <thead>
          <tr><th>Day</th><th>Pageviews</th><th>AI-agent views</th><th>AgentAds events</th></tr>
        </thead>
        <tbody>
          {[...byDay.entries()].map(([day, d]) => (
            <tr key={day}>
              <td>{day}</td><td>{d.views}</td><td>{d.ai}</td><td>{d.adEvents}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '2rem' }}>AI-agent visits</h2>
      <table className="stats">
        <thead>
          <tr><th>Time</th><th>Agent</th><th>Path</th><th>Query</th><th>Referrer</th></tr>
        </thead>
        <tbody>
          {aiVisits.map((x, i) => (
            <tr key={i} className="ai-row">
              <td>{x.created_at.slice(0, 16).replace('T', ' ')}</td>
              <td>{aiTag(x.user_agent)}</td>
              <td>{x.path}</td>
              <td>{x.query}</td>
              <td>{x.referrer}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '2rem' }}>Recent pageviews (all)</h2>
      <table className="stats">
        <thead>
          <tr><th>Time</th><th>Path</th><th>Query</th><th>Referrer</th><th>User-agent</th></tr>
        </thead>
        <tbody>
          {pageviews.slice(0, 200).map((x, i) => (
            <tr key={i} className={aiTag(x.user_agent) ? 'ai-row' : ''}>
              <td>{x.created_at.slice(0, 16).replace('T', ' ')}</td>
              <td>{x.path}</td>
              <td>{x.query}</td>
              <td>{(x.referrer || '').slice(0, 40)}</td>
              <td>{(x.user_agent || '').slice(0, 60)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
