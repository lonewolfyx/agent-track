<template>
    <SessionProvider>
        <div class="flex grow">
            <SiteMenu />
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
                                <SessionList />
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    </SessionProvider>
</template>

<script lang="ts" setup>
import SiteMenu from '~/components/SiteMenu.vue'
import { cn } from '~/lib/utils'
</script>
