export interface ChatProviderDetail {
    chatIdx: Ref<number>
    thinkIdx: Ref<number>
    status: Ref<boolean>
    thinkingType: Ref<string>
    handleThinkingNode: (index: number, thinkingType: string) => void
    thinking: ShallowRef<CodexSessionThinking | undefined>
    chat: ShallowRef<ChatTurnList | undefined>
    reset: () => void
}
