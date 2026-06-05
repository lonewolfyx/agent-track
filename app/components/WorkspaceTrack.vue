<template>
    <section class="h-full min-h-[920px] w-full [&_.vue-flow__controls-button+_.vue-flow__controls-button]:border-t [&_.vue-flow__controls-button+_.vue-flow__controls-button]:border-slate-200/90 [&_.vue-flow__controls-button]:h-[42px] [&_.vue-flow__controls-button]:w-[42px] [&_.vue-flow__controls-button]:border-0 [&_.vue-flow__controls-button]:bg-transparent [&_.vue-flow__controls-button]:text-slate-600 [&_.vue-flow__controls-button:hover]:bg-slate-50/95 [&_.vue-flow__controls]:overflow-hidden [&_.vue-flow__controls]:rounded-[18px] [&_.vue-flow__controls]:border [&_.vue-flow__controls]:border-slate-200/90 [&_.vue-flow__controls]:bg-white/94 [&_.vue-flow__controls]:shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] [&_.vue-flow__controls]:backdrop-blur-[14px] [&_.vue-flow__edge-path]:stroke-linecap-round [&_.vue-flow__edge-path]:stroke-linejoin-round [&_.vue-flow__node.selected]:shadow-none [&_.vue-flow__node]:border-0 [&_.vue-flow__node]:bg-transparent [&_.vue-flow__node]:p-0 [&_.vue-flow__node]:shadow-none [&_.vue-flow__pane]:bg-transparent">
        <VueFlow
            :nodes="nodes"
            :edges="edges"
            :default-viewport="defaultViewport"
            :min-zoom="0.55"
            :max-zoom="1.25"
            :fit-view-on-init="true"
            :nodes-draggable="true"
            :nodes-connectable="false"
            :elements-selectable="false"
            :edges-updatable="false"
            :connect-on-click="false"
            :zoom-on-scroll="false"
            :pan-on-scroll="true"
            :pan-on-scroll-mode="PanOnScrollMode.Free"
            :prevent-scrolling="true"
            :pan-on-drag="true"
            class="bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#fdfdfd_100%)]"
        >
            <Background
                pattern-color="#d7deeb"
                color="#d7deeb"
                :gap="22"
                :size="1.4"
                variant="dots"
            />

            <Panel position="top-left">
                <div class="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Agent Workflow
                    </p>
                    <h2 class="mt-1 text-sm font-semibold text-slate-700">
                        Workspace Trace
                    </h2>
                </div>
            </Panel>

            <Panel position="top-right">
                <div class="rounded-full border border-white/70 bg-white/85 px-3 py-2 text-xs font-medium text-slate-500 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                    Dify-style routing canvas
                </div>
            </Panel>

            <Controls
                position="bottom-right"
                :show-interactive="false"
            />

            <template #node-workspace="{ data, connectable }">
                <div :class="getNodeCardClass(data)">
                    <Handle
                        v-for="targetHandle in data.targetHandles ?? []"
                        :id="targetHandle.id"
                        :key="targetHandle.id"
                        type="target"
                        :position="targetHandle.position"
                        :connectable="connectable"
                        :style="targetHandle.style"
                        class="h-[18px] w-[6px] rounded-full border-0 bg-[#4f7cff] shadow-none"
                    />
                    <Handle
                        v-for="sourceHandle in data.sourceHandles ?? []"
                        :id="sourceHandle.id"
                        :key="sourceHandle.id"
                        type="source"
                        :position="sourceHandle.position"
                        :connectable="connectable"
                        :style="sourceHandle.style"
                        class="h-[18px] w-[6px] rounded-full border-0 bg-[#4f7cff] shadow-none"
                    />

                    <div class="flex items-start gap-3">
                        <div :class="cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border', getNodeMeta(data.kind).iconWrapper)">
                            <component
                                :is="getNodeMeta(data.kind).icon"
                                :class="cn('size-4.5', getNodeMeta(data.kind).iconColor)"
                            />
                        </div>

                        <div class="min-w-0">
                            <p class="truncate text-[15px] font-semibold uppercase tracking-[0.01em] text-slate-700">
                                {{ data.title }}
                            </p>
                            <p
                                v-if="data.eyebrow"
                                class="mt-1 text-xs font-medium text-slate-400"
                            >
                                {{ data.eyebrow }}
                            </p>
                        </div>
                    </div>

                    <div
                        v-if="data.badges?.length"
                        class="mt-4 space-y-2"
                    >
                        <div
                            v-for="badge in data.badges"
                            :key="badge.text"
                            :class="cn('flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium', getBadgeToneClass(badge.tone))"
                        >
                            <component
                                :is="getBadgeIcon(badge.icon)"
                                class="size-3.5 shrink-0"
                            />
                            <span class="truncate">{{ badge.text }}</span>
                        </div>
                    </div>

                    <div
                        v-if="data.commandRows?.length"
                        class="mt-4 space-y-2.5 rounded-[20px] bg-slate-50 px-3 py-3"
                    >
                        <div
                            v-for="row in data.commandRows"
                            :key="`${row.from}-${row.to}`"
                            class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2"
                        >
                            <button
                                type="button"
                                class="flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] transition-colors hover:border-sky-200 hover:bg-sky-50/70"
                                @click.stop="showCommandNodeAlert(row.from)"
                            >
                                {{ row.from }}
                            </button>
                            <div class="flex items-center gap-1.5 px-1">
                                <div class="h-px w-6 border-t border-dashed border-slate-300" />
                                <span class="text-xs text-slate-300">→</span>
                                <div class="h-px w-6 border-t border-dashed border-slate-300" />
                            </div>
                            <button
                                type="button"
                                class="flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] transition-colors hover:border-sky-200 hover:bg-sky-50/70"
                                @click.stop="showCommandNodeAlert(row.to)"
                            >
                                {{ row.to }}
                            </button>
                        </div>
                    </div>

                    <div
                        v-if="data.sections?.length"
                        class="mt-4 space-y-2"
                    >
                        <div
                            v-for="section in data.sections"
                            :key="`${data.title}-${section.title ?? section.lines[0]}`"
                            class="rounded-xl bg-slate-50 px-3 py-2.5"
                        >
                            <p
                                v-if="section.title"
                                class="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500"
                            >
                                {{ section.title }}
                            </p>
                            <p
                                v-for="line in section.lines"
                                :key="line"
                                class="text-[13px] leading-5 text-slate-500"
                                :class="section.title ? 'mt-1.5' : ''"
                            >
                                {{ line }}
                            </p>
                        </div>
                    </div>

                    <p
                        v-if="data.description"
                        class="mt-4 max-w-[18rem] text-[13px] leading-5 text-slate-500"
                    >
                        {{ data.description }}
                    </p>
                </div>
            </template>
        </VueFlow>
    </section>
