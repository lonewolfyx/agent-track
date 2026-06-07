import type { Component } from 'vue'
import type { CodexSessionTurnStatus, CodexSessionWorkflowNodeKind } from '#shared/types/session'
import type { WorkspaceTrackStepGroupKind } from '@/lib/workspace-track'
import {
    Activity,
    Blocks,
    Brain,
    Bug,
    FileStack,
    GitBranch,
    MessageSquare,
    Radar,
    Search,
    Settings2,
    Sparkles,
} from '@lucide/vue'
import { cn } from '@/lib/utils'

export const badgeToneMap = {
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
    sky: 'bg-sky-50 text-sky-700',
} as const

const nodeKindMeta: Record<CodexSessionWorkflowNodeKind, {
    border: string
    iconWrapper: string
    iconColor: string
    icon: Component
}> = {
    session: {
        border: 'border-slate-200',
        iconWrapper: 'border-slate-200 bg-slate-100',
        iconColor: 'text-slate-600',
        icon: GitBranch,
    },
    context: {
        border: 'border-amber-200',
        iconWrapper: 'border-amber-200 bg-amber-50',
        iconColor: 'text-amber-600',
        icon: Settings2,
    },
    message: {
        border: 'border-slate-200',
        iconWrapper: 'border-slate-200 bg-slate-100',
        iconColor: 'text-slate-600',
        icon: MessageSquare,
    },
    reasoning: {
        border: 'border-emerald-200',
        iconWrapper: 'border-emerald-200 bg-emerald-50',
        iconColor: 'text-emerald-600',
        icon: Brain,
    },
    tool_call: {
        border: 'border-sky-200',
        iconWrapper: 'border-sky-200 bg-sky-50',
        iconColor: 'text-sky-600',
        icon: Blocks,
    },
    tool_result: {
        border: 'border-sky-200',
        iconWrapper: 'border-cyan-200 bg-cyan-50',
        iconColor: 'text-cyan-600',
        icon: Sparkles,
    },
    metric: {
        border: 'border-amber-200',
        iconWrapper: 'border-amber-200 bg-amber-50',
        iconColor: 'text-amber-600',
        icon: Activity,
    },
    status: {
        border: 'border-violet-200',
        iconWrapper: 'border-violet-200 bg-violet-50',
        iconColor: 'text-violet-600',
        icon: Radar,
    },
    error: {
        border: 'border-rose-200',
        iconWrapper: 'border-rose-200 bg-rose-50',
        iconColor: 'text-rose-600',
        icon: Bug,
    },
    other: {
        border: 'border-slate-200',
        iconWrapper: 'border-slate-200 bg-slate-100',
        iconColor: 'text-slate-600',
        icon: FileStack,
    },
}

const reasoningGroupMeta: Record<WorkspaceTrackStepGroupKind, {
    icon: Component
    iconWrapper: string
    iconColor: string
    border: string
    surface: string
}> = {
    reasoning: {
        icon: Brain,
        iconWrapper: 'border-emerald-200 bg-emerald-50',
        iconColor: 'text-emerald-600',
        border: 'border-emerald-200',
        surface: 'bg-emerald-50/70',
    },
    tools: {
        icon: Blocks,
        iconWrapper: 'border-sky-200 bg-sky-50',
        iconColor: 'text-sky-600',
        border: 'border-sky-200',
        surface: 'bg-sky-50/80',
    },
    search: {
        icon: Search,
        iconWrapper: 'border-cyan-200 bg-cyan-50',
        iconColor: 'text-cyan-600',
        border: 'border-cyan-200',
        surface: 'bg-cyan-50/80',
    },
    commentary: {
        icon: MessageSquare,
        iconWrapper: 'border-slate-200 bg-slate-100',
        iconColor: 'text-slate-600',
        border: 'border-slate-200',
        surface: 'bg-slate-50/90',
    },
    metrics: {
        icon: Activity,
        iconWrapper: 'border-amber-200 bg-amber-50',
        iconColor: 'text-amber-600',
        border: 'border-amber-200',
        surface: 'bg-amber-50/85',
    },
    messages: {
        icon: MessageSquare,
        iconWrapper: 'border-violet-200 bg-violet-50',
        iconColor: 'text-violet-600',
        border: 'border-violet-200',
        surface: 'bg-violet-50/80',
    },
    other: {
        icon: FileStack,
        iconWrapper: 'border-slate-200 bg-slate-100',
        iconColor: 'text-slate-600',
        border: 'border-slate-200',
        surface: 'bg-white',
    },
}

