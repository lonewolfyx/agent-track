<template>
    <div class="flex grow">
        <div class="flex w-full justify-center">
            <div class="flex flex-col justify-between my-5">
                <div class="flex items-center gap-3">
                    <img src="/logo.svg" class="size-4" alt="agent-tack">
                    <span class="text-xl capitalize">agent track</span>
                </div>
                <div
                    class="flex gap-2 items-center flex-auto animate-pulse text-xl"
                >
                    <Icon mode="svg" name="svg-spinners:90-ring-with-bg" />
                    Loading session...
                </div>
                <div class="text-xs font-mono text-muted-foreground/20">
                    <NuxtLink href="https://github.com/lonewolfyx" target="_blank">
                        &copy; lonewolfyx
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'Loading',
})
</script>
