import type { CodexSessionItem } from '#shared/types/codex'
import type {
    CodexSessionDetail,
    CodexSessionTurnChain,
    CodexSessionTurnStatus,
    CodexSessionWorkflowNode,
    CodexSessionWorkflowNodeKind,
    CodexSessionWorkflowNodeLane,
    CodexSessionWorkflowNodeStat,
    CodexSessionWorkflowTurn,
} from '#shared/types/session'
import type { CodexSessionMetaPayload } from '#shared/types/session.meta'
import { readJsonlLines } from '#server/utils/codex'

type SessionPayload = Record<string, unknown> & {
    type?: string
}

interface WorkflowTurnAccumulator extends CodexSessionWorkflowTurn {}

const TOOL_CALL_PAYLOAD_TYPES = new Set([
    'custom_tool_call',
    'function_call',
    'local_shell_call',
    'tool_search_call',
    'web_search_call',
])

const TOOL_RESULT_PAYLOAD_TYPES = new Set([
    'custom_tool_call_output',
    'function_call_output',
    'image_generation_call',
    'mcp_tool_call_output',
    'tool_search_output',
])

function summarizeText(value: string, limit = 220): string {
    const normalized = value.trim().replace(/\r\n/g, '\n')

    if (!normalized) {
        return ''
    }

    return normalized.length <= limit ? normalized : `${normalized.slice(0, limit)}...`
}

function stringifyUnknown(value: unknown): string {
    if (typeof value === 'string') {
        return value.trim().replace(/\r\n/g, '\n')
    }

    if (Array.isArray(value)) {
        return value
            .map(item => stringifyUnknown(item))
            .filter(Boolean)
            .join('\n')
    }

    if (value === null || value === undefined) {
        return ''
    }

    if (typeof value !== 'object') {
        return String(value)
    }

    try {
        return JSON.stringify(value, null, 2)
    }
    catch {
        return String(value)
    }
}

function summarizeUnknown(value: unknown, limit = 220): string {
    return summarizeText(stringifyUnknown(value), limit)
}

function titleCase(value: string): string {
    return value
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
}

function formatInteger(value: number | null): string {
    return value === null ? '-' : Intl.NumberFormat('en-US').format(value)
}

function readContentItemsText(content: unknown): string {
    if (!Array.isArray(content)) {
        return ''
    }

    return content
        .map((item) => {
            if (!item || typeof item !== 'object' || Array.isArray(item)) {
                return summarizeUnknown(item, 80)
            }

            const itemType = typeof item.type === 'string' ? item.type : ''

            if (itemType === 'input_text' || itemType === 'output_text' || itemType === 'text' || itemType === 'reasoning_text') {
                return typeof item.text === 'string' ? item.text : ''
            }

            if (itemType === 'input_image') {
                return typeof item.image_url === 'string' ? `[image] ${item.image_url}` : '[image]'
            }

            if (itemType === 'encrypted_content') {
                return '[encrypted content]'
            }

            return summarizeUnknown(item, 80)
        })
        .filter(Boolean)
        .join('\n')
}

function buildReasoningContent(payload: SessionPayload): string {
    const summary = Array.isArray(payload.summary)
        ? payload.summary
                .map((item) => {
                    if (!item || typeof item !== 'object' || Array.isArray(item)) {
                        return ''
                    }

                    return typeof item.text === 'string' ? item.text : ''
                })
                .filter(Boolean)
                .join('\n\n')
        : ''

    if (summary) {
        return summary
    }

    const content = readContentItemsText(payload.content)

    if (content) {
        return content
    }

    return typeof payload.encrypted_content === 'string' && payload.encrypted_content
        ? '[encrypted reasoning]'
        : ''
}

function buildMessageContent(payload: SessionPayload): string {
    if (typeof payload.message === 'string' && payload.message.trim()) {
        return stringifyUnknown(payload.message)
    }

    return readContentItemsText(payload.content)
}

function buildToolOutputContent(payload: SessionPayload): string {
    if (typeof payload.output === 'string') {
        return stringifyUnknown(payload.output)
    }

    const content = readContentItemsText(payload.output)
    return content || stringifyUnknown(payload.output)
}

