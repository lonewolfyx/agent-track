<template>
    <div>
        {{ content.message }}
    </div>
</template>

<script setup lang="ts">
import type { CodexEventAgentMessagePayload } from '#shared/types/event.msg'
import type { CodexSessionThinking } from '#shared/types/session'

defineOptions({
    name: 'ChatDetailAgentMessage',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const content = computed(() => props.think.content as CodexEventAgentMessagePayload)
</script>
