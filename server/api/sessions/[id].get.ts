import type {
    CodexSessionChatTurn,
    CodexSessionModelInfo,
    CodexSessionThoughtStep,
    CodexSessionTokenUsage,
    CodexSessionToolBrief,
    CodexSessionToolKind,
    CodexSessionTurnStatus,
    CodexThoughtTool,
} from '#shared/types/session'
import { readJsonlLines } from '#server/utils/codex'

function emptyTokenUsage(): CodexSessionTokenUsage {
    return {
        inputTokens: 0,
        cachedInputTokens: 0,
        outputTokens: 0,
        reasoningOutputTokens: 0,
        totalTokens: 0,
    }
}

function parseTokenUsage(raw: any): CodexSessionTokenUsage {
    if (!raw)
        return emptyTokenUsage()
    return {
        inputTokens: raw.input_tokens ?? 0,
        cachedInputTokens: raw.cached_input_tokens ?? 0,
        outputTokens: raw.output_tokens ?? 0,
        reasoningOutputTokens: raw.reasoning_output_tokens ?? 0,
        totalTokens: raw.total_tokens ?? 0,
    }
}

function isThoughtTool(entry: CodexSessionThoughtStep): entry is CodexThoughtTool {
    return entry.kind === 'tool'
}

function pushToolEntry(turn: TurnBucket, entry: CodexThoughtTool) {
    const index = turn.thoughts.length
    turn.thoughts.push(entry)
    if (entry.callId) {
        turn.callIdIndex.set(entry.callId, index)
    }
    recordToolUsage(turn, entry.toolName, entry.toolKind)
}

function fillToolResult(turn: TurnBucket, callId: string, output: string, status?: string, resultPayload?: unknown) {
    const index = callId ? turn.callIdIndex.get(callId) : undefined
    if (index !== undefined && index < turn.thoughts.length) {
        const entry = turn.thoughts[index] as CodexSessionThoughtStep
        if (entry.kind === 'tool') {
            entry.output = output
            if (status)
                entry.status = status
            entry.resultPayload = resultPayload
        }
    }
    else {
        // orphan result, push as standalone
        turn.thoughts.push({
            kind: 'tool',
            toolKind: 'function',
            toolName: '',
            callId,
            input: '',
            output,
            status,
            callPayload: null,
            resultPayload,
        })
    }
}

function getToolOutput(payload: any): string {
    const output = payload.output
    if (typeof output === 'string')
        return output
    if (Array.isArray(output)) {
        return output
            .map((item: any) => {
                if (item.type === 'input_text')
                    return item.text ?? ''
                if (item.type === 'encrypted_content')
                    return '[encrypted]'
                return ''
            })
            .filter(Boolean)
            .join('\n')
    }
    return ''
}

interface TurnBucket {
    id: string
    startedAt: number
    completedAt?: number
    durationMs?: number
    status: CodexSessionTurnStatus

    models: Map<string, CodexSessionModelInfo>

    userMessage: string

    inThinking: boolean
    thoughts: CodexSessionThoughtStep[]

    finalAnswer: string
    finalAnswerTokenUsage: CodexSessionTokenUsage

    totalTokenUsage: CodexSessionTokenUsage

    toolCalls: Map<string, { name: string, kind: CodexSessionToolKind, count: number }>

    // callId -> thoughts 数组中的 index，用于回填 tool_result
    callIdIndex: Map<string, number>
}

