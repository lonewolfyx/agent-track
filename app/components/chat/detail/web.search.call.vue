<template>
    <div class="flex flex-col gap-6">
        <ChatDetailPayloadSection title="Status" :value="call?.status" />
        <ChatDetailPayloadSection title="Call Action" :value="call?.action" />
        <ChatDetailPayloadSection title="Event Query" :value="event?.query" />
        <ChatDetailPayloadSection title="Event Action" :value="event?.action" />
    </div>
</template>

<script setup lang="ts">
import { resolveWebSearchCall, resolveWebSearchEvent } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatDetailWebSearchCall',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const call = computed(() => resolveWebSearchCall(props.think))
const event = computed(() => resolveWebSearchEvent(props.think))
</script>
