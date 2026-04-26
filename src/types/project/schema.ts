import { ObjectId } from 'mongodb'
import { z } from 'zod'

import { ImageMetadata, VideoMetadata } from './index'

export const ProjectSchema = z.object({
    _id: z.instanceof(ObjectId),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    video: VideoMetadata.optional(),
    category: z.string().min(1),
    images: ImageMetadata.array().optional(),
    order: z.number().int().nonnegative().optional(),
})

export type ProjectSchema = z.infer<typeof ProjectSchema>
