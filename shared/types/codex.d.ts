// Codex Session JSONL Type Definitions
// Generated from agents/2026 and ~/.codex/sessions/2026 JSONL data

// ============================================================
// Utility Types
// ============================================================

interface Duration {
    secs: number
    nanos: number
}

// ============================================================
// 1. session_meta
// ============================================================

interface CodexGitInfo {
    commit_hash: string
    branch: string
    repository_url?: string
}

interface CodexDynamicToolParameter {
    type: string
    properties?: Record<string, unknown>
    required?: string[]
    [key: string]: unknown
}

interface CodexDynamicTool {
    name: string
    description: string
    inputSchema: CodexDynamicToolParameter
    deferLoading?: boolean
}

interface CodexSessionMetaPayload {
    id: string
    timestamp: string
    cwd: string
    originator: 'codex-tui' | 'Codex Desktop' | string
    cli_version: string
    source: 'cli' | 'vscode' | string
    model_provider: string
    base_instructions: { text: string }
    git?: CodexGitInfo
    dynamic_tools?: CodexDynamicTool[]
    memory_mode?: string
    thread_source?: string
}

// ============================================================
// 2. event_msg subtypes
// ============================================================

// 2a. task_started
interface CodexEventTaskStarted {
    type: 'task_started'
    turn_id: string
    model_context_window: number
    collaboration_mode_kind: 'default' | string
    started_at?: number
}

// 2b. task_complete
interface CodexEventTaskComplete {
    type: 'task_complete'
    turn_id: string
    last_agent_message: string
    completed_at: number
    duration_ms: number
    time_to_first_token_ms?: number
}

// 2c. turn_aborted
interface CodexEventTurnAborted {
    type: 'turn_aborted'
    turn_id: string
    reason: 'interrupted' | string
    completed_at: number
    duration_ms: number
}

// 2d. user_message
interface CodexEventUserMessage {
    type: 'user_message'
    message: string
    images: string[]
    local_images: unknown[]
    text_elements: unknown[]
}

// 2e. agent_message
interface CodexEventAgentMessage {
    type: 'agent_message'
    message: string
    phase: 'commentary' | 'final_answer'
    memory_citation: string | null
}

// 2f. context_compacted
interface CodexEventContextCompacted {
    type: 'context_compacted'
}

// 2g. token_count
interface CodexTokenUsage {
    input_tokens: number
    cached_input_tokens: number
    output_tokens: number
    reasoning_output_tokens: number
    total_tokens: number
}

interface CodexRateLimitBucket {
    used_percent: number
    window_minutes: number
    resets_at: number
}

interface CodexCredits {
    has_credits: boolean
    unlimited: boolean
    balance: number
}

interface CodexRateLimits {
    limit_id: string
    limit_name: string
    primary: CodexRateLimitBucket
    secondary: CodexRateLimitBucket
    credits: CodexCredits | null
    plan_type: string
    rate_limit_reached_type: string | null
}

interface CodexTokenCountInfo {
    total_token_usage: CodexTokenUsage
    last_token_usage: CodexTokenUsage
    model_context_window: number
}

interface CodexEventTokenCount {
    type: 'token_count'
    info: CodexTokenCountInfo | null
    rate_limits: CodexRateLimits
}

// 2h. exec_command_end
interface CodexParsedCmd {
    type: 'read' | 'search' | 'list_files' | 'unknown'
    cmd: string
    name?: string
    path?: string
    query?: string
}

interface CodexEventExecCommandEnd {
    type: 'exec_command_end'
    call_id: string
    process_id: number
    turn_id: string
    command: string[]
    cwd: string
    parsed_cmd: CodexParsedCmd[]
    source: 'unified_exec_startup' | string
    stdout: string
    stderr: string
    aggregated_output: string
    exit_code: number
    duration: Duration
    formatted_output: string
    status: 'completed' | 'failed'
}

// 2i. patch_apply_end
interface CodexPatchChangeAdd {
    type: 'add'
    content: string
}

interface CodexPatchChangeUpdate {
    type: 'update'
    unified_diff: string
    move_path?: string | null
}

interface CodexPatchChangeDelete {
    type: 'delete'
    unified_diff: string
}

type CodexPatchChange = CodexPatchChangeAdd | CodexPatchChangeUpdate | CodexPatchChangeDelete

interface CodexEventPatchApplyEnd {
    type: 'patch_apply_end'
    call_id: string
    turn_id: string
    stdout: string
    stderr: string
    success: boolean
    changes: Record<string, CodexPatchChange>
    status: 'completed' | 'failed'
}

// 2j. web_search_end
interface CodexWebSearchAction {
    type: 'search' | 'open_page' | 'find_in_page' | 'other'
    query?: string
    queries?: string[]
    url?: string
    pattern?: string
}

interface CodexEventWebSearchEnd {
    type: 'web_search_end'
    call_id: string
    query: string
    action: CodexWebSearchAction
}

// 2k. mcp_tool_call_end
interface CodexMcpInvocation {
    server: string
    tool: string
    arguments: Record<string, unknown>
}

interface McpContentItem {
    type: string
    text: string
}

interface CodexMcpResult {
    Ok: {
        content: McpContentItem[]
        isError: boolean
    }
}

interface CodexEventMcpToolCallEnd {
    type: 'mcp_tool_call_end'
    call_id: string
    invocation: CodexMcpInvocation
    duration: Duration
    result: CodexMcpResult
}

// 2l. error
interface CodexEventError {
    type: 'error'
    message: string
    codex_error_info: 'other' | string
}

// 2m. thread_name_updated
interface CodexEventThreadNameUpdated {
    type: 'thread_name_updated'
    thread_id: string
    thread_name: string
}

