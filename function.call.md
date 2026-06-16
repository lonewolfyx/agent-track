# `type: "function_call"` in `codex-main`

This note answers two questions:

1. What `name` values can appear inside a `ResponseItem::FunctionCall`?
2. Where do the corresponding `arguments` definitions live?

Important: on the wire, `arguments` is always a JSON string, not an already-parsed object.

Source of truth:

- Wire item shape: `codex-main/codex-rs/protocol/src/models.rs`
- Router that reconstructs tool calls: `codex-main/codex-rs/core/src/tools/router.rs`
- Core function tool specs: `codex-main/codex-rs/core/src/tools/handlers/*`
- Code-mode wait function tool: `codex-main/codex-rs/core/src/tools/code_mode/wait_spec.rs`
- MCP dynamic naming: `codex-main/codex-rs/codex-mcp/src/tools.rs`
- Dynamic tool runtime: `codex-main/codex-rs/core/src/tools/handlers/dynamic.rs`

## 1. Wire shape

```ts
export interface FunctionCallWireItem {
    type: 'function_call'
    name: string
    namespace?: string
    arguments: string // JSON string
    call_id: string
    metadata?: unknown
}

export type ParsedFunctionCall<TArgs = unknown> = Omit<FunctionCallWireItem, 'arguments'> & {
    arguments: TArgs
}
```

Runtime dispatch uses `(namespace, name)`, not `name` alone:

```ts
export type ToolSelector
    = | { namespace?: undefined, name: string }
        | { namespace: string, name: string }
```

## 2. Static built-in `function_call` names

These are the statically enumerable built-in function tools from `codex-main`.

### 2.1 Plain names

```ts
export type PlainFunctionCallName
    = | 'exec_command'
        | 'write_stdin'
        | 'shell_command'
        | 'request_permissions'
        | 'update_plan'
        | 'request_user_input'
        | 'view_image'
        | 'list_mcp_resources'
        | 'list_mcp_resource_templates'
        | 'read_mcp_resource'
        | 'spawn_agent'
        | 'send_message'
        | 'followup_task'
        | 'wait_agent'
        | 'list_agents'
        | 'interrupt_agent'
        | 'spawn_agents_on_csv'
        | 'report_agent_job_result'
        | 'get_context_remaining'
        | 'sleep'
        | 'new_context'
        | 'list_available_plugins_to_install'
        | 'request_plugin_install'
        | 'wait'
        | 'test_sync_tool'
```

### 2.2 Namespaced names

`multi_agent_v1` is a namespace, so these are still `type: "function_call"`, but must be identified with both `namespace` and `name`.

```ts
export type MultiAgentV1Namespace = 'multi_agent_v1'

export type MultiAgentV1FunctionCallName
    = | 'spawn_agent'
        | 'send_input'
        | 'resume_agent'
        | 'wait_agent'
        | 'close_agent'
```

### 2.3 Static selector union

