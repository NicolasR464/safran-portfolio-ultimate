import { ObjectId } from 'mongodb'
import { z } from 'zod'

import { ImageMetadata, ScreenSize, VideoMetadata } from './index'

export const ProjectSchema = z.object({
    _id: z.instanceof(ObjectId),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    video: VideoMetadata.optional(),
    screenSize: ScreenSize,
    category: z.string().min(1),
    images: ImageMetadata.array().optional(),
    order: z.number().int().nonnegative().optional(),
    isPublicRated: z.boolean().optional(),
    isEmbeddable: z.boolean().optional(),
})

export type ProjectSchema = z.infer<typeof ProjectSchema>
