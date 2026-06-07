# Workflow 可视化架构重构 — 开发实施方案

> 技术栈: Nuxt 4 (SSR off) + Vue 3 Composition API + shadcn-vue + Tailwind CSS v4 + VueFlow
> 现有 UI 组件: Sheet (drawer), Button, Collapsible, Tooltip 等 (reka-ui 原语)

---

## 改动总览

```
shared/types/session.ts          ← 类型扩展
server/api/sessions/[id].get.ts  ← API 层: 移除过度截断, 增加 turn 链
app/lib/workspace-track.ts       ← 前端图构建: 跨 turn 连接, 完整内容
app/components/workspace-track/  ← 组件拆分 (从单文件拆为目录)
  ├── WorkspaceTrack.vue         ← 主容器 (重构)
  ├── WorkspaceTrackNode.vue     ← 单节点卡片
  ├── WorkspaceTrackReasoningDetail.vue ← Reasoning 详情抽屉
  └── WorkspaceTrackTurnLabel.vue ← Turn 分组标签
app/composables/useWorkspaceTrack.ts ← 状态管理 composable
```

---

## Step 1: 类型扩展

### 文件: `shared/types/session.ts`

在现有类型基础上扩展, 不破坏已有字段。

```ts
// ===== 新增字段 (在已有 interface 上追加) =====

// CodexSessionWorkflowTurn — 新增 previousTurnId
export interface CodexSessionWorkflowTurn {
    turnId: string
    status: CodexSessionTurnStatus
    startedAt: string
    completedAt?: string
    nodeIds: string[]
    previousTurnId?: string       // ← 新增: 指向上一个 turn
    turnIndex: number             // ← 新增: turn 序号 (0-based)
}

// CodexSessionWorkflowNode — 新增完整内容字段
export interface CodexSessionWorkflowNode {
    // ... 保持所有现有字段不变 ...
    contentFull?: string          // ← 新增: 完整未截断内容
}

// ===== 新增类型 =====

export interface CodexSessionTurnChain {
    from: string   // 上一个 turnId
    to: string     // 当前 turnId
}
```

---

## Step 2: API 层改造

### 文件: `server/api/sessions/[id].get.ts`

#### 2.1 移除 reasoning 内容截断

**改动函数: `buildReasoningContent()`**

```ts
// 改动前 (当前):
function buildReasoningContent(payload: SessionPayload): string {
    // ... 获取 summary/content ...
    if (summary) {
        return summarizeText(summary, 320)  // ← 截断
    }
    const content = getContentItemsText(payload.content)
    if (content) {
        return summarizeText(content, 320)  // ← 截断
    }
    return getString(payload.encrypted_content) ? '[encrypted reasoning]' : ''
}

// 改动后:
function buildReasoningContent(payload: SessionPayload): string {
    const summary = getArray(payload.summary)
        .map((item) => {
            const record = getRecord(item)
            return getString(record.text)
        })
        .filter(Boolean)
        .join('\n\n')

    if (summary) {
        return summary  // ← 不截断, 返回完整文本
    }

    const content = getContentItemsText(payload.content)
    if (content) {
        return content  // ← 不截断
    }

    return getString(payload.encrypted_content) ? '[encrypted reasoning]' : ''
}
```

#### 2.2 构建节点时同时保留预览 + 完整内容

**改动位置: `getSessionDetail()` 主循环中构建 node 的部分**

```ts
// 改动前:
const node: CodexSessionWorkflowNode = {
    // ...
    content: buildNodeContent(line, payload, payloadType) || undefined,
    // ...
}

// 改动后:
const fullContent = buildNodeContent(line, payload, payloadType) || undefined
const node: CodexSessionWorkflowNode = {
    // ...
    content: fullContent ? summarizeText(fullContent, 200) : undefined,  // 预览
    contentFull: fullContent,  // 完整内容
    // ...
}
```

