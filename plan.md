# Agent-Track Workflow 架构分析与改进方案

## 一、当前完整数据流

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        JSONL Session File                              │
│  ~/.codex/sessions/2026/06/04/rollout-*.jsonl                          │
│                                                                        │
│  每行一个 JSON: { timestamp, type, payload }                           │
│                                                                        │
│  type 分布:                                                            │
│  ├── session_meta    → 会话级元数据 (model, cwd, git, cli_version)      │
│  ├── turn_context    → 每轮配置 (turn_id, model, effort, timezone)     │
│  ├── event_msg       → 运行时事件                                       │
│  │   ├── user_message          → 用户输入                              │
│  │   ├── task_started          → 任务开始                              │
│  │   ├── task_complete         → 任务完成                              │
│  │   ├── agent_message         → agent 消息 (phase: commentary/final)  │
│  │   ├── token_count           → token 用量                            │
│  │   ├── exec_command_end      → 命令执行结果                          │
│  │   ├── patch_apply_end       → 补丁应用结果                          │
│  │   ├── mcp_tool_call_end     → MCP 工具结果                          │
│  │   ├── web_search_end        → 网页搜索结果                          │
│  │   ├── turn_aborted          → 轮次中止                              │
│  │   ├── error                 → 错误                                  │
│  │   └── thread_name_updated   → 线程名更新                            │
│  ├── response_item   → LLM 响应项                                      │
│  │   ├── reasoning             → 思维链内容                            │
│  │   ├── message               → 消息 (含 role/phase)                  │
│  │   ├── function_call         → 函数调用                              │
│  │   ├── function_call_output  → 函数调用结果                          │
│  │   ├── custom_tool_call      → 自定义工具调用                        │
│  │   ├── custom_tool_call_output → 自定义工具结果                      │
│  │   ├── local_shell_call      → 本地 shell 调用                       │
│  │   ├── tool_search_call      → 工具搜索调用                          │
│  │   ├── tool_search_output    → 工具搜索结果                          │
│  │   ├── web_search_call       → 网页搜索调用                          │
│  │   ├── image_generation_call → 图片生成                              │
│  │   └── other                 → 其他                                  │
│  └── compacted       → 上下文压缩标记                                   │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              API Layer: getSessionDetail()                              │
│              server/api/sessions/[id].get.ts                            │
│                                                                        │
│  处理流程:                                                              │
│  1. readJsonlLines(path) → CodexSessionItem[]                          │
│  2. 遍历每一行 → classifyNode() 分类 kind + lane                        │
│  3. 构建节点 (nodes): id, turnId, timestamp, kind, content, stats...   │
│  4. 构建边 (edges):                                                     │
│     ├── 顺序边: 每个节点 → 下一个节点 (relation: 'next')               │
│     └── 结果边: tool_call ←→ tool_result 通过 call_id 匹配             │
│  5. 构建轮次 (turns): 按 turn_id 分组, 追踪 status                     │
│                                                                        │
│  输出: CodexSessionDetail {                                            │
│    id, path, sessionMeta, turns[], workflow { nodes[], edges[] }       │
│  }                                                                     │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│           Frontend: buildWorkspaceTrackGraph()                         │
│           app/lib/workspace-track.ts                                    │
│                                                                        │
│  处理流程:                                                              │
│  1. 按 turn 分组 rawNodes                                              │
│  2. 对每个 turn:                                                       │
│     ├── 找到第一个 reasoning 节点的索引 (firstReasoningIndex)           │
│     ├── 找到 final_answer 事件的索引 (finalAnswerEventIndex)           │
│     ├── 切分:                                                          │
│     │   ├── preReasoningNodes = [0, firstReasoningIndex)               │
│     │   └── reasoningNodes = [firstReasoningIndex, finalAnswerEvent)   │
│     ├── buildSetupNode(preReasoningNodes)                              │
│     │   └── 合并: task_started + turn_context + developer message      │
│     ├── buildMergedUserNode(preReasoningNodes)                         │
│     │   └── 合并所有 user message 类节点                               │
│     ├── buildReasoningBundleNode(reasoningNodes)                       │
│     │   └── 嵌入式卡片: reasoning + call/result 对 + token_count       │
│     └── buildFinalAnswerNode(finalAnswerMessage)                       │
│  3. 按列排列 (session-meta → setup → user → reasoning → final-answer) │
│  4. 按 turn 纵向堆叠                                                   │
│                                                                        │
│  输出: VueFlow { nodes[], edges[] }                                    │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              Vue 渲染层: WorkspaceTrack.vue                            │
│              app/components/WorkspaceTrack.vue                          │
│                                                                        │
│  布局:                                                                  │
│  ┌──────────┬──────────┬──────────┬──────────────┬─────────────┐       │
│  │ Session  │  Setup   │  User    │  Reasoning   │ Final       │       │
│  │ Meta     │  Node    │  Input   │  Bundle      │ Answer      │       │
│  │ (260px)  │ (300px)  │ (320px)  │  (520px)     │ (340px)     │       │
│  └──────────┴──────────┴──────────┴──────────────┴─────────────┘       │
│       ↓         ↓          ↓            ↓              ↓               │
│  ┌──────────┬──────────┬──────────┬──────────────┬─────────────┐       │
│  │ Turn 2   │  ...     │  ...     │  ...         │ ...         │       │
│  └──────────┴──────────┴──────────┴──────────────┴─────────────┘       │
│                                                                        │
│  节点类型渲染:                                                          │
│  ├── session   → GitBranch 图标, 灰色边框                              │
│  ├── context   → Settings2 图标, 琥珀色边框                            │
│  ├── message   → MessageSquare 图标, 灰色边框                          │
│  ├── reasoning → Brain 图标, 翠绿色边框                                │
│  ├── tool_call → Blocks 图标, 天蓝色边框                               │
│  ├── tool_result → Sparkles 图标, 青色边框                             │
│  ├── metric    → Activity 图标, 琥珀色边框                             │
│  ├── status    → Radar 图标, 紫色边框                                  │
│  ├── error     → Bug 图标, 玫瑰色边框                                  │
│  └── other     → FileStack 图标, 灰色边框                              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 二、核心问题诊断

