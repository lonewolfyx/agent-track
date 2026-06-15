<template>
    <slot />
</template>

<script setup lang="ts">
import { useChatDetail } from '~/components/chat'

defineOptions({
    name: 'ChatThinkingProvider',
})

const props = defineProps<{
    idx: number
}>()

const { chatIdx } = useChatDetail()
chatIdx.value = props.idx
</script>
