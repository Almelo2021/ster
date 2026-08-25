import { NextRequest, NextResponse } from 'next/server'

// Logs every page view server-side (fire-and-forget) and protects /stats
// with basic auth. Query strings are captured verbatim — never stripped.
export async function middleware(req: NextRequest) {
  const url = req.nextUrl

  if (url.pathname.startsWith('/stats')) {
    const auth = req.headers.get('authorization') || ''
    const expected =
      'Basic ' +
      Buffer.from(
        `${process.env.STATS_USER || 'sven'}:${process.env.STATS_PASS || ''}`,
      ).toString('base64')
    if (!process.env.STATS_PASS || auth !== expected) {
      return new NextResponse('Auth required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="stats"' },
      })
    }
    return NextResponse.next()
  }

  const body = {
    event: 'pageview',
    path: url.pathname,
    query: url.search || null,
    referrer: req.headers.get('referer'),
    user_agent: req.headers.get('user-agent'),
    ip: (req.headers.get('x-forwarded-for') || '').split(',')[0] || null,
  }
  // fire-and-forget; never block or break the page on logging failure
  fetch(`${process.env.SUPABASE_URL}/rest/v1/sterradar_events`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).catch(() => {})

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/|favicon.ico|robots.txt|api/).*)'],
}
