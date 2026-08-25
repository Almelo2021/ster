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
  if (!Array.isArray(rows)) return <p>Kon events niet laden.</p>

  const byDay = new Map<string, { views: number; redeems: number; ai: number }>()
  for (const row of rows) {
    const day = row.created_at.slice(0, 10)
    const d = byDay.get(day) || { views: 0, redeems: 0, ai: 0 }
    if (row.event === 'redeem') d.redeems++
    else d.views++
    if (aiTag(row.user_agent)) d.ai++
    byDay.set(day, d)
  }
  const redeems = rows.filter((x) => x.event === 'redeem')
  const aiVisits = rows.filter((x) => x.event !== 'redeem' && aiTag(x.user_agent))

  return (
    <>
      <h1>Sterradar stats</h1>
      <p style={{ margin: '0.5rem 0 1.5rem' }}>
        Laatste {rows.length} events. AI-agents: {aiVisits.length} pageviews, codes
        ingewisseld: {redeems.length}.
      </p>

      <h2>Per dag</h2>
      <table className="stats">
        <thead>
          <tr><th>Dag</th><th>Pageviews</th><th>AI-agent views</th><th>Redeems</th></tr>
        </thead>
        <tbody>
          {[...byDay.entries()].map(([day, d]) => (
            <tr key={day}>
              <td>{day}</td><td>{d.views}</td><td>{d.ai}</td><td>{d.redeems}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '2rem' }}>Ingewisselde codes</h2>
      <table className="stats">
        <thead>
          <tr><th>Tijd</th><th>Code</th><th>Pad</th><th>User-agent</th><th>IP</th></tr>
        </thead>
        <tbody>
          {redeems.map((x, i) => (
            <tr key={i} className={aiTag(x.user_agent) ? 'ai-row' : ''}>
              <td>{x.created_at.slice(0, 16).replace('T', ' ')}</td>
              <td>{x.code}</td>
              <td>{x.path}</td>
              <td>{(x.user_agent || '').slice(0, 60)}</td>
              <td>{x.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '2rem' }}>AI-agent bezoeken</h2>
      <table className="stats">
        <thead>
          <tr><th>Tijd</th><th>Agent</th><th>Pad</th><th>Query</th><th>Referrer</th></tr>
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

      <h2 style={{ marginTop: '2rem' }}>Recente pageviews (alle)</h2>
      <table className="stats">
        <thead>
          <tr><th>Tijd</th><th>Pad</th><th>Query</th><th>Referrer</th><th>User-agent</th></tr>
        </thead>
        <tbody>
          {rows
            .filter((x) => x.event !== 'redeem')
            .slice(0, 200)
            .map((x, i) => (
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
