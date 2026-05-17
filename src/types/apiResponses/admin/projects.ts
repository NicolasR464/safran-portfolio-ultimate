import { z } from 'zod'

import { ProjectSchema } from '@/types/project/schema'
import { ProjectCategory } from '@/types/project'

const ProjectsCategoryResponse = z.object({
    category: ProjectCategory,
    projects: ProjectSchema.array(),
})

export const ProjectsListResponse = ProjectsCategoryResponse.array()

export type ProjectsCategoryResponse = z.infer<typeof ProjectsCategoryResponse>

export type ProjectsListResponse = z.infer<typeof ProjectsListResponse>
