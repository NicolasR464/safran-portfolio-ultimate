import { ObjectId } from 'mongodb'
import { z } from 'zod'

import { ImageMetadata, VideoMetadata } from './index'

export const ProjectSchema = z.object({
    _id: z.instanceof(ObjectId),
    title: z.string().min(1),
    description: z.string().optional(),
    video: VideoMetadata.optional(),
    categoryId: z.instanceof(ObjectId),
    images: ImageMetadata.array(),
    order: z.number().int().nonnegative(),
})

export type ProjectSchema = z.infer<typeof ProjectSchema>
