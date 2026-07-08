<template>
    <div>
        {{ content }}
    </div>
</template>

<script setup lang="ts">
import type { CodexSessionThinking } from '#shared/types/session'

defineOptions({
    name: 'ChatDetailUserMessage',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const content = computed(() => props.think.pairedPayload?.content.find(item => item.type === 'input_text')?.text ?? props.think.content ?? '')
</script>
