<template>
    <ChatThinkingNodeButton
        :chat-index="chatIndex"
        :detail-type="MCP_TOOL_CALL"
        icon="carbon:network-4"
        :index="index"
        :label="toolName"
        :summary="summary"
        tone="tool"
    />
</template>

<script setup lang="ts">
import { MCP_TOOL_CALL } from '#shared/constant/codex.type'
import { formatMcpToolName, resolveMcpInvocation, summarizeUnknown } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatThinkingMcpToolCall',
})

const props = defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const invocation = computed(() => resolveMcpInvocation(props.think))
const toolName = computed(() => props.think.toolName || formatMcpToolName(invocation.value))
const summary = computed(() => summarizeUnknown(invocation.value.arguments, 100))
</script>
