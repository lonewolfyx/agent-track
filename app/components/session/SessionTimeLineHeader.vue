<template>
    <div class="relative flex items-center gap-3 px-4 py-3">
        <div
            :class="cn(
                'relative z-10',
                'flex items-center justify-center size-6',
                'rounded-full border bg-card',
            )"
        >
            <Icon name="lucide:clock-4" class="size-3 text-muted-foreground" />
        </div>
        <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
                <span class="font-medium text-sm">{{ date }}</span>
            </div>
        </div>
        <div class="flex shrink-0 font-mono text-muted-foreground text-xs gap-2">
            <span class="text-red-500">{{ sessions }}</span>
            <span>sessions</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { cn } from '~/lib/utils'

defineOptions({
    name: 'SessionTimeLineHeader',
})

defineProps<{
    date: string
    sessions: number | string
}>()
</script>
