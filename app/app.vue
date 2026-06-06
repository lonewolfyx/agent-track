<template>
    <div class="flex min-h-dvh w-full flex-col overflow-hidden">
        <header class="flex h-12 shrink-0 items-center z-10">
            <div class="relative w-full grow px-4 lg:px-7.5 flex items-stretch justify-between gap-2.5">
                <div class="flex items-stretch gap-4">
                    <NuxtLink class="flex items-center gap-2" href="/">
                        <img
                            alt="image"
                            class="dark:hidden size-6"
                            src="/logo.svg"
                        >
                        <span class="capitalize font-mono text-sm text-secondary-foreground/75">agent track</span>
                    </NuxtLink>
                    <Separator orientation="vertical" />
                    <ProjectSelect />
                </div>
                <div class="flex items-center gap-2.5">
                    <NuxtLink href="/" target="_blank">
                        <Icon name="line-md:github" class="size-4" />
                    </NuxtLink>
                </div>
            </div>
        </header>
        <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
            <div class="m-2.5 mt-0 flex min-h-0 flex-1 rounded-xl border border-input bg-background">
                <main class="flex min-h-0 flex-1 overflow-hidden" role="main">
                    <div class="flex min-h-0 flex-1 px-4 py-4 sm:px-5 sm:py-5">
                        <WorkspaceTrack class="min-h-0 flex-1" />
                    </div>
                </main>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
</script>
