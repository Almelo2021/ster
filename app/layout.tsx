import './globals.css'
import Link from 'next/link'
import Script from 'next/script'
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import AgentToolsPanel from '../components/AgentToolsPanel'

const interBody = Inter({ subsets: ['latin'], variable: '--font-body' })
const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-display' })
const jetMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'AgentAds by Oasy — an ad auction inside a page’s WebMCP tools',
  description:
    'One script tag turns a WebMCP site into ad inventory for agents: a quality-weighted auction, disclosed sponsored tools, and a live rev-share for the site owner. An Oasy entry for the OpenAI WebMCP Challenge.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${interBody.variable} ${interTight.variable} ${jetMono.variable}`}
    >
      <body>
        <header className="site-header">
          <Link href="/" className="logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/oasy-symbol.svg" alt="" width={22} height={22} />
            Oasy <span className="logo-tag">× AgentAds</span>
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
            AgentAds is an <a href="https://www.oasy.ai">Oasy</a> entry for the OpenAI
            WebMCP Challenge, demonstrated on a fictional publisher site. Articles,
            advertisers and prices are invented; no rights can be derived from the
            content.
          </p>
          <p>© {new Date().getFullYear()} Oasy · AgentAds</p>
        </footer>
        <AgentToolsPanel />
        {/* AgentAds: one script tag monetizes the site's WebMCP surface */}
        <Script src="/agentads-sdk.js" data-publisher="oasy-demo" strategy="afterInteractive" />
      </body>
    </html>
  )
}