function buildTokenStats(payload: SessionPayload): CodexSessionWorkflowNodeStat[] {
    const info = payload.info as {
        total_token_usage?: {
            total_tokens?: number
            input_tokens?: number
            output_tokens?: number
            reasoning_output_tokens?: number
        }
        last_token_usage?: {
            total_tokens?: number
        }
    } | undefined
    const rateLimits = payload.rate_limits as {
        primary?: { used_percent?: number }
        secondary?: { used_percent?: number }
    } | undefined

    const total = info?.total_token_usage
    const last = info?.last_token_usage
    const primary = rateLimits?.primary
    const secondary = rateLimits?.secondary

    return [
        {
            label: 'Total',
            value: formatInteger(typeof total?.total_tokens === 'number' && Number.isFinite(total.total_tokens) ? total.total_tokens : null),
        },
        {
            label: 'Last',
            value: formatInteger(typeof last?.total_tokens === 'number' && Number.isFinite(last.total_tokens) ? last.total_tokens : null),
        },
        {
            label: 'Input',
            value: formatInteger(typeof total?.input_tokens === 'number' && Number.isFinite(total.input_tokens) ? total.input_tokens : null),
        },
        {
            label: 'Output',
            value: formatInteger(typeof total?.output_tokens === 'number' && Number.isFinite(total.output_tokens) ? total.output_tokens : null),
        },
        {
            label: 'Reasoning',
            value: formatInteger(typeof total?.reasoning_output_tokens === 'number' && Number.isFinite(total.reasoning_output_tokens) ? total.reasoning_output_tokens : null),
        },
        {
            label: 'Primary Limit',
            value: typeof primary?.used_percent === 'number' && Number.isFinite(primary.used_percent) ? `${primary.used_percent}%` : '-',
        },
        {
            label: 'Secondary Limit',
            value: typeof secondary?.used_percent === 'number' && Number.isFinite(secondary.used_percent) ? `${secondary.used_percent}%` : '-',
        },
    ].filter(stat => stat.value !== '-')
}

function buildSessionMetaStats(payload: SessionPayload): CodexSessionWorkflowNodeStat[] {
    const git = payload.git as { branch?: string } | undefined

    return [
        { label: 'Provider', value: typeof payload.model_provider === 'string' ? payload.model_provider : '-' },
        { label: 'Source', value: typeof payload.source === 'string' ? payload.source : '-' },
        { label: 'CLI', value: typeof payload.cli_version === 'string' ? payload.cli_version : '-' },
        { label: 'Thread', value: typeof payload.thread_source === 'string' ? payload.thread_source : '-' },
        { label: 'Branch', value: typeof git?.branch === 'string' ? git.branch : '-' },
    ].filter(stat => stat.value !== '-')
}

function buildTurnContextStats(payload: SessionPayload): CodexSessionWorkflowNodeStat[] {
    const collaborationMode = payload.collaboration_mode as {
        mode?: string
        settings?: {
            reasoning_effort?: string
        }
    } | undefined

    return [
        { label: 'Model', value: typeof payload.model === 'string' ? payload.model : '-' },
        {
            label: 'Effort',
            value: typeof payload.effort === 'string'
                ? payload.effort
                : typeof collaborationMode?.settings?.reasoning_effort === 'string'
                    ? collaborationMode.settings.reasoning_effort
                    : '-',
        },
        { label: 'Timezone', value: typeof payload.timezone === 'string' ? payload.timezone : '-' },
        { label: 'Date', value: typeof payload.current_date === 'string' ? payload.current_date : '-' },
        { label: 'Mode', value: typeof collaborationMode?.mode === 'string' ? collaborationMode.mode : '-' },
    ].filter(stat => stat.value !== '-')
}

