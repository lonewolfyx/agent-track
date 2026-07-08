<template>
    <ChatThinkingNodeButton
        :chat-index="chatIndex"
        :detail-type="USER_MESSAGE"
        icon="pixel:comment"
        :index="index"
        label="quote"
        :summary="summary"
    />
</template>

<script setup lang="ts">
import type { CodexSessionThinking } from '#shared/types/session'
import { USER_MESSAGE } from '#shared/constant/codex.type'
import { summarizeUnknown } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatThinkingUserMessage',
})

const props = defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const summary = computed(() => summarizeUnknown(props.think.pairedPayload?.content.find(item => item.type === 'input_text')?.text ?? props.think.content, 100))
</script>
