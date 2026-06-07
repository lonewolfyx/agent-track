<template>
    <div class="rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_54px_-38px_rgba(15,23,42,0.32)]">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div class="flex items-center gap-3">
                <div
                    class="flex size-9 items-center justify-center rounded-xl border"
                    :class="getReasoningGroupMeta(group.kind).iconWrapper"
                >
                    <component
                        :is="getReasoningGroupMeta(group.kind).icon"
                        class="size-4"
                        :class="getReasoningGroupMeta(group.kind).iconColor"
                    />
                </div>
                <div>
                    <p class="text-[13px] font-semibold text-slate-700">
                        {{ group.label }} ({{ group.count }})
                    </p>
                    <p class="mt-1 text-[11px] text-slate-400">
                        {{ group.duration || 'Detailed step list' }}
                    </p>
                </div>
            </div>

            <button
                type="button"
                class="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                @click="$emit('close')"
            >
                <X class="size-4" />
            </button>
        </div>

        <div class="max-h-[320px] space-y-3 overflow-y-auto px-5 py-4">
            <div
                v-for="(step, index) in group.steps"
                :key="step.id"
                class="rounded-[20px] border border-slate-100 bg-slate-50/65 px-4 py-3"
            >
                <div class="flex items-start gap-3">
                    <span class="mt-0.5 shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {{ index + 1 }}
                    </span>

                    <div class="min-w-0 flex-1 space-y-3">
                        <div class="flex flex-wrap gap-2.5">
                            <article
                                v-for="card in step.cards"
                                :key="card.id"
                                :class="getEmbeddedCardClass(card.kind)"
                                class="min-w-[220px] flex-1"
                            >
                                <p class="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                                    {{ card.title }}
                                </p>
                                <p v-if="card.subtitle" class="mt-1 truncate text-[11px] text-slate-400">
                                    {{ card.subtitle }}
                                </p>

                                <div v-if="card.badges.length" class="mt-2 flex flex-wrap gap-1.5">
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
                            </article>
                        </div>

                        <div v-if="step.metrics.length" class="flex flex-wrap gap-1.5">
                            <span
                                v-for="metric in step.metrics"
                                :key="metric"
                                class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
                            >
                                {{ metric }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { WorkspaceTrackStepGroupNode } from '@/lib/workspace-track'
import { X } from '@lucide/vue'
import { getBadgeToneClass, getEmbeddedCardClass, getReasoningGroupMeta } from './presentation'

defineProps<{
    group: WorkspaceTrackStepGroupNode
}>()

defineEmits<{
    close: []
}>()
</script>
