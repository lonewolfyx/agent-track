import type {
    CodexEventDynamicToolCallRequestPayload,
    CodexEventDynamicToolCallResponsePayload,
    CodexEventErrorPayload,
    CodexEventImageGenerationEndPayload,
    CodexEventMcpToolCallEndPayload,
    CodexEventTokenCountPayload,
    CodexEventTurnAbortedPayload,
    CodexEventWebSearchEndPayload,
} from '#shared/types/event.msg'
import type { CodexResponseFunctionCall } from '#shared/types/function.call'
import type {
    CodexResponseImageGenerationCall,
    CodexResponseLocalShellCall,
    CodexResponseMcpToolCall,
    CodexResponseMcpToolCallOutput,
    CodexResponseReasoning,
    CodexResponseToolSearchCall,
    CodexResponseToolSearchOutput,
    CodexResponseWebSearchCall,
} from '#shared/types/response.item'
import type { CodexSessionThinking } from '#shared/types/session'
import { truncateContent } from '#shared/utils/formatters'

type UnknownRecord = Record<string, unknown>

export interface McpInvocationSummary {
    server?: string
    tool?: string
    arguments?: UnknownRecord
    pluginId?: string
    resourceUri?: string
}

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseMaybeJson(value: unknown): unknown {
    if (typeof value !== 'string') {
        return value
    }

    try {
        return JSON.parse(value)
    }
    catch {
        return value
    }
}

export function formatUnknown(value: unknown): string {
    if (value === undefined || value === null) {
        return ''
    }

    if (typeof value === 'string') {
        return value
    }

    if (typeof value === 'bigint') {
        return value.toString()
    }

    try {
        return JSON.stringify(value, (_, item) => typeof item === 'bigint' ? item.toString() : item, 2)
    }
    catch {
        return String(value)
    }
}

export function summarizeUnknown(value: unknown, length = 80): string {
    return truncateContent(formatUnknown(value).replace(/\s+/g, ' ').trim(), length)
}

export function resolveFunctionCallToolArguments(payload: CodexResponseFunctionCall | undefined): unknown {
    if (!payload) {
        return ''
    }

    const args = parseMaybeJson(payload.arguments)
    if (!isRecord(args)) {
        return args
    }

    switch (payload.name) {
        case 'exec_command':
            return args.cmd ?? args
        case 'shell_command':
            return args.command ?? args
        default:
            return args
    }
}

export function resolveReasoningText(think: CodexSessionThinking): string {
    if (typeof think.content === 'string') {
        return think.content
    }

    const reasoning = think.content as CodexResponseReasoning | undefined
    const summary = reasoning?.summary?.map(item => item.text).filter(Boolean).join('\n')
    if (summary) {
        return summary
    }

    return reasoning?.content?.map(item => item.text).filter(Boolean).join('\n') ?? ''
}

export function resolveErrorMessage(think: CodexSessionThinking): string {
    if (typeof think.content === 'string') {
        return think.content
    }

    const payload = think.payload as CodexEventErrorPayload | undefined
    return payload?.message ?? ''
}

export function resolveTokenPayload(think: CodexSessionThinking): CodexEventTokenCountPayload | undefined {
    return think.content as CodexEventTokenCountPayload | undefined
}

export function resolveTurnAbortedPayload(think: CodexSessionThinking): CodexEventTurnAbortedPayload | undefined {
    return think.content as CodexEventTurnAbortedPayload | undefined
}

export function resolveToolSearchArguments(call: CodexResponseToolSearchCall | undefined): unknown {
    return parseMaybeJson(call?.arguments)
}

export function resolveToolSearchOutput(think: CodexSessionThinking): CodexResponseToolSearchOutput | undefined {
    return think.output?.response as CodexResponseToolSearchOutput | undefined
}

export function resolveMcpInvocation(think: CodexSessionThinking): McpInvocationSummary {
    const call = think.call as CodexResponseMcpToolCall | undefined
    const event = think.output?.event as CodexEventMcpToolCallEndPayload | undefined

    const invocation = call?.invocation ?? event?.invocation
    return {
        server: invocation?.server ?? call?.server,
        tool: invocation?.tool ?? call?.tool,
        arguments: invocation?.arguments ?? call?.arguments,
        pluginId: event?.plugin_id,
        resourceUri: event?.mcp_app_resource_uri,
    }
}

export function resolveMcpOutput(think: CodexSessionThinking): unknown {
    const event = think.output?.event as CodexEventMcpToolCallEndPayload | undefined
    const response = think.output?.response as CodexResponseMcpToolCallOutput | undefined
    return event?.result ?? response?.result ?? response?.output
}

export function formatMcpToolName(invocation: McpInvocationSummary): string {
    return [invocation.server, invocation.tool].filter(Boolean).join('.') || 'mcp tool'
}

export function resolveDynamicToolRequest(think: CodexSessionThinking): CodexEventDynamicToolCallRequestPayload | undefined {
    return think.call as CodexEventDynamicToolCallRequestPayload | undefined
}

export function resolveDynamicToolResponse(think: CodexSessionThinking): CodexEventDynamicToolCallResponsePayload | undefined {
    return think.output?.event as CodexEventDynamicToolCallResponsePayload | undefined
}

export function formatDynamicToolName(
    payload: CodexEventDynamicToolCallRequestPayload | CodexEventDynamicToolCallResponsePayload | undefined,
): string {
    return [payload?.namespace, payload?.tool].filter(Boolean).join('.') || 'dynamic tool'
}

export function resolveImageGenerationCall(think: CodexSessionThinking): CodexResponseImageGenerationCall | undefined {
    return think.call as CodexResponseImageGenerationCall | undefined
}

export function resolveImageGenerationEnd(think: CodexSessionThinking): CodexEventImageGenerationEndPayload | undefined {
    return think.output?.event as CodexEventImageGenerationEndPayload | undefined
}

export function resolveImageGenerationResult(think: CodexSessionThinking): string {
    const call = resolveImageGenerationCall(think)
    const event = resolveImageGenerationEnd(think)
    return event?.saved_path ?? event?.result ?? call?.result ?? ''
}

export function resolveLocalShellCall(think: CodexSessionThinking): CodexResponseLocalShellCall | undefined {
    return think.call as CodexResponseLocalShellCall | undefined
}

export function formatCommand(command: unknown): string {
    if (!Array.isArray(command)) {
        return formatUnknown(command)
    }

    return command.map(item => String(item)).join(' ')
}

export function formatLocalShellCommand(think: CodexSessionThinking): string {
    return formatCommand(resolveLocalShellCall(think)?.action?.command)
}

export function resolveWebSearchEvent(think: CodexSessionThinking): CodexEventWebSearchEndPayload | undefined {
    return think.output?.event as CodexEventWebSearchEndPayload | undefined
}

export function resolveWebSearchCall(think: CodexSessionThinking): CodexResponseWebSearchCall | undefined {
    return think.call as CodexResponseWebSearchCall | undefined
}
