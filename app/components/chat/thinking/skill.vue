<template>
    <div class="relative flex flex-col pl-4 pt-2">
        <VerticalLine />
        <div class="flex w-max items-center gap-2">
            <div
                class="border border-dashed rounded-full bg-white overflow-hidden cursor-pointer"
            >
                <Button
                    class="bg-transparent hover:bg-transparent text-secondary-foreground capitalize"
                    size="sm"
                >
                    <Icon class="size-3" name="material-symbols:hexagon-outline" />
                    Skill
                </Button>
            </div>

            <div class="flex gap-2 text-xs font-mono">
                <span class="text-muted-foreground capitalize">used:</span>
                <span class="text-red-500">{{ skill }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'ChatThinkingSkill',
})

defineProps<{
    skill: string
}>()
</script>
