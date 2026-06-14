export interface CodexUserMessagePayload {
    type: 'user_message'
    client_id?: string | null
    message: string
    images?: string[] | null
    image_details?: Array<string | null>
    local_images: string[]
    local_image_details?: Array<string | null>
    text_elements: Array<Record<string, unknown>>
}

export interface CodexEventTaskStartedPayload {
    type: 'task_started'
    turn_id: string
    trace_id?: string | null
    started_at?: number | null
    model_context_window?: number | null
    collaboration_mode_kind: string
}

export interface CodexEventTaskCompletePayload {
    type: 'task_complete'
    turn_id: string
    last_agent_message: string | null
    completed_at?: number | null
    duration_ms?: number | null
    time_to_first_token_ms?: number | null
}

export interface CodexEventAgentMessagePayload {
    type: 'agent_message'
    message: string
    phase?: 'commentary' | 'final_answer' | null
    memory_citation?: Record<string, unknown> | null
}

export interface CodexEventAgentReasoningPayload {
    type: 'agent_reasoning'
    text: string
}

export interface CodexEventAgentReasoningRawContentPayload {
    type: 'agent_reasoning_raw_content'
    text: string
}

export interface CodexEventAgentReasoningSectionBreakPayload {
    type: 'agent_reasoning_section_break'
    item_id: string
    summary_index: number
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
    content: string
}

export type CodexPatchChange = CodexPatchChangeAdd | CodexPatchChangeUpdate | CodexPatchChangeDelete

export interface CodexEventPatchApplyBeginPayload {
    type: 'patch_apply_begin'
    call_id: string
    turn_id: string
    auto_approved: boolean
    changes: Record<string, CodexPatchChange>
}

export interface CodexEventPatchApplyUpdatedPayload {
    type: 'patch_apply_updated'
    call_id: string
    changes: Record<string, CodexPatchChange>
}

export interface CodexEventPatchApplyEndPayload {
    type: 'patch_apply_end'
    call_id: string
    turn_id: string
    stdout: string
    stderr: string
    success: boolean
    changes: Record<string, CodexPatchChange>
    status: 'completed' | 'failed' | 'declined'
}

export interface CodexRateLimitBucket {
    used_percent: number
    window_minutes?: number | null
    resets_at?: number | null
}

export interface CodexSpendControlLimitSnapshot {
    limit: string
    used: string
    remaining_percent: number
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
    info?: {
        total_token_usage: CodexTokenUsage
        last_token_usage: CodexTokenUsage
        model_context_window?: number | null
    } | null
    rate_limits?: {
        limit_id?: string | null
        limit_name?: string | null
        primary?: CodexRateLimitBucket | null
        secondary?: CodexRateLimitBucket | null
        credits?: {
            has_credits: boolean
            unlimited: boolean
            balance?: string | null
        } | null
        individual_limit?: CodexSpendControlLimitSnapshot | null
        plan_type?: string | null
        rate_limit_reached_type?: string | null
    } | null
}

export interface CodexEventContextCompactedPayload {
    type: 'context_compacted'
}

export type CodexEventDuration = string

export interface CodexEventExecCommandBeginPayload {
    type: 'exec_command_begin'
    call_id: string
    process_id?: string | null
    turn_id: string
    started_at_ms: number
    command: string[]
    cwd: string
    parsed_cmd: Array<Record<string, unknown>>
    source: string
    interaction_input?: string | null
}

export interface CodexEventExecCommandEndPayload {
    type: 'exec_command_end'
    call_id: string
    process_id?: string | null
    turn_id: string
    completed_at_ms: number
    command: string[]
    cwd: string
    parsed_cmd: Array<Record<string, unknown>>
    source: string
    interaction_input?: string | null
    stdout: string
    stderr: string
    aggregated_output: string
    exit_code: number
    duration: CodexEventDuration
    formatted_output: string
    status: 'completed' | 'failed' | 'declined'
}

export interface CodexEventExecCommandOutputDeltaPayload {
    type: 'exec_command_output_delta'
    call_id: string
    stream: 'stdout' | 'stderr' | string
    chunk: string
}

export interface CodexEventTerminalInteractionPayload {
    type: 'terminal_interaction'
    call_id: string
    process_id: string
    stdin: string
}

export interface CodexEventTurnAbortedPayload {
    type: 'turn_aborted'
    turn_id?: string | null
    reason: 'interrupted' | 'replaced' | 'review_ended' | 'budget_limited' | string
    completed_at?: number | null
    duration_ms?: number | null
}

