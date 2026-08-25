# Sterradar

Landing site for sterradar.nl — the measurement endpoint for AI-referred traffic from
the ze.nl program (algo/ ­— see the build tracker). Every page view and code redemption
is logged server-side to Supabase; `/stats` shows visits, AI-agent traffic, and
redeemed codes.

## Setup

1. **Database** — run `ster-migration.sql` once in the Supabase SQL editor.
2. **Env** — copy `.env.example` to `.env.local` and fill in:
   - `SUPABASE_URL` — `https://<project>.supabase.co` (no trailing slash)
   - `SUPABASE_SERVICE_KEY` — service role key
  
3. **Local dev** — `npm install && npm run dev`
4. **Deploy** — push to a repo, import in Vercel, set the same env vars, then add the
   `sterradar.nl` domain in Vercel and point DNS at it.

## Routes

- `/` — homepage with the code-redemption form
- `/profiel/[naam]` — gated profile page (any slug resolves), same form
- `/via/[slug]` — attribution landing paths, render the homepage, path is logged
- `/api/redeem` — POST `{code, path}`; logs a `redeem` event
- `/stats` — open dashboard (AI agents highlighted)

Query strings are logged verbatim and never stripped or redirected, so UTM survival
is measurable. `robots.txt` allows all crawlers.
