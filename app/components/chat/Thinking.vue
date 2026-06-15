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
                                v-bind="resolveProps(think, index)"
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
import type { CodexSessionThinking } from '#shared/types/session'
import {
    ChatThinkingAgentMessage,
    ChatThinkingCustomToolCall,
    ChatThinkingEmpty,
    ChatThinkingFunctionCall,
    ChatThinkingReasoning,
    ChatThinkingTurnAborted,
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
    agent_message: ChatThinkingAgentMessage,
    function_call: ChatThinkingFunctionCall,
    custom_tool_call: ChatThinkingCustomToolCall,
    token_count: ChatTokenCount,
    turn_aborted: ChatThinkingTurnAborted,
} as Partial<Record<CodexPayloadType, Component>>

function resolveProps(think: CodexSessionThinking, index: number) {
    switch (think.type) {
        case 'agent_message':
            return {
                index,
                payload: think.content as CodexEventAgentMessagePayload,
                chatIndex: props.idx,
            }
        case 'token_count':
            return {
                token: (think?.content as CodexEventTokenCountPayload)?.info?.total_token_usage as CodexTokenUsage,
            }
        default:
            return {
                think,
            }
    }
}
</script>
