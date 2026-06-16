# `rollout-*.jsonl` 中 `type = "event_msg"` 的完整类型整理

这份文档聚焦 `rollout-*.jsonl` 里的：

- 外层 `RolloutLine`
- `item.type === "event_msg"` 时的 `payload`
- 哪些 `EventMsg` 会真正被写入 rollout
- 每种事件对应的 TS 类型

核心源码：

- `codex-main/codex-rs/protocol/src/protocol.rs`
- `codex-main/codex-rs/protocol/src/items.rs`
- `codex-main/codex-rs/protocol/src/approvals.rs`
- `codex-main/codex-rs/protocol/src/dynamic_tools.rs`
- `codex-main/codex-rs/rollout/src/policy.rs`

---

## 1. rollout 外层结构

`rollout-*.jsonl` 每一行先反序列化成：

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
  | { type: "event_msg"; payload: EventMsg };

export type RolloutEventMsgLine = RolloutLine<{
  type: "event_msg";
  payload: EventMsg;
}>;
```

也就是说，真正要看的事件结构在：

```ts
line.payload
```

并且它自己还会再带一层：

```ts
payload.type
```

---

## 2. 哪些 `event_msg` 会被持久化进 rollout

协议层 `EventMsg` 很大，但 rollout 并不是全量持久化。实际策略在：

- `codex-main/codex-rs/rollout/src/policy.rs`

### 2.1 会落盘的 `event_msg.type`

```ts
export type PersistedEventMsgType =
  | "user_message"
  | "agent_message"
  | "agent_reasoning"
  | "agent_reasoning_raw_content"
  | "patch_apply_end"
  | "token_count"
  | "thread_goal_updated"
  | "context_compacted"
  | "entered_review_mode"
  | "exited_review_mode"
  | "mcp_tool_call_end"
  | "thread_rolled_back"
  | "turn_aborted"
  | "task_started"
  | "task_complete"
  | "web_search_end"
  | "image_generation_end"
  | "sub_agent_activity"
  | "item_completed"; // 但仅限 TurnItem::Plan / TurnItem::Sleep
```

### 2.2 协议里存在但默认不落盘的 `event_msg.type`

例如：

- `error`
- `warning`
- `exec_command_begin`
- `exec_command_output_delta`
- `exec_command_end`
- `request_permissions`
- `request_user_input`
- `dynamic_tool_call_request`
- `dynamic_tool_call_response`
- `patch_apply_begin`
- `patch_apply_updated`
- `hook_started`
- `hook_completed`
- `collab_*_begin/end`

这些在协议里都合法，但默认不会写进 rollout 持久化文件。

---

## 3. 常用基础别名

```ts
export type UuidString = string; // wire 是 string，但语义上必须是 UUID
export type OpaqueIdString = string; // wire 是 string，但协议不保证固定格式
export type JsonEncodedString = string; // 需要 JSON.parse
export type Base64String = string; // 二进制转 base64
export type UrlOrDataUrlString = string; // 可能是 http(s) URL，也可能是 data URL
export type DurationString = string; // Rust Duration 序列化后的字符串，不要当成毫秒数字符串

export type ThreadId = UuidString;
export type SessionId = UuidString;
export type AgentPath = string; // 绝对 agent path，通常像 /root/...；有严格 grammar 校验
export type AbsolutePath = string; // wire 是 string，但语义上是绝对文件系统路径
export type PathLike = string; // PathBuf/AbsolutePathBuf 序列化后的路径字符串
export type JsonValue = unknown;

export type MessagePhase = "commentary" | "final_answer";

export type ImageDetail = "auto" | "low" | "high" | "original";

export type ApprovalsReviewer = "user" | "auto_review" | "guardian_subagent";
export type ReasoningEffort = string;
export type ReasoningSummary = "auto" | "concise" | "detailed" | "none";
export type ModeKind = "plan" | "default";
export type ThreadSource =
  | "user"
  | "subagent"
  | "memory_consolidation"
  | string;

export type GranularApprovalConfig = {
  sandbox_approval: boolean;
  rules: boolean;
  skill_approval: boolean;
  request_permissions: boolean;
  mcp_elicitations: boolean;
};

export type AskForApproval =
  | "untrusted"
  | "on_failure"
  | "on_request"
  | "never"
  | { granular: GranularApprovalConfig };

export type PermissionProfile = Record<string, unknown>;
export type ActivePermissionProfile = unknown;
export type Personality = "none" | "friendly" | "pragmatic";
export type CollaborationMode = {
  mode: ModeKind;
  settings: {
    model: string;
    reasoning_effort?: ReasoningEffort | null;
    developer_instructions?: string | null;
  };
};
export type ResponseItem = unknown; // 详见 response_item.md
export type TextElement = {
  byte_range: {
    start: number;
    end: number;
  };
};

