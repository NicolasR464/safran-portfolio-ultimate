import { z } from 'zod'
import { ImageMetadata, VideoPlayer } from './index'
import { ObjectId } from 'mongodb'

export const VideoSchema = z.object({
    _id: z.instanceof(ObjectId),
    title: z.string().min(1),
    vidId: z.string().min(1),
    player: VideoPlayer,
    category: z.string().min(1),
    image: ImageMetadata,
    order: z.number().int().nonnegative(),
    isPublicRated: z.boolean(),
    isEmbeddable: z.boolean(),
})

export type VideoSchema = z.infer<typeof VideoSchema>
