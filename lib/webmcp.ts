// WebMCP compat-laag. De spec verhuist tussen navigator.modelContext en
// document.modelContext, en oudere implementaties kennen alleen
// provideContext() (die de hele toolset vervangt). Daarom houden we één
// gedeeld register op window bij; iedere partij (site of embedded SDK) die
// registreert, flusht het volledige register wanneer alleen provideContext
// bestaat. De AgentAds-SDK (public/agentads-sdk.js) volgt dezelfde conventie.

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
  source: 'agent' | 'mens'
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

export function registerTools(tools: WebMCPTool[], sponsored = false): boolean {
  const wrapped = tools.map((t) => withLogging(t, sponsored))
  const registry = (window.__webmcpTools = window.__webmcpTools || [])
  registry.push(...wrapped)

  const mc = getModelContext()
  if (!mc) return false
  try {
    if (typeof mc.registerTool === 'function') {
      for (const t of wrapped) Promise.resolve(mc.registerTool(t)).catch(() => {})
    } else if (typeof mc.provideContext === 'function') {
      mc.provideContext({ tools: registry })
    } else {
      return false
    }
    return true
  } catch {
    return false
  }
}

// MCP-stijl resultaat; wordt door zowel de spec-serialisatie als
// provideContext-implementaties begrepen.
export function textResult(data: unknown) {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  return { content: [{ type: 'text', text }] }
}