</template>

<script setup lang="ts">
import type { Edge, Node } from '@vue-flow/core'
import type { Component, CSSProperties } from 'vue'
import {
    Blocks,
    BookOpenText,
    Bot,
    Brain,
    GitBranch,
    LibraryBig,
    MessageSquare,
    Sparkles,
} from '@lucide/vue'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { Handle, Panel, PanOnScrollMode, Position, VueFlow } from '@vue-flow/core'
import { cn } from '@/lib/utils'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

type WorkspaceNodeKind = 'entry' | 'classifier' | 'knowledge' | 'llm' | 'answer' | 'command' | 'result'
type BadgeIconKey = 'book' | 'bot' | 'sparkles'
type BadgeTone = 'neutral' | 'emerald' | 'violet' | 'amber'

interface WorkspaceBadge {
    text: string
    icon: BadgeIconKey
    tone?: BadgeTone
}

interface WorkspaceSection {
    title?: string
    lines: string[]
}

interface WorkspaceCommandRow {
    from: string
    to: string
}

interface WorkspaceHandle {
    id: string
    position: Position
    style?: CSSProperties
}

interface WorkspaceNodeData {
    kind: WorkspaceNodeKind
    title: string
    eyebrow?: string
    description?: string
    badges?: WorkspaceBadge[]
    commandRows?: WorkspaceCommandRow[]
    sections?: WorkspaceSection[]
    sourceHandles?: WorkspaceHandle[]
    targetHandles?: WorkspaceHandle[]
    highlighted?: boolean
}

