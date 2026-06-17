<template>
    <div>
        {{ content }}
    </div>
</template>

<script setup lang="ts">
import type { CodexEventAgentMessagePayload } from '#shared/types/event.msg'
import type { CodexSessionThinking } from '#shared/types/session'

defineOptions({
    name: 'ChatDetailUserMessage',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const content = computed(() => props.think.content as CodexEventAgentMessagePayload)
</script>
