import type { Edge, Node } from '@vue-flow/core'
import type {
    CodexSessionDetail,
    CodexSessionWorkflowEdgeRelation,
    CodexSessionWorkflowNode,
    CodexSessionWorkflowNodeKind,
} from '#shared/types/session'
import { Position } from '@vue-flow/core'
import { buildReasoningFlowGrid, REASONING_FLOW_DEFAULT_CONTENT_WIDTH } from '@/lib/workspace-track-reasoning-flow-layout'

export interface WorkspaceTrackBadge {
    label: string
    tone: 'slate' | 'sky' | 'emerald' | 'amber' | 'rose'
}

export interface WorkspaceTrackSection {
    title?: string
    lines: string[]
}

export interface WorkspaceTrackCommandRow {
    from: string
    to: string
    label?: string
}

export interface WorkspaceTrackEmbeddedCard {
    id: string
    kind: 'reasoning' | 'commentary' | 'message' | 'call' | 'result' | 'metric' | 'other'
    title: string
    subtitle?: string
    content?: string
    contentFull?: string
    badges: WorkspaceTrackBadge[]
}

export interface WorkspaceTrackEmbeddedRow {
    id: string
    cards: WorkspaceTrackEmbeddedCard[]
    metrics: string[]
}

export interface WorkspaceTrackReasoningFlowStepNode {
    id: string
    kind: WorkspaceTrackEmbeddedCard['kind']
    sequence: number
    cards: WorkspaceTrackEmbeddedCard[]
    metrics: string[]
}

export interface WorkspaceTrackReasoningFlowStepEdge {
    id: string
    source: string
    target: string
}

export type WorkspaceTrackStepGroupKind
    = 'reasoning'
        | 'tools'
        | 'search'
        | 'commentary'
        | 'metrics'
        | 'messages'
        | 'other'

export interface WorkspaceTrackStepGroupNode {
    id: string
    kind: WorkspaceTrackStepGroupKind
    label: string
    shortLabel: string
    count: number
    duration?: string
    preview: string[]
    steps: WorkspaceTrackEmbeddedRow[]
}

export interface WorkspaceTrackStepGroupEdge {
    id: string
    source: string
    target: string
    label?: string
}

export interface WorkspaceTrackQuickSummaryItem {
    id: string
    kind: WorkspaceTrackStepGroupKind
    label: string
    shortLabel: string
    count: number
}

export interface WorkspaceTrackSessionMeta {
    model?: string
    cwd?: string
    branch?: string
}

export interface WorkspaceTrackNodeData {
    kind: CodexSessionWorkflowNodeKind
    title: string
    subtitle?: string
    content?: string
    contentFull?: string
    timestamp: string
    turnId?: string
    turnIndex?: number
    lineType: string
    payloadType?: string
    badges: WorkspaceTrackBadge[]
    stats: Array<{ label: string, value: string }>
    sections: WorkspaceTrackSection[]
    commandRows: WorkspaceTrackCommandRow[]
    embeddedRows: WorkspaceTrackEmbeddedRow[]
    reasoningFlowNodes: WorkspaceTrackReasoningFlowStepNode[]
    reasoningFlowEdges: WorkspaceTrackReasoningFlowStepEdge[]
    reasoningCanvasHeight: number
    reasoningGroups: WorkspaceTrackStepGroupNode[]
    reasoningEdges: WorkspaceTrackStepGroupEdge[]
    reasoningQuickSummary: WorkspaceTrackQuickSummaryItem[]
    cornerBadge?: string
    sessionMeta?: WorkspaceTrackSessionMeta
}

export type WorkspaceTrackNode = Node<WorkspaceTrackNodeData, any, 'workspace-track'>
export type WorkspaceTrackEdge = Edge<{ relation: CodexSessionWorkflowEdgeRelation }>

const START_X = 32
const COLUMN_GAP = 32
const TURN_TOP = 164
const TURN_GAP = 144

const NODE_WIDTH = {
    answer: 340,
    meta: 260,
    reasoning: 1760,
    setup: 300,
    user: 320,
}

function getCompactContent(node: CodexSessionWorkflowNode, limit = 180): string {
    const content = (node.contentFull ?? node.content ?? '').trim()

    if (!content) {
        return ''
    }

    return content.length <= limit ? content : `${content.slice(0, limit)}...`
}

function dedupeLines(lines: string[]): string[] {
    const seen = new Set<string>()
    const deduped: string[] = []

    for (const line of lines) {
        const normalized = line.trim()
        if (!normalized || seen.has(normalized)) {
            continue
        }

        seen.add(normalized)
        deduped.push(normalized)
    }

    return deduped
}

