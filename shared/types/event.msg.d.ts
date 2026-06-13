export interface CodexUserMessagePayload {
    type: 'user_message'
    message: string
    images: string[]
    local_images: string[]
    text_elements: string[]
}

export interface CodexEventTaskStatedPayload {
    type: 'task_started'
    turn_id: string
    started_at?: number
    model_context_window: number
    collaboration_mode_kind: string
}

export interface CodexEventTaskCompletePayload {
    type: 'task_complete'
    turn_id: string
    last_agent_message: string
    completed_at: number
    duration_ms: number
    time_to_first_token_ms?: number
}

export interface CodexEventAgentMessagePayload {
    type: 'agent_message'
    message: string
    phase: 'commentary' | 'final_answer'
    memory_citation: string | null
}

export interface CodexEventAgentReasoningPayload {
    type: 'agent_reasoning'
    text: string
}

export interface CodexPatchChangeAdd {
    type: 'add'
    content: string
}

export interface CodexPatchChangeUpdate {
    type: 'update'
    unified_diff: string
    move_path?: string | null
}

export interface CodexPatchChangeDelete {
    type: 'delete'
    unified_diff: string
}

export type CodexPatchChange = CodexPatchChangeAdd | CodexPatchChangeUpdate | CodexPatchChangeDelete

export interface CodexEventPatchApplyEndPayload {
    type: 'patch_apply_end'
    call_id: string
    turn_id: string
    stdout: string
    stderr: string
    success: boolean
    changes: Record<string, CodexPatchChange>
    status: 'completed' | 'failed'
}

export interface CodexRateLimitBucket {
    used_percent: number
    window_minutes: number
    resets_at: number
}

export interface CodexTokenUsage {
    input_tokens: number
    cached_input_tokens: number
    output_tokens: number
    reasoning_output_tokens: number
    total_tokens: number
}

export interface CodexEventTokenCountPayload {
    type: 'token_count'
    info: {
        total_token_usage: CodexTokenUsage
        last_token_usage: CodexTokenUsage
        model_context_window: number
    }
    rate_limits: {
        limit_id: string
        limit_name: string
        primary: CodexRateLimitBucket
        secondary: CodexRateLimitBucket
        credits: {
            has_credits: boolean
            unlimited: boolean
            balance: number
        }
        plan_type: string
        rate_limit_reached_type: string
    }
}

export interface CodexEventContextCompactedPayload {
    type: 'context_compacted'
}

export interface CodexEventDuration {
    secs: number
    nanos: number
}

export interface CodexEventExecCommandEndPayload {
    type: 'exec_command_end'
    call_id: string
    process_id: string
    turn_id: string
    command: string[]
    cwd: string
    parsed_cmd: {
        type: string
        cmd: string
        name?: string
        path?: string
        query?: string
    }[]
    source: string
    stdout: string
    stderr: string
    // aggregated_output skill
    aggregated_output: string
    exit_code: number
    duration: CodexEventDuration
    formatted_output: string
    status: 'completed' | 'failed'
}

export interface CodexEventTurnAbortedPayload {
    type: 'turn_aborted'
    turn_id: string
    reason: string
    completed_at: number
    duration_ms: number
}

export type CodexWebSearchAction
    = | { type: 'search', query?: string, queries?: Array<string> }
        | { type: 'open_page', url?: string }
        | { type: 'find_in_page', url?: string, pattern?: string }
        | { type: 'other' }

export interface CodexEventWebSearchEndPayload {
    type: 'web_search_end'
    call_id: string
    query: string
    action: CodexWebSearchAction
}

export interface CodexEventThreadNameUpdatedPayload {
    type: 'thread_name_updated'
    thread_id: string
    thread_name: string
}

export interface CodexEventDynamicToolCallRequestPayload {
    type: 'dynamic_tool_call_request'
    call_id: string
    turn_id: string
    namespace?: string | null
    tool: string
    arguments: Record<string, unknown>
}

export interface CodexEventDynamicToolCallResponsePayload {
    type: 'dynamic_tool_call_response'
    call_id: string
    turn_id: string
    namespace?: string | null
    tool: string
    arguments: Record<string, unknown>
    content_items: Array<Record<string, unknown> & { type: string }>
    success: boolean
    error: unknown
    duration: CodexEventDuration
}

export interface CodexEventCollabAgentSpawnEndPayload {
    type: 'collab_agent_spawn_end'
    call_id: string
    sender_thread_id: string
    new_thread_id: string
    new_agent_nickname: string
    new_agent_role: string
    prompt: string
    model: string
    reasoning_effort: string
    status: string
}

export interface CodexEventCollabWaitingEndPayload {
    type: 'collab_waiting_end'
    sender_thread_id: string
    call_id: string
    statuses: Record<string, unknown>
}

export interface CodexEventCollabCloseEndPayload {
    type: 'collab_close_end'
    call_id: string
    sender_thread_id: string
    receiver_thread_id: string
    receiver_agent_nickname: string
    receiver_agent_role: string
    status: string
}

export interface CodexEventErrorPayload {
    type: 'error'
    message: string
    codex_error_info: 'other' | string
}

export interface McpResultMeta {
    'codex/imageDetail'?: 'original' | string
    'codex/browserUse'?: boolean
}
export interface CodexEventMcpToolCallEndPayload {
    type: 'mcp_tool_call_end'
    call_id: string
    invocation: {
        server: string
        tool: string
        arguments: Record<string, unknown>
    }
    duration: CodexEventDuration
    result: {
        Ok: {
            content: {
                type: string
                text: string
                mimeType?: string
                _meta?: McpResultMeta
            }[]
            isError: boolean
            _meta?: McpResultMeta
        }
    }
}

export interface CodexEventUnknownPayload {
    type: string
    [key: string]: unknown
}

// https://github.com/openai/codex/blob/main/codex-rs/app-server-protocol/src/protocol/thread_history.rs#L171
// https://github.com/openai/codex/blob/main/codex-rs/protocol/src/protocol.rs#L1180
export interface CodexEventMsgPayload {
    user_message: CodexUserMessagePayload

    task_started: CodexEventTaskStatedPayload
    task_complete: CodexEventTaskCompletePayload

    agent_message: CodexEventAgentMessagePayload

    agent_reasoning: CodexEventAgentReasoningPayload
    patch_apply_end: CodexEventPatchApplyEndPayload
    token_count: CodexEventTokenCountPayload
    context_compacted: CodexEventContextCompactedPayload
    exec_command_end: CodexEventExecCommandEndPayload
    turn_aborted: CodexEventTurnAbortedPayload
    web_search_end: CodexEventWebSearchEndPayload
    thread_name_updated: CodexEventThreadNameUpdatedPayload
    dynamic_tool_call_request: CodexEventDynamicToolCallRequestPayload
    dynamic_tool_call_response: CodexEventDynamicToolCallResponsePayload
    collab_agent_spawn_end: CodexEventCollabAgentSpawnEndPayload
    collab_waiting_end: CodexEventCollabWaitingEndPayload
    collab_close_end: CodexEventCollabCloseEndPayload
    error: CodexEventErrorPayload
    mcp_tool_call_end: CodexEventMcpToolCallEndPayload
    other: CodexEventUnknownPayload
}
