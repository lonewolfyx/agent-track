<template>
    <div class="flex flex-col gap-6">
        <ChatDetailPayloadSection title="Status" :value="call?.status" />
        <ChatDetailPayloadSection title="Command" :value="command" />
        <ChatDetailPayloadSection title="Working Directory" :value="call?.action?.working_directory" />
        <ChatDetailPayloadSection title="Timeout" :value="call?.action?.timeout_ms" />
        <ChatDetailPayloadSection title="User" :value="call?.action?.user" />
        <ChatDetailPayloadSection title="Environment" :value="call?.action?.env" />
        <ChatDetailPayloadSection title="Raw Action" :value="call?.action" />
    </div>
</template>

<script setup lang="ts">
import { formatLocalShellCommand, resolveLocalShellCall } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatDetailLocalShellCall',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const call = computed(() => resolveLocalShellCall(props.think))
const command = computed(() => formatLocalShellCommand(props.think))
</script>
