<template>
    <textarea
        v-model="chat.answer"
        class="w-full h-full resize-none bg-transparent"
        disabled
    />
</template>

<script lang="ts" setup>
import { useChatDetail } from '~/components/chat'

defineOptions({
    name: 'ChatDetailAnswer',
})
defineProps<{
    think: CodexSessionThinking
}>()

const { chats, chatIndex } = useChatDetail()
const chat = computed(() => chats.value[chatIndex.value]!)
</script>
