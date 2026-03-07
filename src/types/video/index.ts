import { z } from 'zod'

export const VideoPlayer = z.enum(['youtube', 'vimeo'])

export type VideoPlayer = z.infer<typeof VideoPlayer>

export const ImageMetadata = z.object({
    url: z.url(),
    public_id: z.string().min(1),
})

export type ImageMetadata = z.infer<typeof ImageMetadata>
