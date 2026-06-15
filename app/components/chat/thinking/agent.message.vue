<template>
    <div class="relative flex flex-col pl-4 pt-2">
        <VerticalLine />
        <div class="flex w-max items-center gap-2">
            <div
                class="border border-dashed rounded-full bg-white overflow-hidden cursor-pointer"
            >
                <Button
                    class="bg-transparent hover:bg-transparent text-secondary-foreground capitalize"
                    size="sm"
                    @click="handleThinkingNode(chatIndex, index, AGENT_MESSAGE)"
                >
                    <Icon class="size-3" name="dinkie-icons:thinking-face" />
                    {{ truncateContent(payload.message, 50) }}
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { AGENT_MESSAGE } from '#shared/constant/codex.type'
import { useChatDetail } from '~/components/chat'

defineOptions({
    name: 'ChatThinkingAgentMessage',
})

defineProps<{
    payload: CodexSessionPayload<'event_msg', 'agent_message'>
    index: number
    chatIndex: number
}>()

const { handleThinkingNode } = useChatDetail()
</script>
