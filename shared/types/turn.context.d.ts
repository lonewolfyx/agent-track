export interface CodexGranularApproval {
    sandbox_approval: boolean
    rules: boolean
    skill_approval: boolean
    request_permissions: boolean
    mcp_elicitations: boolean
}

export type CodexApprovalPolicy
    = | 'untrusted'
        | 'on-failure'
        | 'on-request'
        | 'never'
        | {
            granular: CodexGranularApproval
        }

export type CodexNetworkAccess = 'restricted' | 'enabled'

export type CodexSandboxPolicy
    = | { type: 'danger-full-access' }
        | {
            type: 'read-only'
            network_access?: boolean
        }
        | {
            type: 'external-sandbox'
            network_access: CodexNetworkAccess
        }
        | {
            type: 'workspace-write'
            writable_roots?: string[]
            network_access?: boolean
            exclude_tmpdir_env_var?: boolean
            exclude_slash_tmp?: boolean
        }

export type CodexPersonality = 'none' | 'friendly' | 'pragmatic' | string
export type CodexModeKind = 'default' | 'plan' | string
export type CodexReasoningSummary = 'auto' | 'concise' | 'detailed' | 'none' | string
export type CodexReasoningEffort = string
export type CodexMultiAgentVersion = 'disabled' | 'v1' | 'v2' | string

export interface CodexCollaborationMode {
    mode: CodexModeKind
    settings: {
        model: string
        reasoning_effort: CodexReasoningEffort | null
        developer_instructions: string | null
    }
}

export type CodexFileSystemPath
    = | {
        type: 'path'
        path: string
    }
    | {
        type: 'glob_pattern'
        pattern: string
    }
    | {
        type: 'special'
        value: string
    }

export interface CodexFileSystemSandboxEntry {
    path: CodexFileSystemPath
    access: 'read' | 'write' | 'deny' | string
}

export interface CodexFileSystemSandboxPolicy {
    kind: string
    glob_scan_max_depth?: number | null
    entries: CodexFileSystemSandboxEntry[]
}

export type CodexPermissionProfile
    = | {
        type: 'managed'
        file_system: Record<string, unknown>
        network: string
    }
    | {
        type: 'disabled'
    }
    | {
        type: 'external'
        network: string
    }

export interface CodexTurnContextNetworkItem {
    allowed_domains: string[]
    denied_domains: string[]
}

export interface CodexTurnContextPayload {
    turn_id?: string
    cwd: string
    workspace_roots?: string[]
    current_date?: string
    timezone?: string
    approval_policy: CodexApprovalPolicy
    sandbox_policy: CodexSandboxPolicy
    permission_profile?: CodexPermissionProfile
    network?: CodexTurnContextNetworkItem
    file_system_sandbox_policy?: CodexFileSystemSandboxPolicy
    model: string
    comp_hash?: string
    personality?: CodexPersonality
    collaboration_mode?: CodexCollaborationMode
    multi_agent_version?: CodexMultiAgentVersion
    realtime_active?: boolean
    effort?: CodexReasoningEffort
    summary: CodexReasoningSummary
}