function isUserResponseMessage(node: CodexSessionWorkflowNode) {
    return node.payloadType === 'message' && (node.subtitle ?? '').startsWith('user')
}

function isDeveloperResponseMessage(node: CodexSessionWorkflowNode) {
    return node.payloadType === 'message' && (node.subtitle ?? '').startsWith('developer')
}

function isCommentaryNode(node: CodexSessionWorkflowNode) {
    return (node.payloadType === 'agent_message' && node.subtitle === 'commentary')
        || (node.payloadType === 'message' && (node.subtitle ?? '').includes('commentary'))
}

function isFinalAnswerEvent(node: CodexSessionWorkflowNode) {
    return node.payloadType === 'agent_message' && node.subtitle === 'final_answer'
}

function isFinalAnswerMessage(node: CodexSessionWorkflowNode) {
    return node.payloadType === 'message' && (node.subtitle ?? '').includes('final_answer')
}

function isCallNode(node: CodexSessionWorkflowNode) {
    return ['function_call', 'custom_tool_call', 'tool_search_call', 'web_search_call'].includes(node.payloadType ?? '')
}

function isResultNode(node: CodexSessionWorkflowNode) {
    return ['function_call_output', 'custom_tool_call_output', 'tool_search_output', 'web_search_end'].includes(node.payloadType ?? '')
}

function estimateNodeHeight(data: WorkspaceTrackNodeData): number {
    if (data.payloadType === 'reasoning_bundle') {
        return 154 + data.reasoningCanvasHeight
    }

    let height = 136

    if (data.badges.length > 0) {
        height += 42
    }

    if (data.stats.length > 0) {
        height += (Math.ceil(data.stats.length / 2) * 72) + 16
    }

    if (data.commandRows.length > 0) {
        height += 54 + (data.commandRows.length * 50)
    }

    if (data.embeddedRows.length > 0) {
        height += 24
        for (const row of data.embeddedRows) {
            const maxContentLength = row.cards.reduce((maxLength, card) => Math.max(maxLength, (card.content?.length ?? 0)), 0)
            const rowHeight = 88 + (Math.ceil(maxContentLength / 110) * 18) + (row.metrics.length > 0 ? 34 : 0)
            height += rowHeight
        }
    }

    for (const section of data.sections) {
        height += 30
        height += Math.max(1, section.lines.length) * 24
    }

    if (data.content) {
        height += 54
    }

    if (data.contentFull && data.contentFull !== data.content) {
        height += 44
    }

    return height
}

