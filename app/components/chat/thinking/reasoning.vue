<template>
    <ChatThinkingNodeButton
        :chat-index="chatIndex"
        :detail-type="think.type"
        icon="icon-park-twotone:brain"
        :index="index"
        :label="think.type === AGENT_REASONING ? 'agent reasoning' : 'reasoning'"
        :summary="summary"
        tone="reasoning"
    />
</template>

<script setup lang="ts">
import { AGENT_REASONING } from '#shared/constant/codex.type'
import { resolveReasoningText, summarizeUnknown } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatThinkingReasoning',
})

const props = defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const summary = computed(() => summarizeUnknown(resolveReasoningText(props.think), 100))
</script>
