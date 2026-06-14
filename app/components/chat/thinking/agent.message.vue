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
                    <Icon class="size-3" name="dinkie-icons:thinking-face" />
                    {{ payload.message }}
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'ChatThinkingAgentMessage',
})

defineProps<{
    payload: CodexSessionPayload<'event_msg', 'agent_message'>
}>()
</script>