export type CodexWebSearchAction
    = | { type: 'search', query?: string, queries?: Array<string> }
        | { type: 'open_page', url?: string }
        | { type: 'find_in_page', url?: string, pattern?: string }
        | { type: 'other' }

export interface CodexEventWebSearchBeginPayload {
    type: 'web_search_begin'
    call_id: string
}

export interface CodexEventWebSearchEndPayload {
    type: 'web_search_end'
    call_id: string
    query: string
    action: CodexWebSearchAction
}

export interface CodexEventImageGenerationBeginPayload {
    type: 'image_generation_begin'
    call_id: string
}

export interface CodexEventImageGenerationEndPayload {
    type: 'image_generation_end'
    call_id: string
    status: string
    revised_prompt?: string | null
    result: string
    saved_path?: string | null
}

export interface CodexEventViewImageToolCallPayload {
    type: 'view_image_tool_call'
    call_id: string
    path: string
}

export interface CodexEventThreadSettingsAppliedPayload {
    type: 'thread_settings_applied'
    thread_settings: Record<string, unknown>
}

export interface CodexEventSessionConfiguredPayload {
    type: 'session_configured'
    session_id: string
    thread_id: string
    forked_from_id?: string | null
    parent_thread_id?: string | null
    thread_source?: string | null
    thread_name?: string | null
    model: string
    model_provider_id: string
    service_tier?: string | null
    approval_policy: string | Record<string, unknown>
    approvals_reviewer: string
    permission_profile: Record<string, unknown>
    active_permission_profile?: Record<string, unknown> | null
    cwd: string
    reasoning_effort?: string | null
    initial_messages?: Array<Record<string, unknown> & { type: string }> | null
    network_proxy?: {
        http_addr: string
        socks_addr: string
    } | null
    rollout_path?: string | null
}

export interface CodexEventThreadGoalUpdatedPayload {
    type: 'thread_goal_updated'
    thread_id: string
    turn_id?: string | null
    goal: Record<string, unknown>
}

export interface CodexEventDynamicToolCallRequestPayload {
    type: 'dynamic_tool_call_request'
    call_id: string
    turn_id: string
    started_at_ms: number
    namespace?: string | null
    tool: string
    arguments: Record<string, unknown>
}

export interface CodexEventDynamicToolCallResponsePayload {
    type: 'dynamic_tool_call_response'
    call_id: string
    turn_id: string
    completed_at_ms: number
    namespace?: string | null
    tool: string
    arguments: Record<string, unknown>
    content_items: Array<Record<string, unknown> & { type: string }>
    success: boolean
    error?: string | null
    duration: CodexEventDuration
}

export interface CodexEventMcpStartupUpdatePayload {
    type: 'mcp_startup_update'
    server: string
    status: Record<string, unknown> & { state: string }
}

export interface CodexEventMcpStartupCompletePayload {
    type: 'mcp_startup_complete'
    ready: string[]
    failed: Array<{
        server: string
        error: string
    }>
    cancelled: string[]
}

export interface CodexEventMcpToolCallBeginPayload {
    type: 'mcp_tool_call_begin'
    call_id: string
    invocation: {
        server: string
        tool: string
        arguments?: Record<string, unknown> | null
    }
    mcp_app_resource_uri?: string | null
    plugin_id?: string | null
}

export interface CodexEventMcpToolCallEndPayload {
    type: 'mcp_tool_call_end'
    call_id: string
    invocation: {
        server: string
        tool: string
        arguments?: Record<string, unknown> | null
    }
    mcp_app_resource_uri?: string | null
    plugin_id?: string | null
    duration: CodexEventDuration
    result: unknown
}

export interface CodexEventExecApprovalRequestPayload {
    type: 'exec_approval_request'
    call_id: string
    approval_id?: string | null
    turn_id: string
    started_at_ms: number
    command: string[]
    cwd: string
    reason?: string | null
    network_approval_context?: Record<string, unknown> | null
    proposed_execpolicy_amendment?: string[] | null
    proposed_network_policy_amendments?: Array<Record<string, unknown>> | null
    additional_permissions?: Record<string, unknown> | null
    available_decisions?: Array<Record<string, unknown> | string> | null
    parsed_cmd: Array<Record<string, unknown>>
}

export interface CodexEventRequestPermissionsPayload {
    type: 'request_permissions'
    call_id: string
    turn_id: string
    environmentId?: string | null
    started_at_ms: number
    reason?: string | null
    permissions: Record<string, unknown>
    cwd?: string | null
}