export function buildWorkspaceTrackGraph(detail: CodexSessionDetail | null): {
    nodes: WorkspaceTrackNode[]
    edges: WorkspaceTrackEdge[]
} {
    if (!detail) {
        return {
            nodes: [],
            edges: [],
        }
    }

    const rawNodes = detail.workflow.nodes.slice().sort((left, right) => left.sequence - right.sequence)
    const sessionMetaNode = rawNodes.find(node => node.kind === 'session')
    const turnNodesMap = new Map<string, CodexSessionWorkflowNode[]>()
    const sessionContext: WorkspaceTrackSessionMeta | undefined = sessionMetaNode
        ? {
                model: sessionMetaNode.stats?.find(stat => stat.label === 'Provider')?.value,
                cwd: sessionMetaNode.contentFull ?? sessionMetaNode.content,
                branch: sessionMetaNode.stats?.find(stat => stat.label === 'Branch')?.value,
            }
        : undefined

    for (const turn of detail.turns) {
        turnNodesMap.set(
            turn.turnId,
            rawNodes.filter(node => node.turnId === turn.turnId),
        )
    }

    const displayNodes: WorkspaceTrackNode[] = []
    const displayEdges: WorkspaceTrackEdge[] = []

    let currentTurnY = TURN_TOP

    for (const turn of detail.turns) {
        const turnNodes = turnNodesMap.get(turn.turnId) ?? []
        if (turnNodes.length === 0) {
            continue
        }

        const firstReasoningIndex = turnNodes.findIndex(node => node.payloadType === 'reasoning')
        const finalAnswerEventIndex = turnNodes.findIndex(node => isFinalAnswerEvent(node))
        const finalAnswerMessage = turnNodes.find(node => isFinalAnswerMessage(node)) ?? turnNodes.find(node => isFinalAnswerEvent(node))
        const preReasoningNodes = firstReasoningIndex >= 0 ? turnNodes.slice(0, firstReasoningIndex) : turnNodes
        const reasoningNodes = firstReasoningIndex >= 0
            ? turnNodes.slice(firstReasoningIndex, finalAnswerEventIndex >= 0 ? finalAnswerEventIndex : turnNodes.length)
            : []

        const setupNode = buildSetupNode(preReasoningNodes, turn.turnId, turn.turnIndex, sessionContext)
        const mergedUserNode = buildMergedUserNode(preReasoningNodes, turn.turnId, turn.turnIndex, sessionContext)
        const reasoningNode = buildReasoningBundleNode(reasoningNodes, turn.turnId, turn.turnIndex, sessionContext)
        const answerNode = finalAnswerMessage
            ? buildFinalAnswerNode(finalAnswerMessage, turn.turnIndex, sessionContext)
            : null

        const turnDisplayNodes: WorkspaceTrackNode[] = []

        if (sessionMetaNode && turn.turnIndex === 0) {
            turnDisplayNodes.push(
                createDisplayNode('session-meta', currentTurnY, {
                    kind: 'session',
                    title: 'Session Meta',
                    subtitle: sessionMetaNode.subtitle,
                    content: getCompactContent(sessionMetaNode, 220),
                    contentFull: sessionMetaNode.contentFull ?? sessionMetaNode.content,
                    timestamp: sessionMetaNode.timestamp,
                    turnId: undefined,
                    lineType: 'display',
                    payloadType: 'session_meta',
                    badges: [
                        { label: 'session_meta', tone: 'slate' },
                    ],
                    stats: sessionMetaNode.stats ?? [],
                    sections: [],
                    commandRows: [],
                    embeddedRows: [],
                    reasoningFlowNodes: [],
                    reasoningFlowEdges: [],
                    reasoningCanvasHeight: 0,
                    reasoningGroups: [],
                    reasoningEdges: [],
                    reasoningQuickSummary: [],
                    sessionMeta: sessionContext,
                }),
            )
        }

        if (setupNode) {
            turnDisplayNodes.push(createDisplayNode('setup', currentTurnY, setupNode))
        }

        if (mergedUserNode) {
            turnDisplayNodes.push(createDisplayNode('user-input', currentTurnY, mergedUserNode))
        }

        if (answerNode) {
            turnDisplayNodes.push(createDisplayNode('final-answer', currentTurnY, answerNode))
        }

        if (reasoningNode) {
            const topRowHeight = turnDisplayNodes.reduce((height, node) => {
                if (!node.data) {
                    return height
                }

                return Math.max(height, estimateNodeHeight(node.data))
            }, 220)

            turnDisplayNodes.push(
                createDisplayNode(
                    'reasoning-bundle',
                    currentTurnY + topRowHeight + 40,
                    reasoningNode,
                ),
            )
        }

        displayNodes.push(...turnDisplayNodes)
        displayEdges.push(...buildTurnEdges(turnDisplayNodes))

        const maxHeight = turnDisplayNodes.reduce((height, node) => {
            if (!node.data) {
                return height
            }

            return Math.max(height, estimateNodeHeight(node.data))
        }, 280)
        currentTurnY += maxHeight + TURN_GAP
    }

    const turnConnectionEdges: WorkspaceTrackEdge[] = []

    for (const chain of detail.turnChain) {
        const previousTurnLastNode = displayNodes
            .filter(node => node.data?.turnId === chain.from)
            .at(-1)

        const currentTurnFirstNode = displayNodes.find(node =>
            node.data?.turnId === chain.to
            && node.id !== 'display:session-meta:session',
        )

        if (!previousTurnLastNode || !currentTurnFirstNode) {
            continue
        }

        turnConnectionEdges.push({
            id: `turn-chain:${chain.from}:${chain.to}`,
            source: previousTurnLastNode.id,
            target: currentTurnFirstNode.id,
            type: 'default',
            animated: true,
            updatable: false,
            selectable: false,
            data: {
                relation: 'next',
            },
            style: {
                stroke: '#94a3b8',
                strokeWidth: 2,
                strokeDasharray: '8 4',
                opacity: 0.7,
            },
            pathOptions: {
                curvature: 0.15,
            },
        })
    }

    return {
        nodes: displayNodes,
        edges: [...displayEdges, ...turnConnectionEdges],
    }
}

