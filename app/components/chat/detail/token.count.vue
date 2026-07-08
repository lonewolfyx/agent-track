<template>
    <div class="flex flex-col gap-6">
        <ChatDetailPayloadSection title="Total Token Usage" :value="payload?.info?.total_token_usage" />
        <ChatDetailPayloadSection title="Last Token Usage" :value="payload?.info?.last_token_usage" />
        <ChatDetailPayloadSection title="Context Window" :value="payload?.info?.model_context_window" />
        <ChatDetailPayloadSection title="Rate Limits" :value="payload?.rate_limits" />
    </div>
</template>

<script setup lang="ts">
import { resolveTokenPayload } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatDetailTokenCount',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const payload = computed(() => resolveTokenPayload(props.think))
</script>