export interface CodexEventRequestUserInputPayload {
    type: 'request_user_input'
    call_id: string
    turn_id: string
    questions: Array<{
        id: string
        header: string
        question: string
        isOther?: boolean
        isSecret?: boolean
        options?: Array<{
            label: string
            description: string
        }> | null
    }>
    autoResolutionMs?: number | null
}

export interface CodexEventElicitationRequestPayload {
    type: 'elicitation_request'
    turn_id?: string | null
    server_name: string
    id: string | number
    request: Record<string, unknown> & { mode: string }
}

export interface CodexEventApplyPatchApprovalRequestPayload {
    type: 'apply_patch_approval_request'
    call_id: string
    turn_id: string
    started_at_ms: number
    changes: Record<string, CodexPatchChange>
    reason?: string | null
    grant_root?: string | null
}

export interface CodexEventGuardianAssessmentPayload {
    type: 'guardian_assessment'
    id: string
    target_item_id?: string | null
    turn_id: string
    started_at_ms: number
    completed_at_ms?: number | null
    status: string
    risk_level?: string | null
    user_authorization?: string | null
    rationale?: string | null
    decision_source?: string | null
    action: Record<string, unknown> & { type: string }
}

export interface CodexEventDeprecationNoticePayload {
    type: 'deprecation_notice'
    summary: string
    details?: string | null
}

export interface CodexEventStreamErrorPayload {
    type: 'stream_error'
    message: string
    codex_error_info?: Record<string, unknown> | string | null
    additional_details?: string | null
}

export interface CodexEventTurnDiffPayload {
    type: 'turn_diff'
    unified_diff: string
}

export interface CodexEventRealtimeConversationStartedPayload {
    type: 'realtime_conversation_started'
    realtime_session_id?: string | null
    version: string
}

export interface CodexEventRealtimeConversationRealtimePayload {
    type: 'realtime_conversation_realtime'
    payload: Record<string, unknown>
}

export interface CodexEventRealtimeConversationClosedPayload {
    type: 'realtime_conversation_closed'
    reason?: string | null
}

export interface CodexEventRealtimeConversationSdpPayload {
    type: 'realtime_conversation_sdp'
    sdp: string
}

export interface CodexEventRealtimeConversationListVoicesResponsePayload {
    type: 'realtime_conversation_list_voices_response'
    voices: {
        v1: string[]
        v2: string[]
        default_v1: string
        default_v2: string
    }
}

export interface CodexEventModelReroutePayload {
    type: 'model_reroute'
    from_model: string
    to_model: string
    reason: string
}

export interface CodexEventModelVerificationPayload {
    type: 'model_verification'
    verifications: string[]
}

export interface CodexEventTurnModerationMetadataPayload {
    type: 'turn_moderation_metadata'
    metadata: Record<string, unknown>
}

export interface CodexEventThreadRolledBackPayload {
    type: 'thread_rolled_back'
    num_turns: number
}

export interface CodexEventWarningPayload {
    type: 'warning'
    message: string
}

export interface CodexEventGuardianWarningPayload {
    type: 'guardian_warning'
    message: string
}

export interface CodexEventErrorPayload {
    type: 'error'
    message: string
    codex_error_info?: Record<string, unknown> | string | null
}

export interface CodexEventPlanUpdatePayload {
    type: 'plan_update'
    explanation?: string | null
    plan: Array<{
        step: string
        status: 'pending' | 'in_progress' | 'completed'
    }>
}

export interface CodexEventEnteredReviewModePayload {
    type: 'entered_review_mode'
    target: Record<string, unknown>
    user_facing_hint?: string | null
}

export interface CodexEventExitedReviewModePayload {
    type: 'exited_review_mode'
    review_output?: Record<string, unknown> | null
}

export interface CodexEventRawResponseItemPayload {
    type: 'raw_response_item'
    item: Record<string, unknown> & { type: string }
}

export interface CodexEventItemStartedPayload {
    type: 'item_started'
    thread_id: string
    turn_id: string
    item: Record<string, unknown> & { type: string }
    started_at_ms: number
}

export interface CodexEventItemCompletedPayload {
    type: 'item_completed'
    thread_id: string
    turn_id: string
    item: Record<string, unknown> & { type: string }
    completed_at_ms: number
}

export interface CodexEventHookLifecyclePayload {
    type: 'hook_started' | 'hook_completed'
    turn_id?: string | null
    run: Record<string, unknown>
}

export interface CodexEventAgentMessageContentDeltaPayload {
    type: 'agent_message_content_delta'
    thread_id: string
    turn_id: string
    item_id: string
    delta: string
}

