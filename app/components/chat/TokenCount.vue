<template>
    <div v-if="token" class="relative flex flex-col pl-10 pt-4">
        <VerticalLine />
        <div class="flex items-center gap-2 relative border-l border-input">
            <div class="size-2 border-4 rounded-full -ml-1 -translate-x-[0.5px]" />
            <div class="flex items-center gap-2 text-xs">
                <span class="capitalize">input tokens</span>
                <span class="font-mono font-semibold text-indigo-500">{{ token.input_tokens }}</span>
            </div>
            <div class="size-1 border-2 rounded-full border-input" />

            <div class="flex items-center gap-2 text-xs">
                <span class="capitalize">cached input tokens</span>
                <span class="font-mono font-semibold text-sky-500">{{ token.cached_input_tokens }}</span>
            </div>
            <div class="size-1 border-2 rounded-full border-input" />

            <div class="flex items-center gap-2 text-xs">
                <span class="capitalize">total tokens</span>
                <span class="font-mono font-semibold text-violet-600">{{ token.total_tokens }}</span>
            </div>
            <div class="size-1 border-2 rounded-full border-input" />

            <div class="flex items-center gap-2 text-xs">
                <span class="capitalize">output tokens</span>
                <span class="font-mono font-semibold text-emerald-500">{{ token.output_tokens }}</span>
            </div>
            <div class="size-1 border-2 rounded-full border-input" />

            <div class="flex items-center gap-2 text-xs">
                <span class="capitalize">reasoning tokens</span>
                <span class="font-mono font-semibold text-amber-500">{{ token.reasoning_output_tokens }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CodexTokenUsage } from '#shared/types/event.msg'

defineOptions({
    name: 'ChatTokenCount',
})

defineProps<{
    token: CodexTokenUsage | null
}>()
</script>
