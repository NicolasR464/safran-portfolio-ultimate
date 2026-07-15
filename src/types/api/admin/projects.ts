import { z } from 'zod'

import { ProjectSchema } from '@/types/project/schema'
import { ProjectCategorySchema } from '@/types/projectCategory/schema'
import { ProjectTableRowType } from '@/utils/enums/admin'
import { ImageMetadata } from '@/types/project'

const ProjectsCategoryResponse = z.object({
    category: ProjectCategorySchema,
    projects: ProjectSchema.array(),
})
export type ProjectsCategoryResponse = z.infer<typeof ProjectsCategoryResponse>

export const ProjectsListResponse = ProjectsCategoryResponse.array()
export type ProjectsListResponse = z.infer<typeof ProjectsListResponse>

export type CRUDResult = { success: boolean; message: string }

export const CreateProjectPayload = z.object({
    title: z.string().trim().min(1),
    description: z.string(),
    order: z.number().int().min(1),
    categoryId: z.string().min(1),
    images: ImageMetadata.array(),
    videoUrl: z.string().optional(),
})

export type CreateProjectPayload = z.infer<typeof CreateProjectPayload>

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
            videoUrl: z.string().optional(),
        }),
    }),
])
export type UpdateProjectsPayload = z.infer<typeof UpdateProjectsPayload>

export const DeleteRowPayload = z.object({
    _id: z.string().min(1),
    type: ProjectTableRowType,
})

export type DeleteRowPayload = z.infer<typeof DeleteRowPayload>
