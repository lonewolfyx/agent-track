<template>
    <ChatThinkingNodeButton
        :chat-index="chatIndex"
        :detail-type="TURN_ABORTED"
        icon="mynaui:danger-hexagon"
        :index="index"
        label="turn aborted"
        :summary="summary"
        tone="error"
    />
    <Bezier class="transform -scale-x-100" />
</template>

<script setup lang="ts">
import { TURN_ABORTED } from '#shared/constant/codex.type'
import { resolveTurnAbortedPayload, summarizeUnknown } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatThinkingTurnAborted',
})

const props = defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const summary = computed(() => summarizeUnknown(resolveTurnAbortedPayload(props.think)?.reason ?? props.think.content, 80))
</script>
