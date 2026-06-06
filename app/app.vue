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
                    <div class="flex items-stretch">
                        <div class="flex items-center">
                            <Icon name="fluent:projection-screen-28-regular" class="size-4 text-secondary-foreground/75" />
                        </div>
                        <Select>
                            <SelectTrigger class="relative w-56 focus-visible:ring-0 bg-muted shadow-none border-none">
                                <SelectValue placeholder="Select a agent sessions..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>North America</SelectLabel>
                                    <SelectItem value="est">
                                        Eastern Standard Time (EST)
                                    </SelectItem>
                                    <SelectItem value="cst">
                                        Central Standard Time (CST)
                                    </SelectItem>
                                    <SelectItem value="mst">
                                        Mountain Standard Time (MST)
                                    </SelectItem>
                                    <SelectItem value="pst">
                                        Pacific Standard Time (PST)
                                    </SelectItem>
                                    <SelectItem value="akst">
                                        Alaska Standard Time (AKST)
                                    </SelectItem>
                                    <SelectItem value="hst">
                                        Hawaii Standard Time (HST)
                                    </SelectItem>
                                </SelectGroup>
                                <SelectItem value="apple">
                                    Apple
                                </SelectItem>
                                <SelectItem value="banana">
                                    Banana
                                </SelectItem>
                                <SelectItem value="blueberry">
                                    Blueberry
                                </SelectItem>
                                <SelectItem value="grapes">
                                    Grapes
                                </SelectItem>
                                <SelectItem value="pineapple">
                                    Pineapple
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
