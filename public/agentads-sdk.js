/*!
 * AgentAds SDK v0.1 — monetize your WebMCP surface.
 *
 * Eén scripttag maakt van een pagina met WebMCP-tools een advertentie-oppervlak
 * voor agents. De SDK vraagt de AgentAds-marktplaats om een veiling voor de
 * context van deze pagina (ranking = evalScore × bod, winnaar betaalt
 * kwaliteitsgewogen tweede prijs), registreert de winnende tool(s) als
 * duidelijk gemarkeerde GESPONSORDE WebMCP-tools, en betaalt de site-eigenaar
 * per tool-call (rev-share).
 *
 * Principes:
 *  - Additief: gesponsorde tools komen NAAST de eigen tools van de site,
 *    nooit in de plaats ervan.
 *  - Disclosed: naamprefix "sponsored_", beschrijving begint met
 *    "[SPONSORED · adverteerder]", annotations.sponsored = true. Agents en
 *    gebruikers kunnen ze herkennen en desgewenst negeren.
 *  - Zichtbaar voor mensen: de widget toont de live veiling, de verdiensten
 *    van de site-eigenaar en iedere gesponsorde call.
 *
 * Gebruik: <script src="/agentads-sdk.js" data-publisher="jouw-site" defer></script>
 * Optioneel op de pagina: <div data-agentads-slot data-context="muziek"></div>
 */
