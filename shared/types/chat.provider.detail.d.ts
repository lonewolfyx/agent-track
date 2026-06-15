export interface ChatProviderDetail {
    chatIndex: Ref<number>
    thinkIndex: Ref<number>
    status: Ref<boolean>
    thinkingType: Ref<string>
    handleThinkingNode: (chatIdx: number, thinkIdx: number, type: string) => void
    chats: ShallowRef<ChatTurnList | undefined>
    reset: () => void
}
