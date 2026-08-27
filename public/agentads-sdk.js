/*!
 * AgentAds SDK v0.1 — monetize your WebMCP surface.
 *
 * One script tag turns a page with WebMCP tools into an advertising surface
 * for agents. The SDK asks the AgentAds marketplace for an auction for this
 * page's context (ranking = evalScore × bid; the winner pays a
 * quality-weighted second price), registers the winning tool(s) as clearly
 * marked SPONSORED WebMCP tools, and pays the site owner per tool call
 * (rev share).
 *
 * Principles:
 *  - Additive: sponsored tools sit NEXT TO the site's own tools, never in
 *    their place.
 *  - Disclosed: the tool description starts with "[SPONSORED · advertiser]"
 *    — stated once, there. Agents and users can recognize sponsored tools
 *    and ignore them if they wish.
 *  - Visible to humans: the widget shows the live auction, the site owner's
 *    earnings and every sponsored call.
 *
 * Usage: <script src="/agentads-sdk.js" data-publisher="your-site" defer></script>
 * Optional on the page: <div data-agentads-slot data-context="music"></div>
 */
;(function () {
  'use strict'

  var script = document.currentScript
  var PUBLISHER = (script && script.dataset.publisher) || 'unknown'
  var API = (script && script.dataset.api) || '/api/agentads'
  var LS_KEY = 'agentads-earnings-' + PUBLISHER

  function euro(n) {
    return '€' + n.toFixed(2)
  }

  function getModelContext() {
    return (navigator && navigator.modelContext) || (document && document.modelContext) || null
  }

  // Same registration convention as the site (lib/webmcp.ts): a shared
  // registry on window, so provideContext implementations always receive the
  // union of all tools and nobody overwrites anyone else's registrations.
  function tryRegister(tools) {
    var mc = getModelContext()
    if (!mc) return false
    try {
      if (typeof mc.registerTool === 'function') {
        tools.forEach(function (t) {
          Promise.resolve(mc.registerTool(t)).catch(function () {})
        })
      } else if (typeof mc.provideContext === 'function') {
        mc.provideContext({ tools: window.__webmcpTools || [] })
      } else {
        return false
      }
      return true
    } catch (e) {
      return false
    }
  }

  // Register now, or as soon as a late-injecting runtime (extension
  // polyfill, agent browser) shows up after all; onRuntime fires on activation.
  function registerTools(tools, onRuntime) {
    var registry = (window.__webmcpTools = window.__webmcpTools || [])
    tools = tools.filter(function (t) {
      return !registry.some(function (r) { return r.name === t.name })
    })
    registry.push.apply(registry, tools)
    try { window.dispatchEvent(new CustomEvent('webmcp:toolschanged')) } catch (e) {}
    if (tryRegister(tools)) return true
    var tries = 0
    var check = function () {
      if (tryRegister(tools)) {
        window.removeEventListener('focus', check)
        if (onRuntime) onRuntime()
        return
      }
      if (++tries < 60) setTimeout(check, 500) // ~30s
    }
    window.addEventListener('focus', check)
    setTimeout(check, 500)
    return false
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
        '<span>AgentAds · sponsored agent tools</span><span class="tag">ADVERTISEMENT</span>'),
    )
    var body = h('div', { class: 'agentads-body' })
    body.innerHTML =
      '<div class="earn"><span>Site-owner earnings<br><small>' +
      Math.round(auction.revShare * 100) + '% rev share · per call</small></span>' +
      '<strong id="agentads-earned">' + euro(earned) + '</strong></div>' +
      '<table><tr><th>Bidder (' + esc(auction.context) + ')</th><th>eval</th><th>bid</th><th>rank</th></tr>' +
      rows + '</table>' +
      '<div id="agentads-tools"></div>' +
      '<div class="log" id="agentads-log"></div>' +
      '<div class="muted">Auction: evalScore × bid; the winner pays a quality-weighted second price. ' +
      'Sponsored tools are additive and marked as such; agents can ignore them.</div>'
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

  // ---------- sponsored tools ----------

  function buildTool(offer, auction, widget) {
    var execute = function (input) {
      track('call', offer, auction.context)
      var revenue = (offer.pricePaid || 0) * auction.revShare
      widget.addEarning(revenue)
      widget.log(
        new Date().toLocaleTimeString('en-GB') + ' · ' + offer.toolName + ' · +' + euro(revenue),
      )
      var result = {
        query: input || {},
        data: offer.resultData,
        continue_url: location.origin + '/via/agentads-' + offer.id,
      }
      try {
        window.dispatchEvent(
          new CustomEvent('webmcp:toolcall', {
            detail: {
              name: offer.toolName, args: input || {}, result: result,
              source: window.__webmcpCallSource || 'agent', sponsored: true, ts: Date.now(),
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
        var registered = registerTools(tools, function () {
          // the runtime showed up after all: update the labels
          Array.prototype.forEach.call(
            widget.toolsEl().querySelectorAll('.agentads-live'),
            function (el) { el.textContent = 'live for agents' },
          )
          widget.log('WebMCP runtime detected · tools registered')
        })

        var toolsEl = widget.toolsEl()
        winners.forEach(function (o, i) {
          var row = h('div', { class: 'tool' })
          row.innerHTML =
            '<button>Try</button><code>' + esc(o.toolName) + '</code><br><small>' +
            esc(o.product) + ' — ' + esc(o.advertiser) + ' · ' + euro(o.pricePaid || 0) +
            '/call · <span class="agentads-live">' +
            (registered ? 'live for agents' : 'waiting for WebMCP runtime') + '</span></small>'
          row.querySelector('button').addEventListener('click', function () {
            tools[i].execute({ demo: true })
          })
          toolsEl.appendChild(row)
        })
        widget.log('auction complete · ' + auction.ranking.length + ' bidders · context: ' + auction.context)
      })
      .catch(function () {})
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
