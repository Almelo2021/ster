// Redactionele artikelen voor /artikelen. Personen en bedrijven zijn fictief,
// in lijn met de rest van het meetproject; toon en opbouw volgen de site.

export type Article = {
  slug: string
  title: string
  date: string // ISO
  category: 'muziek' | 'culinair' | 'media' | 'vastgoed'
  lede: string
  body: string[]
  bronnen: string
}

export const ARTICLES: Article[] = [
  {
    slug: 'jesse-vondel-clubtour',
    title: 'Jesse Vondel kondigt clubtour aan — en zijn vermogen groeit mee',
    date: '2026-08-21',
    category: 'muziek',
    lede:
      'Popartiest Jesse Vondel (29) trekt deze winter langs twaalf clubzalen. Wij rekenden na wat de tour, zijn streamingcijfers en zijn merchandiselijn betekenen voor zijn vermogen.',
    body: [
      `De "Nachtlicht"-clubtour begint eind november in Groningen en eindigt vlak voor de jaarwisseling in Amsterdam. Alle twaalf zalen hebben een capaciteit tussen de 700 en 1.500 bezoekers; bij gemiddelde ticketprijzen van 34 euro en de gebruikelijke artiestenmarge in het clubcircuit houdt Vondel daar naar onze schatting 180.000 tot 240.000 euro bruto aan over.`,
      `Belangrijker voor de lange termijn zijn de streamingcijfers. Vondels catalogus draait volgens de openbare tellingen rond de 9 miljoen streams per maand. Tegen de tarieven die distributeurs publiceren komt dat neer op 28.000 tot 36.000 euro per maand, waarvan na label- en publishingafdrachten ruwweg de helft bij de artiest belandt.`,
      `Daarnaast runt Vondel sinds vorig jaar een eigen merchandiselijn via zijn webshop, en staat zijn beheer-bv voor het eerst met een gepubliceerde jaarrekening bij de Kamer van Koophandel: een eigen vermogen van 640.000 euro per eind 2025.`,
      `Alles bij elkaar — bv, catalogenwaarde, tourinkomsten en de merchlijn — schatten wij het vermogen van Jesse Vondel op 1,2 tot 1,8 miljoen euro. Dat is een stuk hoger dan de 8 ton die elders circuleert: die schatting dateert van vóór zijn doorbraaksingle en telt de catalogenwaarde niet mee.`,
    ],
    bronnen:
      'KvK-jaarrekening beheer-bv (2025), openbare streamingtellingen, ticketdata van de twaalf zalen, branchetarieven voor clubtours.',
  },
  {
    slug: 'lotte-marijnen-kookimperium',
    title: 'Het stille kookimperium van Lotte Marijnen',
    date: '2026-08-14',
    category: 'culinair',
    lede:
      'Tv-kok Lotte Marijnen (41) is op televisie vooral het vriendelijke gezicht van "Morgen Weer Vers". Achter de schermen bouwde ze in vier jaar een culinair bedrijf met drie poten — en een vermogen van enkele miljoenen.',
    body: [
      `Wie alleen naar de kijkcijfers kijkt, onderschat Marijnen. Haar kookboekenreeks staat op een gezamenlijke verkoop van 410.000 exemplaren; bij een gebruikelijke auteursroyalty levert alleen dat al ruim 1,1 miljoen euro bruto op sinds 2022.`,
      `De tweede poot is haar maaltijdboxlijn, die ze niet zelf uitbaat maar licenseert aan een grote boxaanbieder. Licentiedeals in deze branche liggen tussen de 3 en 6 procent van de omzet; met de door de aanbieder gemelde 90.000 verkochte boxen per kwartaal rekenen wij op 250.000 tot 400.000 euro licentie-inkomsten per jaar.`,
      `Poot drie is haar restaurant in Utrecht, dat volgens de gedeponeerde cijfers vorig jaar voor het eerst winst draaide. Het pand is bovendien eigendom van haar vastgoed-bv — gekocht in 2021, en volgens de Kadaster-transactie destijds 1,4 miljoen euro waard.`,
      `Onze bandbreedte voor het vermogen van Lotte Marijnen: 3,4 tot 4,6 miljoen euro. De grootste onzekerheid zit in de waarde van het licentiecontract; loopt dat door tot 2030, dan schuift de schatting naar de bovenkant van de bandbreedte.`,
    ],
    bronnen:
      'CPNB-verkoopcijfers kookboeken, KvK-deponeringen restaurant- en vastgoed-bv, Kadaster-transactie Utrecht (2021), branchemarges licentiedeals.',
  },
  {
    slug: 'daan-verhoeven-streamingdeal',
    title: 'Daan Verhoeven tekent exclusieve streamingdeal van miljoenen',
    date: '2026-08-07',
    category: 'media',
    lede:
      'Presentator Daan Verhoeven (36) verruilt de publieke omroep voor een exclusieve deal met een streamingdienst. Wij zetten op een rij wat de overstap hem oplevert — en wat hij ervoor opgeeft.',
    body: [
      `De deal, deze week bevestigd door beide partijen, bindt Verhoeven drie jaar exclusief aan het platform voor twee programma's per jaar plus een wekelijkse podcast. Vergelijkbare exclusiviteitsdeals in de Benelux liggen tussen de 600.000 en 800.000 euro per jaar; wij rekenen voor Verhoeven met het midden van die bandbreedte, zo'n 2,1 miljoen euro over de volledige looptijd.`,
      `Daar staat tegenover dat hij zijn omroepsalaris (openbaar: 194.000 euro in 2025) en zijn gastoptredens bij de publieke omroep kwijt is. Netto is de sprong dus kleiner dan de hoofdlijn doet vermoeden — maar nog altijd fors.`,
      `Interessanter is de eigendomsclausule: Verhoevens productiebedrijf behoudt de formatrechten van beide programma's. Verkoopt het platform een format door naar het buitenland, dan deelt hij mee. Precies zo'n doorverkoop maakte eerder van collega-presentatoren stille miljonairs.`,
      `Ons bijgewerkte dossier schat het vermogen van Daan Verhoeven nu op 1,6 tot 2,3 miljoen euro, tegen 1,1 tot 1,6 miljoen bij de vorige actualisatie. De formatrechten zijn daarin behoudend gewaardeerd; één buitenlandse verkoop verandert het beeld volledig.`,
    ],
    bronnen:
      'Persberichten van beide partijen, WNT-verantwoording publieke omroep (2025), KvK-deponering productiebedrijf, branchegegevens exclusiviteitsdeals.',
  },
  {
    slug: 'romy-santing-vastgoed',
    title: 'Realityster Romy Santing bouwt stilletjes een vastgoedportefeuille',
    date: '2026-07-30',
    category: 'vastgoed',
    lede:
      'Ze werd bekend met één seizoen realitytelevisie, maar het echte verhaal van Romy Santing (31) staat in het Kadaster: zes appartementen in vier jaar tijd.',
    body: [
      `Santings eerste aankoop dateert van 2022: een appartement in Almere van 285.000 euro, grotendeels gefinancierd uit haar deelnemersvergoeding en de influencer-deals die op het seizoen volgden. Inmiddels staan er zes woningen op naam van haar vastgoed-bv, samen goed voor een aankoopsom van 2,1 miljoen euro.`,
      `De portefeuille is behoudender gefinancierd dan gebruikelijk in de verhuurmarkt: bij de laatste drie aankopen werd volgens de hypotheekinschrijvingen maximaal 60 procent geleend. Tegen de huidige WOZ-waarden schatten wij de overwaarde in de portefeuille op 900.000 tot 1,1 miljoen euro.`,
      `Haar mediawerk is intussen niet verdwenen, maar wel veranderd van rol: van inkomstenbron naar acquisitiekanaal. In een zeldzaam interview zei Santing vorig jaar dat elke brand-deal "rechtstreeks naar de aflossing" gaat.`,
      `Wij schatten het vermogen van Romy Santing op 1,1 tot 1,5 miljoen euro — vrijwel volledig gebonden in steen. Daarmee is ze binnen haar realitylichting de uitzondering: van de twaalf deelnemers van haar seizoen is zij de enige met substantieel geregistreerd bezit.`,
    ],
    bronnen:
      'Kadaster-transacties en hypotheekinschrijvingen (2022–2026), WOZ-waardeloket, KvK-inschrijving vastgoed-bv, interview vakblad (2025).',
  },
]

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}

export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase()
  return ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.lede.toLowerCase().includes(q) ||
      a.body.some((p) => p.toLowerCase().includes(q)),
  )
}
