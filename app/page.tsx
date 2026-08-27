import CodeForm from '../components/CodeForm'

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Who&apos;s who in Dutch celebrity — with the numbers to match</h1>
        <p className="lede">
          Sterradar documents the age, career and estimated net worth of well-known
          Dutch figures. No gossip, no guesswork, but profiles built from public
          sources that we keep up to date.
        </p>
      </section>

      <section>
        <h2>What is Sterradar?</h2>
        <p>
          Anyone looking up a well-known Dutch figure runs into a tangle of
          contradictory information online: one site reports a birth year three years
          off from the next, net-worth estimates range from a few hundred thousand to
          tens of millions, and career overviews stop somewhere halfway through a
          previous decade. Sterradar was set up to bring order to that.
        </p>
        <p>
          For each person we build one coherent dossier: date of birth and age, place
          of residence, career from breakthrough to today, business activities and a
          substantiated net-worth estimate with a range. Every fact comes with a
          source, and every estimate explains how we arrived at it. So you know not
          only what is claimed, but also why.
        </p>
        <p>
          The editorial team follows television, music, online media and Dutch
          business: from established presenters and artists to reality stars,
          influencers and the new generation of creators who grew up online.
        </p>
      </section>

      <section id="methode">
        <h2>Our method</h2>
        <p>Every net-worth estimate on Sterradar follows the same fixed procedure:</p>
        <ul>
          <li>
            <strong>Public registers.</strong> We start with what is verifiable:
            registrations and annual accounts at the Chamber of Commerce, property
            transactions from the Land Registry and other publicly accessible
            registers.
          </li>
          <li>
            <strong>Media archives.</strong> We consult the archives of national
            newspapers and trade media for interviews, business announcements and
            earlier reporting on deals, fees and sales.
          </li>
          <li>
            <strong>Industry knowledge.</strong> For streaming income, fees and
            sponsorship deals we calculate with publicly known rates and margins from
            the industry in question — and state the assumptions explicitly.
          </li>
          <li>
            <strong>Ranges instead of false precision.</strong> A net worth is not a
            bank balance we can inspect. That is why we publish a range with a lower
            and upper bound, and update it when new information becomes available.
          </li>
        </ul>
        <p>
          Profiles are continuously revised. If something is wrong, we want to hear it
          at redactie@sterradar.nl — corrections are applied with the date of the
          change noted.
        </p>
      </section>

      <section>
        <h2>What&apos;s in a profile?</h2>
        <h3>Age and background</h3>
        <p>
          Date of birth, place of birth and a short biography: where someone comes
          from, what the breakthrough looked like and the steps that followed.
        </p>
        <h3>Career overview</h3>
        <p>
          A chronological overview of programmes, releases, roles and ventures —
          including the projects that are less well known but matter most in business
          terms.
        </p>
        <h3>Net-worth estimate</h3>
        <p>
          The core of every dossier: a substantiated estimate with a range, the
          sources it rests on and the key assumptions. Not a bare number, but a
          calculation you can follow yourself.
        </p>
      </section>

      <section id="actiecode" className="codebox">
        <h2>Redeem a promo code</h2>
        <p>
          Received a promo code from one of our media partners? Redeem it here for a
          free month of full access to all profiles.
        </p>
        <CodeForm />
      </section>

      <section id="faq">
        <h2>Frequently asked questions</h2>
        <h3>How reliable are the net-worth estimates?</h3>
        <p>
          As reliable as public sources allow. We deliberately publish a range and
          show the underlying sources and assumptions for each estimate. Where
          sources contradict each other, we say so in the dossier.
        </p>
        <h3>Do you work with the people you describe?</h3>
        <p>
          No. Sterradar works independently and exclusively from public information.
          The people described can — like any reader — submit corrections, which we
          apply after verification.
        </p>
        <h3>How often are profiles updated?</h3>
        <p>
          Profiles of people currently in the news are revised continuously; other
          dossiers get a full periodic review. Each profile shows the date of its
          last update.
        </p>
        <h3>Why can&apos;t I see all profiles?</h3>
        <p>
          The full dossiers are available to members. With a promo code from one of
          our media partners you get a free month of full access.
        </p>
        <h3>Can I nominate a person?</h3>
        <p>
          Yes — suggestions are welcome at redactie@sterradar.nl. Mention why the
          profile is relevant and which public sources are a good starting point.
        </p>
      </section>
    </>
  )
}
