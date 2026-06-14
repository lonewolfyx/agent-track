<template>
    <div class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden touch-pan-y select-text" data-vaul-no-drag>
        <DrawerHeader class="hidden">
            <DrawerTitle />
            <DrawerDescription />
        </DrawerHeader>

        <div class="relative w-full h-full z-30">
            <div class="overflow-auto h-full">
                <div class="p-4">
                    <div class="select-none w-dvh h-full overflow-visible whitespace-nowrap">
                        <!-- -->
                        <div class="relative">
                            <div class="flex text-sm">
                                <span
                                    :class="cn(
                                        'px-3 py-1 rounded-full',
                                        'bg-white/90 text-blue-500',
                                        'border border-dashed border-blue-500 capitalize',
                                    )"
                                >
                                    session meta
                                </span>
                            </div>
                            <div class="pl-10 w-px h-4 border-r border-dashed" />
                        </div>
                        <div class="relative">
                            <div class="flex items-center gap-4 text-sm">
                                <span
                                    :class="cn(
                                        'px-3 py-1 rounded-full',
                                        'bg-white/90 text-indigo-500',
                                        'border border-dashed border-indigo-500 capitalize',
                                    )"
                                >
                                    Turn Context
                                </span>
                                <div
                                    :class="cn(
                                        'flex items-center gap-2',
                                        'px-3 py-1',
                                        'bg-white text-amber-500 text-xs',
                                        'border border-dashed rounded-2xl',
                                    )"
                                >
                                    <Icon class="size-4" name="lucide:bot" />
                                    <span class="font-mono capitalize">gpt-5.4</span>
                                </div>
                                <div
                                    :class="cn(
                                        'flex items-center gap-2',
                                        'px-3 py-1',
                                        'bg-white text-cyan-500 text-xs',
                                        'border border-dashed rounded-2xl',
                                    )"
                                >
                                    <Icon class="size-4" name="icon-park-twotone:brain" />
                                    <span class="font-mono capitalize">medium</span>
                                </div>
                            </div>
                            <div class="pl-10 w-px h-4 border-r border-dashed" />
                        </div>
                        <div class="relative flex flex-col pl-6 pt-4">
                            <VerticalLine />
                            <Collapsible class="group/collapsible" default-open>
                                <CollapsibleTrigger as-child>
                                    <Button class="bg-white text-secondary-foreground hover:bg-white rounded-full border">
                                        <Icon name="arcticons:ask-ai" class="size-4" />
                                        我项目是一个低代码平台，我想做一个NLP驱动低代码平台的产品。
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <Bezier />
                                    <div class="ml-0">
                                        <div class="relative">
                                            <div class="relative flex flex-col pl-4 pt-2">
                                                <VerticalLine />
                                                <div class="flex w-max items-center gap-2">
                                                    <div
                                                        class="border border-dashed rounded-full bg-white overflow-hidden cursor-pointer"
                                                    >
                                                        <Button
                                                            class="bg-transparent hover:bg-transparent text-secondary-foreground capitalize"
                                                            size="sm"
                                                        >
                                                            <Icon class="size-3" name="icon-park-twotone:brain" />
                                                            reasoning
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="relative flex flex-col pl-4 pt-2">
                                                <VerticalLine />
                                                <div class="flex w-max items-center gap-2">
                                                    <div
                                                        class="border border-dashed rounded-full bg-white overflow-hidden cursor-pointer"
                                                    >
                                                        <Button
                                                            class="bg-transparent hover:bg-transparent text-secondary-foreground capitalize"
                                                            size="sm"
                                                        >
                                                            <Icon class="size-3" name="material-symbols:hexagon-outline" />
                                                            Skill
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="relative flex flex-col pl-4 pt-2">
                                                <VerticalLine />
                                                <div class="flex w-max items-center gap-2">
                                                    <div
                                                        class="border border-dashed rounded-full bg-white overflow-hidden cursor-pointer"
                                                    >
                                                        <Button
                                                            class="bg-transparent hover:bg-transparent text-secondary-foreground capitalize"
                                                            size="sm"
                                                        >
                                                            <Icon class="size-3" name="flowbite:tools-outline" />
                                                            Tools Call
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="relative flex flex-col pl-4 pt-2">
                                                <VerticalLine />
                                                <div class="flex w-max items-center gap-2">
                                                    <div
                                                        class="border border-dashed rounded-full bg-white overflow-hidden cursor-pointer"
                                                    >
                                                        <Button
                                                            class="bg-transparent hover:bg-transparent text-secondary-foreground capitalize"
                                                            size="sm"
                                                        >
                                                            <Icon class="size-3" name="carbon:function-2" />
                                                            Function Call
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Bezier class="transform -scale-x-100" />
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                        <div class="relative flex flex-col pl-6 pt-4">
                            <VerticalLine />
                            <Collapsible class="group/collapsible">
                                <CollapsibleTrigger as-child>
                                    <Button class="bg-white text-secondary-foreground rounded-full border">
                                        <span>Home</span>
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div>sss</div>
                                    <div>sss</div>
                                    <div>sss</div>
                                    <div>sss</div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { CodexSessionDetail } from '#shared/types/session'
import type { SessionQueryParam } from '#shared/types/session.query'
import { cn } from '~/lib/utils'

defineOptions({
    name: 'SessionDetail',
})

const props = defineProps<SessionQueryParam>()

const sessionDetail = shallowRef<CodexSessionDetail | null>(null)

watch(
    () => [props.id, props.path] as const,
    async ([id, path], _, onCleanup) => {
        const controller = new AbortController()
        onCleanup(() => controller.abort())

        sessionDetail.value = await $fetch<CodexSessionDetail>(`/api/sessions/${id}`, {
            query: { path },
            signal: controller.signal,
        })
    },
    {
        immediate: true,
    },
)
</script>
