import { z } from 'zod'

export const VideoPlayerType = z.enum(['youtube', 'vimeo', 'cloudinary'])
export type VideoPlayerType = z.infer<typeof VideoPlayerType>

export const ScreenSize = z.enum(['16:9', '4:5', '1:1'])
export type ScreenSize = z.infer<typeof ScreenSize>

export const VideoMetadata = z.object({
    videoId: z.string().min(1),
    player: VideoPlayerType,
    isPublicRated: z.boolean().optional(),
    isEmbeddable: z.boolean().optional(),
    screenSize: ScreenSize,
})

export const ImageCategory = z.enum(['carousel', 'thumbnail', 'background'])
export type ImageCategory = z.infer<typeof ImageCategory>

export const ImageMetadata = z.object({
    url: z.url(),
    imageId: z.string().min(1),
    type: ImageCategory.default(ImageCategory.enum.thumbnail),
})
export type ImageMetadata = z.infer<typeof ImageMetadata>
