import type { CodexWebSearchAction } from '#shared/types/event.msg'
import type { MessagePhase } from '#shared/types/message.phase'

export type ContentItem = { type: 'input_text', text: string }
    | { type: 'input_image', image_url: string, detail?: ImageDetail }
    | { type: 'output_text', text: string }

export interface CodexResponseAgentMessage {
    type: 'agent_message'
    author: string
    recipient: string
    content: {
        type: 'encrypted_content'
        encrypted_content: string
    }[]
}

export interface CodexResponseMessage {
    type: 'message'
    role: 'developer' | 'user' | 'assistant'
    content: Array<ContentItem>
    phase?: MessagePhase
}

export interface ReasoningItemReasoningSummary {
    type: 'summary_text'
    text: string
}

export type ReasoningItemContent = { type: 'reasoning_text', text: string } | { type: 'text', text: string }

export interface CodexResponseReasoning {
    type: 'reasoning'
    summary: Array<ReasoningItemReasoningSummary>
    content?: Array<ReasoningItemContent>
    encrypted_content: string | null
}

export interface CodexResponseFunctionCall {
    type: 'function_call'
    name: 'exec_command' | 'js' | 'read_thread_terminal' | 'update_plan' | 'write_stdin' | string
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
        detail?: 'auto' | 'low' | 'high' | 'original'
    }
    | {
        type: 'encrypted_content'
        encrypted_content: string
    }

export interface CodexResponseFunctionCallOutput {
    type: 'function_call_output'
    call_id: string
    output: string | Array<FunctionCallOutputContentItem>
}

export interface CodexResponseCustomToolCall {
    type: 'custom_tool_call'
    status?: 'completed' | string
    call_id: string
    name: string
    input: string
}

export interface CodexResponseCustomToolCallOutput {
    type: 'custom_tool_call_output'
    call_id: string
    name?: string
    output: string | Array<FunctionCallOutputContentItem>
}

export interface CodexResponseWebSearchCall {
    type: 'web_search_call'
    status: 'in_progress' | 'searching' | 'completed' | 'failed'
    action: CodexWebSearchAction
}

export interface CodexResponseToolSearchCall {
    type: 'tool_search_call'
    call_id: string
    status?: 'in_progress' | 'completed' | 'incomplete' | null
    execution: 'server' | 'client'
    arguments: {
        query: string
        limit: number
    }
}

export interface CodexToolNamespace {
    type: string
    name: string
    description: string
    strict?: boolean
    defer_loading?: boolean
    parameters?: {
        type: string
        properties?: Record<string, {
            type: string
            description: string
        }>
        required?: string[]
        additionalProperties?: boolean
    }
    tools?: CodexToolNamespace[]
}

export interface CodexResponseToolSearchOutput {
    type: 'tool_search_output'
    call_id: string
    status: 'completed' | 'in_progress' | 'incomplete'
    execution: 'server' | 'client'
    tools: CodexToolNamespace[]
}

export interface CodexResponseImageGenerationCall {
    type: 'image_generation_call'
    id: string
    status: string
    revised_prompt?: string
    result: string
}

export interface LocalShellExecAction {
    command: Array<string>
    timeout_ms: bigint | null
    working_directory: string | null
    env: {
        [key in string]?: string
    } | null
    user: string | null
}

export interface CodexResponseLocalShellCall {
    type: 'local_shell_call'
    call_id: string
    status: 'completed' | 'in_progress' | 'incomplete'
    action: { type: 'exec' } & LocalShellExecAction
}

// https://github.com/openai/codex/blob/main/codex-rs/rollout-trace/src/reducer/conversation/normalize.rs#L59
// https://github.com/openai/codex/blob/main/codex-rs/app-server-protocol/schema/typescript/ResponseItem.ts
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
    mcp_tool_call_output: ''
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
    other: {
        type: 'other'
    }
}
