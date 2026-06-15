<template>
    <div class="relative flex flex-col pl-4 pt-2">
        <VerticalLine />
        <div class="flex w-max items-center gap-2">
            <div
                class="border border-dashed rounded-full bg-white overflow-hidden cursor-pointer"
            >
                <Button
                    class="bg-transparent hover:bg-transparent text-secondary-foreground text-xs"
                    size="sm"
                >
                    <Icon class="size-3" name="flowbite:tools-outline" />
                    <div class="flex items-center gap-2">
                        <span class="text-sky-500 capitalize">custom tool call</span>
                        <span class="text-muted-foreground">{{ think.toolName }}</span>
                    </div>
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'ChatThinkingCustomToolCall',
})

defineProps<{
    think: CodexSessionThinking
}>()
</script>
