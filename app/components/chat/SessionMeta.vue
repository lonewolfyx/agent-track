<template>
    <div class="relative">
        <div class="flex items-center gap-2 text-sm">
            <span
                :class="cn(
                    'px-3 py-1 rounded-full',
                    'bg-white/90 text-blue-500',
                    'border border-dashed border-blue-500 capitalize',
                )"
            >
                session meta
            </span>
            <Badge variant="secondary" class="border border-input border-dashed text-muted-foreground">
                <Icon name="icon-park-outline:time" class="size-3" />
                {{ dayjs(startedAt).format('YYYY-MM-DD HH:mm:ss') }}
            </Badge>
        </div>
        <div class="pl-10 w-px h-4 border-r border-dashed" />
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'ChatSessionMeta',
})

defineProps<{
    startedAt: string
}>()
</script>