> 注意: `buildNodeContent()` 本身已经对 message 类做了 `summarizeText(320)`, 需要同步修改 `buildMessageContent()` 也去掉截断, 让完整内容回到 `contentFull`。

#### 2.3 构建 turn 链

**改动位置: `getSessionDetail()` 函数末尾, return 之前**

```ts
// 新增: 构建 turn 链
const sortedTurns = [...turns.values()].sort((left, right) =>
    left.startedAt.localeCompare(right.startedAt),
)

for (let i = 0; i < sortedTurns.length; i++) {
    sortedTurns[i]!.turnIndex = i
    if (i > 0) {
        sortedTurns[i]!.previousTurnId = sortedTurns[i - 1]!.turnId
    }
}

// 构建 turnChain 边
const turnChain: CodexSessionTurnChain[] = []
for (let i = 1; i < sortedTurns.length; i++) {
    turnChain.push({
        from: sortedTurns[i - 1]!.turnId,
        to: sortedTurns[i]!.turnId,
    })
}

return {
    id,
    path,
    sessionMeta: sessionMetaLine ? sessionMetaLine.payload as unknown as CodexSessionMetaPayload : null,
    turns: sortedTurns,
    turnChain,  // ← 新增
    workflow: { nodes, edges },
}
```

**同步修改 `CodexSessionDetail` 类型:**

```ts
export interface CodexSessionDetail {
    id: string
    path: string
    sessionMeta: CodexSessionMetaPayload | null
    turns: CodexSessionWorkflowTurn[]
    turnChain: CodexSessionTurnChain[]   // ← 新增
    workflow: CodexSessionWorkflowGraph
}
```

---

## Step 3: 前端图构建改造

### 文件: `app/lib/workspace-track.ts`

#### 3.1 扩展 WorkspaceTrackNodeData 类型

```ts
export interface WorkspaceTrackNodeData {
    // ... 保持所有现有字段 ...
    contentFull?: string           // ← 新增: 完整内容
    turnIndex?: number             // ← 新增: turn 序号
    sessionMeta?: {                // ← 新增: 每个 turn 携带精简 session 上下文
        model?: string
        cwd?: string
        branch?: string
    }
}
```

#### 3.2 每个 turn 携带 session 上下文摘要

**改动位置: `buildWorkspaceTrackGraph()` 主循环开头**

```ts
// 在循环开始前提取 session 上下文
const sessionContext = sessionMetaNode
    ? {
        model: (sessionMetaNode.stats?.find(s => s.label === 'Provider')?.value)
            || undefined,
        cwd: sessionMetaNode.content || undefined,
        branch: (sessionMetaNode.stats?.find(s => s.label === 'Branch')?.value)
            || undefined,
    }
    : undefined

// 在循环内, 创建每个 displayNode 时传入:
// data.sessionMeta = sessionContext
// data.turnIndex = turnIndex
```

#### 3.3 Reasoning 节点传递完整内容

**改动位置: `buildReasoningBundleNode()`**

```ts
function buildReasoningBundleNode(nodes: CodexSessionWorkflowNode[], turnId: string): WorkspaceTrackNodeData | null {
    if (nodes.length === 0) return null

    const reasoningTexts = nodes.filter(node => node.payloadType === 'reasoning')
    // ... 其余逻辑不变 ...

    // 新增: 收集完整 reasoning 内容
    const fullReasoningContent = reasoningTexts
        .map(node => node.contentFull || node.content || '')
        .filter(Boolean)
        .join('\n\n---\n\n')

    return {
        // ... 所有现有字段保持不变 ...
        contentFull: fullReasoningContent || undefined,  // ← 新增
    }
}
```

#### 3.4 Final Answer 节点传递完整内容

**改动位置: `buildFinalAnswerNode()`**

```ts
function buildFinalAnswerNode(node: CodexSessionWorkflowNode): WorkspaceTrackNodeData {
    return {
        // ... 所有现有字段保持不变 ...
        content: node.content,
        contentFull: node.contentFull || node.content,  // ← 新增
    }
}
```

