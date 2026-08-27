import { NextRequest, NextResponse } from 'next/server'

// Records sponsored tool calls and conversions. Logs to the same Supabase
// table as the middleware (event: agentads_call / agentads_conversion,
// code: offer id) so everything can be found back in /stats.
export async function POST(req: NextRequest) {
  let type = 'call',
    offerId = '',
    context = '',
    path = ''
  try {
    const body = await req.json()
    type = body.type === 'conversion' ? 'conversion' : 'call'
    offerId = String(body.offerId || '').slice(0, 100)
    context = String(body.context || '').slice(0, 100)
    path = String(body.path || '').slice(0, 300)
  } catch {}

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/sterradar_events`, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: `agentads_${type}`,
        code: offerId,
        path,
        query: context ? `context=${context}` : null,
        referrer: req.headers.get('referer'),
        user_agent: req.headers.get('user-agent'),
        ip: (req.headers.get('x-forwarded-for') || '').split(',')[0] || null,
      }),
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
