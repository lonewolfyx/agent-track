<template>
    <section
        :class="cn(
            'relative flex h-full min-h-0 w-full flex-1 overflow-hidden',
            '[&_.vue-flow__controls-button+_.vue-flow__controls-button]:border-t',
            '[&_.vue-flow__controls-button+_.vue-flow__controls-button]:border-slate-200/90',
            '[&_.vue-flow__controls-button]:h-[42px]',
            '[&_.vue-flow__controls-button]:w-[42px]',
            '[&_.vue-flow__controls-button]:border-0',
            '[&_.vue-flow__controls-button]:bg-transparent',
            '[&_.vue-flow__controls-button]:text-slate-600',
            '[&_.vue-flow__controls-button:hover]:bg-slate-50/95',
            '[&_.vue-flow__controls]:overflow-hidden',
            '[&_.vue-flow__controls]:rounded-[18px]',
            '[&_.vue-flow__controls]:border',
            '[&_.vue-flow__controls]:border-slate-200/90',
            '[&_.vue-flow__controls]:bg-white/94',
            '[&_.vue-flow__controls]:shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]',
            '[&_.vue-flow__controls]:backdrop-blur-[14px]',
            '[&_.vue-flow__edge-path]:stroke-linecap-round',
            '[&_.vue-flow__edge-path]:stroke-linejoin-round',
            '[&_.vue-flow__node.selected]:shadow-none',
            '[&_.vue-flow__node]:border-0',
            '[&_.vue-flow__node]:bg-transparent',
            '[&_.vue-flow__node]:p-0',
            '[&_.vue-flow__node]:shadow-none',
            '[&_.vue-flow__pane]:bg-transparent',
        )"
    >
        <div class="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-3 px-4 py-4 lg:flex-row lg:justify-between">
            <div class="pointer-events-auto max-w-[32rem] rounded-[22px] border border-slate-200/90 bg-white/94 px-4 py-3 shadow-[0_24px_50px_-34px_rgba(15,23,42,0.4)] backdrop-blur-[16px]">
                <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Session Workflow
                </p>
                <p class="mt-1 truncate text-[15px] font-semibold text-slate-700">
                    {{ sessionTitle }}
                </p>
                <p class="mt-1 truncate text-xs text-slate-500">
                    {{ sessionPath }}
                </p>
            </div>

            <div class="pointer-events-auto flex flex-wrap gap-2 lg:justify-end">
                <div
                    v-for="chip in summaryChips"
                    :key="chip.label"
                    class="rounded-[18px] border border-slate-200/90 bg-white/94 px-3 py-2 text-right shadow-[0_20px_45px_-34px_rgba(15,23,42,0.35)] backdrop-blur-[16px]"
                >
                    <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {{ chip.label }}
                    </p>
                    <p class="mt-1 text-sm font-semibold text-slate-700">
                        {{ chip.value }}
                    </p>
                </div>
            </div>
        </div>

        <div
            v-if="pending && !detail"
            class="flex flex-1 items-center justify-center"
        >
            <div class="max-w-md rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-center shadow-[0_26px_50px_-36px_rgba(15,23,42,0.35)]">
                <p class="text-sm font-semibold text-slate-700">
                    Loading workflow...
                </p>
                <p class="mt-2 text-sm text-slate-500">
                    Building a complete flow from the session event stream.
                </p>
            </div>
        </div>

        <div
            v-else-if="loadError"
            class="flex flex-1 items-center justify-center px-4"
        >
            <div class="max-w-lg rounded-[24px] border border-rose-200 bg-white px-5 py-4 shadow-[0_26px_50px_-36px_rgba(15,23,42,0.35)]">
                <p class="text-sm font-semibold text-rose-700">
                    Unable to load the session workflow
                </p>
                <p class="mt-2 text-sm text-slate-500">
                    {{ loadError }}
                </p>
                <button
                    type="button"
                    class="mt-4 inline-flex rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-sky-200 hover:bg-sky-50/70 hover:text-sky-700"
                    @click="refresh()"
                >
                    Retry
                </button>
            </div>
        </div>

        <div
            v-else-if="!nodes.length"
            class="flex flex-1 items-center justify-center"
        >
            <div class="max-w-md rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-center shadow-[0_26px_50px_-36px_rgba(15,23,42,0.35)]">
                <p class="text-sm font-semibold text-slate-700">
                    No workflow events found
                </p>
                <p class="mt-2 text-sm text-slate-500">
                    The selected session did not produce any renderable events.
                </p>
            </div>
        </div>

        <VueFlow
            v-else
            :nodes="nodes"
            :edges="edges"
            :node-types="nodeTypes"
            :default-viewport="defaultViewport"
            :min-zoom="0.5"
            :max-zoom="1.45"
            :fit-view-on-init="false"
            :nodes-draggable="true"
            :nodes-connectable="false"
            :elements-selectable="false"
            :edges-updatable="false"
            :connect-on-click="false"
            :zoom-on-scroll="false"
            :pan-on-scroll="true"
            :pan-on-scroll-mode="PanOnScrollMode.Free"
            :prevent-scrolling="true"
            :pan-on-drag="true"
            :class="cn(
                'h-full w-full',
                'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#fdfdfd_100%)]',
            )"
        >
            <Background
                :gap="22"
                :size="1.4"
                variant="dots"
            />

            <Controls
                position="bottom-right"
                :show-interactive="false"
            />

            <WorkspaceTrackTurnLabel
                v-for="turnLabel in turnLabels"
                :key="turnLabel.turnIndex"
                :turn-index="turnLabel.turnIndex"
                :y="turnLabel.y"
                :status="turnLabel.status"
                :node-count="turnLabel.nodeCount"
            />
        </VueFlow>
    </section>
