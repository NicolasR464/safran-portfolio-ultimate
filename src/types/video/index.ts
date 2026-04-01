import { z } from 'zod'

export const VideoPlayer = z.enum(['youtube', 'vimeo', 'cloudinary'])

export type VideoPlayer = z.infer<typeof VideoPlayer>

export const ImageMetadata = z.object({
    url: z.url(),
    public_id: z.string().min(1),
})

export type ImageMetadata = z.infer<typeof ImageMetadata>

export const ScreenSize = z.enum(['16:9', '4:5', '1:1'])

export type ScreenSize = z.infer<typeof ScreenSize>
