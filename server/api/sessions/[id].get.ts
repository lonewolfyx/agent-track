import { readJsonlLines } from '#server/utils/codex'

// type SessionPayload = Record<string, unknown> & {
//     type?: string
// }
//
// interface ToolTrace {
//     kind: CodexSessionToolKind
//     name: string
//     callId?: string
// }
//
// interface ChatTurnBucket {
//     turnId: string
//     startedAt: string
//     chat: CodexSessionChatItem[]
// }
//
// function getPayload(line: CodexSessionItem): SessionPayload {
//     return (line.payload ?? {}) as SessionPayload
// }
//
// function getPayloadType(line: CodexSessionItem): string {
//     return typeof getPayload(line).type === 'string' ? getPayload(line).type as string : ''
// }
//
// function getString(value: unknown): string {
//     return typeof value === 'string' ? value : ''
// }
//
// function normalizeText(value: string): string {
//     return value.trim().replace(/\r\n/g, '\n')
// }
//
// function summarizeText(value: unknown, limit = 300): string {
//     const text = normalizeText(typeof value === 'string' ? value : JSON.stringify(value ?? ''))
//     if (!text) {
//         return ''
//     }
//
//     return text.length <= limit ? text : `${text.slice(0, limit)}...`
// }
//
// function buildReasoningText(payload: SessionPayload): string {
//     const summary = payload.summary
//     if (Array.isArray(summary)) {
//         const summaryText = normalizeText(
//             summary
//                 .map((item) => {
//                     if (typeof item === 'string') {
//                         return item
//                     }
//
//                     if (!item || typeof item !== 'object') {
//                         return ''
//                     }
//
//                     return getString((item as Record<string, unknown>).text)
//                 })
//                 .filter(Boolean)
//                 .join('\n\n'),
//         )
//
//         if (summaryText) {
//             return summaryText
//         }
//     }
//
//     return normalizeText(getString(payload.content))
// }
//
// function createTurn(turnId: string, timestamp: string): ChatTurnBucket {
//     return {
//         turnId,
//         startedAt: timestamp,
//         chat: [],
//     }
// }
//
// function pushChatItem(
//     turn: ChatTurnBucket,
//     item: Omit<CodexSessionChatItem, 'id' | 'turnId'>,
//     sequence: number,
// ) {
//     turn.chat.push({
//         id: `chat_${sequence}`,
//         turnId: turn.turnId,
//         ...item,
//     })
// }
//
// export async function getSessionDetail(path: string): Promise<CodexSessionDetail> {
//     const lines = await readJsonlLines(path)
//     const turns = new Map<string, ChatTurnBucket>()
//     const toolTraces = new Map<string, ToolTrace>()
//     const thoughtDedup = new Map<string, Set<string>>()
//
//     let currentTurnId = ''
//     let sequence = 0
//
//     const nextSequence = () => ++sequence
//
//     const ensureTurn = (turnId: string, timestamp: string) => {
//         const existing = turns.get(turnId)
//         if (existing) {
//             return existing
//         }
//
//         const turn = createTurn(turnId, timestamp)
//         turns.set(turnId, turn)
//         return turn
//     }
//
//     const resolveTurn = (line: CodexSessionItem) => {
//         const payload = getPayload(line)
//         const turnId = getString(payload.turn_id) || currentTurnId
//
//         if (!turnId) {
//             return null
//         }
//
//         currentTurnId = turnId
//         return ensureTurn(turnId, line.timestamp)
//     }
//
//     const pushThought = (
//         turn: ChatTurnBucket,
//         timestamp: string,
//         source: CodexSessionChatItem['source'],
//         content: string,
//     ) => {
//         const normalizedContent = normalizeText(content)
//         if (!normalizedContent) {
//             return
//         }
//
//         const turnThoughtKeys = thoughtDedup.get(turn.turnId) ?? new Set<string>()
//         if (turnThoughtKeys.has(normalizedContent)) {
//             return
//         }
//
//         turnThoughtKeys.add(normalizedContent)
//         thoughtDedup.set(turn.turnId, turnThoughtKeys)
//
//         pushChatItem(turn, {
//             timestamp,
//             type: '思考',
//             content: normalizedContent,
//             source,
//         }, nextSequence())
//     }
//
//     const recordToolCall = (
//         turn: ChatTurnBucket,
//         timestamp: string,
//         tool: ToolTrace,
//         input: string,
//         status?: string,
//     ) => {
//         if (tool.callId) {
//             toolTraces.set(tool.callId, tool)
//         }
//
//         pushChatItem(turn, {
//             timestamp,
//             type: '工具调用',
//             title: tool.name,
//             content: input,
//             toolKind: tool.kind,
//             toolName: tool.name,
//             callId: tool.callId,
//             status,
//         }, nextSequence())
//     }
//
//     const recordToolResult = (
//         turn: ChatTurnBucket,
//         timestamp: string,
//         tool: ToolTrace,
//         output: string,
//         status?: string,
//     ) => {
//         pushChatItem(turn, {
//             timestamp,
//             type: '工具返回',
//             title: tool.name,
//             content: output,
//             toolKind: tool.kind,
//             toolName: tool.name,
//             callId: tool.callId,
//             status,
//         }, nextSequence())
//     }
//
//     for (const line of lines) {
//         const payload = getPayload(line)
//         const payloadType = getPayloadType(line)
//
//         if (line.type === 'event_msg' && payloadType === 'task_started') {
//             currentTurnId = getString(payload.turn_id)
//             if (currentTurnId) {
//                 ensureTurn(currentTurnId, line.timestamp)
//             }
//             continue
//         }
//
//         if (line.type === 'turn_context') {
//             currentTurnId = getString(payload.turn_id) || currentTurnId
//             if (currentTurnId) {
//                 ensureTurn(currentTurnId, line.timestamp)
//             }
//             continue
//         }
//
//         const turn = resolveTurn(line)
//         if (!turn) {
//             continue
//         }
//
//         if (line.type === 'event_msg' && payloadType === 'user_message') {
//             pushChatItem(turn, {
//                 timestamp: line.timestamp,
//                 type: '提问',
//                 content: normalizeText(getString(payload.message)),
//             }, nextSequence())
//             continue
//         }
//
//         if (line.type === 'event_msg' && payloadType === 'agent_message') {
//             const phase = getString(payload.phase)
//             const message = normalizeText(getString(payload.message))
//
//             pushChatItem(turn, {
//                 timestamp: line.timestamp,
//                 type: phase === 'final_answer' ? '回答' : '过程',
//                 content: message,
//                 status: phase || undefined,
//             }, nextSequence())
//             continue
//         }
//
//         if (line.type === 'event_msg' && payloadType === 'agent_reasoning') {
//             pushThought(turn, line.timestamp, 'agent_reasoning', getString(payload.text))
//             continue
//         }
//
//         if (line.type === 'response_item' && payloadType === 'reasoning') {
//             pushThought(turn, line.timestamp, 'reasoning', buildReasoningText(payload))
//             continue
//         }
//
//         if (line.type === 'response_item' && payloadType === 'function_call') {
//             recordToolCall(turn, line.timestamp, {
//                 kind: 'function',
//                 name: getString(payload.name),
//                 callId: getString(payload.call_id),
//             }, normalizeText(getString(payload.arguments)))
//             continue
//         }
//
//         if (line.type === 'response_item' && payloadType === 'custom_tool_call') {
//             recordToolCall(turn, line.timestamp, {
//                 kind: 'custom',
//                 name: getString(payload.name),
//                 callId: getString(payload.call_id),
//             }, normalizeText(getString(payload.input)), getString(payload.status))
//             continue
//         }
//
//         if (line.type === 'response_item' && payloadType === 'web_search_call') {
//             recordToolCall(turn, line.timestamp, {
//                 kind: 'web_search',
//                 name: 'web_search',
//                 callId: getString(payload.call_id) || `web_search_${nextSequence()}`,
//             }, summarizeText(payload.action), getString(payload.status))
//             continue
//         }
//
//         if (line.type === 'response_item' && payloadType === 'tool_search_call') {
//             recordToolCall(turn, line.timestamp, {
//                 kind: 'tool_search',
//                 name: 'tool_search',
//                 callId: getString(payload.call_id),
//             }, summarizeText(payload.arguments), getString(payload.status))
//             continue
//         }
//
//         if (line.type === 'response_item' && payloadType === 'function_call_output') {
//             const callId = getString(payload.call_id)
//             const trace = toolTraces.get(callId)
//             if (!trace) {
//                 continue
//             }
//
//             recordToolResult(turn, line.timestamp, trace, normalizeText(getString(payload.output)))
//             continue
//         }
//
//         if (line.type === 'response_item' && payloadType === 'custom_tool_call_output') {
//             const callId = getString(payload.call_id)
//             const trace = toolTraces.get(callId)
//             if (!trace) {
//                 continue
//             }
//
//             recordToolResult(turn, line.timestamp, trace, normalizeText(getString(payload.output)))
//             continue
//         }
//
//         if (line.type === 'response_item' && payloadType === 'tool_search_output') {
//             const callId = getString(payload.call_id)
//             const trace = toolTraces.get(callId)
//             if (!trace) {
//                 continue
//             }
//
//             recordToolResult(turn, line.timestamp, trace, summarizeText(payload.tools), getString(payload.status))
//             continue
//         }
//
//         if (line.type === 'event_msg' && payloadType === 'exec_command_end') {
//             const trace = toolTraces.get(getString(payload.call_id)) ?? {
//                 kind: 'function' as const,
//                 name: 'exec_command',
//                 callId: getString(payload.call_id),
//             }
//
//             recordToolResult(
//                 turn,
//                 line.timestamp,
//                 trace,
//                 summarizeText(payload.aggregated_output || payload.stdout || payload.stderr),
//                 getString(payload.status),
//             )
//             continue
//         }
//
//         if (line.type === 'event_msg' && payloadType === 'patch_apply_end') {
//             const trace = toolTraces.get(getString(payload.call_id)) ?? {
//                 kind: 'custom' as const,
//                 name: 'apply_patch',
//                 callId: getString(payload.call_id),
//             }
//
//             recordToolResult(
//                 turn,
//                 line.timestamp,
//                 trace,
//                 summarizeText(payload.changes || payload.stdout || payload.stderr),
//                 getString(payload.status),
//             )
//             continue
//         }
//
//         if (line.type === 'event_msg' && payloadType === 'web_search_end') {
//             const trace = toolTraces.get(getString(payload.call_id)) ?? {
//                 kind: 'web_search' as const,
//                 name: 'web_search',
//                 callId: getString(payload.call_id),
//             }
//
//             recordToolResult(turn, line.timestamp, trace, summarizeText(payload.action))
//             continue
//         }
//
//         if (line.type === 'event_msg' && payloadType === 'mcp_tool_call_end') {
//             const invocation = (payload.invocation ?? {}) as Record<string, unknown>
//             const name = [getString(invocation.server), getString(invocation.tool)]
//                 .filter(Boolean)
//                 .join('.')
//
//             const trace = toolTraces.get(getString(payload.call_id)) ?? {
//                 kind: 'mcp' as const,
//                 name: name || 'mcp_tool',
//                 callId: getString(payload.call_id),
//             }
//
//             recordToolResult(turn, line.timestamp, trace, summarizeText(payload.result))
//             continue
//         }
//
//         if (line.type === 'event_msg' && payloadType === 'error') {
//             pushChatItem(turn, {
//                 timestamp: line.timestamp,
//                 type: '异常',
//                 content: normalizeText(getString(payload.message)),
//             }, nextSequence())
//             continue
//         }
//
//         if (line.type === 'event_msg' && payloadType === 'turn_aborted') {
//             pushChatItem(turn, {
//                 timestamp: line.timestamp,
//                 type: '异常',
//                 content: normalizeText(getString(payload.reason)),
//                 status: 'aborted',
//             }, nextSequence())
//         }
//     }
//
//     return {
//         chat: [...turns.values()]
//             .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
//             .map(turn => turn.chat),
//     }
// }

export async function getSessionDetailV2(path: string): Promise<any> {
    const lines = await readJsonlLines(path)
    const chats = new Map<string, any>()

    let turnId = ''

    const session_meta = lines.filter(line => line.type === 'session_meta')[0]

    for (const line of lines) {
        const payload = line.payload

        if (line.type === 'event_msg' && payload.type === 'task_started') {
            turnId = payload.turn_id
            chats.set(turnId, {
                id: turnId,
                startedAt: payload.started_at,
                chat: [
                    { ...payload },
                ],
            })
            continue
        }

        if (['session_meta', 'reasoning'].includes(line.type)) {
            continue
        }

        if (chats.has(turnId)) {
            chats.get(turnId).chat.push(line)
        }
    }

    return {
        session_meta,
        chat: [...chats.values()],
    }
}

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'Missing session id' })
    }

    const path = getQuery(event).path as string
    if (!path) {
        throw createError({ statusCode: 400, message: 'Missing session path' })
    }

    const chats = await getSessionDetailV2(path)

    return {
        id,
        path,
        chats,
    }
})
