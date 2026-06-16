<template>
    <div class="flex items-center gap-2">
        <Tooltip>
            <TooltipTrigger as-child>
                <CollapsibleTrigger as-child>
                    <Button
                        class="bg-white text-secondary-foreground hover:bg-white rounded-full border"
                    >
                        <Icon class="size-4" name="arcticons:ask-ai" />
                        {{ truncateContent(question, 50) }}
                    </Button>
                </CollapsibleTrigger>
            </tooltiptrigger>
            <TooltipContent side="bottom">
                {{ question }}
            </TooltipContent>
        </tooltip>
        <Button
            :class="cn(
                'font-mono cursor-pointer rounded-full',
                'bg-transparent hover:bg-secondary text-muted-foreground',
                'text-xs capitalize',
            )"
            size="sm"
            @click="handleThinkingNode(chatIndex, index, QUESTION)"
        >
            read more+
        </Button>
    </div>
</template>

<script lang="ts" setup>
import { QUESTION } from '#shared/constant/codex.type'
import { useChatDetail } from '~/components/chat/index'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'ChatQuestion',
})

defineProps<{
    index: number
    chatIndex: number
    question: string
}>()

const { handleThinkingNode } = useChatDetail()
</script>
