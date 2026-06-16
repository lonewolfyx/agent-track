<template>
    <pre class="whitespace-pre-wrap wrap-break-word rounded bg-muted/50 p-2 font-mono text-xs text-muted-foreground"><slot /></pre>
</template>

<script setup lang="ts">
defineOptions({
    name: 'CodePreview',
})
</script>