function createDisplayNode(
    slot: 'session-meta' | 'setup' | 'user-input' | 'reasoning-bundle' | 'final-answer',
    y: number,
    data: WorkspaceTrackNodeData,
): WorkspaceTrackNode {
    const widthMap = {
        'final-answer': NODE_WIDTH.answer,
        'reasoning-bundle': NODE_WIDTH.reasoning,
        'session-meta': NODE_WIDTH.meta,
        'setup': NODE_WIDTH.setup,
        'user-input': NODE_WIDTH.user,
    } as const

    const xMap = {
        'session-meta': START_X,
        'setup': START_X + NODE_WIDTH.meta + COLUMN_GAP,
        'user-input': START_X + NODE_WIDTH.meta + NODE_WIDTH.setup + (COLUMN_GAP * 2),
        'reasoning-bundle': START_X,
        'final-answer': START_X + NODE_WIDTH.meta + NODE_WIDTH.setup + NODE_WIDTH.user + (COLUMN_GAP * 3),
    } as const

    return {
        id: `display:${slot}:${data.turnId ?? 'session'}`,
        type: 'workspace-track',
        position: {
            x: xMap[slot],
            y,
        },
        width: widthMap[slot],
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        data,
    } satisfies WorkspaceTrackNode
}

function buildTurnEdges(nodes: WorkspaceTrackNode[]): WorkspaceTrackEdge[] {
    const sessionNode = nodes.find(node => node.id.includes('session-meta'))
    const setupNode = nodes.find(node => node.id.includes('setup'))
    const userNode = nodes.find(node => node.id.includes('user-input'))
    const reasoningNode = nodes.find(node => node.id.includes('reasoning-bundle'))
    const answerNode = nodes.find(node => node.id.includes('final-answer'))

    const edgePairs = [
        [sessionNode?.id, setupNode?.id],
        [setupNode?.id, userNode?.id],
        [userNode?.id, reasoningNode?.id],
        [reasoningNode?.id, answerNode?.id],
    ]

    return edgePairs
        .filter((pair): pair is [string, string] => Boolean(pair[0] && pair[1]))
        .map(([source, target]) => ({
            id: `display-edge:${source}:${target}`,
            source,
            target,
            type: 'default',
            animated: false,
            updatable: false,
            selectable: false,
            data: {
                relation: 'next',
            },
            style: {
                stroke: '#334155',
                strokeWidth: 2.8,
                opacity: 1,
            },
            pathOptions: {
                curvature: source.includes('reasoning-bundle') || target.includes('reasoning-bundle') ? 0.24 : 0.08,
            },
        }))
}

function buildSetupNode(
    nodes: CodexSessionWorkflowNode[],
    turnId: string,
    turnIndex: number,
    sessionMeta: WorkspaceTrackSessionMeta | undefined,
): WorkspaceTrackNodeData | null {
    const taskStartedNode = nodes.find(node => node.payloadType === 'task_started')
    const turnContextNode = nodes.find(node => node.kind === 'context')
    const developerNode = nodes.find(node => isDeveloperResponseMessage(node))
    const setupSections: WorkspaceTrackSection[] = []

    if (taskStartedNode) {
        setupSections.push({
            title: 'Task Started',
            lines: [getCompactContent(taskStartedNode, 180) || taskStartedNode.payloadType || 'task started'],
        })
    }

    if (turnContextNode) {
        setupSections.push({
            title: 'Turn Context',
            lines: [getCompactContent(turnContextNode, 180) || turnContextNode.payloadType || 'turn context'],
        })
    }

    if (developerNode) {
        setupSections.push({
            title: 'Give Agent',
            lines: [getCompactContent(developerNode, 180) || developerNode.payloadType || 'developer message'],
        })
    }

    if (setupSections.length === 0) {
        return null
    }

    const timestamps = nodes.map(node => node.timestamp).filter(Boolean)

    return {
        kind: 'context',
        title: 'Session Setup',
        subtitle: 'task + context + give agent',
        content: undefined,
        contentFull: undefined,
        timestamp: timestamps[0] ?? '',
        turnId,
        turnIndex,
        lineType: 'display',
        payloadType: 'setup_bundle',
        badges: [
            { label: 'prelude', tone: 'amber' },
            { label: `events ${nodes.length}`, tone: 'slate' },
        ],
        stats: [
            { label: 'Blocks', value: String(setupSections.length) },
            { label: 'Turn', value: String(turnIndex + 1) },
        ],
        sections: setupSections,
        commandRows: [],
        embeddedRows: [],
        reasoningFlowNodes: [],
        reasoningFlowEdges: [],
        reasoningCanvasHeight: 0,
        reasoningGroups: [],
        reasoningEdges: [],
        reasoningQuickSummary: [],
        sessionMeta,
    }
}