```ts
export type StaticFunctionCallSelector
    = | { namespace?: undefined, name: 'exec_command' }
        | { namespace?: undefined, name: 'write_stdin' }
        | { namespace?: undefined, name: 'shell_command' }
        | { namespace?: undefined, name: 'request_permissions' }
        | { namespace?: undefined, name: 'update_plan' }
        | { namespace?: undefined, name: 'request_user_input' }
        | { namespace?: undefined, name: 'view_image' }
        | { namespace?: undefined, name: 'list_mcp_resources' }
        | { namespace?: undefined, name: 'list_mcp_resource_templates' }
        | { namespace?: undefined, name: 'read_mcp_resource' }
        | { namespace?: undefined, name: 'spawn_agent' }
        | { namespace?: undefined, name: 'send_message' }
        | { namespace?: undefined, name: 'followup_task' }
        | { namespace?: undefined, name: 'wait_agent' }
        | { namespace?: undefined, name: 'list_agents' }
        | { namespace?: undefined, name: 'interrupt_agent' }
        | { namespace?: undefined, name: 'spawn_agents_on_csv' }
        | { namespace?: undefined, name: 'report_agent_job_result' }
        | { namespace?: undefined, name: 'get_context_remaining' }
        | { namespace?: undefined, name: 'sleep' }
        | { namespace?: undefined, name: 'new_context' }
        | { namespace?: undefined, name: 'list_available_plugins_to_install' }
        | { namespace?: undefined, name: 'request_plugin_install' }
        | { namespace?: undefined, name: 'wait' }
        | { namespace?: undefined, name: 'test_sync_tool' }
        | { namespace: 'multi_agent_v1', name: 'spawn_agent' }
        | { namespace: 'multi_agent_v1', name: 'send_input' }
        | { namespace: 'multi_agent_v1', name: 'resume_agent' }
        | { namespace: 'multi_agent_v1', name: 'wait_agent' }
        | { namespace: 'multi_agent_v1', name: 'close_agent' }
```

## 3. Dynamic and open-ended names

These are also `type: "function_call"`, but they are not finitely enumerable from the repo alone.

### 3.1 MCP tools

MCP function-call names are generated at runtime from:

- `callable_namespace`
- `callable_name`

The canonical tool name is built in:

- `codex-main/codex-rs/codex-mcp/src/tools.rs`
- `ToolInfo::canonical_tool_name()`

So an MCP function call looks like:

```ts
export interface McpFunctionCallSelector {
    namespace: string // runtime MCP callable_namespace
    name: string // runtime MCP callable_name
}
```

Examples from tests/docs look like:

```ts
type ExampleMcpNames
    = | { namespace: 'mcp__calendar', name: 'create_event' }
        | { namespace: 'mcp__calendar', name: 'list_events' }
```

But those are examples only, not a complete set.

### 3.2 Dynamic tools

Dynamic tools come from `DynamicToolSpec` / `DynamicToolFunctionSpec` at runtime:

```ts
export type DynamicFunctionCallSelector
    = | { namespace?: undefined, name: string }
        | { namespace: string, name: string }
```

Runtime files:

- `codex-main/codex-rs/core/src/tools/handlers/dynamic.rs`

### 3.3 Extension / connector / plugin-provided tools

These may also surface as function tools, but the names depend on what is loaded in the current session. They are not a fixed built-in set.

## 4. Not `function_call`

These names may appear elsewhere in the system, but they are not `type: "function_call"`:

```ts
export type NonFunctionCallToolKinds
    = | 'apply_patch' // custom/freeform tool call
        | 'exec' // code-mode custom/freeform tool call
        | 'tool_search' // tool_search_call
        | 'web_search_call'
        | 'image_generation_call'
```

## 5. TS argument definitions

The following types are designed for `JSON.parse(item.arguments)`.

### 5.1 Shared helper types

```ts
export type SandboxPermissions
    = | 'use_default'
        | 'require_escalated'
        | 'with_additional_permissions'

export interface NetworkPermissions {
    enabled?: boolean
}

export type FileSystemAccessMode = 'read' | 'write' | 'deny' | 'none'

export type FileSystemSpecialPath
    = | { kind: 'root' }
        | { kind: 'minimal' }
        | { kind: 'project_roots', subpath?: string }
        | { kind: 'tmpdir' }
        | { kind: 'slash_tmp' }
        | { kind: 'unknown', path: string, subpath?: string }

export interface CanonicalFileSystemSandboxEntry {
    path: string | FileSystemSpecialPath
    access: FileSystemAccessMode
}

export interface LegacyFileSystemPermissions {
    read?: string[]
    write?: string[]
}

export interface CanonicalFileSystemPermissions {
    entries: CanonicalFileSystemSandboxEntry[]
    glob_scan_max_depth?: number
}

export type FileSystemPermissions
    = | LegacyFileSystemPermissions
        | CanonicalFileSystemPermissions

export interface AdditionalPermissionProfile {
    network?: NetworkPermissions
    file_system?: FileSystemPermissions
}

export interface RequestPermissionProfile {
    network?: NetworkPermissions
    file_system?: FileSystemPermissions
}

export type CollabInputItem
    = | { type: 'text', text: string }
        | { type: 'image', image_url: string }
        | { type: 'local_image', path: string }
        | { type: 'skill', path: string, name?: string }
        | { type: 'mention', path: string, name?: string }

export type StepStatus = 'pending' | 'in_progress' | 'completed'

export type ImageDetail = 'high' | 'original'
```

