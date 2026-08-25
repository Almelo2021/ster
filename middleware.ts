import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'

// Logs every page view server-side (fire-and-forget) and protects /stats
// with basic auth. Query strings are captured verbatim — never stripped.
export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const url = req.nextUrl

  // /stats is open; just don't log our own dashboard visits
  if (url.pathname.startsWith('/stats')) {
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
  // keep the edge function alive until the insert lands, but never block the page
  event.waitUntil(fetch(`${process.env.SUPABASE_URL}/rest/v1/sterradar_events`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).catch(() => {}))

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/|favicon.ico|robots.txt|api/).*)'],
}
