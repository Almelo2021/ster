import Link from 'next/link'
import { ARTICLES } from '../../lib/articles'

export const metadata = {
  title: 'Artikelen — Sterradar',
  description:
    'Redactionele artikelen van Sterradar: vermogens, deals en zakelijke bewegingen van bekende Nederlanders.',
}

const CATEGORY_LABEL: Record<string, string> = {
  muziek: 'Muziek',
  culinair: 'Culinair',
  media: 'Media',
  vastgoed: 'Vastgoed',
}

export default function ArtikelenIndex() {
  return (
    <>
      <section className="hero">
        <h1>Artikelen</h1>
        <p className="lede">
          Nieuwe dossiers, opvallende deals en de rekensommen erachter. Deze pagina biedt
          dezelfde artikelen ook als WebMCP-tools aan — jouw agent kan ze opvragen,
          doorzoeken en samenvatten via het paneel rechtsonder.
        </p>
      </section>

      <section className="article-list">
        {ARTICLES.map((a) => (
          <article key={a.slug} className="article-card">
            <div className="article-meta">
              <span className="cat-badge">{CATEGORY_LABEL[a.category] ?? a.category}</span>
              <time dateTime={a.date}>
                {new Date(a.date).toLocaleDateString('nl-NL', {
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
