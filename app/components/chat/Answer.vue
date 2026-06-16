<template>
    <template v-if="answer">
        <Bezier class="transform -scale-x-100" />
        <Button
            :class="cn(
                'bg-white text-secondary-foreground hover:bg-white rounded-full border',
            )"
            @click="handleThinkingNode(chatIndex, index, ANSWER)"
        >
            <Icon name="ic:twotone-question-answer" class="size-4" />
            {{ truncateContent(answer, 50) }}
        </Button>
    </template>
</template>

<script setup lang="ts">
import { ANSWER } from '#shared/constant/codex.type'
import { useChatDetail } from '~/components/chat/index'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'ChatAnswer',
})

defineProps<{
    answer: string
    chatIndex: number
    index: number
}>()

const { handleThinkingNode } = useChatDetail()
</script>
