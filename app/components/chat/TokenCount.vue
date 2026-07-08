<template>
    <div
        v-if="displayToken"
        class="relative flex flex-col pl-10 pt-4"
        :class="canOpenDetail ? 'cursor-pointer' : ''"
        @click="openDetail"
    >
        <VerticalLine />
        <div class="flex items-center gap-2 relative border-l border-input">
            <div class="size-2 border-4 rounded-full -ml-1 -translate-x-[0.5px]" />
            <div class="flex items-center gap-2 text-xs">
                <span class="capitalize">input tokens</span>
                <span class="font-mono font-semibold text-indigo-500">{{ displayToken.input_tokens }}</span>
            </div>
            <div class="size-1 border-2 rounded-full border-input" />

            <div class="flex items-center gap-2 text-xs">
                <span class="capitalize">cached input tokens</span>
                <span class="font-mono font-semibold text-sky-500">{{ displayToken.cached_input_tokens }}</span>
            </div>
            <div class="size-1 border-2 rounded-full border-input" />

            <div class="flex items-center gap-2 text-xs">
                <span class="capitalize">total tokens</span>
                <span class="font-mono font-semibold text-violet-600">{{ displayToken.total_tokens }}</span>
            </div>
            <div class="size-1 border-2 rounded-full border-input" />

            <div class="flex items-center gap-2 text-xs">
                <span class="capitalize">output tokens</span>
                <span class="font-mono font-semibold text-emerald-500">{{ displayToken.output_tokens }}</span>
            </div>
            <div class="size-1 border-2 rounded-full border-input" />

            <div class="flex items-center gap-2 text-xs">
                <span class="capitalize">reasoning tokens</span>
                <span class="font-mono font-semibold text-amber-500">{{ displayToken.reasoning_output_tokens }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CodexTokenUsage } from '#shared/types/event.msg'
import { TOKEN_COUNT } from '#shared/constant/codex.type'
import { resolveTokenPayload } from '#shared/utils/thinking'
import { useChatDetail } from '~/components/chat'

defineOptions({
    name: 'ChatTokenCount',
})

const props = defineProps<{
    token: CodexTokenUsage | null
    think?: CodexSessionThinking
    index?: number
    chatIndex?: number
}>()

const { handleThinkingNode } = useChatDetail()

const displayToken = computed(() => props.token ?? (props.think ? resolveTokenPayload(props.think)?.info?.total_token_usage ?? null : null))
const canOpenDetail = computed(() => props.index !== undefined && props.chatIndex !== undefined)

function openDetail() {
    if (!canOpenDetail.value) {
        return
    }

    handleThinkingNode(props.chatIndex!, props.index!, TOKEN_COUNT)
}
</script>
