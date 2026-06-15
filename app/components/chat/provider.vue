<template>
    <slot />
</template>

<script lang="ts" setup>
import type { ChatTurnList, CodexSessionThinking } from '#shared/types/session'
import { useChatProvider } from '.'

defineOptions({
    name: 'ChatProvider',
})

const status = ref<boolean>(false)

const idx = ref<number>(0)
const thinkingType = ref<string>('')
const thinking = shallowRef<CodexSessionThinking | undefined>(undefined)
const chat = shallowRef<ChatTurnList | undefined>(undefined)

function changeShowBox() {
    if (!status.value) {
        status.value = !status.value
    }
}

useChatProvider({
    status,
    idx,
    handleThinkingNode: (index: number, type: string) => {
        changeShowBox()
        idx.value = index
        thinkingType.value = type
    },
    thinking,
    chat,
    reset: () => {
        status.value = false
        idx.value = 0
        thinkingType.value = ''
    },
})
</script>
