<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
                <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Input</span>
            </div>
            <pre class="whitespace-pre-wrap wrap-break-word rounded bg-muted/50 p-2 font-mono text-xs text-muted-foreground">{{ JSON.parse(think.call!.arguments) }}</pre>
        </div>
        <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
                <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">OutPut</span>
            </div>
            <pre class="whitespace-pre-wrap wrap-break-word rounded bg-muted/50 p-2 font-mono text-xs text-muted-foreground">{{ think.output!.response?.output }}</pre>
        </div>
    </div>
</template>

<script lang="ts" setup>
defineOptions({
    name: 'ChatDetailFunctionCall',
})

defineProps<{
    think: CodexSessionThinking
}>()
</script>
