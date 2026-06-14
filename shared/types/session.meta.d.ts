export interface CodexGitInfo {
    commit_hash?: string | null
    branch?: string | null
    repository_url?: string | null
}

export interface CodexDynamicToolSpec {
    namespace?: string | null
    name: string
    description: string
    input_schema: Record<string, unknown>
    defer_loading: boolean
}

export interface CodexSessionMetaPayload {
    id: string
    forked_from_id?: string | null
    parent_thread_id?: string | null
    timestamp: string
    cwd: string
    originator: string
    cli_version: string
    source: string | Record<string, unknown>
    thread_source?: string | null
    agent_nickname?: string | null
    agent_role?: string | null
    agent_path?: string | null
    model_provider?: string | null
    base_instructions?: {
        text: string
    } | null
    dynamic_tools?: CodexDynamicToolSpec[] | null
    memory_mode?: string | null
    multi_agent_version?: string | null
    git?: CodexGitInfo | null
}
