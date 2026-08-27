'use client'
import { useEffect, useState } from 'react'
import { ARTICLES, getArticle, searchArticles } from '../lib/articles'
import {
  getModelContext,
  registerTools,
  emitToolCall,
  textResult,
  type ToolCallDetail,
  type WebMCPTool,
} from '../lib/webmcp'

// De site-eigen WebMCP-tools plus een voor mensen zichtbaar paneel: dezelfde
// toollijst die een agent ziet, met probeer-knoppen en een live call-log
// waarin ook de gesponsorde calls van de AgentAds-SDK verschijnen.

function buildSiteTools(): WebMCPTool[] {
  return [
    {
      name: 'list_articles',
      title: 'Artikelen op Sterradar',
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
      title: 'Artikel lezen',
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
          bronnen: art.bronnen,
        })
      },
    },
    {
      name: 'search_articles',
      title: 'Artikelen doorzoeken',
      description: 'Full-text search across all Sterradar articles. Returns matching articles.',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Search terms (Dutch)' } },
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

// Voorbeeldargumenten voor de probeer-knoppen, zodat één klik volstaat.
const SAMPLE_ARGS: Record<string, Record<string, unknown>> = {
  list_articles: {},
  read_article: { slug: 'jesse-vondel-clubtour' },
  search_articles: { query: 'vermogen' },
}

export default function AgentToolsPanel() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<boolean | null>(null)
  const [tools, setTools] = useState<WebMCPTool[]>([])
  const [log, setLog] = useState<ToolCallDetail[]>([])

  useEffect(() => {
    const siteTools = buildSiteTools()
    setTools(siteTools)
    setActive(registerTools(siteTools) && !!getModelContext())

    const onCall = (e: Event) => {
      const detail = (e as CustomEvent<ToolCallDetail>).detail
      setLog((prev) => [detail, ...prev].slice(0, 20))
    }
    window.addEventListener('webmcp:toolcall', onCall)
    return () => window.removeEventListener('webmcp:toolcall', onCall)
  }, [])

  async function tryTool(tool: WebMCPTool) {
    const args = SAMPLE_ARGS[tool.name] ?? {}
    const result = await tool.execute(args)
    emitToolCall({ name: tool.name, args, result, source: 'mens', sponsored: false, ts: Date.now() })
  }

  return (
    <div className="agent-panel">
      {open && (
        <div className="agent-panel-body">
          <div className="agent-panel-status">
            {active
              ? '● WebMCP actief — deze pagina biedt tools aan jouw agent'
              : '○ Geen WebMCP-runtime gedetecteerd (Chrome-flag of ChatGPT-browser vereist) — tools werken hieronder ook met de hand'}
          </div>
          <ul className="agent-panel-tools">
            {tools.map((t) => (
              <li key={t.name}>
                <div>
                  <code>{t.name}</code>
                  <span>{t.description}</span>
                </div>
                <button onClick={() => tryTool(t)}>Probeer</button>
              </li>
            ))}
          </ul>
          <div className="agent-panel-log">
            <h4>Live call-log</h4>
            {log.length === 0 && <p className="agent-panel-empty">Nog geen tool-calls.</p>}
            {log.map((c, i) => (
              <details key={i}>
                <summary>
                  <span className={c.source === 'agent' ? 'badge badge-agent' : 'badge badge-mens'}>
                    {c.source === 'agent' ? 'AGENT' : 'MENS'}
                  </span>
                  {c.sponsored && <span className="badge badge-sponsored">GESPONSORD</span>}
                  <code>{c.name}</code>
                  <time>{new Date(c.ts).toLocaleTimeString('nl-NL')}</time>
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
        {open ? '✕ Sluit' : `⚙ Agent-tools (${tools.length})`}
      </button>
    </div>
  )
}
