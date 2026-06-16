import type { CodexResponseFunctionCall, PlainFunctionCallArgumentMap } from '#shared/types/function.call'

export function resolveFunctionCallToolArguments(payload: CodexResponseFunctionCall) {
    const args = JSON.parse(payload.arguments)
    switch (payload.name) {
        case 'exec_command':
            return (args as PlainFunctionCallArgumentMap['exec_command']).cmd
        case 'shell_command':
            return (args as PlainFunctionCallArgumentMap['shell_command']).command
        default:
            return ''
    }
}