function buildStatusStats(payload: SessionPayload): CodexSessionWorkflowNodeStat[] {
    const stats: CodexSessionWorkflowNodeStat[] = []

    if (typeof payload.status === 'string' && payload.status) {
        stats.push({ label: 'Status', value: payload.status })
    }

    if (typeof payload.started_at === 'number' && Number.isFinite(payload.started_at)) {
        stats.push({ label: 'Started At', value: String(payload.started_at) })
    }

    if (typeof payload.completed_at === 'number' && Number.isFinite(payload.completed_at)) {
        stats.push({ label: 'Completed At', value: String(payload.completed_at) })
    }

    if (typeof payload.duration_ms === 'number' && Number.isFinite(payload.duration_ms)) {
        stats.push({ label: 'Duration', value: `${payload.duration_ms}ms` })
    }

    if (typeof payload.model_context_window === 'number' && Number.isFinite(payload.model_context_window)) {
        stats.push({ label: 'Context Window', value: formatInteger(payload.model_context_window) })
    }

    return stats
}

function getToolName(payload: SessionPayload, payloadType: string): string {
    if (payloadType === 'local_shell_call') {
        const action = payload.action as { command?: unknown[] } | undefined
        const command = Array.isArray(action?.command)
            ? action.command.filter(item => typeof item === 'string').join(' ')
            : ''

        return command || 'local shell'
    }

    if (payloadType === 'mcp_tool_call_end') {
        const invocation = payload.invocation as {
            server?: string
            tool?: string
        } | undefined

        return [invocation?.server, invocation?.tool]
            .filter(part => typeof part === 'string' && part)
            .join('.')
    }

    return typeof payload.name === 'string' ? payload.name : payloadType
}

function classifyNode(line: CodexSessionItem, payloadType: string): {
    kind: CodexSessionWorkflowNodeKind
    lane: CodexSessionWorkflowNodeLane
} {
    if (line.type === 'session_meta') {
        return { kind: 'session', lane: 'meta' }
    }

    if (line.type === 'turn_context') {
        return { kind: 'context', lane: 'status' }
    }

    if (payloadType === 'token_count') {
        return { kind: 'metric', lane: 'metric' }
    }

    if (payloadType === 'reasoning' || payloadType === 'agent_reasoning') {
        return { kind: 'reasoning', lane: 'reasoning' }
    }

    if (TOOL_CALL_PAYLOAD_TYPES.has(payloadType)) {
        return { kind: 'tool_call', lane: 'tool_call' }
    }

    if (TOOL_RESULT_PAYLOAD_TYPES.has(payloadType) || ['exec_command_end', 'mcp_tool_call_end', 'patch_apply_end', 'web_search_end'].includes(payloadType)) {
        return { kind: 'tool_result', lane: 'tool_result' }
    }

    if (payloadType === 'error' || payloadType === 'turn_aborted') {
        return { kind: 'error', lane: 'error' }
    }

    if (['agent_message', 'message', 'user_message'].includes(payloadType)) {
        return { kind: 'message', lane: 'message' }
    }

    if (['task_started', 'task_complete', 'thread_name_updated', 'context_compacted', 'context_compaction', 'compaction', 'compaction_trigger'].includes(payloadType)) {
        return { kind: 'status', lane: 'status' }
    }

    return { kind: 'other', lane: 'other' }
}