### 问题 1: Reasoning 内容不可读

**现象**: 用户无法直观清晰地查阅 Reasoning 状态下的 flow 内容

**根因链**:
```
原始 reasoning 文本 (可能数千字)
    ↓ buildReasoningContent() 截断到 320 字符
API 返回的 node.content (已丢失大量信息)
    ↓ getCompactContent() 再截断到 180-220 字符
前端渲染的嵌入式卡片内容 (几乎不可读)
    ↓ 卡片 max-width: 220px, 高度受限
最终显示效果: 2-3 行被截断的文本碎片
```

**具体代码位置**:
- `server/api/sessions/[id].get.ts:66-74` — `summarizeText()` 限制 220 字符
- `server/api/sessions/[id].get.ts:128-148` — `buildReasoningContent()` 限制 320 字符
- `app/lib/workspace-track.ts:78-86` — `getCompactContent()` 再次截断
- `app/lib/workspace-track.ts:568-577` — `buildEmbeddedCard()` 使用截断后的内容
- `app/components/WorkspaceTrack.vue:250-255` — 嵌入卡片内容区域

**附加问题**:
- 嵌入式卡片 `min-w-[180px] max-w-[220px]` 太窄
- 没有展开/折叠机制查看完整内容
- Reasoning 的 summary 和 content 没有区分展示

### 问题 2: final_answer 后续内容断裂

**现象**: final_answer 之后如果还有后续 chat 内容，没有连接到下一步的 session_meta 信息

**根因链**:
```
Turn N: [setup] → [user] → [reasoning] → [final_answer]  ← 正常渲染
    ↓ (用户继续对话)
Turn N+1: [user_message] → [reasoning] → [final_answer]  ← 作为新 turn 独立渲染
    ↓
两个 turn 之间没有任何视觉连接
```

**具体代码位置**:
- `app/lib/workspace-track.ts:205-275` — `buildWorkspaceTrackGraph()` 主循环
  - 每个 turn 独立处理，`displayEdges` 只在 turn 内部的节点间建立连接
  - `buildSequentialEdges()` (line 318-339) 只连接同一 turn 内的显示节点
- `app/lib/workspace-track.ts:226-246` — `sessionMetaNode` 只在 `turnIndex === 0` 时渲染
  - 第二个及后续 turn 完全没有 session 上下文信息

**附加问题**:
- 没有跨 turn 的 edge 连接
- 没有 turn 级别的视觉分组 (如泳道标题、分隔线)
- 后续 turn 的 setup 信息 (turn_context) 被合并到 setup 节点但没有 turn 编号标识

### 问题 3: 架构层面的不合理之处

| 维度 | 当前实现 | 理想状态 |
|------|---------|---------|
| 内容保真度 | 多层截断，320→220→180 字符 | 完整保留，按需展开 |
| Turn 间关系 | 完全隔离，无连接 | 有明确的 turn 链式连接 |
| Session 上下文 | 仅第一个 turn 显示 | 每个 turn 都可快速查看 |
| Reasoning 可读性 | 嵌入 220px 小卡片 | 独立面板或可展开详情 |
| 工具调用追踪 | call/result 配对但嵌在 bundle 内 | 独立的工具调用追踪视图 |
| 时间线感知 | 只有 timestamp 文字 | 可视化时间轴 |
| 错误传播 | error 节点独立存在 | 错误影响链可视化 |

