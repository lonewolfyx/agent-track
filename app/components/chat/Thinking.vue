<template>
    <TooltipProvider>
        <div class="relative flex flex-col pl-6 pt-4">
            <VerticalLine />
            <Collapsible class="group/collapsible" default-open>
                <ChatQuestion :question="chat.question" />
                <CollapsibleContent>
                    <Bezier />

                    <div class="ml-0">
                        <div class="relative">
                            <component
                                :is="componentMap[think.type] ?? ChatThinkingEmpty"
                                v-for="(think, index) in chat.thinking"
                                :key="think.type"
                                :chat-index="idx"
                                :index
                                :think
                                :payload="think.content as CodexEventAgentMessagePayload"
                                :token="(think?.content as CodexEventTokenCountPayload)?.info?.total_token_usage as CodexTokenUsage"
                                :type="think.type"
                            />
                        </div>
                    </div>

                    <ChatAnswer :answer="chat.answer" />
                </CollapsibleContent>
            </Collapsible>
        </div>
    </TooltipProvider>
</template>

<script lang="ts" setup>
import {
    ChatThinkingAgentMessage,
    ChatThinkingCustomToolCall,
    ChatThinkingEmpty,
    ChatThinkingFunctionCall,
    ChatThinkingReasoning,
    ChatTokenCount,
} from '#components'

defineOptions({
    name: 'ChatThinking',
})

defineProps<{
    chat: ChatTurnList
    idx: number
}>()

const componentMap = {
    reasoning: ChatThinkingReasoning,
    agent_message: ChatThinkingAgentMessage,
    function_call: ChatThinkingFunctionCall,
    custom_tool_call: ChatThinkingCustomToolCall,
    token_count: ChatTokenCount,
} as Partial<Record<CodexPayloadType, Component>>
</script>
