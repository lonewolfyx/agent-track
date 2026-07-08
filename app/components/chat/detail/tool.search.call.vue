<template>
    <div class="flex flex-col gap-6">
        <ChatDetailPayloadSection title="Execution" :value="call?.execution" />
        <ChatDetailPayloadSection title="Status" :value="call?.status ?? output?.status" />
        <ChatDetailPayloadSection title="Arguments" :value="argumentsPayload" />
        <ChatDetailPayloadSection title="Output Tools" :value="output?.tools" />
        <ChatDetailPayloadSection title="Output" :value="output" />
    </div>
</template>

<script setup lang="ts">
import type { CodexResponseToolSearchCall } from '#shared/types/response.item'
import { resolveToolSearchArguments, resolveToolSearchOutput } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatDetailToolSearchCall',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const call = computed(() => props.think.call as CodexResponseToolSearchCall | undefined)
const output = computed(() => resolveToolSearchOutput(props.think))
const argumentsPayload = computed(() => resolveToolSearchArguments(call.value))
</script>
