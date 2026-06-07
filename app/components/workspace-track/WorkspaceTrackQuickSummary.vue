<template>
    <div class="rounded-[20px] border border-slate-200 bg-slate-50/85 px-4 py-3">
        <p class="text-[12px] font-medium text-slate-500">
            {{ headline || 'Reasoning workflow summary' }}
        </p>

        <div class="mt-3 flex flex-wrap items-center gap-2.5">
            <template v-for="(group, index) in visibleGroups" :key="group.id">
                <div :class="getReasoningQuickChipClass(group.kind)">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                        {{ group.shortLabel }}
                    </p>
                    <p class="mt-1 text-[13px] font-semibold text-slate-700">
                        {{ group.count }}
                    </p>
                </div>

                <ArrowRight
                    v-if="index < visibleGroups.length - 1"
                    class="size-4 text-slate-300"
                />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { WorkspaceTrackNodeData } from '@/lib/workspace-track'
import { ArrowRight } from '@lucide/vue'
import { getReasoningQuickChipClass } from './presentation'

const props = defineProps<{
    groups: WorkspaceTrackNodeData['reasoningQuickSummary']
    stats: WorkspaceTrackNodeData['stats']
}>()

const visibleGroups = computed(() => props.groups.slice(0, 5))

const headline = computed(() => {
    const events = props.stats.find(stat => stat.label === 'Events')?.value
    const tokens = props.stats.find(stat => stat.label === 'Tokens')?.value

    return [
        events ? `${events} events` : null,
        tokens && tokens !== '-' ? `${tokens} tokens` : null,
    ].filter(Boolean).join(' · ')
})
</script>