#### 3.5 跨 Turn 边连接

**改动位置: `buildWorkspaceTrackGraph()` 函数末尾, return 之前**

```ts
// 新增: 构建跨 turn 连接边
const turnConnectionEdges: WorkspaceTrackEdge[] = []

for (let i = 1; i < detail.turns.length; i++) {
    const prevTurn = detail.turns[i - 1]!
    const currTurn = detail.turns[i]!

    // 找到上一个 turn 的最后一个显示节点
    const prevTurnLastNode = displayNodes
        .filter(n => n.data?.turnId === prevTurn.turnId)
        .at(-1)

    // 找到当前 turn 的第一个显示节点 (排除 session-meta, 它只属于 turn 0)
    const currTurnFirstNode = displayNodes
        .find(n => n.data?.turnId === currTurn.turnId && n.id !== 'display:session-meta:session')

    if (prevTurnLastNode && currTurnFirstNode) {
        turnConnectionEdges.push({
            id: `turn-chain:${prevTurn.turnId}:${currTurn.turnId}`,
            source: prevTurnLastNode.id,
            target: currTurnFirstNode.id,
            type: 'default',
            animated: true,  // ← 动画虚线, 视觉区分
            updatable: false,
            selectable: false,
            data: { relation: 'next' },
            style: {
                stroke: '#94a3b8',       // slate-400, 比 turn 内的 #334155 更浅
                strokeWidth: 2,
                strokeDasharray: '8 4',  // 虚线
                opacity: 0.7,
            },
            pathOptions: { curvature: 0.15 },
        })
    }
}

return {
    nodes: displayNodes,
    edges: [...displayEdges, ...turnConnectionEdges],
}
```

---

## Step 4: Composable — 状态管理

### 新建文件: `app/composables/useWorkspaceTrack.ts`

将 WorkspaceTrack.vue 中的状态逻辑抽取到 composable。

```ts
import type { WorkspaceTrackNodeData } from '@/lib/workspace-track'

export function useWorkspaceTrack() {
    // 当前展开的 reasoning 详情
    const expandedReasoning = ref<WorkspaceTrackNodeData | null>(null)

    // Sheet 开关状态
    const isDetailOpen = computed({
        get: () => expandedReasoning.value !== null,
        set: (value: boolean) => {
            if (!value) {
                expandedReasoning.value = null
            }
        },
    })

    function openReasoningDetail(data: WorkspaceTrackNodeData) {
        expandedReasoning.value = data
    }

    function closeReasoningDetail() {
        expandedReasoning.value = null
    }

    return {
        expandedReasoning: readonly(expandedReasoning),
        isDetailOpen,
        openReasoningDetail,
        closeReasoningDetail,
    }
}
```

---

## Step 5: 组件拆分与重构

### 5.1 新建文件: `app/components/workspace-track/WorkspaceTrackNode.vue`

从 WorkspaceTrack.vue 中提取单节点渲染逻辑。

