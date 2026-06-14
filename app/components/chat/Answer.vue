<template>
    <Bezier class="transform -scale-x-100" />
    <Button
        :class="cn(
            'bg-white text-secondary-foreground hover:bg-white rounded-full border',
        )"
    >
        <Icon name="arcticons:ask-ai" class="size-4" />
        我项目是一个低代码平台，我想做一个NLP驱动低代码平台的产品。
    </Button>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'

defineOptions({
    name: 'ChatAnswer',
})
</script>
