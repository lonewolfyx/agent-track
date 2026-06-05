<template>
    <SidebarProvider class="flex h-svh overflow-hidden">
        <AppSidebar />
        <SidebarInset class="m-2 rounded-xl border border-input">
            <div class="flex grow flex-col overflow-hidden">
                <header class="flex my-2 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div class="flex items-center gap-2 px-4">
                        <SidebarTrigger class="-ml-1" />
                    </div>
                </header>
                <div class="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-0">
                    <WorkspaceTrack />
                </div>
            </div>
        </SidebarInset>
    </SidebarProvider>
</template>
