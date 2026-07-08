<template>
    <div class="flex flex-col gap-6">
        <ChatDetailPayloadSection title="Reason" :value="payload?.reason" />
        <ChatDetailPayloadSection title="Duration" :value="payload?.duration_ms" />
        <ChatDetailPayloadSection title="Timestamp" :value="think.timestamp" />
        <ChatDetailPayloadSection title="Raw Payload" :value="payload" />
    </div>
</template>

<script setup lang="ts">
import { resolveTurnAbortedPayload } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatDetailTurnAborted',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const payload = computed(() => resolveTurnAbortedPayload(props.think))
</script>