function buildNodeTitle(line: CodexSessionItem, payload: SessionPayload, payloadType: string): string {
    if (line.type === 'session_meta') {
        return 'Session Meta'
    }

    if (line.type === 'turn_context') {
        return 'Turn Context'
    }

    if (payloadType === 'message') {
        return `${titleCase(typeof payload.role === 'string' ? payload.role : 'message')} Message`
    }

    if (payloadType === 'agent_message') {
        if (payload.phase === 'final_answer') {
            return 'Final Answer'
        }

        if (payload.phase === 'commentary') {
            return 'Commentary'
        }
    }

    if (payloadType === 'user_message') {
        return 'User Message'
    }

    if (payloadType === 'token_count') {
        return 'Token Count'
    }

    if (payloadType === 'reasoning') {
        return 'Reasoning'
    }

    if (payloadType === 'function_call') {
        return 'Function Call'
    }

    if (payloadType === 'function_call_output') {
        return 'Function Result'
    }

    if (payloadType === 'custom_tool_call') {
        return 'Custom Tool Call'
    }

    if (payloadType === 'custom_tool_call_output') {
        return 'Custom Tool Result'
    }

    if (payloadType === 'tool_search_call') {
        return 'Tool Search Call'
    }

    if (payloadType === 'tool_search_output') {
        return 'Tool Search Result'
    }

    if (payloadType === 'web_search_call') {
        return 'Web Search Call'
    }

    if (payloadType === 'web_search_end') {
        return 'Web Search Result'
    }

    if (payloadType === 'local_shell_call') {
        return 'Local Shell Call'
    }

    if (payloadType === 'exec_command_end') {
        return 'Exec Command Result'
    }

    if (payloadType === 'patch_apply_end') {
        return 'Patch Apply Result'
    }

    if (payloadType === 'mcp_tool_call_end') {
        return 'MCP Tool Result'
    }

    if (payloadType === 'task_started') {
        return 'Task Started'
    }

    if (payloadType === 'task_complete') {
        return 'Task Complete'
    }

    if (payloadType === 'turn_aborted') {
        return 'Turn Aborted'
    }

    if (payloadType === 'error') {
        return 'Error'
    }

    return titleCase(payloadType || line.type)
}

function buildNodeSubtitle(line: CodexSessionItem, payload: SessionPayload, payloadType: string): string {
    if (line.type === 'session_meta') {
        return [payload.model_provider, payload.source]
            .filter(part => typeof part === 'string' && part)
            .join(' • ')
    }

    if (line.type === 'turn_context') {
        return [payload.model, payload.effort]
            .filter(part => typeof part === 'string' && part)
            .join(' • ')
    }

    if (payloadType === 'message') {
        return [payload.role, payload.phase]
            .filter(part => typeof part === 'string' && part)
            .join(' • ')
    }

    if (payloadType === 'agent_message') {
        return typeof payload.phase === 'string' ? payload.phase : ''
    }

    if (TOOL_CALL_PAYLOAD_TYPES.has(payloadType) || TOOL_RESULT_PAYLOAD_TYPES.has(payloadType) || ['exec_command_end', 'mcp_tool_call_end', 'patch_apply_end', 'web_search_end'].includes(payloadType)) {
        return getToolName(payload, payloadType)
    }

    return payloadType
}

function buildNodeContent(line: CodexSessionItem, payload: SessionPayload, payloadType: string): string {
    if (line.type === 'session_meta') {
        return typeof payload.cwd === 'string' ? stringifyUnknown(payload.cwd) : ''
    }

    if (line.type === 'turn_context') {
        if (typeof payload.summary === 'string' && payload.summary.trim()) {
            return stringifyUnknown(payload.summary)
        }

        return typeof payload.cwd === 'string' ? stringifyUnknown(payload.cwd) : ''
    }

    if (payloadType === 'user_message' || payloadType === 'agent_message' || payloadType === 'message') {
        return buildMessageContent(payload)
    }

    if (payloadType === 'reasoning' || payloadType === 'agent_reasoning') {
        return buildReasoningContent(payload)
    }

    if (payloadType === 'function_call') {
        return typeof payload.arguments === 'string' ? stringifyUnknown(payload.arguments) : ''
    }

    if (payloadType === 'custom_tool_call') {
        return typeof payload.input === 'string' ? stringifyUnknown(payload.input) : ''
    }

    if (payloadType === 'tool_search_call') {
        return stringifyUnknown(payload.arguments)
    }

    if (payloadType === 'tool_search_output') {
        return stringifyUnknown(payload.tools)
    }

    if (payloadType === 'web_search_call' || payloadType === 'web_search_end') {
        return stringifyUnknown(payload.action)
    }

    if (payloadType === 'local_shell_call') {
        const action = payload.action as { command?: unknown[] } | undefined
        return stringifyUnknown(action?.command)
    }

    if (payloadType === 'function_call_output' || payloadType === 'custom_tool_call_output' || payloadType === 'image_generation_call') {
        return buildToolOutputContent(payload)
    }

    if (payloadType === 'exec_command_end') {
        const output = typeof payload.aggregated_output === 'string' && payload.aggregated_output
            ? payload.aggregated_output
            : typeof payload.formatted_output === 'string' && payload.formatted_output
                ? payload.formatted_output
                : typeof payload.stdout === 'string' && payload.stdout
                    ? payload.stdout
                    : typeof payload.stderr === 'string'
                        ? payload.stderr
                        : ''

        return stringifyUnknown(output)
    }

    if (payloadType === 'patch_apply_end') {
        return stringifyUnknown(payload.changes)
    }

    if (payloadType === 'mcp_tool_call_end') {
        return stringifyUnknown(payload.result)
    }

    if (payloadType === 'error') {
        return typeof payload.message === 'string' ? stringifyUnknown(payload.message) : ''
    }

    if (payloadType === 'turn_aborted') {
        return typeof payload.reason === 'string' ? stringifyUnknown(payload.reason) : ''
    }

    if (payloadType === 'thread_name_updated') {
        return typeof payload.thread_name === 'string' ? stringifyUnknown(payload.thread_name) : ''
    }

    return stringifyUnknown(payload)
}

