<template>
    <div
        ref="frame"
        class="nodrag nopan rounded-[22px] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(248,250,252,0.98)_0%,rgba(241,245,249,0.94)_100%)] p-4"
    >
        <VueFlow
            :id="reasoningFlowId"
            :nodes="flowNodes"
            :edges="flowEdges"
            :node-types="nodeTypes"
            no-drag-class-name="reasoning-flow-nodrag"
            no-pan-class-name="reasoning-flow-nopan"
            :nodes-draggable="true"
            :nodes-connectable="false"
            :elements-selectable="true"
            :pan-on-drag="true"
            :zoom-on-scroll="true"
            :fit-view-on-init="false"
            :default-viewport="defaultViewport"
            :min-zoom="0.4"
            :max-zoom="1.25"
            class="w-full rounded-[18px] bg-transparent [&_.vue-flow__pane]:cursor-grab [&_.vue-flow__pane.dragging]:cursor-grabbing"
            :style="{ height: `${layout.canvasHeight}px` }"
        >
            <Background :gap="20" :size="1.2" variant="dots" />
        </VueFlow>
    </div>
</template>

<script setup lang="ts">
import type { Edge, Node } from '@vue-flow/core'
import type { WorkspaceTrackReasoningFlowStepEdge, WorkspaceTrackReasoningFlowStepNode } from '@/lib/workspace-track'
import { Background } from '@vue-flow/background'
import { MarkerType, VueFlow } from '@vue-flow/core'
import { markRaw } from 'vue'
import {
    buildReasoningFlowGrid,
    REASONING_FLOW_CANVAS_PADDING,
    REASONING_FLOW_COLUMN_GAP,
    REASONING_FLOW_DEFAULT_CONTENT_WIDTH,
    REASONING_FLOW_ROW_GAP,
} from '@/lib/workspace-track-reasoning-flow-layout'
import WorkspaceTrackReasoningStepNode from './WorkspaceTrackReasoningStepNode.vue'

const props = defineProps<{
    nodes: WorkspaceTrackReasoningFlowStepNode[]
    edges: WorkspaceTrackReasoningFlowStepEdge[]
    canvasHeight: number
}>()

const reasoningFlowId = computed(() => `reasoning-flow:${props.nodes[0]?.id ?? 'empty'}`)

const nodeTypes = {
    'reasoning-step': markRaw(WorkspaceTrackReasoningStepNode),
}

const frameRef = useTemplateRef<HTMLDivElement>('frame')
const { width: frameWidth } = useElementSize(frameRef)
const defaultViewport = {
    x: 0,
    y: 0,
    zoom: 1,
}

function getTopologicalOrder(
    nodes: WorkspaceTrackReasoningFlowStepNode[],
    edges: WorkspaceTrackReasoningFlowStepEdge[],
) {
    const originalIndex = new Map(nodes.map((node, index) => [node.id, index] as const))
    const incoming = new Map(nodes.map(node => [node.id, 0]))
    const outgoing = new Map(nodes.map(node => [node.id, [] as string[]]))

    for (const edge of edges) {
        if (!incoming.has(edge.target) || !outgoing.has(edge.source)) {
            continue
        }

        incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1)
        outgoing.get(edge.source)!.push(edge.target)
    }

    const queue = nodes
        .filter(node => (incoming.get(node.id) ?? 0) === 0)
        .sort((left, right) => (originalIndex.get(left.id) ?? 0) - (originalIndex.get(right.id) ?? 0))

    const ordered: WorkspaceTrackReasoningFlowStepNode[] = []
    const visited = new Set<string>()

    while (queue.length > 0) {
        const current = queue.shift()!
        if (visited.has(current.id)) {
            continue
        }

        visited.add(current.id)
        ordered.push(current)

        const nextIds = outgoing.get(current.id) ?? []
        for (const nextId of nextIds) {
            incoming.set(nextId, (incoming.get(nextId) ?? 1) - 1)
            if ((incoming.get(nextId) ?? 0) === 0) {
                const nextNode = nodes.find(node => node.id === nextId)
                if (nextNode) {
                    queue.push(nextNode)
                    queue.sort((left, right) => (originalIndex.get(left.id) ?? 0) - (originalIndex.get(right.id) ?? 0))
                }
            }
        }
    }

    for (const node of nodes) {
        if (!visited.has(node.id)) {
            ordered.push(node)
        }
    }

    return ordered
}

const layout = computed(() => {
    const orderedNodes = getTopologicalOrder(props.nodes, props.edges)
    const containerWidth = frameWidth.value > 0 ? frameWidth.value : REASONING_FLOW_DEFAULT_CONTENT_WIDTH
    const grid = buildReasoningFlowGrid(orderedNodes, containerWidth)
    const positions = new Map<string, { x: number, y: number }>()

    let currentY = REASONING_FLOW_CANVAS_PADDING

    grid.rows.forEach((row, rowIndex) => {
        row.forEach((node, columnIndex) => {
            positions.set(node.id, {
                x: REASONING_FLOW_CANVAS_PADDING + (columnIndex * (grid.nodeWidth + REASONING_FLOW_COLUMN_GAP)),
                y: currentY,
            })
        })

        currentY += grid.rowHeights[rowIndex]! + REASONING_FLOW_ROW_GAP
    })

    return {
        orderedNodes,
        positions,
        canvasHeight: grid.canvasHeight,
        nodeWidth: grid.nodeWidth,
    }
})

const flowNodes = computed<Node[]>(() =>
    layout.value.orderedNodes.map(node => ({
        id: node.id,
        type: 'reasoning-step',
        position: layout.value.positions.get(node.id) ?? { x: REASONING_FLOW_CANVAS_PADDING, y: REASONING_FLOW_CANVAS_PADDING },
        draggable: true,
        selectable: true,
        style: {
            width: `${layout.value.nodeWidth}px`,
        },
        data: node,
    })),
)

const flowEdges = computed<Edge[]>(() =>
    props.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'default',
        selectable: false,
        updatable: false,
        animated: false,
        markerEnd: MarkerType.ArrowClosed,
        style: {
            stroke: '#475569',
            strokeWidth: 2.4,
        },
        pathOptions: {
            curvature: 0.26,
        },
    })),
)
</script>
