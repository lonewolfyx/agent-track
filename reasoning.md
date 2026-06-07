# Reasoning Workflow — 嵌入式 Dify 风格工作流方案

## 当前问题

`WorkspaceTrackNode.vue:69-145` 用**垂直时间线**渲染 `embeddedRows`，每个步骤 ~104px 高度。200 个步骤 ≈ 20,800px，节点完全不可查阅。

## 目标效果：Dify 风格的节点流图

Dify 工作流的视觉特征：
- **节点卡片**：圆角矩形，顶部图标+标题，中间摘要，左右连接点
- **连线**：曲线贝塞尔边，左→右流向
- **迭代节点**：虚线边框容器，内部包含子工作流节点
- **详情面板**：点击节点弹出右侧面板展示完整信息

核心思路：**把 reasoning bundle 从"垂直列表"变成"节点流图"**。

---

## 方案设计

### 一、主节点卡片（Canvas 上的 Reasoning Bundle）

当前 reasoning bundle 是一个 520px 宽的高卡片。改为**固定高度的入口卡片**：

```
┌─────────────────────────────────┐
│  🧠 Reasoning       Turn 1     │
│  nested workflow                │
│                                 │
│  247 events · 12.4k tokens     │
│                                 │
│  ┌───┐   ┌───┐   ┌───┐        │
│  │ R │──▶│ T │──▶│ S │        │
│  │ 5 │   │12 │   │ 3 │        │
│  └───┘   └───┘   └───┘        │
│                                 │
│  [展开 Workflow ▸]              │
└─────────────────────────────────┘
```

- 高度固定 ~220px
- 底部展示分组缩略节点（R=Reasoning, T=Tools, S=Search），用小方块+连线表示流关系
- 点击"展开 Workflow"打开详情面板

### 二、详情面板（Sheet 内嵌 Vue Flow）

**关键变化：Detail Sheet 内不再平铺列表，而是渲染一个独立的 Vue Flow 画布。**

```
┌─ Sheet (max-w-5xl) ──────────────────────────────────────┐
│  🧠 Reasoning Workflow · Turn 1          [Filters] [Search]│
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Vue Flow Canvas                                     │  │
│  │                                                      │  │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐       │  │
│  │  │ 💭       │    │ 🔧       │    │ 🔍       │       │  │
│  │  │ Reasoning│───▶│ Tools    │───▶│ Search   │       │  │
│  │  │ 5 steps  │    │ 12 steps │    │ 3 steps  │       │  │
│  │  │ 0.8s     │    │ 2.1s     │    │ 1.4s     │       │  │
│  │  └──────────┘    └──────────┘    └──────────┘       │  │
│  │       │                                                  │  │
│  │       ▼                                                  │  │
│  │  ┌──────────┐    ┌──────────┐                          │  │
│  │  │ 📝       │    │ 📊       │                          │  │
│  │  │Commentary│───▶│ Tokens   │                          │  │
│  │  │ 2 steps  │    │ 8 events │                          │  │
│  │  │ 0.3s     │    │ —        │                          │  │
│  │  └──────────┘    └──────────┘                          │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─ Selected: Function Calls (12) ──────────────────────┐  │
│  │ 1. bash "ls -la"                         ✓ 0.2s      │  │
│  │ 2. read_file "/src/main.ts"              ✓ 0.1s      │  │
│  │ 3. write_file "/src/utils.ts"            ✓ 0.3s      │  │
│  │ ... (show all 12)                                     │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 三、交互逻辑

1. **主 Canvas** → 点击 reasoning bundle 的"展开 Workflow" → 打开 Sheet
2. **Sheet 内 Canvas** → 展示分组节点流图（5-6 个分组节点 + 连线）
3. **点击分组节点** → Sheet 底部展开该组的详细步骤列表（紧凑单行布局）
4. **再次点击** → 收起详情

这就是 Dify 的"迭代节点"模式：
- 外层：主 session workflow（已有）
- 内层：reasoning workflow（新增，嵌入在 Sheet 的 Vue Flow 中）

### 四、分组节点设计

每个分组节点 = 一个 Dify 风格的卡片节点：

```
┌────────────────────────┐
│  [图标] Reasoning      │  ← 标题行（图标 + 名称）
│  5 events · 0.8s       │  ← 统计行
│                        │
│  ▸ Analyzing request.. │  ← 预览（前 1 条摘要）
│  ▸ Based on file...    │
│  +3 more...            │
└────────────────────────┘
```

- 宽度 ~240px，高度自适应（最少 120px）
- 预览前 2-3 条步骤摘要
- 底部 "+N more" 提示可点击展开
- 左侧输入 Handle，右侧输出 Handle

### 五、节点间连线

分组之间的连线表示数据/控制流：

```
Reasoning ──▶ Tools ──▶ Search
    │                      │
    └──────▶ Commentary ───┘
                │
                ▼
             Tokens
```

- 连线基于实际的 sequence 顺序
- 使用贝塞尔曲线（Vue Flow 默认）
- 连线标签可选（如 "calls tool", "produces output"）

### 六、数据层变更

`app/lib/workspace-track.ts`：

```typescript
// 新增：分组节点
export interface WorkspaceTrackStepGroupNode {
    id: string
    kind: 'reasoning' | 'tools' | 'search' | 'commentary' | 'metrics'
    label: string
    icon: string
    count: number
    duration?: string
    preview: string[]       // 前 2-3 条步骤摘要
    steps: WorkspaceTrackEmbeddedRow[]  // 完整步骤
}

