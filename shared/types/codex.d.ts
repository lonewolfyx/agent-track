import type { CodexEventMsgPayload } from '#shared/types/event.msg'
import type { CodexResponseItemPayload } from '#shared/types/response.item'
import type { CodexSessionMetaPayload } from '#shared/types/session.meta'
import type { CodexTurnContextPayload } from '#shared/types/turn.context'

export interface CodexCompactedPayload {
    message: string
}

export interface CodexSessionTypeMap {
    session_meta: CodexSessionMetaPayload
    event_msg: CodexEventMsgPayload
    response_item: CodexResponseItemPayload
    turn_context: CodexTurnContextPayload
    compacted: CodexCompactedPayload
}

export interface CodexSession<
    Type extends keyof CodexSessionTypeMap,
    SessionPayload extends CodexSessionTypeMap[Type] | undefined = undefined,
> {
    timestamp: string
    type: Type
    payload: SessionPayload extends keyof CodexSessionTypeMap[Type]
        ? CodexSessionTypeMap[Type][SessionPayload]
        : ValueOf<CodexSessionTypeMap[Type]>
}
