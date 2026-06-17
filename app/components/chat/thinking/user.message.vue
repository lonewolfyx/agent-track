<template>
    <div class="relative flex flex-col pl-4 pt-4">
        <VerticalLine />
        <div class="flex w-max items-center gap-2">
            <div
                class="border border-dashed rounded-full bg-white overflow-hidden cursor-pointer"
            >
                <Button
                    class="bg-transparent hover:bg-transparent text-secondary-foreground capitalize"
                    size="sm"
                    @click="handleThinkingNode(chatIndex, index, USER_MESSAGE)"
                >
                    <Icon class="size-3" name="pixel:comment" />
                    <div class="flex items-center gap-2 text-mono">
                        <span class="text-green-500 capitalize">Quote:</span>
                        <span class="text-muted-foreground">
                            {{ think.pairedPayload?.content.find(i => i.type === 'input_text')?.text ?? '' }}
                        </span>
                    </div>
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CodexSessionThinking } from '#shared/types/session'
import { USER_MESSAGE } from '#shared/constant/codex.type'
import { useChatDetail } from '~/components/chat'

defineOptions({
    name: 'ChatThinkingUserMessage',
})

defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const { handleThinkingNode } = useChatDetail()
</script>
