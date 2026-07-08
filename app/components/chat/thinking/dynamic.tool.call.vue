<template>
    <ChatThinkingNodeButton
        :chat-index="chatIndex"
        :detail-type="DYNAMIC_TOOL_CALL_REQUEST"
        icon="carbon:tool-kit"
        :index="index"
        :label="toolName"
        :summary="summary"
        tone="tool"
    />
</template>

<script setup lang="ts">
import { DYNAMIC_TOOL_CALL_REQUEST } from '#shared/constant/codex.type'
import { formatDynamicToolName, resolveDynamicToolRequest, resolveDynamicToolResponse, summarizeUnknown } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatThinkingDynamicToolCall',
})

const props = defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const request = computed(() => resolveDynamicToolRequest(props.think))
const response = computed(() => resolveDynamicToolResponse(props.think))
const toolName = computed(() => formatDynamicToolName(request.value ?? response.value))
const summary = computed(() => summarizeUnknown(request.value?.arguments ?? response.value?.content_items, 100))
</script>
