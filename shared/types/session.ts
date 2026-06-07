import type { CodexSessionMetaPayload } from '#shared/types/session.meta'

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

export type CodexSessionTurnStatus = 'completed' | 'aborted' | 'running' | 'unknown'

export type CodexSessionWorkflowNodeKind
    = 'session'
        | 'context'
        | 'message'
        | 'reasoning'
        | 'tool_call'
        | 'tool_result'
        | 'metric'
        | 'status'
        | 'error'
        | 'other'

export type CodexSessionWorkflowNodeLane
    = 'meta'
        | 'message'
        | 'reasoning'
        | 'tool_call'
        | 'tool_result'
        | 'metric'
        | 'status'
        | 'error'
        | 'other'

export type CodexSessionWorkflowEdgeRelation = 'next' | 'result'

export interface CodexSessionWorkflowNodeStat {
    label: string
    value: string
}

export interface CodexSessionWorkflowNode {
    id: string
    turnId?: string
    timestamp: string
    sequence: number
    kind: CodexSessionWorkflowNodeKind
    lane: CodexSessionWorkflowNodeLane
    lineType: string
    payloadType?: string
    title: string
    subtitle?: string
    content?: string
    contentFull?: string
    callId?: string
    toolName?: string
    status?: string
    stats?: CodexSessionWorkflowNodeStat[]
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

export interface CodexSessionWorkflowTurn {
    turnId: string
    status: CodexSessionTurnStatus
    startedAt: string
    completedAt?: string
    nodeIds: string[]
    previousTurnId?: string
    turnIndex: number
}

export interface CodexSessionTurnChain {
    from: string
    to: string
}

export interface CodexSessionDetail {
    id: string
    path: string
    sessionMeta: CodexSessionMetaPayload | null
    turns: CodexSessionWorkflowTurn[]
    turnChain: CodexSessionTurnChain[]
    workflow: CodexSessionWorkflowGraph
}