type WorkspaceNode = Node<WorkspaceNodeData, any, 'workspace'>
type WorkspaceEdge = Edge<{ highlighted?: boolean }>

const badgeIconMap: Record<BadgeIconKey, Component> = {
    book: BookOpenText,
    bot: Bot,
    sparkles: Sparkles,
}

const badgeToneMap: Record<BadgeTone, string> = {
    neutral: 'bg-slate-100 text-slate-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
}

const nodeKindMeta: Record<WorkspaceNodeKind, {
    border: string
    iconWrapper: string
    iconColor: string
    icon: Component
}> = {
    entry: {
        border: 'border-slate-200',
        iconWrapper: 'border-slate-200 bg-slate-100',
        iconColor: 'text-slate-600',
        icon: GitBranch,
    },
    classifier: {
        border: 'border-slate-200',
        iconWrapper: 'border-emerald-200 bg-emerald-50',
        iconColor: 'text-emerald-600',
        icon: Brain,
    },
    knowledge: {
        border: 'border-slate-200',
        iconWrapper: 'border-emerald-200 bg-emerald-50',
        iconColor: 'text-emerald-600',
        icon: LibraryBig,
    },
    llm: {
        border: 'border-slate-200',
        iconWrapper: 'border-violet-200 bg-violet-50',
        iconColor: 'text-violet-600',
        icon: Bot,
    },
    answer: {
        border: 'border-slate-200',
        iconWrapper: 'border-amber-200 bg-amber-50',
        iconColor: 'text-amber-600',
        icon: MessageSquare,
    },
    command: {
        border: 'border-slate-200',
        iconWrapper: 'border-sky-200 bg-sky-50',
        iconColor: 'text-sky-600',
        icon: Blocks,
    },
    result: {
        border: 'border-slate-200',
        iconWrapper: 'border-cyan-200 bg-cyan-50',
        iconColor: 'text-cyan-600',
        icon: Sparkles,
    },
}

const defaultViewport = {
    x: 0,
    y: 0,
    zoom: 0.76,
}

