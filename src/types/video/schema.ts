import { ObjectId } from 'mongodb'
import { z } from 'zod'

import { ImageMetadata, ScreenSize, VideoPlayer } from './index'

export const VideoSchema = z.object({
    _id: z.instanceof(ObjectId),
    title: z.string().min(1).optional(),
    vidId: z.string().min(1),
    player: VideoPlayer,
    screenSize: ScreenSize,
    category: z.string().min(1),
    image: ImageMetadata.optional(),
    order: z.number().int().nonnegative().optional(),
    isPublicRated: z.boolean().optional(),
    isEmbeddable: z.boolean().optional(),
})

export type VideoSchema = z.infer<typeof VideoSchema>