```vue
<template>
    <div :class="getNodeCardClass(data.kind)">
        <!-- Handle (不变) -->
        <Handle id="target" type="target" :position="Position.Left"
            :connectable="connectable"
            class="h-[18px] w-[6px] rounded-full border-0 bg-slate-500 shadow-none" />
        <Handle id="source" type="source" :position="Position.Right"
            :connectable="connectable"
            class="h-[18px] w-[6px] rounded-full border-0 bg-slate-500 shadow-none" />

        <!-- Corner Badge + Turn Index (新增 turnIndex 显示) -->
        <span v-if="data.cornerBadge"
            class="absolute right-4 top-4 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700">
            {{ data.cornerBadge }}
        </span>
        <span v-if="data.turnIndex !== undefined"
            class="absolute left-4 top-4 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500">
            Turn {{ data.turnIndex + 1 }}
        </span>

        <!-- 头部: icon + title + subtitle + timestamp (不变) -->
        <div class="flex items-start gap-3">
            <!-- ... 保持现有逻辑 ... -->
        </div>

        <!-- Badges (不变) -->
        <div v-if="data.badges.length" class="mt-4 flex flex-wrap gap-2">
            <!-- ... 保持现有逻辑 ... -->
        </div>

        <!-- Embedded Rows (不变) -->
        <div v-if="data.embeddedRows.length" class="relative mt-4 flex flex-col gap-3">
            <!-- ... 保持现有逻辑 ... -->
        </div>

        <!-- Stats (不变) -->
        <div v-if="data.stats.length" class="mt-4 grid grid-cols-2 gap-2">
            <!-- ... 保持现有逻辑 ... -->
        </div>

        <!-- Sections (不变) -->
        <div v-if="data.sections.length" class="mt-4 flex flex-col gap-3">
            <!-- ... 保持现有逻辑 ... -->
        </div>

        <!-- Content 预览 (不变) -->
        <p v-if="data.content"
            class="mt-4 whitespace-pre-wrap break-words rounded-[18px] bg-slate-50 px-3 py-3 text-[13px] leading-5 text-slate-500">
            {{ data.content }}
        </p>

        <!-- ★ 新增: 展开详情按钮 (仅 reasoning 和 final_answer 类型) -->
        <button v-if="data.contentFull && data.contentFull !== data.content"
            type="button"
            class="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500 transition-colors hover:border-sky-200 hover:bg-sky-50/70 hover:text-sky-700"
            @click="$emit('expand', data)">
            <component :is="Maximize2" class="size-3.5" />
            View Full Content
        </button>
    </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { CodexSessionWorkflowNodeKind } from '#shared/types/session'
import type { WorkspaceTrackNodeData } from '@/lib/workspace-track'
import { Maximize2 } from '@lucide/vue'
import { Handle, Position } from '@vue-flow/core'
import { cn } from '@/lib/utils'

// ... 从 WorkspaceTrack.vue 搬过来的所有 helper 函数 ...
// getNodeCardClass, getNodeMeta, getBadgeToneClass, getEmbeddedCardClass, formatTimestamp

defineProps<{
    data: WorkspaceTrackNodeData
    connectable: boolean
}>()

defineEmits<{
    expand: [data: WorkspaceTrackNodeData]
}>()
</script>
```

### 5.2 新建文件: `app/components/workspace-track/WorkspaceTrackReasoningDetail.vue`

Reasoning 完整内容的 Sheet 抽屉。

