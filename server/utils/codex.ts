import type { CodexSession, CodexSessionItem } from '#shared/types/codex'
import { access, readFile } from 'node:fs/promises'

export async function readJsonlLines(filePath: string): Promise<CodexSessionItem[]> {
    const content = await readFile(filePath, 'utf-8')

    return content.split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line.trim())) as CodexSessionItem[]
}

export async function fileExists(filePath: string): Promise<boolean> {
    try {
        await access(filePath)
        return true
    }
    catch {
        return false
    }
}

export function parseSessionMetrics(lines: CodexSessionItem[]) {
    const response_item = lines.filter(line => line.type === 'response_item')
    const prompt = response_item.filter(line =>
        line.payload.type === 'message'
        && line.payload.phase === 'final_answer',
    ).length

    const call = response_item.filter(line =>
        line.payload.type === 'function_call' || line.payload.type === 'custom_tool_call',
    ).length

    const token = lines.filter(line => line.type === 'event_msg' && line.payload.type === 'token_count').at(-1) as CodexSession<'event_msg', 'token_count'>

    const skills = response_item.filter((line: CodexSession<'response_item', 'function_call'>) =>
        line.payload.type === 'function_call'
        && line.payload.name === 'exec_command'
        && /skills\/.*\/SKILL\.md/.test(line.payload.arguments),
    ).filter(Boolean)

    return {
        prompt,
        call,
        skills: skills.length,
        token: token?.payload?.info?.total_token_usage ?? {},
    }
}