function buildMergedUserNode(
    nodes: CodexSessionWorkflowNode[],
    turnId: string,
    turnIndex: number,
    sessionMeta: WorkspaceTrackSessionMeta | undefined,
): WorkspaceTrackNodeData | null {
    const responseUserNodes = nodes.filter(node => isUserResponseMessage(node))
    const eventUserNodes = nodes.filter(node => node.payloadType === 'user_message')
    const allUserNodes = [...responseUserNodes, ...eventUserNodes]

    if (allUserNodes.length === 0) {
        return null
    }

    const mergedLines = dedupeLines(allUserNodes.map(node => getCompactContent(node, 200)).filter(Boolean))
    const mainContent = eventUserNodes.at(-1)?.contentFull
        || eventUserNodes.at(-1)?.content
        || responseUserNodes.at(-1)?.contentFull
        || responseUserNodes.at(-1)?.content
        || mergedLines[0]
        || ''

    return {
        kind: 'message',
        title: 'User Input',
        subtitle: 'merged user module',
        content: mergedLines.length > 1 ? undefined : mainContent,
        contentFull: mergedLines.length > 1 ? mergedLines.join('\n\n') : mainContent,
        timestamp: allUserNodes[0]!.timestamp,
        turnId,
        turnIndex,
        lineType: 'display',
        payloadType: 'merged_user_message',
        badges: [
            { label: 'user module', tone: 'sky' },
            { label: `events ${allUserNodes.length}`, tone: 'slate' },
        ],
        stats: [],
        sections: mergedLines.length > 1
            ? [
                    {
                        title: 'Merged Content',
                        lines: mergedLines,
                    },
                ]
            : [],
        commandRows: [],
        embeddedRows: [],
        reasoningFlowNodes: [],
        reasoningFlowEdges: [],
        reasoningCanvasHeight: 0,
        reasoningGroups: [],
        reasoningEdges: [],
        reasoningQuickSummary: [],
        cornerBadge: responseUserNodes.length > 0 ? 'give agent' : undefined,
        sessionMeta,
    }
}

function buildReasoningBundleNode(
    nodes: CodexSessionWorkflowNode[],
    turnId: string,
    turnIndex: number,
    sessionMeta: WorkspaceTrackSessionMeta | undefined,
): WorkspaceTrackNodeData | null {
    if (nodes.length === 0) {
        return null
    }

    const reasoningTexts = nodes.filter(node => node.payloadType === 'reasoning')
    const reasoningStepFlow = buildReasoningInnerFlow(nodes)
    const fullReasoningContent = reasoningTexts
        .map(node => node.contentFull || node.content || '')
        .filter(Boolean)
        .join('\n\n---\n\n')

    return {
        kind: 'reasoning',
        title: 'Reasoning',
        subtitle: 'nested workflow',
        content: undefined,
        contentFull: fullReasoningContent || undefined,
        timestamp: nodes[0]!.timestamp,
        turnId,
        turnIndex,
        lineType: 'display',
        payloadType: 'reasoning_bundle',
        badges: [
            { label: 'reasoning bundle', tone: 'emerald' },
        ],
        stats: [],
        sections: [],
        commandRows: [],
        embeddedRows: buildReasoningEmbeddedRows(nodes),
        reasoningFlowNodes: reasoningStepFlow.nodes,
        reasoningFlowEdges: reasoningStepFlow.edges,
        reasoningCanvasHeight: reasoningStepFlow.canvasHeight,
        reasoningGroups: [],
        reasoningEdges: [],
        reasoningQuickSummary: [],
        sessionMeta,
    }
}

function buildFinalAnswerNode(
    node: CodexSessionWorkflowNode,
    turnIndex: number,
    sessionMeta: WorkspaceTrackSessionMeta | undefined,
): WorkspaceTrackNodeData {
    return {
        kind: 'message',
        title: 'Final Answer',
        subtitle: 'assistant • final_answer',
        content: node.content,
        contentFull: node.contentFull || node.content,
        timestamp: node.timestamp,
        turnId: node.turnId,
        turnIndex,
        lineType: 'display',
        payloadType: 'final_answer',
        badges: [
            { label: 'final_answer', tone: 'rose' },
        ],
        stats: [],
        sections: [],
        commandRows: [],
        embeddedRows: [],
        reasoningFlowNodes: [],
        reasoningFlowEdges: [],
        reasoningCanvasHeight: 0,
        reasoningGroups: [],
        reasoningEdges: [],
        reasoningQuickSummary: [],
        sessionMeta,
    }
}

function buildReasoningEmbeddedRows(nodes: CodexSessionWorkflowNode[]): WorkspaceTrackEmbeddedRow[] {
    return buildReasoningStepEntries(nodes).map(entry => entry.row)
}

interface ReasoningStepEntry {
    groupKind: WorkspaceTrackStepGroupKind
    row: WorkspaceTrackEmbeddedRow
    sequence: number
    timestamp: string
    completedAt: string
    preview: string
}

