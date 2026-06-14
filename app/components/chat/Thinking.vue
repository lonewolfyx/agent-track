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
                            <div class="relative flex flex-col pl-4 pt-2 hidden">
                                <VerticalLine />
                                <div class="flex w-max items-center gap-2">
                                    <div
                                        class="border border-dashed rounded-full bg-white overflow-hidden cursor-pointer"
                                    >
                                        <Button
                                            class="bg-transparent hover:bg-transparent text-secondary-foreground capitalize"
                                            size="sm"
                                        >
                                            <Icon class="size-3" name="flowbite:tools-outline" />
                                            Tools Call
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div class="relative flex flex-col pl-4 pt-2 hidden">
                                <VerticalLine />
                                <div class="flex w-max items-center gap-2">
                                    <div
                                        class="border border-dashed rounded-full bg-white overflow-hidden cursor-pointer"
                                    >
                                        <Button
                                            class="bg-transparent hover:bg-transparent text-secondary-foreground capitalize"
                                            size="sm"
                                        >
                                            <Icon class="size-3" name="carbon:function-2" />
                                            Function Call
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <template
                                v-for="think in chat.thinking"
                                :key="think.type"
                            >
                                <ChatThinkingReasoning v-if="think.type === 'reasoning'" />
                                <ChatThinkingAgentMessage
                                    v-if="think.type === 'agent_message'"
                                    :payload="think.content as CodexEventAgentMessagePayload"
                                />
                                <ChatThinkingSkill
                                    v-if="think.type === 'function_call' && Object.keys(think).includes('skill')"
                                    :skill="think.skill!"
                                />
                                <ChatTokenCount
                                    v-if="think.type === 'token_count'"
                                    :token="(think?.content as CodexEventTokenCountPayload)?.info?.total_token_usage as CodexTokenUsage"
                                />
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
import type { CodexEventAgentMessagePayload, CodexEventTokenCountPayload, CodexTokenUsage } from '#shared/types/event.msg'
import type { ChatTurnList } from '#shared/types/session'

defineOptions({
    name: 'ChatThinking',
})

defineProps<{
    chat: ChatTurnList
}>()
</script>