```vue
<template>
    <Sheet :open="!!detail" @update:open="$emit('close')">
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
                <!-- Turn 上下文 -->
                <div v-if="detail?.turnIndex !== undefined"
                    class="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Turn {{ detail.turnIndex + 1 }}
                    </p>
                    <p v-if="detail.sessionMeta?.model" class="mt-1 text-xs text-slate-600">
                        Model: {{ detail.sessionMeta.model }}
                    </p>
                    <p v-if="detail.sessionMeta?.cwd" class="mt-0.5 text-xs text-slate-500 truncate">
                        {{ detail.sessionMeta.cwd }}
                    </p>
                </div>

                <!-- Badges -->
                <div v-if="detail?.badges.length" class="flex flex-wrap gap-2">
                    <span v-for="badge in detail.badges" :key="badge.label"
                        :class="cn('rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]', getBadgeToneClass(badge.tone))">
                        {{ badge.label }}
                    </span>
                </div>

                <!-- Stats -->
                <div v-if="detail?.stats.length" class="grid grid-cols-2 gap-2">
                    <div v-for="stat in detail.stats" :key="stat.label"
                        class="rounded-xl bg-slate-50 px-3 py-2.5">
                        <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            {{ stat.label }}
                        </p>
                        <p class="mt-1 text-sm font-semibold text-slate-700">
                            {{ stat.value }}
                        </p>
                    </div>
                </div>

                <!-- ★ 完整内容 -->
                <div v-if="detail?.contentFull"
                    class="rounded-[18px] border border-slate-200 bg-white px-4 py-4">
                    <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-3">
                        Full Content
                    </p>
                    <div class="whitespace-pre-wrap break-words text-[13px] leading-6 text-slate-700">
                        {{ detail.contentFull }}
                    </div>
                </div>

                <!-- Embedded Rows (完整版) -->
                <div v-if="detail?.embeddedRows.length" class="flex flex-col gap-3">
                    <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Workflow Steps
                    </p>
                    <div v-for="(row, rowIndex) in detail.embeddedRows" :key="row.id"
                        class="rounded-[18px] border border-slate-200 bg-white px-4 py-3">
                        <p class="text-[11px] font-semibold text-slate-500 mb-2">
                            Step {{ Number(rowIndex) + 1 }}
                        </p>
                        <div v-for="card in row.cards" :key="card.id" class="mb-2 last:mb-0">
                            <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                                {{ card.title }}
                            </p>
                            <p v-if="card.subtitle" class="mt-0.5 text-[11px] text-slate-400">
                                {{ card.subtitle }}
                            </p>
                            <p v-if="card.content"
                                class="mt-2 whitespace-pre-wrap break-words text-[12px] leading-5 text-slate-600">
                                {{ card.content }}
                            </p>
                        </div>
                        <div v-if="row.metrics.length" class="mt-2 flex flex-wrap gap-1.5">
                            <span v-for="metric in row.metrics" :key="metric"
                                class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                {{ metric }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Sections -->
                <div v-if="detail?.sections.length" class="flex flex-col gap-3">
                    <div v-for="section in detail.sections" :key="section.title"
                        class="rounded-[18px] border border-slate-200 bg-white px-4 py-3">
                        <p v-if="section.title"
                            class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            {{ section.title }}
                        </p>
                        <div class="mt-2 flex flex-col gap-2">
                            <p v-for="line in section.lines" :key="line"
                                class="whitespace-pre-wrap break-words text-[12px] leading-5 text-slate-600">
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
import { Brain, Maximize2 } from '@lucide/vue'
import { cn } from '@/lib/utils'

// 从 WorkspaceTrack.vue 搬过来
const badgeToneMap = {
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
    sky: 'bg-sky-50 text-sky-700',
} as const

function getBadgeToneClass(tone: keyof typeof badgeToneMap) {
    return badgeToneMap[tone]
}

defineProps<{
    detail: WorkspaceTrackNodeData | null
}>()

defineEmits<{
    close: []
}>()
</script>
```

### 5.3 新建文件: `app/components/workspace-track/WorkspaceTrackTurnLabel.vue`

Turn 分组标签, 显示在每个 turn 区域左侧。

```vue
<template>
    <div class="pointer-events-none absolute left-0 flex items-center gap-2"
        :style="{ top: `${y}px` }">
        <div class="pointer-events-auto flex items-center gap-2 rounded-r-[16px] border border-l-0 border-slate-200/90 bg-white/94 px-3 py-2 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.35)] backdrop-blur-[14px]">
            <span class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Turn {{ turnIndex + 1 }}
            </span>
            <span v-if="status"
                :class="cn('rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]', statusClass)">
                {{ status }}
            </span>
            <span v-if="nodeCount"
                class="text-[10px] text-slate-400">
                {{ nodeCount }} nodes
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CodexSessionTurnStatus } from '#shared/types/session'
import { cn } from '@/lib/utils'

const props = defineProps<{
    turnIndex: number
    y: number
    status?: CodexSessionTurnStatus
    nodeCount?: number
}>()

const statusClass = computed(() => {
    switch (props.status) {
        case 'completed': return 'bg-emerald-50 text-emerald-700'
        case 'aborted': return 'bg-rose-50 text-rose-700'
        case 'running': return 'bg-sky-50 text-sky-700'
        default: return 'bg-slate-100 text-slate-500'
    }
})
</script>
```

