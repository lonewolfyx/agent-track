<template>
    <div class="relative flex flex-col pl-4 pt-4">
        <VerticalLine />
        <div class="flex w-max items-center gap-2">
            <div
                class="border border-dashed rounded-full bg-white overflow-hidden cursor-pointer"
            >
                <Button
                    class="bg-transparent hover:bg-transparent text-secondary-foreground text-xs"
                    size="sm"
                    @click="handleThinkingNode(chatIndex, index, CUSTOM_TOOL_CALL)"
                >
                    <Icon class="size-3" name="flowbite:tools-outline" />
                    <div class="flex items-center gap-2">
                        <span class="text-sky-500 capitalize">custom tool call</span>
                        <span class="text-muted-foreground">{{ truncateContent(think.toolName!) }}</span>
                    </div>
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { CUSTOM_TOOL_CALL } from '#shared/constant/codex.type'
import { useChatDetail } from '~/components/chat'

defineOptions({
    name: 'ChatThinkingCustomToolCall',
})

defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const { handleThinkingNode } = useChatDetail()
</script>
