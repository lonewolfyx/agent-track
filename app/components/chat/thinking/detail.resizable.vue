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
                with-handle
                :class="cn(
                    'pointer-events-auto relative hidden',
                    'bg-transparent p-0',
                    'after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2 sm:flex sm:w-3',
                )"
                @dragging="isResizing = $event"
            >
                <div class="z-10 flex h-10 w-1 items-center justify-center rounded-full bg-background" />
            </ResizableHandle>

            <ResizablePanel
                :default-size="55"
                :min-size="20"
                :max-size="90"
                as-child
            >
                <aside class="pointer-events-auto relative h-full min-h-0 min-w-0 overflow-hidden rounded-xl border bg-background">
                    <!--                    <div -->
                    <!--                        :class="cn( -->
                    <!--                            'absolute inset-0', -->
                    <!--                            '[background-size:_theme(text.base)__theme(text.base)]', -->
                    <!--                            '[background-image:radial-gradient(_theme(colors.gray.300)_1px,transparent_1px)]', -->
                    <!--                        )" -->
                    <!--                    /> -->

                    <div class="relative flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                        Main resizable workspace
                    </div>
                </aside>
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
</template>

<script setup lang="ts">
import { useChatDetail } from '~/components/chat'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'ChatThinkingDetailResizable',
})

const isResizing = ref(false)

const { status } = useChatDetail()
</script>
