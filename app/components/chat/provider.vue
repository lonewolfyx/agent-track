<template>
    <slot />
</template>

<script lang="ts" setup>
import type { ChatTurnList, CodexSessionThinking } from '#shared/types/session'
import { useChatProvider } from '.'

defineOptions({
    name: 'ChatProvider',
})

const idx = ref<number>()
const type = ref<string>()
const thinking = ref<CodexSessionThinking>()
const chat = shallowRef<ChatTurnList>()

useChatProvider({
    idx,
    onIndexChange: (index: number) => {
        idx.value = index
    },
    type,
    thinking,
    chat,
    onTypeChange: (sessionType: string) => {
        type.value = sessionType
    },
})
</script>
