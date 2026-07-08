<template>
    <ChatThinkingNodeButton
        :chat-index="chatIndex"
        :detail-type="LOCAL_SHELL_CALL"
        icon="material-symbols:terminal-rounded"
        :index="index"
        label="local shell"
        :summary="summary"
        tone="shell"
    />
</template>

<script setup lang="ts">
import { LOCAL_SHELL_CALL } from '#shared/constant/codex.type'
import { formatLocalShellCommand, summarizeUnknown } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatThinkingLocalShellCall',
})

const props = defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const summary = computed(() => summarizeUnknown(formatLocalShellCommand(props.think), 100))
</script>
