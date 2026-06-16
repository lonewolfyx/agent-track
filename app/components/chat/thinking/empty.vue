<template>
    <div>
        {{ think.type }} need pr report
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'ChatThinkingEmpty',
})

defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()
</script>
