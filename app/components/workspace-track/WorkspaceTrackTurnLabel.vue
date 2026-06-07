<template>
    <div
        class="pointer-events-none absolute left-0 flex items-center gap-2"
        :style="{ top: `${y}px` }"
    >
        <div class="pointer-events-auto flex items-center gap-2 rounded-r-[16px] border border-l-0 border-slate-200/90 bg-white/94 px-3 py-2 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.35)] backdrop-blur-[14px]">
            <span class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Turn {{ turnIndex + 1 }}
            </span>
            <span
                v-if="status"
                :class="cn('rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]', statusClass)"
            >
                {{ status }}
            </span>
            <span
                v-if="nodeCount"
                class="text-[10px] text-slate-400"
            >
                {{ nodeCount }} nodes
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CodexSessionTurnStatus } from '#shared/types/session'
import { cn } from '@/lib/utils'
import { getTurnStatusClass } from './presentation'

const props = defineProps<{
    turnIndex: number
    y: number
    status?: CodexSessionTurnStatus
    nodeCount?: number
}>()

const statusClass = computed(() => getTurnStatusClass(props.status))
</script>
