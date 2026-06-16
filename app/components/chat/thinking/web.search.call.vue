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
                    @click="handleThinkingNode(chatIndex, index, WEB_SEARCH_CALL)"
                >
                    <Icon class="size-3" name="material-symbols:search-rounded" />
                    <div class="flex items-center gap-2 text-mono">
                        <span class="text-green-500 capitalize">{{ think.type }}</span>
                        <span class="text-muted-foreground">
                            {{ think?.toolName || (think?.output?.event as CodexEventWebSearchEndPayload).query }}
                        </span>
                    </div>
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CodexEventWebSearchEndPayload } from '#shared/types/event.msg'
import { WEB_SEARCH_CALL } from '#shared/constant/codex.type'
import { useChatDetail } from '~/components/chat'

defineOptions({
    name: 'ChatThinkingWebSearchCall',
})

defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const { handleThinkingNode } = useChatDetail()
</script>
