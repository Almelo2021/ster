import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ARTICLES, getArticle } from '../../../lib/articles'

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const art = getArticle(slug)
  return art
    ? { title: `${art.title} — Sterradar`, description: art.lede }
    : { title: 'Artikel — Sterradar' }
}

export default async function ArtikelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const art = getArticle(slug)
  if (!art) notFound()

  return (
    <article className="article-full">
      <div className="article-meta">
        <span className="cat-badge">{art.category}</span>
        <time dateTime={art.date}>
          {new Date(art.date).toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </time>
      </div>
      <h1>{art.title}</h1>
      <p className="lede">{art.lede}</p>
      {art.body.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      <p className="article-bronnen">
        <strong>Bronnen:</strong> {art.bronnen}
      </p>

      {/* AgentAds: contextsignaal + mountpunt voor de gesponsorde-tools-widget.
          De SDK (layout) leest data-context en draait hier de veiling voor. */}
      <div data-agentads-slot data-context={art.category} className="agentads-mount" />

      <p>
        <Link href="/artikelen">← Alle artikelen</Link>
      </p>
    </article>
  )
}
