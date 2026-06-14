import type { CodexTokenUsage } from '#shared/types/event.msg'
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
    token: CodexTokenUsage
    skills: number
}

export interface CodexSessionMonthGroup {
    label: string
    children: CodexSessionListItem[]
}

// -------------------

export interface CodexSessionThinking {
    type: string
    timestamp: string
    phase?: string
    role?: string
    isGuidance?: boolean
    call_id?: string
    toolName?: string
    skill?: string
    content?: string
    tokenUsage?: CodexTokenUsage | null
    call?: Record<string, unknown>
    output?: {
        event?: Record<string, unknown>
        response?: Record<string, unknown>
    }
    payload?: Record<string, unknown>
    pairedPayload?: Record<string, unknown>
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
