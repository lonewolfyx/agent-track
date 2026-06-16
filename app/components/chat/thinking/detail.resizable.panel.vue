<template>
    <div
        :class="cn(
            'pointer-events-auto relative',
            'h-full min-h-0 min-w-0 overflow-visible!',
            'rounded-xl border border-dashed bg-background/75 backdrop-blur-sm backdrop-brightness-95',
        )"
    >
        <div
            :class="cn(
                'absolute -top-3 -right-2.5 z-[60]',
                'bg-destructive/50 text-destructive',
                'border rounded-full',
                'cursor-pointer',
            )" @click="reset"
        >
            <Icon class="size-6" name="material-symbols:close-rounded" />
        </div>
        <div class="relative h-full overflow-auto p-4">
            <component
                :is="component"
                :think="chatThinking"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ChatDetailAgentMessage,
    ChatDetailAnswer,
    ChatDetailCustomToolCall,
    ChatDetailEmpty,
    ChatDetailFunctionCall,
    ChatDetailQuestion,
    ChatDetailWebSearchCall,
} from '#components'
import { useChatDetail } from '~/components/chat'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'ChatThinkingDetailResizablePanel',
})

const { chats, chatIndex, thinkIndex, thinkingType, reset } = useChatDetail()

const componentMap = {
    agent_message: ChatDetailAgentMessage,
    function_call: ChatDetailFunctionCall,
    custom_tool_call: ChatDetailCustomToolCall,
    question: ChatDetailQuestion,
    answer: ChatDetailAnswer,
    web_search_call: ChatDetailWebSearchCall,
} as Partial<Record<CodexPayloadType, Component>>

const component = computed(() => componentMap[thinkingType.value as CodexPayloadType] ?? ChatDetailEmpty)

const chatList = computed(() => chats.value[chatIndex.value]!)

const chatThinking = computed(() => chatList.value.thinking[thinkIndex.value]!)
</script>
