import { ObjectId } from 'mongodb'
import { z } from 'zod'

import { ImageMetadata, ProjectCategory, VideoMetadata } from './index'

export const ProjectSchema = z.object({
    _id: z.instanceof(ObjectId),
    title: z.string().min(1),
    description: z.string().min(1).optional(),
    video: VideoMetadata.optional(),
    category: ProjectCategory,
    images: ImageMetadata.array(),
    order: z.number().int().nonnegative(),
})

export type ProjectSchema = z.infer<typeof ProjectSchema>
