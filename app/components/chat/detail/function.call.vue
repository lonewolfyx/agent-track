<template>
    <DefineTemplate v-slot="{ title, context }">
        <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
                <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">{{ title }}</span>
            </div>
            <CodePreview>{{ context }}</codepreview>
        </div>
    </DefineTemplate>
    <div class="flex flex-col gap-6">
        <ReuseTemplate title="Input" :context="JSON.parse(think.call!.arguments)" />
        <ReuseTemplate title="OutPut" :context="think.output!.response?.output" />
    </div>
</template>

<script lang="ts" setup>
defineOptions({
    name: 'ChatDetailFunctionCall',
})

defineProps<{
    think: CodexSessionThinking
}>()

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()
</script>
