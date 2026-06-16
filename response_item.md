# `rollout-*.jsonl` 中 `type = "response_item"` 的完整类型整理

这份文档聚焦 `rollout-*.jsonl` 里的：

- 外层 `RolloutLine`
- `item.type === "response_item"` 时的 `payload`
- 哪些 `ResponseItem` 会真正被写入 rollout
- 每种 `ResponseItem` 的 TS 类型

核心源码：

- `codex-main/codex-rs/protocol/src/models.rs`
- `codex-main/codex-rs/rollout/src/policy.rs`
- `codex-main/codex-rs/core/src/tools/router.rs`

---

## 1. rollout 外层结构

`response_item` 在 rollout 里的外层结构是：

```ts
export type RolloutLine<TItem = RolloutItem> = {
  timestamp: string;
} & TItem;

export type RolloutItem =
  | { type: "session_meta"; payload: unknown }
  | { type: "response_item"; payload: ResponseItem }
  | { type: "inter_agent_communication"; payload: unknown }
  | { type: "compacted"; payload: unknown }
  | { type: "turn_context"; payload: unknown }
  | { type: "event_msg"; payload: unknown };

export type RolloutResponseItemLine = RolloutLine<{
  type: "response_item";
  payload: ResponseItem;
}>;
```

也就是说，真正的响应项在：

```ts
line.payload
```

---

## 2. 哪些 `response_item` 会被持久化进 rollout

策略文件：

- `codex-main/codex-rs/rollout/src/policy.rs`

### 2.1 会落盘的 `response_item.type`

```ts
export type PersistedResponseItemType =
  | "message"
  | "agent_message"
  | "reasoning"
  | "local_shell_call"
  | "function_call"
  | "tool_search_call"
  | "function_call_output"
  | "tool_search_output"
  | "custom_tool_call"
  | "custom_tool_call_output"
  | "web_search_call"
  | "image_generation_call"
  | "compaction"
  | "context_compaction";
```

### 2.2 协议里存在但默认不落盘的 `response_item.type`

```ts
export type NonPersistedResponseItemType =
  | "compaction_trigger"
  | "other";
```

---

## 3. 基础别名

```ts
export type JsonValue = unknown;
export type UuidString = string; // wire string，但语义约束为 UUID
export type OpaqueIdString = string; // wire string，但协议不保证固定格式
export type JsonEncodedString = string; // 需要 JSON.parse
export type UrlOrDataUrlString = string; // URL 或 data URL
export type AbsolutePath = string; // 绝对路径字符串
export type DurationString = string; // Rust Duration 的字符串表示

export type MessageRole = string; // 协议未做强约束，常见值为 user/assistant/developer/system

export type MessagePhase = "commentary" | "final_answer";
export type ImageDetail = "auto" | "low" | "high" | "original";

export type ResponseItemMetadata = {
  turn_id?: string;
};
```

### 3.1 `string` 审计规则

```ts
export type ResponseItemStringKind =
  | "uuid_string"
  | "opaque_id_string"
  | "json_encoded_string"
  | "url_or_data_url_string"
  | "absolute_path_string"
  | "duration_string"
  | "enum_string"
  | "free_text";
```

重点例子：

- `function_call.arguments`: `json_encoded_string`
- `content[].image_url`: `url_or_data_url_string`
- `function_call_output.output` 为 `string` 时，有可能是普通文本，也有可能是“结构化内容被 `serde_json::to_string(...)` 后的 JSON 字符串”
- `call_id` / `item id`: 大多是 `opaque_id_string`
- `message.role`: 虽然是 `string`，但常见只会落在少量 role 值
- `status`: 很多地方是“开放字符串”，不是固定 enum

---

## 4. 顶层 `ResponseItem` union

