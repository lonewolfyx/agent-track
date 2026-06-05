export interface CodexGranularApproval {
    sandbox_approval: boolean
    rules: boolean
    skill_approval: boolean
    request_permissions: boolean
    mcp_elicitations: boolean
}

export interface CodexSandboxPolicy {
    type: string
    writable_roots?: string[]
    network_access?: boolean
    exclude_tmpdir_env_var?: boolean
    exclude_slash_tmp?: boolean
}

export interface CodexCollaborationMode {
    mode: string
    settings: {
        model: string
        reasoning_effort: 'high' | 'medium' | string
        developer_instructions?: string
    }
}

export interface EntriesType {
    path: {
        type: string
        path: string
        value?: Record<string, string>
    }
    access: string
}

export interface CodexTurnContextPayload {
    turn_id: string
    cwd: string
    current_date: string
    timezone: string
    approval_policy: 'on-request' | {
        granular: CodexGranularApproval
    }
    sandbox_policy: CodexSandboxPolicy
    model: string
    personality: string
    collaboration_mode: CodexCollaborationMode
    realtime_active: boolean
    summary: string
    effort?: string
    developer_instructions?: string
    truncation_policy?: {
        mode: string
        limit: number
    }
    file_system_sandbox_policy?: {
        kind: string
        entries: EntriesType[]
    }
    permission_profile?: {
        type: string
        file_system: {
            type: string
            entries: EntriesType[]
        }
        network: string
    }
    workspace_roots?: string[]
}
