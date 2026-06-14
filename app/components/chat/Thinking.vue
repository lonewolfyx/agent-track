<template>
    <div class="relative flex flex-col pl-6 pt-4">
        <VerticalLine />
        <Collapsible class="group/collapsible" default-open>
            <CollapsibleTrigger as-child>
                <ChatQuestion />
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

                <ChatAnswer />
            </CollapsibleContent>
        </Collapsible>
    </div>
</template>

<script setup lang="ts">
import type { ChatTurnList } from '#shared/types/session'

defineOptions({
    name: 'ChatThinking',
})

defineProps<{
    chat: ChatTurnList
}>()
</script>