export async function getSessionDetailV2(path: string) {
    const lines = await readJsonlLines(path)

    const session_meta = lines.find(line => line.type === 'session_meta')
    const turns = new Map<string, TurnBucket>()
    let currentTurnId = ''

    for (const line of lines) {
        const payload = line.payload as any

        // task_started: 创建新 turn
        if (line.type === 'event_msg' && payload.type === 'task_started') {
            currentTurnId = payload.turn_id
            turns.set(currentTurnId, {
                id: currentTurnId,
                startedAt: payload.started_at ?? 0,
                status: 'running',
                models: new Map(),
                userMessage: '',
                inThinking: false,
                thoughts: [],
                finalAnswer: '',
                finalAnswerTokenUsage: emptyTokenUsage(),
                totalTokenUsage: emptyTokenUsage(),
                toolCalls: new Map(),
                callIdIndex: new Map(),
            })
            continue
        }

        const turn = turns.get(currentTurnId)
        if (!turn)
            continue

        // turn_context: 提取模型信息
        if (line.type === 'turn_context') {
            const model = payload.model ?? ''
            const effort = payload.effort ?? payload.collaboration_mode?.settings?.reasoning_effort
            if (model && !turn.models.has(model)) {
                turn.models.set(model, { model, effort })
            }
            continue
        }

        // user_message: 用户提问（取最后一条非 thinking 内的）
        if (line.type === 'event_msg' && payload.type === 'user_message' && !turn.inThinking) {
            turn.userMessage = payload.message ?? ''
            continue
        }

        // task_complete
        if (line.type === 'event_msg' && payload.type === 'task_complete') {
            turn.status = 'completed'
            turn.completedAt = payload.completed_at
            turn.durationMs = payload.duration_ms
            if (payload.last_agent_message && !turn.finalAnswer) {
                turn.finalAnswer = payload.last_agent_message
            }
            continue
        }

        // turn_aborted
        if (line.type === 'event_msg' && payload.type === 'turn_aborted') {
            turn.status = 'aborted'
            turn.completedAt = payload.completed_at
            turn.durationMs = payload.duration_ms
            continue
        }

        // === 以下是 thinking 区间内的事件 ===

        // reasoning: 开始 thinking 阶段
        if (line.type === 'response_item' && payload.type === 'reasoning') {
            turn.inThinking = true

            // 提取 reasoning 内容
            const texts: string[] = []
            if (Array.isArray(payload.summary)) {
                for (const item of payload.summary) {
                    if (typeof item === 'string')
                        texts.push(item)
                    else if (item?.text)
                        texts.push(item.text)
                }
            }
            if (Array.isArray(payload.content)) {
                for (const item of payload.content) {
                    if (item?.text)
                        texts.push(item.text)
                }
            }
            const content = texts.join('\n\n').trim()
            if (content) {
                turn.thoughts.push({ kind: 'reasoning', content, payload })
            }
            continue
        }

        // agent_message (commentary): thinking 文本
        if (line.type === 'event_msg' && payload.type === 'agent_message' && payload.phase === 'commentary') {
            turn.inThinking = true
            const content = (payload.message ?? '').trim()
            if (content) {
                turn.thoughts.push({ kind: 'commentary', content, payload })
            }
            continue
        }

        // response_item/message (commentary): 与 agent_message 重复，跳过
        if (line.type === 'response_item' && payload.type === 'message' && payload.phase === 'commentary') {
            continue
        }

        // agent_message (final_answer): 结束 thinking
        if (line.type === 'event_msg' && payload.type === 'agent_message' && payload.phase === 'final_answer') {
            turn.inThinking = false
            turn.finalAnswer = payload.message ?? ''
            continue
        }

        // response_item/message (final_answer): 结束 thinking
        if (line.type === 'response_item' && payload.type === 'message' && payload.phase === 'final_answer') {
            turn.inThinking = false
            const texts = (payload.content ?? [])
                .filter((c: any) => c.type === 'output_text' && c.text)
                .map((c: any) => c.text)
            if (texts.length > 0) {
                turn.finalAnswer = texts.join('\n')
            }
            continue
        }

        // token_count: 始终处理（用于 totalTokenUsage 和 finalAnswerTokenUsage）
        if (line.type === 'event_msg' && payload.type === 'token_count') {
            const lastUsage = parseTokenUsage(payload.info?.last_token_usage)
            const totalUsage = parseTokenUsage(payload.info?.total_token_usage)

            if (totalUsage.totalTokens > 0) {
                turn.totalTokenUsage = totalUsage
            }

            if (turn.inThinking) {
                turn.thoughts.push({
                    kind: 'token_usage',
                    tokenUsage: payload,
                    payload,
                })
            }

            // 关联 finalAnswerToken（final_answer 之后的第一个 token_count）
            if (turn.finalAnswer && turn.finalAnswerTokenUsage.totalTokens === 0) {
                turn.finalAnswerTokenUsage = lastUsage
            }
            continue
        }

        // 只有在 thinking 区间内才收集以下事件
        if (!turn.inThinking) {
            continue
        }

        // function_call: 工具调用
        if (line.type === 'response_item' && payload.type === 'function_call') {
            pushToolEntry(turn, {
                kind: 'tool',
                toolKind: 'function',
                toolName: payload.name ?? '',
                callId: payload.call_id ?? '',
                input: payload.arguments ?? '',
                output: '',
                callPayload: payload,
            })
            continue
        }

        // function_call_output: 工具结果 → 回填到对应 tool_call
        if (line.type === 'response_item' && payload.type === 'function_call_output') {
            fillToolResult(turn, payload.call_id ?? '', getToolOutput(payload), undefined, payload)
            continue
        }

        // custom_tool_call: 自定义工具调用 (apply_patch 等)
        if (line.type === 'response_item' && payload.type === 'custom_tool_call') {
            pushToolEntry(turn, {
                kind: 'tool',
                toolKind: 'custom',
                toolName: payload.name ?? '',
                callId: payload.call_id ?? '',
                input: payload.input ?? '',
                output: '',
                callPayload: payload,
            })
            continue
        }

        // custom_tool_call_output: 自定义工具结果 → 回填
        if (line.type === 'response_item' && payload.type === 'custom_tool_call_output') {
            fillToolResult(turn, payload.call_id ?? '', getToolOutput(payload), undefined, payload)
            continue
        }

        // web_search_call
        if (line.type === 'response_item' && payload.type === 'web_search_call') {
            pushToolEntry(turn, {
                kind: 'tool',
                toolKind: 'web_search',
                toolName: 'web_search',
                callId: payload.call_id ?? '',
                input: JSON.stringify(payload.action ?? {}),
                output: '',
                callPayload: payload,
            })
            continue
        }

        // tool_search_call
        if (line.type === 'response_item' && payload.type === 'tool_search_call') {
            pushToolEntry(turn, {
                kind: 'tool',
                toolKind: 'tool_search',
                toolName: 'tool_search',
                callId: payload.call_id ?? '',
                input: JSON.stringify(payload.arguments ?? {}),
                output: '',
                callPayload: payload,
            })
            continue
        }

        // tool_search_output → 回填
        if (line.type === 'response_item' && payload.type === 'tool_search_output') {
            fillToolResult(turn, payload.call_id ?? '', JSON.stringify(payload.tools ?? []), undefined, payload)
            continue
        }

        // local_shell_call
        if (line.type === 'response_item' && payload.type === 'local_shell_call') {
            pushToolEntry(turn, {
                kind: 'tool',
                toolKind: 'function',
                toolName: 'shell',
                callId: payload.call_id ?? '',
                input: JSON.stringify(payload.action ?? {}),
                output: '',
                callPayload: payload,
            })
            continue
        }

        // patch_apply_end: 补丁执行结果 → 回填
        if (line.type === 'event_msg' && payload.type === 'patch_apply_end') {
            const output = [payload.stdout, payload.stderr].filter(Boolean).join('\n')
            fillToolResult(turn, payload.call_id ?? '', output, payload.status, payload)
            continue
        }

        // exec_command_end: 命令执行结果 → 回填
        if (line.type === 'event_msg' && payload.type === 'exec_command_end') {
            const output = payload.formatted_output || payload.aggregated_output || [payload.stdout, payload.stderr].filter(Boolean).join('\n')
            fillToolResult(turn, payload.call_id ?? '', output, payload.status, payload)
            continue
        }

        // web_search_end → 回填
        if (line.type === 'event_msg' && payload.type === 'web_search_end') {
            fillToolResult(turn, payload.call_id ?? '', JSON.stringify(payload.action ?? {}), undefined, payload)
            continue
        }

        // mcp_tool_call_end → 回填
        if (line.type === 'event_msg' && payload.type === 'mcp_tool_call_end') {
            const invocation = payload.invocation ?? {}
            const toolName = [invocation.server, invocation.tool].filter(Boolean).join('.')
            const resultContent = payload.result?.Ok?.content ?? []
            const output = resultContent.map((c: any) => c.text ?? '').filter(Boolean).join('\n')
            fillToolResult(turn, payload.call_id ?? '', output, undefined, payload)
            // MCP 没有单独的 call 事件，只有 end，所以同时记录工具使用
            recordToolUsage(turn, toolName, 'mcp')
            continue
        }

        // user_message (thinking 区间内的用户中途消息)
        if (line.type === 'event_msg' && payload.type === 'user_message') {
            const content = (payload.message ?? '').trim()
            if (content) {
                turn.thoughts.push({ kind: 'user_message', content, payload })
            }
            continue
        }

        // response_item/message (user): 跳过，与 event_msg/user_message 重复
        if (line.type === 'response_item' && payload.type === 'message' && payload.role === 'user') {
            continue
        }

        // error
        if (line.type === 'event_msg' && payload.type === 'error') {
            turn.thoughts.push({ kind: 'error', message: payload.message ?? '', payload })
            continue
        }
    }

    // 构建最终结果
    const result: CodexSessionChatTurn[] = [...turns.values()]
        .sort((a, b) => a.startedAt - b.startedAt)
        .map(turn => ({
            id: turn.id,
            startedAt: turn.startedAt,
            completedAt: turn.completedAt,
            durationMs: turn.durationMs,
            status: turn.status,

            models: [...turn.models.values()],

            userMessage: turn.userMessage,

            thoughts: turn.thoughts,
            finalAnswer: turn.finalAnswer,
            finalAnswerTokenUsage: turn.finalAnswerTokenUsage,

            totalTokenUsage: turn.totalTokenUsage,

            tools: [...turn.toolCalls.values()] as CodexSessionToolBrief[],
        }))

    return {
        session_meta,
        turns: result,
    }
}

function recordToolUsage(
    turn: TurnBucket,
    toolName: string,
    toolKind: CodexSessionToolKind,
) {
    if (!toolName)
        return
    const existing = turn.toolCalls.get(toolName)
    if (existing) {
        existing.count++
    }
    else {
        turn.toolCalls.set(toolName, { name: toolName, kind: toolKind, count: 1 })
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

    const { session_meta, turns } = await getSessionDetailV2(path)

    return {
        id,
        path,
        session_meta,
        turns,
    }
})
