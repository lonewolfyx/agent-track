<template>
    <slot />
</template>

<script setup lang="ts">
import { useChatDetail } from '~/components/chat'

defineOptions({
    name: 'ChatThinkingProvider',
})

const props = defineProps<{
    chat: ChatTurnList
}>()

const { thinking } = useChatDetail()
thinking.value = props.chat.thinking
</script>
