import { z } from 'zod'
import { ImageMetadata, VideoPlayer } from './index'

const objectId = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Expected a 24-char hex Mongo ObjectId')

export const VideoSchema = z.object({
    _id: objectId,
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
