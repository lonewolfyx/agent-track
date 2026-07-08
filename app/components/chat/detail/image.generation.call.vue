<template>
    <div class="flex flex-col gap-6">
        <ChatDetailPayloadSection title="Status" :value="event?.status ?? call?.status" />
        <ChatDetailPayloadSection title="Revised Prompt" :value="event?.revised_prompt ?? call?.revised_prompt" />
        <ChatDetailPayloadSection title="Result" :value="event?.result ?? call?.result" />
        <ChatDetailPayloadSection title="Saved Path" :value="event?.saved_path" />
        <ChatDetailPayloadSection title="Raw Request" :value="call" />
        <ChatDetailPayloadSection title="Raw Output" :value="event" />
    </div>
</template>

<script setup lang="ts">
import { resolveImageGenerationCall, resolveImageGenerationEnd } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatDetailImageGenerationCall',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const call = computed(() => resolveImageGenerationCall(props.think))
const event = computed(() => resolveImageGenerationEnd(props.think))
</script>
