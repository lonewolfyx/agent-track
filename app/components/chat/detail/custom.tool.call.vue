<template>
    <Accordion
        class="relative w-full"
        collapsible
        default-value="tool-call"
        type="single"
    >
        <!--        <div class="absolute bottom-0 left-2.5 top-0 w-px bg-border z-10" /> -->
        <AccordionItem class="ml-1 border-0 z-20" value="tool-call">
            <AccordionTrigger
                :class="cn(
                    'items-center justify-start hover:no-underline',
                    '[&>svg]:ml-auto capitalize',
                )"
            >
                <Icon name="material-symbols-light:step" class="bg-white text-slate-500 size-6" mode="css" />
                <div class="flex items-center gap-1">
                    <span>custom tool call</span>
                    <span class="text-green-500">{{ think!.call?.name }}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <CodePreview>{{ (think!.call as CodexResponseCustomToolCall).input }}</CodePreview>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem class="ml-1 border-0 z-20" value="tool-call-event">
            <AccordionTrigger
                :class="cn(
                    'items-center justify-start hover:no-underline',
                    '[&>svg]:ml-auto capitalize',
                )"
            >
                <Icon name="simple-icons:runkit" class="bg-white text-slate-500 size-6" mode="css" />
                <div class="flex items-center gap-1">
                    <span>custom tool call event</span>
                </div>
            </AccordionTrigger>
            <AccordionContent class="space-y-2">
                <div
                    v-for="(item, index) in think!.output!.event!.changes"
                    :key="index"
                    class="rounded-md border bg-muted/50"
                >
                    <div class="flex items-center border-b border-muted/50 px-3 py-1.5 gap-2">
                        <span class="font-mono text-xs text-green-500">{{ item.type }}</span>
                        <span class="font-mono text-xs text-zinc-500">{{ index }}</span>
                    </div>
                    <CodePreview class="">
                        {{ resolveContent(item) }}
                    </CodePreview>
                </div>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem class="ml-1 border-0 z-20" value="call-output">
            <AccordionTrigger
                :class="cn(
                    'items-center justify-start hover:no-underline',
                    '[&>svg]:ml-auto capitalize',
                )"
            >
                <Icon name="qlementine-icons:success-12" class="bg-white text-green-500 size-4" mode="css" />
                custom tool call output
            </AccordionTrigger>
            <AccordionContent>
                <CodePreview>{{ think!.output!.response?.output ?? '' }}</CodePreview>
            </AccordionContent>
        </AccordionItem>
    </Accordion>
</template>

<script lang="ts" setup>
import type { CodexPatchChange } from '#shared/types/event.msg'
import type { CodexResponseCustomToolCall } from '#shared/types/response.item'
import type { CodexSessionThinking } from '#shared/types/session'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'ChatDetailCustomToolCall',
})

defineProps<{
    think: CodexSessionThinking
}>()

function resolveContent(item: CodexPatchChange) {
    switch (item.type) {
        case 'update':
            return item.unified_diff
        default:
            return item.content
    }
}
</script>
