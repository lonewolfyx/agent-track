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
    duration: {
        secs: number
        nanos: number
    }
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

export interface CodexWebSearchAction {
    type: 'search' | 'open_page' | 'find_in_page' | 'other'
    query?: string
    queries?: string[]
    url?: string
    pattern?: string
}

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
    duration: {
        secs: number
        nanos: number
    }
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

export interface CodexEventMsgPayload {
    user_message: CodexUserMessagePayload
    task_started: CodexEventTaskStatedPayload
    task_complete: CodexEventTaskCompletePayload
    agent_message: CodexEventAgentMessagePayload
    patch_apply_end: CodexEventPatchApplyEndPayload
    token_count: CodexEventTokenCountPayload
    context_compacted: CodexEventContextCompactedPayload
    exec_command_end: CodexEventExecCommandEndPayload
    turn_aborted: CodexEventTurnAbortedPayload
    web_search_end: CodexEventWebSearchEndPayload
    thread_name_updated: CodexEventThreadNameUpdatedPayload
    error: CodexEventErrorPayload
    mcp_tool_call_end: CodexEventMcpToolCallEndPayload
}
