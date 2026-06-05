import type { CodexWebSearchAction } from '#shared/types/event.msg'

export type ResponseMessageContentType = 'output_text' | 'input_text' | 'input_image'

export interface CodexResponseMessage {
    type: 'message'
    role: 'developer' | 'user' | 'assistant'
    content: {
        type: ResponseMessageContentType
        text: string
        image_url?: string
    }[]
    phase: 'commentary' | 'final_answer'
}

export interface CodexResponseReasoning {
    type: 'reasoning'
    summary: string[]
    content: string
    encrypted_content: string
}

export interface CodexResponseFunctionCall {
    type: 'function_call'
    name: 'exec_command' | 'js' | 'read_thread_terminal' | 'update_plan' | 'write_stdin' | string
    arguments: string
    call_id: string

}

export interface CodexResponseFunctionCallOutput {
    type: 'function_call_output'
    call_id: string
    output: string
}

export interface CodexResponseCustomToolCall {
    type: 'custom_tool_call'
    status: 'completed' | string
    call_id: string
    name: string
    input: string
}

export interface CodexResponseCustomToolCallOutput {
    type: 'custom_tool_call_output'
    call_id: string
    output: string
}

export interface CodexResponseWebSearchCall {
    type: 'web_search_call'
    status: 'completed' | string
    action: CodexWebSearchAction
}

export interface CodexResponseToolSearchCall {
    type: 'tool_search_call'
    call_id: string
    status: 'completed' | string
    execution: 'client' | string
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
    status: 'completed' | string
    execution: 'client' | string
    tools: CodexToolNamespace[]
}

export interface CodexResponseItemPayload {
    message: CodexResponseMessage
    reasoning: CodexResponseReasoning

    function_call: CodexResponseFunctionCall
    function_call_output: CodexResponseFunctionCallOutput

    custom_tool_call: CodexResponseCustomToolCall
    custom_tool_call_output: CodexResponseCustomToolCallOutput

    web_search_call: CodexResponseWebSearchCall

    tool_search_call: CodexResponseToolSearchCall
    tool_search_output: CodexResponseToolSearchOutput
}
