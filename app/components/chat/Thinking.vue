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
                            <template
                                v-for="think in chat.thinking"
                                :key="think.type"
                            >
                                <ChatThinkingReasoning v-if="think.type === 'reasoning'" />

                                <ChatThinkingAgentMessage
                                    v-else-if="think.type === 'agent_message'"
                                    :payload="think.content as CodexEventAgentMessagePayload"
                                />

                                <ChatThinkingFunctionCall
                                    v-else-if="think.type === 'function_call'" :think
                                />

                                <ChatThinkingCustomToolCall
                                    v-else-if="think.type === 'custom_tool_call'" :think
                                />

                                <ChatTokenCount
                                    v-else-if="think.type === 'token_count'"
                                    :token="(think?.content as CodexEventTokenCountPayload)?.info?.total_token_usage as CodexTokenUsage"
                                />
                                <template v-else>
                                    {{ think.type }} need pr report
                                </template>
                            </template>
                        </div>
                    </div>

                    <ChatAnswer :answer="chat.answer" />
                </CollapsibleContent>
            </Collapsible>
        </div>
    </TooltipProvider>
</template>

<script lang="ts" setup>
defineOptions({
    name: 'ChatThinking',
})

defineProps<{
    chat: ChatTurnList
}>()
</script>
