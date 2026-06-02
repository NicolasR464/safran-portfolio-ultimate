import { z } from 'zod'

import { ProjectSchema } from '@/types/project/schema'
import { ProjectCategorySchema } from '@/types/projectCategory/schema'

const ProjectsCategoryResponse = z.object({
    category: ProjectCategorySchema,
    projects: ProjectSchema.array(),
})

export const ProjectsListResponse = ProjectsCategoryResponse.array()

export type ProjectsCategoryResponse = z.infer<typeof ProjectsCategoryResponse>

export type ProjectsListResponse = z.infer<typeof ProjectsListResponse>
