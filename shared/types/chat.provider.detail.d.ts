import type { Ref, ShallowRef } from 'vue'
import type { ThinkingDetailType } from '#shared/constant/codex.type'
import type { ChatTurnList } from '#shared/types/session'

export interface ChatProviderDetail {
    chatIndex: Ref<number>
    thinkIndex: Ref<number>
    status: Ref<boolean>
    thinkingType: Ref<ThinkingDetailType | ''>
    handleThinkingNode: (chatIdx: number, thinkIdx: number, type: ThinkingDetailType) => void
    chats: ShallowRef<ChatTurnList[] | undefined>
    reset: () => void
}
