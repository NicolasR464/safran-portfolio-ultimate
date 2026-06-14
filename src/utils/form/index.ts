import { CategoryNode, ProjectNode } from '@/types/admin/projectsTable'

export const reorderRowsByOrder = <T extends CategoryNode | ProjectNode>(
    rows: T[],
    movedId: string,
    nextOrder: number,
): T[] => {
    const current = [...rows]

    const movedIndex = current.findIndex((row) => row.id === movedId)

    if (movedIndex === -1) return current

    const [movedRow] = current.splice(movedIndex, 1)

    if (!movedRow) return current

    const targetIndex = Math.max(0, Math.min(nextOrder - 1, current.length))

    current.splice(targetIndex, 0, movedRow)

    return current
}