function buildReasoningStepEntries(nodes: CodexSessionWorkflowNode[]): ReasoningStepEntry[] {
    const entries: ReasoningStepEntry[] = []
    const consumedIndices = new Set<number>()

    for (const [index, node] of nodes.entries()) {
        if (consumedIndices.has(index)) {
            continue
        }

        if (node.payloadType === 'token_count') {
            const tokenMetric = formatCompactTokenMetric(node)
            const metricRow = {
                id: `reasoning-row:${node.sequence}`,
                cards: [
                    {
                        id: `metric:${node.sequence}`,
                        kind: 'metric',
                        title: 'Token Count',
                        subtitle: node.payloadType,
                        content: tokenMetric,
                        contentFull: tokenMetric,
                        badges: [
                            { label: 'token_count', tone: 'amber' },
                        ],
                    },
                ],
                metrics: [],
            } satisfies WorkspaceTrackEmbeddedRow
            entries.push(createReasoningStepEntry(node, metricRow))
            continue
        }

        if (isCallNode(node) && node.callId) {
            const resultIndex = nodes.findIndex((candidate, candidateIndex) =>
                candidateIndex > index
                && !consumedIndices.has(candidateIndex)
                && candidate.callId === node.callId
                && isResultNode(candidate),
            )

            if (resultIndex >= 0) {
                const resultNode = nodes[resultIndex]!
                consumedIndices.add(resultIndex)
                const pairedRow = {
                    id: `reasoning-row:${node.sequence}`,
                    cards: [
                        buildEmbeddedCard(node),
                        buildEmbeddedCard(resultNode),
                    ],
                    metrics: [],
                } satisfies WorkspaceTrackEmbeddedRow
                entries.push(createReasoningStepEntry(node, pairedRow, resultNode))
                continue
            }
        }

        if (isResultNode(node) && node.callId) {
            continue
        }

        const row = {
            id: `reasoning-row:${node.sequence}`,
            cards: [buildEmbeddedCard(node)],
            metrics: [],
        } satisfies WorkspaceTrackEmbeddedRow
        entries.push(createReasoningStepEntry(node, row))
    }

    return entries
}

function createReasoningStepEntry(
    node: CodexSessionWorkflowNode,
    row: WorkspaceTrackEmbeddedRow,
    resultNode?: CodexSessionWorkflowNode,
): ReasoningStepEntry {
    return {
        groupKind: getReasoningGroupKind(node),
        row,
        sequence: node.sequence,
        timestamp: node.timestamp,
        completedAt: resultNode?.timestamp ?? node.timestamp,
        preview: buildReasoningPreview(row),
    }
}

function buildReasoningInnerFlow(nodes: CodexSessionWorkflowNode[]): {
    nodes: WorkspaceTrackReasoningFlowStepNode[]
    edges: WorkspaceTrackReasoningFlowStepEdge[]
    canvasHeight: number
} {
    const entries = buildReasoningStepEntries(nodes)
    const flowNodes = entries.map(entry => ({
        id: entry.row.id,
        kind: entry.row.cards[0]?.kind ?? 'other',
        sequence: entry.sequence,
        cards: entry.row.cards,
        metrics: entry.row.metrics,
    }))
    const flowEdges = flowNodes.slice(0, -1).map((node, index) => ({
        id: `reasoning-flow-edge:${node.id}:${flowNodes[index + 1]!.id}`,
        source: node.id,
        target: flowNodes[index + 1]!.id,
    }))

    return {
        nodes: flowNodes,
        edges: flowEdges,
        canvasHeight: buildReasoningFlowGrid(flowNodes, REASONING_FLOW_DEFAULT_CONTENT_WIDTH).canvasHeight,
    }
}

