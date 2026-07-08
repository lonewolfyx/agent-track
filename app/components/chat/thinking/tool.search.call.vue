<template>
    <ChatThinkingNodeButton
        :chat-index="chatIndex"
        :detail-type="TOOL_SEARCH_CALL"
        icon="material-symbols:manage-search-rounded"
        :index="index"
        label="tool search"
        :summary="summary"
        tone="tool"
    />
</template>

<script setup lang="ts">
import type { CodexResponseToolSearchCall } from '#shared/types/response.item'
import { TOOL_SEARCH_CALL } from '#shared/constant/codex.type'
import { resolveToolSearchArguments, summarizeUnknown } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatThinkingToolSearchCall',
})

const props = defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const call = computed(() => props.think.call as CodexResponseToolSearchCall | undefined)
const summary = computed(() => summarizeUnknown(call.value?.execution ?? resolveToolSearchArguments(call.value), 100))
</script>