---

## 三、改进方案

### Phase 1: 修复 Reasoning 可读性

#### 1.1 API 层: 保留完整 reasoning 内容

**改动文件**: `server/api/sessions/[id].get.ts`

- `buildReasoningContent()` 不再截断，返回完整文本
- 或者返回 `summary` + `content` 两个字段，让前端决定展示策略
- 将 `summarizeText` 的 limit 从 320 提升到 2000+ 或移除

#### 1.2 前端图构建: Reasoning 节点支持完整内容

**改动文件**: `app/lib/workspace-track.ts`

- `buildReasoningBundleNode()` 中为每个 reasoning 文本保留完整内容
- 在 `WorkspaceTrackNodeData` 中新增 `fullContent?: string` 字段
- `buildEmbeddedCard()` 保留完整 content，截断仅用于预览

#### 1.3 前端渲染: Reasoning 可展开详情

**改动文件**: `app/components/WorkspaceTrack.vue`

- 嵌入式卡片增加 "展开" 按钮
- 点击后弹出侧边抽屉或模态框显示完整 reasoning 内容
- 卡片宽度从 `max-w-[220px]` 调整为 `max-w-[320px]` 或响应式

### Phase 2: 修复 Turn 间连接

#### 2.1 API 层: 增加 turn 间关系

**改动文件**: `server/api/sessions/[id].get.ts`

- 在 `CodexSessionWorkflowTurn` 中增加 `previousTurnId?: string`
- 在 `CodexSessionDetail` 中增加 `turnChain: Array<{ from: string, to: string }>`

#### 2.2 前端图构建: 跨 Turn 边

**改动文件**: `app/lib/workspace-track.ts`

- `buildWorkspaceTrackGraph()` 结束时，为相邻 turn 的最后一个→第一个显示节点添加 edge
- edge 样式使用虚线 + 不同颜色以区分 turn 内连接

#### 2.3 前端渲染: Turn 分组标识

**改动文件**: `app/components/WorkspaceTrack.vue`

- 每个 turn 区域添加背景色块或分隔线
- 添加 turn 编号标签 (Turn 1, Turn 2, ...)
- 每个 turn 都显示一个精简的 session 上下文摘要

### Phase 3: 架构优化

#### 3.1 分层内容策略

```
API 返回:
  node.content        → 预览文本 (200 字符)
  node.contentFull    → 完整文本 (无截断)
  node.contentSummary → 结构化摘要 (对 reasoning 有意义)

前端渲染:
  卡片内      → content (预览)
  悬停/点击   → contentFull (完整)
  侧边栏     → contentSummary (结构化)
```

#### 3.2 Turn 级别的泳道视图

```
┌─ Turn 1 ─────────────────────────────────────────────────────┐
│  [Session Meta] → [Setup] → [User] → [Reasoning] → [Answer] │
└──────────────────────────────────────────────────────────────┘
                              ↓ (user continues)
┌─ Turn 2 ─────────────────────────────────────────────────────┐
│  [Setup] → [User] → [Reasoning] → [Answer]                  │
└──────────────────────────────────────────────────────────────┘
```

#### 3.3 Reasoning 展开面板

```
┌─ Reasoning Bundle ──────────────────────┐
│  [Reasoning #1]  [Reasoning #2]  [...]  │  ← 标签页切换
│  ┌─────────────────────────────────────┐│
│  │ 完整的 reasoning 文本               ││  ← 可滚动
│  │ ...                                 ││
│  │ ...                                 ││
│  └─────────────────────────────────────┘│
│  ┌─ Tool Calls ────────────────────────┐│
│  │ 1. function_call → result           ││  ← 工具调用列表
│  │ 2. shell_call → result              ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## 四、关键文件清单

| 文件 | 职责 | 需改动 |
|------|------|--------|
| `shared/types/session.ts` | 类型定义 | 增加 turn 关系类型、完整内容字段 |
| `server/api/sessions/[id].get.ts` | API + 数据处理 | 移除过度截断、增加 turn 链 |
| `app/lib/workspace-track.ts` | 前端图构建 | 跨 turn edge、完整内容传递 |
| `app/components/WorkspaceTrack.vue` | UI 渲染 | reasoning 展开、turn 分组、跨 turn 连接 |
