<template>
    <ChatThinkingNodeButton
        :chat-index="chatIndex"
        :detail-type="IMAGE_GENERATION_CALL"
        icon="material-symbols:add-photo-alternate-outline-rounded"
        :index="index"
        label="image generation"
        :summary="summary"
        tone="image"
    />
</template>

<script setup lang="ts">
import { IMAGE_GENERATION_CALL } from '#shared/constant/codex.type'
import { resolveImageGenerationCall, resolveImageGenerationEnd, resolveImageGenerationResult, summarizeUnknown } from '#shared/utils/thinking'

defineOptions({
    name: 'ChatThinkingImageGenerationCall',
})

const props = defineProps<{
    think: CodexSessionThinking
    index: number
    chatIndex: number
}>()

const call = computed(() => resolveImageGenerationCall(props.think))
const event = computed(() => resolveImageGenerationEnd(props.think))
const summary = computed(() => summarizeUnknown(event.value?.revised_prompt ?? call.value?.revised_prompt ?? resolveImageGenerationResult(props.think), 100))
</script>
