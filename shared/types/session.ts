export interface CodexSessionListItem {
    id: string
    title: string
    model: {
        model: string
        effort: number
    }[]
    cwd: string
    filename: string
    prompt: number
    call: number
    createTime: string
}
