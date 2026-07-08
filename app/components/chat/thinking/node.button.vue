<template>
    <div class="relative flex flex-col pl-4 pt-4">
        <VerticalLine />
        <div class="flex w-max max-w-full items-center gap-2">
            <div :class="containerClass">
                <Button
                    :class="buttonClass"
                    size="sm"
                    @click="handleClick"
                >
                    <Icon class="size-3 shrink-0" :name="icon" />
                    <div class="flex min-w-0 items-center gap-2 text-mono">
                        <span :class="labelClass">{{ label }}</span>
                        <span v-if="summary" class="max-w-[52rem] truncate text-muted-foreground">
                            {{ summary }}
                        </span>
                    </div>
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ThinkingDetailType } from '#shared/constant/codex.type'
import { useChatDetail } from '~/components/chat'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'ChatThinkingNodeButton',
})

const props = withDefaults(defineProps<{
    icon: string
    label: string
    summary?: string
    tone?: 'default' | 'reasoning' | 'error' | 'tool' | 'shell' | 'image'
    detailType?: ThinkingDetailType
    index?: number
    chatIndex?: number
}>(), {
    summary: '',
    tone: 'default',
    detailType: undefined,
    index: undefined,
    chatIndex: undefined,
})

const { handleThinkingNode } = useChatDetail()

const containerClass = computed(() => cn(
    'overflow-hidden rounded-full border border-dashed bg-white',
    props.detailType ? 'cursor-pointer' : '',
    props.tone === 'reasoning' && 'border-yellow-500/50 bg-yellow-100',
    props.tone === 'error' && 'border-destructive/50 bg-destructive/10',
    props.tone === 'tool' && 'border-sky-500/40',
    props.tone === 'shell' && 'border-zinc-500/40',
    props.tone === 'image' && 'border-fuchsia-500/40',
))

const buttonClass = computed(() => cn(
    'bg-transparent text-xs hover:bg-transparent',
    props.tone === 'reasoning' ? 'text-yellow-600/75' : 'text-secondary-foreground',
    props.tone === 'error' && 'text-destructive',
))

const labelClass = computed(() => cn(
    'capitalize',
    props.tone === 'default' && 'text-green-500',
    props.tone === 'tool' && 'text-sky-500',
    props.tone === 'shell' && 'text-zinc-700',
    props.tone === 'image' && 'text-fuchsia-600',
    props.tone === 'error' && 'text-destructive',
))

function handleClick() {
    if (props.detailType === undefined || props.index === undefined || props.chatIndex === undefined) {
        return
    }

    handleThinkingNode(props.chatIndex, props.index, props.detailType)
}
</script>
