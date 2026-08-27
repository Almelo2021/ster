import './globals.css'
import Link from 'next/link'
import Script from 'next/script'
import AgentToolsPanel from '../components/AgentToolsPanel'

export const metadata = {
  title: 'Sterradar — leeftijd, carrière en vermogen van bekende Nederlanders',
  description:
    'Sterradar documenteert leeftijd, carrière en geschat vermogen van bekende Nederlanders op basis van openbare bronnen.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <header className="site-header">
          <Link href="/" className="logo">
            ✦ Sterradar
          </Link>
          <nav>
            <Link href="/artikelen">Artikelen</Link>
            <Link href="/#methode">Methode</Link>
            <Link href="/#faq">Veelgestelde vragen</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>
            Sterradar is een onafhankelijk redactioneel onderzoeksproject. Schattingen zijn
            indicatief en gebaseerd op openbare bronnen; aan de inhoud kunnen geen rechten
            worden ontleend. Vragen of correcties: redactie@sterradar.nl
          </p>
          <p>© {new Date().getFullYear()} Sterradar</p>
        </footer>
        <AgentToolsPanel />
        {/* AgentAds: één scripttag monetiseert het WebMCP-oppervlak van de site */}
        <Script src="/agentads-sdk.js" data-publisher="sterradar" strategy="afterInteractive" />
      </body>
    </html>
  )
}