export function buildReasoningStepFlow(nodes: CodexSessionWorkflowNode[]): {
    groups: WorkspaceTrackStepGroupNode[]
    edges: WorkspaceTrackStepGroupEdge[]
} {
    const entries = buildReasoningStepEntries(nodes)

    if (entries.length === 0) {
        return {
            groups: [],
            edges: [],
        }
    }

    const groupMap = new Map<WorkspaceTrackStepGroupKind, WorkspaceTrackStepGroupNode>()
    const groupOrder: WorkspaceTrackStepGroupKind[] = []

    for (const entry of entries) {
        if (!groupMap.has(entry.groupKind)) {
            const meta = getReasoningGroupMeta(entry.groupKind)
            groupMap.set(entry.groupKind, {
                id: `reasoning-group:${entry.groupKind}`,
                kind: entry.groupKind,
                label: meta.label,
                shortLabel: meta.shortLabel,
                count: 0,
                duration: undefined,
                preview: [],
                steps: [],
            })
            groupOrder.push(entry.groupKind)
        }

        const group = groupMap.get(entry.groupKind)!
        group.count += 1
        group.steps.push(entry.row)

        if (group.preview.length < 3 && entry.preview) {
            group.preview.push(entry.preview)
        }
    }

    const groups = groupOrder.map((kind) => {
        const group = groupMap.get(kind)!
        const firstStep = entries.find(entry => entry.groupKind === kind)
        const lastStep = entries.findLast(entry => entry.groupKind === kind)

        return {
            ...group,
            duration: firstStep && lastStep
                ? formatDurationLabel(firstStep.timestamp, lastStep.completedAt)
                : undefined,
        }
    })

    const edgeKeys = new Set<string>()
    const edges: WorkspaceTrackStepGroupEdge[] = []

    for (const [index, entry] of entries.entries()) {
        const nextEntry = entries[index + 1]
        if (!nextEntry || entry.groupKind === nextEntry.groupKind) {
            continue
        }

        const sourceId = `reasoning-group:${entry.groupKind}`
        const targetId = `reasoning-group:${nextEntry.groupKind}`
        const edgeKey = `${sourceId}:${targetId}`

        if (edgeKeys.has(edgeKey)) {
            continue
        }

        edgeKeys.add(edgeKey)
        edges.push({
            id: `reasoning-edge:${entry.groupKind}:${nextEntry.groupKind}`,
            source: sourceId,
            target: targetId,
        })
    }

    return {
        groups,
        edges,
    }
}

function buildReasoningPreview(row: WorkspaceTrackEmbeddedRow): string {
    const card = row.cards[0]
    if (!card) {
        return ''
    }

    const detail = [card.title, card.subtitle].filter(Boolean).join(' · ')
    const content = (card.contentFull ?? card.content ?? '').trim()

    if (!content) {
        return detail
    }

    return detail
        ? `${detail}: ${getCompactContent({ contentFull: content } as CodexSessionWorkflowNode, 72)}`
        : getCompactContent({ contentFull: content } as CodexSessionWorkflowNode, 72)
}

function getReasoningGroupKind(node: CodexSessionWorkflowNode): WorkspaceTrackStepGroupKind {
    if (node.payloadType === 'reasoning') {
        return 'reasoning'
    }

    if (node.payloadType === 'tool_search_call' || node.payloadType === 'tool_search_output' || node.payloadType === 'web_search_call' || node.payloadType === 'web_search_end') {
        return 'search'
    }

    if (isCommentaryNode(node) || node.payloadType === 'agent_message') {
        return 'commentary'
    }

    if (node.payloadType === 'token_count') {
        return 'metrics'
    }

    if (isCallNode(node) || isResultNode(node) || node.payloadType === 'patch_apply_end') {
        return 'tools'
    }

    if (node.payloadType === 'user_message' || isUserResponseMessage(node)) {
        return 'messages'
    }

    return 'other'
}

function getReasoningGroupMeta(kind: WorkspaceTrackStepGroupKind): {
    label: string
    shortLabel: string
} {
    switch (kind) {
        case 'reasoning':
            return { label: 'Reasoning', shortLabel: 'R' }
        case 'tools':
            return { label: 'Tools', shortLabel: 'T' }
        case 'search':
            return { label: 'Search', shortLabel: 'S' }
        case 'commentary':
            return { label: 'Commentary', shortLabel: 'C' }
        case 'metrics':
            return { label: 'Tokens', shortLabel: 'M' }
        case 'messages':
            return { label: 'Messages', shortLabel: 'U' }
        default:
            return { label: 'Events', shortLabel: 'E' }
    }
}

function buildEmbeddedCard(node: CodexSessionWorkflowNode): WorkspaceTrackEmbeddedCard {
    return {
        id: `embedded:${node.sequence}`,
        kind: getEmbeddedCardKind(node),
        title: getEmbeddedCardTitle(node),
        subtitle: getEmbeddedCardSubtitle(node),
        content: getCompactContent(node, node.payloadType?.includes('output') ? 180 : 220),
        contentFull: node.contentFull || node.content,
        badges: getEmbeddedCardBadges(node),
    }
}

function getEmbeddedCardKind(node: CodexSessionWorkflowNode): WorkspaceTrackEmbeddedCard['kind'] {
    if (node.payloadType === 'reasoning') {
        return 'reasoning'
    }

    if (isCommentaryNode(node)) {
        return 'commentary'
    }

    if (node.payloadType === 'user_message' || isUserResponseMessage(node)) {
        return 'message'
    }

    if (isCallNode(node)) {
        return 'call'
    }

    if (isResultNode(node) || node.payloadType === 'patch_apply_end') {
        return 'result'
    }

    if (node.payloadType === 'token_count') {
        return 'metric'
    }

    return 'other'
}