export type PlanType =
  | "free"
  | "go"
  | "plus"
  | "pro"
  | "prolite"
  | "team"
  | "self_serve_business_usage_based"
  | "business"
  | "enterprise_cbp_usage_based"
  | "enterprise"
  | "edu"
  | "unknown";
```

说明：

- `PermissionProfile` / `CollaborationMode` / `Personality` 属于共享协议大类型，源码定义分别散落在 `models.rs` / `config_types.rs`，这里保留为别名，重点还是 `event_msg` 自身结构。

### 3.1 `string` 审计规则

下面这些“看起来是 string”的字段，语义完全不同，不能混着处理：

```ts
export type EventMsgStringKind =
  | "uuid_string"
  | "opaque_id_string"
  | "absolute_path_string"
  | "agent_path_string"
  | "duration_string"
  | "base64_string"
  | "url_or_data_url_string"
  | "enum_string"
  | "free_text"
  | "json_encoded_string";
```

重点例子：

- `thread_id` / `session_id`: wire 是 `string`，但实际是 UUID
- `agent_path`: wire 是 `string`，但实际必须满足 `/root/...` 的路径 grammar
- `cwd` / `path` / `rollout_path`: wire 是 `string`，但实际是路径
- `duration`: wire 是 `string`，但实际是 Rust `Duration`
- `chunk`: wire 是 `string`，但实际是 base64
- `image_url`: wire 是 `string`，但实际可能是 URL 或 data URL
- `reasoning_effort` / `plan_type` / `personality`: wire 是 `string`，但实际是枚举字符串
- `message` / `prompt` / `rationale`: 才是普通 free text
- `function_call.arguments` 那种才属于 `json_encoded_string`

---

## 4. `EventMsg` 顶层 union

注意两点：

1. `TurnStarted` 在 wire 上实际名字是 `task_started`，兼容接受 `turn_started`
2. `TurnComplete` 在 wire 上实际名字是 `task_complete`，兼容接受 `turn_complete`

```ts
export interface EventMsgPayloadMap {
  error: ErrorEvent;
  warning: WarningEvent;
  guardian_warning: WarningEvent;

  realtime_conversation_started: RealtimeConversationStartedEvent;
  realtime_conversation_realtime: RealtimeConversationRealtimeEvent;
  realtime_conversation_closed: RealtimeConversationClosedEvent;
  realtime_conversation_sdp: RealtimeConversationSdpEvent;

  model_reroute: ModelRerouteEvent;
  model_verification: ModelVerificationEvent;
  turn_moderation_metadata: TurnModerationMetadataEvent;

  context_compacted: ContextCompactedEvent;
  thread_rolled_back: ThreadRolledBackEvent;

  task_started: TurnStartedEvent;
  task_complete: TurnCompleteEvent;

  thread_settings_applied: ThreadSettingsAppliedEvent;
  token_count: TokenCountEvent;

  agent_message: AgentMessageEvent;
  user_message: UserMessageEvent;
  agent_reasoning: AgentReasoningEvent;
  agent_reasoning_raw_content: AgentReasoningRawContentEvent;
  agent_reasoning_section_break: AgentReasoningSectionBreakEvent;

  session_configured: SessionConfiguredEvent;
  thread_goal_updated: ThreadGoalUpdatedEvent;

  mcp_startup_update: McpStartupUpdateEvent;
  mcp_startup_complete: McpStartupCompleteEvent;

  mcp_tool_call_begin: McpToolCallBeginEvent;
  mcp_tool_call_end: McpToolCallEndEvent;

  web_search_begin: WebSearchBeginEvent;
  web_search_end: WebSearchEndEvent;

  image_generation_begin: ImageGenerationBeginEvent;
  image_generation_end: ImageGenerationEndEvent;

  exec_command_begin: ExecCommandBeginEvent;
  exec_command_output_delta: ExecCommandOutputDeltaEvent;
  terminal_interaction: TerminalInteractionEvent;
  exec_command_end: ExecCommandEndEvent;

  view_image_tool_call: ViewImageToolCallEvent;

  exec_approval_request: ExecApprovalRequestEvent;
  request_permissions: RequestPermissionsEvent;
  request_user_input: RequestUserInputEvent;
  dynamic_tool_call_request: DynamicToolCallRequestEvent;
  dynamic_tool_call_response: DynamicToolCallResponseEvent;
  elicitation_request: ElicitationRequestEvent;
  apply_patch_approval_request: ApplyPatchApprovalRequestEvent;
  guardian_assessment: GuardianAssessmentEvent;

  deprecation_notice: DeprecationNoticeEvent;
  stream_error: StreamErrorEvent;

  patch_apply_begin: PatchApplyBeginEvent;
  patch_apply_updated: PatchApplyUpdatedEvent;
  patch_apply_end: PatchApplyEndEvent;

  turn_diff: TurnDiffEvent;
  realtime_conversation_list_voices_response: RealtimeConversationListVoicesResponseEvent;

