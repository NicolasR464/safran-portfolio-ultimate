import { z } from 'zod'

export const ScreenTypeSchema = z.enum(['phone', 'tablet', 'computer'])
export type ScreenType = z.infer<typeof ScreenTypeSchema>

export const VideoHomeResponseSchema = z.object({
    _id: z.string(),
    videoUrl: z.url(),
    videoId: z.string().min(1),
    screenTypes: ScreenTypeSchema.array(),
})
export type VideoHomeResponse = z.infer<typeof VideoHomeResponseSchema>

export const VideosHomeListResponseSchema = VideoHomeResponseSchema.array()
export type VideosHomeListResponse = z.infer<
    typeof VideosHomeListResponseSchema
>

export const CreateVideoHomePayloadSchema = z.object({
    videoUrl: z.url(),
    videoId: z.string(),
    screenTypes: ScreenTypeSchema.array().min(1),
})

export const UpdateVideoHomePayloadSchema = CreateVideoHomePayloadSchema.extend(
    {
        _id: z.string(),
    },
)

export const DeleteVideoHomePayloadSchema = z.object({
    _id: z.string(),
})