```ts
export interface ResponseItemPayloadMap {
  message: MessageResponseItem;
  agent_message: AgentMessageResponseItem;
  reasoning: ReasoningResponseItem;
  local_shell_call: LocalShellCallResponseItem;
  function_call: FunctionCallResponseItem;
  tool_search_call: ToolSearchCallResponseItem;
  function_call_output: FunctionCallOutputResponseItem;
  custom_tool_call: CustomToolCallResponseItem;
  custom_tool_call_output: CustomToolCallOutputResponseItem;
  tool_search_output: ToolSearchOutputResponseItem;
  web_search_call: WebSearchCallResponseItem;
  image_generation_call: ImageGenerationCallResponseItem;
  compaction: CompactionResponseItem;
  compaction_trigger: CompactionTriggerResponseItem;
  context_compaction: ContextCompactionResponseItem;
  other: OtherResponseItem;
}

export type ResponseItem = {
  [K in keyof ResponseItemPayloadMap]: { type: K } & ResponseItemPayloadMap[K];
}[keyof ResponseItemPayloadMap];
```

---

## 5. 核心嵌套类型

### 5.1 文本 / 图片内容

```ts
export type ContentItem =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: UrlOrDataUrlString; detail?: ImageDetail | null }
  | { type: "output_text"; text: string };

export type AgentMessageInputContent =
  | { type: "input_text"; text: string }
  | { type: "encrypted_content"; encrypted_content: string };
```

### 5.2 reasoning 内容

```ts
export type ReasoningItemReasoningSummary =
  | { type: "summary_text"; text: string };

export type ReasoningItemContent =
  | { type: "reasoning_text"; text: string }
  | { type: "text"; text: string };
```

### 5.3 Local shell

```ts
export type LocalShellStatus =
  | "completed"
  | "in_progress"
  | "incomplete";

export type LocalShellExecAction = {
  command: string[];
  timeout_ms?: number | null;
  working_directory?: string | null;
  env?: Record<string, string> | null;
  user?: string | null;
};

export type LocalShellAction =
  | { type: "exec" } & LocalShellExecAction;
```

### 5.4 WebSearch action

```ts
export type WebSearchAction =
  | { type: "search"; query?: string | null; queries?: string[] | null }
  | { type: "open_page"; url?: string | null }
  | { type: "find_in_page"; url?: string | null; pattern?: string | null }
  | { type: "other" };
```

### 5.5 Function-call output 的真实 wire 形态

`FunctionCallOutputPayload` 在 Rust 里有内部 `success` 字段，但写到 wire 上时，`output` 实际只会序列化成：

- 纯字符串
- 或 `content_items` 数组

所以 rollout 里应该按下面这个 TS 看：

```ts
export type FunctionCallOutputContentItem =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: UrlOrDataUrlString; detail?: ImageDetail | null }
  | { type: "encrypted_content"; encrypted_content: string };

export type FunctionCallOutputBody =
  | string
  | FunctionCallOutputContentItem[];
```

---

## 6. 每种 `ResponseItem` 的 TS 类型

### 6.1 `message`

```ts
export type MessageResponseItem = {
  role: MessageRole;
  content: ContentItem[];
  phase?: MessagePhase | null;
  metadata?: ResponseItemMetadata | null;
};
```

说明：

- 普通 assistant/user/developer message 都走这个形态
- `role === "user"` 的 `ResponseItem::Message` 也可能存在

### 6.2 `agent_message`

```ts
export type AgentMessageResponseItem = {
  author: string;
  recipient: string;
  content: AgentMessageInputContent[];
  metadata?: ResponseItemMetadata | null;
};
```

说明：

- 这是多 agent 协议层的“模型可见 agent-message”
- 和 rollout 里的 `inter_agent_communication` 不是同一个外层 item

### 6.3 `reasoning`

```ts
export type ReasoningResponseItem = {
  summary: ReasoningItemReasoningSummary[];
  content?: ReasoningItemContent[] | null;
  encrypted_content?: string | null;
  metadata?: ResponseItemMetadata | null;
};
```

说明：

- `id` 是内部字段，序列化时跳过
- `content` 可能不存在
- `encrypted_content` 用于加密/隐藏 raw reasoning