  plan_update: PlanUpdateEvent;
  turn_aborted: TurnAbortedEvent;
  shutdown_complete: ShutdownCompleteEvent;

  entered_review_mode: ReviewRequest;
  exited_review_mode: ExitedReviewModeEvent;

  raw_response_item: RawResponseItemEvent;
  item_started: ItemStartedEvent;
  item_completed: ItemCompletedEvent;
  hook_started: HookStartedEvent;
  hook_completed: HookCompletedEvent;

  agent_message_content_delta: AgentMessageContentDeltaEvent;
  plan_delta: PlanDeltaEvent;
  reasoning_content_delta: ReasoningContentDeltaEvent;
  reasoning_raw_content_delta: ReasoningRawContentDeltaEvent;

  collab_agent_spawn_begin: CollabAgentSpawnBeginEvent;
  collab_agent_spawn_end: CollabAgentSpawnEndEvent;
  collab_agent_interaction_begin: CollabAgentInteractionBeginEvent;
  collab_agent_interaction_end: CollabAgentInteractionEndEvent;
  collab_waiting_begin: CollabWaitingBeginEvent;
  collab_waiting_end: CollabWaitingEndEvent;
  collab_close_begin: CollabCloseBeginEvent;
  collab_close_end: CollabCloseEndEvent;
  collab_resume_begin: CollabResumeBeginEvent;
  collab_resume_end: CollabResumeEndEvent;

  sub_agent_activity: SubAgentActivityEvent;
}

export type EventMsg = {
  [K in keyof EventMsgPayloadMap]: { type: K } & EventMsgPayloadMap[K];
}[keyof EventMsgPayloadMap];
```

为了表达 `shutdown_complete` 这种无字段事件：

```ts
export type ShutdownCompleteEvent = {};
export type PlanUpdateEvent = UpdatePlanArgs;
```

---

## 5. 核心 payload 类型

### 5.1 错误 / 警告 / 路由

```ts
export type CodexErrorInfo =
  | "context_window_exceeded"
  | "usage_limit_exceeded"
  | "server_overloaded"
  | "cyber_policy"
  | "internal_server_error"
  | "unauthorized"
  | "bad_request"
  | "sandbox_error"
  | "other"
  | { http_connection_failed: { http_status_code?: number | null } }
  | { response_stream_connection_failed: { http_status_code?: number | null } }
  | { response_stream_disconnected: { http_status_code?: number | null } }
  | { response_too_many_failed_attempts: { http_status_code?: number | null } }
  | { active_turn_not_steerable: { turn_kind: "review" | "compact" } }
  | "thread_rollback_failed";

export type ErrorEvent = {
  message: string;
  codex_error_info?: CodexErrorInfo | null;
};

export type WarningEvent = {
  message: string;
};

export type ModelRerouteEvent = {
  from_model: string;
  to_model: string;
  reason: "high_risk_cyber_activity";
};

export type ModelVerificationEvent = {
  verifications: Array<"trusted_access_for_cyber">;
};

export type TurnModerationMetadataEvent = {
  metadata: JsonValue;
};
```

### 5.2 turn 生命周期

```ts
export type TurnStartedEvent = {
  turn_id: string;
  trace_id?: string;
  started_at?: number | null;
  model_context_window?: number | null;
  collaboration_mode_kind: ModeKind;
};

export type TurnCompleteEvent = {
  turn_id: string;
  last_agent_message?: string | null;
  completed_at?: number | null;
  duration_ms?: number | null;
  time_to_first_token_ms?: number | null;
};

export type TurnAbortReason =
  | "interrupted"
  | "replaced"
  | "review_ended"
  | "budget_limited";

export type TurnAbortedEvent = {
  turn_id?: string | null;
  reason: TurnAbortReason;
  completed_at?: number | null;
  duration_ms?: number | null;
};

export type ContextCompactedEvent = {};

export type ThreadRolledBackEvent = {
  num_turns: number;
};
```

### 5.3 线程设置 / session 配置

```ts
export type ThreadSettingsSnapshot = {
  model: string;
  model_provider_id: string;
  service_tier?: string | null;
  approval_policy: AskForApproval;
  approvals_reviewer: ApprovalsReviewer;
  permission_profile: PermissionProfile;
  active_permission_profile?: ActivePermissionProfile;
  cwd: AbsolutePath;
  reasoning_effort?: ReasoningEffort | null;
  reasoning_summary?: ReasoningSummary | null;
  personality?: Personality | null;
  collaboration_mode: CollaborationMode;
};

export type ThreadSettingsAppliedEvent = {
  thread_settings: ThreadSettingsSnapshot;
};

export type SessionNetworkProxyRuntime = {
  http_addr: string;
  socks_addr: string;
};

