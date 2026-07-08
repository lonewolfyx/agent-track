<template>
    <ChatThinkingNodeButton
        :chat-index="chatIndex"
        :detail-type="AGENT_MESSAGE"
        icon="dinkie-icons:thinking-face"
        :index="index"
        label="agent message"
        :summary="summary"
    />
</template>

<script setup lang="ts">
import { AGENT_MESSAGE } from '#shared/constant/codex.type'
import { summarizeUnknown } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatThinkingAgentMessage',
})

const props = defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const summary = computed(() => summarizeUnknown(props.think.content && typeof props.think.content === 'object' && 'message' in props.think.content
    ? props.think.content.message
    : '', 50))
</script>
