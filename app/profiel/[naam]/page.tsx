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
        <h1>{name}: age, career and estimated net worth</h1>
        <p className="lede">
          The full dossier on {name} — including date of birth, career overview and a
          substantiated net-worth estimate with sources — is available to Sterradar
          members.
        </p>
      </section>

      <section className="profile-gate">
        <h2>This profile is part of the members&apos; archive</h2>
        <p>
          Sterradar dossiers are compiled from public registers, media archives and
          industry data, with sources cited for every section. To keep funding the
          editorial team, the full profiles are reserved for members.
        </p>
        <p>
          Received a promo code from one of our media partners? Then you get a free
          month of full access, including the dossier on {name}.
        </p>
      </section>

      <section className="codebox">
        <h2>Redeem a promo code</h2>
        <CodeForm />
      </section>
    </>
  )
}
