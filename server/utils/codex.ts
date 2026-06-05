import type { CodexSessionItem } from '#shared/types/codex'
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

    return {
        prompt,
        call,
    }
}
