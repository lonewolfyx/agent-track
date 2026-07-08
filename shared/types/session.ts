import type { ThinkingTimelineType } from '#shared/constant/codex.type'
import type {
    CodexEventAgentMessagePayload,
    CodexEventAgentReasoningPayload,
    CodexEventDynamicToolCallRequestPayload,
    CodexEventDynamicToolCallResponsePayload,
    CodexEventErrorPayload,
    CodexEventExecCommandEndPayload,
    CodexEventImageGenerationEndPayload,
    CodexEventMcpToolCallEndPayload,
    CodexEventPatchApplyEndPayload,
    CodexEventTokenCountPayload,
    CodexEventTurnAbortedPayload,
    CodexEventWebSearchEndPayload,
    CodexTokenUsage,
} from '#shared/types/event.msg'
import type { CodexResponseFunctionCall } from '#shared/types/function.call'
import type {
    CodexResponseCustomToolCall,
    CodexResponseCustomToolCallOutput,
    CodexResponseFunctionCallOutput,
    CodexResponseImageGenerationCall,
    CodexResponseLocalShellCall,
    CodexResponseMcpToolCall,
    CodexResponseMcpToolCallOutput,
    CodexResponseMessage,
    CodexResponseReasoning,
    CodexResponseToolSearchCall,
    CodexResponseToolSearchOutput,
    CodexResponseWebSearchCall,
} from '#shared/types/response.item'
import type { CodexTurnContextPayload } from '#shared/types/turn.context'

export interface CodexSessionListItem {
    id: string
    title: string
    model: {
        model: string
        effort?: string
    }[]
    cwd: string
    filename: string
    prompt: number
    call: number
    createTime: string
    token: CodexTokenUsage | object
    skills: number
}

export interface CodexSessionMonthGroup {
    label: string
    children: CodexSessionListItem[]
}

// -------------------

export type ThinkingContent = string
    | CodexEventAgentMessagePayload
    | CodexEventAgentReasoningPayload
    | CodexEventErrorPayload
    | CodexEventTokenCountPayload
    | CodexEventTurnAbortedPayload
    | CodexResponseReasoning

export type ThinkingCallPayload
    = | CodexResponseFunctionCall
        | CodexResponseCustomToolCall
        | CodexResponseToolSearchCall
        | CodexResponseWebSearchCall
        | CodexResponseMcpToolCall
        | CodexEventDynamicToolCallRequestPayload
        | CodexResponseImageGenerationCall
        | CodexResponseLocalShellCall

export type ThinkingEventOutputPayload
    = | CodexEventExecCommandEndPayload
        | CodexEventPatchApplyEndPayload
        | CodexEventWebSearchEndPayload
        | CodexEventMcpToolCallEndPayload
        | CodexEventDynamicToolCallResponsePayload
        | CodexEventImageGenerationEndPayload

export type ThinkingResponseOutputPayload
    = | CodexResponseFunctionCallOutput
        | CodexResponseCustomToolCallOutput
        | CodexResponseToolSearchOutput
        | CodexResponseMcpToolCallOutput

export interface CodexSessionThinking {
    type: ThinkingTimelineType
    timestamp: string
    phase?: string
    role?: string
    isGuidance?: boolean
    call_id?: string
    toolName?: string
    skill?: string
    content?: ThinkingContent
    tokenUsage?: CodexTokenUsage
    call?: ThinkingCallPayload
    output?: {
        event?: ThinkingEventOutputPayload
        response?: ThinkingResponseOutputPayload
    }
    payload?: unknown
    pairedPayload?: CodexResponseMessage
}

export interface ChatTurnList {
    id: string
    startedAt: string
    turn_context: object | CodexTurnContextPayload
    question: string
    answer: string
    total_token_usage: CodexTokenUsage | null
    thinking: CodexSessionThinking[]
    duration?: number
}

export interface CodexSessionDetail {
    id: string
    path: string
    chat: ChatTurnList[]
}