### 6.4 `local_shell_call`

```ts
export type LocalShellCallResponseItem = {
  call_id?: OpaqueIdString | null;
  status: LocalShellStatus;
  action: LocalShellAction;
  metadata?: ResponseItemMetadata | null;
};
```

说明：

- 这是旧式 local shell call 表达
- 和现在更常见的 `function_call(name="shell_command")` 不是一回事

### 6.5 `function_call`

```ts
export type FunctionCallResponseItem = {
  name: string;
  namespace?: string | null;
  arguments: JsonEncodedString;
  call_id: OpaqueIdString;
  metadata?: ResponseItemMetadata | null;
};
```

说明：

- `arguments` 不是对象，而是 JSON 字符串
- 实际路由依赖 `(namespace, name)` 组合
- 详细 `name` 全集和 `arguments` 类型见 [function.call.md](/function.call.md)

### 6.6 `tool_search_call`

```ts
export type ToolSearchCallResponseItem = {
  call_id?: OpaqueIdString | null;
  status?: string | null;
  execution: string;
  arguments: JsonValue;
  metadata?: ResponseItemMetadata | null;
};
```

说明：

- `tool_search_call` 不是 `function_call`
- 它有自己的独立 response item 类型

### 6.7 `function_call_output`

```ts
export type FunctionCallOutputResponseItem = {
  call_id: OpaqueIdString;
  output: FunctionCallOutputBody;
  metadata?: ResponseItemMetadata | null;
};
```

说明：

- 这是 `function_call` 的结果项
- `output` 真实 wire 上是：
  - `string`
  - 或 `FunctionCallOutputContentItem[]`

### 6.8 `custom_tool_call`

```ts
export type CustomToolCallResponseItem = {
  status?: string | null;
  call_id: OpaqueIdString;
  name: string;
  input: string;
  metadata?: ResponseItemMetadata | null;
};
```

说明：

- `apply_patch`、code mode `exec` 这类 freeform/custom tool 通常走这个系列，不走普通 `function_call`

### 6.9 `custom_tool_call_output`

```ts
export type CustomToolCallOutputResponseItem = {
  call_id: OpaqueIdString;
  name?: string | null;
  output: FunctionCallOutputBody;
  metadata?: ResponseItemMetadata | null;
};
```

### 6.10 `tool_search_output`

```ts
export type ToolSearchOutputResponseItem = {
  call_id?: OpaqueIdString | null;
  status: string;
  execution: string;
  tools: JsonValue[];
  metadata?: ResponseItemMetadata | null;
};
```

### 6.11 `web_search_call`

```ts
export type WebSearchCallResponseItem = {
  status?: string | null;
  action?: WebSearchAction | null;
  metadata?: ResponseItemMetadata | null;
};
```

说明：

- 这是 Responses API 回来的“模型触发 web search”项
- 它不是 `function_call`

### 6.12 `image_generation_call`

```ts
export type ImageGenerationCallResponseItem = {
  id: OpaqueIdString;
  status: string;
  revised_prompt?: string | null;
  result: string;
  metadata?: ResponseItemMetadata | null;
};
```

说明：

- 这也是 provider 原生 item，不是 `function_call`

### 6.13 `compaction`

```ts
export type CompactionResponseItem = {
  encrypted_content: string;
  metadata?: ResponseItemMetadata | null;
};
```

说明：

- 兼容接受旧别名 `compaction_summary`

### 6.14 `compaction_trigger`

```ts
export type CompactionTriggerResponseItem = {
  metadata?: ResponseItemMetadata | null;
};
```

说明：

- 协议里有，但 rollout 默认不持久化

### 6.15 `context_compaction`

```ts
export type ContextCompactionResponseItem = {
  encrypted_content?: string | null;
  metadata?: ResponseItemMetadata | null;
};
```

### 6.16 `other`

```ts
export type OtherResponseItem = {};
```

说明：

- 这是 `#[serde(other)]`
- 表示遇到未知 `type` 时兜底反序列化成 `Other`
- 默认不会持久化进 rollout

