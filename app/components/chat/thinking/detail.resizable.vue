<template>
    <div
        v-if="status"
        class="pointer-events-none fixed bottom-4 right-4 z-50 h-[calc(100vh-(var(--spacing)*58))] w-[calc(100%-var(--spacing)*8)]"
    >
        <ResizablePanelGroup
            auto-save-id="session-detail-layout"
            class="h-full w-full overflow-visible"
            direction="horizontal"
        >
            <ResizablePanel
                :default-size="45"
                :min-size="10"
                as-child
            >
                <div class="pointer-events-none h-full min-h-0 min-w-0 bg-transparent" />
            </ResizablePanel>

            <ResizableHandle
                id="block-resizable-handle"
                :class="cn(
                    'pointer-events-auto relative hidden',
                    'bg-transparent p-0',
                    'after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2 sm:flex sm:w-3',
                )"
                with-handle
                @dragging="isResizing = $event"
            >
                <div class="z-10 flex h-10 w-1 items-center justify-center rounded-full bg-background" />
            </ResizableHandle>

            <ResizablePanel
                :default-size="55"
                :max-size="90"
                :min-size="20"
                as-child
            >
                <aside
                    :class="cn(
                        'pointer-events-auto relative',
                        'h-full min-h-0 min-w-0 overflow-hidden',
                        'rounded-xl border border-dashed bg-background/75 backdrop-blur-sm backdrop-brightness-95',
                    )"
                >
                    <div class="relative h-full overflow-auto p-4">
                        <component
                            :is="component"
                            :think="chatThinking"
                        />
                    </div>
                </aside>
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
</template>

<script lang="ts" setup>
import { ChatDetailAgentMessage, ChatDetailEmpty } from '#components'
import { useChatDetail } from '~/components/chat'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'ChatThinkingDetailResizable',
})

const isResizing = ref(false)

const { status, chats, chatIndex, thinkIndex, thinkingType } = useChatDetail()

const componentMap = {
    agent_message: ChatDetailAgentMessage,
} as Partial<Record<CodexPayloadType, Component>>

const component = computed(() => componentMap[thinkingType.value as CodexPayloadType] ?? ChatDetailEmpty)

const chatList = computed(() => chats.value[chatIndex.value]!)

const chatThinking = computed(() => chatList.value.thinking[thinkIndex.value]!)
</script>
