<template>
    <div class="flex min-h-0 flex-1 overflow-hidden touch-pan-y select-text" data-vaul-no-drag>
        <DrawerHeader class="hidden">
            <DrawerTitle />
            <DrawerDescription />
        </DrawerHeader>

        <div class="relative z-30 h-full w-full overflow-hidden">
            <div class="h-full overflow-auto">
                <div v-if="hasSessionDetail" class="p-4">
                    <div class="select-none min-h-full min-w-full overflow-visible whitespace-nowrap">
                        <template
                            v-for="chat in sessionDetail"
                            :key="chat.id"
                        >
                            <ChatSessionMeta :started-at="chat.startedAt" />
                            <ChatTurnContext :turn-context="chat.turn_context as CodexTurnContextPayload" />
                            <ChatThinking :chat />
                            <ChatTokenCount :token="chat.total_token_usage as CodexTokenUsage" />
                        </template>
                    </div>
                </div>
                <div v-else class="flex h-full flex-col items-center justify-center gap-3">
                    <Icon name="mynaui:danger-hexagon" class="size-12 text-red-500" />
                    <span class="text-sm">Session Id: {{ id }}</span>
                    <span class="text-xl text-red-500/75">No session detail</span>
                </div>
            </div>
            <ChatThinkingDetailResizable />
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { CodexTokenUsage } from '#shared/types/event.msg'
import type { ChatTurnList, CodexSessionDetail } from '#shared/types/session'
import type { SessionQueryParam } from '#shared/types/session.query'
import type { CodexTurnContextPayload } from '#shared/types/turn.context'
import { useChatDetail } from '~/components/chat'

defineOptions({
    name: 'SessionDetail',
})

const props = defineProps<SessionQueryParam>()

const sessionDetail = ref<ChatTurnList[]>([])
const hasSessionDetail = computed(() => sessionDetail.value.length > 0)

const { chat } = useChatDetail()

watch(
    () => [props.id, props.path] as const,
    async ([id, path], _, onCleanup) => {
        const controller = new AbortController()
        onCleanup(() => controller.abort())

        const { data } = await useFetch<CodexSessionDetail>(`/api/sessions/${id}`, {
            query: { path },
            signal: controller.signal,
        })

        chat.value = sessionDetail.value = data.value?.chat.filter(item => item.question) ?? []
    },
    {
        immediate: true,
    },
)
</script>
