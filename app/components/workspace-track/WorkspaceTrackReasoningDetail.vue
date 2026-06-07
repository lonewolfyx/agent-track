<template>
    <Sheet :open="open" @update:open="value => !value && $emit('close')">
        <SheetContent side="right" class="w-full max-w-2xl overflow-y-auto">
            <SheetHeader>
                <SheetTitle class="flex items-center gap-2">
                    <Brain class="size-5 text-emerald-600" />
                    {{ detail?.title || 'Detail' }}
                </SheetTitle>
                <SheetDescription v-if="detail?.subtitle">
                    {{ detail.subtitle }}
                </SheetDescription>
            </SheetHeader>

            <div class="mt-6 flex flex-col gap-4 px-4">
                <div
                    v-if="detail?.turnIndex !== undefined"
                    class="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3"
                >
                    <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Turn {{ detail.turnIndex + 1 }}
                    </p>
                    <p v-if="detail.sessionMeta?.model" class="mt-1 text-xs text-slate-600">
                        Model: {{ detail.sessionMeta.model }}
                    </p>
                    <p v-if="detail.sessionMeta?.branch" class="mt-0.5 text-xs text-slate-600">
                        Branch: {{ detail.sessionMeta.branch }}
                    </p>
                    <p v-if="detail.sessionMeta?.cwd" class="mt-0.5 truncate text-xs text-slate-500">
                        {{ detail.sessionMeta.cwd }}
                    </p>
                </div>

                <div v-if="detail?.badges.length" class="flex flex-wrap gap-2">
                    <span
                        v-for="badge in detail.badges"
                        :key="badge.label"
                        class="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]"
                        :class="getBadgeToneClass(badge.tone)"
                    >
                        {{ badge.label }}
                    </span>
                </div>

                <div v-if="detail?.stats.length" class="grid grid-cols-2 gap-2">
                    <div
                        v-for="stat in detail.stats"
                        :key="`${stat.label}-${stat.value}`"
                        class="rounded-xl bg-slate-50 px-3 py-2.5"
                    >
                        <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            {{ stat.label }}
                        </p>
                        <p class="mt-1 text-sm font-semibold text-slate-700">
                            {{ stat.value }}
                        </p>
                    </div>
                </div>

                <div
                    v-if="detail?.contentFull"
                    class="rounded-[18px] border border-slate-200 bg-white px-4 py-4"
                >
                    <p class="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Full Content
                    </p>
                    <div class="whitespace-pre-wrap break-words text-[13px] leading-6 text-slate-700">
                        {{ detail.contentFull }}
                    </div>
                </div>

                <div v-if="detail?.embeddedRows.length" class="flex flex-col gap-3">
                    <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Workflow Steps
                    </p>
                    <div
                        v-for="(row, rowIndex) in detail.embeddedRows"
                        :key="row.id"
                        class="rounded-[18px] border border-slate-200 bg-white px-4 py-3"
                    >
                        <p class="mb-2 text-[11px] font-semibold text-slate-500">
                            Step {{ Number(rowIndex) + 1 }}
                        </p>
                        <div
                            v-for="card in row.cards"
                            :key="card.id"
                            class="mb-3 last:mb-0"
                        >
                            <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                                {{ card.title }}
                            </p>
                            <p
                                v-if="card.subtitle"
                                class="mt-0.5 text-[11px] text-slate-400"
                            >
                                {{ card.subtitle }}
                            </p>
                            <div
                                v-if="card.badges.length"
                                class="mt-2 flex flex-wrap gap-1.5"
                            >
                                <span
                                    v-for="badge in card.badges"
                                    :key="badge.label"
                                    class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
                                    :class="getBadgeToneClass(badge.tone)"
                                >
                                    {{ badge.label }}
                                </span>
                            </div>
                            <p
                                v-if="card.contentFull || card.content"
                                class="mt-2 whitespace-pre-wrap break-words text-[12px] leading-5 text-slate-600"
                            >
                                {{ card.contentFull || card.content }}
                            </p>
                        </div>

                        <div v-if="row.metrics.length" class="mt-2 flex flex-wrap gap-1.5">
                            <span
                                v-for="metric in row.metrics"
                                :key="metric"
                                class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
                            >
                                {{ metric }}
                            </span>
                        </div>
                    </div>
                </div>

                <div v-if="detail?.sections.length" class="flex flex-col gap-3">
                    <div
                        v-for="section in detail.sections"
                        :key="`${section.title}-${section.lines.join('|')}`"
                        class="rounded-[18px] border border-slate-200 bg-white px-4 py-3"
                    >
                        <p
                            v-if="section.title"
                            class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400"
                        >
                            {{ section.title }}
                        </p>
                        <div class="mt-2 flex flex-col gap-2">
                            <p
                                v-for="line in section.lines"
                                :key="line"
                                class="whitespace-pre-wrap break-words text-[12px] leading-5 text-slate-600"
                            >
                                {{ line }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </SheetContent>
    </Sheet>
</template>

<script setup lang="ts">
import type { WorkspaceTrackNodeData } from '@/lib/workspace-track'
import { Brain } from '@lucide/vue'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { getBadgeToneClass } from './presentation'

defineProps<{
    detail: WorkspaceTrackNodeData | null
    open: boolean
}>()

defineEmits<{
    close: []
}>()
</script>
