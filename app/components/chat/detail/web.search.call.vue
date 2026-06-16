<template>
    <SessionTimeLine>
        <SessionTimeLineGroup>
            <SessionTimeLineList>
                <!-- -->
                <div v-if="Object.keys(call).length" class="relative">
                    <div class="absolute left-6 top-5 z-10">
                        <span
                            class="block size-2.5 rounded-full border-2 border-card bg-blue-500"
                        />
                    </div>
                    <div
                        :class="cn(
                            'relative flex items-start w-full gap-3',
                            'px-4 py-2.5 pl-12',
                            'text-left transition-colors',
                        )"
                    >
                        <div class="min-w-0 flex-1">
                            <Badge>{{ call.type }}</Badge>

                            <template v-if="call.action?.type === 'search'">
                                <p
                                    v-for="query in call.action?.queries!"
                                    :key="query"
                                    class="my-1 text-sm leading-relaxed"
                                >
                                    {{ query }}
                                </p>
                            </template>
                            <template v-else-if="['open_page', 'find_in_page'].includes(call.action?.type!)">
                                <p class="my-1 text-sm leading-relaxed">
                                    {{ call.action?.type }}
                                </p>
                            </template>
                        </div>
                    </div>
                </div>
                <!-- -->
                <div v-if="event" class="relative">
                    <div class="absolute left-6 top-5 z-10">
                        <span
                            class="block size-2.5 rounded-full border-2 border-card bg-blue-500"
                        />
                    </div>
                    <div
                        :class="cn(
                            'relative flex items-start w-full gap-3',
                            'px-4 py-2.5 pl-12',
                            'text-left transition-colors',
                        )"
                    >
                        <div class="min-w-0 flex-1">
                            <Badge>{{ event.type }}</Badge>

                            <template v-if="event.action.type === 'search'">
                                <p
                                    v-for="query in event.action?.queries!"
                                    :key="query"
                                    class="my-1 text-sm leading-relaxed"
                                >
                                    {{ query }}
                                </p>
                            </template>
                            <template v-else-if="['open_page', 'find_in_page'].includes(event.action?.type!)">
                                <p class="my-1 text-sm leading-relaxed">
                                    {{ event.action?.url ?? '' }}
                                </p>
                            </template>
                        </div>
                    </div>
                </div>
                <!-- -->
            </SessionTimeLineList>
        </SessionTimeLineGroup>
    </SessionTimeLine>
</template>

<script setup lang="ts">
import type { CodexEventWebSearchEndPayload, CodexWebSearchAction } from '#shared/types/event.msg'
import type { CodexResponseWebSearchCall } from '#shared/types/response.item'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'ChatDetailWebSearchCall',
})

const props = defineProps<{
    think: CodexSessionThinking
}>()

const call = computed(() => props.think?.call as CodexResponseWebSearchCall ?? {})
const event = computed(() => props.think?.output?.event as CodexEventWebSearchEndPayload)

function resolveSearchCall(call: CodexWebSearchAction) {
    switch (call.type) {
        case 'search':
            return call.query
        case 'open_page':
        case 'find_in_page':
            return call.url
        default:
            return ''
    }
}
</script>
