<template>
    <article :class="getReasoningFlowStepShellClass(props.data.kind)" class="reasoning-flow-nopan w-full max-w-none p-3">
        <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Step {{ props.data.sequence }}
        </p>

        <div class="mt-2 space-y-2">
            <section
                v-for="card in props.data.cards"
                :key="card.id"
                class="rounded-[14px] border border-slate-100 bg-slate-50/80 px-3 py-2.5"
            >
                <p class="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                    {{ card.title }}
                </p>
                <p v-if="card.subtitle" class="mt-1 truncate text-[11px] text-slate-400">
                    {{ card.subtitle }}
                </p>

                <div v-if="card.badges.length" class="mt-2 flex flex-wrap gap-1.5">
                    <span
                        v-for="badge in card.badges"
                        :key="badge.label"
                        class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
                        :class="getBadgeToneClass(badge.tone)"
                    >
                        {{ badge.label }}
                    </span>
                </div>

                <p
                    v-if="card.content"
                    class="mt-2 line-clamp-4 whitespace-pre-wrap break-words text-[12px] leading-5 text-slate-600"
                >
                    {{ card.content }}
                </p>
            </section>
        </div>

        <div v-if="props.data.metrics.length" class="mt-2 flex flex-wrap gap-1.5">
            <span
                v-for="metric in props.data.metrics"
                :key="metric"
                class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
            >
                {{ metric }}
            </span>
        </div>
    </article>
</template>

<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core'
import type { WorkspaceTrackReasoningFlowStepNode } from '@/lib/workspace-track'
import { getBadgeToneClass, getReasoningFlowStepShellClass } from './presentation'

const props = defineProps<NodeProps<WorkspaceTrackReasoningFlowStepNode>>()
</script>
