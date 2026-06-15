<template>
    <div>
        {{ chat.question }}
    </div>
</template>

<script setup lang="ts">
import { useChatDetail } from '~/components/chat'

defineOptions({
    name: 'ChatDetailQuestion',
})

defineProps<{
    think: CodexSessionThinking
}>()

const { chats, chatIndex } = useChatDetail()
const chat = computed(() => chats.value[chatIndex.value]!)
</script>
