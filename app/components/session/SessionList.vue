<template>
    <div ref="root">
        <SessionTimeLine>
            <div
                :style="{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    position: 'relative',
                }"
            >
                <div
                    v-for="row in virtualRows"
                    :key="row.key"
                    :ref="measureRowElement"
                    :data-index="row.virtualRow.index"
                    :style="{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${row.virtualRow.start}px)`,
                    }"
                >
                    <SessionTimeLineHeader
                        v-if="row.kind === 'header'"
                        :date="row.header.label"
                        :sessions="row.header.sessions"
                    />
                    <div v-else class="pb-2">
                        <SessionTimeLineItem :session="row.session" />
                    </div>
                </div>
            </div>
        </SessionTimeLine>
    </div>
</template>

<script lang="ts" setup>
import type { VirtualItem } from '@tanstack/vue-virtual'
import type { ComponentPublicInstance } from 'vue'
import type { CodexSessionListItem, CodexSessionMonthGroup } from '#shared/types/session'
import { measureElement, useVirtualizer } from '@tanstack/vue-virtual'
import { useSession } from '.'

defineOptions({
    name: 'SessionList',
})

interface SessionHeaderRow {
    key: string
    kind: 'header'
    label: string
    sessions: number
}

interface SessionItemRow {
    key: string
    kind: 'item'
    session: CodexSessionListItem
}

interface SessionRenderHeaderRow {
    virtualRow: VirtualItem
    key: string
    kind: 'header'
    header: SessionHeaderRow
}

interface SessionRenderItemRow {
    virtualRow: VirtualItem
    key: string
    kind: 'item'
    session: CodexSessionListItem
}

type SessionVirtualRow = SessionHeaderRow | SessionItemRow
type SessionRenderRow = SessionRenderHeaderRow | SessionRenderItemRow

const { data: sessions } = useSession()

const rootRef = useTemplateRef<HTMLElement>('root')
const scrollElement = shallowRef<HTMLElement | null>(null)

const rows = computed<SessionVirtualRow[]>(() => {
    const groups = (sessions.value ?? []) as CodexSessionMonthGroup[]

    return groups.flatMap((group) => {
        const header: SessionHeaderRow = {
            key: `header-${group.label}`,
            kind: 'header',
            label: group.label,
            sessions: group.children.length,
        }

        const items: SessionItemRow[] = group.children.map(session => ({
            key: session.id,
            kind: 'item',
            session,
        }))

        return [header, ...items]
    })
})

const rowVirtualizer = useVirtualizer<HTMLElement, HTMLDivElement>(computed(() => ({
    count: rows.value.length,
    getScrollElement: () => scrollElement.value,
    getItemKey: index => rows.value[index]?.key ?? index,
    estimateSize: index => rows.value[index]?.kind === 'header' ? 52 : 104,
    measureElement,
    overscan: 8,
})))

const virtualRows = computed(() => {
    const result: SessionRenderRow[] = []

    for (const virtualRow of rowVirtualizer.value.getVirtualItems()) {
        const row = rows.value[virtualRow.index]

        if (!row) {
            continue
        }

        result.push({
            virtualRow,
            key: String(virtualRow.key),
            ...(row.kind === 'header'
                ? {
                        kind: 'header' as const,
                        header: row,
                    }
                : {
                        kind: 'item' as const,
                        session: row.session,
                    }),
        })
    }

    return result
})

function findScrollParent(element: HTMLElement | null) {
    let current = element?.parentElement ?? null

    while (current) {
        const style = window.getComputedStyle(current)
        const overflow = `${style.overflow} ${style.overflowY} ${style.overflowX}`

        if (/(auto|scroll|overlay)/.test(overflow)) {
            return current
        }

        current = current.parentElement
    }

    return document.scrollingElement instanceof HTMLElement
        ? document.scrollingElement
        : document.documentElement
}

function measureRowElement(element: Element | ComponentPublicInstance | null) {
    if (element instanceof Element) {
        rowVirtualizer.value.measureElement(element as HTMLDivElement)
    }
}

onMounted(() => {
    scrollElement.value = findScrollParent(rootRef.value ?? null)
})

watch(rows, async () => {
    await nextTick()
    rowVirtualizer.value.measure()
}, { flush: 'post' })
</script>
