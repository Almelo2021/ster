import './globals.css'
import Link from 'next/link'
import Script from 'next/script'
import AgentToolsPanel from '../components/AgentToolsPanel'

export const metadata = {
  title: 'AgentAds — an ad auction inside a page’s WebMCP tools',
  description:
    'One script tag turns a WebMCP site into ad inventory for agents: a quality-weighted auction, disclosed sponsored tools, and a live rev-share for the site owner. Demonstrated on Sterradar.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="logo">
            ✦ Sterradar <span className="logo-tag">× AgentAds</span>
          </Link>
          <nav>
            <Link href="/artikelen">Articles</Link>
            <Link href="/#how">How it works</Link>
            <Link href="/#auction">Live auction</Link>
            <Link href="/stats">Stats</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>
            Sterradar is a fictional demo publisher for the AgentAds WebMCP Challenge
            entry. Articles, advertisers and prices are invented; no rights can be derived
            from the content.
          </p>
          <p>© {new Date().getFullYear()} Sterradar · AgentAds</p>
        </footer>
        <AgentToolsPanel />
        {/* AgentAds: one script tag monetizes the site's WebMCP surface */}
        <Script src="/agentads-sdk.js" data-publisher="sterradar" strategy="afterInteractive" />
      </body>
    </html>
  )
}
