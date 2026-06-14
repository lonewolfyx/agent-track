import type { CodexWebSearchAction } from '#shared/types/event.msg'
import type { MessagePhase } from '#shared/types/message.phase'

export type ContentItem
    = | { type: 'input_text', text: string }
        | { type: 'input_image', image_url: string, detail?: 'auto' | 'low' | 'high' | 'original' | string }
        | { type: 'output_text', text: string }

export type AgentMessageInputContent
    = | { type: 'input_text', text: string }
        | { type: 'encrypted_content', encrypted_content: string }

export interface CodexResponseAgentMessage {
    type: 'agent_message'
    author: string
    recipient: string
    content: AgentMessageInputContent[]
}

export interface CodexResponseMessage {
    type: 'message'
    role: 'developer' | 'user' | 'assistant' | string
    content: ContentItem[]
    phase?: MessagePhase
}

export interface ReasoningItemReasoningSummary {
    type: 'summary_text'
    text: string
}

export type ReasoningItemContent
    = | { type: 'reasoning_text', text: string }
        | { type: 'text', text: string }

export interface CodexResponseReasoning {
    type: 'reasoning'
    summary: ReasoningItemReasoningSummary[]
    content?: ReasoningItemContent[]
    encrypted_content: string
}

export interface CodexResponseFunctionCall {
    type: 'function_call'
    name: string
    arguments: string
    call_id: string
    namespace?: string
}

export type FunctionCallOutputContentItem
    = | {
        type: 'input_text'
        text: string
    }
    | {
        type: 'input_image'
        image_url: string
        detail?: 'auto' | 'low' | 'high' | 'original' | string
    }
    | {
        type: 'encrypted_content'
        encrypted_content: string
    }

export interface CodexResponseFunctionCallOutput {
    type: 'function_call_output'
    call_id: string
    output: string | FunctionCallOutputContentItem[]
}

export interface CodexResponseCustomToolCall {
    type: 'custom_tool_call'
    status?: string
    call_id: string
    name: string
    input: string
}

export interface CodexResponseCustomToolCallOutput {
    type: 'custom_tool_call_output'
    call_id: string
    name?: string
    output: string | FunctionCallOutputContentItem[]
}

export interface CodexResponseWebSearchCall {
    type: 'web_search_call'
    status?: string
    action?: CodexWebSearchAction
}

export interface CodexResponseToolSearchCall {
    type: 'tool_search_call'
    call_id: string
    status?: string
    execution: string
    arguments: string
}

export interface CodexToolNamespace {
    type: string
    name: string
    description: string
    strict?: boolean
    defer_loading?: boolean
    parameters?: Record<string, unknown>
    tools?: CodexToolNamespace[]
}

export interface CodexResponseToolSearchOutput {
    type: 'tool_search_output'
    call_id: string
    status: string
    execution: string
    tools: unknown[]
}

export interface CodexResponseImageGenerationCall {
    type: 'image_generation_call'
    id: string
    status: string
    revised_prompt?: string
    result: string
}

export interface LocalShellExecAction {
    command: string[]
    timeout_ms: bigint
    working_directory: string
    env: {
        [key in string]?: string
    }
    user: string
}

export interface CodexResponseLocalShellCall {
    type: 'local_shell_call'
    call_id: string
    status: 'completed' | 'in_progress' | 'incomplete'
    action: { type: 'exec' } & LocalShellExecAction
}

// Compatibility helpers retained for existing consumers. These are not part of
// `codex_protocol::models::ResponseItem`.
export interface CodexResponseMcpToolCall {
    type: 'mcp_tool_call'
    call_id: string
    status?: string
    invocation?: {
        server?: string
        tool?: string
        arguments?: Record<string, unknown>
    }
    server?: string
    tool?: string
    arguments?: Record<string, unknown>
}

export interface CodexResponseMcpToolCallOutput {
    type: 'mcp_tool_call_output'
    call_id: string
    status?: string
    output?: string | FunctionCallOutputContentItem[] | Record<string, unknown>
    result?: unknown
}

export interface CodexResponseUnknownItem {
    type: 'other'
}

// https://github.com/openai/codex/blob/main/codex-rs/rollout-trace/src/reducer/conversation/normalize.rs#L59
// https://github.com/openai/codex/blob/main/codex-rs/app-server-protocol/schema/typescript/ResponseItem.ts
// https://github.com/openai/codex/blob/main/codex-rs/protocol/src/models.rs#L755
export interface CodexResponseItemPayload {
    agent_message: CodexResponseAgentMessage
    message: CodexResponseMessage
    reasoning: CodexResponseReasoning

    function_call: CodexResponseFunctionCall
    function_call_output: CodexResponseFunctionCallOutput

    custom_tool_call: CodexResponseCustomToolCall
    custom_tool_call_output: CodexResponseCustomToolCallOutput

    web_search_call: CodexResponseWebSearchCall

    tool_search_call: CodexResponseToolSearchCall
    tool_search_output: CodexResponseToolSearchOutput

    image_generation_call: CodexResponseImageGenerationCall
    local_shell_call: CodexResponseLocalShellCall
    mcp_tool_call: CodexResponseMcpToolCall
    mcp_tool_call_output: CodexResponseMcpToolCallOutput
    context_compaction: {
        type: 'context_compaction'
        encrypted_content?: string
    }
    compaction: {
        type: 'compaction'
        encrypted_content: string
    }
    compaction_trigger: {
        type: 'compaction_trigger'
    }
    other: CodexResponseUnknownItem
}
