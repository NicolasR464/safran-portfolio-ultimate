import { z } from 'zod'

export const VideoPlayerType = z.enum(['youtube', 'vimeo', 'cloudinary'])

export type VideoPlayerType = z.infer<typeof VideoPlayerType>

export const VideoMetadata = z.object({
    videoId: z.string().min(1),
    player: VideoPlayerType,
})

export const ImageCategory = z.enum(['carousel', 'thumbnail', 'background'])

export type ImageCategory = z.infer<typeof ImageCategory>

export const ImageMetadata = z.object({
    url: z.url(),
    public_id: z.string().min(1),
    type: ImageCategory,
})

export type ImageMetadata = z.infer<typeof ImageMetadata>

export const ScreenSize = z.enum(['16:9', '4:5', '1:1'])

export type ScreenSize = z.infer<typeof ScreenSize>