function buildNodeStats(line: CodexSessionItem, payload: SessionPayload, payloadType: string): CodexSessionWorkflowNodeStat[] {
    if (line.type === 'session_meta') {
        return buildSessionMetaStats(payload)
    }

    if (line.type === 'turn_context') {
        return buildTurnContextStats(payload)
    }

    if (payloadType === 'token_count') {
        return buildTokenStats(payload)
    }

    if (payloadType === 'task_started' || payloadType === 'task_complete') {
        return buildStatusStats(payload)
    }

    if (payloadType === 'exec_command_end') {
        return [
            {
                label: 'Exit Code',
                value: typeof payload.exit_code === 'number' && Number.isFinite(payload.exit_code)
                    ? String(payload.exit_code)
                    : '-',
            },
            {
                label: 'Status',
                value: typeof payload.status === 'string' ? payload.status : '-',
            },
        ].filter(stat => stat.value !== '-')
    }

    if (payloadType === 'patch_apply_end') {
        const changes = payload.changes && typeof payload.changes === 'object' && !Array.isArray(payload.changes)
            ? payload.changes as Record<string, unknown>
            : undefined

        return [
            { label: 'Status', value: typeof payload.status === 'string' ? payload.status : '-' },
            { label: 'Success', value: String(Boolean(payload.success)) },
            { label: 'Files', value: formatInteger(changes ? Object.keys(changes).length : null) },
        ].filter(stat => stat.value !== '-')
    }

    return typeof payload.status === 'string' && payload.status
        ? [{ label: 'Status', value: payload.status }]
        : []
}

function resolveTurnStatus(payloadType: string): CodexSessionTurnStatus {
    if (payloadType === 'task_complete') {
        return 'completed'
    }

    if (payloadType === 'turn_aborted') {
        return 'aborted'
    }

    if (payloadType === 'task_started') {
        return 'running'
    }

    return 'unknown'
}

function getCallKey(turnId: string | undefined, callId: string): string {
    return `${turnId || 'session'}:${callId}`
}

function resolveTurnId(payload: SessionPayload, currentTurnId: string): string {
    return typeof payload.turn_id === 'string' && payload.turn_id
        ? payload.turn_id
        : currentTurnId
}

function ensureTurn(turns: Map<string, WorkflowTurnAccumulator>, turnId: string, timestamp: string): WorkflowTurnAccumulator {
    const existing = turns.get(turnId)

    if (existing) {
        return existing
    }

    const nextTurn: WorkflowTurnAccumulator = {
        turnId,
        status: 'unknown',
        startedAt: timestamp,
        nodeIds: [],
        turnIndex: 0,
    }

    turns.set(turnId, nextTurn)
    return nextTurn
}

