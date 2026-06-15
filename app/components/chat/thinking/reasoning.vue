<template>
    <div class="relative flex flex-col pl-4 pt-4">
        <VerticalLine />
        <div class="flex w-max items-center gap-2">
            <div
                class="border border-dashed border-yellow-500/50 rounded-full bg-yellow-100 overflow-hidden cursor-pointer"
            >
                <Button
                    class="bg-transparent hover:bg-transparent text-yellow-600/75 capitalize"
                    size="sm"
                >
                    <Icon class="size-3" name="icon-park-twotone:brain" />
                    reasoning
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'ChatThinkingReasoning',
})
</script>
