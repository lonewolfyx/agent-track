<template>
    <div class="relative flex flex-col pl-10 pt-4">
        <VerticalLine />
        <div class="flex items-center gap-2 relative border-l border-input">
            <div class="size-2 border-4 border-destructive rounded-full -ml-1 -translate-x-[0.5px]" />
            <div class="flex items-center gap-2 text-xs">
                <span class="text-muted-foreground font-mono capitalize">Actively aborted the request</span>
            </div>
        </div>
    </div>
    <Bezier class="transform -scale-x-100" />
</template>

<script setup lang="ts">
defineOptions({
    name: 'ChatThinkingTurnAborted',
})

defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()
</script>
