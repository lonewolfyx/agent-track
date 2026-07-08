<template>
    <div v-if="content" class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">{{ title }}</span>
        </div>
        <CodePreview>{{ content }}</CodePreview>
    </div>
</template>

<script setup lang="ts">
import { formatUnknown } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatDetailPayloadSection',
})

const props = defineProps<{
    title: string
    value?: unknown
}>()

const content = computed(() => formatUnknown(props.value))
</script>
