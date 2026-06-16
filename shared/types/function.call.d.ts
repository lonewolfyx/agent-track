// https://github.com/openai/codex/blob/022f1221e8af678c2c16f58aa09550545954d939/codex-rs/rollout-trace/src/tool_dispatch.rs#L261
export type CodexToolCallName
    = | 'exec_command' // -> ExecCommandArgs
        | 'local_shell'
        | 'shell'
        | 'shell_command' // -> ShellCommandArgs
        | 'write_stdin' // -> WriteStdinArgs
        | 'apply_patch'
        | 'web_search'
        | 'web_search_preview'
        | 'image_generation'
        | 'image_query'
        | 'spawn_agent' // -> SpawnAgentArgsV2
        | 'send_message' // -> SendMessageArgsV2
        | 'followup_task' // -> FollowupTaskArgsV2
        | 'assign_task'
        | 'wait_agent' // -> WaitAgentArgsV2
        | 'close_agent'
        | 'interrupt_agent' // -> InterruptAgentArgsV2
        | 'other'
        | 'request_permissions' // -> RequestPermissionsArgs
        | 'update_plan' // -> UpdatePlanArgs
        | 'request_user_input' // -> RequestUserInputArgs
        | 'view_image' // -> ViewImageArgs
        | 'list_mcp_resources' // -> ListMcpResourcesArgs
        | 'list_mcp_resource_templates' // -> ListMcpResourceTemplatesArgs
        | 'read_mcp_resource' // -> ReadMcpResourceArgs
        | 'list_agents' // -> ListAgentsArgsV2
        | 'spawn_agents_on_csv' // -> SpawnAgentsOnCsvArgs
        | 'report_agent_job_result' // -> ReportAgentJobResultArgs
        | 'get_context_remaining' // -> GetContextRemainingArgs
        | 'sleep' // -> SleepArgs
        | 'new_context' // -> NewContextArgs
        | 'list_available_plugins_to_install' // -> ListAvailablePluginsToInstallArgs
        | 'request_plugin_install' // -> RequestPluginInstallArgs
        | 'wait' // -> CodeModeWaitArgs
        | 'test_sync_tool' // -> TestSyncToolArgs

export interface CodexResponseFunctionCall {
    type: 'function_call'
    name: CodexToolCallName
    arguments: string
    call_id: string
    namespace?: string
}

export type SandboxPermissions
    = | 'use_default'
        | 'require_escalated'
        | 'with_additional_permissions'

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

export interface NetworkPermissions {
    enabled?: boolean
}

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

export type StepStatus = 'pending' | 'in_progress' | 'completed'

export type ImageDetail = 'high' | 'original'

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

export interface UpdatePlanArgs {
    explanation?: string
    plan: {
        step: string
        status: StepStatus
    }[]
}

export interface RequestUserInputArgs {
    questions: {
        id: string
        header: string
        question: string
        options: {
            label: string
            description: string
        }[]
    }[]
    autoResolutionMs?: number
}

export interface ViewImageArgs {
    path: string
    detail?: ImageDetail
    environment_id?: string // conditionally exposed
}

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