export type SessionConfiguredEvent = {
  session_id: SessionId;
  thread_id: ThreadId;
  forked_from_id?: ThreadId | null;
  parent_thread_id?: ThreadId | null;
  thread_source?: ThreadSource | null;
  thread_name?: string | null;
  model: string;
  model_provider_id: string;
  service_tier?: string | null;
  approval_policy: AskForApproval;
  approvals_reviewer: ApprovalsReviewer;
  permission_profile: PermissionProfile;
  active_permission_profile?: ActivePermissionProfile;
  cwd: AbsolutePath;
  reasoning_effort?: ReasoningEffort | null;
  initial_messages?: EventMsg[] | null;
  network_proxy?: SessionNetworkProxyRuntime | null;
  rollout_path?: PathLike | null;
};
```

### 5.4 token / 限额

```ts
export type TokenUsage = {
  input_tokens: number;
  cached_input_tokens: number;
  output_tokens: number;
  reasoning_output_tokens: number;
  total_tokens: number;
};

export type RateLimitReachedType =
  | "rate_limit_reached"
  | "workspace_owner_credits_depleted"
  | "workspace_member_credits_depleted"
  | "workspace_owner_usage_limit_reached"
  | "workspace_member_usage_limit_reached";

export type RateLimitWindow = {
  used_percent: number;
  window_minutes?: number | null;
  resets_at?: number | null;
};

export type CreditsSnapshot = {
  has_credits: boolean;
  unlimited: boolean;
  balance?: string | null;
};

export type SpendControlLimitSnapshot = {
  limit: string;
  used: string;
  remaining_percent: number;
  resets_at: number;
};

export type RateLimitSnapshot = {
  limit_id?: string | null;
  limit_name?: string | null;
  primary?: RateLimitWindow | null;
  secondary?: RateLimitWindow | null;
  credits?: CreditsSnapshot | null;
  individual_limit?: SpendControlLimitSnapshot | null;
  plan_type?: PlanType | null;
  rate_limit_reached_type?: RateLimitReachedType | null;
};

export type TokenUsageInfo = {
  total_token_usage: TokenUsage;
  last_token_usage: TokenUsage;
  model_context_window?: number | null;
};

export type TokenCountEvent = {
  info?: TokenUsageInfo | null;
  rate_limits?: RateLimitSnapshot | null;
};
```

### 5.5 文本 / reasoning / review

```ts
export type MemoryCitationEntry = {
  path: string;
  line_start: number;
  line_end: number;
  note: string;
};

export type MemoryCitation = {
  entries: MemoryCitationEntry[];
  rollout_ids: string[];
};

export type AgentMessageEvent = {
  message: string;
  phase?: MessagePhase | null;
  memory_citation?: MemoryCitation | null;
};

export type UserMessageEvent = {
  client_id?: string | null;
  message: string;
  images?: string[] | null;
  image_details: Array<ImageDetail | null>;
  local_images: string[];
  local_image_details: Array<ImageDetail | null>;
  text_elements: TextElement[];
};

export type AgentReasoningEvent = {
  text: string;
};

export type AgentReasoningRawContentEvent = {
  text: string;
};

export type AgentReasoningSectionBreakEvent = {
  item_id: string;
  summary_index: number;
};

export type AgentMessageContentDeltaEvent = {
  thread_id: string;
  turn_id: string;
  item_id: string;
  delta: string;
};

export type PlanDeltaEvent = {
  thread_id: string;
  turn_id: string;
  item_id: string;
  delta: string;
};

export type ReasoningContentDeltaEvent = {
  thread_id: string;
  turn_id: string;
  item_id: string;
  delta: string;
  summary_index: number;
};

export type ReasoningRawContentDeltaEvent = {
  thread_id: string;
  turn_id: string;
  item_id: string;
  delta: string;
  content_index: number;
};
```

### 5.6 review 模式

```ts
export type ReviewTarget =
  | { type: "uncommittedChanges" }
  | { type: "baseBranch"; branch: string }
  | { type: "commit"; sha: string; title?: string | null }
  | { type: "custom"; instructions: string };

export type ReviewRequest = {
  target: ReviewTarget;
  user_facing_hint?: string | null;
};

export type ReviewLineRange = {
  start: number;
  end: number;
};

export type ReviewCodeLocation = {
  absolute_file_path: PathLike;
  line_range: ReviewLineRange;
};

export type ReviewFinding = {
  title: string;
  body: string;
  confidence_score: number;
  priority: number;
  code_location: ReviewCodeLocation;
};

export type ReviewOutputEvent = {
  findings: ReviewFinding[];
  overall_correctness: string;
  overall_explanation: string;
  overall_confidence_score: number;
};

export type ExitedReviewModeEvent = {
  review_output?: ReviewOutputEvent | null;
};
```

### 5.7 goal / thread goal

```ts
export type ThreadGoalStatus =
  | "active"
  | "paused"
  | "blocked"
  | "usage_limited"
  | "budget_limited"
  | "complete";

export type ThreadGoal = {
  thread_id: ThreadId;
  objective: string;
  status: ThreadGoalStatus;
  token_budget?: number | null;
  tokens_used: number;
  time_used_seconds: number;
  created_at: number;
  updated_at: number;
};

