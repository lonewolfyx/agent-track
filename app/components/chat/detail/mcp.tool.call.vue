<template>
    <div class="flex flex-col gap-6">
        <ChatDetailPayloadSection title="Server" :value="invocation.server" />
        <ChatDetailPayloadSection title="Tool" :value="invocation.tool" />
        <ChatDetailPayloadSection title="Arguments" :value="invocation.arguments" />
        <ChatDetailPayloadSection title="Plugin" :value="invocation.pluginId" />
        <ChatDetailPayloadSection title="Resource" :value="invocation.resourceUri" />
        <ChatDetailPayloadSection title="Result" :value="output" />
        <ChatDetailPayloadSection title="Raw Request" :value="think.call" />
        <ChatDetailPayloadSection title="Raw Output" :value="think.output" />
    </div>
</template>

<script setup lang="ts">
import { resolveMcpInvocation, resolveMcpOutput } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatDetailMcpToolCall',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const invocation = computed(() => resolveMcpInvocation(props.think))
const output = computed(() => resolveMcpOutput(props.think))
</script>
