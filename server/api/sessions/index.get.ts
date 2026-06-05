import type { CodexSession } from '#shared/types/codex'
import type { CodexSessionListItem, CodexSessionMonthGroup } from '#shared/types/session'
import { basename, resolve } from 'node:path'
import { glob } from 'glob'
import { readJsonlLines } from '#server/utils/codex'

function getSessionMonthLabel(createTime: string) {
    const matchedDate = createTime.match(/^(\d{4})-(\d{1,2})/)

    if (matchedDate) {
        return `${matchedDate[1]}-${Number(matchedDate[2])}`
    }

    const date = new Date(createTime)

    if (Number.isNaN(date.getTime())) {
        return '未知时间'
    }

    return `${date.getFullYear()}-${date.getMonth() + 1}`
}

export default defineEventHandler(async () => {
    const config = useRuntimeConfig()
    const basePath = config.codexSessionsPath as string

    const files = await glob('**/*.jsonl', {
        absolute: true,
        cwd: basePath,
    })

    const sessions = await Promise.all(files.map(async (filePath): Promise<CodexSessionListItem> => {
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

    return sessions.reduce<CodexSessionMonthGroup[]>((groups, session) => {
        const label = getSessionMonthLabel(session.createTime)
        const previousGroup = groups.at(-1)

        if (!previousGroup || previousGroup.label !== label) {
            groups.push({
                label,
                children: [session],
            })

            return groups
        }

        previousGroup.children.push(session)
        return groups
    }, [])
})
