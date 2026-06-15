<template>
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
</template>

<script lang="ts" setup>
defineOptions({
    name: 'ChatQuestion',
})

defineProps<{
    question: string
}>()

function handleClick() {

}
</script>
