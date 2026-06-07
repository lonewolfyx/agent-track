<template>
    <div :class="getNodeCardClass(props.data.kind)">
        <Handle
            id="target"
            type="target"
            :position="Position.Left"
            :connectable="props.connectable"
            class="h-[18px] w-[6px] rounded-full border-0 bg-slate-500 shadow-none"
        />
        <Handle
            id="source"
            type="source"
            :position="Position.Right"
            :connectable="props.connectable"
            class="h-[18px] w-[6px] rounded-full border-0 bg-slate-500 shadow-none"
        />

        <span
            v-if="props.data.cornerBadge"
            class="absolute right-4 top-4 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700"
        >
            {{ props.data.cornerBadge }}
        </span>
        <span
            v-if="props.data.turnIndex !== undefined"
            class="absolute left-4 top-4 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500"
        >
            Turn {{ props.data.turnIndex + 1 }}
        </span>

        <div class="flex items-start gap-3" :class="props.data.turnIndex !== undefined ? 'pt-8' : ''">
            <div class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border" :class="[getNodeMeta(props.data.kind).iconWrapper]">
                <component
                    :is="getNodeMeta(props.data.kind).icon"
                    class="size-4.5" :class="[getNodeMeta(props.data.kind).iconColor]"
                />
            </div>

            <div class="min-w-0">
                <p class="truncate text-[15px] font-semibold uppercase tracking-[0.01em] text-slate-700">
                    {{ props.data.title }}
                </p>
                <p
                    v-if="props.data.subtitle"
                    class="mt-1 text-xs font-medium text-slate-400"
                >
                    {{ props.data.subtitle }}
                </p>
                <p class="mt-1 text-[11px] font-medium text-slate-400">
                    {{ formatTrackTimestamp(props.data.timestamp) }}
                </p>
            </div>
        </div>

        <div
            v-if="props.data.badges.length && props.data.payloadType !== 'reasoning_bundle'"
            class="mt-4 flex flex-wrap gap-2"
        >
            <span
                v-for="badge in props.data.badges"
                :key="badge.label"
                class="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]" :class="[getBadgeToneClass(badge.tone)]"
            >
                {{ badge.label }}
            </span>
        </div>

        <WorkspaceTrackReasoningFlow
            v-if="props.data.payloadType === 'reasoning_bundle'"
            :nodes="props.data.reasoningFlowNodes"
            :edges="props.data.reasoningFlowEdges"
            :canvas-height="props.data.reasoningCanvasHeight"
            class="mt-4"
        />

        <div
            v-else-if="props.data.embeddedRows.length"
            class="relative mt-4 flex flex-col gap-3"
        >
            <div class="absolute bottom-3 left-[15px] top-3 w-px bg-slate-200/80" />
            <div
                v-for="(row, rowIndex) in props.data.embeddedRows"
                :key="row.id"
                class="relative pl-8"
            >
                <span class="absolute left-0 top-4 flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-500 shadow-[0_8px_18px_-12px_rgba(15,23,42,0.35)]">
                    {{ Number(rowIndex) + 1 }}
                </span>

                <div class="flex items-start gap-2 overflow-x-auto pb-1">
                    <template
                        v-for="(card, cardIndex) in row.cards"
                        :key="card.id"
                    >
                        <div :class="getEmbeddedCardClass(card.kind)">
                            <div class="flex items-start justify-between gap-2">
                                <div class="min-w-0">
                                    <p class="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                                        {{ card.title }}
                                    </p>
                                    <p
                                        v-if="card.subtitle"
                                        class="mt-1 truncate text-[11px] text-slate-400"
                                    >
                                        {{ card.subtitle }}
                                    </p>
                                </div>
                            </div>

                            <div
                                v-if="card.badges.length"
                                class="mt-2 flex flex-wrap gap-1.5"
                            >
                                <span
                                    v-for="badge in card.badges"
                                    :key="badge.label"
                                    class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]" :class="[getBadgeToneClass(badge.tone)]"
                                >
                                    {{ badge.label }}
                                </span>
                            </div>

                            <p
                                v-if="card.content"
                                class="mt-2 whitespace-pre-wrap break-words text-[12px] leading-5 text-slate-600"
                            >
                                {{ card.content }}
                            </p>
                        </div>

                        <div
                            v-if="Number(cardIndex) < row.cards.length - 1"
                            class="flex min-w-8 items-center justify-center pt-10 text-[12px] font-semibold text-sky-500"
                        >
                            ->
                        </div>
                    </template>
                </div>

                <div
                    v-if="row.metrics.length"
                    class="mt-2 flex flex-wrap gap-2"
                >
                    <span
                        v-for="metric in row.metrics"
                        :key="metric"
                        class="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700"
                    >
                        {{ metric }}
                    </span>
                </div>
            </div>
        </div>

        <div
            v-if="props.data.stats.length && props.data.payloadType !== 'reasoning_bundle'"
            class="mt-4 grid grid-cols-2 gap-2"
        >
            <div
                v-for="stat in props.data.stats"
                :key="`${stat.label}-${stat.value}`"
                class="rounded-xl bg-slate-50 px-3 py-2.5"
            >
                <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {{ stat.label }}
                </p>
                <p class="mt-1 text-sm font-semibold text-slate-700">
                    {{ stat.value }}
                </p>
            </div>
        </div>

        <div
            v-if="props.data.sections.length"
            class="mt-4 flex flex-col gap-3"
        >
            <div
                v-for="section in props.data.sections"
                :key="`${section.title}-${section.lines.join('|')}`"
                class="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-3 py-3"
            >
                <p
                    v-if="section.title"
                    class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400"
                >
                    {{ section.title }}
                </p>
                <div class="mt-2 flex flex-col gap-2">
                    <p
                        v-for="line in section.lines"
                        :key="line"
                        class="whitespace-pre-wrap break-words text-[12px] leading-5 text-slate-600"
                    >
                        {{ line }}
                    </p>
                </div>
            </div>
        </div>

        <p
            v-if="props.data.content"
            class="mt-4 whitespace-pre-wrap break-words rounded-[18px] bg-slate-50 px-3 py-3 text-[13px] leading-5 text-slate-500"
        >
            {{ props.data.content }}
        </p>
    </div>
</template>

<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core'
import type { WorkspaceTrackNodeData } from '@/lib/workspace-track'
import { Handle, Position } from '@vue-flow/core'
import {
    formatTrackTimestamp,
    getBadgeToneClass,
    getEmbeddedCardClass,
    getNodeCardClass,
    getNodeMeta,
} from './presentation'
import WorkspaceTrackReasoningFlow from './WorkspaceTrackReasoningFlow.vue'

const props = defineProps<NodeProps<WorkspaceTrackNodeData>>()
</script>
