<template>
    <div class="flex flex-col gap-6">
        <ChatDetailPayloadSection title="Tool" :value="call?.name" />
        <ChatDetailPayloadSection title="Input" :value="input" />
        <ChatDetailPayloadSection title="Output" :value="output" />
    </div>
</template>

<script lang="ts" setup>
import type { CodexResponseFunctionCall } from '#shared/types/function.call'
import { parseMaybeJson } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatDetailFunctionCall',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const call = computed(() => props.think.call as CodexResponseFunctionCall | undefined)
const input = computed(() => parseMaybeJson(call.value?.arguments))
const output = computed(() => {
    const response = props.think.output?.response
    return response && 'output' in response ? response.output : props.think.output?.event
})
</script>