---

## 7. 从“语义”角度看 `response_item`

### 7.1 模型/对话正文类

```ts
export type ConversationLikeResponseItemType =
  | "message"
  | "agent_message"
  | "reasoning";
```

### 7.2 工具调用请求类

```ts
export type ToolRequestResponseItemType =
  | "function_call"
  | "custom_tool_call"
  | "tool_search_call"
  | "web_search_call"
  | "image_generation_call"
  | "local_shell_call";
```

### 7.3 工具调用结果类

```ts
export type ToolResultResponseItemType =
  | "function_call_output"
  | "custom_tool_call_output"
  | "tool_search_output";
```

### 7.4 上下文压缩类

```ts
export type CompactionResponseItemType =
  | "compaction"
  | "compaction_trigger"
  | "context_compaction";
```

---

## 8. 你在 rollout 里最应该注意的几个点

### 8.1 `function_call.arguments` 是字符串

```ts
export type FunctionCallArgumentsAreString = true;
```

所以你解析时要：

```ts
const item = line.payload;
if (item.type === "function_call") {
  const args = JSON.parse(item.arguments);
}
```

### 8.2 `function_call_output.output` 不是固定对象

它可能是：

```ts
type Output = string | FunctionCallOutputContentItem[];
```

不要误写成：

```ts
type Wrong = { body: ...; success: ... };
```

因为 `success` 是内部字段，不是 rollout wire 字段。

而且这里的 `string` 也不能一概当成“自然语言纯文本”：

- 可能是普通工具返回文本
- 也可能是 MCP `structured_content` 被 `serde_json::to_string(...)` 后得到的 JSON 字符串
- 也可能是 MCP 原始 `content` 数组整体被序列化后的 JSON 字符串

### 8.3 `web_search_call` / `image_generation_call` 不是 `function_call`

这两个都属于独立的 response item 类型。

### 8.4 `tool_search_call` 也不是 `function_call`

`tool_search` 是单独的 item 类型，`arguments` 也不是字符串，而是 JSON 对象。

### 8.5 `custom_tool_call` 和 `function_call` 要分开

例如：

- `apply_patch`
- code mode `exec`

更常走 `custom_tool_call`，不是 `function_call`。

---

## 9. 一个推荐的 TS 解析入口

```ts
export type ParsedRolloutResponseItemLine = {
  timestamp: string;
  type: "response_item";
  payload: ResponseItem;
};

export function isFunctionCallItem(
  line: ParsedRolloutResponseItemLine,
): line is ParsedRolloutResponseItemLine & {
  payload: { type: "function_call" } & FunctionCallResponseItem;
} {
  return line.payload.type === "function_call";
}

export function isFunctionCallOutputItem(
  line: ParsedRolloutResponseItemLine,
): line is ParsedRolloutResponseItemLine & {
  payload: { type: "function_call_output" } & FunctionCallOutputResponseItem;
} {
  return line.payload.type === "function_call_output";
}
```

---

## 10. 源码索引

### 10.1 顶层定义

- `codex-main/codex-rs/protocol/src/models.rs`

### 10.2 持久化策略

- `codex-main/codex-rs/rollout/src/policy.rs`

### 10.3 `function_call` 的路由恢复

- `codex-main/codex-rs/core/src/tools/router.rs`

### 10.4 相关补充文档

- `function_call` 的 `name` 全集与 `arguments` 结构： [function.call.md](/function.call.md)
- `event_msg` 的完整协议： [event_msg.md](/event_msg.md)

---

## 11. 实战建议

如果你是为了分析 rollout，建议优先把 `response_item` 分成下面 4 条主线：

1. `message` / `reasoning`
2. `function_call` / `function_call_output`
3. `custom_tool_call` / `custom_tool_call_output`
4. `web_search_call` / `image_generation_call` / `tool_search_call`

这四类分清后，绝大多数 rollout 行就都能解释清楚了。
