import type { CodexSession } from '#shared/types/codex'
import { basename, resolve } from 'node:path'
import { glob } from 'glob'
import { readJsonlLines } from '#server/utils/codex'

export default defineEventHandler(async () => {
    const config = useRuntimeConfig()
    const basePath = config.codexSessionsPath as string

    const files = await glob('**/*.jsonl', {
        absolute: true,
        cwd: basePath,
    })

    const sessions = await Promise.all(files.map(async (filePath) => {
        const lines = await readJsonlLines(filePath)
        const sessionMeta = lines.filter(line => line.type === 'session_meta')[0]! as CodexSession<'session_meta'>
        const metaPayload = sessionMeta.payload

        const model = lines.filter(line => line.type === 'turn_context') as CodexSession<'turn_context'>[]

        const title = lines.filter(line => line.type === 'event_msg' && line.payload.type === 'user_message')[0]! as CodexSession<'event_msg', 'user_message'>

        const { prompt, call } = parseSessionMetrics(lines)

        return {
            id: metaPayload.id,
            title: title?.payload.message || '',
            model: [
                ...new Map(
                    model.map(m => [
                        m.payload.model,
                        {
                            model: m.payload.model,
                            effort: m.payload.effort,
                        },
                    ]),
                ).values(),
            ],
            prompt,
            call,
            createTime: metaPayload.timestamp,
            cwd: resolve(filePath),
            filename: basename(filePath),
        }
    }))

    sessions.sort((a, b) => b.createTime.localeCompare(a.createTime))

    return sessions
})
