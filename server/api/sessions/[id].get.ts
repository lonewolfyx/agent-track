import type { CodexSession, CodexSessionItem, CodexSessionPayload } from '#shared/types/codex'
import type {
    CodexEventAgentMessagePayload,
    CodexEventAgentReasoningPayload,
    CodexEventErrorPayload,
    CodexEventTaskCompletePayload,
    CodexEventTokenCountPayload,
    CodexEventTurnAbortedPayload,
    CodexTokenUsage,
    CodexUserMessagePayload,
} from '#shared/types/event.msg'
import type { CodexResponseFunctionCall, CodexResponseMessage } from '#shared/types/response.item'
import type { CodexSessionDetailV2, CodexSessionThinkingItem } from '#shared/types/session'
import { readJsonlLines } from '#server/utils/codex'

type SessionPayload = Record<string, unknown> & {
    type?: string
}

interface ThinkingToolPairOutput {
    event?: SessionPayload
    response?: SessionPayload
}

interface ChatTurnBucket {
    id: string
    startedAt: string
    duration: number
    turn_context?: Record<string, unknown>
    question: string
    answer: string
    total_token_usage: CodexTokenUsage | null
    thinking: CodexSessionThinkingItem[]
}

interface ThinkingToolPairItem extends CodexSessionThinkingItem {
    callId?: string
    toolName?: string
    skillPath?: string
    call?: SessionPayload
    output?: ThinkingToolPairOutput
}

const EVENT_OUTPUT_TO_CALL_TYPE: Record<string, string> = {
    exec_command_end: 'function_call',
    patch_apply_end: 'custom_tool_call',
    web_search_end: 'web_search_call',
    mcp_tool_call_end: 'mcp_tool_call',
}

const RESPONSE_OUTPUT_TO_CALL_TYPE: Record<string, string> = {
    function_call_output: 'function_call',
    custom_tool_call_output: 'custom_tool_call',
    tool_search_output: 'tool_search_call',
    mcp_tool_call_output: 'mcp_tool_call',
    dynamic_tool_call_response: 'dynamic_tool_call_request',
}

const CALL_TYPES = new Set([
    'function_call',
    'custom_tool_call',
    'tool_search_call',
    'web_search_call',
    'mcp_tool_call',
    'dynamic_tool_call_request',
    'image_generation_call',
    'local_shell_call',
])