// 新增：分组间的边
export interface WorkspaceTrackStepGroupEdge {
    source: string
    target: string
    label?: string
}
```

新增 `buildReasoningStepFlow()` 函数：
1. 将 200+ 个 `CodexSessionWorkflowNode` 按 payloadType 分组
2. 计算组间的顺序关系（基于 sequence）
3. 产出分组节点 + 分组边

### 七、组件结构

```
app/components/workspace-track/
├── WorkspaceTrackNode.vue                  # 修改：摘要视图替代时间线
├── WorkspaceTrackReasoningDetail.vue       # 修改：内嵌 Vue Flow
├── WorkspaceTrackReasoningFlow.vue         # 新增：Sheet 内的 Vue Flow 画布
├── WorkspaceTrackGroupNode.vue             # 新增：分组节点卡片（Dify 风格）
├── WorkspaceTrackStepList.vue              # 新增：选中分组后的步骤列表
├── WorkspaceTrackQuickSummary.vue          # 新增：主节点内的缩略统计
├── WorkspaceTrackTurnLabel.vue             # 不变
└── presentation.ts                         # 新增分组样式
```

### 八、关键实现细节

#### 8.1 Sheet 内嵌 Vue Flow

```vue
<!-- WorkspaceTrackReasoningFlow.vue -->
<template>
    <VueFlow
        :nodes="groupNodes"
        :edges="groupEdges"
        :nodes-draggable="false"
        :nodes-connectable="false"
        :zoom-on-scroll="true"
        :fit-view-on-init="true"
        class="h-[500px] w-full rounded-[18px] border border-slate-200 bg-slate-50/50"
    >
        <template #node-group="{ data }">
            <WorkspaceTrackGroupNode
                :data="data"
                @select="onGroupSelect"
            />
        </template>
        <Background :gap="16" :size="1" variant="dots" />
    </VueFlow>
</template>
```

#### 8.2 分组节点卡片

```vue
<!-- WorkspaceTrackGroupNode.vue -->
<template>
    <div class="w-[240px] rounded-[16px] border-2 bg-white shadow-sm"
         :class="selected ? 'border-emerald-400' : 'border-slate-200'"
         @click="$emit('select', data)">
        <!-- Header -->
        <div class="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
            <div class="flex size-7 items-center justify-center rounded-lg" :class="iconBg">
                <component :is="icon" class="size-3.5" :class="iconColor" />
            </div>
            <div>
                <p class="text-[12px] font-semibold text-slate-700">{{ data.label }}</p>
                <p class="text-[10px] text-slate-400">{{ data.count }} events · {{ data.duration }}</p>
            </div>
        </div>
        <!-- Preview -->
        <div class="px-3 py-2">
            <p v-for="(line, i) in data.preview.slice(0, 2)" :key="i"
               class="truncate text-[11px] text-slate-500">
                ▸ {{ line }}
            </p>
            <p v-if="data.count > 2" class="text-[10px] text-slate-400">
                +{{ data.count - 2 }} more...
            </p>
        </div>
        <!-- Handles -->
        <Handle type="target" :position="Position.Left" />
        <Handle type="source" :position="Position.Right" />
    </div>
</template>
```

#### 8.3 选中分组后的步骤列表

点击分组节点后，Sheet 底部展示该组的详细步骤：

```vue
<!-- WorkspaceTrackStepList.vue -->
<template>
    <div class="rounded-[18px] border border-slate-200 bg-white">
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p class="text-[13px] font-semibold text-slate-700">{{ group.label }} ({{ group.count }})</p>
            <button @click="$emit('close')">✕</button>
        </div>
        <div class="max-h-[300px] overflow-y-auto">
            <div v-for="(step, i) in group.steps" :key="step.id"
                 class="flex items-start gap-3 border-b border-slate-50 px-4 py-2.5 last:border-0">
                <span class="mt-0.5 text-[10px] font-semibold text-slate-400">{{ i + 1 }}</span>
                <div class="min-w-0 flex-1">
                    <p class="truncate text-[12px] font-medium text-slate-700">
                        {{ step.cards[0]?.title }}
                        <span v-if="step.cards[0]?.subtitle" class="text-slate-400">
                            · {{ step.cards[0].subtitle }}
                        </span>
                    </p>
                    <p v-if="step.cards[0]?.content" class="mt-0.5 truncate text-[11px] text-slate-500">
                        {{ step.cards[0].content }}
                    </p>
                </div>
                <div v-if="step.metrics.length" class="shrink-0">
                    <span v-for="m in step.metrics" :key="m"
                          class="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700">
                        {{ m }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
```

---

## 总结

| 维度 | 当前（时间线） | 新方案（Dify 节点流） |
|------|--------------|---------------------|
| 主节点高度 | 20,800px（200步） | 固定 ~220px |
| 信息密度 | 极低（每步一个卡片） | 高（分组聚合 + 预览） |
| 查找效率 | 逐行滚动 | 点击分组 → 展开详情 |
| 视觉体验 | 线性列表 | 节点流图（Dify 风格） |
| 可扩展性 | 线性增长 | 对数增长（分组数量固定） |
