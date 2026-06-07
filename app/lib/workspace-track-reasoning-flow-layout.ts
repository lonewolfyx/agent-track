export interface ReasoningFlowLayoutCardShape {
    subtitle?: string
    badges: unknown[]
    content?: string
}

export interface ReasoningFlowLayoutNodeShape {
    cards: ReasoningFlowLayoutCardShape[]
    metrics: string[]
}

export const REASONING_FLOW_CANVAS_PADDING = 24
export const REASONING_FLOW_COLUMN_GAP = 40
export const REASONING_FLOW_ROW_GAP = 40
export const REASONING_FLOW_MIN_CANVAS_HEIGHT = 220
export const REASONING_FLOW_MIN_NODE_WIDTH = 260
export const REASONING_FLOW_TARGET_NODE_WIDTH = 360
export const REASONING_FLOW_MAX_COLUMNS = 4
export const REASONING_FLOW_DEFAULT_CONTENT_WIDTH = 1688

export function estimateReasoningStepHeight(node: ReasoningFlowLayoutNodeShape) {
    let height = 52

    for (const card of node.cards) {
        height += 42

        if (card.subtitle) {
            height += 18
        }

        if (card.badges.length > 0) {
            height += 24
        }

        if (card.content) {
            const lines = Math.min(4, Math.ceil(card.content.length / 42))
            height += (lines * 18) + 12
        }

        height += 16
    }

    if (node.metrics.length > 0) {
        height += 30
    }

    return Math.max(148, height)
}

export function getReasoningFlowColumnCount(containerWidth: number, nodeCount: number) {
    if (nodeCount <= 1) {
        return nodeCount
    }

    const safeWidth = Math.max(
        containerWidth,
        (REASONING_FLOW_MIN_NODE_WIDTH * 2) + REASONING_FLOW_COLUMN_GAP + (REASONING_FLOW_CANVAS_PADDING * 2),
    )
    const availableWidth = Math.max(0, safeWidth - (REASONING_FLOW_CANVAS_PADDING * 2))
    const estimatedColumns = Math.floor(
        (availableWidth + REASONING_FLOW_COLUMN_GAP)
        / (REASONING_FLOW_TARGET_NODE_WIDTH + REASONING_FLOW_COLUMN_GAP),
    )

    return Math.max(1, Math.min(nodeCount, REASONING_FLOW_MAX_COLUMNS, estimatedColumns || 1))
}

export function getReasoningFlowNodeWidth(containerWidth: number, columnCount: number) {
    const safeColumns = Math.max(1, columnCount)
    const safeWidth = Math.max(containerWidth, REASONING_FLOW_MIN_NODE_WIDTH + (REASONING_FLOW_CANVAS_PADDING * 2))
    const availableWidth = Math.max(0, safeWidth - (REASONING_FLOW_CANVAS_PADDING * 2))

    return Math.max(
        REASONING_FLOW_MIN_NODE_WIDTH,
        Math.floor((availableWidth - ((safeColumns - 1) * REASONING_FLOW_COLUMN_GAP)) / safeColumns),
    )
}

export function buildReasoningFlowGrid<NodeShape extends ReasoningFlowLayoutNodeShape>(
    nodes: NodeShape[],
    containerWidth: number,
) {
    const columnCount = getReasoningFlowColumnCount(containerWidth, nodes.length)
    const nodeWidth = getReasoningFlowNodeWidth(containerWidth, columnCount || 1)
    const rows: NodeShape[][] = []

    for (let index = 0; index < nodes.length; index += Math.max(1, columnCount)) {
        rows.push(nodes.slice(index, index + Math.max(1, columnCount)))
    }

    const rowHeights = rows.map(row => Math.max(...row.map(estimateReasoningStepHeight)))
    const canvasHeight = Math.max(
        REASONING_FLOW_MIN_CANVAS_HEIGHT,
        (REASONING_FLOW_CANVAS_PADDING * 2)
        + rowHeights.reduce((sum, height) => sum + height, 0)
        + (Math.max(0, rows.length - 1) * REASONING_FLOW_ROW_GAP),
    )

    return {
        columnCount,
        nodeWidth,
        rows,
        rowHeights,
        canvasHeight,
    }
}