### 5.2 Shell / exec tools

```ts
export interface ExecCommandArgs {
    cmd: string
    workdir?: string
    tty?: boolean
    yield_time_ms?: number
    max_output_tokens?: number
    shell?: string // conditionally exposed
    login?: boolean // conditionally exposed
    environment_id?: string // conditionally exposed
    sandbox_permissions?: SandboxPermissions
    additional_permissions?: AdditionalPermissionProfile // conditionally exposed
    justification?: string
    prefix_rule?: string[]
}

export interface WriteStdinArgs {
    session_id: number
    chars?: string
    yield_time_ms?: number
    max_output_tokens?: number
}

export interface ShellCommandArgs {
    command: string
    workdir?: string
    timeout_ms?: number
    login?: boolean // conditionally exposed
    sandbox_permissions?: SandboxPermissions
    additional_permissions?: AdditionalPermissionProfile // conditionally exposed
    justification?: string
    prefix_rule?: string[]
}

export interface RequestPermissionsArgs {
    environment_id?: string
    reason?: string
    permissions: RequestPermissionProfile
}
```

### 5.3 Planning / user input / image tools

```ts
export interface UpdatePlanArgs {
    explanation?: string
    plan: Array<{
        step: string
        status: StepStatus
    }>
}

export interface RequestUserInputArgs {
    questions: Array<{
        id: string
        header: string
        question: string
        options: Array<{
            label: string
            description: string
        }>
    }>
    autoResolutionMs?: number
}

export interface ViewImageArgs {
    path: string
    detail?: ImageDetail
    environment_id?: string // conditionally exposed
}
```

### 5.4 MCP resource helper tools

```ts
export interface ListMcpResourcesArgs {
    server?: string
    cursor?: string
}

export interface ListMcpResourceTemplatesArgs {
    server?: string
    cursor?: string
}

export interface ReadMcpResourceArgs {
    server: string
    uri: string
}
```

### 5.5 Multi-agent v2 plain tools

```ts
export interface SpawnAgentArgsV2 {
    task_name: string
    message: string
    agent_type?: string
    model?: string
    reasoning_effort?: string
    service_tier?: string
    fork_turns?: 'none' | 'all' | string // positive integer string is also accepted
    fork_context?: boolean // parsed but rejected in v2
}

export interface SendMessageArgsV2 {
    target: string
    message: string
}

export interface FollowupTaskArgsV2 {
    target: string
    message: string
}

export interface WaitAgentArgsV2 {
    timeout_ms?: number
}

export interface ListAgentsArgsV2 {
    path_prefix?: string
}

export interface InterruptAgentArgsV2 {
    target: string
}
```

### 5.6 Multi-agent v1 namespaced tools

```ts
export interface SpawnAgentArgsV1 {
    message?: string
    items?: CollabInputItem[]
    agent_type?: string
    model?: string
    reasoning_effort?: string
    service_tier?: string
    fork_context?: boolean
}

export interface SendInputArgsV1 {
    target: string
    message?: string
    items?: CollabInputItem[]
    interrupt?: boolean
}

export interface ResumeAgentArgsV1 {
    id: string
}

export interface WaitAgentArgsV1 {
    targets?: string[]
    timeout_ms?: number
}

export interface CloseAgentArgsV1 {
    target: string
}
```