function getEmbeddedCardTitle(node: CodexSessionWorkflowNode): string {
    if (node.payloadType === 'reasoning') {
        return 'Reasoning'
    }

    if (isCommentaryNode(node)) {
        return 'Commentary'
    }

    if (node.payloadType === 'user_message' || isUserResponseMessage(node)) {
        return 'User Message'
    }

    if (node.payloadType === 'function_call') {
        return 'Function Call'
    }

    if (node.payloadType === 'function_call_output') {
        return 'Function Output'
    }

    if (node.payloadType === 'custom_tool_call') {
        return 'Custom Tool Call'
    }

    if (node.payloadType === 'custom_tool_call_output') {
        return 'Custom Tool Output'
    }

    if (node.payloadType === 'tool_search_call') {
        return 'Tool Search Call'
    }

    if (node.payloadType === 'tool_search_output') {
        return 'Tool Search Output'
    }

    if (node.payloadType === 'web_search_call') {
        return 'Web Search Call'
    }

    if (node.payloadType === 'web_search_end') {
        return 'Web Search Result'
    }

    if (node.payloadType === 'patch_apply_end') {
        return 'Patch Apply End'
    }

    if (node.payloadType === 'agent_message') {
        return 'Agent Message'
    }

    return node.payloadType ?? node.lineType
}

function getEmbeddedCardSubtitle(node: CodexSessionWorkflowNode): string | undefined {
    if (node.toolName) {
        return node.toolName
    }

    if (node.callId) {
        return `call ${node.callId.slice(0, 8)}`
    }

    return node.subtitle || node.payloadType || undefined
}

function getEmbeddedCardBadges(node: CodexSessionWorkflowNode): WorkspaceTrackBadge[] {
    const badges: WorkspaceTrackBadge[] = []

    if (node.payloadType) {
        badges.push({
            label: node.payloadType,
            tone: isCallNode(node)
                ? 'sky'
                : isResultNode(node)
                    ? 'emerald'
                    : node.payloadType === 'token_count'
                        ? 'amber'
                        : 'slate',
        })
    }

    if (node.callId) {
        badges.push({
            label: node.callId.slice(0, 6),
            tone: 'slate',
        })
    }

    return badges
}

function formatCompactTokenMetric(node: CodexSessionWorkflowNode): string {
    const total = node.stats?.find(stat => stat.label === 'Total')?.value ?? '-'
    const output = node.stats?.find(stat => stat.label === 'Output')?.value ?? '-'
    const reasoning = node.stats?.find(stat => stat.label === 'Reasoning')?.value ?? '-'

    return `total ${total} • output ${output} • reasoning ${reasoning}`
}

function formatCompactTokenTotal(node?: CodexSessionWorkflowNode): string {
    const total = node?.stats?.find(stat => stat.label === 'Total')?.value

    if (!total) {
        return '-'
    }

    const normalized = Number(total.replaceAll(',', ''))
    if (Number.isNaN(normalized)) {
        return total
    }

    return new Intl.NumberFormat('en', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(normalized)
}

function formatDurationLabel(start: string, end: string, fallback?: string): string | undefined {
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()

    if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
        return fallback
    }

    const durationMs = Math.max(0, endTime - startTime)

    if (durationMs < 1000) {
        return `${durationMs}ms`
    }

    if (durationMs < 60_000) {
        return `${(durationMs / 1000).toFixed(durationMs < 10_000 ? 1 : 0)}s`
    }

    const minutes = Math.floor(durationMs / 60_000)
    const seconds = Math.round((durationMs % 60_000) / 1000)
    return `${minutes}m ${seconds}s`
}

function buildCommandRows(nodes: CodexSessionWorkflowNode[]): WorkspaceTrackCommandRow[] {
    const calls = new Map<string, CodexSessionWorkflowNode>()
    const rows: WorkspaceTrackCommandRow[] = []
    let pairIndex = 0

    for (const node of nodes) {
        if (!node.callId) {
            continue
        }

        if (isCallNode(node)) {
            calls.set(node.callId, node)
            continue
        }

        if (!isResultNode(node)) {
            continue
        }

        const callNode = calls.get(node.callId)
        if (!callNode) {
            continue
        }

        rows.push({
            from: String((pairIndex * 2) + 1),
            to: String((pairIndex * 2) + 2),
            label: callNode.toolName || callNode.subtitle || 'call pair',
        })
        pairIndex += 1
    }

    return rows
}