### 5.4 重构主文件: `app/components/workspace-track/WorkspaceTrack.vue`

```vue
<template>
    <section :class="cn(
        'relative flex h-full min-h-0 w-full flex-1 overflow-hidden',
        // ... 保持所有 VueFlow 控件样式 ...
    )">
        <!-- 顶部信息栏 (保持不变) -->
        <div class="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-3 px-4 py-4 lg:flex-row lg:justify-between">
            <!-- ... 保持现有逻辑 ... -->
        </div>

        <!-- Loading / Error / Empty 状态 (保持不变) -->
        <div v-if="pending && !detail" class="flex flex-1 items-center justify-center">
            <!-- ... 保持现有逻辑 ... -->
        </div>
        <div v-else-if="loadError" class="flex flex-1 items-center justify-center px-4">
            <!-- ... 保持现有逻辑 ... -->
        </div>
        <div v-else-if="!nodes.length" class="flex flex-1 items-center justify-center">
            <!-- ... 保持现有逻辑 ... -->
        </div>

        <!-- VueFlow (保持大部分不变, 节点模板改为引用子组件) -->
        <VueFlow v-else :nodes="nodes" :edges="edges" :default-viewport="defaultViewport"
            :min-zoom="0.5" :max-zoom="1.45" :fit-view-on-init="false"
            :nodes-draggable="true" :nodes-connectable="false"
            :elements-selectable="false" :edges-updatable="false"
            :connect-on-click="false" :zoom-on-scroll="false"
            :pan-on-scroll="true" :pan-on-scroll-mode="PanOnScrollMode.Free"
            :prevent-scrolling="true" :pan-on-drag="true"
            :class="cn('h-full w-full', 'bg-[radial-gradient(...)]')">

            <Background :gap="22" :size="1.4" variant="dots" />
            <Controls position="bottom-right" :show-interactive="false" />

            <!-- ★ Turn 分组标签 (新增) -->
            <template #default>
                <WorkspaceTrackTurnLabel
                    v-for="turnLabel in turnLabels"
                    :key="turnLabel.turnIndex"
                    :turn-index="turnLabel.turnIndex"
                    :y="turnLabel.y"
                    :status="turnLabel.status"
                    :node-count="turnLabel.nodeCount"
                />
            </template>

            <!-- 节点模板 (简化, 委托给子组件) -->
            <template #node-workspace-track="{ data, connectable }">
                <WorkspaceTrackNode
                    :data="data"
                    :connectable="connectable"
                    @expand="openReasoningDetail"
                />
            </template>
        </VueFlow>

        <!-- ★ Reasoning 详情抽屉 (新增) -->
        <WorkspaceTrackReasoningDetail
            :detail="expandedReasoning"
            @close="closeReasoningDetail"
        />
    </section>
</template>

<script setup lang="ts">
import type { CodexSessionDetail } from '#shared/types/session'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { PanOnScrollMode, VueFlow } from '@vue-flow/core'
import { cn } from '@/lib/utils'
import { buildWorkspaceTrackGraph } from '@/lib/workspace-track'
import { useWorkspaceTrack } from '@/composables/useWorkspaceTrack'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

// ---- 数据获取 (保持不变) ----
interface SessionTarget {
    id: string
    path: string
}

const sessionTarget: SessionTarget = {
    id: '019e9195-37b8-77f1-9db4-4eaef779fe91',
    path: '/Users/tangchenghui/.codex/sessions/2026/06/04/rollout-2026-06-04T15-42-16-019e9195-37b8-77f1-9db4-4eaef779fe91.jsonl',
}

const requestKey = computed(() => `${sessionTarget.id}:${sessionTarget.path}`)

const { data: detail, pending, error, refresh } = await useAsyncData<CodexSessionDetail | null>(
    () => `workspace-track:${requestKey.value}`,
    async () => {
        let lastError: unknown = null
        try {
            return await $fetch<CodexSessionDetail>(`/api/sessions/${sessionTarget.id}`, {
                query: { path: sessionTarget.path },
            })
        }
        catch (requestError) {
            lastError = requestError
        }
        throw lastError ?? new Error('Failed to load session detail')
    },
    {
        watch: [requestKey],
        default: () => null,
    },
)

// ---- 图数据 (保持不变) ----
const graph = computed(() => buildWorkspaceTrackGraph(detail.value))
const nodes = computed(() => graph.value.nodes)
const edges = computed(() => graph.value.edges)

// ---- 状态管理 (新增) ----
const { expandedReasoning, openReasoningDetail, closeReasoningDetail } = useWorkspaceTrack()

// ---- Turn 标签数据 (新增) ----
const turnLabels = computed(() => {
    if (!detail.value) return []

    return detail.value.turns.map((turn, index) => {
        // 找到该 turn 第一个显示节点的 y 坐标
        const firstNode = nodes.value.find(n => n.data?.turnId === turn.turnId)
        return {
            turnIndex: index,
            y: (firstNode?.position.y ?? 0) + 160,  // 节点上方偏移
            status: turn.status,
            nodeCount: turn.nodeIds.length,
        }
    })
})

// ---- 摘要信息 (保持不变) ----
const sessionTitle = computed(() => detail.value?.sessionMeta?.id || sessionTarget.id || 'Unknown session')
const sessionPath = computed(() => detail.value?.path || sessionTarget.path || '')
const summaryChips = computed(() => [
    { label: 'Turns', value: String(detail.value?.turns.length ?? 0) },
    { label: 'Nodes', value: String(nodes.value.length) },
    { label: 'Links', value: String(edges.value.length) },
])

const loadError = computed(() => {
    if (!error.value) return ''
    return error.value instanceof Error
        ? error.value.message
        : 'Unknown error while loading the session workflow.'
})

const defaultViewport = { x: 0, y: 0, zoom: 0.92 }
</script>
```