const nodes: WorkspaceNode[] = [
    {
        id: 'entry',
        type: 'workspace',
        position: { x: 32, y: 270 },
        width: 224,
        sourcePosition: Position.Right,
        draggable: true,
        selectable: true,
        data: {
            kind: 'entry',
            title: 'User Request',
            eyebrow: 'Incoming ticket',
            badges: [
                { text: 'Message required', icon: 'sparkles', tone: 'neutral' },
            ],
            sections: [
                { title: 'SOURCE', lines: ['Support inbox or public chat channel'] },
                { title: 'GOAL', lines: ['Route the question into the right downstream branch'] },
            ],
            sourceHandles: [{ id: 'entry-out', position: Position.Right, style: { top: '50%' } }],
        },
    },
    {
        id: 'classifier',
        type: 'workspace',
        position: { x: 392, y: 248 },
        width: 332,
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        draggable: true,
        selectable: true,
        data: {
            kind: 'classifier',
            title: 'Question Classifier',
            badges: [
                { text: 'gpt-3.5-turbo', icon: 'sparkles', tone: 'emerald' },
            ],
            sections: [
                { title: 'CLASS 1', lines: ['After-sales related questions'] },
                { title: 'CLASS 2', lines: ['Product positioning and planning issues'] },
                { title: 'CLASS 3', lines: ['Other questions'] },
            ],
            targetHandles: [{ id: 'classifier-in', position: Position.Left, style: { top: '50%' } }],
            sourceHandles: [
                { id: 'classifier-class-1', position: Position.Right, style: { top: '36%' } },
                { id: 'classifier-class-2', position: Position.Right, style: { top: '56%' } },
                { id: 'classifier-class-3', position: Position.Right, style: { top: '78%' } },
            ],
        },
    },
    {
        id: 'knowledge-1',
        type: 'workspace',
        position: { x: 840, y: 138 },
        width: 264,
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        draggable: true,
        selectable: true,
        data: {
            kind: 'knowledge',
            title: 'Knowledge Retrieval 1',
            badges: [
                { text: 'Product Document', icon: 'book', tone: 'neutral' },
                { text: 'Text completion - OpenAI API', icon: 'bot', tone: 'violet' },
            ],
            targetHandles: [{ id: 'knowledge-1-in', position: Position.Left, style: { top: '50%' } }],
            sourceHandles: [{ id: 'knowledge-1-out', position: Position.Right, style: { top: '50%' } }],
        },
    },
    {
        id: 'knowledge-2',
        type: 'workspace',
        position: { x: 908, y: 410 },
        width: 264,
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        draggable: true,
        selectable: true,
        data: {
            kind: 'knowledge',
            title: 'Knowledge Retrieval 2',
            badges: [
                { text: 'Product Document', icon: 'book', tone: 'neutral' },
                { text: 'Text completion - OpenAI API', icon: 'bot', tone: 'violet' },
            ],
            targetHandles: [{ id: 'knowledge-2-in', position: Position.Left, style: { top: '50%' } }],
            sourceHandles: [{ id: 'knowledge-2-out', position: Position.Right, style: { top: '50%' } }],
        },
    },
    {
        id: 'answer',
        type: 'workspace',
        position: { x: 438, y: 742 },
        width: 284,
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        draggable: true,
        selectable: true,
        data: {
            kind: 'answer',
            title: 'Direct Answer',
            sections: [
                { title: 'ANSWER', lines: ['Sorry, I cannot answer this question.'] },
            ],
            targetHandles: [{ id: 'answer-in', position: Position.Left, style: { top: '50%' } }],
            sourceHandles: [{ id: 'answer-out', position: Position.Right, style: { top: '50%' } }],
        },
    },
    {
        id: 'command',
        type: 'workspace',
        position: { x: 996, y: 706 },
        width: 404,
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        draggable: true,
        selectable: true,
        data: {
            kind: 'command',
            title: 'Command',
            eyebrow: 'Nested execution group',
            commandRows: [
                { from: '1', to: '2' },
                { from: '3', to: '4' },
                { from: '5', to: '6' },
            ],
            targetHandles: [{ id: 'command-in', position: Position.Left, style: { top: '50%' } }],
            sourceHandles: [{ id: 'command-out', position: Position.Right, style: { top: '50%' } }],
        },
    },
    {
        id: 'result',
        type: 'workspace',
        position: { x: 1578, y: 742 },
        width: 244,
        targetPosition: Position.Left,
        draggable: true,
        selectable: true,
        data: {
            kind: 'result',
            title: 'Result',
            badges: [
                { text: 'Structured output', icon: 'sparkles', tone: 'neutral' },
            ],
            sections: [
                { title: 'STATUS', lines: ['Command execution merged into a final result node'] },
            ],
            targetHandles: [{ id: 'result-in', position: Position.Left, style: { top: '50%' } }],
        },
    },
    {
        id: 'llm-1',
        type: 'workspace',
        position: { x: 1410, y: 84 },
        width: 254,
        targetPosition: Position.Left,
        draggable: true,
        selectable: true,
        data: {
            kind: 'llm',
            title: 'LLM',
            badges: [
                { text: 'gpt-4-turbo-preview', icon: 'sparkles', tone: 'violet' },
            ],
            description: 'Invoking large language models to answer questions or understand natural language.',
            targetHandles: [{ id: 'llm-1-in', position: Position.Left, style: { top: '50%' } }],
        },
    },
    {
        id: 'llm-2',
        type: 'workspace',
        position: { x: 1404, y: 450 },
        width: 258,
        targetPosition: Position.Left,
        draggable: true,
        selectable: true,
        data: {
            kind: 'llm',
            title: 'LLM',
            badges: [
                { text: 'gpt-3.5-turbo', icon: 'sparkles', tone: 'emerald' },
            ],
            description: 'Invoking large language models to answer questions or understand natural language.',
            targetHandles: [{ id: 'llm-2-in', position: Position.Left, style: { top: '50%' } }],
        },
    },
]

