<template>
    <div class="relative">
        <div class="flex items-center gap-4 text-sm">
            <span
                :class="cn(
                    'px-3 py-1 rounded-full',
                    'bg-white/90 text-indigo-500',
                    'border border-dashed border-indigo-500 capitalize',
                )"
            >
                Turn Context
            </span>
            <div
                :class="cn(
                    'flex items-center gap-2',
                    'px-3 py-1',
                    'bg-white text-amber-500 text-xs',
                    'border border-dashed rounded-2xl',
                )"
            >
                <Icon class="size-4" name="lucide:bot" />
                <span class="font-mono capitalize">{{ turnContext.model }}</span>
            </div>
            <div
                :class="cn(
                    'flex items-center gap-2',
                    'px-3 py-1',
                    'bg-white text-cyan-500 text-xs',
                    'border border-dashed rounded-2xl',
                )"
            >
                <Icon class="size-4" name="icon-park-twotone:brain" />
                <span class="font-mono capitalize">{{ turnContext.effort }}</span>
            </div>
        </div>
        <div class="pl-10 w-px h-4 border-r border-dashed" />
    </div>
</template>

<script setup lang="ts">
import type { CodexTurnContextPayload } from '#shared/types/turn.context'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'ChatTurnContext',
})

defineProps<{
    turnContext: CodexTurnContextPayload
}>()
</script>
