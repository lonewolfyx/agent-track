<template>
    <div class="flex flex-col gap-6">
        <ChatDetailPayloadSection title="Tool" :value="toolName" />
        <ChatDetailPayloadSection title="Request Arguments" :value="request?.arguments" />
        <ChatDetailPayloadSection title="Success" :value="response?.success" />
        <ChatDetailPayloadSection title="Error" :value="response?.error" />
        <ChatDetailPayloadSection title="Duration" :value="response?.duration" />
        <ChatDetailPayloadSection title="Content Items" :value="response?.content_items" />
        <ChatDetailPayloadSection title="Raw Request" :value="request" />
        <ChatDetailPayloadSection title="Raw Response" :value="response" />
    </div>
</template>

<script setup lang="ts">
import { formatDynamicToolName, resolveDynamicToolRequest, resolveDynamicToolResponse } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatDetailDynamicToolCall',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const request = computed(() => resolveDynamicToolRequest(props.think))
const response = computed(() => resolveDynamicToolResponse(props.think))
const toolName = computed(() => formatDynamicToolName(request.value ?? response.value))
</script>
