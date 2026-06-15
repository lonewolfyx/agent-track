<template>
    <template v-if="answer">
        <Bezier class="transform -scale-x-100" />
        <Button
            :class="cn(
                'bg-white text-secondary-foreground hover:bg-white rounded-full border',
            )"
        >
            <Icon name="ic:twotone-question-answer" class="size-4" />
            {{ truncateContent(answer, 50) }}
        </Button>
    </template>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'

defineOptions({
    name: 'ChatAnswer',
})

defineProps<{
    answer: string
}>()
</script>
