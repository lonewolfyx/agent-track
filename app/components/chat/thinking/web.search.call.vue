<template>
    <ChatThinkingNodeButton
        :chat-index="chatIndex"
        :detail-type="WEB_SEARCH_CALL"
        icon="material-symbols:search-rounded"
        :index="index"
        label="web search"
        :summary="summary"
        tone="tool"
    />
</template>

<script setup lang="ts">
import { WEB_SEARCH_CALL } from '#shared/constant/codex.type'
import { resolveWebSearchEvent, summarizeUnknown } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatThinkingWebSearchCall',
})

const props = defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const summary = computed(() => summarizeUnknown(props.think.toolName || resolveWebSearchEvent(props.think)?.query, 100))
</script>