export type ThreadGoalUpdatedEvent = {
  thread_id: ThreadId;
  turn_id?: string | null;
  goal: ThreadGoal;
};
```

### 5.8 MCP / Dynamic tool / realtime

```ts
export type RequestId = string | number;

export type McpInvocation = {
  server: string;
  tool: string;
  arguments?: JsonValue | null;
};

export type CallToolResult = {
  content: JsonValue[];
  structured_content?: JsonValue | null;
  is_error?: boolean | null;
  meta?: JsonValue | null;
};

export type McpToolCallBeginEvent = {
  call_id: OpaqueIdString;
  invocation: McpInvocation;
  mcp_app_resource_uri?: string | null;
  plugin_id?: string | null;
};

export type McpToolCallEndEvent = {
  call_id: OpaqueIdString;
  invocation: McpInvocation;
  mcp_app_resource_uri?: string | null;
  plugin_id?: string | null;
  duration: DurationString;
  result:
    | { Ok: CallToolResult }
    | { Err: string };
};

export type DynamicToolCallOutputContentItem =
  | { type: "inputText"; text: string }
  | { type: "inputImage"; image_url: UrlOrDataUrlString };

export type DynamicToolCallRequestEvent = {
  callId: OpaqueIdString;
  turnId: OpaqueIdString;
  startedAtMs: number;
  namespace?: string | null;
  tool: string;
  arguments: JsonValue;
};

export type DynamicToolCallResponseEvent = {
  call_id: string;
  turn_id: string;
  completed_at_ms: number;
  namespace?: string | null;
  tool: string;
  arguments: JsonValue;
  content_items: DynamicToolCallOutputContentItem[];
  success: boolean;
  error?: string | null;
  duration: DurationString;
};

export type RealtimeConversationStartedEvent = {
  realtime_session_id?: string | null;
  version: "v1" | "v2";
};

export type RealtimeConversationRealtimeEvent = {
  payload: JsonValue;
};

export type RealtimeConversationClosedEvent = {
  reason?: string | null;
};

export type RealtimeConversationSdpEvent = {
  sdp: string; // SDP 文本，不是 JSON
};

export type RealtimeConversationListVoicesResponseEvent = {
  voices: {
    v1: string[];
    v2: string[];
    default_v1: string;
    default_v2: string;
  };
};
```

### 5.9 web / image / exec / patch

```ts
export type WebSearchAction =
  | { type: "search"; query?: string | null; queries?: string[] | null }
  | { type: "open_page"; url?: string | null }
  | { type: "find_in_page"; url?: string | null; pattern?: string | null }
  | { type: "other" };

export type WebSearchBeginEvent = {
  call_id: OpaqueIdString;
};

export type WebSearchEndEvent = {
  call_id: OpaqueIdString;
  query: string;
  action: WebSearchAction;
};

export type ImageGenerationBeginEvent = {
  call_id: OpaqueIdString;
};

export type ImageGenerationEndEvent = {
  call_id: OpaqueIdString;
  status: string;
  revised_prompt?: string | null;
  result: string;
  saved_path?: AbsolutePath | null;
};

export type ExecCommandSource =
  | "agent"
  | "user_shell"
  | "unified_exec_startup"
  | "unified_exec_interaction";

export type ExecCommandStatus =
  | "completed"
  | "failed"
  | "declined";

export type ParsedCommand =
  | { type: "read"; cmd: string; name: string; path: PathLike }
  | { type: "list_files"; cmd: string; path?: string | null }
  | { type: "search"; cmd: string; query?: string | null; path?: string | null }
  | { type: "unknown"; cmd: string };

export type ExecCommandBeginEvent = {
  call_id: OpaqueIdString;
  process_id?: OpaqueIdString | null;
  turn_id: OpaqueIdString;
  started_at_ms: number;
  command: string[];
  cwd: AbsolutePath;
  parsed_cmd: ParsedCommand[];
  source: ExecCommandSource;
  interaction_input?: string | null;
};

export type ExecOutputStream = "stdout" | "stderr";

export type ExecCommandOutputDeltaEvent = {
  call_id: OpaqueIdString;
  stream: ExecOutputStream;
  chunk: Base64String;
};

export type TerminalInteractionEvent = {
  call_id: OpaqueIdString;
  process_id: OpaqueIdString;
  stdin: string;
};

export type ExecCommandEndEvent = {
  call_id: OpaqueIdString;
  process_id?: OpaqueIdString | null;
  turn_id: OpaqueIdString;
  completed_at_ms: number;
  command: string[];
  cwd: AbsolutePath;
  parsed_cmd: ParsedCommand[];
  source: ExecCommandSource;
  interaction_input?: string | null;
  stdout: string;
  stderr: string;
  aggregated_output: string;
  exit_code: number;
  duration: DurationString;
  formatted_output: string;
  status: ExecCommandStatus;
};

