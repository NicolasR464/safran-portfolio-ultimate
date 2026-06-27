import { CategoryNode, ProjectNode } from '@/types/admin/projectsTable'
import { ProjectTableRowType } from '../enums'

export const reorderRowsByOrder = <T extends CategoryNode | ProjectNode>(
    rows: T[],
    movedId: string,
    nextOrder: number,
): T[] => {
    console.log('🔥 reorderRowsByOrder')

    console.log({ rows })
    console.log({ movedId })
    console.log({ nextOrder })

    const current = [...rows]

    console.log({ current })

    const movedIndex = current.findIndex((row) => row.id === movedId)

    if (movedIndex === -1) {
        /* Then it is a project put in a new category */
        const newProject = current.find(
            (row) => row.kind === ProjectTableRowType.enum.project,
        )

        console.log('IN NEW PROJECT : ', newProject)

        if (!newProject) return current

        newProject.order = nextOrder

        return current
    }

    const [movedRow] = current.splice(movedIndex, 1)

    if (!movedRow) return current

    const targetIndex = Math.max(0, Math.min(nextOrder - 1, current.length))

    current.splice(targetIndex, 0, movedRow)

    return current
}
