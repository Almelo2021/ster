import CodeForm from '../../../components/CodeForm'

function pretty(slug: string) {
  return slug
    .split('-')
    .map((w) => (w.length <= 2 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ')
}

export default async function Profiel({
  params,
}: {
  params: Promise<{ naam: string }>
}) {
  const { naam } = await params
  const name = pretty(decodeURIComponent(naam))
  return (
    <>
      <section className="hero">
        <h1>{name}: leeftijd, carrière en geschat vermogen</h1>
        <p className="lede">
          Het volledige dossier van {name} — inclusief geboortedatum,
          carrière-overzicht en een onderbouwde vermogensschatting met bronvermelding —
          is beschikbaar voor leden van Sterradar.
        </p>
      </section>

      <section className="profile-gate">
        <h2>Dit profiel is onderdeel van het ledenarchief</h2>
        <p>
          Sterradar-dossiers worden samengesteld uit openbare registers, media-archieven
          en branchegegevens, en per onderdeel voorzien van bronnen. Om de redactie te
          kunnen blijven bekostigen zijn de volledige profielen voorbehouden aan leden.
        </p>
        <p>
          Heb je via een van onze mediapartners een actiecode ontvangen? Dan krijg je een
          gratis maand volledige toegang, inclusief het dossier van {name}.
        </p>
      </section>

      <section className="codebox">
        <h2>Actiecode inwisselen</h2>
        <CodeForm />
      </section>
    </>
  )
}
