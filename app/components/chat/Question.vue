<template>
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger as-child>
                <Button
                    class="bg-white text-secondary-foreground hover:bg-white rounded-full border"
                >
                    <Icon name="arcticons:ask-ai" class="size-4" />
                    {{ question.length > 10 ? `${question.substring(0, 20)}...` : question }}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                {{ question }}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>

<script setup lang="ts">
defineOptions({
    name: 'ChatQuestion',
})

defineProps<{
    question: string
}>()
</script>
