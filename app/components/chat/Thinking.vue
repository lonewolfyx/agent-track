<template>
    <TooltipProvider>
        <div class="relative flex flex-col pl-6 pt-2">
            <VerticalLine />
            <Collapsible class="group/collapsible" default-open>
                <ChatQuestion
                    :question="chat.question"
                    :index="idx"
                    :chat-index="idx"
                />
                <CollapsibleContent>
                    <Bezier />

                    <div class="ml-0">
                        <div class="relative">
                            <component
                                :is="componentMap[think.type]"
                                v-for="(think, index) in chat.thinking"
                                :key="`${think.type}-${index}`"
                                v-bind="resolveProps(think, index)"
                            />
                        </div>
                    </div>

                    <ChatAnswer
                        :answer="chat.answer"
                        :index="idx"
                        :chat-index="idx"
                    />
                </CollapsibleContent>
            </Collapsible>
        </div>
    </TooltipProvider>
</template>

<script lang="ts" setup>
import type { Component } from 'vue'
import type { ThinkingTimelineType } from '#shared/constant/codex.type'
import {
    ChatThinkingAgentMessage,
    ChatThinkingCustomToolCall,
    ChatThinkingDynamicToolCall,
    ChatThinkingError,
    ChatThinkingFunctionCall,
    ChatThinkingImageGenerationCall,
    ChatThinkingLocalShellCall,
    ChatThinkingMcpToolCall,
    ChatThinkingReasoning,
    ChatThinkingToolSearchCall,
    ChatThinkingTurnAborted,
    ChatThinkingUserMessage,
    ChatThinkingWebSearchCall,
    ChatTokenCount,
} from '#components'

defineOptions({
    name: 'ChatThinking',
})

const props = defineProps<{
    chat: ChatTurnList
    idx: number
}>()

const componentMap = {
    reasoning: ChatThinkingReasoning,
    agent_reasoning: ChatThinkingReasoning,
    agent_message: ChatThinkingAgentMessage,
    function_call: ChatThinkingFunctionCall,
    custom_tool_call: ChatThinkingCustomToolCall,
    tool_search_call: ChatThinkingToolSearchCall,
    mcp_tool_call: ChatThinkingMcpToolCall,
    dynamic_tool_call_request: ChatThinkingDynamicToolCall,
    image_generation_call: ChatThinkingImageGenerationCall,
    local_shell_call: ChatThinkingLocalShellCall,
    token_count: ChatTokenCount,
    turn_aborted: ChatThinkingTurnAborted,
    web_search_call: ChatThinkingWebSearchCall,
    user_message: ChatThinkingUserMessage,
    error: ChatThinkingError,
} satisfies Record<ThinkingTimelineType, Component>

function resolveProps(think: CodexSessionThinking, index: number) {
    switch (think.type) {
        case 'token_count':
            return {
                think,
                index,
                chatIndex: props.idx,
                token: (think?.content as CodexEventTokenCountPayload)?.info?.total_token_usage as CodexTokenUsage,
            }
        default:
            return {
                think,
                index,
                chatIndex: props.idx,
            }
    }
}
</script>
