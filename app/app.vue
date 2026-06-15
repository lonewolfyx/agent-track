<template>
    <SessionProvider>
        <div class="flex grow">
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
                            <NuxtLink href="/" target="_blank">
                                <Icon class="size-5" name="mynaui:github" />
                            </NuxtLink>
                        </Button>
                        <Button
                            :class="cn(
                                'bg-transparent hover:bg-zinc-400/20',
                                'shadow-none border-0 rounded-full',
                            )"
                            size="icon"
                            variant="outline"
                        >
                            <Icon class="dark:hidden size-5" name="ph:sun-duotone" />
                            <Icon class="hidden dark:inline-block size-5" name="ph:moon-duotone" />
                        </Button>
                    </div>
                </div>
            </div>
            <div class="flex flex-col lg:flex-row grow pt-0">
                <div
                    :class="cn(
                        'flex flex-col grow items-stretch lg:ms-12 m-4',
                        // 'bg-background border border-input rounded-xl',
                    )"
                >
                    <div class="flex flex-col grow overflow-y-auto pt-5">
                        <main class="grow" role="content">
                            <div class="container w-4xl mx-auto">
                                <!-- -->
                                <SessionList />
                                <!-- -->
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    </SessionProvider>
<!--    <Drawer v-model:open="open" direction="right" class=""> -->
<!--        <DrawerTrigger> -->
<!--            <Button variant="outline"> -->
<!--                Open Drawer -->
<!--            </Button> -->
<!--        </DrawerTrigger> -->
<!--        <DrawerContent -->
<!--            :class="cn( -->
<!--                'data-[vaul-drawer-direction=right]:sm:max-w-auto data-[vaul-drawer-direction=right]:w-11/12', -->
<!--                'rounded-tl-xl mt-20', -->
<!--                'border border-input border-r-0 border-b-0 shadow-lg', -->
<!--                'bg-white/50 backdrop-blur-[7px]', -->
<!--            )" -->
<!--        > -->
<!--            <SessionDetail /> -->
<!--        </DrawerContent> -->
<!--    </Drawer> -->
</template>

<script lang="ts" setup>
import { Button } from '@/components/ui/button'

import { cn } from '~/lib/utils'

const data = [
    { goal: 400 },
    { goal: 300 },
    { goal: 200 },
    { goal: 300 },
    { goal: 200 },
    { goal: 278 },
    { goal: 189 },
    { goal: 239 },
    { goal: 300 },
    { goal: 200 },
    { goal: 278 },
    { goal: 189 },
    { goal: 349 },
]
const goal = ref(350)
const open = ref(true)
</script>