export interface CodexEventPlanDeltaPayload {
    type: 'plan_delta'
    thread_id: string
    turn_id: string
    item_id: string
    delta: string
}

export interface CodexEventReasoningContentDeltaPayload {
    type: 'reasoning_content_delta'
    thread_id: string
    turn_id: string
    item_id: string
    delta: string
    summary_index: number
}

export interface CodexEventReasoningRawContentDeltaPayload {
    type: 'reasoning_raw_content_delta'
    thread_id: string
    turn_id: string
    item_id: string
    delta: string
    content_index: number
}

export interface CodexEventCollabAgentSpawnBeginPayload {
    type: 'collab_agent_spawn_begin'
    call_id: string
    started_at_ms: number
    sender_thread_id: string
    prompt: string
    model: string
    reasoning_effort: string
}

export interface CodexEventCollabAgentSpawnEndPayload {
    type: 'collab_agent_spawn_end'
    call_id: string
    completed_at_ms: number
    sender_thread_id: string
    new_thread_id?: string | null
    new_agent_nickname?: string | null
    new_agent_role?: string | null
    prompt: string
    model: string
    reasoning_effort: string
    status: Record<string, unknown> | string
}

export interface CodexEventCollabAgentInteractionBeginPayload {
    type: 'collab_agent_interaction_begin'
    call_id: string
    started_at_ms: number
    sender_thread_id: string
    receiver_thread_id: string
    prompt: string
}

export interface CodexEventCollabAgentInteractionEndPayload {
    type: 'collab_agent_interaction_end'
    call_id: string
    completed_at_ms: number
    sender_thread_id: string
    receiver_thread_id: string
    receiver_agent_nickname?: string | null
    receiver_agent_role?: string | null
    prompt: string
    status: Record<string, unknown> | string
}

export interface CodexEventCollabWaitingBeginPayload {
    type: 'collab_waiting_begin'
    started_at_ms: number
    sender_thread_id: string
    receiver_thread_ids: string[]
    receiver_agents: Array<Record<string, unknown>>
    call_id: string
}

export interface CodexEventCollabWaitingEndPayload {
    type: 'collab_waiting_end'
    sender_thread_id: string
    call_id: string
    completed_at_ms: number
    agent_statuses: Array<Record<string, unknown>>
    statuses: Record<string, unknown>
}

export interface CodexEventCollabCloseBeginPayload {
    type: 'collab_close_begin'
    call_id: string
    started_at_ms: number
    sender_thread_id: string
    receiver_thread_id: string
}

export interface CodexEventCollabCloseEndPayload {
    type: 'collab_close_end'
    call_id: string
    completed_at_ms: number
    sender_thread_id: string
    receiver_thread_id: string
    receiver_agent_nickname?: string | null
    receiver_agent_role?: string | null
    status: Record<string, unknown> | string
}

export interface CodexEventCollabResumeBeginPayload {
    type: 'collab_resume_begin'
    call_id: string
    started_at_ms: number
    sender_thread_id: string
    receiver_thread_id: string
    receiver_agent_nickname?: string | null
    receiver_agent_role?: string | null
}

export interface CodexEventCollabResumeEndPayload {
    type: 'collab_resume_end'
    call_id: string
    completed_at_ms: number
    sender_thread_id: string
    receiver_thread_id: string
    receiver_agent_nickname?: string | null
    receiver_agent_role?: string | null
    status: Record<string, unknown> | string
}

export interface CodexEventSubAgentActivityPayload {
    type: 'sub_agent_activity'
    event_id: string
    occurred_at_ms: number
    agent_thread_id: string
    agent_path: string
    kind: 'started' | 'interacted' | 'interrupted' | string
}

export interface CodexEventShutdownCompletePayload {
    type: 'shutdown_complete'
}

export interface CodexEventUnknownPayload {
    type: string
    [key: string]: unknown
}

// https://github.com/openai/codex/blob/main/codex-rs/protocol/src/protocol.rs#L1187
export interface CodexEventMsgPayload {
    error: CodexEventErrorPayload
    warning: CodexEventWarningPayload
    guardian_warning: CodexEventGuardianWarningPayload

    realtime_conversation_started: CodexEventRealtimeConversationStartedPayload
    realtime_conversation_realtime: CodexEventRealtimeConversationRealtimePayload
    realtime_conversation_closed: CodexEventRealtimeConversationClosedPayload
    realtime_conversation_sdp: CodexEventRealtimeConversationSdpPayload
    realtime_conversation_list_voices_response: CodexEventRealtimeConversationListVoicesResponsePayload

