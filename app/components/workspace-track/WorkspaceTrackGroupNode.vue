<template>
    <button
        type="button"
        :class="getReasoningGroupCardClass(data.group.kind, data.selected)"
        class="relative w-[248px] text-left"
        @click="$emit('select', data.group)"
    >
        <Handle
            type="target"
            :position="Position.Left"
            :connectable="false"
            class="h-[18px] w-[6px] rounded-full border-0 bg-slate-400 shadow-none"
        />
        <Handle
            type="source"
            :position="Position.Right"
            :connectable="false"
            class="h-[18px] w-[6px] rounded-full border-0 bg-slate-400 shadow-none"
        />

        <div class="flex items-start gap-3 border-b border-slate-100 px-4 py-3">
            <div
                class="flex size-9 shrink-0 items-center justify-center rounded-xl border"
                :class="getReasoningGroupMeta(data.group.kind).iconWrapper"
            >
                <component
                    :is="getReasoningGroupMeta(data.group.kind).icon"
                    class="size-4"
                    :class="getReasoningGroupMeta(data.group.kind).iconColor"
                />
            </div>

            <div class="min-w-0 flex-1">
                <p class="truncate text-[13px] font-semibold text-slate-700">
                    {{ data.group.label }}
                </p>
                <p class="mt-1 text-[11px] text-slate-400">
                    {{ data.group.count }} steps<span v-if="data.group.duration"> · {{ data.group.duration }}</span>
                </p>
            </div>
        </div>

        <div class="px-4 py-3">
            <p
                v-for="line in data.group.preview.slice(0, 3)"
                :key="line"
                class="truncate text-[11px] leading-5 text-slate-500"
            >
                ▸ {{ line }}
            </p>
            <p
                v-if="data.group.count > data.group.preview.length"
                class="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400"
            >
                +{{ data.group.count - data.group.preview.length }} more
            </p>
        </div>
    </button>
</template>

<script setup lang="ts">
import type { WorkspaceTrackStepGroupNode } from '@/lib/workspace-track'
import { Handle, Position } from '@vue-flow/core'
import { getReasoningGroupCardClass, getReasoningGroupMeta } from './presentation'

defineProps<{
    data: {
        group: WorkspaceTrackStepGroupNode
        selected: boolean
    }
}>()

defineEmits<{
    select: [group: WorkspaceTrackStepGroupNode]
}>()
</script>
