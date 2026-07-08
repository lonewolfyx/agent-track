<template>
    <div class="flex flex-col gap-6">
        <ChatDetailPayloadSection title="Tool" :value="call?.name" />
        <ChatDetailPayloadSection title="Input" :value="call?.input" />
        <ChatDetailPayloadSection title="Patch Event" :value="patchChanges" />
        <ChatDetailPayloadSection title="Output" :value="output" />
    </div>
</template>

<script lang="ts" setup>
import type { CodexEventPatchApplyEndPayload } from '#shared/types/event.msg'
import type { CodexResponseCustomToolCall } from '#shared/types/response.item'
import type { CodexSessionThinking } from '#shared/types/session'

defineOptions({
    name: 'ChatDetailCustomToolCall',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const call = computed(() => props.think.call as CodexResponseCustomToolCall | undefined)
const patchChanges = computed(() => (props.think.output?.event as CodexEventPatchApplyEndPayload | undefined)?.changes)
const output = computed(() => {
    const response = props.think.output?.response
    return response && 'output' in response ? response.output : undefined
})
</script>
