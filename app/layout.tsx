import './globals.css'
import Link from 'next/link'
import Script from 'next/script'
import AgentToolsPanel from '../components/AgentToolsPanel'

export const metadata = {
  title: 'Sterradar — age, career and net worth of well-known Dutch figures',
  description:
    'Sterradar documents the age, career and estimated net worth of well-known Dutch figures, based on public sources.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="logo">
            ✦ Sterradar
          </Link>
          <nav>
            <Link href="/artikelen">Articles</Link>
            <Link href="/#methode">Method</Link>
            <Link href="/#faq">FAQ</Link>
            <Link href="/#actiecode">Promo code</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>
            Sterradar is an independent editorial research project. Estimates are
            indicative and based on public sources; no rights can be derived from the
            content. Questions or corrections: redactie@sterradar.nl
          </p>
          <p>© {new Date().getFullYear()} Sterradar</p>
        </footer>
        <AgentToolsPanel />
        {/* AgentAds: one script tag monetizes the site's WebMCP surface */}
        <Script src="/agentads-sdk.js" data-publisher="sterradar" strategy="afterInteractive" />
      </body>
    </html>
  )
}
