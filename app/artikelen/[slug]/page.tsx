import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ARTICLES, getArticle } from '../../../lib/articles'

const CATEGORY_LABEL: Record<string, string> = {
  music: 'Music',
  food: 'Food & drink',
  media: 'Media',
  'real-estate': 'Real estate',
  tech: 'Tech',
}

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const art = getArticle(slug)
  return art
    ? { title: `${art.title} — AgentAds by Oasy`, description: art.lede }
    : { title: 'Article — AgentAds by Oasy' }
}

export default async function ArtikelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const art = getArticle(slug)
  if (!art) notFound()

  return (
    <article className="article-full">
      <div className="article-meta">
        <span className="cat-badge">{CATEGORY_LABEL[art.category] ?? art.category}</span>
        <time dateTime={art.date}>
          {new Date(art.date).toLocaleDateString('en-GB', {
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
        <strong>Sources:</strong> {art.bronnen}
      </p>

      {/* AgentAds: context signal + mount point for the sponsored-tools widget.
          The SDK (loaded in the layout) reads data-context and runs the
          auction for this spot. */}
      <div data-agentads-slot data-context={art.category} className="agentads-mount" />

      <p>
        <Link href="/artikelen">← All articles</Link>
      </p>
    </article>
  )
}