---

## Step 6: 清理旧文件

- 删除旧的 `app/components/WorkspaceTrack.vue` (内容已拆分到 `workspace-track/` 目录)
- 确认 `app/components/workspace-track/WorkspaceTrack.vue` 作为新的主入口被正确引用

---

## 开发顺序与依赖关系

```
Step 1 (类型)  ← 无依赖, 先做
    ↓
Step 2 (API)   ← 依赖 Step 1 的类型
    ↓
Step 3 (图构建) ← 依赖 Step 1 的类型 + Step 2 的数据结构
    ↓
Step 4 (Composable) ← 无强依赖, 可与 Step 3 并行
    ↓
Step 5 (组件)  ← 依赖 Step 3 + Step 4
    ↓
Step 6 (清理)  ← 依赖 Step 5 全部完成
```

## 验证清单

- [ ] API 返回的 `contentFull` 字段包含完整未截断的 reasoning 文本
- [ ] API 返回的 `turnChain` 正确连接相邻 turn
- [ ] Reasoning 节点卡片底部出现 "View Full Content" 按钮
- [ ] 点击按钮后右侧 Sheet 抽屉展示完整 reasoning 内容
- [ ] 抽屉内可见 Turn 编号、Model、嵌入步骤完整内容
- [ ] 跨 turn 出现虚线动画边连接上一个 turn 的最后一个节点到下一个 turn 的第一个节点
- [ ] 每个 turn 区域左侧显示 Turn 标签 (编号 + 状态 + 节点数)
- [ ] Final Answer 后的新 turn 有视觉连接而非孤立
- [ ] 原有功能不受影响: 加载状态、错误重试、空状态、拖拽、缩放、controls