export type ViewImageToolCallEvent = {
  call_id: OpaqueIdString;
  path: AbsolutePath;
};

export type FileChange =
  | { type: "add"; content: string }
  | { type: "delete"; content: string }
  | { type: "update"; unified_diff: string; move_path?: PathLike | null };

export type PatchApplyStatus = "completed" | "failed" | "declined";

export type PatchApplyBeginEvent = {
  call_id: OpaqueIdString;
  turn_id: OpaqueIdString;
  auto_approved: boolean;
  changes: Record<string, FileChange>;
};

export type PatchApplyUpdatedEvent = {
  call_id: OpaqueIdString;
  changes: Record<string, FileChange>;
};

export type PatchApplyEndEvent = {
  call_id: OpaqueIdString;
  turn_id: OpaqueIdString;
  stdout: string;
  stderr: string;
  success: boolean;
  changes: Record<string, FileChange>;
  status: PatchApplyStatus;
};

export type TurnDiffEvent = {
  unified_diff: string;
};
```

### 5.10 审批 / guardian / elicitation / user-input 请求

```ts
export type NetworkApprovalProtocol =
  | "http"
  | "https"
  | "socks5_tcp"
  | "socks5_udp";

export type NetworkApprovalContext = {
  host: string;
  protocol: NetworkApprovalProtocol;
};

export type AdditionalPermissionProfile = Record<string, unknown>;
export type RequestPermissionProfile = Record<string, unknown>;

export type ExecPolicyAmendment = string[];

export type NetworkPolicyRuleAction = "allow" | "deny";

export type NetworkPolicyAmendment = {
  host: string;
  action: NetworkPolicyRuleAction;
};

export type ReviewDecision =
  | "approved"
  | "approved_for_session"
  | "denied"
  | "timed_out"
  | "abort"
  | { approved_execpolicy_amendment: { proposed_execpolicy_amendment: ExecPolicyAmendment } }
  | { network_policy_amendment: { network_policy_amendment: NetworkPolicyAmendment } };

export type ExecApprovalRequestEvent = {
  call_id: OpaqueIdString;
  approval_id?: OpaqueIdString | null;
  turn_id: OpaqueIdString;
  started_at_ms: number;
  command: string[];
  cwd: AbsolutePath;
  reason?: string | null;
  network_approval_context?: NetworkApprovalContext | null;
  proposed_execpolicy_amendment?: ExecPolicyAmendment | null;
  proposed_network_policy_amendments?: NetworkPolicyAmendment[] | null;
  additional_permissions?: AdditionalPermissionProfile | null;
  available_decisions?: ReviewDecision[] | null;
  parsed_cmd: ParsedCommand[];
};

export type RequestPermissionsEvent = {
  call_id: OpaqueIdString;
  turn_id: OpaqueIdString;
  environmentId?: string | null;
  started_at_ms: number;
  reason?: string | null;
  permissions: RequestPermissionProfile;
  cwd?: AbsolutePath | null;
};

export type RequestUserInputQuestionOption = {
  label: string;
  description: string;
};

export type RequestUserInputQuestion = {
  id: string;
  header: string;
  question: string;
  isOther: boolean;
  isSecret: boolean;
  options?: RequestUserInputQuestionOption[] | null;
};

export type RequestUserInputEvent = {
  call_id: OpaqueIdString;
  turn_id: OpaqueIdString;
  questions: RequestUserInputQuestion[];
  autoResolutionMs?: number | null;
};

export type ElicitationRequest =
  | {
      mode: "form";
      _meta?: JsonValue | null;
      message: string;
      requested_schema: JsonValue;
    }
  | {
      mode: "url";
      _meta?: JsonValue | null;
      message: string;
      url: string;
      elicitation_id: string;
    };

export type ElicitationRequestEvent = {
  turn_id?: string | null;
  server_name: string;
  id: RequestId;
  request: ElicitationRequest;
};

export type GuardianRiskLevel = "low" | "medium" | "high" | "critical";
export type GuardianUserAuthorization = "unknown" | "low" | "medium" | "high";
export type GuardianAssessmentStatus =
  | "in_progress"
  | "approved"
  | "denied"
  | "timed_out"
  | "aborted";
export type GuardianAssessmentDecisionSource = "agent";
export type GuardianCommandSource = "shell" | "unified_exec";

export type GuardianAssessmentAction =
  | { type: "command"; source: GuardianCommandSource; command: string; cwd: AbsolutePath }
  | { type: "execve"; source: GuardianCommandSource; program: string; argv: string[]; cwd: AbsolutePath }
  | { type: "apply_patch"; cwd: AbsolutePath; files: AbsolutePath[] }
  | { type: "network_access"; target: string; host: string; protocol: NetworkApprovalProtocol; port: number }
  | {
      type: "mcp_tool_call";
      server: string;
      tool_name: string;
      connector_id?: string | null;
      connector_name?: string | null;
      tool_title?: string | null;
    }
  | { type: "request_permissions"; reason?: string | null; permissions: RequestPermissionProfile };

