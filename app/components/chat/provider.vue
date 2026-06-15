<template>
    <slot />
</template>

<script lang="ts" setup>
import type { ChatTurnList } from '#shared/types/session'
import { useChatProvider } from '.'

defineOptions({
    name: 'ChatProvider',
})

const status = ref<boolean>(false)

const chatIndex = ref<number>(0)
const thinkIndex = ref<number>(0)
const thinkingType = ref<string>('')
const chats = shallowRef<ChatTurnList | undefined>(undefined)

function changeShowBox() {
    if (!status.value) {
        status.value = !status.value
    }
}

useChatProvider({
    status,
    chatIndex,
    thinkIndex,
    thinkingType,
    handleThinkingNode: (chatIdx: number, thinkIdx: number, type: string) => {
        changeShowBox()
        chatIndex.value = chatIdx
        thinkIndex.value = thinkIdx
        thinkingType.value = type
    },
    chats,
    reset: () => {
        status.value = false
        thinkIndex.value = 0
        thinkingType.value = ''
    },
})
</script>
