// WebMCP compat layer. The spec has moved between navigator.modelContext and
// document.modelContext, and older implementations only know provideContext()
// (which replaces the whole toolset). So we keep one shared registry on
// window; any party (site or embedded SDK) that registers flushes the full
// registry when only provideContext exists. The AgentAds SDK
// (public/agentads-sdk.js) follows the same convention.

export type WebMCPTool = {
  name: string
  title?: string
  description: string
  inputSchema: object
  annotations?: Record<string, unknown>
  execute: (input: Record<string, unknown>) => Promise<unknown>
}

export type ToolCallDetail = {
  name: string
  args: Record<string, unknown>
  result: unknown
  source: 'agent' | 'human'
  sponsored: boolean
  ts: number
}

declare global {
  interface Window {
    __webmcpTools?: WebMCPTool[]
  }
  interface Navigator {
    modelContext?: any
  }
  interface Document {
    modelContext?: any
  }
}

export function getModelContext(): any | null {
  if (typeof window === 'undefined') return null
  return window.navigator?.modelContext ?? window.document?.modelContext ?? null
}

export function emitToolCall(detail: ToolCallDetail) {
  window.dispatchEvent(new CustomEvent('webmcp:toolcall', { detail }))
}

// Wraps execute so every invocation (by an agent, or by a human via the
// panel's try-button) lands in the same visible call log.
function withLogging(tool: WebMCPTool, sponsored: boolean): WebMCPTool {
  const inner = tool.execute
  return {
    ...tool,
    execute: async (input: Record<string, unknown>) => {
      const result = await inner(input || {})
      emitToolCall({
        name: tool.name,
        args: input || {},
        result,
        source: 'agent',
        sponsored,
        ts: Date.now(),
      })
      return result
    },
  }
}

// Tools from this module not yet registered with a runtime (the SDK keeps
// its own list; the provideContext fallback always uses the full shared
// registry, so calling it twice is harmless).
const pending: WebMCPTool[] = []
const runtimeSubs: Array<(active: boolean) => void> = []
let watching = false
let runtimeActive = false

function flush(mc: any): boolean {
  try {
    if (typeof mc.registerTool === 'function') {
      for (const t of pending.splice(0)) Promise.resolve(mc.registerTool(t)).catch(() => {})
    } else if (typeof mc.provideContext === 'function') {
      pending.length = 0
      mc.provideContext({ tools: window.__webmcpTools || [] })
    } else {
      return false
    }
    return true
  } catch {
    return false
  }
}

// Some runtimes (extension polyfills, agent browsers) inject modelContext
// only after we register. So keep watching for a while and register
// everything the moment the runtime appears.
function watchForRuntime() {
  if (watching) return
  watching = true
  let tries = 0
  const check = () => {
    const mc = getModelContext()
    if (mc && flush(mc)) {
      runtimeActive = true
      runtimeSubs.forEach((cb) => cb(true))
      window.removeEventListener('focus', check)
      return
    }
    if (++tries < 60) setTimeout(check, 500) // ~30s
  }
  window.addEventListener('focus', check)
  setTimeout(check, 500)
}

// Subscribes to runtime availability (now or later); cb fires on activation.
export function onRuntime(cb: (active: boolean) => void) {
  runtimeSubs.push(cb)
  if (runtimeActive) cb(true)
}

export function registerTools(tools: WebMCPTool[], sponsored = false): boolean {
  const wrapped = tools.map((t) => withLogging(t, sponsored))
  const registry = (window.__webmcpTools = window.__webmcpTools || [])
  registry.push(...wrapped)
  pending.push(...wrapped)

  const mc = getModelContext()
  if (mc && flush(mc)) {
    runtimeActive = true
    return true
  }
  watchForRuntime()
  return false
}

// MCP-style result; understood by both the spec serialization and
// provideContext implementations.
export function textResult(data: unknown) {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  return { content: [{ type: 'text', text }] }
}
