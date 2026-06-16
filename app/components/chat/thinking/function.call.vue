<template>
    <ChatThinkingSkill
        v-if="Object.keys(think).includes('skill')"
        :skill="think.skill!"
    />
    <template v-else>
        <div class="relative flex flex-col pl-4 pt-4">
            <VerticalLine />
            <div class="flex w-max items-center gap-2">
                <div
                    class="border border-dashed rounded-full bg-white overflow-hidden cursor-pointer"
                >
                    <Button
                        class="bg-transparent hover:bg-transparent text-secondary-foreground text-xs"
                        size="sm"
                        @click="handleThinkingNode(chatIndex, index, FUNCTION_CALL)"
                    >
                        <Icon class="size-3" name="carbon:function-2" />
                        <div class="flex items-center gap-2 text-mono">
                            <span class="text-green-500 capitalize">{{ think.toolName }}</span>
                            <span class="text-muted-foreground">{{
                                truncateContent(resolveFunctionCallToolArguments(think.call as CodexResponseFunctionCall), 100)
                            }}</span>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    </template>
</template>

<script lang="ts" setup>
import type { CodexResponseFunctionCall } from '#shared/types/function.call'
import type { CodexSessionThinking } from '#shared/types/session'
import { resolveFunctionCallToolArguments } from '#server/utils/resolve.function'
import { FUNCTION_CALL } from '#shared/constant/codex.type'
import { useChatDetail } from '~/components/chat'

defineOptions({
    name: 'ChatThinkingFunctionCall',
})

defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const { handleThinkingNode } = useChatDetail()
</script>
