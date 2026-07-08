<template>
    <div class="flex flex-col gap-6">
        <ChatDetailPayloadSection title="Message" :value="message" />
        <ChatDetailPayloadSection title="Error Info" :value="payload?.codex_error_info" />
        <ChatDetailPayloadSection title="Raw Payload" :value="payload" />
    </div>
</template>

<script setup lang="ts">
import type { CodexEventErrorPayload } from '#shared/types/event.msg'
import { resolveErrorMessage } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatDetailError',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const payload = computed(() => props.think.payload as CodexEventErrorPayload | undefined)
const message = computed(() => resolveErrorMessage(props.think))
</script>
