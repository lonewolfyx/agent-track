<template>
    <div class="relative">
        <div class="absolute left-6 top-5 z-10">
            <span
                class="block size-2.5 rounded-full border-2 border-card bg-blue-500"
            />
        </div>
        <div
            :class="cn(
                'relative flex items-start w-full gap-3',
                'px-4 py-2.5 pl-12',
                'text-left cursor-pointer transition-colors',
                'hover:bg-gray-500/10 rounded-xl',
            )"
            @click="handleDrawerShower({
                id: session.id,
                title: session.title,
            })"
        >
            <div class="min-w-0 flex-1">
                <Badge
                    class="bg-blue-500/10 text-secondary-foreground dark:bg-blue-600"
                    variant="secondary"
                >
                    <Icon class="size-3" name="lucide:id-card" />
                    {{ session.id }}
                </Badge>
                <p class="my-1 text-sm leading-relaxed">
                    {{ session.title }}
                </p>
                <div class="flex items-center gap-5">
                    <div class="flex items-center gap-1 text-muted-foreground">
                        <Icon class="size-2.5" name="lucide:clock" />
                        <span class="font-mono text-xs">{{
                            dayjs(session.createTime).format('YYYY-MM-DD HH:mm:ss')
                        }}</span>
                    </div>
                    <div v-if="session.model.length" class="flex items-center gap-1 text-amber-500">
                        <Icon class="size-2.5" name="lucide:bot" />
                        <span
                            v-for="model in session.model"
                            :key="model.model"
                            class="font-mono text-xs flex gap-1 capitalize"
                        >
                            <span>{{ model.model }}</span>
                            <span>·</span>
                            <span>{{ model.effort }}</span>
                        </span>
                    </div>
                    <div v-if="session.call" class="flex items-center gap-1 text-red-500">
                        <Icon class="size-2.5" name="lucide:clock" />
                        <span class="font-mono text-xs">{{ session.call }} call</span>
                    </div>
                    <div v-if="session.skills" class="flex items-center gap-1 text-emerald-600">
                        <Icon class="size-2.5" name="material-symbols:hexagon-rounded" />
                        <span class="font-mono text-xs">{{ session.skills }} skills</span>
                    </div>
                    <div class="flex-1" />
                    <div class="flex items-center gap-1 text-muted-foreground">
                        <Icon class="size-2" name="lucide:message-circle-question-mark" />
                        <span class="font-mono text-xs">{{ session.prompt }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { CodexSessionListItem } from '#shared/types/session'
import dayjs from 'dayjs'
import { handleDrawerShower } from '~/components/session/index'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'SessionTimeLineItem',
})

defineProps<{
    session: CodexSessionListItem
}>()
</script>
