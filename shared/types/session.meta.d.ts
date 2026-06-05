export interface CodexGitInfo {
    commit_hash: string
    branch: string
    repository_url?: string
}

export interface CodexDynamicToolParameter {
    type: string
    properties?: Record<string, unknown>
    required?: string[]
    [key: string]: unknown
}

export interface CodexDynamicTool {
    name: string
    description: string
    inputSchema: CodexDynamicToolParameter
    deferLoading?: boolean
}

export interface CodexSessionMetaPayload {
    id: string
    timestamp: string
    cwd: string
    originator: string
    cli_version: string
    source: string
    model_provider: string
    base_instructions: {
        text: string
    }
    git?: CodexGitInfo
    dynamic_tools?: CodexDynamicTool[]
    memory_mode?: string
    thread_source?: string
}
