export interface ChatProviderDetail {
    idx: Ref<number>
    status: Ref<boolean>
    handleThinkingNode: (index: number) => void
    thinking: ShallowRef<CodexSessionThinking | undefined>
    chat: ShallowRef<ChatTurnList | undefined>
    reset: () => void
}
