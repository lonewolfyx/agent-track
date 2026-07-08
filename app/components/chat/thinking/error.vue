<template>
    <ChatThinkingNodeButton
        :chat-index="chatIndex"
        :detail-type="ERROR"
        icon="mynaui:danger-hexagon"
        :index="index"
        label="error"
        :summary="summary"
        tone="error"
    />
</template>

<script setup lang="ts">
import { ERROR } from '#shared/constant/codex.type'
import { resolveErrorMessage, summarizeUnknown } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatThinkingError',
})

const props = defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const summary = computed(() => summarizeUnknown(resolveErrorMessage(props.think), 100))
</script>