export async function getSessionDetail(path: string, id: string): Promise<CodexSessionDetail> {
    const lines = await readJsonlLines(path)
    const sessionMetaLine = lines.find(line => line.type === 'session_meta')
    const nodes: CodexSessionWorkflowNode[] = []
    const edges: CodexSessionDetail['workflow']['edges'] = []
    const turns = new Map<string, WorkflowTurnAccumulator>()
    const toolCalls = new Map<string, string>()

    let currentTurnId = ''
    let lastSequentialNodeId = ''
    let sequence = 0

    for (const line of lines) {
        const payload = line.payload && typeof line.payload === 'object'
            ? line.payload as SessionPayload
            : {}
        const payloadType = typeof payload.type === 'string' ? payload.type : ''
        const turnId = resolveTurnId(payload, currentTurnId) || undefined

        if (turnId) {
            currentTurnId = turnId
            ensureTurn(turns, turnId, line.timestamp)
        }

        const { kind, lane } = classifyNode(line, payloadType)
        const nodeId = `workflow_${sequence + 1}`
        const callId = typeof payload.call_id === 'string' ? payload.call_id : undefined
        const toolName = kind === 'tool_call' || kind === 'tool_result'
            ? getToolName(payload, payloadType)
            : undefined
        const stats = buildNodeStats(line, payload, payloadType)
        const fullContent = buildNodeContent(line, payload, payloadType) || undefined

        const node: CodexSessionWorkflowNode = {
            id: nodeId,
            turnId,
            timestamp: line.timestamp,
            sequence: sequence + 1,
            kind,
            lane,
            lineType: line.type,
            payloadType: payloadType || undefined,
            title: buildNodeTitle(line, payload, payloadType),
            subtitle: buildNodeSubtitle(line, payload, payloadType) || undefined,
            content: fullContent ? summarizeText(fullContent, 200) : undefined,
            contentFull: fullContent,
            callId,
            toolName,
            status: typeof payload.status === 'string' ? payload.status : undefined,
            stats: stats.length ? stats : undefined,
        }

        nodes.push(node)

        if (lastSequentialNodeId) {
            edges.push({
                source: lastSequentialNodeId,
                target: nodeId,
                relation: 'next',
            })
        }

        lastSequentialNodeId = nodeId
        sequence += 1

        if (turnId) {
            const turn = ensureTurn(turns, turnId, line.timestamp)
            turn.nodeIds.push(nodeId)

            const turnStatus = resolveTurnStatus(payloadType)

            if (payloadType === 'task_started') {
                turn.startedAt = line.timestamp
                turn.status = 'running'
            }
            else if (turnStatus === 'completed' || turnStatus === 'aborted') {
                turn.completedAt = line.timestamp
                turn.status = turnStatus
            }
        }

        if (kind === 'tool_call' && callId) {
            toolCalls.set(getCallKey(turnId, callId), nodeId)
        }

        if (kind === 'tool_result' && callId) {
            const sourceNodeId = toolCalls.get(getCallKey(turnId, callId)) ?? toolCalls.get(getCallKey(undefined, callId))

            if (sourceNodeId) {
                edges.push({
                    source: sourceNodeId,
                    target: nodeId,
                    relation: 'result',
                })
            }
        }
    }

    const sortedTurns = [...turns.values()].sort((left, right) => left.startedAt.localeCompare(right.startedAt))

    for (const [index, turn] of sortedTurns.entries()) {
        turn.turnIndex = index
        turn.previousTurnId = index > 0 ? sortedTurns[index - 1]?.turnId : undefined
    }

    const turnChain: CodexSessionTurnChain[] = sortedTurns.slice(1).map((turn, index) => ({
        from: sortedTurns[index]!.turnId,
        to: turn.turnId,
    }))

    return {
        id,
        path,
        sessionMeta: sessionMetaLine ? sessionMetaLine.payload as CodexSessionMetaPayload : null,
        turns: sortedTurns,
        turnChain,
        workflow: {
            nodes,
            edges,
        },
    }
}

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'Missing session id' })
    }

    const path = getQuery(event).path as string
    if (!path) {
        throw createError({ statusCode: 400, message: 'Missing session path' })
    }

    return getSessionDetail(path, id)
})
