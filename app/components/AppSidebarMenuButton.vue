<template>
    <SidebarMenuButton as-child class="hover:bg-white hover:text-blue-500" size="sm">
        <slot />
    </SidebarMenuButton>
</template>

<script setup lang="ts">
defineOptions({
    name: 'AppSidebarMenuButton',
})
</script>
