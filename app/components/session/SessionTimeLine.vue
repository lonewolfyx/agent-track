<template>
    <div class="relative">
        <div class="absolute top-0 bottom-0 left-7 w-px bg-border" />
        <slot />
    </div>
</template>

<script lang="ts" setup>
defineOptions({
    name: 'SessionTimeLine',
})
</script>
