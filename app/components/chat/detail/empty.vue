<template>
    <div class="relative flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
        {{ think.type }} need pr report
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'ChatDetailEmpty',
})

defineProps<{
    think: CodexSessionThinking
}>()
</script>
