import Module from 'node:module'
import { resolve } from 'node:path'

type SessionApiModule = typeof import('../server/api/sessions/[id].get')

const fixturePath = resolve('fixtures/codex-thinking/p0-session.jsonl')
const originalResolveFilename = (Module as unknown as { _resolveFilename: typeof Module._resolveFilename })._resolveFilename

;(Module as unknown as { _resolveFilename: typeof Module._resolveFilename })._resolveFilename = function resolveAlias(
    request,
    parent,
    isMain,
    options,
) {
    if (request.startsWith('#shared/')) {
        return originalResolveFilename(resolve(request.replace('#shared/', 'shared/')), parent, isMain, options)
    }

    if (request.startsWith('#server/')) {
        return originalResolveFilename(resolve(request.replace('#server/', 'server/')), parent, isMain, options)
    }

    return originalResolveFilename(request, parent, isMain, options)
}

Object.assign(globalThis, {
    defineEventHandler: (handler: unknown) => handler,
    getRouterParam: () => 'fixture-p0',
    getQuery: () => ({ path: fixturePath }),
    createError: (input: unknown) => input,
})

const { getSessionDetail } = await import('../server/api/sessions/[id].get') as SessionApiModule
const detail = await getSessionDetail(fixturePath)
const thinking = detail.chat[0]?.thinking ?? []
const types = thinking.map(item => item.type)

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new Error(message)
    }
}

for (const type of [
    'agent_reasoning',
    'error',
    'tool_search_call',
    'mcp_tool_call',
    'dynamic_tool_call_request',
    'image_generation_call',
    'local_shell_call',
] as const) {
    assert(types.includes(type), `Missing thinking type: ${type}`)
}

for (const foldedType of [
    'tool_search_output',
    'mcp_tool_call_end',
    'dynamic_tool_call_response',
    'image_generation_end',
] as const) {
    assert(!types.includes(foldedType as never), `Output type leaked into timeline: ${foldedType}`)
}

const toolSearch = thinking.find(item => item.type === 'tool_search_call')
assert(toolSearch?.output?.response?.type === 'tool_search_output', 'tool_search_output was not folded into tool_search_call')

const mcp = thinking.find(item => item.type === 'mcp_tool_call')
assert(mcp?.output?.event?.type === 'mcp_tool_call_end', 'mcp_tool_call_end was not folded into mcp_tool_call')

const dynamic = thinking.find(item => item.type === 'dynamic_tool_call_request')
assert(dynamic?.output?.event?.type === 'dynamic_tool_call_response', 'dynamic_tool_call_response was not folded into dynamic_tool_call_request')

const image = thinking.find(item => item.type === 'image_generation_call')
assert(image?.output?.event?.type === 'image_generation_end', 'image_generation_end was not folded into image_generation_call')

console.log(`Verified ${thinking.length} thinking items from ${fixturePath}`)