function getSkillPath(payload: CodexResponseFunctionCall): string | undefined {
    if (payload.type !== 'function_call' || payload.name !== 'exec_command') {
        return undefined
    }

    const command = (JSON.parse(payload.arguments) as { cmd: string })?.cmd || ''
    const matched = command.match(/\/Users\/[^\s'"]+\/(?:\.codex|\.agents)\/skills\/[^\s'"]+\.md/g)
    return matched?.[0] ?? undefined
}

function resolveToolName(payload: CodexSessionPayload<'event_msg'> | CodexSessionPayload<'response_item'>): string {
    switch (payload.type) {
        case 'function_call':
        case 'custom_tool_call':
            return (payload as CodexSessionPayload<'response_item', 'function_call'> | CodexSessionPayload<'response_item', 'custom_tool_call'>).name
        case 'mcp_tool_call': {
            const invocation = (payload as CodexResponseMcpToolCall).invocation
            if (invocation) {
                return [invocation?.server, invocation?.tool].filter(Boolean).join('.')
            }

            return [(payload as CodexResponseMcpToolCall)?.server || '', (payload as CodexResponseMcpToolCall).tool || ''].filter(Boolean).join('.')
        }
        case 'dynamic_tool_call_request':
            return (payload as CodexSessionPayload<'event_msg', 'dynamic_tool_call_request'>).tool
        case 'tool_search_call':
            return 'tool_search'
        case 'web_search_call':
            return 'web_search'
        case 'image_generation_call':
            return 'image_generation'
        case 'local_shell_call':
            return 'local_shell'
        default:
            return ''
    }
}

function createContentThinkingItem(
    line: CodexSessionItem,
    content: string,
    extra?: Partial<CodexSessionThinkingItem>,
): CodexSessionThinkingItem {
    return {
        type: line.payload.type,
        timestamp: line.timestamp,
        phase: line.payload?.phase || undefined,
        content,
        // payload,
        ...extra,
    }
}

function createOutputOnlyItem(
    line: CodexSessionItem,
    callType: string,
    target: 'event' | 'response',
): ThinkingToolPairItem {
    return {
        type: callType,
        timestamp: line.timestamp,
        callId: line.payload.call_id,
        toolName: resolveToolName(line.payload),
        call: undefined,
        output: {
            [target]: line.payload,
        },
    }
}

function attachOutput(item: ThinkingToolPairItem, line: CodexSessionItem, target: 'event' | 'response') {
    if (!item.output) {
        item.output = {}
    }

    item.output[target] = line.payload
}

function findPendingCall(
    pendingByCallId: Map<string, ThinkingToolPairItem>,
    pendingByType: Map<string, ThinkingToolPairItem[]>,
    callType: string,
    callId: string,
): ThinkingToolPairItem | undefined {
    if (callId && pendingByCallId.has(callId)) {
        return pendingByCallId.get(callId)
    }

    const queue = pendingByType.get(callType)
    if (!queue?.length) {
        return undefined
    }

    return queue.find(item => !item.output) || queue[0]
}

export async function getSessionDetailV2(path: string): Promise<CodexSessionDetailV2> {
    const lines = await readJsonlLines(path)
    const sessionMeta = lines.find(line => line.type === 'session_meta') as CodexSession<'session_meta'>
    const sessionId = sessionMeta.payload.id

    const chat: ChatTurnBucket[] = []
    let currentTurn: ChatTurnBucket | null = null
    let pendingByCallId = new Map<string, ThinkingToolPairItem>()
    let pendingByType = new Map<string, ThinkingToolPairItem[]>()

    for (const [index, line] of (lines as CodexSessionItem[]).entries()) {
        const payload = line.payload
        const payloadType = payload.type
        const nextLine = lines[index + 1]
        const nextPayload = nextLine ? (nextLine as CodexSessionItem).payload : null
        const nextPayloadType = nextLine ? nextPayload.type : ''

        if (line.type === 'event_msg' && payloadType === 'task_started') {
            currentTurn = {
                id: sessionId,
                startedAt: sessionMeta.payload.timestamp,
                duration: 0,
                turn_context: undefined,
                question: '',
                answer: '',
                total_token_usage: null,
                thinking: [],
            }
            chat.push(currentTurn)
            pendingByCallId = new Map<string, ThinkingToolPairItem>()
            pendingByType = new Map<string, ThinkingToolPairItem[]>()
            continue
        }

        if (!currentTurn) {
            continue
        }

        if (line.type === 'turn_context') {
            currentTurn.turn_context = payload
            continue
        }

        if (line.type === 'event_msg' && payloadType === 'user_message') {
            const previousLine = lines[index - 1]
            const previousPayload = previousLine ? (previousLine as CodexSessionItem).payload : null
            const previousPayloadType = previousLine ? previousPayload.type : ''
            const message = (payload as CodexUserMessagePayload).message

            if (!currentTurn.question) {
                currentTurn.question = message
            }
            else if (
                previousLine?.type === 'response_item'
                && previousPayloadType === 'message'
                && previousPayload?.role === 'user'
                && message
                && ((previousPayload as CodexResponseMessage).content.find(item => item.type === 'input_text')?.text || '') === message
            ) {
                currentTurn.thinking.push(createContentThinkingItem(line, message, {
                    role: 'user',
                    isGuidance: true,
                    pairedPayload: previousPayload,
                }))
            }
            continue
        }

        if (line.type === 'response_item' && payloadType === 'message') {
            continue
        }

        if (line.type === 'event_msg' && payloadType === 'task_complete') {
            currentTurn.answer = (payload as CodexEventTaskCompletePayload).last_agent_message
            currentTurn.duration = (payload as CodexEventTaskCompletePayload).duration_ms
            currentTurn = null
            continue
        }

        if (line.type === 'event_msg' && payloadType === 'turn_aborted') {
            currentTurn.duration = (payload as CodexEventTurnAbortedPayload).duration_ms
            currentTurn.thinking.push(createContentThinkingItem(line, (payload as CodexEventTurnAbortedPayload).reason))
            currentTurn = null
            continue
        }

        if (line.type === 'event_msg' && payloadType === 'token_count') {
            if ((payload as CodexEventTokenCountPayload).info) {
                currentTurn.total_token_usage = (payload as CodexEventTokenCountPayload).info.total_token_usage
                currentTurn.thinking.push(createContentThinkingItem(line, payload))
                continue
            }
        }

        if (line.type === 'event_msg' && payloadType === 'agent_message') {
            if ((payload as CodexEventAgentMessagePayload).phase !== 'final_answer') {
                currentTurn.thinking.push(createContentThinkingItem(line, (payload as CodexEventAgentMessagePayload).message, {
                    role: nextLine?.type === 'response_item'
                        && nextPayloadType === 'message'
                        && nextPayload?.role === 'assistant'
                        ? 'assistant'
                        : undefined,
                }))
            }
            continue
        }

        if (line.type === 'event_msg' && payloadType === 'agent_reasoning') {
            currentTurn.thinking.push(createContentThinkingItem(line, (payload as CodexEventAgentReasoningPayload).text))
            continue
        }

        if (line.type === 'response_item' && payloadType === 'reasoning') {
            currentTurn.thinking.push(createContentThinkingItem(line, payload))
            continue
        }

        if (line.type === 'event_msg' && payloadType === 'error') {
            currentTurn.thinking.push(createContentThinkingItem(line, (payload as CodexEventErrorPayload).message))
            continue
        }

        if (CALL_TYPES.has(payloadType)) {
            const item = {
                type: payloadType,
                timestamp: line.timestamp,
                call_id: payload.call_id,
                toolName: resolveToolName(payload),
                skill: getSkillPath(payload),
                call: payload,
                output: undefined,
            }
            currentTurn.thinking.push(item)

            if (!['image_generation_call', 'local_shell_call'].includes(payloadType)) {
                pendingByCallId.set(payload.call_id, item)

                const queue = pendingByType.get(payloadType) ?? []
                queue.push(item)
                pendingByType.set(payloadType, queue)
            }
            continue
        }

        if (line.type === 'event_msg' && payloadType in EVENT_OUTPUT_TO_CALL_TYPE) {
            const callType = EVENT_OUTPUT_TO_CALL_TYPE[payloadType]
            if (!callType) {
                continue
            }
            const item = findPendingCall(pendingByCallId, pendingByType, callType, payload.call_id)

            if (item) {
                attachOutput(item, line, 'event')
            }
            else {
                currentTurn.thinking.push(createOutputOnlyItem(line, callType, 'event'))
            }
            continue
        }

        if (line.type === 'event_msg' && payloadType === 'dynamic_tool_call_response') {
            const item = findPendingCall(
                pendingByCallId,
                pendingByType,
                'dynamic_tool_call_request',
                payload.call_id,
            )

            if (item) {
                attachOutput(item, line, 'event')
            }
            else {
                currentTurn.thinking.push(createOutputOnlyItem(line, 'dynamic_tool_call_request', 'event'))
            }
            continue
        }

        if (line.type === 'response_item' && payloadType in RESPONSE_OUTPUT_TO_CALL_TYPE) {
            const callType = RESPONSE_OUTPUT_TO_CALL_TYPE[payloadType]!
            const item = findPendingCall(pendingByCallId, pendingByType, callType, payload.call_id)

            if (item) {
                attachOutput(item, line, 'response')
            }
            else {
                currentTurn.thinking.push(createOutputOnlyItem(line, callType, 'response'))
            }
        }
    }

    return {
        id: sessionId,
        path,
        chat,
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

    return getSessionDetailV2(path)
})
