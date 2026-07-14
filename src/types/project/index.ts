import { z } from 'zod'

export const VideoPlayerType = z.enum(['youtube', 'vimeo'])
export type VideoPlayerType = z.infer<typeof VideoPlayerType>

export const VideoMetadata = z.object({
    url: z.url(),
    videoId: z.string().min(1),
    player: VideoPlayerType,
    isPublicRated: z.boolean().optional(),
    isEmbeddable: z.boolean().optional(),
})

export const ImageCategory = z.enum([
    'background',
    'carousel',
    'poster',
    'thumbnail',
])
export type ImageCategory = z.infer<typeof ImageCategory>

export const ImageMetadata = z.object({
    url: z.url(),
    imageId: z.string().min(1),
    types: z.array(ImageCategory.default(ImageCategory.enum.thumbnail)),
})
export type ImageMetadata = z.infer<typeof ImageMetadata>

export const ProjectCategory = z.object({
    name: z.string().min(1),
    order: z.number().int().nonnegative(),
})
export type ProjectCategory = z.infer<typeof ProjectCategory>