export type GuardianAssessmentEvent = {
  id: OpaqueIdString;
  target_item_id?: OpaqueIdString | null;
  turn_id: OpaqueIdString;
  started_at_ms: number;
  completed_at_ms?: number | null;
  status: GuardianAssessmentStatus;
  risk_level?: GuardianRiskLevel | null;
  user_authorization?: GuardianUserAuthorization | null;
  rationale?: string | null;
  decision_source?: GuardianAssessmentDecisionSource | null;
  action: GuardianAssessmentAction;
};

export type ApplyPatchApprovalRequestEvent = {
  call_id: OpaqueIdString;
  turn_id: OpaqueIdString;
  started_at_ms: number;
  changes: Record<string, FileChange>;
  reason?: string | null;
  grant_root?: PathLike | null;
};
```

### 5.11 Hook / Item lifecycle / Plan update

```ts
export type HookRunSummary = {
  id: OpaqueIdString;
  event_name:
    | "pre_tool_use"
    | "permission_request"
    | "post_tool_use"
    | "pre_compact"
    | "post_compact"
    | "session_start"
    | "user_prompt_submit"
    | "subagent_start"
    | "subagent_stop"
    | "stop";
  handler_type: "command" | "prompt" | "agent";
  execution_mode: "sync" | "async";
  scope: "thread" | "turn";
  source_path: AbsolutePath;
  source:
    | "system"
    | "user"
    | "project"
    | "mdm"
    | "session_flags"
    | "plugin"
    | "cloud_requirements"
    | "cloud_managed_config"
    | "legacy_managed_config_file"
    | "legacy_managed_config_mdm"
    | "unknown";
  display_order: number;
  status: "running" | "completed" | "failed" | "blocked" | "stopped";
  status_message?: string | null;
  started_at: number;
  completed_at?: number | null;
  duration_ms?: number | null;
  entries: Array<{
    kind: "warning" | "stop" | "feedback" | "context" | "error";
    text: string;
  }>;
};

export type HookStartedEvent = {
  turn_id?: string | null;
  run: HookRunSummary;
};

export type HookCompletedEvent = {
  turn_id?: string | null;
  run: HookRunSummary;
};

export type UpdatePlanArgs = {
  explanation?: string;
  plan: Array<{
    step: string;
    status: "pending" | "in_progress" | "completed";
  }>;
};
```

### 5.12 Turn item 事件

```ts
export type TurnItem =
  | { type: "UserMessage"; id: string; client_id?: string | null; content: unknown[] }
  | { type: "HookPrompt"; id: string; fragments: Array<{ text: string; hook_run_id: string }> }
  | { type: "AgentMessage"; id: string; content: Array<{ type: "Text"; text: string }>; phase?: MessagePhase | null; memory_citation?: MemoryCitation | null }
  | { type: "Plan"; id: string; text: string }
  | { type: "Reasoning"; id: string; summary_text: string[]; raw_content: string[] }
  | { type: "WebSearch"; id: string; query: string; action: WebSearchAction }
  | { type: "ImageView"; id: string; path: AbsolutePath }
  | { type: "Sleep"; id: string; duration_ms: number }
  | { type: "ImageGeneration"; id: string; status: string; revised_prompt?: string | null; result: string; saved_path?: AbsolutePath | null }
  | { type: "FileChange"; id: string; changes: Record<string, FileChange>; status?: PatchApplyStatus | null; auto_approved?: boolean | null; stdout?: string | null; stderr?: string | null }
  | { type: "McpToolCall"; id: string; server: string; tool: string; arguments: JsonValue; mcp_app_resource_uri?: string | null; plugin_id?: string | null; status: "inProgress" | "completed" | "failed"; result?: CallToolResult | null; error?: { message: string } | null; duration?: DurationString | null }
  | { type: "ContextCompaction"; id: string };

export type RawResponseItemEvent = {
  item: ResponseItem;
};

export type ItemStartedEvent = {
  thread_id: ThreadId;
  turn_id: string;
  item: TurnItem;
  started_at_ms: number;
};

export type ItemCompletedEvent = {
  thread_id: ThreadId;
  turn_id: string;
  item: TurnItem;
  completed_at_ms: number;
};
```

### 5.13 sub-agent / collab

```ts
export type AgentStatus =
  | "pending_init"
  | "running"
  | "interrupted"
  | "shutdown"
  | "not_found"
  | { completed: string | null }
  | { errored: string };

export type CollabAgentRef = {
  thread_id: ThreadId;
  agent_nickname?: string | null;
  agent_role?: string | null;
};

export type CollabAgentStatusEntry = {
  thread_id: ThreadId;
  agent_nickname?: string | null;
  agent_role?: string | null;
  status: AgentStatus;
};

