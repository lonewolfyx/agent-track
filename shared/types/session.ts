export interface CodexSessionListItem {
    id: string
    title: string
    model: {
        model: string
        effort?: string
    }[]
    cwd: string
    filename: string
    prompt: number
    call: number
    createTime: string
}

export interface CodexSessionMonthGroup {
    label: string
    children: CodexSessionListItem[]
}

export type CodexSessionTurnStatus = 'completed' | 'aborted' | 'running'

export type CodexSessionToolKind = 'function' | 'custom' | 'mcp' | 'web_search' | 'tool_search'

export type CodexSessionWorkflowNodeKind
    = 'task_started'
        | 'user_message'
        | 'thought'
        | 'commentary'
        | 'tool_call'
        | 'tool_result'
        | 'assistant_answer'
        | 'error'
        | 'task_complete'
        | 'turn_aborted'

export type CodexSessionWorkflowEdgeRelation = 'next' | 'result'

export type CodexSessionChatEventType = '提问' | '思考' | '过程' | '工具调用' | '工具返回' | '回答' | '异常'

export interface CodexSessionChatItem {
    id: string
    turnId: string
    timestamp: string
    type: CodexSessionChatEventType
    title?: string
    content?: string
    source?: 'reasoning' | 'agent_reasoning'
    toolKind?: CodexSessionToolKind
    toolName?: string
    callId?: string
    status?: string
}

export interface CodexSessionToolUsageItem {
    id: string
    turnId: string
    timestamp: string
    kind: CodexSessionToolKind
    name: string
    callId?: string
    status?: string
    input?: string
    output?: string
    summary?: string
}

export interface CodexSessionToolSummaryItem {
    kind: CodexSessionToolKind
    name: string
    count: number
    turns: string[]
}

export interface CodexSessionThoughtItem {
    id: string
    turnId: string
    timestamp: string
    source: 'reasoning' | 'agent_reasoning'
    content: string
}

export interface CodexSessionWorkflowNode {
    id: string
    turnId: string
    timestamp: string
    kind: CodexSessionWorkflowNodeKind
    title: string
    content?: string
    callId?: string
    toolName?: string
    status?: string
}

export interface CodexSessionWorkflowEdge {
    source: string
    target: string
    relation: CodexSessionWorkflowEdgeRelation
}

export interface CodexSessionWorkflowGraph {
    nodes: CodexSessionWorkflowNode[]
    edges: CodexSessionWorkflowEdge[]
}

export interface CodexSessionSkillItem {
    name: string
    source: 'assistant_message' | 'user_message'
}

export interface CodexSessionTurnDetail {
    turnId: string
    status: CodexSessionTurnStatus
    startedAt: string
    completedAt?: string
    quester: string
    answer: string
    chat: CodexSessionChatItem[]
    tools: CodexSessionToolUsageItem[]
    thoughts: CodexSessionThoughtItem[]
    workflow: CodexSessionWorkflowGraph
}

export interface CodexSessionTokenUsage {
    inputTokens: number
    cachedInputTokens: number
    outputTokens: number
    reasoningOutputTokens: number
    totalTokens: number
}

export interface CodexSessionModelInfo {
    model: string
    effort?: string
}

export interface CodexSessionToolBrief {
    name: string
    kind: CodexSessionToolKind
    count: number
}

// --- Thought step kinds ---

export interface CodexThoughtReasoning {
    kind: 'reasoning'
    content: string
    payload: unknown
}

export interface CodexThoughtCommentary {
    kind: 'commentary'
    content: string
    payload: unknown
}

export interface CodexThoughtTool {
    kind: 'tool'
    toolKind: CodexSessionToolKind
    toolName: string
    callId: string
    input: string
    output: string
    status?: string
    callPayload: unknown
    resultPayload?: unknown
}

export interface CodexThoughtTokenUsage {
    kind: 'token_usage'
    tokenUsage: CodexSessionTokenUsage
    payload: unknown
}

export interface CodexThoughtUserMessage {
    kind: 'user_message'
    content: string
    payload: unknown
}

export interface CodexThoughtError {
    kind: 'error'
    message: string
    payload: unknown
}

export type CodexSessionThoughtStep
    = | CodexThoughtReasoning
        | CodexThoughtCommentary
        | CodexThoughtTool
        | CodexThoughtTokenUsage
        | CodexThoughtUserMessage
        | CodexThoughtError

export interface CodexSessionChatTurn {
    id: string
    startedAt: number
    completedAt?: number
    durationMs?: number
    status: CodexSessionTurnStatus

    models: CodexSessionModelInfo[]

    userMessage: string

    thoughts: CodexSessionThoughtStep[]
    finalAnswer: string
    finalAnswerTokenUsage: CodexSessionTokenUsage

    totalTokenUsage: CodexSessionTokenUsage

    tools: CodexSessionToolBrief[]
}

export interface CodexSessionDetail {
    turns: CodexSessionChatTurn[]
}