    model_reroute: CodexEventModelReroutePayload
    model_verification: CodexEventModelVerificationPayload
    turn_moderation_metadata: CodexEventTurnModerationMetadataPayload
    context_compacted: CodexEventContextCompactedPayload
    thread_rolled_back: CodexEventThreadRolledBackPayload

    task_started: CodexEventTaskStartedPayload
    thread_settings_applied: CodexEventThreadSettingsAppliedPayload
    task_complete: CodexEventTaskCompletePayload
    token_count: CodexEventTokenCountPayload

    agent_message: CodexEventAgentMessagePayload
    user_message: CodexUserMessagePayload
    agent_reasoning: CodexEventAgentReasoningPayload
    agent_reasoning_raw_content: CodexEventAgentReasoningRawContentPayload
    agent_reasoning_section_break: CodexEventAgentReasoningSectionBreakPayload

    session_configured: CodexEventSessionConfiguredPayload
    thread_goal_updated: CodexEventThreadGoalUpdatedPayload

    mcp_startup_update: CodexEventMcpStartupUpdatePayload
    mcp_startup_complete: CodexEventMcpStartupCompletePayload
    mcp_tool_call_begin: CodexEventMcpToolCallBeginPayload
    mcp_tool_call_end: CodexEventMcpToolCallEndPayload

    web_search_begin: CodexEventWebSearchBeginPayload
    web_search_end: CodexEventWebSearchEndPayload
    image_generation_begin: CodexEventImageGenerationBeginPayload
    image_generation_end: CodexEventImageGenerationEndPayload

    exec_command_begin: CodexEventExecCommandBeginPayload
    exec_command_output_delta: CodexEventExecCommandOutputDeltaPayload
    terminal_interaction: CodexEventTerminalInteractionPayload
    exec_command_end: CodexEventExecCommandEndPayload
    view_image_tool_call: CodexEventViewImageToolCallPayload

    exec_approval_request: CodexEventExecApprovalRequestPayload
    request_permissions: CodexEventRequestPermissionsPayload
    request_user_input: CodexEventRequestUserInputPayload
    dynamic_tool_call_request: CodexEventDynamicToolCallRequestPayload
    dynamic_tool_call_response: CodexEventDynamicToolCallResponsePayload
    elicitation_request: CodexEventElicitationRequestPayload
    apply_patch_approval_request: CodexEventApplyPatchApprovalRequestPayload
    guardian_assessment: CodexEventGuardianAssessmentPayload

    deprecation_notice: CodexEventDeprecationNoticePayload
    stream_error: CodexEventStreamErrorPayload

    patch_apply_begin: CodexEventPatchApplyBeginPayload
    patch_apply_updated: CodexEventPatchApplyUpdatedPayload
    patch_apply_end: CodexEventPatchApplyEndPayload
    turn_diff: CodexEventTurnDiffPayload
    plan_update: CodexEventPlanUpdatePayload
    turn_aborted: CodexEventTurnAbortedPayload
    shutdown_complete: CodexEventShutdownCompletePayload

    entered_review_mode: CodexEventEnteredReviewModePayload
    exited_review_mode: CodexEventExitedReviewModePayload

    raw_response_item: CodexEventRawResponseItemPayload
    item_started: CodexEventItemStartedPayload
    item_completed: CodexEventItemCompletedPayload
    hook_started: CodexEventHookLifecyclePayload
    hook_completed: CodexEventHookLifecyclePayload
    agent_message_content_delta: CodexEventAgentMessageContentDeltaPayload
    plan_delta: CodexEventPlanDeltaPayload
    reasoning_content_delta: CodexEventReasoningContentDeltaPayload
    reasoning_raw_content_delta: CodexEventReasoningRawContentDeltaPayload

    collab_agent_spawn_begin: CodexEventCollabAgentSpawnBeginPayload
    collab_agent_spawn_end: CodexEventCollabAgentSpawnEndPayload
    collab_agent_interaction_begin: CodexEventCollabAgentInteractionBeginPayload
    collab_agent_interaction_end: CodexEventCollabAgentInteractionEndPayload
    collab_waiting_begin: CodexEventCollabWaitingBeginPayload
    collab_waiting_end: CodexEventCollabWaitingEndPayload
    collab_close_begin: CodexEventCollabCloseBeginPayload
    collab_close_end: CodexEventCollabCloseEndPayload
    collab_resume_begin: CodexEventCollabResumeBeginPayload
    collab_resume_end: CodexEventCollabResumeEndPayload
    sub_agent_activity: CodexEventSubAgentActivityPayload

    other: CodexEventUnknownPayload
}
