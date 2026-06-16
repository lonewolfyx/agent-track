<template>
    <slot />
</template>

<script lang="ts" setup>
import type { AsyncData } from '#app'
import { useSessionProvider } from '.'

defineOptions({
    name: 'SessionProvider',
})

const { data, status, error, refresh, clear } = await useFetch('/api/sessions')

useSessionProvider({
    data,
    status,
    error,
    refresh,
    clear,
} as AsyncData<any, any>)
</script>
