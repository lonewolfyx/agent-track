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

const chatIdx = ref<number>(0)
const thinkIdx = ref<number>(0)
const thinkingType = ref<string>('')
const chats = shallowRef<ChatTurnList | undefined>(undefined)

function changeShowBox() {
    if (!status.value) {
        status.value = !status.value
    }
}

useChatProvider({
    status,
    chatIdx,
    thinkIdx,
    thinkingType,
    handleThinkingNode: (index: number, type: string) => {
        changeShowBox()
        thinkIdx.value = index
        thinkingType.value = type
    },
    chats,
    reset: () => {
        status.value = false
        thinkIdx.value = 0
        thinkingType.value = ''
    },
})
</script>
