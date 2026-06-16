export interface CodexGitInfo {
    commit_hash?: string
    branch?: string
    repository_url?: string
}

export interface CodexDynamicToolSpec {
    namespace?: string
    name: string
    description: string
    input_schema: Record<string, unknown>
    defer_loading: boolean
}

export interface CodexSessionMetaPayload {
    id: string
    forked_from_id?: string
    parent_thread_id?: string
    timestamp: string
    cwd: string
    originator: string
    cli_version: string
    source: string | Record<string, unknown>
    thread_source?: string
    agent_nickname?: string
    agent_role?: string
    agent_path?: string
    model_provider?: string
    base_instructions?: {
        text: string
    }
    dynamic_tools?: CodexDynamicToolSpec[]
    memory_mode?: string
    multi_agent_version?: string
    git?: CodexGitInfo
}
