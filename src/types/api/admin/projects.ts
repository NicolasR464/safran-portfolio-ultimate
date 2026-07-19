import { z } from 'zod'

import { ImageMetadata } from '@/types/project'
import { ProjectSchema } from '@/types/project/schema'
import { ProjectCategorySchema } from '@/types/projectCategory/schema'
import { ProjectTableRowType } from '@/utils/enums/admin'

const ProjectsCategoryResponse = z.object({
    category: ProjectCategorySchema,
    projects: ProjectSchema.array(),
})

export type ProjectsCategoryResponse = z.infer<typeof ProjectsCategoryResponse>

export const ProjectsListResponse = ProjectsCategoryResponse.array()

export type ProjectsListResponse = z.infer<typeof ProjectsListResponse>

export type CRUDResult = {
    success: boolean
    message: string
}

const CreateProjectPayload = z.object({
    title: z.string().trim().min(1),
    description: z.string(),
    order: z.number().int().min(1),
    categoryId: z.string().min(1),
    images: ImageMetadata.array(),
    videoUrl: z.string().optional(),
})

const CreateCategoryPayload = z.object({
    name: z.string().trim().min(1),
    order: z.number().int().min(1),
})

type CreateCategoryPayload = z.infer<typeof CreateCategoryPayload>

export const CreateProjectOrCategoryPayload = z.discriminatedUnion('type', [
    z.object({
        type: z.literal(ProjectTableRowType.enum.project),
        project: CreateProjectPayload,
    }),
    z.object({
        type: z.literal(ProjectTableRowType.enum.category),
        category: CreateCategoryPayload,
    }),
])

export type CreateProjectOrCategoryPayload = z.infer<
    typeof CreateProjectOrCategoryPayload
>

export const UpdateProjectsPayload = z.discriminatedUnion('type', [
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
