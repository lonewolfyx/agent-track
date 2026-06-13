import type { CodexEventMsgPayload } from '#shared/types/event.msg'
import type { CodexResponseItemPayload } from '#shared/types/response.item'
import type { CodexSessionMetaPayload } from '#shared/types/session.meta'
import type { CodexTurnContextPayload } from '#shared/types/turn.context'
import type { ValueOf } from '#shared/types/utils'

export interface CodexCompactedPayload {
    message: string
}

// https://github.com/openai/codex/blob/main/codex-rs/protocol/src/protocol.rs#L2910
export interface CodexSessionTypeMap {
    session_meta: CodexSessionMetaPayload
    event_msg: CodexEventMsgPayload
    response_item: CodexResponseItemPayload
    turn_context: CodexTurnContextPayload
    compacted: CodexCompactedPayload
}

type CodexSessionPayloadVariantType = {
    [Type in keyof CodexSessionTypeMap]:
    ValueOf<CodexSessionTypeMap[Type]> extends { type: string }
        ? Type
        : never
}[keyof CodexSessionTypeMap]

type CodexSessionPayloadKey<Type extends keyof CodexSessionTypeMap>
    = Type extends CodexSessionPayloadVariantType
        ? keyof CodexSessionTypeMap[Type]
        : never

export type CodexSessionPayload<
    Type extends keyof CodexSessionTypeMap,
    SessionPayload extends CodexSessionPayloadKey<Type> | undefined = undefined,
> = SessionPayload extends CodexSessionPayloadKey<Type>
    ? CodexSessionTypeMap[Type][SessionPayload]
    : Type extends CodexSessionPayloadVariantType
        ? ValueOf<CodexSessionTypeMap[Type]>
        : CodexSessionTypeMap[Type]

export interface CodexSession<
    Type extends keyof CodexSessionTypeMap,
    SessionPayload extends CodexSessionPayloadKey<Type> | undefined = undefined,
> {
    timestamp: string
    type: Type
    payload: CodexSessionPayload<Type, SessionPayload>
}

export type CodexSessionItem = {
    [Type in keyof CodexSessionTypeMap]: Simplify<{
        timestamp: string
        type: Type
        payload: CodexSessionPayload<Type>
    }>
}[keyof CodexSessionTypeMap]
