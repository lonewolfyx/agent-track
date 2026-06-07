import type { WorkspaceTrackNodeData } from '@/lib/workspace-track'

export function useWorkspaceTrack() {
    const expandedReasoning = shallowRef<WorkspaceTrackNodeData | null>(null)

    const isDetailOpen = computed({
        get: () => expandedReasoning.value !== null,
        set: (value: boolean) => {
            if (!value) {
                expandedReasoning.value = null
            }
        },
    })

    function openReasoningDetail(data: WorkspaceTrackNodeData) {
        expandedReasoning.value = data
    }

    function closeReasoningDetail() {
        expandedReasoning.value = null
    }

    return {
        expandedReasoning,
        isDetailOpen,
        openReasoningDetail,
        closeReasoningDetail,
    }
}
