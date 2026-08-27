import Link from 'next/link'
import { ARTICLES } from '../../lib/articles'

export const metadata = {
  title: 'Articles — AgentAds by Oasy',
  description:
    'Editorial articles on the AgentAds demo publisher: net worths, deals and business moves.',
}

const CATEGORY_LABEL: Record<string, string> = {
  music: 'Music',
  food: 'Food & drink',
  media: 'Media',
  'real-estate': 'Real estate',
  tech: 'Tech',
}

export default function ArtikelenIndex() {
  return (
    <>
      <section className="hero">
        <h1>Articles</h1>
        <p className="lede">
          New dossiers, notable deals and the arithmetic behind them. This page also
          offers the same articles as WebMCP tools — your agent can fetch, search and
          summarize them via the panel in the bottom-right corner.
        </p>
      </section>

      <section className="article-list">
        {ARTICLES.map((a) => (
          <article key={a.slug} className="article-card">
            <div className="article-meta">
              <span className="cat-badge">{CATEGORY_LABEL[a.category] ?? a.category}</span>
              <time dateTime={a.date}>
                {new Date(a.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </div>
            <h2>
              <Link href={`/artikelen/${a.slug}`}>{a.title}</Link>
            </h2>
            <p>{a.lede}</p>
          </article>
        ))}
      </section>
    </>
  )
}
