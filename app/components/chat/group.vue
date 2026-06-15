<template>
    <div class="relative flex flex-col chat-group">
        <slot />
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'ChatGroup',
})
</script>
