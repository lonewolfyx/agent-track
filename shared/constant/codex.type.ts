export const AGENT_MESSAGE = 'agent_message'
export const AGENT_REASONING = 'agent_reasoning'
export const FUNCTION_CALL = 'function_call'
export const CUSTOM_TOOL_CALL = 'custom_tool_call'
export const DYNAMIC_TOOL_CALL_REQUEST = 'dynamic_tool_call_request'
export const ERROR = 'error'
export const IMAGE_GENERATION_CALL = 'image_generation_call'
export const LOCAL_SHELL_CALL = 'local_shell_call'
export const MCP_TOOL_CALL = 'mcp_tool_call'
export const QUESTION = 'question'
export const ANSWER = 'answer'
export const REASONING = 'reasoning'
export const TOKEN_COUNT = 'token_count'
export const TOOL_SEARCH_CALL = 'tool_search_call'
export const TURN_ABORTED = 'turn_aborted'
export const WEB_SEARCH_CALL = 'web_search_call'
export const USER_MESSAGE = 'user_message'

export const THINKING_TIMELINE_TYPES = [
    AGENT_MESSAGE,
    AGENT_REASONING,
    CUSTOM_TOOL_CALL,
    DYNAMIC_TOOL_CALL_REQUEST,
    ERROR,
    FUNCTION_CALL,
    IMAGE_GENERATION_CALL,
    LOCAL_SHELL_CALL,
    MCP_TOOL_CALL,
    REASONING,
    TOKEN_COUNT,
    TOOL_SEARCH_CALL,
    TURN_ABORTED,
    USER_MESSAGE,
    WEB_SEARCH_CALL,
] as const

export type ThinkingTimelineType = typeof THINKING_TIMELINE_TYPES[number]

export const THINKING_CALL_TYPES = [
    FUNCTION_CALL,
    CUSTOM_TOOL_CALL,
    TOOL_SEARCH_CALL,
    WEB_SEARCH_CALL,
    MCP_TOOL_CALL,
    DYNAMIC_TOOL_CALL_REQUEST,
    IMAGE_GENERATION_CALL,
    LOCAL_SHELL_CALL,
] as const

export type ThinkingCallType = typeof THINKING_CALL_TYPES[number]

export const THINKING_DETAIL_TYPES = [
    ...THINKING_TIMELINE_TYPES,
    QUESTION,
    ANSWER,
] as const

export type ThinkingDetailType = typeof THINKING_DETAIL_TYPES[number]
