import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let code = '',
    path = ''
  try {
    const body = await req.json()
    code = String(body.code || '').slice(0, 100)
    path = String(body.path || '').slice(0, 300)
  } catch {}

  await fetch(`${process.env.SUPABASE_URL}/rest/v1/sterradar_events`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event: 'redeem',
      code,
      path,
      referrer: req.headers.get('referer'),
      user_agent: req.headers.get('user-agent'),
      ip: (req.headers.get('x-forwarded-for') || '').split(',')[0] || null,
    }),
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
