import { z } from 'zod'

import { ProjectTableRowType } from '@/utils/enums/admin'
import { ProjectSchema } from '@/types/project/schema'

export const ProjectNode = ProjectSchema.extend({
    id: z.string(),
    kind: z.literal(ProjectTableRowType.enum.project),
    categoryId: z.string().min(1),
})
export type ProjectNode = z.infer<typeof ProjectNode>

export const CategoryNode = z.object({
    id: z.string(),
    kind: z.literal(ProjectTableRowType.enum.category),
    name: z.string(),
    order: z.number(),
    children: ProjectNode.array(),
})
export type CategoryNode = z.infer<typeof CategoryNode>

export type ProjectTreeItem = CategoryNode | ProjectNode
