export interface CodexSessionListItem {
    id: string
    title: string
    model: {
        model: string
        effort: number
    }[]
    cwd: string
    filename: string
    prompt: number
    call: number
    createTime: string
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

export interface CodexSessionDetail {
    chat: CodexSessionChatItem[][]
    // turnCount: number
    // summary: {
    //     chatCount: number
    //     toolCount: number
    //     thoughtCount: number
    // }
    // tools: CodexSessionToolSummaryItem[]
    // skills: CodexSessionSkillItem[]
    // availableSkills: string[]
    // thoughts: CodexSessionThoughtItem[]
    // turns: CodexSessionTurnDetail[]
    // workflow: CodexSessionWorkflowGraph
}
