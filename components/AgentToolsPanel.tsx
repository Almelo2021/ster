'use client'
import { useEffect, useState } from 'react'
import { ARTICLES, getArticle, searchArticles } from '../lib/articles'
import {
  onRuntime,
  registerTools,
  textResult,
  type ToolCallDetail,
  type WebMCPTool,
} from '../lib/webmcp'

// The site's own WebMCP tools plus a human-visible panel: the same tool list
// an agent sees, with try buttons and a live call log that also shows the
// sponsored calls made through the AgentAds SDK.

function buildSiteTools(): WebMCPTool[] {
  return [
    {
      name: 'list_articles',
      title: 'Articles on Sterradar',
      description:
        'List all editorial articles on Sterradar with slug, title, category, date and URL.',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () =>
        textResult(
          ARTICLES.map((a) => ({
            slug: a.slug,
            title: a.title,
            category: a.category,
            date: a.date,
            url: `/artikelen/${a.slug}`,
          })),
        ),
    },
    {
      name: 'read_article',
      title: 'Read article',
      description:
        'Read the full text of a Sterradar article by its slug (see list_articles).',
      inputSchema: {
        type: 'object',
        properties: { slug: { type: 'string', description: 'Article slug' } },
        required: ['slug'],
      },
      annotations: { readOnlyHint: true },
      execute: async (input) => {
        const art = getArticle(String(input.slug || ''))
        if (!art) return textResult({ error: 'unknown slug', known: ARTICLES.map((a) => a.slug) })
        return textResult({
          title: art.title,
          date: art.date,
          category: art.category,
          lede: art.lede,
          body: art.body.join('\n\n'),
          sources: art.bronnen,
        })
      },
    },
    {
      name: 'search_articles',
      title: 'Search articles',
      description: 'Full-text search across all Sterradar articles. Returns matching articles.',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Search terms' } },
        required: ['query'],
      },
      annotations: { readOnlyHint: true },
      execute: async (input) =>
        textResult(
          searchArticles(String(input.query || '')).map((a) => ({
            slug: a.slug,
            title: a.title,
            lede: a.lede,
            url: `/artikelen/${a.slug}`,
          })),
        ),
    },
  ]
}

// Sample arguments for the try buttons, so a single click suffices.
const SAMPLE_ARGS: Record<string, Record<string, unknown>> = {
  list_articles: {},
  read_article: { slug: 'jesse-vondel-clubtour' },
  search_articles: { query: 'net worth' },
  check_ticket_availability: { artist: 'Jesse Vondel' },
  where_to_stream: { title: 'Daan Verhoeven' },
  mortgage_estimate: { amount: 350000, ltv: 60 },
  mealbox_offer: { persons: 2 },
  archive_access: { query: 'net worth' },
}

export default function AgentToolsPanel() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<boolean | null>(null)
  const [tools, setTools] = useState<WebMCPTool[]>([])
  const [log, setLog] = useState<ToolCallDetail[]>([])

  useEffect(() => {
    setActive(registerTools(buildSiteTools()))
    // runtimes that inject only after page load (extensions, agent browsers)
    onRuntime((a) => setActive(a))

    // show the full shared registry — including sponsored tools the AgentAds
    // SDK registers later — and stay in sync when it changes
    const syncTools = () => setTools([...(window.__webmcpTools || [])])
    syncTools()
    window.addEventListener('webmcp:toolschanged', syncTools)

    const onCall = (e: Event) => {
      const detail = (e as CustomEvent<ToolCallDetail>).detail
      setLog((prev) => [detail, ...prev].slice(0, 20))
    }
    window.addEventListener('webmcp:toolcall', onCall)
    return () => {
      window.removeEventListener('webmcp:toolschanged', syncTools)
      window.removeEventListener('webmcp:toolcall', onCall)
    }
  }, [])

  async function tryTool(tool: WebMCPTool) {
    const args = SAMPLE_ARGS[tool.name] ?? {}
    // registry tools log their own calls; flag this one as human-initiated
    window.__webmcpCallSource = 'human'
    try {
      await tool.execute(args)
    } finally {
      delete window.__webmcpCallSource
    }
  }

  return (
    <div className="agent-panel">
      {open && (
        <div className="agent-panel-body">
          <div className="agent-panel-status">
            {active
              ? '● WebMCP active — this page is offering tools to your agent'
              : '○ Waiting for a WebMCP runtime… WebMCP is experimental: it works in ChatGPT’s in-app browser and in Chrome with the WebMCP flag or origin trial. If a runtime appears, the tools register automatically. In the meantime you can try them by hand below.'}
          </div>
          <ul className="agent-panel-tools">
            {tools.map((t) => (
              <li key={t.name}>
                <div>
                  <code>{t.name}</code>
                  <span>{t.description}</span>
                </div>
                <button onClick={() => tryTool(t)}>Try</button>
              </li>
            ))}
          </ul>
          <div className="agent-panel-log">
            <h4>Live call log</h4>
            {log.length === 0 && <p className="agent-panel-empty">No tool calls yet.</p>}
            {log.map((c, i) => (
              // newest call renders expanded so a Try click shows its return
              <details key={`${c.ts}-${c.name}`} open={i === 0}>
                <summary>
                  <span className={c.source === 'agent' ? 'badge badge-agent' : 'badge badge-human'}>
                    {c.source === 'agent' ? 'AGENT' : 'HUMAN'}
                  </span>
                  <code>{c.name}</code>
                  <time>{new Date(c.ts).toLocaleTimeString('en-GB')}</time>
                </summary>
                <pre>
                  {JSON.stringify(c.args)}
                  {'\n→ '}
                  {JSON.stringify(c.result, null, 2)?.slice(0, 1200)}
                </pre>
              </details>
            ))}
          </div>
        </div>
      )}
      <button className="agent-panel-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? '✕ Close' : `⚙ Agent tools (${tools.length})`}
      </button>
    </div>
  )
}