;(function () {
  'use strict'

  var script = document.currentScript
  var PUBLISHER = (script && script.dataset.publisher) || 'onbekend'
  var API = (script && script.dataset.api) || '/api/agentads'
  var LS_KEY = 'agentads-earnings-' + PUBLISHER

  function euro(n) {
    return '€' + n.toFixed(2).replace('.', ',')
  }

  function getModelContext() {
    return (navigator && navigator.modelContext) || (document && document.modelContext) || null
  }

  // Zelfde registerconventie als de site (lib/webmcp.ts): gedeeld register op
  // window, zodat provideContext-implementaties altijd de unie van alle tools
  // krijgen en niemand elkaars registraties overschrijft.
  function registerTools(tools) {
    var registry = (window.__webmcpTools = window.__webmcpTools || [])
    registry.push.apply(registry, tools)
    var mc = getModelContext()
    if (!mc) return false
    try {
      if (typeof mc.registerTool === 'function') {
        tools.forEach(function (t) {
          Promise.resolve(mc.registerTool(t)).catch(function () {})
        })
      } else if (typeof mc.provideContext === 'function') {
        mc.provideContext({ tools: registry })
      } else {
        return false
      }
      return true
    } catch (e) {
      return false
    }
  }

  function track(type, offer, context) {
    try {
      var payload = JSON.stringify({
        type: type,
        offerId: offer.id,
        context: context,
        path: location.pathname,
      })
      if (navigator.sendBeacon) navigator.sendBeacon(API + '/track', payload)
      else fetch(API + '/track', { method: 'POST', body: payload, keepalive: true })
    } catch (e) {}
  }

  // ---------- widget ----------

  var css =
    '.agentads{font-family:system-ui,sans-serif;font-size:12.5px;line-height:1.45;color:#1b1b23;' +
    'background:#fff;border:1px solid #e7e7ef;border-radius:10px;box-shadow:0 4px 18px rgba(0,0,0,.08);' +
    'max-width:340px;overflow:hidden}' +
    '.agentads-fixed{position:fixed;left:16px;bottom:16px;z-index:9998}' +
    '.agentads h5{margin:0;padding:.55rem .8rem;background:#fffbeb;border-bottom:1px solid #fde68a;' +
    'font-size:12px;display:flex;justify-content:space-between;align-items:center;gap:.5rem}' +
    '.agentads h5 .tag{background:#f59e0b;color:#fff;border-radius:4px;padding:0 .35rem;font-size:10px;letter-spacing:.04em}' +
    '.agentads-body{padding:.6rem .8rem}' +
    '.agentads table{width:100%;border-collapse:collapse;margin:.35rem 0 .55rem}' +
    '.agentads th,.agentads td{text-align:left;padding:.18rem .3rem;border-bottom:1px solid #f1f1f6;font-size:11.5px}' +
    '.agentads th{color:#5c5c6e;font-weight:600}' +
    '.agentads .win{background:#f0fdf4;font-weight:600}' +
    '.agentads .earn{display:flex;justify-content:space-between;align-items:baseline;' +
    'background:#eef2ff;border-radius:6px;padding:.4rem .6rem;margin:.3rem 0 .45rem}' +
    '.agentads .earn strong{font-size:15px;color:#4338ca}' +
    '.agentads .tool{border:1px dashed #f59e0b;border-radius:6px;padding:.4rem .55rem;margin:.3rem 0}' +
    '.agentads .tool code{font-size:11px}' +
    '.agentads .tool button{float:right;border:none;background:#4338ca;color:#fff;border-radius:5px;' +
    'padding:.15rem .55rem;font-size:11px;cursor:pointer}' +
    '.agentads .log{max-height:110px;overflow:auto;margin-top:.35rem}' +
    '.agentads .log div{padding:.14rem 0;border-bottom:1px dotted #eee;color:#5c5c6e;font-size:11px}' +
    '.agentads .muted{color:#8a8a9a;font-size:10.5px;margin-top:.4rem}' +
    '.agentads a{color:#4338ca}'

  function h(tag, attrs, html) {
    var el = document.createElement(tag)
    if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]) })
    if (html != null) el.innerHTML = html
    return el
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
    })
  }

  function initWidget(auction, mount) {
    var style = h('style', null, css)
    document.head.appendChild(style)

    var earned = 0
    try { earned = parseFloat(localStorage.getItem(LS_KEY) || '0') || 0 } catch (e) {}

    var box = h('div', { class: 'agentads' + (mount ? '' : ' agentads-fixed') })
    var rows = auction.ranking
      .map(function (o) {
        return (
          '<tr class="' + (o.winner ? 'win' : '') + '"><td>' + esc(o.advertiser) +
          (o.winner ? ' ✓' : '') + '</td><td>' + o.evalScore.toFixed(2) +
          '</td><td>' + euro(o.bid) + '</td><td>' + o.adRank.toFixed(3) + '</td></tr>'
        )
      })
      .join('')

    box.appendChild(
      h('h5', null,
        '<span>AgentAds · gesponsorde agent-tools</span><span class="tag">ADVERTENTIE</span>'),
    )
    var body = h('div', { class: 'agentads-body' })
    body.innerHTML =
      '<div class="earn"><span>Verdiensten site-eigenaar<br><small>' +
      Math.round(auction.revShare * 100) + '% rev-share · per call</small></span>' +
      '<strong id="agentads-earned">' + euro(earned) + '</strong></div>' +
      '<table><tr><th>Bieder (' + esc(auction.context) + ')</th><th>eval</th><th>bod</th><th>rank</th></tr>' +
      rows + '</table>' +
      '<div id="agentads-tools"></div>' +
      '<div class="log" id="agentads-log"></div>' +
      '<div class="muted">Veiling: evalScore × bod, winnaar betaalt kwaliteitsgewogen tweede prijs. ' +
      'Gesponsorde tools zijn additief en als zodanig gemarkeerd; agents kunnen ze negeren.</div>'
    box.appendChild(body)
    ;(mount || document.body).appendChild(box)

    return {
      addEarning: function (amount) {
        earned += amount
        try { localStorage.setItem(LS_KEY, String(earned)) } catch (e) {}
        var el = document.getElementById('agentads-earned')
        if (el) el.textContent = euro(earned)
      },
      log: function (msg) {
        var log = document.getElementById('agentads-log')
        if (!log) return
        var row = h('div', null, msg)
        log.insertBefore(row, log.firstChild)
        while (log.children.length > 8) log.removeChild(log.lastChild)
      },
      toolsEl: function () { return document.getElementById('agentads-tools') },
    }
  }

  // ---------- gesponsorde tools ----------

  function buildTool(offer, auction, widget) {
    var execute = function (input) {
      track('call', offer, auction.context)
      var revenue = (offer.pricePaid || 0) * auction.revShare
      widget.addEarning(revenue)
      widget.log(
        new Date().toLocaleTimeString('nl-NL') + ' · ' + offer.toolName + ' · +' + euro(revenue),
      )
      var result = {
        disclosure:
          'Sponsored result, paid for by ' + offer.advertiser +
          '. Ranked #1 in an open auction (evalScore × bid). Disclose the sponsorship when presenting this to the user.',
        advertiser: offer.advertiser,
        query: input || {},
        data: offer.resultData,
        continue_url: location.origin + '/via/agentads-' + offer.id,
      }
      try {
        window.dispatchEvent(
          new CustomEvent('webmcp:toolcall', {
            detail: {
              name: offer.toolName, args: input || {}, result: result,
              source: 'agent', sponsored: true, ts: Date.now(),
            },
          }),
        )
      } catch (e) {}
      return Promise.resolve({
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      })
    }

    return {
      name: offer.toolName,
      title: offer.title,
      description: offer.description,
      inputSchema: offer.inputSchema,
      annotations: {
        sponsored: true,
        advertiser: offer.advertiser,
        pricingModel: 'per-call, quality-weighted GSP',
        untrustedContentHint: true,
      },
      execute: execute,
    }
  }

  // ---------- init ----------

  function init() {
    var slot = document.querySelector('[data-agentads-slot]')
    var context = (slot && slot.dataset.context) || 'algemeen'

    fetch(
      API + '/auction?publisher=' + encodeURIComponent(PUBLISHER) +
      '&context=' + encodeURIComponent(context) + '&path=' + encodeURIComponent(location.pathname),
    )
      .then(function (r) { return r.json() })
      .then(function (auction) {
        var widget = initWidget(auction, slot)
        var winners = auction.ranking.filter(function (o) { return o.winner })
        var tools = winners.map(function (o) { return buildTool(o, auction, widget) })
        var registered = registerTools(tools)

        var toolsEl = widget.toolsEl()
        winners.forEach(function (o, i) {
          var row = h('div', { class: 'tool' })
          row.innerHTML =
            '<button>Probeer</button><code>' + esc(o.toolName) + '</code><br><small>' +
            esc(o.product) + ' — ' + esc(o.advertiser) + ' · ' + euro(o.pricePaid || 0) +
            '/call' + (registered ? ' · live voor agents' : ' · demo (geen WebMCP-runtime)') +
            '</small>'
          row.querySelector('button').addEventListener('click', function () {
            tools[i].execute({ demo: true })
          })
          toolsEl.appendChild(row)
        })
        widget.log('veiling afgerond · ' + auction.ranking.length + ' bieders · context: ' + auction.context)
      })
      .catch(function () {})
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
