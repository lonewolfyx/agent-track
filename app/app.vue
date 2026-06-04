<template>
    <SidebarProvider class="flex h-svh overflow-hidden">
        <AppSidebar />
        <SidebarInset class="m-2 rounded-xl border border-input">
            <div class="flex flex-col grow overflow-y-auto">
                <header class="flex my-2 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div class="flex items-center gap-2 px-4">
                        <SidebarTrigger class="-ml-1" />
                    </div>
                </header>
                <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div class="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div class="aspect-video rounded-xl bg-muted/50" />
                        <div class="aspect-video rounded-xl bg-muted/50" />
                        <div class="aspect-video rounded-xl bg-muted/50" />
                    </div>
                    <div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50" />
                </div>
            </div>
        </SidebarInset>
    </SidebarProvider>
</template>
