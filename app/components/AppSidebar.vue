<template>
    <Sidebar class="group-data-[side=left]:border-none [&_[data-sidebar='sidebar']]:bg-muted">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg">
                        <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <GalleryVerticalEnd class="size-4" />
                        </div>
                        <div class="grid flex-1 text-left text-sm leading-tight">
                            <span class="truncate font-semibold">Acme Inc</span>
                            <span class="truncate text-xs">Enterprise</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>时间</SidebarGroupLabel>
                <SidebarMenu>
                    <Collapsible
                        v-for="group in sessionGroups"
                        :key="group.label"
                        as-child
                        default-open
                        class="group/collapsible"
                    >
                        <SidebarMenuItem>
                            <CollapsibleTrigger as-child>
                                <SidebarMenuButton :tooltip="group.label">
                                    <span>{{ group.label }}</span>
                                    <ChevronRight class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem
                                        v-for="session in group.children"
                                        :key="session.key"
                                    >
                                        <AppSidebarMenuButton>
                                            <a href="#">
                                                <span>{{ session.title }}</span>
                                            </a>
                                        </AppSidebarMenuButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
            <SidebarGroup>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <AppSidebarMenuButton>
                                <a href="#">
                                    <Icon name="line-md:github" />
                                    <span>GitHub</span>
                                </a>
                            </AppSidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarFooter>
    </Sidebar>
</template>

<script setup lang="ts">
import type { CodexSessionMonthGroup } from '#shared/types/session'
import { ChevronRight, GalleryVerticalEnd } from '@lucide/vue'
import { computed } from 'vue'

defineOptions({
    name: 'AppSidebar',
})

const { data: sessions } = useFetch<CodexSessionMonthGroup[]>('/api/sessions', {
    default: () => [],
})

const sessionGroups = computed(() =>
    sessions.value.map(group => ({
        label: group.label,
        children: group.children.map(session => ({
            key: session.id || session.filename,
            title: session.title || 'void chat',
        })),
    })),
)
</script>
