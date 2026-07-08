<template>
    <slot />
</template>

<script lang="ts" setup>
import type { ThinkingDetailType } from '#shared/constant/codex.type'
import type { ChatTurnList } from '#shared/types/session'
import { useChatProvider } from '.'

defineOptions({
    name: 'ChatProvider',
})

const status = shallowRef<boolean>(false)

const chatIndex = shallowRef<number>(0)
const thinkIndex = shallowRef<number>(0)
const thinkingType = shallowRef<ThinkingDetailType | ''>('')
const chats = shallowRef<ChatTurnList[] | undefined>(undefined)

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
    handleThinkingNode: (chatIdx: number, thinkIdx: number, type: ThinkingDetailType) => {
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