### 5.7 Agent job tools

```ts
export interface SpawnAgentsOnCsvArgs {
    csv_path: string
    instruction: string
    id_column?: string
    output_csv_path?: string
    output_schema?: Record<string, unknown>
    max_concurrency?: number
    max_workers?: number
    max_runtime_seconds?: number
}

export interface ReportAgentJobResultArgs {
    job_id: string
    item_id: string
    result: Record<string, unknown>
    stop?: boolean
}
```

### 5.8 Utility tools

```ts
export interface GetContextRemainingArgs {}

export interface SleepArgs {
    duration_ms: number
}

export interface NewContextArgs {}

export interface ListAvailablePluginsToInstallArgs {}

export interface RequestPluginInstallArgs {
    tool_type: 'connector' | 'plugin'
    action_type: 'install'
    tool_id: string
    suggest_reason: string
}

export interface CodeModeWaitArgs {
    cell_id: string
    yield_time_ms?: number
    max_tokens?: number
    terminate?: boolean
}

export interface TestSyncToolArgs {
    sleep_before_ms?: number
    sleep_after_ms?: number
    barrier?: {
        id: string
        participants: number
        timeout_ms?: number
    }
}
```

## 6. Typed map from selector to parsed `arguments`

```ts
export interface PlainFunctionCallArgumentMap {
    exec_command: ExecCommandArgs
    write_stdin: WriteStdinArgs
    shell_command: ShellCommandArgs
    request_permissions: RequestPermissionsArgs
    update_plan: UpdatePlanArgs
    request_user_input: RequestUserInputArgs
    view_image: ViewImageArgs
    list_mcp_resources: ListMcpResourcesArgs
    list_mcp_resource_templates: ListMcpResourceTemplatesArgs
    read_mcp_resource: ReadMcpResourceArgs
    spawn_agent: SpawnAgentArgsV2
    send_message: SendMessageArgsV2
    followup_task: FollowupTaskArgsV2
    wait_agent: WaitAgentArgsV2
    list_agents: ListAgentsArgsV2
    interrupt_agent: InterruptAgentArgsV2
    spawn_agents_on_csv: SpawnAgentsOnCsvArgs
    report_agent_job_result: ReportAgentJobResultArgs
    get_context_remaining: GetContextRemainingArgs
    sleep: SleepArgs
    new_context: NewContextArgs
    list_available_plugins_to_install: ListAvailablePluginsToInstallArgs
    request_plugin_install: RequestPluginInstallArgs
    wait: CodeModeWaitArgs
    test_sync_tool: TestSyncToolArgs
}

export interface NamespacedFunctionCallArgumentMap {
    multi_agent_v1: {
        spawn_agent: SpawnAgentArgsV1
        send_input: SendInputArgsV1
        resume_agent: ResumeAgentArgsV1
        wait_agent: WaitAgentArgsV1
        close_agent: CloseAgentArgsV1
    }
}
```

## 7. Source file map for each `name`

