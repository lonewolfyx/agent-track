<template>
    <ChatThinkingNodeButton
        :chat-index="chatIndex"
        :detail-type="CUSTOM_TOOL_CALL"
        icon="flowbite:tools-outline"
        :index="index"
        label="custom tool call"
        :summary="summarizeUnknown(think.toolName)"
        tone="tool"
    />
</template>

<script setup lang="ts">
import { CUSTOM_TOOL_CALL } from '#shared/constant/codex.type'
import { summarizeUnknown } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatThinkingCustomToolCall',
})

defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()
</script>
