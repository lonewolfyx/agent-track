<template>
    <div class="fixed top-0 bottom-0 z-20 lg:flex flex-col shrink-0 w-12">
        <div class="flex flex-col justify-center min-h-full">
            <div
                :class="cn(
                    'flex flex-col items-center gap-4',
                    'border border-input',
                    'rounded-tr-xl rounded-br-xl',
                    'py-12 shadow-xs',
                )"
            >
                <div>
                    <Icon class="size-5" name="active:logo" />
                </div>
                <Button
                    :class="cn(
                        'bg-transparent hover:bg-zinc-400/20',
                        'shadow-none border-0 rounded-full',
                    )"
                    as-child
                    size="icon"
                    variant="outline"
                >
                    <NuxtLink href="https://github.com/lonewolfyx/agent-track" target="_blank">
                        <Icon class="size-5" name="mynaui:github" />
                    </NuxtLink>
                </Button>
                <!--                <Button -->
                <!--                    :class="cn( -->
                <!--                        'bg-transparent hover:bg-zinc-400/20', -->
                <!--                        'shadow-none border-0 rounded-full', -->
                <!--                    )" -->
                <!--                    size="icon" -->
                <!--                    variant="outline" -->
                <!--                > -->
                <!--                    <Icon class="dark:hidden size-5" name="ph:sun-duotone" /> -->
                <!--                    <Icon class="hidden dark:inline-block size-5" name="ph:moon-duotone" /> -->
                <!--                </Button> -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'SiteMenu',
})
</script>