export function getBadgeToneClass(tone: keyof typeof badgeToneMap) {
    return badgeToneMap[tone]
}

export function getNodeMeta(kind: CodexSessionWorkflowNodeKind) {
    return nodeKindMeta[kind]
}

export function getReasoningGroupMeta(kind: WorkspaceTrackStepGroupKind) {
    return reasoningGroupMeta[kind]
}

export function getNodeCardClass(kind: CodexSessionWorkflowNodeKind) {
    return cn(
        'relative rounded-[24px] border bg-white px-5 py-4 shadow-[0_22px_48px_-30px_rgba(15,23,42,0.28)] transition-[box-shadow,border-color] backdrop-blur-[10px]',
        getNodeMeta(kind).border,
    )
}

export function getEmbeddedCardClass(kind: 'reasoning' | 'commentary' | 'message' | 'call' | 'result' | 'metric' | 'other') {
    const baseClass = 'min-w-[180px] max-w-[220px] rounded-[18px] border bg-white px-3 py-3 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.35)]'

    if (kind === 'reasoning') {
        return cn(baseClass, 'border-emerald-200 bg-emerald-50/60')
    }

    if (kind === 'commentary') {
        return cn(baseClass, 'border-slate-200 bg-slate-50/85')
    }

    if (kind === 'message') {
        return cn(baseClass, 'border-sky-200 bg-sky-50/70')
    }

    if (kind === 'call') {
        return cn(baseClass, 'border-sky-200 bg-sky-50/90')
    }

    if (kind === 'result') {
        return cn(baseClass, 'border-emerald-200 bg-emerald-50/85')
    }

    if (kind === 'metric') {
        return cn(baseClass, 'border-amber-200 bg-amber-50/85')
    }

    return cn(baseClass, 'border-slate-200 bg-white')
}

export function getReasoningFlowStepShellClass(kind: 'reasoning' | 'commentary' | 'message' | 'call' | 'result' | 'metric' | 'other') {
    const baseClass = 'rounded-[18px] border bg-white shadow-[0_16px_34px_-28px_rgba(15,23,42,0.42)]'

    if (kind === 'reasoning') {
        return cn(baseClass, 'border-emerald-200')
    }

    if (kind === 'call') {
        return cn(baseClass, 'border-sky-200')
    }

    if (kind === 'result') {
        return cn(baseClass, 'border-cyan-200')
    }

    if (kind === 'metric') {
        return cn(baseClass, 'border-amber-200')
    }

    if (kind === 'message') {
        return cn(baseClass, 'border-violet-200')
    }

    return cn(baseClass, 'border-slate-200')
}

export function getReasoningGroupCardClass(kind: WorkspaceTrackStepGroupKind, selected: boolean) {
    return cn(
        'rounded-[20px] border-2 bg-white shadow-[0_22px_46px_-34px_rgba(15,23,42,0.38)] transition-[border-color,box-shadow,transform] duration-200',
        selected ? 'translate-y-[-2px] shadow-[0_28px_50px_-34px_rgba(15,23,42,0.42)]' : 'hover:translate-y-[-1px]',
        getReasoningGroupMeta(kind).border,
        selected ? 'border-slate-900/70' : '',
    )
}

export function getReasoningQuickChipClass(kind: WorkspaceTrackStepGroupKind) {
    return cn(
        'flex min-w-[70px] flex-col items-center justify-center rounded-[16px] border px-3 py-2 text-center shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)]',
        getReasoningGroupMeta(kind).border,
        getReasoningGroupMeta(kind).surface,
    )
}

export function formatTrackTimestamp(value: string) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleString('zh-CN', {
        hour12: false,
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

export function getTurnStatusClass(status?: CodexSessionTurnStatus) {
    switch (status) {
        case 'completed':
            return 'bg-emerald-50 text-emerald-700'
        case 'aborted':
            return 'bg-rose-50 text-rose-700'
        case 'running':
            return 'bg-sky-50 text-sky-700'
        default:
            return 'bg-slate-100 text-slate-500'
    }
}
