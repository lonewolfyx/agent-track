<template>
    <div class="flex flex-col gap-6">
        <ChatDetailPayloadSection title="Reasoning" :value="reasoningText" />
        <ChatDetailPayloadSection title="Raw Payload" :value="think.content" />
    </div>
</template>

<script setup lang="ts">
import { resolveReasoningText } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatDetailReasoning',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const reasoningText = computed(() => resolveReasoningText(props.think))
</script>
