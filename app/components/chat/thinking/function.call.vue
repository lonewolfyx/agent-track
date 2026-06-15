<template>
    <ChatThinkingSkill
        v-if="Object.keys(think).includes('skill')"
        :skill="think.skill!"
    />
    <template v-else>
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
                        <Icon class="size-3" name="carbon:function-2" />
                        <div class="flex items-center gap-2 text-mono">
                            <span class="text-green-500 capitalize">{{ think.toolName }}</span>
                            <span class="text-muted-foreground">{{ JSON.parse(think.call?.arguments!)?.cmd }}</span>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    </template>
</template>

<script lang="ts" setup>
import type { CodexSessionThinking } from '#shared/types/session'

defineOptions({
    name: 'ChatThinkingFunctionCall',
})

defineProps<{
    think: CodexSessionThinking
}>()
</script>