export type CollabAgentSpawnBeginEvent = {
  call_id: string;
  started_at_ms: number;
  sender_thread_id: ThreadId;
  prompt: string;
  model: string;
  reasoning_effort: ReasoningEffort;
};

export type CollabAgentSpawnEndEvent = {
  call_id: string;
  completed_at_ms: number;
  sender_thread_id: ThreadId;
  new_thread_id?: ThreadId | null;
  new_agent_nickname?: string | null;
  new_agent_role?: string | null;
  prompt: string;
  model: string;
  reasoning_effort: ReasoningEffort;
  status: AgentStatus;
};

export type CollabAgentInteractionBeginEvent = {
  call_id: string;
  started_at_ms: number;
  sender_thread_id: ThreadId;
  receiver_thread_id: ThreadId;
  prompt: string;
};

export type CollabAgentInteractionEndEvent = {
  call_id: string;
  completed_at_ms: number;
  sender_thread_id: ThreadId;
  receiver_thread_id: ThreadId;
  receiver_agent_nickname?: string | null;
  receiver_agent_role?: string | null;
  prompt: string;
  status: AgentStatus;
};

export type CollabWaitingBeginEvent = {
  started_at_ms: number;
  sender_thread_id: ThreadId;
  receiver_thread_ids: ThreadId[];
  receiver_agents: CollabAgentRef[];
  call_id: string;
};

export type CollabWaitingEndEvent = {
  sender_thread_id: ThreadId;
  call_id: string;
  completed_at_ms: number;
  agent_statuses: CollabAgentStatusEntry[];
  statuses: Record<string, AgentStatus>;
};

export type CollabCloseBeginEvent = {
  call_id: string;
  started_at_ms: number;
  sender_thread_id: ThreadId;
  receiver_thread_id: ThreadId;
};

export type CollabCloseEndEvent = {
  call_id: string;
  completed_at_ms: number;
  sender_thread_id: ThreadId;
  receiver_thread_id: ThreadId;
  receiver_agent_nickname?: string | null;
  receiver_agent_role?: string | null;
  status: AgentStatus;
};

export type CollabResumeBeginEvent = {
  call_id: string;
  started_at_ms: number;
  sender_thread_id: ThreadId;
  receiver_thread_id: ThreadId;
  receiver_agent_nickname?: string | null;
  receiver_agent_role?: string | null;
};

export type CollabResumeEndEvent = {
  call_id: string;
  completed_at_ms: number;
  sender_thread_id: ThreadId;
  receiver_thread_id: ThreadId;
  receiver_agent_nickname?: string | null;
  receiver_agent_role?: string | null;
  status: AgentStatus;
};

export type SubAgentActivityKind =
  | "started"
  | "interacted"
  | "interrupted";

export type SubAgentActivityEvent = {
  event_id: OpaqueIdString;
  occurred_at_ms: number;
  agent_thread_id: ThreadId;
  agent_path: AgentPath;
  kind: SubAgentActivityKind;
};
```

---

## 6. 你在 rollout 里实际最常看到的几类

如果是持久化后的 `event_msg`，最常见通常是：

- `task_started`
- `task_complete`
- `user_message`
- `agent_message`
- `agent_reasoning`
- `agent_reasoning_raw_content`
- `token_count`
- `patch_apply_end`
- `mcp_tool_call_end`
- `web_search_end`
- `image_generation_end`
- `thread_goal_updated`
- `turn_aborted`
- `sub_agent_activity`

---

## 7. 源码索引

### 7.1 `EventMsg` 顶层

- `codex-main/codex-rs/protocol/src/protocol.rs`

### 7.2 外部依赖类型

- `RequestPermissionsEvent`: `codex-main/codex-rs/protocol/src/request_permissions.rs`
- `RequestUserInputEvent`: `codex-main/codex-rs/protocol/src/request_user_input.rs`
- `DynamicToolCallRequest`: `codex-main/codex-rs/protocol/src/dynamic_tools.rs`
- `ExecApprovalRequestEvent` / `GuardianAssessmentEvent` / `ElicitationRequestEvent` / `ApplyPatchApprovalRequestEvent`: `codex-main/codex-rs/protocol/src/approvals.rs`
- `TurnItem`: `codex-main/codex-rs/protocol/src/items.rs`
- `ResponseItem`: `codex-main/codex-rs/protocol/src/models.rs`

---

## 8. 实际解析建议

解析 `event_msg` 行时建议按下面顺序：

1. 先判断外层 `line.type === "event_msg"`
2. 再判断 `line.payload.type`
3. 如果你是做“rollout 持久化分析”，优先只处理 `PersistedEventMsgType`
4. 对 `task_started` / `task_complete` 记得兼容老别名
5. 对 `Duration`、`ThreadId`、`PermissionProfile` 这类共享协议字段，不要先入为主写死成本地业务类型

如果你后面要继续做自动解析器，推荐把这份文档里的 `EventMsgPayloadMap` 直接改成 TS 源码文件来用。
