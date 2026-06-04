<template>
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <header class="flex h-16 shrink-0 items-center gap-2">
                <div class="flex items-center gap-2 px-4">
                    <SidebarTrigger class="-ml-1" />
                    <Separator
                        orientation="vertical"
                        class="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem class="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Building Your Application
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator class="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div class="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div class="bg-muted/50 aspect-video rounded-xl" />
                    <div class="bg-muted/50 aspect-video rounded-xl" />
                    <div class="bg-muted/50 aspect-video rounded-xl" />
                </div>
                <div class="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
            </div>
        </SidebarInset>
    </SidebarProvider>
</template>
