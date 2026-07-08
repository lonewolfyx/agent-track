<template>
    <ChatThinkingSkill
        v-if="Object.keys(think).includes('skill')"
        :skill="think.skill!"
    />
    <ChatThinkingNodeButton
        v-else
        :chat-index="chatIndex"
        :detail-type="FUNCTION_CALL"
        icon="carbon:function-2"
        :index="index"
        :label="think.toolName || 'function call'"
        :summary="summary"
    />
</template>

<script lang="ts" setup>
import type { CodexResponseFunctionCall } from '#shared/types/function.call'
import type { CodexSessionThinking } from '#shared/types/session'
import { FUNCTION_CALL } from '#shared/constant/codex.type'
import { resolveFunctionCallToolArguments, summarizeUnknown } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatThinkingFunctionCall',
})

const props = defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const summary = computed(() => summarizeUnknown(resolveFunctionCallToolArguments(props.think.call as CodexResponseFunctionCall | undefined), 100))
</script>