const edges: WorkspaceEdge[] = [
    {
        id: 'entry-classifier',
        source: 'entry',
        sourceHandle: 'entry-out',
        target: 'classifier',
        targetHandle: 'classifier-in',
        type: 'default',
        animated: false,
        selectable: false,
        updatable: false,
        pathOptions: {
            curvature: 0.34,
        },
        style: {
            stroke: '#d5dbe6',
            strokeWidth: 1,
            strokeDasharray: 4,
        },
    },
    {
        id: 'classifier-knowledge-1',
        source: 'classifier',
        sourceHandle: 'classifier-class-1',
        target: 'knowledge-1',
        targetHandle: 'knowledge-1-in',
        type: 'default',
        selectable: false,
        updatable: false,
        pathOptions: {
            curvature: 0.56,
        },
        style: {
            stroke: '#d5dbe6',
            strokeWidth: 1.25,
            strokeDasharray: '4 12',
        },
    },
    {
        id: 'classifier-knowledge-2',
        source: 'classifier',
        sourceHandle: 'classifier-class-2',
        target: 'knowledge-2',
        targetHandle: 'knowledge-2-in',
        type: 'default',
        selectable: false,
        updatable: false,
        pathOptions: {
            curvature: 0.56,
        },
        style: {
            stroke: '#d5dbe6',
            strokeWidth: 1.25,
            strokeDasharray: '4 12',
        },
    },
    {
        id: 'classifier-answer',
        source: 'classifier',
        sourceHandle: 'classifier-class-3',
        target: 'answer',
        targetHandle: 'answer-in',
        type: 'default',
        selectable: false,
        updatable: false,
        pathOptions: {
            curvature: 0.58,
        },
        style: {
            stroke: '#d9dee8',
            strokeWidth: 1.25,
            strokeDasharray: '4 12',
        },
    },
    {
        id: 'knowledge-1-llm-1',
        source: 'knowledge-1',
        sourceHandle: 'knowledge-1-out',
        target: 'llm-1',
        targetHandle: 'llm-1-in',
        type: 'default',
        selectable: false,
        updatable: false,
        pathOptions: {
            curvature: 0.36,
        },
        style: {
            stroke: '#d5dbe6',
            strokeWidth: 1.25,
            strokeDasharray: '4 12',
        },
    },
    {
        id: 'knowledge-2-llm-2',
        source: 'knowledge-2',
        sourceHandle: 'knowledge-2-out',
        target: 'llm-2',
        targetHandle: 'llm-2-in',
        type: 'default',
        selectable: false,
        updatable: false,
        animated: false,
        data: {
            highlighted: true,
        },
        pathOptions: {
            curvature: 0.42,
        },
        style: {
            stroke: '#6b8fff',
            strokeWidth: 1.35,
            strokeDasharray: '4 12',
        },
    },
    {
        id: 'answer-command',
        source: 'answer',
        sourceHandle: 'answer-out',
        target: 'command',
        targetHandle: 'command-in',
        type: 'default',
        selectable: false,
        updatable: false,
        pathOptions: {
            curvature: 0.34,
        },
        style: {
            stroke: '#d5dbe6',
            strokeWidth: 1.2,
            strokeDasharray: '4 12',
        },
    },
    {
        id: 'command-result',
        source: 'command',
        sourceHandle: 'command-out',
        target: 'result',
        targetHandle: 'result-in',
        type: 'default',
        selectable: false,
        updatable: false,
        pathOptions: {
            curvature: 0.3,
        },
        style: {
            stroke: '#d5dbe6',
            strokeWidth: 1.2,
            strokeDasharray: '4 12',
        },
    },
]

function getNodeMeta(kind: WorkspaceNodeKind) {
    return nodeKindMeta[kind]
}

function getBadgeIcon(icon: BadgeIconKey) {
    return badgeIconMap[icon]
}

function getNodeCardClass(data: WorkspaceNodeData) {
    return cn(
        'relative rounded-[24px] border bg-white px-5 py-4 shadow-[0_22px_48px_-30px_rgba(15,23,42,0.28)] transition-[box-shadow,border-color]',
        getNodeMeta(data.kind).border,
        data.highlighted && 'border-[#4f7cff] shadow-[0_24px_56px_-28px_rgba(79,124,255,0.32)] ring-2 ring-[#4f7cff]/18',
    )
}

function getBadgeToneClass(tone: BadgeTone = 'neutral') {
    return badgeToneMap[tone]
}

function showCommandNodeAlert(nodeId: string) {
    alert(`Command node ${nodeId} clicked`)
}
</script>
