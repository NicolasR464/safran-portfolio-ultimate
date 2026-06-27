import { z } from 'zod'

import { ProjectSchema } from '@/types/project/schema'
import { ProjectCategorySchema } from '@/types/projectCategory/schema'
import { ProjectTableRowType } from '@/utils/enums'
import { ImageMetadata } from '@/types/project'

const ProjectsCategoryResponse = z.object({
    category: ProjectCategorySchema,
    projects: ProjectSchema.array(),
})
export type ProjectsCategoryResponse = z.infer<typeof ProjectsCategoryResponse>

export const ProjectsListResponse = ProjectsCategoryResponse.array()
export type ProjectsListResponse = z.infer<typeof ProjectsListResponse>

export type ActionResult = { success: boolean; message: string }

export const UpdateProjectsPayload = z.union([
    z.object({
        type: z.literal(ProjectTableRowType.enum.category),
        categories: ProjectCategorySchema.extend({
            _id: z.string().min(1),
            name: ProjectCategorySchema.shape.name.optional(),
        }).array(),
    }),
    z.object({
        type: z.literal(ProjectTableRowType.enum.project),
        categoryInitialId: z.string().min(1),
        orderInitial: z.number(),
        /** Updated project's data */
        project: ProjectSchema.extend({
            _id: z.string().min(1),
            categoryId: z.string().min(1),
            title: ProjectSchema.shape.title.optional(),
            images: ImageMetadata.array().optional(),
        }),
    }),
])
export type UpdateProjectsPayload = z.infer<typeof UpdateProjectsPayload>
