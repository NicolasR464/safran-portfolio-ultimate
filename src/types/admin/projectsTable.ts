import { ProjectTableRowType } from '@/utils/enums'

export type ProjectTreeItem = CategoryNode | ProjectNode

export type CategoryNode = {
    id: string
    kind: typeof ProjectTableRowType.enum.category
    name: string
    order: number
    children: ProjectNode[]
}

export type ProjectNode = {
    id: string
    kind: typeof ProjectTableRowType.enum.project
    title: string
    order: number
    children: []
}