// Union of all event_msg payloads
type CodexEventMsgPayload
    = | CodexEventTaskStarted
        | CodexEventTaskComplete
        | CodexEventTurnAborted
        | CodexEventUserMessage
        | CodexEventAgentMessage
        | CodexEventContextCompacted
        | CodexEventTokenCount
        | CodexEventExecCommandEnd
        | CodexEventPatchApplyEnd
        | CodexEventWebSearchEnd
        | CodexEventMcpToolCallEnd
        | CodexEventError
        | CodexEventThreadNameUpdated

// ============================================================
// 3. response_item subtypes
// ============================================================

// 3a. message
interface CodexInputTextContent {
    type: 'input_text'
    text: string
}

interface CodexOutputTextContent {
    type: 'output_text'
    text: string
}

interface CodexInputImageContent {
    type: 'input_image'
    image_url: string
}

type CodexMessageContent = CodexInputTextContent | CodexOutputTextContent | CodexInputImageContent

interface CodexResponseMessage {
    type: 'message'
    role: 'developer' | 'user' | 'assistant'
    content: CodexMessageContent[]
}

// 3b. reasoning
interface CodexResponseReasoning {
    type: 'reasoning'
    summary: unknown[]
    content: null
    encrypted_content: string
}

// 3c. function_call
interface CodexResponseFunctionCall {
    type: 'function_call'
    name: 'exec_command' | 'js' | 'read_thread_terminal' | 'update_plan' | 'write_stdin' | string
    arguments: string
    call_id: string
}

// 3d. function_call_output
interface CodexResponseFunctionCallOutput {
    type: 'function_call_output'
    call_id: string
    output: string
}

// 3e. custom_tool_call
interface CodexResponseCustomToolCall {
    type: 'custom_tool_call'
    status: 'completed' | string
    call_id: string
    name: 'apply_patch' | string
    input: string
}

// 3f. custom_tool_call_output
interface CodexResponseCustomToolCallOutput {
    type: 'custom_tool_call_output'
    call_id: string
    output: string
}

// 3g. web_search_call
interface CodexResponseWebSearchCall {
    type: 'web_search_call'
    status: 'completed' | string
    action: CodexWebSearchAction
}

// 3h. tool_search_call
interface CodexResponseToolSearchCall {
    type: 'tool_search_call'
    call_id: string
    status: 'completed' | string
    execution: 'client'
    arguments: { query: string, limit: number }
}

// 3i. tool_search_output
interface CodexToolFunctionParam {
    type: string
    properties?: Record<string, unknown>
    required?: string[]
    [key: string]: unknown
}

interface CodexToolFunction {
    type: 'function'
    name: string
    description: string
    strict: boolean
    defer_loading?: boolean
    parameters: CodexToolFunctionParam
}

interface CodexToolNamespace {
    type: 'namespace'
    name: string
    description: string
    tools: CodexToolFunction[]
}

interface CodexResponseToolSearchOutput {
    type: 'tool_search_output'
    call_id: string
    status: 'completed' | string
    execution: 'client'
    tools: CodexToolNamespace[]
}

// Union of all response_item payloads
type CodexResponseItemPayload
    = | CodexResponseMessage
        | CodexResponseReasoning
        | CodexResponseFunctionCall
        | CodexResponseFunctionCallOutput
        | CodexResponseCustomToolCall
        | CodexResponseCustomToolCallOutput
        | CodexResponseWebSearchCall
        | CodexResponseToolSearchCall
        | CodexResponseToolSearchOutput

// ============================================================
// 4. turn_context
// ============================================================

interface CodexSandboxPolicy {
    type: 'workspace-write' | string
    writable_roots?: string[]
    network_access?: boolean
    exclude_tmpdir_env_var?: boolean
    exclude_slash_tmp?: boolean
}

interface CodexTruncationPolicy {
    mode: 'tokens'
    limit: number
}

interface CodexCollaborationSettings {
    model: string
    reasoning_effort: 'high' | 'medium' | string
    developer_instructions?: string
}

interface CodexCollaborationMode {
    mode: 'default' | string
    settings: CodexCollaborationSettings
}

interface CodexGranularApproval {
    request_permissions: unknown
    sandbox_approval: unknown
    skill_approval: unknown
    mcp_elicitations: unknown
    rules: unknown
}

interface CodexFileSandboxPolicy {
    kind: string
    entries: unknown
}

interface CodexPermissionProfile {
    type: string
    file_system: { type: string, entries: unknown }
    network: unknown
}

interface CodexTurnContextPayload {
    turn_id: string
    cwd: string
    current_date: string
    timezone: string
    approval_policy: 'on-request' | { granular: CodexGranularApproval }
    sandbox_policy: CodexSandboxPolicy
    model: string
    personality: string
    collaboration_mode: CodexCollaborationMode
    realtime_active: boolean
    summary: 'none' | string
    effort?: 'high' | 'medium' | string
    developer_instructions?: string
    truncation_policy?: CodexTruncationPolicy
    file_system_sandbox_policy?: CodexFileSandboxPolicy
    permission_profile?: CodexPermissionProfile
    workspace_roots?: string[]
}

// ============================================================
// 5. compacted
// ============================================================

interface CodexCompactedPayload {
    message: string
}

// ============================================================
// CodexSessionContext
// ============================================================

interface CodexSessionTypeMap {
    session_meta: CodexSessionMetaPayload
    event_msg: CodexEventMsgPayload
    response_item: CodexResponseItemPayload
    turn_context: CodexTurnContextPayload
    compacted: CodexCompactedPayload
}

type CodexSessionType = keyof CodexSessionTypeMap

interface CodexSessionContext {
    timestamp: string
    type: CodexSessionType
    payload: CodexSessionTypeMap[CodexSessionType]
}
