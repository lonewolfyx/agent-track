<template>
    <div>
        {{ type }} need pr report
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'ChatThinkingEmpty',
})

defineProps<{
    type: string
    // think: CodexSessionThinking
    // index: number
    // chatIndex: number
}>()

// const { handleThinkingNode } = useChatDetail()
</script>
