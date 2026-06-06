<template>
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
</template>

<script setup lang="ts">
defineOptions({
    name: 'ProjectSelect',
})
</script>