</template>

<script setup lang="ts">
import type { CodexSessionDetail } from '#shared/types/session'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { PanOnScrollMode, VueFlow } from '@vue-flow/core'
import { markRaw } from 'vue'
import WorkspaceTrackNode from '@/components/workspace-track/WorkspaceTrackNode.vue'
import WorkspaceTrackTurnLabel from '@/components/workspace-track/WorkspaceTrackTurnLabel.vue'
import { cn } from '@/lib/utils'
import { buildWorkspaceTrackGraph } from '@/lib/workspace-track'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

interface SessionTarget {
    id: string
    path: string
}

const sessionTarget: SessionTarget = {
    id: '019e9195-37b8-77f1-9db4-4eaef779fe91',
    path: '/Users/tangchenghui/.codex/sessions/2026/06/04/rollout-2026-06-04T15-42-16-019e9195-37b8-77f1-9db4-4eaef779fe91.jsonl',
}

const requestKey = computed(() => `${sessionTarget.id}:${sessionTarget.path}`)

const { data: detail, pending, error, refresh } = await useAsyncData<CodexSessionDetail | null>(
    () => `workspace-track:${requestKey.value}`,
    async () => {
        let lastError: unknown = null

        try {
            return await $fetch<CodexSessionDetail>(`/api/sessions/${sessionTarget.id}`, {
                query: {
                    path: sessionTarget.path,
                },
            })
        }
        catch (requestError) {
            lastError = requestError
        }

        throw lastError ?? new Error('Failed to load session detail')
    },
    {
        watch: [requestKey],
        default: () => null,
    },
)

const graph = computed(() => buildWorkspaceTrackGraph(detail.value))
const nodes = computed(() => graph.value.nodes)
const edges = computed(() => graph.value.edges)
const nodeTypes = {
    'workspace-track': markRaw(WorkspaceTrackNode),
}

const turnLabels = computed(() => {
    if (!detail.value) {
        return []
    }

    return detail.value.turns.map((turn) => {
        const firstNode = nodes.value.find(node => node.data?.turnId === turn.turnId)

        return {
            turnIndex: turn.turnIndex,
            y: (firstNode?.position.y ?? 0) + 16,
            status: turn.status,
            nodeCount: turn.nodeIds.length,
        }
    })
})

const sessionTitle = computed(() => detail.value?.sessionMeta?.id || sessionTarget.id || 'Unknown session')
const sessionPath = computed(() => detail.value?.path || sessionTarget.path || '')
const summaryChips = computed(() => [
    { label: 'Turns', value: String(detail.value?.turns.length ?? 0) },
    { label: 'Nodes', value: String(nodes.value.length) },
    { label: 'Links', value: String(edges.value.length) },
])

const loadError = computed(() => {
    if (!error.value) {
        return ''
    }

    return error.value instanceof Error
        ? error.value.message
        : 'Unknown error while loading the session workflow.'
})

const defaultViewport = {
    x: 0,
    y: 0,
    zoom: 0.92,
}
</script>