| selector | model-visible schema file | runtime parse / handler file |
|---|---|---|
| `exec_command` | `codex-main/codex-rs/core/src/tools/handlers/shell_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/unified_exec.rs` |
| `write_stdin` | `codex-main/codex-rs/core/src/tools/handlers/shell_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/unified_exec/write_stdin.rs` |
| `shell_command` | `codex-main/codex-rs/core/src/tools/handlers/shell_spec.rs` | `codex-main/codex-rs/protocol/src/models.rs` and shell handlers |
| `request_permissions` | `codex-main/codex-rs/core/src/tools/handlers/shell_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/request_permissions.rs` and `codex-main/codex-rs/protocol/src/request_permissions.rs` |
| `update_plan` | `codex-main/codex-rs/core/src/tools/handlers/plan_spec.rs` | `codex-main/codex-rs/protocol/src/plan_tool.rs` |
| `request_user_input` | `codex-main/codex-rs/core/src/tools/handlers/request_user_input_spec.rs` | `codex-main/codex-rs/protocol/src/request_user_input.rs` |
| `view_image` | `codex-main/codex-rs/core/src/tools/handlers/view_image_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/view_image.rs` |
| `list_mcp_resources` | `codex-main/codex-rs/core/src/tools/handlers/mcp_resource_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/mcp_resource.rs` |
| `list_mcp_resource_templates` | `codex-main/codex-rs/core/src/tools/handlers/mcp_resource_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/mcp_resource.rs` |
| `read_mcp_resource` | `codex-main/codex-rs/core/src/tools/handlers/mcp_resource_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/mcp_resource.rs` |
| plain `spawn_agent` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_v2/spawn.rs` |
| `send_message` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_v2/message_tool.rs` |
| `followup_task` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_v2/message_tool.rs` |
| plain `wait_agent` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_v2/wait.rs` |
| `list_agents` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_v2/list_agents.rs` |
| `interrupt_agent` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_v2/interrupt_agent.rs` |
| `multi_agent_v1/spawn_agent` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents/spawn.rs` |
| `multi_agent_v1/send_input` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents/send_input.rs` |
| `multi_agent_v1/resume_agent` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents/resume_agent.rs` |
| `multi_agent_v1/wait_agent` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents/wait.rs` |
| `multi_agent_v1/close_agent` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/multi_agents/close_agent.rs` |
| `spawn_agents_on_csv` | `codex-main/codex-rs/core/src/tools/handlers/agent_jobs_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/agent_jobs.rs` |
| `report_agent_job_result` | `codex-main/codex-rs/core/src/tools/handlers/agent_jobs_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/agent_jobs.rs` |
| `get_context_remaining` | `codex-main/codex-rs/core/src/tools/handlers/get_context_remaining_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/get_context_remaining.rs` |
| `sleep` | `codex-main/codex-rs/core/src/tools/handlers/sleep.rs` | `codex-main/codex-rs/core/src/tools/handlers/sleep.rs` |
| `new_context` | `codex-main/codex-rs/core/src/tools/handlers/new_context_window_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/new_context_window.rs` |
| `list_available_plugins_to_install` | `codex-main/codex-rs/core/src/tools/handlers/list_available_plugins_to_install_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/list_available_plugins_to_install.rs` |
| `request_plugin_install` | `codex-main/codex-rs/core/src/tools/handlers/request_plugin_install_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/request_plugin_install.rs` |
| `wait` | `codex-main/codex-rs/core/src/tools/code_mode/wait_spec.rs` | `codex-main/codex-rs/core/src/tools/code_mode/wait_handler.rs` |
| `test_sync_tool` | `codex-main/codex-rs/core/src/tools/handlers/test_sync_spec.rs` | `codex-main/codex-rs/core/src/tools/handlers/test_sync.rs` |
| runtime MCP tools | MCP server-provided input schema | `codex-main/codex-rs/core/src/tools/handlers/mcp.rs` |
| runtime dynamic tools | dynamic JSON schema from `DynamicToolSpec` | `codex-main/codex-rs/core/src/tools/handlers/dynamic.rs` |

## 8. Practical parsing rule for rollout analysis

When you read one line from `rollout-*.jsonl`:

1. Check `item.type === "response_item"`.
2. Check the embedded response item is `type === "function_call"`.
3. Read both `namespace` and `name`.
4. Parse `arguments` with `JSON.parse(arguments)`.
5. Choose the TS type by selector:
   - no namespace + `name === "shell_command"` -> `ShellCommandArgs`
   - `namespace === "multi_agent_v1"` + `name === "wait_agent"` -> `WaitAgentArgsV1`
   - runtime MCP / dynamic tools -> schema depends on the runtime tool declaration, not this static file alone

That is the main reason `name` by itself is not enough.
