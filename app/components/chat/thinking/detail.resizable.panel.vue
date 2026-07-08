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
                :think="chatThinking ?? emptyThinking"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { ThinkingDetailType } from '#shared/constant/codex.type'
import {
    ChatDetailAgentMessage,
    ChatDetailAnswer,
    ChatDetailCustomToolCall,
    ChatDetailDynamicToolCall,
    ChatDetailEmpty,
    ChatDetailError,
    ChatDetailFunctionCall,
    ChatDetailImageGenerationCall,
    ChatDetailLocalShellCall,
    ChatDetailMcpToolCall,
    ChatDetailQuestion,
    ChatDetailReasoning,
    ChatDetailTokenCount,
    ChatDetailToolSearchCall,
    ChatDetailTurnAborted,
    ChatDetailUserMessage,
    ChatDetailWebSearchCall,
} from '#components'
import { AGENT_MESSAGE } from '#shared/constant/codex.type'
import { useChatDetail } from '~/components/chat'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'ChatThinkingDetailResizablePanel',
})

const { chats, chatIndex, thinkIndex, thinkingType, reset } = useChatDetail()

const componentMap = {
    agent_message: ChatDetailAgentMessage,
    agent_reasoning: ChatDetailReasoning,
    function_call: ChatDetailFunctionCall,
    custom_tool_call: ChatDetailCustomToolCall,
    dynamic_tool_call_request: ChatDetailDynamicToolCall,
    error: ChatDetailError,
    image_generation_call: ChatDetailImageGenerationCall,
    local_shell_call: ChatDetailLocalShellCall,
    mcp_tool_call: ChatDetailMcpToolCall,
    question: ChatDetailQuestion,
    answer: ChatDetailAnswer,
    reasoning: ChatDetailReasoning,
    token_count: ChatDetailTokenCount,
    tool_search_call: ChatDetailToolSearchCall,
    turn_aborted: ChatDetailTurnAborted,
    web_search_call: ChatDetailWebSearchCall,
    user_message: ChatDetailUserMessage,
} satisfies Record<ThinkingDetailType, Component>

const component = computed(() => thinkingType.value ? componentMap[thinkingType.value] : ChatDetailEmpty)

const chatList = computed(() => chats.value?.[chatIndex.value])

const chatThinking = computed(() => chatList.value?.thinking[thinkIndex.value])

const emptyThinking = {
    type: AGENT_MESSAGE,
    timestamp: '',
} satisfies CodexSessionThinking
</script>
